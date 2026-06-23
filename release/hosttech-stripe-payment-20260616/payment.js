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

  function getBuyerDetails(documentData) {
    return {
      buyerName: document.getElementById("buyerName")?.value || documentData.name || "",
      customerEmail: document.getElementById("buyerEmail")?.value || "",
    };
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
        ...getBuyerDetails(documentData),
      }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.url) {
      throw new Error(data.error || "Payment could not be started.");
    }

    window.location.href = data.url;
  }

  async function downloadPaidPdf(sessionId) {
    const documentData = loadDocumentData();
    const styleName = getSelectedStyleName();
    const documentHash = await createDocumentHash(styleName, documentData);

    const response = await fetch(`${API_BASE_URL}/generate-pdf`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId,
        documentType,
        styleName,
        documentData,
        documentHash,
      }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || "PDF could not be generated.");
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  async function handleCheckoutReturn() {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");

    if (params.get("checkout") !== "success" || !sessionId) {
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/checkout/session/${encodeURIComponent(sessionId)}`
      );
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "Payment could not be verified.");
      }

      if (data.paymentStatus !== "paid") {
        alert("Payment is still pending. The PDF download will be available after Stripe confirms the payment.");
        return;
      }

      await downloadPaidPdf(sessionId);
    } catch (error) {
      console.error("Paid PDF download failed:", error);
      alert(error.message || "Payment was successful, but the PDF could not be downloaded.");
    }
  }

  function installStripePayButton() {
    const originalPayBtn = document.getElementById("payBtn");
    if (!originalPayBtn) {
      return;
    }

    const stripePayBtn = originalPayBtn.cloneNode(true);
    originalPayBtn.replaceWith(stripePayBtn);
    stripePayBtn.addEventListener("click", async () => {
      stripePayBtn.disabled = true;
      const originalText = stripePayBtn.textContent;
      stripePayBtn.textContent = "Weiter zu Stripe...";

      try {
        await startCheckout();
      } catch (error) {
        console.error("Stripe checkout failed:", error);
        alert(error.message || "Payment could not be started.");
        stripePayBtn.disabled = false;
        stripePayBtn.textContent = originalText;
      }
    });
  }

  installStripePayButton();
  handleCheckoutReturn();
})();
