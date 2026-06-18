(function () {
  "use strict";

  const API_BASE_URL = "https://motivation-backend-production-2800.up.railway.app";
  const script = document.currentScript;
  const documentType = script?.dataset.documentType || "";
  const storageKey = script?.dataset.storageKey || "";
  const filename = script?.dataset.filename || "VitaGen.pdf";
  const A4_WIDTH_MM = 210;
  const A4_HEIGHT_MM = 297;
  const CANVAS_SCALE = 2;
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

    const documentData = loadDocumentData();
    const styleName = getSelectedStyleName();
    const documentHash = await createDocumentHash(styleName, documentData);

    log("starting Stripe Checkout session", {
      documentType,
      styleName,
      documentHashPrefix: documentHash.slice(0, 10),
      returnUrl: getReturnUrl(),
    });

    sessionStorage.setItem(
      "vitagen_pending_checkout",
      JSON.stringify({ documentType, styleName, documentHash })
    );

    const response = await fetch(`${API_BASE_URL}/checkout/create-session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        documentType,
        styleName,
        documentHash,
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
      (img) => img.offsetParent !== null && img.getAttribute("src")
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

  function getVisibleChildren(element) {
    return Array.from(element.children).filter((child) => {
      const styles = window.getComputedStyle(child);
      return styles.display !== "none" && styles.visibility !== "hidden";
    });
  }

  function getExportHeightPx(pageElement, pageHeightPx) {
    if (pageElement.classList.contains("cover")) {
      return pageHeightPx;
    }

    const pageRect = pageElement.getBoundingClientRect();
    const styles = window.getComputedStyle(pageElement);
    const paddingBottom = Number.parseFloat(styles.paddingBottom) || 0;
    const contentBottom = getVisibleChildren(pageElement).reduce((bottom, child) => {
      const childRect = child.getBoundingClientRect();
      return Math.max(bottom, childRect.bottom - pageRect.top);
    }, 0);

    return Math.ceil(Math.max(pageHeightPx, contentBottom + paddingBottom));
  }

  function getTrailingSliceTolerancePx(canvasWidth) {
    return Math.ceil(canvasWidth * (3 / A4_WIDTH_MM));
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

    const watermark = preview.querySelector(".watermark");
    const pageBreaks = Array.from(preview.querySelectorAll(".page-break"));
    const originalWatermarkDisplay = watermark?.style.display || "";
    const originalBoxShadow = preview.style.boxShadow || "";
    const pageSelector = documentType === "lebenslauf" ? ".cv" : ".anschreiben";
    const pageElements = Array.from(preview.querySelectorAll(pageSelector));
    const originalPageBreakDisplays = pageBreaks.map((element) => ({
      element,
      display: element.style.display || "",
      breakBefore: element.style.breakBefore || "",
      pageBreakBefore: element.style.pageBreakBefore || "",
    }));

    await waitForPreviewImages(preview);

    try {
      if (watermark) {
        watermark.style.display = "none";
      }
      pageBreaks.forEach((element) => {
        element.style.display = "none";
        element.style.breakBefore = "auto";
        element.style.pageBreakBefore = "auto";
      });
      preview.style.boxShadow = "none";

      const pdf = new JsPdf({
        unit: "mm",
        format: "a4",
        orientation: "portrait",
        compress: true,
      });
      const pdfPageWidth = pdf.internal.pageSize.getWidth();
      const pdfPageHeight = pdf.internal.pageSize.getHeight();
      let isFirstPage = true;

      for (const pageElement of pageElements) {
        const pageRect = pageElement.getBoundingClientRect();
        const pageHeightPx = Math.round(pageRect.width * (A4_HEIGHT_MM / A4_WIDTH_MM));
        const exportHeightPx = getExportHeightPx(pageElement, pageHeightPx);
        const canvas = await window.html2canvas(pageElement, {
          scale: CANVAS_SCALE,
          width: Math.ceil(pageRect.width),
          height: exportHeightPx,
          useCORS: true,
          allowTaint: false,
          backgroundColor: "#ffffff",
          scrollX: 0,
          scrollY: 0,
          windowWidth: Math.ceil(pageRect.width),
          windowHeight: exportHeightPx,
        });
        const sliceHeight = Math.floor(canvas.width * (pdfPageHeight / pdfPageWidth));
        const trailingTolerancePx = getTrailingSliceTolerancePx(canvas.width);
        let offsetY = 0;

        while (offsetY < canvas.height) {
          const remainingHeight = canvas.height - offsetY;
          if (remainingHeight < trailingTolerancePx) {
            break;
          }

          const currentSliceHeight =
            canvas.height <= sliceHeight + trailingTolerancePx
              ? canvas.height
              : Math.min(sliceHeight, remainingHeight);
          const pageCanvas = document.createElement("canvas");
          pageCanvas.width = canvas.width;
          pageCanvas.height = currentSliceHeight;
          const context = pageCanvas.getContext("2d");

          context.fillStyle = "#ffffff";
          context.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
          context.drawImage(
            canvas,
            0,
            offsetY,
            canvas.width,
            currentSliceHeight,
            0,
            0,
            canvas.width,
            currentSliceHeight
          );

          if (!isFirstPage) {
            pdf.addPage();
          }

          const imageData = pageCanvas.toDataURL("image/jpeg", 0.98);
          const imageHeightMm =
            canvas.height <= sliceHeight + trailingTolerancePx
              ? pdfPageHeight
              : (currentSliceHeight * pdfPageWidth) / canvas.width;
          pdf.addImage(imageData, "JPEG", 0, 0, pdfPageWidth, imageHeightMm);
          isFirstPage = false;

          if (canvas.height <= sliceHeight + trailingTolerancePx) {
            break;
          }
          offsetY += currentSliceHeight;
        }
      }

      pdf.save(filename);
    } finally {
      if (watermark) {
        watermark.style.display = originalWatermarkDisplay;
      }
      originalPageBreakDisplays.forEach(
        ({ element, display, breakBefore, pageBreakBefore }) => {
          element.style.display = display;
          element.style.breakBefore = breakBefore;
          element.style.pageBreakBefore = pageBreakBefore;
        }
      );
      preview.style.boxShadow = originalBoxShadow;
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
