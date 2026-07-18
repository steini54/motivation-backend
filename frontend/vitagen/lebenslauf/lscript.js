const AI_API_BASE_URL = "https://motivation-backend-production-2800.up.railway.app";

let aiImageCount = 0;
let selectedPhotoIsAi = false;
const MAX_IMAGES = 3;
const STORAGE_KEY = "vitagen_lebenslauf";
const STYLE_STORAGE_KEY = "vitagen_lebenslauf_style";
const TEMPLATE_STORAGE_KEY = "vitagen_lebenslauf_template";
const LANGUAGE_STORAGE_KEY = "vitagen_language";
const DEFAULT_STYLE = "swiss-line.css";
const EXISTING_TEMPLATE_STYLES = [
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
const CV_TEMPLATES = [
  {
    id: "existing",
    tier: "premium",
    name: "Modern Split",
    description: "Modern split-column layout",
    defaultStyle: DEFAULT_STYLE,
    styles: EXISTING_TEMPLATE_STYLES,
  },
  {
    id: "simple-free",
    tier: "free",
    name: "Essential Column",
    description: "Simple two-column resume",
    defaultStyle: "simple-free-blue.css",
    styles: ["simple-free-blue.css", "simple-free-gray.css"],
  },
  {
    id: "aqua-arc",
    tier: "premium",
    name: "Aqua Arc",
    description: "Clean teal two-column CV",
    defaultStyle: "aqua-arc-default.css",
    styles: ["aqua-arc-default.css", "aqua-arc-soft.css", "aqua-arc-contrast.css", "aqua-arc-emerald.css", "aqua-arc-sunset.css", "aqua-arc-amethyst.css"],
  },
  {
    id: "corporate-axis",
    tier: "premium",
    name: "Corporate Axis",
    description: "Corporate geometric layout",
    defaultStyle: "corporate-axis-default.css",
    styles: ["corporate-axis-default.css", "corporate-axis-steel.css", "corporate-axis-navy.css", "corporate-axis-burgundy.css", "corporate-axis-forest.css", "corporate-axis-monochrome.css"],
  },
  {
    id: "editorial-mono",
    tier: "premium",
    name: "Editorial Mono",
    description: "Editorial monochrome layout",
    defaultStyle: "editorial-mono-default.css",
    styles: ["editorial-mono-default.css", "editorial-mono-warm.css", "editorial-mono-classic.css", "editorial-mono-sepia.css", "editorial-mono-mint.css", "editorial-mono-rose.css"],
  },
];
const DOCUMENT_STYLES = CV_TEMPLATES.flatMap((template) => template.styles);
const STYLE_META = {
  "simple-free-blue.css": { name: "Essential Blue", tone: "Free", thumb: "simple-free-blue" },
  "simple-free-gray.css": { name: "Essential Graphite", tone: "Free", thumb: "simple-free-gray" },
  "swiss-line.css": { name: "Swiss Line", tone: "Empfohlen", thumb: "swiss" },
  "charcoal-frame.css": { name: "Charcoal Frame", tone: "Kontrast", thumb: "charcoal" },
  "cobalt-ribbon.css": { name: "Cobalt Ribbon", tone: "Dynamisch", thumb: "cobalt" },
  "editorial-azure.css": { name: "Editorial Azure", tone: "Editorial", thumb: "azure" },
  "executive-ink.css": { name: "Executive Ink", tone: "Premium", thumb: "executive" },
  "graphite-pro.css": { name: "Graphite Pro", tone: "Business", thumb: "graphite" },
  "midnight-column.css": { name: "Midnight Column", tone: "Modern", thumb: "midnight" },
  "monograph.css": { name: "Monograph", tone: "Minimal", thumb: "monograph" },
  "navy-wave.css": { name: "Navy Wave", tone: "Elegant", thumb: "navy" },
  "nordic-panel.css": { name: "Nordic Panel", tone: "Ruhig", thumb: "nordic" },
  "pearl-classic.css": { name: "Pearl Classic", tone: "Klassisch", thumb: "pearl" },
  "soft-sand.css": { name: "Soft Sand", tone: "Warm Soft", thumb: "sand" },
  "teal-balance.css": { name: "Teal Balance", tone: "Klar", thumb: "teal" },
  "terracotta-arch.css": { name: "Terracotta Arch", tone: "Warm", thumb: "terracotta" },
  "aqua-arc-default.css": { name: "Aqua Arc", tone: "Default", thumb: "aqua" },
  "aqua-arc-soft.css": { name: "Aqua Arc Soft", tone: "Soft", thumb: "aqua-soft" },
  "aqua-arc-contrast.css": { name: "Aqua Arc Contrast", tone: "Contrast", thumb: "aqua-contrast" },
  "aqua-arc-emerald.css": { name: "Aqua Arc Emerald", tone: "Emerald", thumb: "aqua-emerald" },
  "aqua-arc-sunset.css": { name: "Aqua Arc Sunset", tone: "Sunset", thumb: "aqua-sunset" },
  "aqua-arc-amethyst.css": { name: "Aqua Arc Amethyst", tone: "Amethyst", thumb: "aqua-amethyst" },
  "corporate-axis-default.css": { name: "Corporate Axis", tone: "Default", thumb: "axis" },
  "corporate-axis-steel.css": { name: "Corporate Axis Steel", tone: "Steel", thumb: "axis-steel" },
  "corporate-axis-navy.css": { name: "Corporate Axis Navy", tone: "Navy", thumb: "axis-navy" },
  "corporate-axis-burgundy.css": { name: "Corporate Axis Burgundy", tone: "Burgundy", thumb: "axis-burgundy" },
  "corporate-axis-forest.css": { name: "Corporate Axis Forest", tone: "Forest", thumb: "axis-forest" },
  "corporate-axis-monochrome.css": { name: "Corporate Axis Monochrome", tone: "Monochrome", thumb: "axis-monochrome" },
  "editorial-mono-default.css": { name: "Editorial Mono", tone: "Default", thumb: "mono" },
  "editorial-mono-warm.css": { name: "Editorial Mono Warm", tone: "Warm", thumb: "mono-warm" },
  "editorial-mono-classic.css": { name: "Editorial Mono Classic", tone: "Classic", thumb: "mono-classic" },
  "editorial-mono-sepia.css": { name: "Editorial Mono Sepia", tone: "Sepia", thumb: "mono-sepia" },
  "editorial-mono-mint.css": { name: "Editorial Mono Mint", tone: "Mint", thumb: "mono-mint" },
  "editorial-mono-rose.css": { name: "Editorial Mono Rose", tone: "Rose", thumb: "mono-rose" },
};
let resolveInitialPhotoReady;
let pendingPhotoMigration = Promise.resolve();
window.VitaGenPhotoReady = new Promise((resolve) => {
  resolveInitialPhotoReady = resolve;
});
const UI_TRANSLATIONS = {
  de: {
    "document.title": "VitaGen - Lebenslauf",
    "cv.eyebrow": "CV Generator",
    "cv.title": "Lebenslauf erstellen",
    "cv.copy": "Strukturierter Editor fuer professionelle europaeische CVs mit Live-Vorschau, Stilwahl und KI-Bewerbungsfoto.",
    "Produktvorteile": "Produktvorteile",
    "Schweiz & Europa": "Schweiz & Europa",
    "KI-Foto": "KI-Foto",
    "KI-Text": "KI-Text",
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
    "Foto andern": "Foto aendern",
    "Foto aendern": "Foto aendern",
    "Generierte Optionen": "Generierte Optionen",
    "Noch nicht generiert": "Noch nicht generiert",
    "Professionelles Foto generieren": "Professionelles Foto generieren",
    "Nach der Auswahl erscheint das Foto direkt in der Live-Vorschau.": "Nach der Auswahl erscheint das Foto direkt in der Live-Vorschau.",
    "KI-Fotos koennen kostenlos angesehen werden. Download und finale PDF erfordern Premium.": "KI-Fotos koennen kostenlos angesehen werden. Download und finale PDF erfordern Premium.",
    "KI-Foto herunterladen": "KI-Foto herunterladen",
    "Nach der Auswahl erscheint das Foto direkt in der CV-Vorschau.": "Nach der Auswahl erscheint das Foto direkt in der CV-Vorschau.",
    "Beruflicher Werdegang": "Beruflicher Werdegang",
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
    "Sprachen": "Sprachen",
    "Sprachkenntnisse kompakt erfassen.": "Sprachkenntnisse kompakt erfassen.",
    "Sprache hinzufuegen": "Sprache hinzufuegen",
    "Sprache": "Sprache",
    "Datum und Signatur fuer den CV.": "Datum und Signatur fuer den CV.",
    "Datum": "Datum",
    "Zuerich, 18.06.2026": "Zuerich, 18.06.2026",
    "Unterschrift": "Unterschrift",
    "Live Vorschau": "Live Vorschau",
    "Live-Vorschau": "Live-Vorschau",
    "Aktualisiert sich automatisch beim Tippen": "Aktualisiert sich automatisch beim Tippen",
    "Aktualisiert sich automatisch beim Tippen.": "Aktualisiert sich automatisch beim Tippen.",
    "Aktiv": "Aktiv",
    "VORSCHAU": "VORSCHAU",
    "Interessen": "Interessen",
    "Lebenslauf": "Lebenslauf",
    "Strukturierte, zuverlaessige Fachkraft mit Erfahrung in Organisation, Kommunikation und serviceorientierter Zusammenarbeit.": "Strukturierte, zuverlaessige Fachkraft mit Erfahrung in Organisation, Kommunikation und serviceorientierter Zusammenarbeit.",
    "Dokumentstil": "Dokumentstil",
    "CV Template": "CV Template",
    "Template direkt testen": "Template direkt testen",
    "Das Template bestimmt Layout, Struktur und Komposition.": "Das Template bestimmt Layout, Struktur und Komposition.",
    "Modern Split": "Modern Split",
    "Modern split-column layout": "Modernes zweispaltiges Layout",
    "Aqua Arc": "Aqua Arc",
    "Clean teal two-column CV": "Cleanes zweispaltiges CV in Teal",
    "Corporate Axis": "Corporate Axis",
    "Corporate geometric layout": "Corporate Layout mit geometrischen Akzenten",
    "Editorial Mono": "Editorial Mono",
    "Editorial monochrome layout": "Editoriales monochromes Layout",
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
    "Default": "Default",
    "Soft": "Soft",
    "Contrast": "Contrast",
    "Steel": "Steel",
    "Navy": "Navy",
    "Classic": "Classic",
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
    "Eine Aufgabe pro Zeile. Bindestrich oder Nummerierung ist optional.": "Eine Aufgabe pro Zeile. Bindestrich oder Nummerierung ist optional.",
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
    "Produktvorteile": "Product benefits",
    "Schweiz & Europa": "Switzerland & Europe",
    "KI-Foto": "AI photo",
    "KI-Text": "AI text",
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
    "Foto andern": "Change photo",
    "Foto aendern": "Change photo",
    "Generierte Optionen": "Generated options",
    "Noch nicht generiert": "Not generated yet",
    "Professionelles Foto generieren": "Generate professional photo",
    "Nach der Auswahl erscheint das Foto direkt in der Live-Vorschau.": "After selection, the photo appears directly in the live preview.",
    "KI-Fotos koennen kostenlos angesehen werden. Download und finale PDF erfordern Premium.": "You can preview an AI-generated photo, but Premium is required to download the image or final PDF.",
    "KI-Foto herunterladen": "Download AI photo",
    "Nach der Auswahl erscheint das Foto direkt in der CV-Vorschau.": "After selection, the photo appears directly in the CV preview.",
    "Beruflicher Werdegang": "Professional experience",
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
    "Sprachen": "Languages",
    "Sprachkenntnisse kompakt erfassen.": "Enter language skills compactly.",
    "Sprache hinzufuegen": "Add language",
    "Sprache": "Language",
    "Datum und Signatur fuer den CV.": "Date and signature for the CV.",
    "Datum": "Date",
    "Zuerich, 18.06.2026": "Zurich, 18.06.2026",
    "Unterschrift": "Signature",
    "Live Vorschau": "Live preview",
    "Live-Vorschau": "Live preview",
    "Aktualisiert sich automatisch beim Tippen": "Updates automatically while typing",
    "Aktualisiert sich automatisch beim Tippen.": "Updates automatically while typing.",
    "Aktiv": "Active",
    "VORSCHAU": "PREVIEW",
    "Interessen": "Interests",
    "Lebenslauf": "CV",
    "Strukturierte, zuverlaessige Fachkraft mit Erfahrung in Organisation, Kommunikation und serviceorientierter Zusammenarbeit.": "Structured, reliable professional with experience in organization, communication, and service-oriented collaboration.",
    "Dokumentstil": "Document style",
    "CV Template": "CV template",
    "Template direkt testen": "Test template directly",
    "Das Template bestimmt Layout, Struktur und Komposition.": "The template controls layout, structure, and composition.",
    "Modern Split": "Modern Split",
    "Modern split-column layout": "Modern split-column layout",
    "Aqua Arc": "Aqua Arc",
    "Clean teal two-column CV": "Clean teal two-column CV",
    "Corporate Axis": "Corporate Axis",
    "Corporate geometric layout": "Corporate geometric layout",
    "Editorial Mono": "Editorial Mono",
    "Editorial monochrome layout": "Editorial monochrome layout",
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
    "Default": "Default",
    "Soft": "Soft",
    "Contrast": "Contrast",
    "Steel": "Steel",
    "Navy": "Navy",
    "Classic": "Classic",
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
    "Eine Aufgabe pro Zeile. Bindestrich oder Nummerierung ist optional.": "One responsibility per line. Dashes or numbering are optional.",
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
    {
      className: "beruf-aufgaben",
      label: "Taetigkeit / Aufgaben",
      placeholder: "Eine Aufgabe pro Zeile. Bindestrich oder Nummerierung ist optional.",
      type: "textarea",
    },
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
  sprachen: [{ className: "sprachen", label: "Sprache" }],
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

function hasMeaningfulText(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function hasMeaningfulEntries(value) {
  return Array.isArray(value) && value.some((entry) =>
    entry &&
    typeof entry === "object" &&
    Object.values(entry).some(hasMeaningfulText)
  );
}

function hasMeaningfulDocumentData(data) {
  if (!data || typeof data !== "object") return false;
  return (
    ["name", "adresse", "kontakt", "headline", "profil", "datum", "unterschrift", "foto"]
      .some((field) => hasMeaningfulText(data[field])) ||
    ["schulbildung", "beruf", "weiterbildung", "kenntnisse", "hobbys"]
      .some((field) => hasMeaningfulEntries(data[field]))
  );
}

function getSelectedPhotoSrc() {
  return document.querySelector(".generated-option.selected img, #foto-container.selected img")?.src || "";
}

function clearStoredPhotoState({ resetUi = true } = {}) {
  const data = getStoredData();
  selectedPhotoIsAi = Boolean(data.foto_is_ai);
  if (data.foto) {
    if (
      typeof data.foto === "string" &&
      data.foto.startsWith("data:image/") &&
      window.PhotoStorage?.migrateLegacyPhoto
    ) {
      pendingPhotoMigration = window.PhotoStorage.migrateLegacyPhoto(data.foto).catch((error) => {
        console.warn("[VitaGen Photo]", "Could not migrate legacy stored photo", error);
      });
    }
    delete data.foto;
    setStoredData(data);
  }

  if (!resetUi) return;

  selectedPhotoIsAi = false;
  delete data.foto_is_ai;
  setStoredData(data);
  window.PhotoStorage?.clearProtectedPhotoAsset?.().catch(() => {});

  aiImageCount = 0;
  updateCounter();
  const fileInput = document.getElementById("foto-upload");
  if (fileInput) {
    fileInput.value = "";
  }

  const container = document.getElementById("foto-container");
  const shell = container?.closest(".photo-upload-shell");
  if (container) {
    container.innerHTML = "";
    container.classList.remove("selected");
  }
  shell?.classList.remove("has-photo");

  const changeButton = document.getElementById("changePhotoBtn");
  if (changeButton) {
    changeButton.hidden = true;
  }

  renderOptionPlaceholders();
  setPhotoStatus("Noch nicht generiert");
}

function setPhotoReady(promise) {
  const ready = Promise.resolve(promise).catch((error) => {
    console.warn("[VitaGen Photo]", "Photo storage is unavailable", error);
  });
  window.VitaGenPhotoReady = ready;
  ready.finally(() => {
    if (resolveInitialPhotoReady) {
      resolveInitialPhotoReady();
      resolveInitialPhotoReady = null;
    }
  });
  return ready;
}

function saveSourcePhotoForReuse(blob) {
  if (!window.PhotoStorage?.saveSourcePhoto || !(blob instanceof Blob)) {
    return;
  }

  window.PhotoStorage.saveSourcePhoto(blob).catch((error) => {
    console.warn("[VitaGen Photo]", "Could not store source photo", error);
  });
}

function persistSelectedPhoto(element) {
  if (!window.PhotoStorage?.blobFromImageElement || !window.PhotoStorage?.saveSelectedPhoto) {
    return setPhotoReady(Promise.resolve());
  }

  return setPhotoReady((async () => {
    const blob = await window.PhotoStorage.blobFromImageElement(element);
    await window.PhotoStorage.saveSelectedPhoto(blob);
    if (selectedPhotoIsAi && element.protectedAsset) {
      await window.PhotoStorage.saveProtectedPhotoAsset?.(element.protectedAsset);
    } else if (!selectedPhotoIsAi) {
      await window.PhotoStorage.clearProtectedPhotoAsset?.();
    }
  })());
}

async function restoreSelectedPhoto() {
  if (!window.PhotoStorage?.getSelectedPhoto || !window.PhotoStorage?.createPhotoUrl) {
    return;
  }

  await pendingPhotoMigration;
  const blob = await window.PhotoStorage.getSelectedPhoto();
  if (!(blob instanceof Blob)) {
    return;
  }

  const img = renderUploadPreview(window.PhotoStorage.createPhotoUrl(blob), true);
  if (img) {
    img.photoBlob = blob;
    img.aiGenerated = selectedPhotoIsAi;
    if (selectedPhotoIsAi) {
      img.protectedAsset = await window.PhotoStorage.getProtectedPhotoAsset?.();
    }
    selectImage(img, { persist: false });
  }
}

async function getPhotoForGeneration() {
  const file = document.getElementById("foto-upload")?.files?.[0];
  if (file) {
    return file;
  }

  if (!window.PhotoStorage?.getSourcePhoto) {
    return null;
  }

  return window.PhotoStorage.getSourcePhoto();
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
  renderTemplateOptions(getSelectedTemplate());
  renderStyleOptions(getSelectedStyle());
  syncDocumentAccess(window.VitaGenCurrentDocumentData || getStoredData());
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

function getTemplateById(templateId = "existing") {
  return CV_TEMPLATES.find((template) => template.id === templateId) || CV_TEMPLATES[0];
}

function getTemplateByStyle(styleName = DEFAULT_STYLE) {
  const normalized = normalizeDocumentStyle(styleName);
  return CV_TEMPLATES.find((template) => template.styles.includes(normalized)) || CV_TEMPLATES[0];
}

function normalizeDocumentTemplate(templateId = "existing") {
  return getTemplateById(templateId).id;
}

function getSelectedTemplate() {
  const storedStyle = normalizeDocumentStyle(localStorage.getItem(STYLE_STORAGE_KEY) || DEFAULT_STYLE);
  const storedTemplate = localStorage.getItem(TEMPLATE_STORAGE_KEY);
  if (storedTemplate && getTemplateById(storedTemplate).styles.includes(storedStyle)) {
    return normalizeDocumentTemplate(storedTemplate);
  }
  return getTemplateByStyle(storedStyle).id;
}

function getSelectedStyle() {
  const template = getTemplateById(getSelectedTemplate());
  const storedStyle = normalizeDocumentStyle(localStorage.getItem(STYLE_STORAGE_KEY) || document.getElementById("preview")?.dataset.style || template.defaultStyle);
  return template.styles.includes(storedStyle) ? storedStyle : template.defaultStyle;
}

function renderTemplateOptions(activeTemplateId = getSelectedTemplate()) {
  const container = document.querySelector("[data-template-options]");
  if (!container) return;
  container.innerHTML = "";
  CV_TEMPLATES.forEach((template) => {
    const button = document.createElement("button");
    const active = template.id === activeTemplateId;
    button.type = "button";
    button.className = `template-chip${active ? " active" : ""}`;
    button.dataset.template = template.id;
    button.setAttribute("aria-pressed", String(active));
    button.innerHTML = `
      <span class="template-thumb template-thumb--${template.id}" aria-hidden="true"></span>
      <strong>${translateValue(template.name)}</strong>
      <small>${translateValue(template.description)}</small>
      <span class="template-tier template-tier--${template.tier}">${template.tier === "free" ? "Free" : "Premium"}</span>
    `;
    button.addEventListener("click", () => applyDocumentTemplate(template.id));
    container.appendChild(button);
  });
}

function renderStyleOptions(activeStyle = getSelectedStyle()) {
  const container = document.querySelector("[data-style-options]");
  if (!container) return;
  const template = getTemplateById(getSelectedTemplate());
  container.innerHTML = "";
  template.styles.forEach((styleName) => {
    const meta = STYLE_META[styleName] || { name: styleName.replace(".css", ""), tone: "", thumb: "" };
    const button = document.createElement("button");
    const active = styleName === activeStyle;
    button.type = "button";
    button.className = `style-chip${active ? " active" : ""}`;
    button.dataset.style = styleName;
    button.dataset.tone = meta.thumb;
    button.setAttribute("aria-pressed", String(active));
    button.innerHTML = `
      <span class="style-thumb ${meta.thumb}" aria-hidden="true"></span>
      <strong>${translateValue(meta.name)}</strong>
      <small>${translateValue(meta.tone)}</small>
    `;
    button.addEventListener("click", () => applyDocumentStyle(styleName));
    container.appendChild(button);
  });
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
  if (section === "sprachen") {
    return data.sprachen || translateValue("Sprache");
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
  toggle.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>`;

  const remove = document.createElement("button");
  remove.type = "button";
  remove.className = "delete";
  remove.setAttribute("aria-label", translateValue("Eintrag entfernen"));
  remove.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;

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
    if (field.placeholder) input.setAttribute("placeholder", translateValue(field.placeholder));
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
  const data = getStoredData();

  SIMPLE_FIELDS.forEach((id) => {
    const element = document.getElementById(id);
    if (element) {
      data[id] = element.value || "";
    }
  });

  Object.keys(SECTION_CONFIG).forEach((section) => {
    if (document.querySelector(`.${section}-entries`)) {
      data[section] = getEntriesData(section);
    }
  });

  const selectedPhoto = getSelectedPhotoSrc();
  if (selectedPhoto) {
    data.foto = window.PhotoStorage?.STORAGE_MARKER || selectedPhoto;
    data.foto_is_ai = selectedPhotoIsAi;
  } else if (!selectedPhotoIsAi) {
    delete data.foto_is_ai;
  }

  if (hasMeaningfulDocumentData(data)) {
    setStoredData(data);
  }

  return selectedPhoto ? { ...data, foto: selectedPhoto } : data;
}

window.saveAllFields = saveFormData;

function updatePreviewDownloadCopy(state) {
  const card = document.querySelector(".modal-payment-card");
  const copy = window.VitaGenAccess?.getPreviewDownloadCopy(
    state,
    currentLanguage
  );
  if (!card || !copy) return;

  const title = card.querySelector("h3");
  const description = card.querySelector("p");
  const benefit = card.querySelector("li:last-child");
  const action = card.querySelector("[data-trigger-buy], [data-payment-trigger]");
  if (title) title.textContent = copy.title;
  if (description) description.textContent = copy.description;
  if (benefit) benefit.textContent = copy.benefit;
  if (action) action.textContent = copy.action;
}

function syncDocumentAccess(data = window.VitaGenCurrentDocumentData || getStoredData()) {
  if (!window.VitaGenAccess) return null;
  const storedAccess = window.VitaGenAccess.readStoredAccess("lebenslauf", localStorage);
  const state = window.VitaGenAccess.stateFromDocument({
    documentType: "lebenslauf",
    selectedTemplateId: getSelectedTemplate(),
    styleName: getSelectedStyle(),
    documentData: data,
    paymentStatus: storedAccess.paymentStatus,
  });
  const nextState = { ...storedAccess, ...state };
  window.VitaGenAccess.writeStoredAccess("lebenslauf", nextState, localStorage);

  const status = document.getElementById("documentTierStatus");
  const copy = window.VitaGenAccess.describeDocumentAccess(nextState, currentLanguage);
  if (status) {
    status.dataset.tier = nextState.documentTier;
    status.querySelector("[data-document-tier-title]").textContent = copy.title;
    status.querySelector("[data-document-tier-detail]").textContent = copy.detail;
  }
  const buyButton = document.getElementById("buyBtn");
  if (buyButton) {
    buyButton.textContent =
      nextState.documentTier === "free"
        ? currentLanguage === "en"
          ? "Download free PDF"
          : "Kostenlose PDF herunterladen"
        : currentLanguage === "en"
          ? "Unlock premium PDF"
          : "Premium-PDF freischalten";
  }
  updatePreviewDownloadCopy(nextState);
  window.dispatchEvent(new CustomEvent("vitagen:accesschange", { detail: nextState }));
  return nextState;
}

window.VitaGenGetAccessState = () =>
  syncDocumentAccess(window.VitaGenCurrentDocumentData || getStoredData());

function applyDocumentStyle(styleName = DEFAULT_STYLE) {
  const normalized = normalizeDocumentStyle(styleName);
  const template = getTemplateByStyle(normalized);
  const themeLink = document.getElementById("theme-style");
  const preview = document.getElementById("preview");

  if (themeLink) {
    themeLink.href = `styles/${normalized}`;
  }
  if (preview) {
    preview.dataset.style = normalized;
    preview.dataset.template = template.id;
  }

  localStorage.setItem(TEMPLATE_STORAGE_KEY, template.id);
  localStorage.setItem(STYLE_STORAGE_KEY, normalized);
  renderTemplateOptions(template.id);
  renderStyleOptions(normalized);

  syncLivePreview();
}

function applyDocumentTemplate(templateId = "existing") {
  const template = getTemplateById(templateId);
  const storedStyle = normalizeDocumentStyle(localStorage.getItem(STYLE_STORAGE_KEY) || template.defaultStyle);
  const nextStyle = template.styles.includes(storedStyle) ? storedStyle : template.defaultStyle;
  localStorage.setItem(TEMPLATE_STORAGE_KEY, template.id);
  applyDocumentStyle(nextStyle);
}

function pulseLivePreview() {
  const card = document.querySelector(".preview-card");
  if (!card) return;
  card.classList.remove("is-updating");
  void card.offsetWidth;
  card.classList.add("is-updating");
  window.setTimeout(() => card.classList.remove("is-updating"), 720);
}

function fitPreviewFrame() {
  const frame = document.getElementById("preview-wrapper");
  const preview = document.getElementById("preview");
  const firstPage = preview?.querySelector(".document-page");
  if (!frame || !preview || !firstPage) return;

  preview.style.transform = "none";
  const availableWidth = frame.clientWidth;
  const scale = Math.min(1, availableWidth / firstPage.offsetWidth);
  preview.style.transform = `scale(${scale})`;
  frame.style.height = `${Math.ceil(firstPage.offsetHeight * scale)}px`;
}

function updateDocumentWarnings(result) {
  const frame = document.getElementById("preview-wrapper");
  if (!frame) return;

  let warning = document.getElementById("documentRenderWarning");
  if (!result?.warnings?.length) {
    warning?.remove();
    return;
  }

  if (!warning) {
    warning = document.createElement("p");
    warning.id = "documentRenderWarning";
    warning.className = "document-render-warning";
    frame.insertAdjacentElement("afterend", warning);
  }
  warning.textContent = result.warnings[0];
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
  const preview = document.getElementById("preview");
  if (!preview || !window.VitaGenDocumentRenderer) return;
  const data = saveFormData();
  window.VitaGenCurrentDocumentData = data;
  const result = window.VitaGenDocumentRenderer.renderInto(preview, {
    type: "cv",
    data,
    styleName: getSelectedStyle(),
    templateId: getSelectedTemplate(),
    language: currentLanguage,
    watermark: true,
  });
  window.VitaGenLastRenderResult = result;
  syncDocumentAccess(data);
  updateDocumentWarnings(result);
  fitPreviewFrame();

  if (document.getElementById("previewModal")?.classList.contains("open")) {
    refreshModalPreview();
  }

  if (pulse) {
    pulseLivePreview();
  }
}

window.VitaGenRenderPreview = syncLivePreview;

function refreshModalPreview() {
  const host = document.getElementById("modalPreviewHost");
  const preview = document.getElementById("preview");
  if (!host || !preview) return;
  host.innerHTML = "";
  const clone = preview.cloneNode(true);
  clone.id = "preview-modal-doc";
  clone.style.transform = "none";
  clone.style.transformOrigin = "top center";
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

function createGeneratedOption(src, protectedAsset) {
  const container = document.getElementById("foto-auswahl");
  if (!container) return;

  const option = document.createElement("button");
  option.type = "button";
  option.className = "generated-option";
  option.setAttribute("aria-label", t("KI Foto Variante {count} auswaehlen", { count: aiImageCount }));

  const img = document.createElement("img");
  img.src = src;
  img.alt = t("KI Foto Variante {count}", { count: aiImageCount });
  img.aiGenerated = true;
  img.protectedAsset = protectedAsset;

  const label = document.createElement("span");
  label.textContent = translateValue("Variante");

  option.append(img, label);
  option.addEventListener("click", () => selectImage(img));
  
  const firstPlaceholder = container.querySelector(".photo-option-placeholder");
  if (firstPlaceholder) {
    container.replaceChild(option, firstPlaceholder);
  } else {
    container.appendChild(option);
  }
}

function selectImage(element, { persist = true } = {}) {
  if (!element?.src) return;
  document.querySelectorAll("#foto-container, .generated-option").forEach((item) => item.classList.remove("selected"));

  const generatedOption = element.closest(".generated-option");
  selectedPhotoIsAi = Boolean(element.aiGenerated || generatedOption);
  const downloadButton = document.getElementById("downloadAiPhotoBtn");
  if (downloadButton) {
    downloadButton.hidden = !selectedPhotoIsAi;
  }
  if (generatedOption) {
    generatedOption.classList.add("selected");
  } else {
    document.getElementById("foto-container")?.classList.add("selected");
  }

  saveFormData();
  setPhotoStatus("Foto fuer die Vorschau ausgewaehlt");
  syncLivePreview();
  if (persist) {
    persistSelectedPhoto(element);
  }
}

window.selectImage = selectImage;

function loadFormData() {
  clearStoredPhotoState({ resetUi: false });
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

  const storedTemplate = localStorage.getItem(TEMPLATE_STORAGE_KEY) || getTemplateByStyle(localStorage.getItem(STYLE_STORAGE_KEY) || DEFAULT_STYLE).id;
  applyDocumentTemplate(storedTemplate);
  syncLivePreview({ pulse: false });
  setPhotoReady(
    restoreSelectedPhoto().finally(() => {
      syncLivePreview({ pulse: false });
    })
  );
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
  const downloadAiPhotoBtn = document.getElementById("downloadAiPhotoBtn");

  fileInput?.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      aiImageCount = 0;
      updateCounter();
      renderOptionPlaceholders();
      setPhotoStatus("Noch nicht generiert");
      saveSourcePhotoForReuse(file);
      selectedPhotoIsAi = false;
      window.PhotoStorage?.clearProtectedPhotoAsset?.().catch(() => {});
      const img = renderUploadPreview(loadEvent.target.result, true);
      if (img) {
        img.photoBlob = file;
        selectImage(img);
      }
    };
    reader.onerror = () => {
      showToast("Das Foto konnte nicht gelesen werden. Bitte versuchen Sie eine andere Datei.", "error", "Upload fehlgeschlagen");
    };
    reader.readAsDataURL(file);
  });

  changePhotoBtn?.addEventListener("click", () => fileInput?.click());

  downloadAiPhotoBtn?.addEventListener("click", async () => {
    if (!selectedPhotoIsAi || !window.VitaGenPayment?.downloadAiPhoto) {
      return;
    }
    try {
      await window.VitaGenPayment.downloadAiPhoto();
    } catch (error) {
      showToast(
        error.message || "Das KI-Foto konnte nicht heruntergeladen werden.",
        "error",
        "Download fehlgeschlagen"
      );
    }
  });

  aiBtn?.addEventListener("click", async () => {
    if (aiImageCount >= MAX_IMAGES) {
      showToast("Sie haben bereits 3 KI-Bilder generiert.", "info", "Limit erreicht");
      return;
    }

    const file = await getPhotoForGeneration();
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
    formData.append("photo", file, file.name || "application-photo.jpg");

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
        createGeneratedOption(result.aiFoto, result.protectedAsset);
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
  window.addEventListener("resize", fitPreviewFrame);

  const sections = document.querySelectorAll(".builder-column > section");
  const navLinks = document.querySelectorAll(".section-rail a");
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        navLinks.forEach((link) => {
          link.classList.remove("active");
          if (link.getAttribute("href") === `#${entry.target.id}`) {
            link.classList.add("active");
          }
        });
      }
    });
  }, { root: null, rootMargin: "-20% 0px -60% 0px", threshold: 0 });
  sections.forEach((section) => observer.observe(section));

  const railToggle = document.querySelector(".rail-toggle");
  if (railToggle) {
    railToggle.addEventListener("click", () => {
      document.querySelector(".section-rail").classList.toggle("collapsed");
      document.querySelector(".builder-grid").classList.toggle("rail-collapsed");
    });
  }
});
