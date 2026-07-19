console.log("preview.js loaded");

const MOTIVATION_TEXT_MAX_CHARS = 1748;
const savedData = JSON.parse(localStorage.getItem("vitagen_motivation") || "{}");
let resolvedPhotoUrl =
  savedData.foto && savedData.foto !== window.PhotoStorage?.STORAGE_MARKER
    ? savedData.foto
    : "";
console.log("Stored preview data:", savedData);

function normalizeMotivationTextWhitespace(value = "") {
  return String(value || "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function closeTextAtLimit(value, maxLength) {
  const source = String(value || "").trim();
  if (!source || /[.!?]$/.test(source)) {
    return source;
  }

  const withoutTrailingSeparator = source.replace(/[,:;]+$/, "");
  const withPeriod = `${withoutTrailingSeparator}.`;
  if (withPeriod.length <= maxLength) {
    return withPeriod;
  }

  return source;
}

function limitMotivationText(value = "") {
  const source = normalizeMotivationTextWhitespace(value);

  if (source.length <= MOTIVATION_TEXT_MAX_CHARS) {
    return source;
  }

  const slice = source.slice(0, MOTIVATION_TEXT_MAX_CHARS).trimEnd();

  return closeTextAtLimit(slice, MOTIVATION_TEXT_MAX_CHARS);
}

function updatePreview(data) {
  if (!data) {
    console.warn("updatePreview: missing data");
    return;
  }

  const setHTML = (id, value) => {
    const el = document.getElementById(id);
    if (el) {
      el.innerHTML = String(value || "").replace(/\n/g, "<br>");
    }
  };

  setHTML("pv-name", data.name);
  setHTML("pv-adresse", data.adresse);
  setHTML("pv-kontakt", data.kontakt);
  setHTML("pv-kontakt-text", data.kontakt);
  setHTML("pv-posten", data.posten);
  setHTML("pv-posten-cover", data.posten);
  setHTML("pv-funktion", data.funktion);
  setHTML("pv-stichwoerter", data.stichwoerter);
  setHTML("pv-stichwoerter2", limitMotivationText(data.stichwoerter2));
  setHTML("pv-stichwoerter3", data.stichwoerter3);
  setHTML("pv-datum", data.datum);
  setHTML("pv-unterschrift", data.unterschrift);
  setHTML("pv-arbeitgeber", data.arbeitgeber);

  const img = document.getElementById("pv-foto");
  if (!img) {
    return;
  }

  if (data.foto && data.foto !== window.PhotoStorage?.STORAGE_MARKER) {
    img.src = data.foto;
    img.style.display = "block";
  } else {
    img.removeAttribute("src");
    img.style.display = "none";
  }
}

updatePreview(savedData);

async function loadStoredPhoto(data) {
  const img = document.getElementById("pv-foto");
  const photoStorage = window.PhotoStorage;

  if (
    !img ||
    !photoStorage ||
    (data.foto && data.foto !== photoStorage.STORAGE_MARKER)
  ) {
    return;
  }

  try {
    const blob = await photoStorage.getSelectedPhoto();

    if (!(blob instanceof Blob) || !blob.type.startsWith("image/")) {
      img.removeAttribute("src");
      img.style.display = "none";
      return;
    }

    resolvedPhotoUrl = photoStorage.createPhotoUrl(blob);
    img.src = resolvedPhotoUrl;
    img.style.display = "block";
    await img.decode().catch(() => {});
    renderCanonicalPreview();
  } catch (error) {
    img.removeAttribute("src");
    img.style.display = "none";
    console.error("Photo could not be loaded from IndexedDB:", error);
  }
}

loadStoredPhoto(savedData);

const STYLE_STORAGE_KEY = "vitagen_motivation_style";
const DEFAULT_STYLE = "swiss-line.css";
const themeLink = document.getElementById("theme-style");
const buttons = Array.from(document.querySelectorAll(".style-switch button"));

function applyPreviewStyle(file) {
  const cleanFile = String(file || DEFAULT_STYLE).trim().split(/[\\/]/).pop();
  const selectedFile = cleanFile.endsWith(".css") ? cleanFile : DEFAULT_STYLE;

  if (themeLink) {
    themeLink.href = "styles/" + selectedFile;
  }

  localStorage.setItem(STYLE_STORAGE_KEY, selectedFile);
  buttons.forEach((button) => {
    const isActive = button.dataset.style === selectedFile;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
  renderCanonicalPreview(selectedFile);
}

if (themeLink && buttons.length > 0) {
  applyPreviewStyle(localStorage.getItem(STYLE_STORAGE_KEY) || DEFAULT_STYLE);

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      applyPreviewStyle(button.dataset.style);
    });
  });
}

function getStoredPreviewData() {
  try {
    return JSON.parse(localStorage.getItem("vitagen_motivation") || "{}");
  } catch (error) {
    console.error("Stored motivation data could not be read:", error);
    return {};
  }
}

function getCurrentPreviewStyle(fallback = "") {
  const previewStyle = document.getElementById("preview")?.dataset.style;
  const hrefStyle = themeLink?.getAttribute("href")?.split(/[\\/]/).pop();
  return (
    String(fallback || previewStyle || localStorage.getItem(STYLE_STORAGE_KEY) || hrefStyle || DEFAULT_STYLE)
      .trim()
      .split(/[\\/]/)
      .pop() || DEFAULT_STYLE
  );
}

function renderCanonicalPreview(styleName = "") {
  const preview = document.getElementById("preview");
  const renderer = window.VitaGenDocumentRenderer;
  if (!preview || !renderer?.renderInto) {
    return null;
  }

  const data = getStoredPreviewData();
  data.stichwoerter2 = limitMotivationText(data.stichwoerter2);
  const photoMarker = window.PhotoStorage?.STORAGE_MARKER;
  if (photoMarker && data.foto === photoMarker) {
    data.foto = resolvedPhotoUrl;
  } else if (data.foto) {
    resolvedPhotoUrl = data.foto;
  }

  const language = localStorage.getItem("vitagen_language") === "en" ? "en" : "de";
  const selectedStyle = getCurrentPreviewStyle(styleName);
  window.VitaGenCurrentDocumentData = data;
  window.VitaGenCurrentDocumentResult = renderer.renderInto(preview, {
    type: "motivation",
    data,
    styleName: selectedStyle,
    language,
    watermark: true,
  });
  document.documentElement.lang = language;
  return window.VitaGenCurrentDocumentResult;
}

window.VitaGenRenderPreview = () => renderCanonicalPreview();
renderCanonicalPreview();

const backBtn = document.getElementById("backBtn");
if (backBtn) {
  backBtn.addEventListener("click", () => {
    window.location.href = "formular.html";
  });
}
