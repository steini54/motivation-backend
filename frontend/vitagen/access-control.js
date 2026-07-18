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
  const AI_TEXT_SIGNATURE_VERSION = 1;
  const AI_TEXT_SHINGLE_SIZE = 5;
  const AI_TEXT_SIGNATURE_LIMIT = 4;
  const AI_TEXT_SHINGLE_LIMIT = 512;

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

  function normalizeAiAttributionText(value) {
    const text = String(value || "");
    const normalized =
      typeof text.normalize === "function" ? text.normalize("NFKC") : text;
    return normalized
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, " ")
      .trim()
      .replace(/\s+/g, " ");
  }

  function hashAiAttributionValue(value) {
    const text = String(value || "");
    let hash = 0x811c9dc5;
    for (let index = 0; index < text.length; index += 1) {
      hash ^= text.charCodeAt(index);
      hash = Math.imul(hash, 0x01000193);
    }
    return (hash >>> 0).toString(36);
  }

  function createAiTextSignature(value) {
    const normalized = normalizeAiAttributionText(value);
    if (!normalized) {
      return null;
    }

    const tokens = normalized.split(" ");
    const shingles = [];
    const seen = new Set();
    const shingleCount = Math.max(1, tokens.length - AI_TEXT_SHINGLE_SIZE + 1);

    for (
      let index = 0;
      index < shingleCount && shingles.length < AI_TEXT_SHINGLE_LIMIT;
      index += 1
    ) {
      const shingle =
        tokens.length < AI_TEXT_SHINGLE_SIZE
          ? normalized
          : tokens.slice(index, index + AI_TEXT_SHINGLE_SIZE).join(" ");
      const hash = hashAiAttributionValue(shingle);
      if (!seen.has(hash)) {
        seen.add(hash);
        shingles.push(hash);
      }
    }

    return {
      v: AI_TEXT_SIGNATURE_VERSION,
      textHash: hashAiAttributionValue(normalized),
      tokenCount: tokens.length,
      shingles,
    };
  }

  function normalizeAiTextSignatures(value) {
    if (!Array.isArray(value)) {
      return [];
    }

    const signatures = [];
    const seen = new Set();
    for (const entry of value) {
      if (
        !entry ||
        Number(entry.v) !== AI_TEXT_SIGNATURE_VERSION ||
        typeof entry.textHash !== "string" ||
        !/^[a-z0-9]{1,16}$/i.test(entry.textHash) ||
        !Array.isArray(entry.shingles)
      ) {
        continue;
      }

      const shingles = Array.from(
        new Set(
          entry.shingles
            .filter((hash) => typeof hash === "string" && /^[a-z0-9]+$/i.test(hash))
            .slice(0, AI_TEXT_SHINGLE_LIMIT)
        )
      );
      const signature = {
        v: AI_TEXT_SIGNATURE_VERSION,
        textHash: entry.textHash,
        tokenCount: Math.max(0, Number.parseInt(entry.tokenCount, 10) || 0),
        shingles,
      };

      if (!seen.has(signature.textHash)) {
        seen.add(signature.textHash);
        signatures.push(signature);
      }
      if (signatures.length >= AI_TEXT_SIGNATURE_LIMIT) {
        break;
      }
    }
    return signatures;
  }

  function addAiTextSignature(signatures, value) {
    const nextSignature = createAiTextSignature(value);
    const existing = normalizeAiTextSignatures(signatures);
    if (!nextSignature) {
      return existing;
    }

    return [
      nextSignature,
      ...existing.filter((entry) => entry.textHash !== nextSignature.textHash),
    ].slice(0, AI_TEXT_SIGNATURE_LIMIT);
  }

  function usesAiGeneratedText(value, signatures) {
    const current = createAiTextSignature(value);
    if (!current) {
      return false;
    }

    return normalizeAiTextSignatures(signatures).some((source) => {
      if (source.textHash === current.textHash) {
        return true;
      }

      if (source.shingles.length < 4 || current.shingles.length < 4) {
        return false;
      }

      const sourceShingles = new Set(source.shingles);
      const matches = current.shingles.reduce(
        (count, shingle) => count + (sourceShingles.has(shingle) ? 1 : 0),
        0
      );
      if (matches < 6) {
        return false;
      }

      const currentOverlap = matches / current.shingles.length;
      const sourceOverlap = matches / source.shingles.length;
      return currentOverlap >= 0.4 || sourceOverlap >= 0.3;
    });
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

    const aiTextUsed = usesAiGeneratedText(
      data.stichwoerter2,
      data.stichwoerter2_ai_signatures
    );

    return evaluateDocumentAccess({
      ...input,
      aiTextUsed: Boolean(aiTextUsed || data.stichwoerter2_is_ai || input.aiTextUsed),
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
    addAiTextSignature,
    createAiTextSignature,
    describeDocumentAccess,
    evaluateDocumentAccess,
    getPreviewDownloadCopy,
    getStorageKey,
    isFreeTemplate,
    normalizeDocumentType,
    normalizeAiTextSignatures,
    normalizeStyleName,
    readStoredAccess,
    stateFromDocument,
    usesAiGeneratedText,
    writeStoredAccess,
  });
});
