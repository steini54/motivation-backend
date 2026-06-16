const PDFDocument = require("pdfkit");
const { DOCUMENT_TYPES, normalizeDocumentType } = require("./document-purchase");

function cleanText(value, maxLength = 2000) {
  return String(value || "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/[^\S\n]+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function addTextBlock(doc, label, value) {
  const text = cleanText(value);
  if (!text) {
    return;
  }

  doc.font("Helvetica-Bold").fontSize(10).text(label);
  doc.moveDown(0.2);
  doc.font("Helvetica").fontSize(10).text(text, { lineGap: 2 });
  doc.moveDown(0.8);
}

function addEntries(doc, label, entries) {
  if (!Array.isArray(entries) || entries.length === 0) {
    return;
  }

  doc.font("Helvetica-Bold").fontSize(13).text(label);
  doc.moveDown(0.4);

  entries.forEach((entry) => {
    const values = Object.values(entry || {})
      .map((value) => cleanText(value, 500))
      .filter(Boolean);

    if (values.length === 0) {
      return;
    }

    doc.font("Helvetica").fontSize(10).text(values.join(" | "), {
      lineGap: 2,
    });
    doc.moveDown(0.35);
  });

  doc.moveDown(0.5);
}

function writeMotivation(doc, data) {
  doc.font("Helvetica-Bold").fontSize(24).text("Bewerbung", {
    align: "center",
  });
  doc.moveDown(1.5);

  addTextBlock(doc, "Name", data.name);
  addTextBlock(doc, "Adresse", data.adresse);
  addTextBlock(doc, "Kontakt", data.kontakt);
  addTextBlock(doc, "Arbeitgeber", data.arbeitgeber);
  addTextBlock(doc, "Funktion", data.funktion || data.posten);
  addTextBlock(doc, "Begruessung", data.stichwoerter);
  addTextBlock(doc, "Motivationstext", data.stichwoerter2);
  addTextBlock(doc, "Verabschiedung", data.stichwoerter3);
  addTextBlock(doc, "Unterschrift", data.unterschrift || data.name);
}

function writeLebenslauf(doc, data) {
  doc.font("Helvetica-Bold").fontSize(24).text("Lebenslauf", {
    align: "center",
  });
  doc.moveDown(1.5);

  addTextBlock(doc, "Name", data.name);
  addTextBlock(doc, "Adresse", data.adresse);
  addTextBlock(doc, "Kontakt", data.kontakt);
  addEntries(doc, "Schulbildung", data.schulbildung);
  addEntries(doc, "Beruflicher Werdegang", data.beruf);
  addEntries(doc, "Aus- und Weiterbildung", data.weiterbildung);
  addEntries(doc, "Kenntnisse & Faehigkeiten", data.kenntnisse);
  addEntries(doc, "Hobbies", data.hobbys);
  addTextBlock(doc, "Datum", data.datum);
  addTextBlock(doc, "Unterschrift", data.unterschrift || data.name);
}

function createCleanPdfBuffer({ documentType, documentData }) {
  const type = normalizeDocumentType(documentType);
  const data =
    documentData && typeof documentData === "object" ? documentData : {};

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margin: 54,
      info: {
        Title: DOCUMENT_TYPES[type].label,
        Creator: "VitaGen",
      },
    });
    const chunks = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("error", reject);
    doc.on("end", () => resolve(Buffer.concat(chunks)));

    doc.font("Helvetica");

    if (type === "motivation") {
      writeMotivation(doc, data);
    } else {
      writeLebenslauf(doc, data);
    }

    doc.end();
  });
}

module.exports = {
  createCleanPdfBuffer,
};
