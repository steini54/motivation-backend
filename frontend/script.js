console.log("✅ script.js geladen");

const PHOTO_MARKER = window.PhotoStorage?.STORAGE_MARKER;

function setPhotoStatus(message, isError = false) {
  const status = document.getElementById("foto-status");
  if (!status) return;

  status.textContent = message || "";
  status.style.color = isError ? "#b42318" : "#166534";
}

function createPhotoElement(blob, { selected = false, generated = false } = {}) {
  const image = document.createElement("img");
  image.src = window.PhotoStorage.createPhotoUrl(blob);
  image.alt = generated ? "KI-generiertes Bewerbungsfoto" : "Originalfoto";
  image.photoBlob = blob;
  image.dataset.generated = generated ? "true" : "false";
  image.style.width = "150px";
  image.style.height = "auto";
  image.style.display = "block";
  image.style.margin = "10px auto";
  image.style.cursor = "pointer";
  image.style.border = selected ? "3px solid green" : "none";
  image.addEventListener("click", () => selectImage(image));
  return image;
}

async function restoreSelectedPhoto(saved) {
  if (!window.PhotoStorage) return;

  let blob = await window.PhotoStorage.getSelectedPhoto();
  if (!blob && saved.foto?.startsWith("data:image/")) {
    blob = await window.PhotoStorage.migrateLegacyPhoto(saved.foto);
    saved.foto = PHOTO_MARKER;
    localStorage.setItem("vitagen_motivation", JSON.stringify(saved));
  }

  if (!blob) return;

  const container = document.getElementById("foto-container");
  if (container) {
    container.replaceChildren(createPhotoElement(blob, { selected: true }));
  }
}

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
window.addEventListener("DOMContentLoaded", async () => {
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

  try {
    await restoreSelectedPhoto(saved);
  } catch (error) {
    console.error("Foto konnte nicht wiederhergestellt werden:", error);
    setPhotoStatus("Das gespeicherte Foto konnte nicht geladen werden.", true);
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
  fileInput.addEventListener("change", async function (event) {
    console.log("📁 Datei ausgewählt:", event.target.files[0]?.name);
    const file = event.target.files[0];
    if (!file) {
      console.warn("⚠️ Keine Datei ausgewählt");
      return;
    }

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setPhotoStatus("Bitte JPEG, PNG oder WebP verwenden.", true);
      event.target.value = "";
      return;
    }

    aiImageCount = 0;
    updateCounter();
    setPhotoStatus("");

    const container = document.getElementById("foto-container");
    const image = createPhotoElement(file, { selected: true });
    container.replaceChildren(image);

    try {
      await window.PhotoStorage.saveSourcePhoto(file);
      await selectImage(image);
    } catch (error) {
      console.error("Foto konnte nicht gespeichert werden:", error);
      setPhotoStatus("Das Foto konnte nicht lokal gespeichert werden.", true);
    }
  });
} else {
  console.warn("⚠️ foto-upload Element NICHT gefunden");
}

// =============================
// BILD AUSWÄHLEN
// =============================
async function selectImage(element) {
  console.log("🖼 Bild ausgewählt");
  const allImages = document.querySelectorAll("#foto-container img");
  allImages.forEach(img => img.style.border = "none");
  element.style.border = "3px solid green";

  const blob = await window.PhotoStorage.blobFromImageElement(element);
  await window.PhotoStorage.saveSelectedPhoto(blob);

  const data = JSON.parse(localStorage.getItem("vitagen_motivation") || "{}");
  data.foto = PHOTO_MARKER;
  localStorage.setItem("vitagen_motivation", JSON.stringify(data));
  setPhotoStatus(
    element.dataset.generated === "true"
      ? "KI-Foto ausgewählt und lokal gespeichert."
      : "Originalfoto ausgewählt und lokal gespeichert."
  );
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
    const uploadedFile = fileInput?.files[0];
    let sourcePhoto = uploadedFile;

    if (!sourcePhoto) {
      try {
        sourcePhoto = await window.PhotoStorage.getSourcePhoto();
      } catch (error) {
        console.error("Originalfoto konnte nicht geladen werden:", error);
        setPhotoStatus(
          "Das Originalfoto konnte nicht lokal geladen werden.",
          true
        );
        return;
      }
    }

    if (!sourcePhoto) {
      console.warn("⚠️ Kein Bild ausgewählt");
      alert("Bitte zuerst ein Bild auswählen");
      return;
    }

    const loader = document.getElementById("loader");
    if (loader) loader.style.display = "block";
    aiBtn.disabled = true;
    setPhotoStatus(
      "Foto wird bearbeitet und anschliessend auf Identität geprüft..."
    );

    const formData = new FormData();
    formData.append(
      "photo",
      sourcePhoto,
      uploadedFile?.name || "bewerbungsfoto-source.jpg"
    );

    console.log("📤 Sende Foto an /generate-ai-photo ...");

    try {
      const response = await fetch("/generate-ai-photo", {
        method: "POST",
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Das Foto konnte nicht erstellt werden.");
      }

      if (!data.aiFoto) {
        throw new Error("Die KI hat kein Bild zurückgegeben.");
      }

      const generatedBlob = await window.PhotoStorage.dataUrlToBlob(data.aiFoto);
      const generatedImage = createPhotoElement(generatedBlob, {
        generated: true,
      });
      document.getElementById("foto-container").appendChild(generatedImage);

      aiImageCount++;
      updateCounter();
      const confidence = Number(data.quality?.identityConfidence);
      const confidenceText = Number.isFinite(confidence)
        ? ` Identitätsprüfung: ${Math.round(confidence * 100)}%.`
        : "";
      setPhotoStatus(
        `KI-Foto erstellt und geprüft.${confidenceText} Klicke es an, um es auszuwählen.`
      );
    } catch (err) {
      console.error("❌ KI Foto Fehler:", err);
      setPhotoStatus(err.message || "Fehler beim Generieren.", true);
    } finally {
      if (loader) loader.style.display = "none";
      aiBtn.disabled = false;
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
      const response = await fetch("/generate-text", {
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
