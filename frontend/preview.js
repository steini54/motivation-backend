console.log("✅ preview.js geladen");

// =============================
// DATEN AUS LOCALSTORAGE LADEN
// =============================
const savedData = JSON.parse(localStorage.getItem("vitagen_motivation") || "{}");
console.log("📦 Daten aus localStorage:", savedData);

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

  // Use innerHTML + replace \n with <br> so line breaks are preserved
  const setHTML = (id, value) => {
    const el = document.getElementById(id);
    if (el) {
      el.innerHTML = (value || "").replace(/\n/g, "<br>");
      console.log(`✅ setHTML("${id}"):`, value || "(leer)");
    } else {
      console.warn(`⚠️ Element "${id}" NICHT gefunden`);
    }
  };

  setHTML("pv-name",          data.name);
  setHTML("pv-adresse",       data.adresse);
  setHTML("pv-kontakt",       data.kontakt);
  setHTML("pv-kontakt-text",  data.kontakt);
  setHTML("pv-posten",        data.posten);
  setHTML("pv-posten-cover",  data.posten);
  setHTML("pv-funktion",      data.funktion);
  setHTML("pv-stichwoerter",  data.stichwoerter);
  setHTML("pv-stichwoerter2", data.stichwoerter2);
  setHTML("pv-stichwoerter3", data.stichwoerter3);
  setHTML("pv-datum",         data.datum);
  setHTML("pv-unterschrift",  data.unterschrift);
  setHTML("pv-arbeitgeber",   data.arbeitgeber);

  // Foto
  const img = document.getElementById("pv-foto");
  if (img) {
    if (
      data.foto &&
      data.foto !== window.PhotoStorage?.STORAGE_MARKER
    ) {
      img.src = data.foto;
      img.style.display = "block";
      console.log("✅ Foto gesetzt (base64 Länge):", data.foto.length);
    } else {
      img.style.display = "none";
      if (!data.foto) {
        console.warn("⚠️ Kein Foto in den Daten");
      }
    }
  } else {
    console.warn("⚠️ pv-foto Element NICHT gefunden");
  }
}

updatePreview(savedData);

async function loadStoredPhoto(data) {
  const img = document.getElementById("pv-foto");
  const photoStorage = window.PhotoStorage;

  if (
    !img ||
    !photoStorage ||
    data.foto !== photoStorage.STORAGE_MARKER
  ) {
    return;
  }

  try {
    const blob = await photoStorage.getSelectedPhoto();

    if (!(blob instanceof Blob) || !blob.type.startsWith("image/")) {
      img.removeAttribute("src");
      img.style.display = "none";
      console.warn("⚠️ Gespeichertes Foto wurde nicht gefunden");
      return;
    }

    img.src = photoStorage.createPhotoUrl(blob);
    img.style.display = "block";
    await img.decode().catch(() => {});
    console.log("✅ Foto aus IndexedDB geladen");
  } catch (error) {
    img.removeAttribute("src");
    img.style.display = "none";
    console.error("❌ Foto konnte nicht aus IndexedDB geladen werden:", error);
  }
}

loadStoredPhoto(savedData);

// =============================
// STYLE-SWITCHING
// =============================
const themeLink = document.getElementById("theme-style");
const buttons = document.querySelectorAll(".style-switch button");

console.log("🎨 themeLink:", themeLink ? "gefunden" : "NICHT gefunden");
console.log("🎨 Style-Buttons gefunden:", buttons.length);

if (themeLink) {
  const savedStyle = localStorage.getItem("vitagen_style");
  console.log("🎨 Gespeicherter Style:", savedStyle);

  if (savedStyle) {
    themeLink.href = "styles/" + savedStyle;
    console.log("🎨 Style gesetzt:", themeLink.href);
  }

  buttons.forEach(button => {
    button.addEventListener("click", () => {
      const file = button.dataset.style;
      console.log("🎨 Style-Button geklickt:", file);
      themeLink.href = "styles/" + file;
      localStorage.setItem("vitagen_style", file);
      buttons.forEach(btn => btn.classList.remove("active"));
      button.classList.add("active");
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
// KAUFEN BUTTON → MODAL ÖFFNEN
// =============================
const buyBtn = document.getElementById("buyBtn");
if (buyBtn) {
  console.log("🛒 buyBtn gefunden");
  buyBtn.addEventListener("click", () => {
    console.log("🛒 Kaufen Button geklickt – Modal öffnen");
    const modal = document.getElementById("buyModal");
    if (modal) modal.style.display = "flex";
  });
} else {
  console.warn("⚠️ buyBtn NICHT gefunden");
}

// =============================
// KAUFEN / PDF BUTTON
// =============================
const payBtn = document.getElementById("payBtn");
if (payBtn) {
  console.log("💳 payBtn gefunden");
  payBtn.addEventListener("click", async () => {
    console.log("💳 Bezahlen Button geklickt");

    const htmlContent = document.getElementById("preview")?.innerHTML;
    const stylePath = document.getElementById("theme-style")?.getAttribute("href");

    console.log("📤 Sende an /generate-pdf ...");
    console.log("📄 stylePath:", stylePath);

    try {
      const response = await fetch("https://motivation-backend-production-2800.up.railway.app/generate-pdf", {
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
