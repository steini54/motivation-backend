console.log("lpreview.js loaded");

const saved = JSON.parse(localStorage.getItem("vitagen_lebenslauf") || "{}");
let resolvedPhotoUrl =
  saved.foto && saved.foto !== window.PhotoStorage?.STORAGE_MARKER
    ? saved.foto
    : "";

document.getElementById("pv-name").textContent = saved.name || "";
document.getElementById("pv-adresse").textContent = saved.adresse || "";
document.getElementById("pv-kontakt").textContent = saved.kontakt || "";

const fotoEl = document.getElementById("pv-foto");
if (saved.foto && saved.foto !== window.PhotoStorage?.STORAGE_MARKER && fotoEl) {
  fotoEl.src = saved.foto;
  fotoEl.style.display = "block";
}

async function restoreStoredPhoto() {
  if (!fotoEl || !window.PhotoStorage?.getSelectedPhoto || !window.PhotoStorage?.createPhotoUrl) {
    return;
  }

  if (saved.foto && saved.foto !== window.PhotoStorage.STORAGE_MARKER) {
    return;
  }

  try {
    const blob = await window.PhotoStorage.getSelectedPhoto();
    if (blob instanceof Blob && blob.type.startsWith("image/")) {
      resolvedPhotoUrl = window.PhotoStorage.createPhotoUrl(blob);
      fotoEl.src = resolvedPhotoUrl;
      fotoEl.style.display = "block";
      await fotoEl.decode().catch(() => {});
      renderCanonicalPreview();
    }
  } catch (error) {
    console.error("Photo could not be loaded from IndexedDB:", error);
  }
}

restoreStoredPhoto();

function fillSection(containerId, entries) {
  const container = document.getElementById(containerId);
  if (!container || !Array.isArray(entries)) {
    return;
  }

  container.innerHTML = "";

  entries.forEach((entry) => {
    const div = document.createElement("div");
    div.className = "pv-entry";

    const values = Object.values(entry || {}).filter(
      (value) => value && String(value).trim() !== ""
    );

    if (
      containerId === "pv-schulbildung" ||
      containerId === "pv-beruf" ||
      containerId === "pv-weiterbildung"
    ) {
      if (values.length >= 4) {
        const firstRow = document.createElement("div");
        firstRow.className = "pv-row";

        const left = document.createElement("span");
        left.textContent = values[0];

        const right = document.createElement("span");
        right.className = "pv-date";
        right.textContent = `${values[2]} - ${values[3]}`;

        firstRow.appendChild(left);
        firstRow.appendChild(right);
        div.appendChild(firstRow);

        values.forEach((value, index) => {
          if (index !== 0 && index !== 2 && index !== 3) {
            const p = document.createElement("p");
            p.textContent = value;
            div.appendChild(p);
          }
        });
      }
    } else {
      values.forEach((value) => {
        const p = document.createElement("p");
        p.textContent = value;
        div.appendChild(p);
      });
    }

    container.appendChild(div);
  });
}

fillSection("pv-schulbildung", saved.schulbildung);
fillSection("pv-beruf", saved.beruf);
fillSection("pv-weiterbildung", saved.weiterbildung);
fillSection("pv-kenntnisse", saved.kenntnisse);
fillSection("pv-hobbys", saved.hobbys);
fillSection("pv-sprachen", saved.sprachen);

document.getElementById("pv-datum").textContent = saved.datum || "";
document.getElementById("pv-unterschrift").textContent = saved.unterschrift || "";

const backBtn = document.getElementById("backBtn");
if (backBtn) {
  backBtn.addEventListener("click", () => {
    window.location.href = "lebensformular.html";
  });
}

const STYLE_STORAGE_KEY = "vitagen_lebenslauf_style";
const DEFAULT_STYLE = "swiss-line.css";
const themeLink = document.getElementById("theme-style");
const styleButtons = Array.from(document.querySelectorAll(".style-switch button"));

function applyPreviewStyle(file) {
  const cleanFile = String(file || DEFAULT_STYLE).trim().split(/[\\/]/).pop();
  const selectedFile = cleanFile.endsWith(".css") ? cleanFile : DEFAULT_STYLE;

  if (themeLink) {
    themeLink.href = "styles/" + selectedFile;
  }

  localStorage.setItem(STYLE_STORAGE_KEY, selectedFile);
  styleButtons.forEach((button) => {
    const isActive = button.dataset.style === selectedFile;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
  renderCanonicalPreview(selectedFile);
}

if (themeLink && styleButtons.length > 0) {
  applyPreviewStyle(localStorage.getItem(STYLE_STORAGE_KEY) || DEFAULT_STYLE);

  styleButtons.forEach((button) => {
    button.addEventListener("click", () => {
      applyPreviewStyle(button.dataset.style);
    });
  });
}

function getStoredPreviewData() {
  try {
    return JSON.parse(localStorage.getItem("vitagen_lebenslauf") || "{}");
  } catch (error) {
    console.error("Stored CV data could not be read:", error);
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
    type: "cv",
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
