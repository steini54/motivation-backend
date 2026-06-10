console.log("✅ script.js geladen");

const AI_API_BASE_URL = "https://motivation-backend-production-2800.up.railway.app";

// =============================
// HILFSFUNKTION: Alle Felder speichern
// =============================
function saveAllFields() {
  console.log("💾 saveAllFields() aufgerufen");

  let data = JSON.parse(localStorage.getItem("vitagen_motivation") || "{}");
  console.log("📦 Vorherige Daten:", data);

  data.name          = document.getElementById("name")?.value || "";
  data.adresse       = document.getElementById("adresse")?.value || "";
  data.kontakt       = document.getElementById("kontakt")?.value || "";
  data.posten        = document.getElementById("posten")?.value || "";
  data.arbeitgeber   = document.getElementById("arbeitgeber")?.value || "";
  data.funktion      = document.getElementById("funktion")?.value || "";
  data.stichwoerter  = document.getElementById("stichwoerter")?.value || "";
  data.stichwoerter2 = document.getElementById("stichwoerter2")?.value || "";
  data.stichwoerter3 = document.getElementById("stichwoerter3")?.value || "";
  data.datum         = document.getElementById("datum")?.value || "";
  data.unterschrift  = document.getElementById("unterschrift")?.value || "";

  localStorage.setItem("vitagen_motivation", JSON.stringify(data));
  console.log("✅ Gespeicherte Daten:", data);
  return data;
}

// =============================
// GESPEICHERTE DATEN BEIM LADEN WIEDERHERSTELLEN
// =============================
window.addEventListener("DOMContentLoaded", () => {
  console.log("📄 DOM geladen – Felder wiederherstellen");

  const saved = JSON.parse(localStorage.getItem("vitagen_motivation") || "{}");
  console.log("📦 Gespeicherte Daten aus localStorage:", saved);

  const fields = ["name","adresse","kontakt","posten","arbeitgeber","funktion",
                  "stichwoerter","stichwoerter2","stichwoerter3","datum","unterschrift"];

  fields.forEach(id => {
    const el = document.getElementById(id);
    if (el && saved[id]) {
      el.value = saved[id];
      console.log(`🔁 Feld "${id}" wiederhergestellt:`, saved[id]);
    }
  });

  // Foto wiederherstellen
  if (saved.foto) {
    console.log("🖼 Foto vorhanden, wird in Container geladen");
    const container = document.getElementById("foto-container");
    if (container) {
      container.innerHTML = `
        <img src="${saved.foto}"
             onclick="selectImage(this)"
             style="width:150px; height:auto; display:block; margin:10px auto; cursor:pointer; border:3px solid green;">
      `;
    }
  }
});

// =============================
// COUNTER
// =============================
let aiImageCount = 0;
const MAX_IMAGES = 3;

function updateCounter() {
  const counter = document.getElementById("counter");
  if (counter) {
    counter.innerText = aiImageCount + " / " + MAX_IMAGES + " Bilder generiert";
    console.log("🔢 Counter aktualisiert:", aiImageCount);
  }
}

// =============================
// FOTO-UPLOAD
// =============================
const fileInput = document.getElementById("foto-upload");

if (fileInput) {
  console.log("📁 foto-upload Element gefunden");
  fileInput.addEventListener("change", function (event) {
    console.log("📁 Datei ausgewählt:", event.target.files[0]?.name);
    const file = event.target.files[0];
    if (!file) {
      console.warn("⚠️ Keine Datei ausgewählt");
      return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
      console.log("✅ Datei gelesen, Vorschau wird angezeigt");
      aiImageCount = 0;
      updateCounter();

      const container = document.getElementById("foto-container");
      container.innerHTML = `
        <img src="${e.target.result}"
             onclick="selectImage(this)"
             style="width:150px; height:auto; display:block; margin:10px auto; cursor:pointer;">
      `;
    };
    reader.onerror = function(e) {
      console.error("❌ FileReader Fehler:", e);
    };
    reader.readAsDataURL(file);
  });
} else {
  console.warn("⚠️ foto-upload Element NICHT gefunden");
}

// =============================
// BILD AUSWÄHLEN
// =============================
function selectImage(element) {
  console.log("🖼 Bild ausgewählt");
  const allImages = document.querySelectorAll("#foto-container img");
  allImages.forEach(img => img.style.border = "none");
  element.style.border = "3px solid green";

  let data = JSON.parse(localStorage.getItem("vitagen_motivation") || "{}");
  data.foto = element.src;
  localStorage.setItem("vitagen_motivation", JSON.stringify(data));
  console.log("✅ Foto gespeichert (base64, Länge):", data.foto?.length);
}

// =============================
// KI FOTO GENERIEREN
// =============================
const aiBtn = document.getElementById("aiFotoBtn");

if (aiBtn) {
  console.log("🤖 aiFotoBtn gefunden");
  aiBtn.addEventListener("click", async function () {
    console.log("🤖 KI Foto Button geklickt");

    if (aiImageCount >= MAX_IMAGES) {
      console.warn("⚠️ Maximal 3 KI Bilder erreicht");
      alert("Maximal 3 KI Bilder erreicht");
      return;
    }

    const fileInput = document.getElementById("foto-upload");
    const file = fileInput?.files[0];

    if (!file) {
      console.warn("⚠️ Kein Bild ausgewählt");
      alert("Bitte zuerst ein Bild auswählen");
      return;
    }

    const loader = document.getElementById("loader");
    if (loader) loader.style.display = "block";

    const formData = new FormData();
    formData.append("photo", file);

    console.log("📤 Sende Foto an /generate-ai-photo ...");

    try {
      const response = await fetch(`${AI_API_BASE_URL}/generate-ai-photo`, {
        method: "POST",
        body: formData
      });

      console.log("📥 Response Status:", response.status);

      const data = await response.json();
      console.log("📥 Response Daten:", data);

      if (loader) loader.style.display = "none";

      if (data.aiFoto) {
        aiImageCount++;
        updateCounter();
        const container = document.getElementById("foto-container");
        container.innerHTML += `
          <img src="${data.aiFoto}"
               onclick="selectImage(this)"
               style="max-width:150px; height:auto; object-fit:cover; display:block; margin:10px auto; cursor:pointer;">
        `;
        console.log("✅ KI Foto hinzugefügt");
      } else {
        console.error("❌ Kein aiFoto in Response:", data);
        alert("Kein Bild erhalten");
      }

    } catch (err) {
      console.error("❌ KI Foto Fehler:", err);
      if (loader) loader.style.display = "none";
      alert("Fehler beim Generieren");
    }
  });
} else {
  console.warn("⚠️ aiFotoBtn NICHT gefunden");
}

// =============================
// ZWISCHENSPEICHERN BUTTON
// =============================
const saveBtn = document.getElementById("saveBtn");

if (saveBtn) {
  console.log("💾 saveBtn gefunden");
  saveBtn.addEventListener("click", () => {
    console.log("💾 Speichern Button geklickt");
    saveAllFields();
    alert("✅ Zwischengespeichert!");
  });
} else {
  console.warn("⚠️ saveBtn NICHT gefunden");
}

// =============================
// VORSCHAU BUTTON
// =============================
const previewBtn = document.getElementById("previewBtn");

if (previewBtn) {
  console.log("👁 previewBtn gefunden");
  previewBtn.addEventListener("click", () => {
    console.log("👁 Vorschau Button geklickt – speichere alle Felder...");
    const data = saveAllFields();
    console.log("✅ Daten gespeichert, navigiere zu preview.html. Daten:", data);
    window.location.href = "preview.html";
  });
} else {
  console.warn("⚠️ previewBtn NICHT gefunden");
}

// =============================
// KI TEXT GENERATOR
// =============================
const textBtn = document.getElementById("generateTextBtn");

if (textBtn) {
  console.log("🛠 generateTextBtn gefunden");
  textBtn.addEventListener("click", async function () {
    console.log("🛠 KI Text Button geklickt");

    const stichpunkte = document.getElementById("stichwoerter2")?.value.trim();
    const funktion = document.getElementById("funktion")?.value.trim();

    console.log("📝 stichpunkte:", stichpunkte);
    console.log("📝 funktion:", funktion);

    if (!stichpunkte) {
      console.warn("⚠️ Keine Stichwörter eingegeben");
      alert("Bitte Stichwörter eingeben");
      return;
    }

    if (!funktion) {
      console.warn("⚠️ Keine Funktion eingegeben");
      alert("Bitte Bewerbung als... eingeben");
      return;
    }

    textBtn.disabled = true;
    textBtn.innerText = "Generiere Text...";

    console.log("📤 Sende an /generate-text ...");

    try {
      const response = await fetch(`${AI_API_BASE_URL}/generate-text`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stichpunkte, funktion })
      });

      console.log("📥 Response Status:", response.status);
      const data = await response.json();
      console.log("📥 Response Daten:", data);

      if (data.text) {
        document.getElementById("stichwoerter2").value = data.text;
        console.log("✅ Text eingesetzt");
      } else {
        console.error("❌ Kein Text in Response:", data);
        alert("Kein Text erhalten");
      }

    } catch (err) {
      console.error("❌ KI Text Fehler:", err);
      alert("Fehler beim Generieren");
    }

    textBtn.disabled = false;
    textBtn.innerText = "🛠 KI Hilfe zum Fließtext erstellen";
  });
} else {
  console.warn("⚠️ generateTextBtn NICHT gefunden");
}
