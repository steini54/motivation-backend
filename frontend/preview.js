console.log("✅ preview.js geladen");

// =============================
// DATEN AUS LOCALSTORAGE LADEN
// =============================
const savedData = JSON.parse(localStorage.getItem("vitagen_motivation") || "{}");
console.log("📦 Daten aus localStorage:", savedData);
let photoReadyPromise = Promise.resolve();

if (Object.keys(savedData).length === 0) {
  console.warn("⚠️ localStorage ist LEER – keine Formulardaten gefunden!");
} else {
  console.log("✅ Daten gefunden, Felder werden befüllt");
}

// =============================
// VORSCHAU BEFÜLLEN
// =============================
function updatePreview(data) {
  console.log("🔄 updatePreview() aufgerufen mit:", data);

  if (!data) {
    console.warn("⚠️ updatePreview: data ist null/undefined");
    return;
  }

  const setText = (id, value) => {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = value || "";
      console.log(`✅ setText("${id}"):`, value || "(leer)");
    } else {
      console.warn(`⚠️ Element "${id}" NICHT gefunden`);
    }
  };

  setText("pv-name",         data.name);
  setText("pv-adresse",      data.adresse);
  setText("pv-kontakt",      data.kontakt);
  setText("pv-kontakt-text", data.kontakt);
  setText("pv-posten",       data.posten);
  setText("pv-posten-cover", data.posten);
  setText("pv-funktion",     data.funktion);
  setText("pv-stichwoerter", data.stichwoerter);
  setText("pv-stichwoerter2",data.stichwoerter2);
  setText("pv-stichwoerter3",data.stichwoerter3);
  setText("pv-datum",        data.datum);
  setText("pv-unterschrift", data.unterschrift);
  setText("pv-hallo",        data.hallo);
  setText("pv-adieu",        data.adieu);

  // Adresse mit Zeilenumbruch
  const adresseEl = document.getElementById("pv-adresse");
  if (adresseEl) {
    adresseEl.innerHTML = (data.adresse || "").replace(/\n/g, "<br>");
    console.log("✅ pv-adresse (HTML):", adresseEl.innerHTML);
  }

  // Arbeitgeber mit Zeilenumbruch
  const arbeitgeberEl = document.getElementById("pv-arbeitgeber");
  if (arbeitgeberEl) {
    arbeitgeberEl.innerHTML = (data.arbeitgeber || "").replace(/\n/g, "<br>");
    console.log("✅ pv-arbeitgeber (HTML):", arbeitgeberEl.innerHTML);
  }

  // Foto wird separat asynchron aus IndexedDB geladen.
  const img = document.getElementById("pv-foto");
  if (img) {
    img.style.display = "none";
  } else {
    console.warn("⚠️ pv-foto Element NICHT gefunden");
  }
}

updatePreview(savedData);

async function loadSelectedPhoto(data) {
  const img = document.getElementById("pv-foto");
  if (!img || !window.PhotoStorage) return;

  try {
    let blob = await window.PhotoStorage.getSelectedPhoto();

    if (!blob && data.foto?.startsWith("data:image/")) {
      blob = await window.PhotoStorage.migrateLegacyPhoto(data.foto);
      data.foto = window.PhotoStorage.STORAGE_MARKER;
      localStorage.setItem("vitagen_motivation", JSON.stringify(data));
    }

    if (blob) {
      img.src = window.PhotoStorage.createPhotoUrl(blob);
      img.style.display = "block";
      await img.decode().catch(() => {});
      console.log("✅ Foto aus lokalem Medienspeicher geladen");
      return;
    }

    if (data.foto && !data.foto.startsWith("indexeddb:")) {
      img.src = data.foto;
      img.style.display = "block";
      await img.decode().catch(() => {});
    }
  } catch (error) {
    console.error("Foto konnte nicht geladen werden:", error);
    img.style.display = "none";
  }
}

photoReadyPromise = loadSelectedPhoto(savedData);

// =============================
// STYLE-SWITCHING
// =============================
const themeLink = document.getElementById("theme-style");
const buttons = document.querySelectorAll(".style-switch button");
const availableStyles = new Set(
  Array.from(buttons, button => button.dataset.style).filter(Boolean)
);
const defaultStyle = "classic.css";

function applyPreviewStyle(file, persist = true) {
  if (!themeLink) return;

  const selectedStyle = availableStyles.has(file) ? file : defaultStyle;
  themeLink.href = `/styles/${selectedStyle}`;
  buttons.forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.style === selectedStyle
    );
  });

  if (persist) {
    localStorage.setItem("vitagen_style", selectedStyle);
  }
}

console.log("🎨 themeLink:", themeLink ? "gefunden" : "NICHT gefunden");
console.log("🎨 Style-Buttons gefunden:", buttons.length);

if (themeLink) {
  const savedStyle = localStorage.getItem("vitagen_style");
  console.log("🎨 Gespeicherter Style:", savedStyle);

  if (savedStyle) {
    applyPreviewStyle(savedStyle);
    console.log("🎨 Style gesetzt:", themeLink.href);
  } else {
    applyPreviewStyle(defaultStyle, false);
  }

  themeLink.addEventListener("error", () => {
    if (!themeLink.href.endsWith(`/styles/${defaultStyle}`)) {
      applyPreviewStyle(defaultStyle);
    }
  });

  buttons.forEach(button => {
    button.addEventListener("click", () => {
      const file = button.dataset.style;
      console.log("🎨 Style-Button geklickt:", file);
      applyPreviewStyle(file);
    });
  });
}

// =============================
// ZURÜCK BUTTON
// =============================
const backBtn = document.getElementById("backBtn");
if (backBtn) {
  console.log("⬅️ backBtn gefunden");
  backBtn.addEventListener("click", () => {
    console.log("⬅️ Zurück zur Eingabe geklickt");
    window.location.href = "formular.html";
  });
} else {
  console.warn("⚠️ backBtn NICHT gefunden");
}

// =============================
// DRUCK BUTTON
// =============================
const printBtn = document.getElementById("printBtn");
if (printBtn) {
  console.log("🖨 printBtn gefunden");
  printBtn.addEventListener("click", () => {
    console.log("🖨 Druckvorschau geklickt");
    window.print();
  });
} else {
  console.warn("⚠️ printBtn NICHT gefunden");
}

// =============================
// KAUFEN / PDF BUTTON
// =============================
const payBtn = document.getElementById("payBtn");
if (payBtn) {
  console.log("💳 payBtn gefunden");
  payBtn.addEventListener("click", async () => {
    console.log("💳 Bezahlen Button geklickt");

    await photoReadyPromise;
    const htmlContent = document.getElementById("preview")?.innerHTML;
    const stylePath = document.getElementById("theme-style")?.getAttribute("href");

    console.log("📤 Sende an /generate-pdf ...");
    console.log("📄 stylePath:", stylePath);

    try {
      const response = await fetch("/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ htmlContent, stylePath })
      });

      console.log("📥 Response Status:", response.status);

      if (!response.ok) {
        const errText = await response.text();
        console.error("❌ /generate-pdf Fehler:", errText);
        alert("PDF Fehler: " + errText);
        return;
      }

      const blob = await response.blob();
      console.log("✅ PDF Blob erhalten, Grösse:", blob.size);

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Bewerbung.pdf";
      a.click();
      window.URL.revokeObjectURL(url);
      console.log("✅ PDF Download gestartet");

    } catch (err) {
      console.error("❌ PDF Fehler:", err);
      alert("Fehler beim PDF erstellen");
    }
  });
} else {
  console.warn("⚠️ payBtn NICHT gefunden");
}
