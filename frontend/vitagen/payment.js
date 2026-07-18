(function () {
  "use strict";

  const API_BASE_URL = "https://motivation-backend-production-2800.up.railway.app";
  const script = document.currentScript;
  const documentType = script?.dataset.documentType || "";
  const storageKey = script?.dataset.storageKey || "";
  const filename = script?.dataset.filename || "VitaGen.pdf";
  const A4_WIDTH_MM = 210;
  const A4_HEIGHT_MM = 297;
  const TARGET_CANVAS_WIDTH_PX = 1800;
  const MIN_CANVAS_SCALE = 2;
  const MAX_CANVAS_SCALE = 3;
  const LOG_PREFIX = "[VitaGen Payment]";
  const PENDING_ACTION_KEY = "vitagen_pending_premium_action";
  let pdfExportInProgress = false;

  function createAccessId() {
    if (window.crypto?.randomUUID) {
      return window.crypto.randomUUID();
    }

    return `access_${Date.now().toString(36)}_${Math.random()
      .toString(36)
      .slice(2, 14)}`;
  }

  function readAccessState() {
    return window.VitaGenAccess?.readStoredAccess(documentType, localStorage) || {};
  }

  function writeAccessState(nextState) {
    return (
      window.VitaGenAccess?.writeStoredAccess(
        documentType,
        nextState,
        localStorage
      ) || nextState
    );
  }

  function getCurrentAccessState() {
    const stored = readAccessState();
    const builderState =
      typeof window.VitaGenGetAccessState === "function"
        ? window.VitaGenGetAccessState()
        : null;
    const state = {
      ...stored,
      ...(builderState || {}),
      accessId: stored.accessId || createAccessId(),
    };
    return writeAccessState(state);
  }

  function updatePaidAccess(sessionId) {
    const state = getCurrentAccessState();
    return writeAccessState({
      ...state,
      accessId: state.accessId,
      paymentStatus: "paid",
      paymentSessionId: sessionId,
    });
  }

  function clearPaidAccess() {
    const state = getCurrentAccessState();
    return writeAccessState({
      ...state,
      paymentStatus: "unpaid",
      paymentSessionId: "",
    });
  }

  function getPremiumAuthorization() {
    const state = getCurrentAccessState();
    return {
      sessionId: state.paymentSessionId || "",
      documentType,
      accessId: state.accessId,
    };
  }

  function setPendingPremiumAction(action = "download-pdf", reason = "") {
    const value = { action, reason };
    sessionStorage.setItem(PENDING_ACTION_KEY, JSON.stringify(value));
    return value;
  }

  function getPendingPremiumAction() {
    try {
      const value = JSON.parse(sessionStorage.getItem(PENDING_ACTION_KEY) || "{}");
      return value && typeof value === "object" ? value : {};
    } catch {
      return {};
    }
  }

  function clearPendingPremiumAction() {
    sessionStorage.removeItem(PENDING_ACTION_KEY);
  }

  function log(message, details) {
    if (details) {
      console.info(LOG_PREFIX, message, details);
      return;
    }

    console.info(LOG_PREFIX, message);
  }

  function warn(message, details) {
    if (details) {
      console.warn(LOG_PREFIX, message, details);
      return;
    }

    console.warn(LOG_PREFIX, message);
  }

  function errorLog(message, details) {
    if (details) {
      console.error(LOG_PREFIX, message, details);
      return;
    }

    console.error(LOG_PREFIX, message);
  }

  function loadDocumentData() {
    try {
      return JSON.parse(localStorage.getItem(storageKey) || "{}");
    } catch {
      return {};
    }
  }

  function hasMeaningfulText(value) {
    return typeof value === "string" && value.trim().length > 0;
  }

  function hasMeaningfulEntries(value) {
    return Array.isArray(value) && value.some((entry) =>
      entry &&
      typeof entry === "object" &&
      Object.values(entry).some(hasMeaningfulText)
    );
  }

  function hasMeaningfulDocumentData(documentData) {
    if (!documentData || typeof documentData !== "object") {
      return false;
    }

    const textFields = [
      "name",
      "adresse",
      "kontakt",
      "headline",
      "profil",
      "posten",
      "arbeitgeber",
      "funktion",
      "stichwoerter",
      "stichwoerter2",
      "stichwoerter3",
      "datum",
      "unterschrift",
      "foto",
    ];
    const entryFields = ["schulbildung", "beruf", "weiterbildung", "kenntnisse", "hobbys"];

    return (
      textFields.some((field) => hasMeaningfulText(documentData[field])) ||
      entryFields.some((field) => hasMeaningfulEntries(documentData[field]))
    );
  }

  function saveDocumentData(documentData) {
    if (!storageKey || !documentData || typeof documentData !== "object") {
      return;
    }

    if (!hasMeaningfulDocumentData(documentData)) {
      warn("ignored empty document data save", { documentType, storageKey });
      return;
    }

    const existingData = loadDocumentData();
    const mergedData = { ...existingData };

    Object.entries(documentData).forEach(([key, value]) => {
      if (
        hasMeaningfulText(value) ||
        hasMeaningfulEntries(value) ||
        typeof value === "boolean" ||
        (typeof value === "number" && Number.isFinite(value))
      ) {
        mergedData[key] = value;
      }
    });

    localStorage.setItem(storageKey, JSON.stringify(mergedData));
  }

  function getPendingCheckout() {
    try {
      const pending = JSON.parse(sessionStorage.getItem("vitagen_pending_checkout") || "{}");
      return pending && pending.documentType === documentType ? pending : {};
    } catch {
      return {};
    }
  }

  function savePendingCheckoutSnapshot(snapshot) {
    const smallSnapshot = {
      documentType: snapshot.documentType,
      styleName: snapshot.styleName,
      documentHash: snapshot.documentHash,
      checkoutAttemptId: snapshot.checkoutAttemptId,
      accessId: snapshot.accessId,
      premiumAction: snapshot.premiumAction,
    };

    try {
      sessionStorage.setItem("vitagen_pending_checkout", JSON.stringify(snapshot));
      return;
    } catch (error) {
      warn("full checkout snapshot could not be stored; falling back to compact snapshot", error?.message || error);
    }

    sessionStorage.setItem("vitagen_pending_checkout", JSON.stringify(smallSnapshot));
  }

  function restorePendingCheckoutSnapshot() {
    const pending = getPendingCheckout();
    if (!pending.documentHash || !pending.styleName) {
      return pending;
    }

    syncSelectedStyleToDom(pending.styleName);

    if (
      pending.documentData &&
      typeof pending.documentData === "object" &&
      hasMeaningfulDocumentData(pending.documentData)
    ) {
      saveDocumentData(pending.documentData);
      if (typeof window.VitaGenRenderPreview === "function") {
        window.VitaGenRenderPreview({ pulse: false });
      }
    }

    return pending;
  }

  function canonicalize(value) {
    if (Array.isArray(value)) {
      return value.map(canonicalize);
    }

    if (value && typeof value === "object") {
      return Object.keys(value)
        .sort()
        .reduce((result, key) => {
          if (value[key] !== undefined) {
            result[key] = canonicalize(value[key]);
          }
          return result;
        }, {});
    }

    return value ?? null;
  }

  async function createDocumentHash(styleName, documentData) {
    const payload = JSON.stringify(
      canonicalize({ documentType, styleName, documentData })
    );
    const bytes = new TextEncoder().encode(payload);
    const digest = await crypto.subtle.digest("SHA-256", bytes);

    return Array.from(new Uint8Array(digest))
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
  }

  function getStyleStorageKey() {
    return documentType === "lebenslauf"
      ? "vitagen_lebenslauf_style"
      : "vitagen_motivation_style";
  }

  function getTemplateStorageKey() {
    return documentType === "lebenslauf"
      ? "vitagen_lebenslauf_template"
      : "vitagen_motivation_template";
  }

  function normalizeStyleFile(value) {
    return String(value || "").trim().split(/[\\/]/).pop();
  }

  function getAvailableStyleNames() {
    return Array.from(document.querySelectorAll("[data-style]"))
      .map((element) => normalizeStyleFile(element.dataset.style))
      .filter((styleName) => styleName.endsWith(".css"));
  }

  function isKnownStyleName(styleName, availableStyles) {
    if (!styleName || !styleName.endsWith(".css")) {
      return false;
    }

    return availableStyles.length === 0 || availableStyles.includes(styleName) || /^[a-z0-9-]+\.css$/i.test(styleName);
  }

  function getThemeHrefStyleName() {
    const href = document.getElementById("theme-style")?.getAttribute("href") || "";
    return normalizeStyleFile(href);
  }

  function getPreviewStyleName() {
    return normalizeStyleFile(document.getElementById("preview")?.dataset.style);
  }

  function getPreviewTemplateId() {
    return String(document.getElementById("preview")?.dataset.template || "").trim();
  }

  function getStoredStyleName() {
    return normalizeStyleFile(localStorage.getItem(getStyleStorageKey()));
  }

  function getStoredTemplateId() {
    try {
      return String(localStorage.getItem(getTemplateStorageKey()) || "").trim();
    } catch {
      return "";
    }
  }

  function getPendingCheckoutStyleName() {
    return normalizeStyleFile(getPendingCheckout().styleName);
  }

  function syncSelectedStyleToDom(styleName) {
    const themeLink = document.getElementById("theme-style");
    const preview = document.getElementById("preview");

    if (themeLink) {
      themeLink.href = `styles/${styleName}`;
    }

    if (preview) {
      preview.dataset.style = styleName;
    }

    document.querySelectorAll("[data-style]").forEach((element) => {
      element.classList.toggle("active", element.dataset.style === styleName);
    });
  }

  function getSelectedStyleName() {
    const availableStyles = getAvailableStyleNames();
    const candidates = [
      getPendingCheckoutStyleName(),
      getStoredStyleName(),
      getPreviewStyleName(),
      getThemeHrefStyleName(),
      "swiss-line.css",
    ];
    const selectedStyle = candidates.find((styleName) =>
      isKnownStyleName(styleName, availableStyles)
    );

    syncSelectedStyleToDom(selectedStyle);
    log("selected style resolved", {
      selectedStyle,
      pendingStyle: getPendingCheckoutStyleName(),
      storedStyle: getStoredStyleName(),
      previewStyle: getPreviewStyleName(),
      hrefStyle: getThemeHrefStyleName(),
    });

    return selectedStyle;
  }

  function getReturnUrl() {
    const url = new URL(window.location.href);
    url.searchParams.delete("checkout");
    url.searchParams.delete("session_id");
    url.hash = "";
    return url.toString();
  }

  function createCheckoutAttemptId() {
    if (window.crypto?.randomUUID) {
      return window.crypto.randomUUID();
    }

    return `${Date.now().toString(36)}_${Math.random()
      .toString(36)
      .slice(2, 12)}`;
  }

  function setStatus(message, isError = false) {
    const status = document.getElementById("paymentStatus");
    if (!status) {
      warn("paymentStatus element not found", { message });
      return;
    }
    status.textContent = message || "";
    status.style.color = isError ? "#b91c1c" : "#475569";
  }

  function getLanguage() {
    try {
      return localStorage.getItem("vitagen_language") === "en" ? "en" : "de";
    } catch {
      return document.documentElement.lang === "en" ? "en" : "de";
    }
  }

  function getCompleteOrderLabels() {
    const labels = {
      de: {
        title: "Bestellung abgeschlossen",
        lead: "Ihre Zahlung war erfolgreich.",
        pending: "Ihre PDF wird automatisch heruntergeladen. Bitte warten Sie einen Moment.",
        ready: "Der automatische Download wurde gestartet. Falls nichts passiert ist, koennen Sie die PDF manuell herunterladen.",
        error: "Die Zahlung war erfolgreich, aber der automatische Download konnte nicht abgeschlossen werden.",
        button: "PDF manuell herunterladen",
        close: "Schliessen",
      },
      en: {
        title: "Order complete",
        lead: "Your payment was successful.",
        pending: "Your PDF will download automatically. Please wait a moment.",
        ready: "The automatic download has started. If nothing happened, you can download the PDF manually.",
        error: "Payment was successful, but the automatic download could not be completed.",
        button: "Download PDF manually",
        close: "Close",
      },
    };

    return labels[getLanguage()] || labels.de;
  }

  function getPdfExportLabels() {
    const labels = {
      de: {
        title: "PDF wird erstellt",
        lead: "Bitte lassen Sie dieses Fenster geoeffnet.",
        preparing: "Dokument und Bilder werden vorbereitet...",
        validating: "Download-Berechtigung wird geprueft...",
        rendering: (page, total) => `PDF-Seite ${page} von ${total} wird erstellt...`,
        saving: "PDF ist fertig und der Download wird gestartet...",
        ready: "Der PDF-Download wurde gestartet.",
        error: "Die PDF konnte nicht erstellt werden. Bitte versuchen Sie es erneut.",
        close: "Schliessen",
      },
      en: {
        title: "Creating PDF",
        lead: "Please keep this window open.",
        preparing: "Preparing the document and images...",
        validating: "Checking download access...",
        rendering: (page, total) => `Creating PDF page ${page} of ${total}...`,
        saving: "The PDF is ready and the download is starting...",
        ready: "The PDF download has started.",
        error: "The PDF could not be created. Please try again.",
        close: "Close",
      },
    };

    return labels[getLanguage()] || labels.de;
  }

  function ensureCompleteOrderStyles() {
    if (document.getElementById("vitagenCompleteOrderStyles")) {
      return;
    }

    const style = document.createElement("style");
    style.id = "vitagenCompleteOrderStyles";
    style.textContent = `
      .complete-order-modal {
        align-items: center;
        background: rgba(15, 23, 42, 0.56);
        backdrop-filter: blur(12px);
        display: none;
        inset: 0;
        justify-content: center;
        padding: 24px;
        position: fixed;
        z-index: 10000;
      }

      .complete-order-modal.open {
        display: flex;
      }

      .complete-order-dialog {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 28px;
        box-shadow: 0 30px 90px rgba(15, 23, 42, 0.28);
        color: #172033;
        max-width: 520px;
        padding: 28px;
        width: min(100%, 520px);
      }

      .complete-order-top {
        align-items: flex-start;
        display: flex;
        gap: 18px;
      }

      .complete-order-icon {
        align-items: center;
        background: linear-gradient(135deg, #6d5dfc, #2485ff);
        border-radius: 18px;
        box-shadow: 0 16px 32px rgba(67, 97, 238, 0.28);
        color: #ffffff;
        display: inline-flex;
        flex: 0 0 auto;
        font-size: 22px;
        font-weight: 900;
        height: 52px;
        justify-content: center;
        width: 52px;
      }

      .complete-order-dialog h2 {
        font-size: 28px;
        line-height: 1.12;
        margin: 0 0 8px;
      }

      .complete-order-dialog p {
        color: #64748b;
        font-size: 16px;
        line-height: 1.55;
        margin: 0;
      }

      .complete-order-status {
        align-items: center;
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 20px;
        display: flex;
        gap: 14px;
        margin-top: 22px;
        padding: 16px;
      }

      .complete-order-spinner {
        animation: completeOrderSpin 0.9s linear infinite;
        border: 3px solid #dbeafe;
        border-top-color: #2563eb;
        border-radius: 999px;
        flex: 0 0 auto;
        height: 28px;
        width: 28px;
      }

      .complete-order-modal.ready .complete-order-spinner,
      .complete-order-modal.error .complete-order-spinner {
        animation: none;
        background: #dcfce7;
        border-color: #bbf7d0;
        position: relative;
      }

      .complete-order-modal.error .complete-order-spinner {
        background: #fee2e2;
        border-color: #fecaca;
      }

      .complete-order-modal.ready .complete-order-spinner::after {
        color: #15803d;
        content: "✓";
        font-size: 16px;
        font-weight: 900;
        left: 50%;
        position: absolute;
        top: 50%;
        transform: translate(-50%, -50%);
      }

      .complete-order-modal.error .complete-order-spinner::after {
        color: #b91c1c;
        content: "!";
        font-size: 16px;
        font-weight: 900;
        left: 50%;
        position: absolute;
        top: 50%;
        transform: translate(-50%, -50%);
      }

      .complete-order-actions {
        display: grid;
        gap: 12px;
        margin-top: 24px;
      }

      .complete-order-download,
      .complete-order-close {
        border-radius: 999px;
        cursor: pointer;
        font-size: 15px;
        font-weight: 900;
        min-height: 52px;
        padding: 0 20px;
      }

      .complete-order-download {
        background: #1f2937;
        border: 0;
        color: #ffffff;
      }

      .complete-order-download:disabled {
        cursor: wait;
        opacity: 0.45;
      }

      .complete-order-close {
        background: #ffffff;
        border: 1px solid #dbe3ef;
        color: #1f2937;
      }

      @keyframes completeOrderSpin {
        to { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
  }

  function ensureCompleteOrderModal() {
    ensureCompleteOrderStyles();

    let modal = document.getElementById("completeOrderModal");
    if (modal) {
      return modal;
    }

    modal = document.createElement("div");
    modal.id = "completeOrderModal";
    modal.className = "complete-order-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.innerHTML = `
      <div class="complete-order-dialog">
        <div class="complete-order-top">
          <div class="complete-order-icon" aria-hidden="true">✓</div>
          <div>
            <h2 data-complete-order-title></h2>
            <p data-complete-order-lead></p>
          </div>
        </div>
        <div class="complete-order-status">
          <span class="complete-order-spinner" aria-hidden="true"></span>
          <p data-complete-order-message></p>
        </div>
        <div class="complete-order-actions">
          <button type="button" class="complete-order-download" data-complete-order-download disabled></button>
          <button type="button" class="complete-order-close" data-complete-order-close></button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    modal.querySelector("[data-complete-order-close]")?.addEventListener("click", () => {
      modal.classList.remove("open");
      modal.setAttribute("aria-hidden", "true");
    });

    modal.querySelector("[data-complete-order-download]")?.addEventListener("click", async () => {
      const button = modal.querySelector("[data-complete-order-download]");
      button.disabled = true;
      updateCompleteOrderModal("pending");
      try {
        await downloadCleanPreviewPdf();
        updateCompleteOrderModal("ready");
      } catch (error) {
        errorLog("Manual paid PDF download failed", error?.message || error);
        updateCompleteOrderModal("error");
        setStatus(error.message || "Payment was successful, but the PDF could not be downloaded.", true);
      }
    });

    return modal;
  }

  function updateCompleteOrderModal(state = "pending") {
    const labels = getCompleteOrderLabels();
    const modal = ensureCompleteOrderModal();
    modal.classList.remove("pending", "ready", "error");
    modal.classList.add(state);
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");

    const message = state === "ready" ? labels.ready : state === "error" ? labels.error : labels.pending;
    const downloadButton = modal.querySelector("[data-complete-order-download]");
    const closeButton = modal.querySelector("[data-complete-order-close]");
    modal.dataset.mode = "order";
    modal.querySelector("[data-complete-order-title]").textContent = labels.title;
    modal.querySelector("[data-complete-order-lead]").textContent = labels.lead;
    modal.querySelector("[data-complete-order-message]").textContent = message;
    closeButton.textContent = labels.close;
    closeButton.hidden = false;
    downloadButton.textContent = labels.button;
    downloadButton.hidden = false;
    downloadButton.disabled = state === "pending";
    window.setTimeout(() => downloadButton.focus(), 0);
  }

  function updatePdfExportModal(state = "pending", progress = {}) {
    const labels = getPdfExportLabels();
    const modal = ensureCompleteOrderModal();
    const downloadButton = modal.querySelector("[data-complete-order-download]");
    const closeButton = modal.querySelector("[data-complete-order-close]");
    let message = labels.preparing;

    if (state === "ready") {
      message = labels.ready;
    } else if (state === "error") {
      message = progress.message || labels.error;
    } else if (progress.phase === "validating") {
      message = labels.validating;
    } else if (progress.phase === "rendering") {
      message = labels.rendering(progress.page, progress.total);
    } else if (progress.phase === "saving") {
      message = labels.saving;
    }

    modal.dataset.mode = "pdf-export";
    modal.classList.remove("pending", "ready", "error");
    modal.classList.add(state);
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    modal.querySelector("[data-complete-order-title]").textContent = labels.title;
    modal.querySelector("[data-complete-order-lead]").textContent = labels.lead;
    modal.querySelector("[data-complete-order-message]").textContent = message;
    downloadButton.hidden = true;
    closeButton.textContent = labels.close;
    closeButton.hidden = state === "pending";

    if (state !== "pending") {
      window.setTimeout(() => closeButton.focus(), 0);
    }
  }

  function setPdfTriggerDisabled(disabled) {
    document
      .querySelectorAll("#buyBtn, [data-trigger-buy], [data-payment-trigger]")
      .forEach((button) => {
        if (disabled && !button.disabled) {
          button.dataset.pdfExportDisabled = "true";
          button.disabled = true;
        } else if (!disabled && button.dataset.pdfExportDisabled === "true") {
          button.disabled = false;
          delete button.dataset.pdfExportDisabled;
        }
      });
  }

  function waitForUiPaint() {
    return new Promise((resolve) => {
      if (typeof window.requestAnimationFrame !== "function") {
        window.setTimeout(resolve, 0);
        return;
      }

      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(resolve);
      });
    });
  }

  function getBuyerDetails(documentData) {
    return {
      buyerName: document.getElementById("buyerName")?.value || documentData.name || "",
      customerEmail: document.getElementById("buyerEmail")?.value || "",
    };
  }

  function getDeveloperDiscountToken() {
    return localStorage.getItem("vitagen_dev_discount_token")?.trim() || undefined;
  }

  function waitForPromise(promise, timeoutMs) {
    return new Promise((resolve, reject) => {
      const timer = window.setTimeout(resolve, timeoutMs);
      Promise.resolve(promise).then(
        (value) => {
          window.clearTimeout(timer);
          resolve(value);
        },
        (error) => {
          window.clearTimeout(timer);
          reject(error);
        }
      );
    });
  }

  async function waitForBuilderPhotoReady() {
    const ready = window.VitaGenPhotoReady;
    if (!ready || typeof ready.then !== "function") {
      return;
    }

    try {
      await waitForPromise(ready, 8000);
    } catch (error) {
      warn("builder photo readiness failed; continuing with current preview", error);
    }
  }

  async function waitForDocumentFonts() {
    if (!document.fonts?.ready) {
      return;
    }

    try {
      await waitForPromise(document.fonts.ready, 5000);
    } catch (error) {
      warn("document fonts did not finish loading before export", error);
    }
  }

  function openModal() {
    const modal = document.getElementById("buyModal");
    if (!modal) {
      errorLog("buyModal element not found");
      return;
    }

    modal.style.display = "flex";
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    log("payment modal opened", {
      path: window.location.pathname,
      documentType,
      storageKey,
    });
    window.setTimeout(() => document.getElementById("payBtn")?.focus(), 0);
  }

  function closeModal() {
    const modal = document.getElementById("buyModal");
    if (modal) {
      modal.style.display = "none";
      modal.classList.remove("open");
      modal.setAttribute("aria-hidden", "true");
    }
  }

  async function openPaymentFlow() {
    log("payment trigger received", {
      hasModal: Boolean(document.getElementById("buyModal")),
      hasPayButton: Boolean(document.getElementById("payBtn")),
      hasStoredData: Boolean(localStorage.getItem(storageKey)),
    });

    let currentDocumentData = null;
    if (typeof window.saveAllFields === "function") {
      currentDocumentData = window.saveAllFields();
    }
    const documentData =
      currentDocumentData && typeof currentDocumentData === "object"
        ? currentDocumentData
        : window.VitaGenCurrentDocumentData || loadDocumentData();
    const state = getCurrentAccessState();

    if (state.documentTier === "free") {
      await runPdfDownloadWithStatus({
        documentData,
        verifyFree: true,
      });
      return;
    }

    if (await verifyStoredPremiumAccess()) {
      await runPdfDownloadWithStatus({ documentData });
      return;
    }

    setPendingPremiumAction("download-pdf", "premium_document");
    const reasons =
      window.VitaGenAccess?.describeDocumentAccess(state, getLanguage())?.detail ||
      "";
    setStatus(
      reasons
        ? `Premium erforderlich: ${reasons}`
        : "Premium-Zugriff erforderlich."
    );
    openModal();
  }

  async function startCheckout() {
    let currentDocumentData = null;
    if (typeof window.saveAllFields === "function") {
      currentDocumentData = window.saveAllFields();
    }
    await waitForBuilderPhotoReady();

    const documentData =
      currentDocumentData && typeof currentDocumentData === "object"
        ? currentDocumentData
        : window.VitaGenCurrentDocumentData && typeof window.VitaGenCurrentDocumentData === "object"
          ? window.VitaGenCurrentDocumentData
          : loadDocumentData();
    const styleName = getSelectedStyleName();
    const documentHash = await createDocumentHash(styleName, documentData);
    const checkoutAttemptId = createCheckoutAttemptId();
    const accessState = getCurrentAccessState();
    const premiumAction = getPendingPremiumAction();

    log("starting Stripe Checkout session", {
      documentType,
      styleName,
      documentHashPrefix: documentHash.slice(0, 10),
      checkoutAttemptId,
      returnUrl: getReturnUrl(),
      developerDiscount: Boolean(getDeveloperDiscountToken()),
    });

    savePendingCheckoutSnapshot({
      documentType,
      styleName,
      documentHash,
      checkoutAttemptId,
      accessId: accessState.accessId,
      premiumAction,
      documentData,
    });

    const response = await fetch(`${API_BASE_URL}/checkout/create-session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        documentType,
        styleName,
        documentHash,
        checkoutAttemptId,
        accessId: accessState.accessId,
        returnUrl: getReturnUrl(),
        developerDiscountToken: getDeveloperDiscountToken(),
        ...getBuyerDetails(documentData),
      }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.url) {
      throw new Error(data.error || "Payment could not be started.");
    }

    window.location.href = data.url;
  }

  async function verifyPaidCheckoutSession(sessionId) {
    const pending = restorePendingCheckoutSnapshot();
    const accessState = getCurrentAccessState();
    const accessId = pending.accessId || accessState.accessId;

    const response = await fetch(`${API_BASE_URL}/checkout/verify-access`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId,
        documentType,
        accessId,
      }),
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || "Payment could not be verified.");
    }

    updatePaidAccess(sessionId);
    return data;
  }

  async function verifyStoredPremiumAccess() {
    const state = getCurrentAccessState();
    if (!state.paymentSessionId || state.paymentStatus !== "paid") {
      return false;
    }

    try {
      await verifyPaidCheckoutSession(state.paymentSessionId);
      return true;
    } catch (error) {
      clearPaidAccess();
      warn("stored premium access is no longer valid", error?.message || error);
      return false;
    }
  }

  async function verifyFreeDocument(documentData) {
    const accessState = getCurrentAccessState();
    const response = await fetch(`${API_BASE_URL}/document/verify-free`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        documentType,
        selectedTemplateId:
          accessState.selectedTemplateId || getPreviewTemplateId() || getStoredTemplateId(),
        styleName: getSelectedStyleName(),
        documentData,
      }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.allowed) {
      throw new Error(data.error || "This document requires Premium access.");
    }
    return data;
  }

  async function waitForPreviewImages(preview) {
    const images = Array.from(preview.querySelectorAll("img")).filter(
      (img) => {
        if (!img.getAttribute("src")) {
          return false;
        }

        const styles = window.getComputedStyle(img);
        return styles.display !== "none" && styles.visibility !== "hidden";
      }
    );

    await Promise.all(
      images.map((img) => {
        if (img.complete) {
          return Promise.resolve();
        }

        return new Promise((resolve) => {
          let timer;
          const finish = () => {
            window.clearTimeout(timer);
            img.removeEventListener("load", finish);
            img.removeEventListener("error", finish);
            resolve();
          };

          timer = window.setTimeout(finish, 5000);
          img.addEventListener("load", finish, { once: true });
          img.addEventListener("error", finish, { once: true });
          if (img.complete) {
            finish();
          }
        });
      })
    );
  }

  function clampByte(value) {
    if (!Number.isFinite(value)) {
      return 0;
    }

    return Math.max(0, Math.min(255, Math.round(value)));
  }

  function parseColorChannel(token) {
    const value = String(token || "").trim();
    if (!value || value === "none") {
      return 0;
    }

    if (value.endsWith("%")) {
      return (Number.parseFloat(value) / 100) * 255;
    }

    const parsed = Number.parseFloat(value);
    if (!Number.isFinite(parsed)) {
      return 0;
    }

    return parsed <= 1 ? parsed * 255 : parsed;
  }

  function parseAlphaChannel(token) {
    const value = String(token || "").trim();
    if (!value || value === "none") {
      return 1;
    }

    if (value.endsWith("%")) {
      return Math.max(0, Math.min(1, Number.parseFloat(value) / 100));
    }

    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? Math.max(0, Math.min(1, parsed)) : 1;
  }

  function replaceUnsupportedColorFunctions(value) {
    if (!value || !String(value).includes("color(")) {
      return value;
    }

    return String(value).replace(/color\(\s*([a-z0-9-]+)\s+([^)]*)\)/gi, (_match, _space, body) => {
      const [channelsText, alphaText] = String(body).split("/");
      const channels = channelsText.trim().split(/\s+/).filter(Boolean);
      if (channels.length < 3) {
        return "rgb(0, 0, 0)";
      }

      const red = clampByte(parseColorChannel(channels[0]));
      const green = clampByte(parseColorChannel(channels[1]));
      const blue = clampByte(parseColorChannel(channels[2]));
      const alpha = parseAlphaChannel(alphaText);

      return alpha < 1
        ? `rgba(${red}, ${green}, ${blue}, ${Number(alpha.toFixed(3))})`
        : `rgb(${red}, ${green}, ${blue})`;
    });
  }

  function sanitizeUnsupportedColorsForCanvas(root) {
    const colorProperties = [
      "color",
      "background-color",
      "background-image",
      "border-top-color",
      "border-right-color",
      "border-bottom-color",
      "border-left-color",
      "outline-color",
      "text-decoration-color",
      "box-shadow",
      "text-shadow",
      "fill",
      "stroke",
    ];
    const elements = [root, ...root.querySelectorAll("*")];

    elements.forEach((element) => {
      const styles = window.getComputedStyle(element);
      colorProperties.forEach((property) => {
        const currentValue = styles.getPropertyValue(property);
        const safeValue = replaceUnsupportedColorFunctions(currentValue);

        if (safeValue !== currentValue) {
          element.style.setProperty(property, safeValue, "important");
        }
      });
    });
  }

  function getCanvasScale(pageWidthPx) {
    return Math.min(
      MAX_CANVAS_SCALE,
      Math.max(MIN_CANVAS_SCALE, TARGET_CANVAS_WIDTH_PX / pageWidthPx)
    );
  }

  function getDocumentRendererType() {
    return documentType === "lebenslauf" ? "cv" : documentType;
  }

  function getSelectedTemplateId() {
    return getPreviewTemplateId() || getStoredTemplateId() || undefined;
  }

  async function waitForImageElement(image) {
    if (!image.getAttribute("src")) {
      return;
    }

    if (image.complete && image.naturalWidth > 0) {
      return;
    }

    await new Promise((resolve) => {
      image.addEventListener("load", resolve, { once: true });
      image.addEventListener("error", resolve, { once: true });
    });
  }

  function isTransparentColor(value) {
    return !value || value === "transparent" || /rgba?\([^)]*,\s*0\)/i.test(value);
  }

  async function rasterizeImageContain(image) {
    await waitForImageElement(image);

    if (!image.naturalWidth || !image.naturalHeight) {
      return;
    }

    const rect = image.getBoundingClientRect();
    const width = Math.max(1, Math.round(rect.width));
    const height = Math.max(1, Math.round(rect.height));

    if (!width || !height) {
      return;
    }

    const scale = Math.min(4, Math.max(2, window.devicePixelRatio || 2));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(width * scale));
    canvas.height = Math.max(1, Math.round(height * scale));

    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    const styles = window.getComputedStyle(image);
    if (!isTransparentColor(styles.backgroundColor)) {
      context.fillStyle = styles.backgroundColor;
      context.fillRect(0, 0, canvas.width, canvas.height);
    }

    const imageRatio = image.naturalWidth / image.naturalHeight;
    const boxRatio = canvas.width / canvas.height;
    let drawWidth = canvas.width;
    let drawHeight = drawWidth / imageRatio;

    if (drawHeight > canvas.height) {
      drawHeight = canvas.height;
      drawWidth = drawHeight * imageRatio;
    }

    const drawX = (canvas.width - drawWidth) / 2;
    const drawY = (canvas.height - drawHeight) / 2;
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.drawImage(image, drawX, drawY, drawWidth, drawHeight);

    image.src = canvas.toDataURL("image/png");
    image.style.objectFit = "fill";
    await image.decode?.().catch(() => {});
  }

  async function normalizeExportImages(root) {
    const images = Array.from(root.querySelectorAll("img"));

    images.forEach((image) => {
      image.style.objectFit = "contain";
      image.style.objectPosition = "center center";
      image.style.maxWidth = image.style.maxWidth || "100%";
      image.style.maxHeight = image.style.maxHeight || "100%";
    });

    await Promise.all(
      images.map((image) =>
        rasterizeImageContain(image).catch((error) => {
          warn("image could not be rasterized for PDF export", error?.message || error);
        })
      )
    );
  }

  function removeExportOnlyPreviewArtifacts(root) {
    root.querySelectorAll(".document-watermark, .watermark").forEach((element) => {
      element.remove();
    });
    root.querySelectorAll(".page-break").forEach((element) => {
      element.style.display = "none";
      element.style.breakBefore = "auto";
      element.style.pageBreakBefore = "auto";
    });
  }

  async function createPdfExportPreview(sourcePreview) {
    const host = document.createElement("div");
    host.className = "vitagen-pdf-export-host";
    Object.assign(host.style, {
      position: "fixed",
      left: "-10000px",
      top: "0",
      width: `${A4_WIDTH_MM}mm`,
      minHeight: `${A4_HEIGHT_MM}mm`,
      overflow: "visible",
      background: "#ffffff",
      pointerEvents: "none",
      zIndex: "-1",
    });

    const preview = sourcePreview.cloneNode(true);
    preview.id = "preview";
    preview.classList.add("pdf-export-preview");
    Object.entries(sourcePreview.dataset || {}).forEach(([key, value]) => {
      preview.dataset[key] = value;
    });
    Object.assign(preview.style, {
      width: `${A4_WIDTH_MM}mm`,
      maxWidth: "none",
      overflow: "visible",
      boxShadow: "none",
      border: "0",
      borderRadius: "0",
      transform: "none",
    });

    host.appendChild(preview);
    document.body.appendChild(host);
    removeExportOnlyPreviewArtifacts(preview);
    await normalizeExportImages(preview);

    const renderedPages = Array.from(preview.querySelectorAll(".document-page"));
    const legacyPages = Array.from(preview.querySelectorAll(".cv, .anschreiben"));
    const pageElements = renderedPages.length ? renderedPages : legacyPages.length ? legacyPages : [preview];
    pageElements.forEach((element) => {
      Object.assign(element.style, {
        width: `${A4_WIDTH_MM}mm`,
        height: `${A4_HEIGHT_MM}mm`,
        minHeight: `${A4_HEIGHT_MM}mm`,
        overflow: "hidden",
        boxShadow: "none",
        borderRadius: "0",
      });
    });
    sanitizeUnsupportedColorsForCanvas(preview);

    return { host, preview, pageElements };
  }

  async function fetchUnlockedAiPhoto() {
    const protectedAsset = await window.PhotoStorage?.getProtectedPhotoAsset?.();
    if (!protectedAsset) {
      const existing = await window.PhotoStorage?.getSelectedPhoto?.();
      if (existing instanceof Blob && existing.type.startsWith("image/")) {
        return existing;
      }
      throw new Error("Protected AI photo data could not be found.");
    }

    const response = await fetch(`${API_BASE_URL}/premium-assets/ai-photo`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        protectedAsset,
        ...getPremiumAuthorization(),
      }),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || "AI photo access could not be verified.");
    }
    return response.blob();
  }

  async function applyUnlockedAiPhoto(blob) {
    if (!(blob instanceof Blob) || !blob.type.startsWith("image/")) {
      throw new Error("The unlocked AI photo is invalid.");
    }

    await window.PhotoStorage?.saveSelectedPhoto?.(blob);
    const selectedImage = document.querySelector(
      ".generated-option.selected img, #foto-container.selected img"
    );
    if (selectedImage && window.PhotoStorage?.createPhotoUrl) {
      selectedImage.src = window.PhotoStorage.createPhotoUrl(blob);
      selectedImage.photoBlob = blob;
      selectedImage.aiGenerated = true;
      if (typeof window.selectImage === "function") {
        window.selectImage(selectedImage, { persist: false });
      }
      await selectedImage.decode?.().catch(() => {});
    }
    return blob;
  }

  async function unlockSelectedAiPhotoForExport() {
    const accessState = getCurrentAccessState();
    if (!accessState.aiPhotoUsed) {
      return null;
    }
    return applyUnlockedAiPhoto(await fetchUnlockedAiPhoto());
  }

  async function downloadAiPhoto({ skipAuthorizationCheck = false } = {}) {
    if (!skipAuthorizationCheck && !(await verifyStoredPremiumAccess())) {
      const message =
        getLanguage() === "en"
          ? "Unlock the Premium PDF from the PDF download button first."
          : "Bitte zuerst das Premium-PDF ueber den PDF-Download-Button freischalten.";
      setStatus(message, true);
      throw new Error(message);
    }

    const blob = await applyUnlockedAiPhoto(await fetchUnlockedAiPhoto());
    const extension =
      blob.type === "image/png" ? "png" : blob.type === "image/webp" ? "webp" : "jpg";
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = `VitaGen-AI-Foto.${extension}`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    return true;
  }

  async function downloadCleanPreviewPdf({ onProgress = () => {} } = {}) {
    const JsPdf = window.jspdf?.jsPDF;
    if (typeof window.html2canvas !== "function" || typeof JsPdf !== "function") {
      throw new Error("PDF export library could not be loaded.");
    }

    onProgress({ phase: "preparing" });
    if (typeof window.saveAllFields === "function") {
      window.saveAllFields();
    }
    const accessState = getCurrentAccessState();
    if (
      accessState.documentTier === "premium" &&
      !(await verifyStoredPremiumAccess())
    ) {
      throw new Error("Premium access must be verified before downloading.");
    }
    await unlockSelectedAiPhotoForExport();
    if (typeof window.VitaGenRenderPreview === "function") {
      window.VitaGenRenderPreview({ pulse: false });
    }

    const preview = document.getElementById("preview");
    if (!preview) {
      throw new Error("Preview document could not be found.");
    }

    await waitForBuilderPhotoReady();
    await waitForDocumentFonts();
    await waitForPreviewImages(preview);

    const exportPreview = await createPdfExportPreview(preview);

    try {
      if (exportPreview.pageElements.length === 0) {
        throw new Error("No printable document page was found.");
      }

      await waitForPreviewImages(exportPreview.preview);

      const pdf = new JsPdf({
        unit: "mm",
        format: "a4",
        orientation: "portrait",
        compress: true,
      });
      const pdfPageWidth = pdf.internal.pageSize.getWidth();
      const pdfPageHeight = pdf.internal.pageSize.getHeight();
      let isFirstPage = true;
      const totalPages = exportPreview.pageElements.length;

      for (const [pageIndex, pageElement] of exportPreview.pageElements.entries()) {
        onProgress({
          phase: "rendering",
          page: pageIndex + 1,
          total: totalPages,
        });
        await waitForUiPaint();
        const pageRect = pageElement.getBoundingClientRect();
        const canvasScale = getCanvasScale(pageRect.width);
        const canvas = await window.html2canvas(pageElement, {
          scale: canvasScale,
          width: Math.ceil(pageRect.width),
          height: Math.ceil(pageRect.height),
          useCORS: true,
          allowTaint: false,
          backgroundColor: "#ffffff",
          scrollX: 0,
          scrollY: 0,
          windowWidth: Math.ceil(pageRect.width),
          windowHeight: Math.ceil(pageRect.height),
        });

        if (!isFirstPage) {
          pdf.addPage("a4", "portrait");
        }

        const imageData = canvas.toDataURL("image/jpeg", 0.94);
        pdf.addImage(imageData, "JPEG", 0, 0, pdfPageWidth, pdfPageHeight);
        canvas.width = 1;
        canvas.height = 1;
        isFirstPage = false;
      }

      onProgress({ phase: "saving" });
      await waitForUiPaint();
      pdf.save(filename);
    } finally {
      exportPreview.host.remove();
    }
  }

  async function runPdfDownloadWithStatus({
    documentData,
    verifyFree = false,
  } = {}) {
    if (pdfExportInProgress) {
      updatePdfExportModal("pending", { phase: "preparing" });
      return false;
    }

    pdfExportInProgress = true;
    setPdfTriggerDisabled(true);
    updatePdfExportModal("pending", { phase: "preparing" });
    await waitForUiPaint();

    try {
      if (verifyFree) {
        updatePdfExportModal("pending", { phase: "validating" });
        await verifyFreeDocument(documentData);
      }

      await downloadCleanPreviewPdf({
        onProgress: (progress) => updatePdfExportModal("pending", progress),
      });
      updatePdfExportModal("ready");
      setStatus(
        verifyFree
          ? "Kostenlose PDF wurde heruntergeladen."
          : "PDF download started."
      );
      return true;
    } catch (error) {
      errorLog("PDF download failed", error?.message || error);
      updatePdfExportModal("error", {
        message: error.message || undefined,
      });
      setStatus(error.message || "Die PDF konnte nicht erstellt werden.", true);
      return false;
    } finally {
      pdfExportInProgress = false;
      setPdfTriggerDisabled(false);
    }
  }

  async function handleCheckoutReturn() {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");
    const pendingAction = getPendingPremiumAction();

    if (params.get("checkout") === "cancel") {
      setStatus("Payment was cancelled. You can try again when ready.");
      openModal();
      return;
    }

    if (params.get("checkout") !== "success" || !sessionId) {
      return;
    }

    try {
      if (!pendingAction.action || pendingAction.action === "download-pdf") {
        updateCompleteOrderModal("pending");
      }
      setStatus("Payment confirmed. Premium access is being verified...");
      const data = await verifyPaidCheckoutSession(sessionId);
      log("Stripe Checkout return verified", {
        paymentStatus: data.paymentStatus,
        documentType: data.documentType,
        accessId: data.accessId,
      });

      if (data.paymentStatus !== "paid") {
        setStatus(
          "Payment is still pending. The PDF download will be available after Stripe confirms the payment."
        );
        openModal();
        return;
      }

      if (pendingAction.action === "generate-text") {
        setStatus("Payment confirmed. AI text can now be generated directly.");
        document.getElementById("generateTextBtn")?.click();
      } else if (pendingAction.action === "download-ai-photo") {
        await downloadAiPhoto({ skipAuthorizationCheck: true });
        setStatus("AI photo download started.");
      } else {
        await downloadCleanPreviewPdf();
        updateCompleteOrderModal("ready");
        setStatus("PDF download started.");
      }

      sessionStorage.removeItem("vitagen_pending_checkout");
      clearPendingPremiumAction();
      const url = new URL(window.location.href);
      url.searchParams.delete("checkout");
      url.searchParams.delete("session_id");
      window.history.replaceState({}, "", url.toString());
    } catch (error) {
      errorLog("Paid PDF download failed", error?.message || error);
      if (!pendingAction.action || pendingAction.action === "download-pdf") {
        updateCompleteOrderModal("error");
      }
      setStatus(error.message || "Payment was successful, but the PDF could not be downloaded.", true);
    }
  }

  function replaceButton(id) {
    const original = document.getElementById(id);
    if (!original) {
      return null;
    }
    const replacement = original.cloneNode(true);
    original.replaceWith(replacement);
    return replacement;
  }

  function installStripePaymentUi() {
    const buyBtn = replaceButton("buyBtn");
    const payBtn = replaceButton("payBtn");
    const cancelBtn = replaceButton("cancelPaymentBtn");

    log("installing payment UI", {
      hasBuyButton: Boolean(buyBtn),
      hasPayButton: Boolean(payBtn),
      hasCancelButton: Boolean(cancelBtn),
      triggerCount: document.querySelectorAll("[data-trigger-buy], [data-payment-trigger]").length,
      scriptSrc: script?.getAttribute("src") || "",
    });

    if (buyBtn) {
      buyBtn.addEventListener("click", openPaymentFlow);
    }

    document.addEventListener("click", (event) => {
      const trigger = event.target?.closest?.("[data-trigger-buy], [data-payment-trigger]");
      if (!trigger) {
        return;
      }
      if (event.defaultPrevented) {
        return;
      }

      event.preventDefault();
      log("delegated payment trigger clicked", {
        text: trigger.textContent.trim(),
        id: trigger.id || null,
        classes: trigger.className || null,
      });
      openPaymentFlow();
    });

    if (cancelBtn) {
      cancelBtn.addEventListener("click", closeModal);
    }

    document.getElementById("buyModal")?.addEventListener("click", (event) => {
      if (event.target?.id === "buyModal") {
        closeModal();
      }
    });

    if (!payBtn) {
      errorLog("payBtn element not found; Stripe Checkout cannot start");
      return;
    }

    payBtn.addEventListener("click", async () => {
      payBtn.disabled = true;
      const originalText = payBtn.textContent;
      payBtn.textContent = "Weiterleitung zu Stripe...";
      setStatus("Weiterleitung zu sicherem Stripe Checkout...");

      try {
        await startCheckout();
      } catch (error) {
        errorLog("Stripe checkout failed", error?.message || error);
        setStatus(error.message || "Payment could not be started.", true);
        payBtn.disabled = false;
        payBtn.textContent = originalText;
      }
    });
  }

  window.VitaGenPayment = {
    open: openPaymentFlow,
    close: closeModal,
    downloadAiPhoto,
    getPremiumAuthorization,
  };

  function initializePayment() {
    log("script loaded", {
      path: window.location.pathname,
      documentType,
      storageKey,
      scriptSrc: script?.getAttribute("src") || "",
    });

    installStripePaymentUi();
    handleCheckoutReturn();
  }

  if (document.readyState === "loading") {
    window.addEventListener("DOMContentLoaded", initializePayment, { once: true });
  } else {
    initializePayment();
  }
})();
