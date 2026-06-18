const AI_API_BASE_URL = "https://motivation-backend-production-2800.up.railway.app";

let aiImageCount = 0;
const MAX_IMAGES = 3;
const STYLE_STORAGE_KEY = "vitagen_motivation_style";
const DEFAULT_STYLE = "swiss-line.css";

function getStoredData() {
  return JSON.parse(localStorage.getItem("vitagen_motivation") || "{}");
}

function setStoredData(data) {
  localStorage.setItem("vitagen_motivation", JSON.stringify(data));
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
  const role = data.posten || data.funktion || "Kaufmaennischer Mitarbeiter";
  const today = new Date().toLocaleDateString("de-CH");

  document.getElementById("pv-name").textContent = data.name || "Max Muster";
  document.getElementById("pv-kontakt").textContent = role.toUpperCase();
  setTextWithBreaks(
    document.getElementById("pv-arbeitgeber"),
    data.arbeitgeber,
    "Musterfirma AG\nPersonalabteilung\nLimmatquai 10\n8001 Zuerich"
  );
  document.getElementById("pv-datum").textContent = data.datum || `Zuerich, ${today}`;
  document.getElementById("pv-funktion").textContent = `Bewerbung als ${role}`;
  document.getElementById("pv-stichwoerter").textContent = data.stichwoerter || "Sehr geehrte Damen und Herren";
  document.getElementById("pv-stichwoerter2").textContent =
    data.stichwoerter2 ||
    "Mit grossem Interesse bewerbe ich mich. Durch meine Erfahrung und meine strukturierte Arbeitsweise bin ich ueberzeugt, Ihr Team sinnvoll unterstuetzen zu koennen.";
  document.getElementById("pv-stichwoerter3").textContent =
    data.stichwoerter3 || "Gerne ueberzeuge ich Sie in einem persoenlichen Gespraech von meiner Motivation.";
  document.getElementById("pv-unterschrift").textContent = data.unterschrift || data.name || "Max Muster";

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

function applyDocumentStyle(styleName = DEFAULT_STYLE) {
  const themeLink = document.getElementById("theme-style");
  const preview = document.getElementById("preview");
  const normalized = styleName || DEFAULT_STYLE;

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
    button.addEventListener("click", () => document.getElementById("buyBtn")?.click());
  });
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
    success: "Erledigt",
    error: "Fehler",
    warning: "Hinweis",
    info: "Info"
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
    label.textContent = "Bereit fur KI-Foto";

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
    aiBtn.innerText = "Generiere Foto...";
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
        aiBtn.innerText = aiImageCount > 0 ? "Weitere Option generieren" : originalButtonText;
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
      aiBtn.innerText = aiImageCount > 0 ? "Weitere Option generieren" : originalButtonText;
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
    textBtn.innerText = "Generiere Text...";

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
