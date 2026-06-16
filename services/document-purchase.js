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
  "basic.css",
  "basic2.css",
  "classic.css",
  "classic2.css",
  "crosser.css",
  "crosser2.css",
  "headerbar.css",
  "headerbarlight.css",
  "modern.css",
  "modern2.css",
  "report.css",
  "report2.css",
  "simmons.css",
  "simmons2.css",
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
  const styleName = String(value || "classic.css").trim().split(/[\\/]/).pop();
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
