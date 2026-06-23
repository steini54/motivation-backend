console.log("preview.js loaded");

const savedData = JSON.parse(localStorage.getItem("vitagen_motivation") || "{}");
console.log("Stored preview data:", savedData);

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
  setHTML("pv-stichwoerter2", data.stichwoerter2);
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

  if (!img || !photoStorage || data.foto !== photoStorage.STORAGE_MARKER) {
    return;
  }

  try {
    const blob = await photoStorage.getSelectedPhoto();

    if (!(blob instanceof Blob) || !blob.type.startsWith("image/")) {
      img.removeAttribute("src");
      img.style.display = "none";
      return;
    }

    img.src = photoStorage.createPhotoUrl(blob);
    img.style.display = "block";
    await img.decode().catch(() => {});
  } catch (error) {
    img.removeAttribute("src");
    img.style.display = "none";
    console.error("Photo could not be loaded from IndexedDB:", error);
  }
}

loadStoredPhoto(savedData);

const themeLink = document.getElementById("theme-style");
const buttons = document.querySelectorAll(".style-switch button");

if (themeLink) {
  const savedStyle = localStorage.getItem("vitagen_style");

  if (savedStyle) {
    themeLink.href = "styles/" + savedStyle;
  }

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const file = button.dataset.style;
      themeLink.href = "styles/" + file;
      localStorage.setItem("vitagen_style", file);
      buttons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");
    });
  });
}

const backBtn = document.getElementById("backBtn");
if (backBtn) {
  backBtn.addEventListener("click", () => {
    window.location.href = "formular.html";
  });
}

const printBtn = document.getElementById("printBtn");
if (printBtn) {
  printBtn.addEventListener("click", () => {
    window.print();
  });
}
