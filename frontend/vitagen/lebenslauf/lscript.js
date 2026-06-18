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
    "nav.cv": "Lebenslauf",
    "nav.motivation": "Motivation",
    "nav.save": "Speichern",
    "nav.preview": "Vollbild-Vorschau",
    "cv.eyebrow": "CV Generator",
    "cv.title": "Lebenslauf erstellen",
    "cv.copy": "Strukturierter Editor fuer professionelle europaeische CVs mit Live-Vorschau, Stilwahl und KI-Bewerbungsfoto.",
  },
  en: {
    "nav.cv": "CV",
    "nav.motivation": "Motivation",
    "nav.save": "Save",
    "nav.preview": "Full preview",
    "cv.eyebrow": "CV Generator",
    "cv.title": "Create CV",
    "cv.copy": "A structured editor for professional European CVs with live preview, style selection, and AI application photo.",
  },
};

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

function applyLanguage(language = localStorage.getItem(LANGUAGE_STORAGE_KEY) || "de") {
  const normalized = normalizeLanguage(language);
  const dictionary = UI_TRANSLATIONS[normalized] || UI_TRANSLATIONS.de;
  document.documentElement.lang = normalized;
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
}

function installLanguageSwitch() {
  document.querySelectorAll("[data-lang]").forEach((button) => {
    button.addEventListener("click", () => applyLanguage(button.dataset.lang));
  });
  applyLanguage();
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
    return data["beruf-position"] || data["beruf-ort"] || "Berufserfahrung";
  }
  if (section === "schulbildung") {
    return data.schule || data["schule-abschluss"] || "Schulbildung";
  }
  if (section === "weiterbildung") {
    return data["weiterbildung-titel"] || "Weiterbildung";
  }
  if (section === "kenntnisse") {
    return data.kenntnisse || "Kenntnis";
  }
  if (section === "hobbys") {
    return data.hobbys || "Hobby";
  }
  return "Eintrag";
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
  toggle.setAttribute("aria-label", "Eintrag ein- oder ausklappen");
  toggle.textContent = "v";

  const remove = document.createElement("button");
  remove.type = "button";
  remove.className = "delete";
  remove.setAttribute("aria-label", "Eintrag entfernen");
  remove.textContent = "x";

  controls.append(toggle, remove);
  header.append(title, controls);

  const body = document.createElement("div");
  body.className = "entry-body";

  fields.forEach((field) => {
    const label = document.createElement("label");
    label.textContent = field.label;

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
    item.innerHTML = `<strong>${emptyText}</strong><span>Jetzt ergaenzen</span>`;
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
    pill.textContent = value;
    container.appendChild(pill);
  });
}

function syncLivePreview({ pulse = true } = {}) {
  const data = saveFormData();
  setTextWithBreaks(document.getElementById("pv-name"), data.name, "Max Muster");
  setTextWithBreaks(document.getElementById("pv-headline"), data.headline, "Kaufmaennischer Mitarbeiter");
  setTextWithBreaks(document.getElementById("pv-kontakt"), data.kontakt, "max@example.com\n+41 79 123 45 67");
  setTextWithBreaks(document.getElementById("pv-adresse"), data.adresse, "Bahnhofstrasse 12\n8001 Zuerich");
  setTextWithBreaks(
    document.getElementById("pv-profil"),
    data.profil,
    "Strukturierte, zuverlaessige Fachkraft mit Erfahrung in Organisation, Kommunikation und serviceorientierter Zusammenarbeit."
  );
  setTextWithBreaks(document.getElementById("pv-datum"), data.datum, "Zuerich, 18.06.2026");
  setTextWithBreaks(document.getElementById("pv-unterschrift"), data.unterschrift || data.name, "Max Muster");

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
      title: entry["beruf-position"] || "Position",
      meta: [entry["beruf-ort"], [entry["beruf-von"], entry["beruf-bis"]].filter(Boolean).join(" - ")].filter(Boolean).join(" | "),
      body: entry["beruf-aufgaben"] || entry["beruf-firma"] || "",
    }),
    "Berufserfahrung"
  );
  renderTimeline(
    "pv-schulbildung",
    data.schulbildung,
    (entry) => ({
      title: entry["schule-abschluss"] || entry.schule || "Schulbildung",
      meta: [entry.schule, entry["schule-ort"], [entry["schule-von"], entry["schule-bis"]].filter(Boolean).join(" - ")].filter(Boolean).join(" | "),
      body: "",
    }),
    "Schulbildung"
  );
  renderTimeline(
    "pv-weiterbildung",
    data.weiterbildung,
    (entry) => ({
      title: entry["weiterbildung-titel"] || "Weiterbildung",
      meta: [entry["weiterbildung-ort"], [entry["weiterbildung-von"], entry["weiterbildung-bis"]].filter(Boolean).join(" - ")].filter(Boolean).join(" | "),
      body: entry["weiterbildung-inhalt"] || "",
    }),
    "Weiterbildung"
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
    success: "Erledigt",
    error: "Fehler",
    warning: "Hinweis",
    info: "Info",
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
  heading.textContent = title || titles[type] || titles.info;

  const body = document.createElement("p");
  body.className = "toast-message";
  body.textContent = message;

  const close = document.createElement("button");
  close.type = "button";
  close.className = "toast-close";
  close.setAttribute("aria-label", "Meldung schliessen");
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
    counter.innerText = `KI-Funktion - ${aiImageCount} / ${MAX_IMAGES} generiert`;
  }
}

function setPhotoStatus(text) {
  const status = document.getElementById("photo-status");
  if (status) {
    status.textContent = text;
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
    label.textContent = "Bereit fuer KI-Foto";
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
  img.alt = "Ausgewaehltes Bewerbungsfoto";
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
  option.setAttribute("aria-label", `KI Foto Variante ${aiImageCount} auswaehlen`);

  const img = document.createElement("img");
  img.src = src;
  img.alt = `KI Foto Variante ${aiImageCount}`;

  const label = document.createElement("span");
  label.textContent = "Variante";

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
    aiBtn.innerText = "Generiere Foto...";
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
        aiBtn.innerText = aiImageCount > 0 ? "Weitere Option generieren" : originalButtonText;
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
      aiBtn.innerText = aiImageCount > 0 ? "Weitere Option generieren" : originalButtonText;
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
