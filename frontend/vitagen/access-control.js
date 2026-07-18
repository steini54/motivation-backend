(function initializeVitaGenAccessControl(root, factory) {
  "use strict";

  const api = factory();

  if (typeof module === "object" && module.exports) {
    module.exports = api;
  } else if (root) {
    root.VitaGenAccess = api;
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function createAccessControl() {
  "use strict";

  const FREE_TEMPLATE_ID = "simple-free";
  const FREE_STYLE_NAMES = Object.freeze([
    "simple-free-blue.css",
    "simple-free-gray.css",
  ]);
  const PREMIUM_REASON_CODES = Object.freeze({
    TEMPLATE: "premium_template",
    AI_TEXT: "ai_text",
    AI_PHOTO: "ai_photo",
  });
  const DOCUMENT_TYPES = new Set(["lebenslauf", "motivation"]);

  function normalizeDocumentType(value) {
    const documentType = String(value || "").trim().toLowerCase();
    return DOCUMENT_TYPES.has(documentType) ? documentType : "";
  }

  function normalizeStyleName(value) {
    return String(value || "").trim().split(/[\\/]/).pop().toLowerCase();
  }

  function normalizeTemplateId(value) {
    return String(value || "").trim().toLowerCase();
  }

  function isFreeTemplate(templateId, styleName) {
    return (
      normalizeTemplateId(templateId) === FREE_TEMPLATE_ID &&
      FREE_STYLE_NAMES.includes(normalizeStyleName(styleName))
    );
  }

  function evaluateDocumentAccess(input = {}) {
    const documentType = normalizeDocumentType(input.documentType);
    const selectedTemplateId = normalizeTemplateId(input.selectedTemplateId);
    const styleName = normalizeStyleName(input.styleName);
    const selectedTemplateTier = isFreeTemplate(selectedTemplateId, styleName)
      ? "free"
      : "premium";
    const aiTextUsed = Boolean(input.aiTextUsed);
    const aiPhotoUsed = Boolean(input.aiPhotoUsed);
    const normalPhotoUsed = Boolean(input.normalPhotoUsed) && !aiPhotoUsed;
    const premiumReasons = [];

    if (selectedTemplateTier === "premium") {
      premiumReasons.push(PREMIUM_REASON_CODES.TEMPLATE);
    }
    if (aiTextUsed) {
      premiumReasons.push(PREMIUM_REASON_CODES.AI_TEXT);
    }
    if (aiPhotoUsed) {
      premiumReasons.push(PREMIUM_REASON_CODES.AI_PHOTO);
    }

    return {
      documentType,
      selectedTemplateId,
      selectedTemplateTier,
      styleName,
      aiTextUsed,
      normalPhotoUsed,
      aiPhotoUsed,
      documentTier: premiumReasons.length > 0 ? "premium" : "free",
      premiumReasons,
      paymentStatus: input.paymentStatus === "paid" ? "paid" : "unpaid",
    };
  }

  function stateFromDocument(input = {}) {
    const data =
      input.documentData && typeof input.documentData === "object"
        ? input.documentData
        : {};
    const hasPhoto = Boolean(String(data.foto || "").trim());

    return evaluateDocumentAccess({
      ...input,
      aiTextUsed: Boolean(data.stichwoerter2_is_ai || input.aiTextUsed),
      aiPhotoUsed: Boolean(data.foto_is_ai || input.aiPhotoUsed),
      normalPhotoUsed: Boolean((hasPhoto || input.normalPhotoUsed) && !data.foto_is_ai),
    });
  }

  function getReasonLabels(language = "de") {
    if (language === "en") {
      return {
        [PREMIUM_REASON_CODES.TEMPLATE]: "Premium template selected",
        [PREMIUM_REASON_CODES.AI_TEXT]: "AI text used",
        [PREMIUM_REASON_CODES.AI_PHOTO]: "AI photo used",
      };
    }

    return {
      [PREMIUM_REASON_CODES.TEMPLATE]: "Premium-Template ausgewaehlt",
      [PREMIUM_REASON_CODES.AI_TEXT]: "KI-Text verwendet",
      [PREMIUM_REASON_CODES.AI_PHOTO]: "KI-Foto verwendet",
    };
  }

  function describeDocumentAccess(state, language = "de") {
    const normalized = evaluateDocumentAccess(state);
    const isEnglish = language === "en";
    const labels = getReasonLabels(language);

    return {
      title:
        normalized.documentTier === "free"
          ? isEnglish
            ? "Free document"
            : "Kostenloses Dokument"
          : isEnglish
            ? "Premium document"
            : "Premium-Dokument",
      detail:
        normalized.documentTier === "free"
          ? isEnglish
            ? "Download without payment"
            : "Download ohne Zahlung"
          : normalized.premiumReasons.map((reason) => labels[reason]).join(" - "),
    };
  }

  function getPreviewDownloadCopy(state, language = "de") {
    const normalized = evaluateDocumentAccess(state);
    const isEnglish = language === "en";

    if (normalized.documentTier === "free") {
      return isEnglish
        ? {
            title: "Free download",
            description:
              "This Free document can be downloaded as a PDF without payment or a watermark.",
            benefit: "Download without payment",
            action: "Download free PDF",
          }
        : {
            title: "Kostenloser Download",
            description:
              "Dieses Free-Dokument kann ohne Zahlung und ohne Wasserzeichen als PDF heruntergeladen werden.",
            benefit: "Download ohne Zahlung",
            action: "Kostenlose PDF herunterladen",
          };
    }

    return isEnglish
      ? {
          title: "Premium preview",
          description:
            "The preview shows the document with a watermark. After payment, the PDF is downloaded without a watermark.",
          benefit: "Download without watermark after payment",
          action: "Unlock premium PDF",
        }
      : {
          title: "Premium-Vorschau",
          description:
            "Die Vorschau zeigt das Dokument mit Wasserzeichen. Nach der Zahlung wird die PDF ohne Wasserzeichen heruntergeladen.",
          benefit: "Download ohne Wasserzeichen nach Zahlung",
          action: "Premium-PDF freischalten",
        };
  }

  function getStorageKey(documentType) {
    const normalized = normalizeDocumentType(documentType);
    return normalized ? `vitagen_${normalized}_access` : "";
  }

  function readStoredAccess(documentType, storage) {
    const key = getStorageKey(documentType);
    if (!key || !storage?.getItem) {
      return {};
    }

    try {
      const value = JSON.parse(storage.getItem(key) || "{}");
      return value && typeof value === "object" ? value : {};
    } catch {
      return {};
    }
  }

  function writeStoredAccess(documentType, state, storage) {
    const key = getStorageKey(documentType);
    if (!key || !storage?.setItem) {
      return state;
    }

    storage.setItem(key, JSON.stringify(state));
    return state;
  }

  return Object.freeze({
    FREE_STYLE_NAMES,
    FREE_TEMPLATE_ID,
    PREMIUM_REASON_CODES,
    describeDocumentAccess,
    evaluateDocumentAccess,
    getPreviewDownloadCopy,
    getStorageKey,
    isFreeTemplate,
    normalizeDocumentType,
    normalizeStyleName,
    readStoredAccess,
    stateFromDocument,
    writeStoredAccess,
  });
});
