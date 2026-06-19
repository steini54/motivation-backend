(function () {
  "use strict";

  const API_BASE_URL = "https://motivation-backend-production-2800.up.railway.app";
  const script = document.currentScript;
  const documentType = script?.dataset.documentType || "";
  const storageKey = script?.dataset.storageKey || "";
  const filename = script?.dataset.filename || "VitaGen.pdf";
  const A4_WIDTH_MM = 210;
  const A4_HEIGHT_MM = 297;
  const TARGET_CANVAS_WIDTH_PX = 2480;
  const MIN_CANVAS_SCALE = 3;
  const MAX_CANVAS_SCALE = 5;
  const LOG_PREFIX = "[VitaGen Payment]";

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

    return availableStyles.length === 0 || availableStyles.includes(styleName);
  }

  function getThemeHrefStyleName() {
    const href = document.getElementById("theme-style")?.getAttribute("href") || "";
    return normalizeStyleFile(href);
  }

  function getPreviewStyleName() {
    return normalizeStyleFile(document.getElementById("preview")?.dataset.style);
  }

  function getStoredStyleName() {
    return normalizeStyleFile(localStorage.getItem(getStyleStorageKey()));
  }

  function getPendingCheckoutStyleName() {
    try {
      const pending = JSON.parse(sessionStorage.getItem("vitagen_pending_checkout") || "{}");
      if (pending.documentType !== documentType) {
        return "";
      }

      return normalizeStyleFile(pending.styleName);
    } catch {
      return "";
    }
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

  function getBuyerDetails(documentData) {
    return {
      buyerName: document.getElementById("buyerName")?.value || documentData.name || "",
      customerEmail: document.getElementById("buyerEmail")?.value || "",
    };
  }

  async function waitForBuilderPhotoReady() {
    const ready = window.VitaGenPhotoReady;
    if (!ready || typeof ready.then !== "function") {
      return;
    }

    try {
      await ready;
    } catch (error) {
      warn("builder photo readiness failed; continuing with current preview", error);
    }
  }

  async function waitForDocumentFonts() {
    if (!document.fonts?.ready) {
      return;
    }

    try {
      await document.fonts.ready;
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

  function openPaymentFlow() {
    log("payment trigger received", {
      hasModal: Boolean(document.getElementById("buyModal")),
      hasPayButton: Boolean(document.getElementById("payBtn")),
      hasStoredData: Boolean(localStorage.getItem(storageKey)),
    });
    setStatus("");
    openModal();
  }

  async function startCheckout() {
    if (typeof window.saveAllFields === "function") {
      window.saveAllFields();
    }
    await waitForBuilderPhotoReady();

    const documentData = loadDocumentData();
    const styleName = getSelectedStyleName();
    const documentHash = await createDocumentHash(styleName, documentData);
    const checkoutAttemptId = createCheckoutAttemptId();

    log("starting Stripe Checkout session", {
      documentType,
      styleName,
      documentHashPrefix: documentHash.slice(0, 10),
      checkoutAttemptId,
      returnUrl: getReturnUrl(),
    });

    sessionStorage.setItem(
      "vitagen_pending_checkout",
      JSON.stringify({ documentType, styleName, documentHash, checkoutAttemptId })
    );

    const response = await fetch(`${API_BASE_URL}/checkout/create-session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        documentType,
        styleName,
        documentHash,
        checkoutAttemptId,
        returnUrl: getReturnUrl(),
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
    const documentData = loadDocumentData();
    const styleName = getSelectedStyleName();
    const documentHash = await createDocumentHash(styleName, documentData);

    const response = await fetch(`${API_BASE_URL}/checkout/verify-session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId,
        documentType,
        styleName,
        documentHash,
      }),
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || "Payment could not be verified.");
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
        if (img.complete && img.naturalWidth > 0) {
          return Promise.resolve();
        }

        return new Promise((resolve) => {
          img.addEventListener("load", resolve, { once: true });
          img.addEventListener("error", resolve, { once: true });
        });
      })
    );
  }

  function getCanvasScale(pageWidthPx) {
    return Math.min(
      MAX_CANVAS_SCALE,
      Math.max(MIN_CANVAS_SCALE, TARGET_CANVAS_WIDTH_PX / pageWidthPx)
    );
  }

  function createPdfExportPreview(sourcePreview) {
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
    preview.id = "preview-pdf-export";
    preview.classList.add("pdf-export-preview");
    Object.assign(preview.style, {
      width: `${A4_WIDTH_MM}mm`,
      maxWidth: "none",
      overflow: "visible",
      boxShadow: "none",
      border: "0",
      borderRadius: "0",
      transform: "none",
    });

    preview.querySelectorAll(".document-watermark, .watermark").forEach((element) => {
      element.remove();
    });
    preview.querySelectorAll(".page-break").forEach((element) => {
      element.style.display = "none";
      element.style.breakBefore = "auto";
      element.style.pageBreakBefore = "auto";
    });

    host.appendChild(preview);
    document.body.appendChild(host);

    const pageElements = Array.from(preview.querySelectorAll(".document-page"));
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

    return { host, preview, pageElements };
  }

  async function downloadCleanPreviewPdf() {
    const JsPdf = window.jspdf?.jsPDF;
    if (typeof window.html2canvas !== "function" || typeof JsPdf !== "function") {
      throw new Error("PDF export library could not be loaded.");
    }

    const preview = document.getElementById("preview");
    if (!preview) {
      throw new Error("Preview document could not be found.");
    }

    await waitForBuilderPhotoReady();
    await waitForDocumentFonts();
    await waitForPreviewImages(preview);

    const exportPreview = createPdfExportPreview(preview);

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

      for (const pageElement of exportPreview.pageElements) {
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

        const imageData = canvas.toDataURL("image/png");
        pdf.addImage(imageData, "PNG", 0, 0, pdfPageWidth, pdfPageHeight);
        isFirstPage = false;
      }

      pdf.save(filename);
    } finally {
      exportPreview.host.remove();
    }
  }

  async function handleCheckoutReturn() {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");

    if (params.get("checkout") === "cancel") {
      setStatus("Payment was cancelled. You can try again when ready.");
      openModal();
      return;
    }

    if (params.get("checkout") !== "success" || !sessionId) {
      return;
    }

    try {
      setStatus("Payment confirmed. Preparing your PDF...");
      const data = await verifyPaidCheckoutSession(sessionId);
      log("Stripe Checkout return verified", {
        paymentStatus: data.paymentStatus,
        documentType: data.documentType,
        styleName: data.styleName,
      });

      if (data.paymentStatus !== "paid") {
        setStatus(
          "Payment is still pending. The PDF download will be available after Stripe confirms the payment."
        );
        openModal();
        return;
      }

      await downloadCleanPreviewPdf();
      setStatus("PDF download started.");
      const url = new URL(window.location.href);
      url.searchParams.delete("checkout");
      url.searchParams.delete("session_id");
      window.history.replaceState({}, "", url.toString());
    } catch (error) {
      errorLog("Paid PDF download failed", error?.message || error);
      setStatus(error.message || "Payment was successful, but the PDF could not be downloaded.", true);
      openModal();
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
  };

  log("script loaded", {
    path: window.location.pathname,
    documentType,
    storageKey,
    scriptSrc: script?.getAttribute("src") || "",
  });

  installStripePaymentUi();
  handleCheckoutReturn();
})();
