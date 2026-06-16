(function () {
  "use strict";

  const API_BASE_URL = "https://motivation-backend-production-2800.up.railway.app";
  const script = document.currentScript;
  const documentType = script?.dataset.documentType || "";
  const storageKey = script?.dataset.storageKey || "";
  const filename = script?.dataset.filename || "VitaGen.pdf";

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

  function getSelectedStyleName() {
    const href = document.getElementById("theme-style")?.getAttribute("href") || "";
    return href.split("/").pop() || localStorage.getItem("vitagen_style") || "classic.css";
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
    if (modal) {
      modal.style.display = "flex";
    }
  }

  function closeModal() {
    const modal = document.getElementById("buyModal");
    if (modal) {
      modal.style.display = "none";
    }
  }

  async function startCheckout() {
    const documentData = loadDocumentData();
    const styleName = getSelectedStyleName();
    const documentHash = await createDocumentHash(styleName, documentData);

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
    const pageSelector =
      documentType === "lebenslauf" ? ".cover, .cv" : ".cover, .anschreiben";
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
      let isFirstPage = true;

      for (const pageElement of pageElements) {
        const canvas = await window.html2canvas(pageElement, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: "#ffffff",
          scrollX: 0,
          scrollY: 0,
          windowWidth: document.documentElement.scrollWidth,
        });
        const sliceHeight = Math.floor(canvas.width * (297 / 210));
        let offsetY = 0;

        while (offsetY < canvas.height) {
          const remainingHeight = canvas.height - offsetY;
          if (remainingHeight < 8) {
            break;
          }

          const currentSliceHeight =
            canvas.height <= sliceHeight + 8
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
            canvas.height <= sliceHeight + 8
              ? 297
              : (currentSliceHeight * 210) / canvas.width;
          pdf.addImage(imageData, "JPEG", 0, 0, 210, imageHeightMm);
          isFirstPage = false;

          if (canvas.height <= sliceHeight + 8) {
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
      const response = await fetch(
        `${API_BASE_URL}/checkout/session/${encodeURIComponent(sessionId)}`
      );
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "Payment could not be verified.");
      }

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
      console.error("Paid PDF download failed:", error);
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

    if (buyBtn) {
      buyBtn.addEventListener("click", () => {
        setStatus("");
        openModal();
      });
    }

    if (cancelBtn) {
      cancelBtn.addEventListener("click", closeModal);
    }

    if (!payBtn) {
      return;
    }

    payBtn.addEventListener("click", async () => {
      payBtn.disabled = true;
      const originalText = payBtn.textContent;
      payBtn.textContent = "Weiter zu Stripe...";
      setStatus("Redirecting to secure Stripe Checkout...");

      try {
        await startCheckout();
      } catch (error) {
        console.error("Stripe checkout failed:", error);
        setStatus(error.message || "Payment could not be started.", true);
        payBtn.disabled = false;
        payBtn.textContent = originalText;
      }
    });
  }

  installStripePaymentUi();
  handleCheckoutReturn();
})();
