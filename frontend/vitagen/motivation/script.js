const AI_API_BASE_URL = "https://motivation-backend-production-2800.up.railway.app";

let aiImageCount = 0;
const MAX_IMAGES = 3;
const STYLE_STORAGE_KEY = "vitagen_motivation_style";
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
    "document.title": "VitaGen - Motivationsschreiben",
    "motivation.eyebrow": "Bewerbungsunterlagen",
    "motivation.title": "Motivationsschreiben erstellen",
    "motivation.copy": "Erfasse deine Angaben, optimiere dein Foto und erstelle einen professionellen Text mit KI-Unterstuetzung.",
    "Produktvorteile": "Produktvorteile",
    "Schweiz & Europa": "Schweiz & Europa",
    "KI-Foto": "KI-Foto",
    "KI-Text": "KI-Text",
    "Meine Angaben": "Meine Angaben",
    "Diese Daten erscheinen spaeter im Briefkopf deiner Bewerbung.": "Diese Daten erscheinen spaeter im Briefkopf deiner Bewerbung.",
    "Mein Name": "Mein Name",
    "Max Mustermann": "Max Mustermann",
    "Max Muster": "Max Muster",
    "E-Mail / Telefon": "E-Mail / Telefon",
    "+41 76 456 79 00 Â· max@email.com": "+41 76 456 79 00 - max@email.com",
    "Meine Adresse": "Meine Adresse",
    "Strasse, PLZ Ort": "Strasse, PLZ Ort",
    "Bewerbungsfoto vorbereiten": "Bewerbungsfoto vorbereiten",
    "KI-Funktion: Aus einem normalen Foto wird eine professionelle Bewerbungsfoto-Variante.": "KI-Funktion: Aus einem normalen Foto wird eine professionelle Bewerbungsfoto-Variante.",
    "KI-Fotoassistent": "KI-Fotoassistent",
    "KI-Funktion - {count} / {max} generiert": "KI-Funktion - {count} / {max} generiert",
    "KI-Funktion - 0 / 3 generiert": "KI-Funktion - 0 / 3 generiert",
    "Foto hochladen": "Foto hochladen",
    "Laden Sie ein klares Portrait hoch. Danach kann die KI professionelle Varianten erstellen.": "Laden Sie ein klares Portrait hoch. Danach kann die KI professionelle Varianten erstellen.",
    "Datei auswahlen": "Datei auswaehlen",
    "Foto andern": "Foto aendern",
    "Generierte Optionen": "Generierte Optionen",
    "Noch nicht generiert": "Noch nicht generiert",
    "Foto wird vorbereitet...": "Foto wird vorbereitet...",
    "Bereit fur KI-Foto": "Bereit fuer KI-Foto",
    "Professionelles Foto generieren": "Professionelles Foto generieren",
    "Nach der Auswahl erscheint das Foto direkt in der Live-Vorschau.": "Nach der Auswahl erscheint das Foto direkt in der Live-Vorschau.",
    "Angaben zur Bewerbung": "Angaben zur Bewerbung",
    "Rolle und Arbeitgeber werden fuer Betreff, Briefkopf und KI-Text genutzt.": "Rolle und Arbeitgeber werden fuer Betreff, Briefkopf und KI-Text genutzt.",
    "Bewerbung als...": "Bewerbung als...",
    "Marketing Manager": "Marketing Manager",
    "Bewerbung als... (fuer Motivationstext)": "Bewerbung als... (fuer Motivationstext)",
    "z.B. Softwareentwickler": "z.B. Softwareentwickler",
    "Adresse Arbeitgeber": "Adresse Arbeitgeber",
    "Firma, Ansprechperson, Strasse, Ort": "Firma, Ansprechperson, Strasse, Ort",
    "KI-Textassistent": "KI-Textassistent",
    "Motivationstext formulieren": "Motivationstext formulieren",
    "Notiere Stichwoerter zu Erfahrung, Motivation und Staerken. Der Text bleibt danach editierbar.": "Notiere Stichwoerter zu Erfahrung, Motivation und Staerken. Der Text bleibt danach editierbar.",
    "Tonvorschlaege": "Tonvorschlaege",
    "Professionell": "Professionell",
    "Warm": "Warm",
    "Selbstbewusst": "Selbstbewusst",
    "Kurz & klar": "Kurz & klar",
    "Motivationstext": "Motivationstext",
    "Stichwoerter eingeben oder vorhandenen Text ueberarbeiten lassen.": "Stichwoerter eingeben oder vorhandenen Text ueberarbeiten lassen.",
    "Erfahrung, Motivation, passende Staerken, konkrete Beispiele...": "Erfahrung, Motivation, passende Staerken, konkrete Beispiele...",
    "KI Hilfe zum Fliesstext erstellen": "KI Hilfe zum Fliesstext erstellen",
    "Briefdetails": "Briefdetails",
    "Begruessung, Abschluss und Signatur fuer den finalen Brief.": "Begruessung, Abschluss und Signatur fuer den finalen Brief.",
    "Begruessung": "Begruessung",
    "z.B. Sehr geehrte Frau Muster": "z.B. Sehr geehrte Frau Muster",
    "Verabschiedung": "Verabschiedung",
    "z.B. Mit freundlichen Gruessen": "z.B. Mit freundlichen Gruessen",
    "Datum": "Datum",
    "Unterschrift": "Unterschrift",
    "Dein Name - Unterschrift": "Dein Name - Unterschrift",
    "Live Vorschau": "Live Vorschau",
    "Live-Vorschau": "Live-Vorschau",
    "Aktualisiert sich automatisch beim Tippen": "Aktualisiert sich automatisch beim Tippen",
    "Aktiv": "Aktiv",
    "VORSCHAU": "VORSCHAU",
    "Bewerbungsfoto": "Bewerbungsfoto",
    "Musterfirma AG": "Musterfirma AG",
    "Personalabteilung": "Personalabteilung",
    "Limmatquai 10": "Limmatquai 10",
    "8001 Zuerich": "8001 Zuerich",
    "Kaufmaennischer Mitarbeiter": "Kaufmaennischer Mitarbeiter",
    "KAUFMANNISCHER MITARBEITER": "KAUFMANNISCHER MITARBEITER",
    "Bewerbung als {role}": "Bewerbung als {role}",
    "Bewerbung als Kaufmaennischer Mitarbeiter im Kundenservice": "Bewerbung als Kaufmaennischer Mitarbeiter im Kundenservice",
    "Sehr geehrte Damen und Herren": "Sehr geehrte Damen und Herren",
    "Mit grossem Interesse bewerbe ich mich. Durch meine Erfahrung und meine strukturierte Arbeitsweise bin ich ueberzeugt, Ihr Team sinnvoll unterstuetzen zu koennen.": "Mit grossem Interesse bewerbe ich mich. Durch meine Erfahrung und meine strukturierte Arbeitsweise bin ich ueberzeugt, Ihr Team sinnvoll unterstuetzen zu koennen.",
    "Gerne ueberzeuge ich Sie in einem persoenlichen Gespraech von meiner Motivation.": "Gerne ueberzeuge ich Sie in einem persoenlichen Gespraech von meiner Motivation.",
    "Mit freundlichen Gruessen": "Mit freundlichen Gruessen",
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
    "PDF ohne Wasserzeichen vorbereiten": "PDF ohne Wasserzeichen vorbereiten",
    "Pruefe zuerst die Vorschau. Der Preis erscheint erst, wenn die PDF ohne Wasserzeichen angefordert wird.": "Pruefe zuerst die Vorschau. Der Preis erscheint erst, wenn die PDF ohne Wasserzeichen angefordert wird.",
    "Vollbild-Vorschau": "Vollbild-Vorschau",
    "Vorschau schliessen": "Vorschau schliessen",
    "Kostenlose Vorschau": "Kostenlose Vorschau",
    "Die Vorschau zeigt das Dokument mit Wasserzeichen. Nach dem Freischalten wird die PDF ohne Wasserzeichen heruntergeladen.": "Die Vorschau zeigt das Dokument mit Wasserzeichen. Nach dem Freischalten wird die PDF ohne Wasserzeichen heruntergeladen.",
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
    "Variante": "Variante",
    "Ausgewaehltes Bewerbungsfoto": "Ausgewaehltes Bewerbungsfoto",
    "KI Foto Variante {count} auswaehlen": "KI Foto Variante {count} auswaehlen",
    "KI Foto Variante {count}": "KI Foto Variante {count}",
    "Foto fuer die Vorschau ausgewaehlt": "Foto fuer die Vorschau ausgewaehlt",
    "Bereit fuer KI-Foto": "Bereit fuer KI-Foto",
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
    "Zahlung nicht bereit": "Zahlung nicht bereit",
    "Das Zahlungsfenster konnte nicht geoeffnet werden. Bitte laden Sie die Seite neu.": "Das Zahlungsfenster konnte nicht geoeffnet werden. Bitte laden Sie die Seite neu.",
    "Zahlungsmodul wird geladen. Falls die Weiterleitung nicht startet, bitte Seite neu laden.": "Zahlungsmodul wird geladen. Falls die Weiterleitung nicht startet, bitte Seite neu laden.",
    "Zwischengespeichert": "Zwischengespeichert",
    "Ihre Eingaben wurden lokal gespeichert.": "Ihre Eingaben wurden lokal gespeichert.",
    "Text fehlt": "Text fehlt",
    "Rolle fehlt": "Rolle fehlt",
    "Generiere Text...": "Generiere Text...",
    "KI-Text bereit": "KI-Text bereit",
    "Kein Text erhalten": "Kein Text erhalten",
    "Bitte Stichwoerter oder einen bestehenden Motivationstext eingeben.": "Bitte Stichwoerter oder einen bestehenden Motivationstext eingeben.",
    "Bitte die Zielrolle fuer den Motivationstext eintragen.": "Bitte die Zielrolle fuer den Motivationstext eintragen.",
    "Motivationstext wurde erstellt und bleibt editierbar.": "Motivationstext wurde erstellt und bleibt editierbar.",
    "Der Server hat keinen Text zurueckgegeben.": "Der Server hat keinen Text zurueckgegeben.",
    "Der Motivationstext konnte nicht generiert werden. Bitte versuchen Sie es erneut.": "Der Motivationstext konnte nicht generiert werden. Bitte versuchen Sie es erneut.",
    "Erfolg": "Erfolg",
    "Hinweis": "Hinweis",
    "Achtung": "Achtung",
    "Fehler": "Fehler",
    "Meldung schliessen": "Meldung schliessen",
  },
  en: {
    "document.title": "VitaGen - Motivation letter",
    "motivation.eyebrow": "Application documents",
    "motivation.title": "Create motivation letter",
    "motivation.copy": "Enter your details, refine your photo, and create a professional letter with AI assistance.",
    "Produktvorteile": "Product benefits",
    "Schweiz & Europa": "Switzerland & Europe",
    "KI-Foto": "AI photo",
    "KI-Text": "AI text",
    "Meine Angaben": "My details",
    "Diese Daten erscheinen spaeter im Briefkopf deiner Bewerbung.": "These details will appear in the letterhead of your application.",
    "Mein Name": "My name",
    "Max Mustermann": "Max Sample",
    "Max Muster": "Max Sample",
    "E-Mail / Telefon": "Email / phone",
    "+41 76 456 79 00 Â· max@email.com": "+41 76 456 79 00 - max@email.com",
    "Meine Adresse": "My address",
    "Strasse, PLZ Ort": "Street, postal code, city",
    "Bewerbungsfoto vorbereiten": "Prepare application photo",
    "KI-Funktion: Aus einem normalen Foto wird eine professionelle Bewerbungsfoto-Variante.": "AI feature: turn a regular photo into a professional application photo variant.",
    "KI-Fotoassistent": "AI photo assistant",
    "KI-Funktion - {count} / {max} generiert": "AI feature - {count} / {max} generated",
    "KI-Funktion - 0 / 3 generiert": "AI feature - 0 / 3 generated",
    "Foto hochladen": "Upload photo",
    "Laden Sie ein klares Portrait hoch. Danach kann die KI professionelle Varianten erstellen.": "Upload a clear portrait. The AI can then create professional variants.",
    "Datei auswahlen": "Choose file",
    "Foto andern": "Change photo",
    "Generierte Optionen": "Generated options",
    "Noch nicht generiert": "Not generated yet",
    "Foto wird vorbereitet...": "Preparing photo...",
    "Bereit fur KI-Foto": "Ready for AI photo",
    "Professionelles Foto generieren": "Generate professional photo",
    "Nach der Auswahl erscheint das Foto direkt in der Live-Vorschau.": "After selection, the photo appears directly in the live preview.",
    "Angaben zur Bewerbung": "Application details",
    "Rolle und Arbeitgeber werden fuer Betreff, Briefkopf und KI-Text genutzt.": "Role and employer are used for the subject, letterhead, and AI text.",
    "Bewerbung als...": "Applying as...",
    "Marketing Manager": "Marketing Manager",
    "Bewerbung als... (fuer Motivationstext)": "Applying as... (for motivation text)",
    "z.B. Softwareentwickler": "e.g. software developer",
    "Adresse Arbeitgeber": "Employer address",
    "Firma, Ansprechperson, Strasse, Ort": "Company, contact person, street, city",
    "KI-Textassistent": "AI text assistant",
    "Motivationstext formulieren": "Write motivation text",
    "Notiere Stichwoerter zu Erfahrung, Motivation und Staerken. Der Text bleibt danach editierbar.": "Add notes about experience, motivation, and strengths. The text remains editable afterward.",
    "Tonvorschlaege": "Tone suggestions",
    "Professionell": "Professional",
    "Warm": "Warm",
    "Selbstbewusst": "Confident",
    "Kurz & klar": "Short & clear",
    "Motivationstext": "Motivation text",
    "Stichwoerter eingeben oder vorhandenen Text ueberarbeiten lassen.": "Enter notes or revise an existing text.",
    "Erfahrung, Motivation, passende Staerken, konkrete Beispiele...": "Experience, motivation, relevant strengths, concrete examples...",
    "KI Hilfe zum Fliesstext erstellen": "Create text with AI help",
    "Briefdetails": "Letter details",
    "Begruessung, Abschluss und Signatur fuer den finalen Brief.": "Greeting, closing, and signature for the final letter.",
    "Begruessung": "Greeting",
    "z.B. Sehr geehrte Frau Muster": "e.g. Dear Ms Sample",
    "Verabschiedung": "Closing",
    "z.B. Mit freundlichen Gruessen": "e.g. Kind regards",
    "Datum": "Date",
    "Unterschrift": "Signature",
    "Dein Name - Unterschrift": "Your name - signature",
    "Live Vorschau": "Live preview",
    "Live-Vorschau": "Live preview",
    "Aktualisiert sich automatisch beim Tippen": "Updates automatically while typing",
    "Aktiv": "Active",
    "VORSCHAU": "PREVIEW",
    "Bewerbungsfoto": "Application photo",
    "Musterfirma AG": "Sample Company Ltd",
    "Personalabteilung": "HR department",
    "Limmatquai 10": "Limmatquai 10",
    "8001 Zuerich": "8001 Zurich",
    "Kaufmaennischer Mitarbeiter": "Commercial employee",
    "KAUFMANNISCHER MITARBEITER": "COMMERCIAL EMPLOYEE",
    "Bewerbung als {role}": "Application as {role}",
    "Bewerbung als Kaufmaennischer Mitarbeiter im Kundenservice": "Application as commercial employee in customer service",
    "Sehr geehrte Damen und Herren": "Dear Sir or Madam",
    "Mit grossem Interesse bewerbe ich mich. Durch meine Erfahrung und meine strukturierte Arbeitsweise bin ich ueberzeugt, Ihr Team sinnvoll unterstuetzen zu koennen.": "I am applying with great interest. With my experience and structured working style, I am confident I can support your team effectively.",
    "Gerne ueberzeuge ich Sie in einem persoenlichen Gespraech von meiner Motivation.": "I would be happy to discuss my motivation with you in a personal interview.",
    "Mit freundlichen Gruessen": "Kind regards",
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
    "PDF ohne Wasserzeichen vorbereiten": "Prepare PDF without watermark",
    "Pruefe zuerst die Vorschau. Der Preis erscheint erst, wenn die PDF ohne Wasserzeichen angefordert wird.": "Review the preview first. The price appears only when the PDF without watermark is requested.",
    "Vollbild-Vorschau": "Full-screen preview",
    "Vorschau schliessen": "Close preview",
    "Kostenlose Vorschau": "Free preview",
    "Die Vorschau zeigt das Dokument mit Wasserzeichen. Nach dem Freischalten wird die PDF ohne Wasserzeichen heruntergeladen.": "The preview shows the document with a watermark. After unlocking, the PDF is downloaded without a watermark.",
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
    "Variante": "Variant",
    "Ausgewaehltes Bewerbungsfoto": "Selected application photo",
    "KI Foto Variante {count} auswaehlen": "Select AI photo variant {count}",
    "KI Foto Variante {count}": "AI photo variant {count}",
    "Foto fuer die Vorschau ausgewaehlt": "Photo selected for preview",
    "Bereit fuer KI-Foto": "Ready for AI photo",
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
    "Zahlung nicht bereit": "Payment not ready",
    "Das Zahlungsfenster konnte nicht geoeffnet werden. Bitte laden Sie die Seite neu.": "The payment window could not be opened. Please reload the page.",
    "Zahlungsmodul wird geladen. Falls die Weiterleitung nicht startet, bitte Seite neu laden.": "Payment module is loading. If the redirect does not start, please reload the page.",
    "Zwischengespeichert": "Saved locally",
    "Ihre Eingaben wurden lokal gespeichert.": "Your entries have been saved locally.",
    "Text fehlt": "Text missing",
    "Rolle fehlt": "Role missing",
    "Generiere Text...": "Generating text...",
    "KI-Text bereit": "AI text ready",
    "Kein Text erhalten": "No text received",
    "Bitte Stichwoerter oder einen bestehenden Motivationstext eingeben.": "Please enter notes or an existing motivation text.",
    "Bitte die Zielrolle fuer den Motivationstext eintragen.": "Please enter the target role for the motivation text.",
    "Motivationstext wurde erstellt und bleibt editierbar.": "Motivation text was created and remains editable.",
    "Der Server hat keinen Text zurueckgegeben.": "The server did not return text.",
    "Der Motivationstext konnte nicht generiert werden. Bitte versuchen Sie es erneut.": "The motivation text could not be generated. Please try again.",
    "Erfolg": "Success",
    "Hinweis": "Info",
    "Achtung": "Warning",
    "Fehler": "Error",
    "Meldung schliessen": "Close message",
  },
};

let currentLanguage = "de";

function getStoredData() {
  return JSON.parse(localStorage.getItem("vitagen_motivation") || "{}");
}

function setStoredData(data) {
  localStorage.setItem("vitagen_motivation", JSON.stringify(data));
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

function setTextWithBreaks(element, value, fallback = "") {
  if (!element) return;

  const text = (value || fallback || "").trim();
  element.textContent = "";

  text.split(/\r?\n/).forEach((line, index) => {
    if (index > 0) {
      element.appendChild(document.createElement("br"));
    }
    element.appendChild(document.createTextNode(line));
  });
}

function getCurrentFormData() {
  const stored = getStoredData();
  return {
    ...stored,
    name: document.getElementById("name")?.value || stored.name || "",
    adresse: document.getElementById("adresse")?.value || stored.adresse || "",
    kontakt: document.getElementById("kontakt")?.value || stored.kontakt || "",
    posten: document.getElementById("posten")?.value || stored.posten || "",
    arbeitgeber: document.getElementById("arbeitgeber")?.value || stored.arbeitgeber || "",
    funktion: document.getElementById("funktion")?.value || stored.funktion || "",
    stichwoerter: document.getElementById("stichwoerter")?.value || stored.stichwoerter || "",
    stichwoerter2: document.getElementById("stichwoerter2")?.value || stored.stichwoerter2 || "",
    stichwoerter3: document.getElementById("stichwoerter3")?.value || stored.stichwoerter3 || "",
    datum: document.getElementById("datum")?.value || stored.datum || "",
    unterschrift: document.getElementById("unterschrift")?.value || stored.unterschrift || ""
  };
}

function pulseLivePreview() {
  const card = document.getElementById("livePreviewCard");
  if (!card) return;

  card.classList.remove("is-updating");
  void card.offsetWidth;
  card.classList.add("is-updating");
  window.setTimeout(() => card.classList.remove("is-updating"), 720);
}

function syncLivePreview({ pulse = true } = {}) {
  const data = getCurrentFormData();
  const role = data.posten || data.funktion || t("Kaufmaennischer Mitarbeiter");
  const today = new Date().toLocaleDateString("de-CH");

  document.getElementById("pv-name").textContent = data.name || t("Max Mustermann");
  document.getElementById("pv-kontakt").textContent = role.toUpperCase();
  setTextWithBreaks(
    document.getElementById("pv-arbeitgeber"),
    data.arbeitgeber,
    `${t("Musterfirma AG")}\n${t("Personalabteilung")}\n${t("Limmatquai 10")}\n${t("8001 Zuerich")}`
  );
  document.getElementById("pv-datum").textContent = data.datum || `Zuerich, ${today}`;
  document.getElementById("pv-funktion").textContent = t("Bewerbung als {role}", { role });
  document.getElementById("pv-stichwoerter").textContent = data.stichwoerter || t("Sehr geehrte Damen und Herren");
  document.getElementById("pv-stichwoerter2").textContent =
    data.stichwoerter2 ||
    t("Mit grossem Interesse bewerbe ich mich. Durch meine Erfahrung und meine strukturierte Arbeitsweise bin ich ueberzeugt, Ihr Team sinnvoll unterstuetzen zu koennen.");
  document.getElementById("pv-stichwoerter3").textContent =
    data.stichwoerter3 || t("Gerne ueberzeuge ich Sie in einem persoenlichen Gespraech von meiner Motivation.");
  document.getElementById("pv-unterschrift").textContent = data.unterschrift || data.name || t("Max Mustermann");

  const previewPhoto = document.getElementById("pv-foto");
  if (previewPhoto) {
    if (data.foto) {
      previewPhoto.src = data.foto;
      previewPhoto.style.display = "block";
    } else {
      previewPhoto.removeAttribute("src");
      previewPhoto.style.display = "none";
    }
  }

  if (pulse) {
    pulseLivePreview();
  }
}

function normalizeDocumentStyle(styleName = DEFAULT_STYLE) {
  const cleanName = String(styleName || DEFAULT_STYLE).trim().split(/[\\/]/).pop();
  return DOCUMENT_STYLES.includes(cleanName) ? cleanName : DEFAULT_STYLE;
}

function applyDocumentStyle(styleName = DEFAULT_STYLE) {
  const themeLink = document.getElementById("theme-style");
  const preview = document.getElementById("preview");
  const normalized = normalizeDocumentStyle(styleName);

  if (themeLink) {
    themeLink.href = `styles/${normalized}`;
  }
  if (preview) {
    preview.dataset.style = normalized;
  }
  localStorage.setItem(STYLE_STORAGE_KEY, normalized);

  document.querySelectorAll(".style-chip").forEach(button => {
    button.classList.toggle("active", button.dataset.style === normalized);
  });
  if (document.getElementById("previewModal")?.classList.contains("open")) {
    refreshModalPreview();
  }
  pulseLivePreview();
}

function refreshModalPreview() {
  const host = document.getElementById("modalPreviewHost");
  const preview = document.getElementById("preview");
  if (!host || !preview) return;

  const clone = preview.cloneNode(true);
  clone.id = "preview-modal-doc";
  host.innerHTML = "";
  host.appendChild(clone);
}

function openPreviewModal() {
  saveAllFields();
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

function openPaymentFromMotivation(source) {
  console.info("[VitaGen Payment]", "motivation UI payment trigger", {
    source,
    hasPaymentApi: Boolean(window.VitaGenPayment?.open),
    hasBuyModal: Boolean(document.getElementById("buyModal"))
  });

  if (window.VitaGenPayment?.open) {
    window.VitaGenPayment.open();
    return;
  }

  const modal = document.getElementById("buyModal");
  if (!modal) {
    console.error("[VitaGen Payment]", "buyModal not found from motivation UI trigger");
    showToast("Das Zahlungsfenster konnte nicht geoeffnet werden. Bitte laden Sie die Seite neu.", "error", "Zahlung nicht bereit");
    return;
  }

  console.warn("[VitaGen Payment]", "payment.js API missing; opening modal fallback. Check /bewerbungs-generator/payment.js loading.");
  modal.style.display = "flex";
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  const paymentStatus = document.getElementById("paymentStatus");
  if (paymentStatus) {
    paymentStatus.textContent =
      translateValue("Zahlungsmodul wird geladen. Falls die Weiterleitung nicht startet, bitte Seite neu laden.");
  }
}

function installLivePreview() {
  const fields = [
    "name",
    "adresse",
    "kontakt",
    "posten",
    "arbeitgeber",
    "funktion",
    "stichwoerter",
    "stichwoerter2",
    "stichwoerter3",
    "datum",
    "unterschrift"
  ];

  fields.forEach(id => {
    document.getElementById(id)?.addEventListener("input", () => {
      saveAllFields();
      syncLivePreview();
    });
  });

  document.querySelectorAll(".style-chip").forEach(button => {
    button.addEventListener("click", () => applyDocumentStyle(button.dataset.style));
  });

  document.getElementById("closePreviewModal")?.addEventListener("click", closePreviewModal);
  document.querySelectorAll("[data-close-preview]").forEach(button => {
    button.addEventListener("click", closePreviewModal);
  });
  document.querySelectorAll("[data-trigger-buy]").forEach(button => {
    button.addEventListener("click", event => {
      if (event.defaultPrevented && window.VitaGenPayment?.open) {
        return;
      }

      event.preventDefault();
      openPaymentFromMotivation("preview-modal");
    });
  });
  if (!window.VitaGenPayment?.open) {
    document.getElementById("buyBtn")?.addEventListener("click", event => {
      event.preventDefault();
      openPaymentFromMotivation("download-card-fallback");
    });
  }
  document.getElementById("previewModal")?.addEventListener("click", event => {
    if (event.target?.id === "previewModal") {
      closePreviewModal();
    }
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      closePreviewModal();
    }
  });
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
    info: t("Hinweis")
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

function saveAllFields() {
  const data = getStoredData();

  data.name = document.getElementById("name")?.value || "";
  data.adresse = document.getElementById("adresse")?.value || "";
  data.kontakt = document.getElementById("kontakt")?.value || "";
  data.posten = document.getElementById("posten")?.value || "";
  data.arbeitgeber = document.getElementById("arbeitgeber")?.value || "";
  data.funktion = document.getElementById("funktion")?.value || "";
  data.stichwoerter = document.getElementById("stichwoerter")?.value || "";
  data.stichwoerter2 = document.getElementById("stichwoerter2")?.value || "";
  data.stichwoerter3 = document.getElementById("stichwoerter3")?.value || "";
  data.datum = document.getElementById("datum")?.value || "";
  data.unterschrift = document.getElementById("unterschrift")?.value || "";

  setStoredData(data);
  return data;
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
  if (loader) {
    loader.style.display = isLoading ? "grid" : "none";
  }
  if (aiBtn) {
    aiBtn.setAttribute("aria-busy", String(isLoading));
  }
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
  if (changeButton) {
    changeButton.hidden = false;
  }

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

  document.querySelectorAll("#foto-container, .generated-option").forEach(item => {
    item.classList.remove("selected");
  });

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

window.addEventListener("DOMContentLoaded", () => {
  installLanguageSwitch();
  const saved = getStoredData();
  const fields = [
    "name",
    "adresse",
    "kontakt",
    "posten",
    "arbeitgeber",
    "funktion",
    "stichwoerter",
    "stichwoerter2",
    "stichwoerter3",
    "datum",
    "unterschrift"
  ];

  fields.forEach(id => {
    const el = document.getElementById(id);
    if (el && saved[id]) {
      el.value = saved[id];
    }
  });

  renderOptionPlaceholders();
  updateCounter();

  if (saved.foto) {
    renderUploadPreview(saved.foto, true);
    setPhotoStatus("Foto fuer die Vorschau ausgewaehlt");
  }

  applyDocumentStyle(localStorage.getItem(STYLE_STORAGE_KEY) || DEFAULT_STYLE);
  installLivePreview();
  syncLivePreview({ pulse: false });
});

const fileInput = document.getElementById("foto-upload");

if (fileInput) {
  fileInput.addEventListener("change", event => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = e => {
      aiImageCount = 0;
      updateCounter();
      renderOptionPlaceholders();
      setPhotoStatus("Noch nicht generiert");

      const img = renderUploadPreview(e.target.result, true);
      if (img) {
        selectImage(img);
      }
    };
    reader.onerror = () => {
      showToast("Das Foto konnte nicht gelesen werden. Bitte versuchen Sie eine andere Datei.", "error", "Upload fehlgeschlagen");
    };
    reader.readAsDataURL(file);
  });
}

const changePhotoBtn = document.getElementById("changePhotoBtn");

if (changePhotoBtn && fileInput) {
  changePhotoBtn.addEventListener("click", () => {
    fileInput.click();
  });
}

const aiBtn = document.getElementById("aiFotoBtn");

if (aiBtn) {
  aiBtn.addEventListener("click", async function () {
    if (aiImageCount >= MAX_IMAGES) {
      showToast("Sie haben bereits 3 KI-Bilder generiert.", "info", "Limit erreicht");
      return;
    }

    const file = document.getElementById("foto-upload")?.files[0];

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
        body: formData
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
    } catch (err) {
      console.error("KI Foto Fehler:", err);
      setPhotoStatus("Generierung fehlgeschlagen");
      showToast("Das Foto konnte nicht generiert werden. Bitte versuchen Sie es erneut.", "error", "Generierung fehlgeschlagen");
    } finally {
      setPhotoLoading(false);
      aiBtn.disabled = false;
      aiBtn.innerText = aiImageCount > 0 ? translateValue("Weitere Option generieren") : originalButtonText;
    }
  });
}

const saveBtn = document.getElementById("saveBtn");

if (saveBtn) {
  saveBtn.addEventListener("click", () => {
    saveAllFields();
    syncLivePreview();
    showToast("Ihre Eingaben wurden lokal gespeichert.", "success", "Zwischengespeichert");
  });
}

const previewBtn = document.getElementById("previewBtn");

if (previewBtn) {
  previewBtn.addEventListener("click", () => {
    openPreviewModal();
  });
}

const textBtn = document.getElementById("generateTextBtn");

if (textBtn) {
  textBtn.addEventListener("click", async function () {
    const stichpunkte = document.getElementById("stichwoerter2")?.value.trim();
    const funktion = document.getElementById("funktion")?.value.trim();

    if (!stichpunkte) {
      showToast("Bitte Stichwoerter oder einen bestehenden Motivationstext eingeben.", "warning", "Text fehlt");
      return;
    }

    if (!funktion) {
      showToast("Bitte die Zielrolle fuer den Motivationstext eintragen.", "warning", "Rolle fehlt");
      return;
    }

    const originalButtonText = textBtn.innerText;
    textBtn.disabled = true;
    textBtn.innerText = translateValue("Generiere Text...");

    try {
      const response = await fetch(`${AI_API_BASE_URL}/generate-text`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stichpunkte, funktion })
      });

      if (!response.ok) {
        throw new Error(`Text generation failed with status ${response.status}`);
      }

      const result = await response.json();

      if (result.text) {
        document.getElementById("stichwoerter2").value = result.text;
        saveAllFields();
        syncLivePreview();
        showToast("Motivationstext wurde erstellt und bleibt editierbar.", "success", "KI-Text bereit");
      } else {
        showToast("Der Server hat keinen Text zurueckgegeben.", "error", "Kein Text erhalten");
      }
    } catch (err) {
      console.error("KI Text Fehler:", err);
      showToast("Der Motivationstext konnte nicht generiert werden. Bitte versuchen Sie es erneut.", "error", "Generierung fehlgeschlagen");
    } finally {
      textBtn.disabled = false;
      textBtn.innerText = originalButtonText;
    }
  });
}
