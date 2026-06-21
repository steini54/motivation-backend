const crypto = require("node:crypto");

const DOCUMENT_TYPES = {
  motivation: {
    label: "Motivationsschreiben",
    previewPath: "motivation/preview.html",
    filename: "Bewerbung.pdf",
  },
  lebenslauf: {
    label: "Lebenslauf",
    previewPath: "lebenslauf/lpreview.html",
    filename: "Lebenslauf.pdf",
  },
};

const STYLE_NAMES = new Set([
  "aqua-arc-amethyst.css",
  "aqua-arc-contrast.css",
  "aqua-arc-default.css",
  "aqua-arc-emerald.css",
  "aqua-arc-soft.css",
  "aqua-arc-sunset.css",
  "charcoal-frame.css",
  "cobalt-ribbon.css",
  "corporate-axis-burgundy.css",
  "corporate-axis-default.css",
  "corporate-axis-forest.css",
  "corporate-axis-monochrome.css",
  "corporate-axis-navy.css",
  "corporate-axis-steel.css",
  "editorial-azure.css",
  "editorial-mono-classic.css",
  "editorial-mono-default.css",
  "editorial-mono-mint.css",
  "editorial-mono-rose.css",
  "editorial-mono-sepia.css",
  "editorial-mono-warm.css",
  "executive-ink.css",
  "graphite-pro.css",
  "midnight-column.css",
  "monograph.css",
  "navy-wave.css",
  "nordic-panel.css",
  "pearl-classic.css",
  "soft-sand.css",
  "swiss-line.css",
  "teal-balance.css",
  "terracotta-arch.css",
]);

function createPaymentError(status, code, message) {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  return error;
}

function normalizeDocumentType(value) {
  const documentType = String(value || "").trim().toLowerCase();
  if (!Object.hasOwn(DOCUMENT_TYPES, documentType)) {
    throw createPaymentError(400, "INVALID_DOCUMENT_TYPE", "Invalid document type.");
  }
  return documentType;
}

function normalizeStyleName(value) {
  const styleName = String(value || "swiss-line.css").trim().split(/[\\/]/).pop();
  if (!STYLE_NAMES.has(styleName)) {
    throw createPaymentError(400, "INVALID_STYLE", "Invalid document style.");
  }
  return styleName;
}

function normalizeDocumentHash(value) {
  const hash = String(value || "").trim().toLowerCase();
  if (!/^[a-f0-9]{64}$/.test(hash)) {
    throw createPaymentError(400, "INVALID_DOCUMENT_HASH", "Invalid document hash.");
  }
  return hash;
}

function normalizeEmail(value) {
  const email = String(value || "").trim().slice(0, 254);
  if (!email) {
    return "";
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw createPaymentError(400, "INVALID_EMAIL", "Invalid email address.");
  }

  return email;
}

function normalizeBuyerName(value) {
  return String(value || "").trim().slice(0, 120);
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

function createDocumentHash({ documentType, styleName, documentData }) {
  const payload = canonicalize({
    documentType: normalizeDocumentType(documentType),
    styleName: normalizeStyleName(styleName),
    documentData: documentData && typeof documentData === "object" ? documentData : {},
  });

  return crypto
    .createHash("sha256")
    .update(JSON.stringify(payload))
    .digest("hex");
}

module.exports = {
  DOCUMENT_TYPES,
  STYLE_NAMES,
  canonicalize,
  createDocumentHash,
  createPaymentError,
  normalizeBuyerName,
  normalizeDocumentHash,
  normalizeDocumentType,
  normalizeEmail,
  normalizeStyleName,
};
