const AI_API_BASE_URL = "https://motivation-backend-production-2800.up.railway.app";

let aiImageCount = 0;
const MAX_IMAGES = 3;
const STORAGE_KEY = "vitagen_lebenslauf";
const STYLE_STORAGE_KEY = "vitagen_lebenslauf_style";
const LANGUAGE_STORAGE_KEY = "vitagen_language";
const DEFAULT_STYLE = "swiss-line.css";
const DOCUMENT_STYLES = [
  "charcoal-frame.css",
  "cobalt-ribbon.css",
  "editorial-azure.css",
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
];
const UI_TRANSLATIONS = {
  de: {
    "document.title": "VitaGen - Lebenslauf",
    "cv.eyebrow": "CV Generator",
    "cv.title": "Lebenslauf erstellen",
    "cv.copy": "Strukturierter Editor fuer professionelle europaeische CVs mit Live-Vorschau, Stilwahl und KI-Bewerbungsfoto.",
    "Live": "Live",
    "Abschnitte": "Abschnitte",
    "Persoenliche Daten": "Persoenliche Daten",
    "Bewerbungsfoto": "Bewerbungsfoto",
    "Berufserfahrung": "Berufserfahrung",
    "Schulbildung": "Schulbildung",
    "Weiterbildung": "Weiterbildung",
    "Kenntnisse": "Kenntnisse",
    "Abschluss": "Abschluss",
    "Lebenslauf Formular": "Lebenslauf Formular",
    "Diese Angaben erscheinen direkt in der Live-Vorschau.": "Diese Angaben erscheinen direkt in der Live-Vorschau.",
    "Name": "Name",
    "Max Muster": "Max Muster",
    "Berufsprofil": "Berufsprofil",
    "Kaufmaennischer Mitarbeiter": "Kaufmaennischer Mitarbeiter",
    "Kontakt": "Kontakt",
    "Adresse": "Adresse",
    "Bahnhofstrasse 12, 8001 Zuerich": "Bahnhofstrasse 12, 8001 Zuerich",
    "Bahnhofstrasse 12": "Bahnhofstrasse 12",
    "8001 Zuerich": "8001 Zuerich",
    "Profil": "Profil",
    "Kurzprofil mit Staerken, Berufserfahrung und Zielrichtung.": "Kurzprofil mit Staerken, Berufserfahrung und Zielrichtung.",
    "Bewerbungsfoto vorbereiten": "Bewerbungsfoto vorbereiten",
    "KI-Funktion: Aus einem normalen Foto wird eine professionelle Bewerbungsfoto-Variante.": "KI-Funktion: Aus einem normalen Foto wird eine professionelle Bewerbungsfoto-Variante.",
    "KI-Fotoassistent": "KI-Fotoassistent",
    "KI-Funktion - {count} / {max} generiert": "KI-Funktion - {count} / {max} generiert",
    "KI-Funktion - 0 / 3 generiert": "KI-Funktion - 0 / 3 generiert",
    "Foto hochladen": "Foto hochladen",
    "Die KI erstellt daraus professionelle Varianten fuer den CV.": "Die KI erstellt daraus professionelle Varianten fuer den CV.",
    "Datei auswaehlen": "Datei auswaehlen",
    "Foto aendern": "Foto aendern",
    "Generierte Optionen": "Generierte Optionen",
    "Noch nicht generiert": "Noch nicht generiert",
    "Professionelles Foto generieren": "Professionelles Foto generieren",
    "Nach der Auswahl erscheint das Foto direkt in der CV-Vorschau.": "Nach der Auswahl erscheint das Foto direkt in der CV-Vorschau.",
    "Stationen koennen hinzugefuegt, geloescht und direkt in der Vorschau geprueft werden.": "Stationen koennen hinzugefuegt, geloescht und direkt in der Vorschau geprueft werden.",
    "Weitere Station hinzufuegen": "Weitere Station hinzufuegen",
    "Abschluss, Zeitraum und Ort kompakt erfassen.": "Abschluss, Zeitraum und Ort kompakt erfassen.",
    "Schule hinzufuegen": "Schule hinzufuegen",
    "Aus- und Weiterbildung": "Aus- und Weiterbildung",
    "Kurse, Zertifikate und Weiterbildungen strukturiert darstellen.": "Kurse, Zertifikate und Weiterbildungen strukturiert darstellen.",
    "Weiterbildung hinzufuegen": "Weiterbildung hinzufuegen",
    "Fachliche und digitale Kompetenzen.": "Fachliche und digitale Kompetenzen.",
    "Kenntnis hinzufuegen": "Kenntnis hinzufuegen",
    "Hobbys": "Hobbys",
    "Optional, kurz und professionell.": "Optional, kurz und professionell.",
    "Hobby hinzufuegen": "Hobby hinzufuegen",
    "Datum und Signatur fuer den CV.": "Datum und Signatur fuer den CV.",
    "Datum": "Datum",
    "Zuerich, 18.06.2026": "Zuerich, 18.06.2026",
    "Unterschrift": "Unterschrift",
    "Live Vorschau": "Live Vorschau",
    "Live-Vorschau": "Live-Vorschau",
    "Aktualisiert sich automatisch beim Tippen.": "Aktualisiert sich automatisch beim Tippen.",
    "Aktiv": "Aktiv",
    "VORSCHAU": "VORSCHAU",
    "Interessen": "Interessen",
    "Lebenslauf": "Lebenslauf",
    "Strukturierte, zuverlaessige Fachkraft mit Erfahrung in Organisation, Kommunikation und serviceorientierter Zusammenarbeit.": "Strukturierte, zuverlaessige Fachkraft mit Erfahrung in Organisation, Kommunikation und serviceorientierter Zusammenarbeit.",
    "Dokumentstil": "Dokumentstil",
    "Stil direkt testen": "Stil direkt testen",
    "Der Stil veraendert sich direkt in der Vorschau.": "Der Stil veraendert sich direkt in der Vorschau.",
    "Empfohlen": "Empfohlen",
    "Kontrast": "Kontrast",
    "Dynamisch": "Dynamisch",
    "Editorial": "Editorial",
    "Premium": "Premium",
    "Business": "Business",
    "Modern": "Modern",
    "Minimal": "Minimal",
    "Elegant": "Elegant",
    "Ruhig": "Ruhig",
    "Klassisch": "Klassisch",
    "Warm Soft": "Warm Soft",
    "Klar": "Klar",
    "Warm": "Warm",
    "PDF ohne Wasserzeichen vorbereiten": "PDF ohne Wasserzeichen vorbereiten",
    "Pruefe zuerst die Vorschau. Der Preis erscheint erst, wenn die PDF ohne Wasserzeichen angefordert wird.": "Pruefe zuerst die Vorschau. Der Preis erscheint erst, wenn die PDF ohne Wasserzeichen angefordert wird.",
    "Vorschau schliessen": "Vorschau schliessen",
    "Vollbild-Vorschau": "Vollbild-Vorschau",
    "Kostenlose Vorschau": "Kostenlose Vorschau",
    "Die Vorschau zeigt den Lebenslauf mit Wasserzeichen. Nach dem Freischalten wird die PDF ohne Wasserzeichen heruntergeladen.": "Die Vorschau zeigt den Lebenslauf mit Wasserzeichen. Nach dem Freischalten wird die PDF ohne Wasserzeichen heruntergeladen.",
    "Stil, Foto und Text vorher pruefen": "Stil, Foto und Text vorher pruefen",
    "Kein Account erforderlich": "Kein Account erforderlich",
    "Download ohne Wasserzeichen nach Zahlung": "Download ohne Wasserzeichen nach Zahlung",
    "PDF ohne Wasserzeichen herunterladen": "PDF ohne Wasserzeichen herunterladen",
    "Zurueck bearbeiten": "Zurueck bearbeiten",
    "PDF ohne Wasserzeichen": "PDF ohne Wasserzeichen",
    "Zahlungsfenster schliessen": "Zahlungsfenster schliessen",
    "Finale PDF freischalten": "Finale PDF freischalten",
    "Ihre Vorschau ist kostenlos. Fuer die druckfertige PDF-Version ohne Wasserzeichen koennen Sie das Dokument einmalig freischalten.": "Ihre Vorschau ist kostenlos. Fuer die druckfertige PDF-Version ohne Wasserzeichen koennen Sie das Dokument einmalig freischalten.",
    "CHF Â· einmalig": "CHF - einmalig",
    "CHF Ã‚Â· einmalig": "CHF - einmalig",
    "Sofortiger Download nach Zahlung": "Sofortiger Download nach Zahlung",
    "Sichere Zahlung ueber Stripe": "Sichere Zahlung ueber Stripe",
    "Keine Kartendaten auf dieser Website gespeichert": "Keine Kartendaten auf dieser Website gespeichert",
    "Weiter zur sicheren Zahlung": "Weiter zur sicheren Zahlung",
    "In der finalen Version werden Sie zu Stripe Checkout weitergeleitet und danach automatisch zum Download zurueckgefuehrt.": "In der finalen Version werden Sie zu Stripe Checkout weitergeleitet und danach automatisch zum Download zurueckgefuehrt.",
    "Position": "Position",
    "Unternehmen / Ort": "Unternehmen / Ort",
    "Von": "Von",
    "Bis": "Bis",
    "Ort / Land optional": "Ort / Land optional",
    "Taetigkeit / Aufgaben": "Taetigkeit / Aufgaben",
    "Schule": "Schule",
    "Ort / Land": "Ort / Land",
    "Titel": "Titel",
    "Ausbildungsstaette / Ort": "Ausbildungsstaette / Ort",
    "Inhalte": "Inhalte",
    "Kenntnis": "Kenntnis",
    "Hobby": "Hobby",
    "Eintrag": "Eintrag",
    "Eintrag ein- oder ausklappen": "Eintrag ein- oder ausklappen",
    "Eintrag entfernen": "Eintrag entfernen",
    "Jetzt ergaenzen": "Jetzt ergaenzen",
    "MS Office": "MS Office",
    "Organisation": "Organisation",
    "Kommunikation": "Kommunikation",
    "Lesen": "Lesen",
    "Sport": "Sport",
    "Bereit fuer KI-Foto": "Bereit fuer KI-Foto",
    "Ausgewaehltes Bewerbungsfoto": "Ausgewaehltes Bewerbungsfoto",
    "KI Foto Variante {count} auswaehlen": "KI Foto Variante {count} auswaehlen",
    "KI Foto Variante {count}": "KI Foto Variante {count}",
    "Variante": "Variante",
    "Foto fuer die Vorschau ausgewaehlt": "Foto fuer die Vorschau ausgewaehlt",
    "Foto wird vorbereitet...": "Foto wird vorbereitet...",
    "3 professionelle Varianten verfuegbar": "3 professionelle Varianten verfuegbar",
    "Option bereit zur Auswahl": "Option bereit zur Auswahl",
    "Weitere Option generieren": "Weitere Option generieren",
    "Generiere Foto...": "Generiere Foto...",
    "Kein Bild erhalten": "Kein Bild erhalten",
    "Generierung fehlgeschlagen": "Generierung fehlgeschlagen",
    "Upload fehlgeschlagen": "Upload fehlgeschlagen",
    "Limit erreicht": "Limit erreicht",
    "Foto fehlt": "Foto fehlt",
    "KI-Foto bereit": "KI-Foto bereit",
    "Das Foto konnte nicht gelesen werden. Bitte versuchen Sie eine andere Datei.": "Das Foto konnte nicht gelesen werden. Bitte versuchen Sie eine andere Datei.",
    "Sie haben bereits 3 KI-Bilder generiert.": "Sie haben bereits 3 KI-Bilder generiert.",
    "Bitte zuerst ein Foto hochladen.": "Bitte zuerst ein Foto hochladen.",
    "Professionelle Foto-Option wurde erstellt.": "Professionelle Foto-Option wurde erstellt.",
    "Der Server hat kein Bild zurueckgegeben.": "Der Server hat kein Bild zurueckgegeben.",
    "Das Foto konnte nicht generiert werden. Bitte versuchen Sie es erneut.": "Das Foto konnte nicht generiert werden. Bitte versuchen Sie es erneut.",
    "Zwischengespeichert": "Zwischengespeichert",
    "Ihre Eingaben wurden lokal gespeichert.": "Ihre Eingaben wurden lokal gespeichert.",
    "Erfolg": "Erfolg",
    "Hinweis": "Hinweis",
    "Achtung": "Achtung",
    "Fehler": "Fehler",
    "Meldung schliessen": "Meldung schliessen",
  },
  en: {
    "document.title": "VitaGen - CV",
    "cv.eyebrow": "CV Generator",
    "cv.title": "Create CV",
    "cv.copy": "A structured editor for professional European CVs with live preview, style selection, and AI application photo.",
    "Live": "Live",
    "Abschnitte": "Sections",
    "Persoenliche Daten": "Personal details",
    "Bewerbungsfoto": "Application photo",
    "Berufserfahrung": "Work experience",
    "Schulbildung": "Education",
    "Weiterbildung": "Further training",
    "Kenntnisse": "Skills",
    "Abschluss": "Final details",
    "Lebenslauf Formular": "CV form",
    "Diese Angaben erscheinen direkt in der Live-Vorschau.": "These details appear directly in the live preview.",
    "Name": "Name",
    "Max Muster": "Max Sample",
    "Berufsprofil": "Professional profile",
    "Kaufmaennischer Mitarbeiter": "Commercial employee",
    "Kontakt": "Contact",
    "Adresse": "Address",
    "Bahnhofstrasse 12, 8001 Zuerich": "Bahnhofstrasse 12, 8001 Zurich",
    "Bahnhofstrasse 12": "Bahnhofstrasse 12",
    "8001 Zuerich": "8001 Zurich",
    "Profil": "Profile",
    "Kurzprofil mit Staerken, Berufserfahrung und Zielrichtung.": "Short profile with strengths, work experience, and target direction.",
    "Bewerbungsfoto vorbereiten": "Prepare application photo",
    "KI-Funktion: Aus einem normalen Foto wird eine professionelle Bewerbungsfoto-Variante.": "AI feature: turn a regular photo into a professional application photo variant.",
    "KI-Fotoassistent": "AI photo assistant",
    "KI-Funktion - {count} / {max} generiert": "AI feature - {count} / {max} generated",
    "KI-Funktion - 0 / 3 generiert": "AI feature - 0 / 3 generated",
    "Foto hochladen": "Upload photo",
    "Die KI erstellt daraus professionelle Varianten fuer den CV.": "The AI creates professional variants for your CV.",
    "Datei auswaehlen": "Choose file",
    "Foto aendern": "Change photo",
    "Generierte Optionen": "Generated options",
    "Noch nicht generiert": "Not generated yet",
    "Professionelles Foto generieren": "Generate professional photo",
    "Nach der Auswahl erscheint das Foto direkt in der CV-Vorschau.": "After selection, the photo appears directly in the CV preview.",
    "Stationen koennen hinzugefuegt, geloescht und direkt in der Vorschau geprueft werden.": "Entries can be added, deleted, and checked directly in the preview.",
    "Weitere Station hinzufuegen": "Add another role",
    "Abschluss, Zeitraum und Ort kompakt erfassen.": "Enter qualification, period, and location compactly.",
    "Schule hinzufuegen": "Add school",
    "Aus- und Weiterbildung": "Training and further education",
    "Kurse, Zertifikate und Weiterbildungen strukturiert darstellen.": "Present courses, certificates, and training in a structured way.",
    "Weiterbildung hinzufuegen": "Add training",
    "Fachliche und digitale Kompetenzen.": "Professional and digital skills.",
    "Kenntnis hinzufuegen": "Add skill",
    "Hobbys": "Hobbies",
    "Optional, kurz und professionell.": "Optional, short, and professional.",
    "Hobby hinzufuegen": "Add hobby",
    "Datum und Signatur fuer den CV.": "Date and signature for the CV.",
    "Datum": "Date",
    "Zuerich, 18.06.2026": "Zurich, 18.06.2026",
    "Unterschrift": "Signature",
    "Live Vorschau": "Live preview",
    "Live-Vorschau": "Live preview",
    "Aktualisiert sich automatisch beim Tippen.": "Updates automatically while typing.",
    "Aktiv": "Active",
    "VORSCHAU": "PREVIEW",
    "Interessen": "Interests",
    "Lebenslauf": "CV",
    "Strukturierte, zuverlaessige Fachkraft mit Erfahrung in Organisation, Kommunikation und serviceorientierter Zusammenarbeit.": "Structured, reliable professional with experience in organization, communication, and service-oriented collaboration.",
    "Dokumentstil": "Document style",
    "Stil direkt testen": "Test style directly",
    "Der Stil veraendert sich direkt in der Vorschau.": "The style changes directly in the preview.",
    "Empfohlen": "Recommended",
    "Kontrast": "Contrast",
    "Dynamisch": "Dynamic",
    "Editorial": "Editorial",
    "Premium": "Premium",
    "Business": "Business",
    "Modern": "Modern",
    "Minimal": "Minimal",
    "Elegant": "Elegant",
    "Ruhig": "Calm",
    "Klassisch": "Classic",
    "Warm Soft": "Warm soft",
    "Klar": "Clear",
    "Warm": "Warm",
    "PDF ohne Wasserzeichen vorbereiten": "Prepare PDF without watermark",
    "Pruefe zuerst die Vorschau. Der Preis erscheint erst, wenn die PDF ohne Wasserzeichen angefordert wird.": "Review the preview first. The price appears only when the PDF without watermark is requested.",
    "Vorschau schliessen": "Close preview",
    "Vollbild-Vorschau": "Full-screen preview",
    "Kostenlose Vorschau": "Free preview",
    "Die Vorschau zeigt den Lebenslauf mit Wasserzeichen. Nach dem Freischalten wird die PDF ohne Wasserzeichen heruntergeladen.": "The preview shows the CV with a watermark. After unlocking, the PDF is downloaded without a watermark.",
    "Stil, Foto und Text vorher pruefen": "Check style, photo, and text first",
    "Kein Account erforderlich": "No account required",
    "Download ohne Wasserzeichen nach Zahlung": "Download without watermark after payment",
    "PDF ohne Wasserzeichen herunterladen": "Download PDF without watermark",
    "Zurueck bearbeiten": "Back to editing",
    "PDF ohne Wasserzeichen": "PDF without watermark",
    "Zahlungsfenster schliessen": "Close payment window",
    "Finale PDF freischalten": "Unlock final PDF",
    "Ihre Vorschau ist kostenlos. Fuer die druckfertige PDF-Version ohne Wasserzeichen koennen Sie das Dokument einmalig freischalten.": "Your preview is free. For the print-ready PDF without watermark, you can unlock the document once.",
    "CHF Â· einmalig": "CHF - one time",
    "CHF Ã‚Â· einmalig": "CHF - one time",
    "Sofortiger Download nach Zahlung": "Instant download after payment",
    "Sichere Zahlung ueber Stripe": "Secure payment via Stripe",
    "Keine Kartendaten auf dieser Website gespeichert": "No card details stored on this website",
    "Weiter zur sicheren Zahlung": "Continue to secure payment",
    "In der finalen Version werden Sie zu Stripe Checkout weitergeleitet und danach automatisch zum Download zurueckgefuehrt.": "In the final step you will be redirected to Stripe Checkout and then automatically returned to the download.",
    "Position": "Position",
    "Unternehmen / Ort": "Company / location",
    "Von": "From",
    "Bis": "To",
    "Ort / Land optional": "City / country optional",
    "Taetigkeit / Aufgaben": "Activities / responsibilities",
    "Schule": "School",
    "Ort / Land": "City / country",
    "Titel": "Title",
    "Ausbildungsstaette / Ort": "Training provider / location",
    "Inhalte": "Content",
    "Kenntnis": "Skill",
    "Hobby": "Hobby",
    "Eintrag": "Entry",
    "Eintrag ein- oder ausklappen": "Expand or collapse entry",
    "Eintrag entfernen": "Remove entry",
    "Jetzt ergaenzen": "Add now",
    "MS Office": "MS Office",
    "Organisation": "Organization",
    "Kommunikation": "Communication",
    "Lesen": "Reading",
    "Sport": "Sports",
    "Bereit fuer KI-Foto": "Ready for AI photo",
    "Ausgewaehltes Bewerbungsfoto": "Selected application photo",
    "KI Foto Variante {count} auswaehlen": "Select AI photo variant {count}",
    "KI Foto Variante {count}": "AI photo variant {count}",
    "Variante": "Variant",
    "Foto fuer die Vorschau ausgewaehlt": "Photo selected for preview",
    "Foto wird vorbereitet...": "Preparing photo...",
    "3 professionelle Varianten verfuegbar": "3 professional variants available",
    "Option bereit zur Auswahl": "Option ready to select",
    "Weitere Option generieren": "Generate another option",
    "Generiere Foto...": "Generating photo...",
    "Kein Bild erhalten": "No image received",
    "Generierung fehlgeschlagen": "Generation failed",
    "Upload fehlgeschlagen": "Upload failed",
    "Limit erreicht": "Limit reached",
    "Foto fehlt": "Photo missing",
    "KI-Foto bereit": "AI photo ready",
    "Das Foto konnte nicht gelesen werden. Bitte versuchen Sie eine andere Datei.": "The photo could not be read. Please try another file.",
    "Sie haben bereits 3 KI-Bilder generiert.": "You have already generated 3 AI images.",
    "Bitte zuerst ein Foto hochladen.": "Please upload a photo first.",
    "Professionelle Foto-Option wurde erstellt.": "Professional photo option was created.",
    "Der Server hat kein Bild zurueckgegeben.": "The server did not return an image.",
    "Das Foto konnte nicht generiert werden. Bitte versuchen Sie es erneut.": "The photo could not be generated. Please try again.",
    "Zwischengespeichert": "Saved locally",
    "Ihre Eingaben wurden lokal gespeichert.": "Your entries have been saved locally.",
    "Erfolg": "Success",
    "Hinweis": "Info",
    "Achtung": "Warning",
    "Fehler": "Error",
    "Meldung schliessen": "Close message",
  },
};

let currentLanguage = "de";

const SIMPLE_FIELDS = ["name", "headline", "adresse", "kontakt", "profil", "datum", "unterschrift"];
const SECTION_CONFIG = {
  beruf: [
    { className: "beruf-position", label: "Position" },
    { className: "beruf-ort", label: "Unternehmen / Ort" },
    { className: "beruf-von", label: "Von" },
    { className: "beruf-bis", label: "Bis" },
    { className: "beruf-firma", label: "Ort / Land optional" },
    { className: "beruf-aufgaben", label: "Taetigkeit / Aufgaben", type: "textarea" },
  ],
  schulbildung: [
    { className: "schule", label: "Schule" },
    { className: "schule-ort", label: "Ort / Land" },
    { className: "schule-von", label: "Von" },
    { className: "schule-bis", label: "Bis" },
    { className: "schule-abschluss", label: "Abschluss" },
  ],
  weiterbildung: [
    { className: "weiterbildung-titel", label: "Titel" },
    { className: "weiterbildung-ort", label: "Ausbildungsstaette / Ort" },
    { className: "weiterbildung-von", label: "Von" },
    { className: "weiterbildung-bis", label: "Bis" },
    { className: "weiterbildung-inhalt", label: "Inhalte", type: "textarea" },
  ],
  kenntnisse: [{ className: "kenntnisse", label: "Kenntnis" }],
  hobbys: [{ className: "hobbys", label: "Hobby" }],
};

function getStoredData() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function setStoredData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function normalizeLanguage(language) {
  return language === "en" ? "en" : "de";
}

function getTranslationKey(value) {
  const cleanValue = String(value || "").trim();
  if (!cleanValue) return null;
  if (Object.prototype.hasOwnProperty.call(UI_TRANSLATIONS.de, cleanValue)) {
    return cleanValue;
  }
  for (const dictionary of Object.values(UI_TRANSLATIONS)) {
    const entry = Object.entries(dictionary).find(([, translated]) => translated === cleanValue);
    if (entry) {
      return entry[0];
    }
  }
  return null;
}

function t(key, replacements = {}) {
  const dictionary = UI_TRANSLATIONS[currentLanguage] || UI_TRANSLATIONS.de;
  const fallback = UI_TRANSLATIONS.de[key] || key;
  let value = dictionary[key] || fallback;
  Object.entries(replacements).forEach(([name, replacement]) => {
    value = value.replaceAll(`{${name}}`, replacement);
  });
  return value;
}

function translateValue(value, replacements = {}) {
  const key = getTranslationKey(value);
  if (!key) return value;
  return t(key, replacements);
}

function translateTextNodes(dictionary) {
  if (!document.body) return;
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const nodes = [];

  while (walker.nextNode()) {
    nodes.push(walker.currentNode);
  }

  nodes.forEach((node) => {
    const cleanValue = node.nodeValue.trim();
    const key = getTranslationKey(cleanValue);
    if (!key || !dictionary[key]) return;
    node.nodeValue = node.nodeValue.replace(cleanValue, dictionary[key]);
  });
}

function translateAttributes(dictionary) {
  ["placeholder", "aria-label", "alt", "title"].forEach((attribute) => {
    document.querySelectorAll(`[${attribute}]`).forEach((element) => {
      const key = getTranslationKey(element.getAttribute(attribute));
      if (key && dictionary[key]) {
        element.setAttribute(attribute, dictionary[key]);
      }
    });
  });
}

function applyLanguage(language = localStorage.getItem(LANGUAGE_STORAGE_KEY) || "de") {
  const normalized = normalizeLanguage(language);
  const dictionary = UI_TRANSLATIONS[normalized] || UI_TRANSLATIONS.de;
  currentLanguage = normalized;
  document.documentElement.lang = normalized;
  document.title = t("document.title");
  localStorage.setItem(LANGUAGE_STORAGE_KEY, normalized);

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const value = dictionary[element.dataset.i18n];
    if (value) {
      element.textContent = value;
    }
  });

  document.querySelectorAll("[data-lang]").forEach((button) => {
    const active = button.dataset.lang === normalized;
    button.classList.toggle("muted", !active);
    button.setAttribute("aria-pressed", String(active));
  });

  translateTextNodes(dictionary);
  translateAttributes(dictionary);
  updateCounter();
}

function installLanguageSwitch() {
  document.addEventListener("vitagen:languagechange", (event) => {
    applyLanguage(event.detail?.language);
  });

  if (!window.VitaGenNavbar) {
    document.querySelectorAll("[data-lang]").forEach((button) => {
      button.addEventListener("click", () => applyLanguage(button.dataset.lang));
    });
  }

  applyLanguage(window.VitaGenNavbar?.getLanguage?.() || localStorage.getItem(LANGUAGE_STORAGE_KEY) || "de");
}

function normalizeDocumentStyle(styleName = DEFAULT_STYLE) {
  const cleanName = String(styleName || DEFAULT_STYLE).trim().split(/[\\/]/).pop();
  return DOCUMENT_STYLES.includes(cleanName) ? cleanName : DEFAULT_STYLE;
}

function setTextWithBreaks(element, value, fallback = "") {
  if (!element) return;
  const text = String(value || fallback || "").trim();
  element.textContent = "";
  text.split(/\r?\n/).forEach((line, index) => {
    if (index > 0) element.appendChild(document.createElement("br"));
    element.appendChild(document.createTextNode(line));
  });
}

function getEntryTitle(section, data = {}) {
  if (section === "beruf") {
    return data["beruf-position"] || data["beruf-ort"] || translateValue("Berufserfahrung");
  }
  if (section === "schulbildung") {
    return data.schule || data["schule-abschluss"] || translateValue("Schulbildung");
  }
  if (section === "weiterbildung") {
    return data["weiterbildung-titel"] || translateValue("Weiterbildung");
  }
  if (section === "kenntnisse") {
    return data.kenntnisse || translateValue("Kenntnis");
  }
  if (section === "hobbys") {
    return data.hobbys || translateValue("Hobby");
  }
  return translateValue("Eintrag");
}

function createEntry(section, data = {}) {
  const container = document.querySelector(`.${section}-entries`);
  const fields = SECTION_CONFIG[section];
  if (!container || !fields) return null;

  const entry = document.createElement("div");
  entry.className = "entry";
  entry.dataset.section = section;

  const header = document.createElement("div");
  header.className = "entry-header";

  const title = document.createElement("span");
  title.className = "entry-title";
  title.textContent = getEntryTitle(section, data);

  const controls = document.createElement("div");
  controls.className = "entry-controls";

  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "toggle";
  toggle.setAttribute("aria-label", translateValue("Eintrag ein- oder ausklappen"));
  toggle.textContent = "v";

  const remove = document.createElement("button");
  remove.type = "button";
  remove.className = "delete";
  remove.setAttribute("aria-label", translateValue("Eintrag entfernen"));
  remove.textContent = "x";

  controls.append(toggle, remove);
  header.append(title, controls);

  const body = document.createElement("div");
  body.className = "entry-body";

  fields.forEach((field) => {
    const label = document.createElement("label");
    label.textContent = translateValue(field.label);

    const input = document.createElement(field.type === "textarea" ? "textarea" : "input");
    input.className = field.className;
    if (field.type !== "textarea") input.type = "text";
    input.value = data[field.className] || "";
    label.appendChild(input);
    body.appendChild(label);
  });

  toggle.addEventListener("click", () => body.classList.toggle("hidden"));
  remove.addEventListener("click", () => {
    entry.remove();
    saveFormData();
    syncLivePreview();
  });

  entry.addEventListener("input", () => {
    title.textContent = getEntryTitle(section, collectEntryData(entry));
    saveFormData();
    syncLivePreview();
  });

  entry.append(header, body);
  container.appendChild(entry);
  return entry;
}

function collectEntryData(entry) {
  const data = {};
  entry.querySelectorAll("input, textarea").forEach((input) => {
    data[input.className] = input.value.trim();
  });
  return data;
}

function getEntriesData(section) {
  const container = document.querySelector(`.${section}-entries`);
  if (!container) return [];

  return Array.from(container.querySelectorAll(".entry"))
    .map(collectEntryData)
    .filter((entry) => Object.values(entry).some((value) => value));
}

function ensureEntry(section) {
  const container = document.querySelector(`.${section}-entries`);
  if (container && !container.querySelector(".entry")) {
    createEntry(section);
  }
}

function saveFormData() {
  const existing = getStoredData();
  const data = {};

  SIMPLE_FIELDS.forEach((id) => {
    data[id] = document.getElementById(id)?.value || "";
  });

  if (existing.foto) {
    data.foto = existing.foto;
  }

  Object.keys(SECTION_CONFIG).forEach((section) => {
    data[section] = getEntriesData(section);
  });

  setStoredData(data);
  return data;
}

window.saveAllFields = saveFormData;

function applyDocumentStyle(styleName = DEFAULT_STYLE) {
  const normalized = normalizeDocumentStyle(styleName);
  const themeLink = document.getElementById("theme-style");
  const preview = document.getElementById("preview");

  if (themeLink) {
    themeLink.href = `styles/${normalized}`;
  }
  if (preview) {
    preview.dataset.style = normalized;
  }

  localStorage.setItem(STYLE_STORAGE_KEY, normalized);
  document.querySelectorAll(".style-chip").forEach((button) => {
    const active = button.dataset.style === normalized;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });

  if (document.getElementById("previewModal")?.classList.contains("open")) {
    refreshModalPreview();
  }
  pulseLivePreview();
}

function pulseLivePreview() {
  const preview = document.getElementById("preview");
  if (!preview) return;
  preview.classList.remove("updating");
  window.requestAnimationFrame(() => preview.classList.add("updating"));
}

function renderTimeline(containerId, entries, formatter, emptyText) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = "";

  const usableEntries = Array.isArray(entries) ? entries : [];
  if (usableEntries.length === 0) {
    const item = document.createElement("div");
    item.className = "timeline-item";
    const strong = document.createElement("strong");
    strong.textContent = translateValue(emptyText);
    const span = document.createElement("span");
    span.textContent = translateValue("Jetzt ergaenzen");
    item.append(strong, span);
    container.appendChild(item);
    return;
  }

  usableEntries.forEach((entry) => {
    const item = document.createElement("div");
    item.className = "timeline-item";
    const view = formatter(entry);
    const strong = document.createElement("strong");
    strong.textContent = view.title;
    const meta = document.createElement("span");
    meta.textContent = view.meta;
    item.append(strong, meta);
    if (view.body) {
      const body = document.createElement("p");
      body.textContent = view.body;
      item.appendChild(body);
    }
    container.appendChild(item);
  });
}

function renderPills(containerId, entries, key, emptyItems) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = "";

  const values = (Array.isArray(entries) ? entries : [])
    .map((entry) => String(entry[key] || "").trim())
    .filter(Boolean);
  const finalValues = values.length ? values : emptyItems;

  finalValues.forEach((value) => {
    const pill = document.createElement("span");
    pill.textContent = translateValue(value);
    container.appendChild(pill);
  });
}

function syncLivePreview({ pulse = true } = {}) {
  const data = saveFormData();
  setTextWithBreaks(document.getElementById("pv-name"), data.name, t("Max Muster"));
  setTextWithBreaks(document.getElementById("pv-headline"), data.headline, t("Kaufmaennischer Mitarbeiter"));
  setTextWithBreaks(document.getElementById("pv-kontakt"), data.kontakt, "max@example.com\n+41 79 123 45 67");
  setTextWithBreaks(document.getElementById("pv-adresse"), data.adresse, `${t("Bahnhofstrasse 12")}\n${t("8001 Zuerich")}`);
  setTextWithBreaks(
    document.getElementById("pv-profil"),
    data.profil,
    t("Strukturierte, zuverlaessige Fachkraft mit Erfahrung in Organisation, Kommunikation und serviceorientierter Zusammenarbeit.")
  );
  setTextWithBreaks(document.getElementById("pv-datum"), data.datum, t("Zuerich, 18.06.2026"));
  setTextWithBreaks(document.getElementById("pv-unterschrift"), data.unterschrift || data.name, t("Max Muster"));

  const photo = document.getElementById("pv-foto");
  if (photo) {
    if (data.foto) {
      photo.src = data.foto;
      photo.style.display = "block";
    } else {
      photo.removeAttribute("src");
      photo.style.display = "none";
    }
  }

  renderTimeline(
    "pv-beruf",
    data.beruf,
    (entry) => ({
      title: entry["beruf-position"] || translateValue("Position"),
      meta: [entry["beruf-ort"], [entry["beruf-von"], entry["beruf-bis"]].filter(Boolean).join(" - ")].filter(Boolean).join(" | "),
      body: entry["beruf-aufgaben"] || entry["beruf-firma"] || "",
    }),
    translateValue("Berufserfahrung")
  );
  renderTimeline(
    "pv-schulbildung",
    data.schulbildung,
    (entry) => ({
      title: entry["schule-abschluss"] || entry.schule || translateValue("Schulbildung"),
      meta: [entry.schule, entry["schule-ort"], [entry["schule-von"], entry["schule-bis"]].filter(Boolean).join(" - ")].filter(Boolean).join(" | "),
      body: "",
    }),
    translateValue("Schulbildung")
  );
  renderTimeline(
    "pv-weiterbildung",
    data.weiterbildung,
    (entry) => ({
      title: entry["weiterbildung-titel"] || translateValue("Weiterbildung"),
      meta: [entry["weiterbildung-ort"], [entry["weiterbildung-von"], entry["weiterbildung-bis"]].filter(Boolean).join(" - ")].filter(Boolean).join(" | "),
      body: entry["weiterbildung-inhalt"] || "",
    }),
    translateValue("Weiterbildung")
  );
  renderPills("pv-kenntnisse", data.kenntnisse, "kenntnisse", ["MS Office", "Organisation", "Kommunikation"]);
  renderPills("pv-hobbys", data.hobbys, "hobbys", ["Lesen", "Sport"]);

  if (pulse) {
    pulseLivePreview();
  }
}

function refreshModalPreview() {
  const host = document.getElementById("modalPreviewHost");
  const preview = document.getElementById("preview");
  if (!host || !preview) return;
  host.innerHTML = "";
  const clone = preview.cloneNode(true);
  clone.id = "preview-modal-doc";
  host.appendChild(clone);
}

function openPreviewModal() {
  syncLivePreview({ pulse: false });
  refreshModalPreview();
  const modal = document.getElementById("previewModal");
  if (modal) {
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
  }
}

function closePreviewModal() {
  const modal = document.getElementById("previewModal");
  if (modal) {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
  }
}

function getToastRegion() {
  let region = document.getElementById("toast-region");
  if (!region) {
    region = document.createElement("div");
    region.id = "toast-region";
    region.className = "toast-region";
    region.setAttribute("aria-live", "polite");
    region.setAttribute("aria-atomic", "true");
    document.body.appendChild(region);
  }
  return region;
}

function showToast(message, type = "info", title) {
  const titles = {
    success: t("Erfolg"),
    error: t("Fehler"),
    warning: t("Achtung"),
    info: t("Hinweis"),
  };
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.setAttribute("role", type === "error" ? "alert" : "status");

  const mark = document.createElement("span");
  mark.className = "toast-mark";
  mark.setAttribute("aria-hidden", "true");

  const content = document.createElement("div");
  const heading = document.createElement("p");
  heading.className = "toast-title";
  heading.textContent = title ? translateValue(title) : titles[type] || titles.info;

  const body = document.createElement("p");
  body.className = "toast-message";
  body.textContent = translateValue(message);

  const close = document.createElement("button");
  close.type = "button";
  close.className = "toast-close";
  close.setAttribute("aria-label", translateValue("Meldung schliessen"));
  close.textContent = "x";

  content.append(heading, body);
  toast.append(mark, content, close);

  const removeToast = () => {
    toast.classList.remove("show");
    window.setTimeout(() => toast.remove(), 220);
  };

  close.addEventListener("click", removeToast);
  getToastRegion().appendChild(toast);
  window.setTimeout(() => toast.classList.add("show"), 20);
  window.setTimeout(removeToast, type === "error" ? 5200 : 3800);
}

function updateCounter() {
  const counter = document.getElementById("counter");
  if (counter) {
    counter.innerText = t("KI-Funktion - {count} / {max} generiert", {
      count: aiImageCount,
      max: MAX_IMAGES,
    });
  }
}

function setPhotoStatus(text) {
  const status = document.getElementById("photo-status");
  if (status) {
    status.textContent = translateValue(text);
  }
}

function setPhotoLoading(isLoading) {
  const card = document.getElementById("foto-section");
  const loader = document.getElementById("loader");
  const aiBtn = document.getElementById("aiFotoBtn");
  card?.classList.toggle("is-loading", isLoading);
  if (loader) loader.style.display = isLoading ? "grid" : "none";
  if (aiBtn) aiBtn.setAttribute("aria-busy", String(isLoading));
}

function renderOptionPlaceholders() {
  const container = document.getElementById("foto-auswahl");
  if (!container) return;
  container.innerHTML = "";
  for (let index = 0; index < MAX_IMAGES; index++) {
    const placeholder = document.createElement("div");
    placeholder.className = "photo-option-placeholder";
    const avatar = document.createElement("span");
    avatar.className = "empty-avatar";
    avatar.setAttribute("aria-hidden", "true");
    const shoulders = document.createElement("span");
    shoulders.className = "empty-shoulders";
    shoulders.setAttribute("aria-hidden", "true");
    const label = document.createElement("span");
    label.className = "empty-caption";
    label.textContent = translateValue("Bereit fuer KI-Foto");
    placeholder.append(avatar, shoulders, label);
    container.appendChild(placeholder);
  }
}

function clearGeneratedPlaceholders() {
  const container = document.getElementById("foto-auswahl");
  if (container?.querySelector(".photo-option-placeholder")) {
    container.innerHTML = "";
  }
}

function renderUploadPreview(src, selected = false) {
  const container = document.getElementById("foto-container");
  if (!container) return null;
  const shell = container.closest(".photo-upload-shell");
  const changeButton = document.getElementById("changePhotoBtn");

  container.innerHTML = "";
  container.classList.toggle("selected", selected);
  shell?.classList.add("has-photo");
  if (changeButton) changeButton.hidden = false;

  const img = document.createElement("img");
  img.src = src;
  img.alt = translateValue("Ausgewaehltes Bewerbungsfoto");
  img.addEventListener("click", () => selectImage(img));
  container.appendChild(img);
  return img;
}

function createGeneratedOption(src) {
  const container = document.getElementById("foto-auswahl");
  if (!container) return;
  clearGeneratedPlaceholders();

  const option = document.createElement("button");
  option.type = "button";
  option.className = "generated-option";
  option.setAttribute("aria-label", t("KI Foto Variante {count} auswaehlen", { count: aiImageCount }));

  const img = document.createElement("img");
  img.src = src;
  img.alt = t("KI Foto Variante {count}", { count: aiImageCount });

  const label = document.createElement("span");
  label.textContent = translateValue("Variante");

  option.append(img, label);
  option.addEventListener("click", () => selectImage(img));
  container.appendChild(option);
}

function selectImage(element) {
  if (!element?.src) return;
  document.querySelectorAll("#foto-container, .generated-option").forEach((item) => item.classList.remove("selected"));

  const generatedOption = element.closest(".generated-option");
  if (generatedOption) {
    generatedOption.classList.add("selected");
  } else {
    document.getElementById("foto-container")?.classList.add("selected");
  }

  const data = getStoredData();
  data.foto = element.src;
  setStoredData(data);
  setPhotoStatus("Foto fuer die Vorschau ausgewaehlt");
  syncLivePreview();
}

window.selectImage = selectImage;

function loadFormData() {
  const saved = getStoredData();
  SIMPLE_FIELDS.forEach((id) => {
    const element = document.getElementById(id);
    if (element && saved[id]) {
      element.value = saved[id];
    }
  });

  Object.keys(SECTION_CONFIG).forEach((section) => {
    const container = document.querySelector(`.${section}-entries`);
    if (!container) return;
    container.innerHTML = "";
    const entries = Array.isArray(saved[section]) && saved[section].length ? saved[section] : [{}];
    entries.forEach((entry) => createEntry(section, entry));
  });

  renderOptionPlaceholders();
  updateCounter();

  if (saved.foto) {
    renderUploadPreview(saved.foto, true);
    setPhotoStatus("Foto fuer die Vorschau ausgewaehlt");
  }

  applyDocumentStyle(localStorage.getItem(STYLE_STORAGE_KEY) || DEFAULT_STYLE);
  syncLivePreview({ pulse: false });
}

function installFormListeners() {
  const form = document.getElementById("vitagenForm");
  form?.addEventListener("submit", (event) => event.preventDefault());
  form?.addEventListener("input", () => {
    saveFormData();
    syncLivePreview();
  });

  document.querySelectorAll(".add-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const entry = createEntry(button.dataset.section);
      entry?.querySelector("input, textarea")?.focus();
      saveFormData();
      syncLivePreview();
    });
  });

  document.querySelectorAll(".style-chip").forEach((button) => {
    button.addEventListener("click", () => applyDocumentStyle(button.dataset.style));
  });

  document.getElementById("saveBtn")?.addEventListener("click", () => {
    saveFormData();
    syncLivePreview();
    showToast("Ihre Eingaben wurden lokal gespeichert.", "success", "Zwischengespeichert");
  });

  document.getElementById("previewBtn")?.addEventListener("click", openPreviewModal);
  document.getElementById("closePreviewModal")?.addEventListener("click", closePreviewModal);
  document.querySelectorAll("[data-close-preview]").forEach((button) => {
    button.addEventListener("click", closePreviewModal);
  });
  document.getElementById("previewModal")?.addEventListener("click", (event) => {
    if (event.target?.id === "previewModal") closePreviewModal();
  });
  document.querySelectorAll("[data-trigger-buy]").forEach((button) => {
    button.addEventListener("click", (event) => {
      if (event.defaultPrevented && window.VitaGenPayment?.open) return;
      event.preventDefault();
      if (window.VitaGenPayment?.open) {
        window.VitaGenPayment.open();
      } else {
        document.getElementById("buyBtn")?.click();
      }
    });
  });
}

function installPhotoListeners() {
  const fileInput = document.getElementById("foto-upload");
  const changePhotoBtn = document.getElementById("changePhotoBtn");
  const aiBtn = document.getElementById("aiFotoBtn");

  fileInput?.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      aiImageCount = 0;
      updateCounter();
      renderOptionPlaceholders();
      setPhotoStatus("Noch nicht generiert");
      const img = renderUploadPreview(loadEvent.target.result, true);
      if (img) selectImage(img);
    };
    reader.onerror = () => {
      showToast("Das Foto konnte nicht gelesen werden. Bitte versuchen Sie eine andere Datei.", "error", "Upload fehlgeschlagen");
    };
    reader.readAsDataURL(file);
  });

  changePhotoBtn?.addEventListener("click", () => fileInput?.click());

  aiBtn?.addEventListener("click", async () => {
    if (aiImageCount >= MAX_IMAGES) {
      showToast("Sie haben bereits 3 KI-Bilder generiert.", "info", "Limit erreicht");
      return;
    }

    const file = fileInput?.files[0];
    if (!file) {
      showToast("Bitte zuerst ein Foto hochladen.", "warning", "Foto fehlt");
      return;
    }

    const originalButtonText = aiBtn.innerText;
    aiBtn.disabled = true;
    aiBtn.innerText = translateValue("Generiere Foto...");
    setPhotoStatus("Foto wird vorbereitet...");
    setPhotoLoading(true);

    const formData = new FormData();
    formData.append("photo", file);

    try {
      const response = await fetch(`${AI_API_BASE_URL}/generate-ai-photo`, {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        throw new Error(`Photo generation failed with status ${response.status}`);
      }
      const result = await response.json();
      if (result.aiFoto) {
        aiImageCount++;
        updateCounter();
        createGeneratedOption(result.aiFoto);
        setPhotoStatus(aiImageCount === MAX_IMAGES ? "3 professionelle Varianten verfuegbar" : "Option bereit zur Auswahl");
        aiBtn.innerText = aiImageCount > 0 ? translateValue("Weitere Option generieren") : originalButtonText;
        showToast("Professionelle Foto-Option wurde erstellt.", "success", "KI-Foto bereit");
      } else {
        setPhotoStatus("Kein Bild erhalten");
        showToast("Der Server hat kein Bild zurueckgegeben.", "error", "Kein Bild erhalten");
      }
    } catch (error) {
      console.error("KI Foto Fehler:", error);
      setPhotoStatus("Generierung fehlgeschlagen");
      showToast("Das Foto konnte nicht generiert werden. Bitte versuchen Sie es erneut.", "error", "Generierung fehlgeschlagen");
    } finally {
      setPhotoLoading(false);
      aiBtn.disabled = false;
      aiBtn.innerText = aiImageCount > 0 ? translateValue("Weitere Option generieren") : originalButtonText;
    }
  });
}

window.addEventListener("DOMContentLoaded", () => {
  installLanguageSwitch();
  loadFormData();
  Object.keys(SECTION_CONFIG).forEach(ensureEntry);
  installFormListeners();
  installPhotoListeners();
  syncLivePreview({ pulse: false });
});
