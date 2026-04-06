console.log("SCRIPT GELADEN");

// Zähler für KI Bilder
let aiImageCount = 0;
const MAX_IMAGES = 3;

// =============================
// COUNTER FUNKTION
// =============================
function updateCounter() {
  const counter = document.getElementById("counter");
  if (counter) {
    counter.innerText = aiImageCount + " / " + MAX_IMAGES + " Bilder generiert";
  }
}

// =============================
// FOTO-UPLOAD + VORSCHAU
// =============================
const fileInput = document.getElementById("foto-upload");

if (fileInput) {
  fileInput.addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = function (e) {
      const container = document.getElementById("foto-container");

      // 🔄 Reset bei neuem Upload
      aiImageCount = 0;
      updateCounter();

     container.innerHTML = `
  <img src="${e.target.result}" 
       onclick="selectImage(this)"
       style="width:150px; height:auto; display:block; margin:10px auto; cursor:pointer;">
      `;
    };

    reader.readAsDataURL(file);
  });
}

// =============================
// KI FOTO GENERIEREN
// =============================
const aiBtn = document.getElementById("aiFotoBtn");

if (aiBtn) {
  aiBtn.addEventListener("click", async function () {
    console.log("AI BUTTON GEKLICKT");

    if (aiImageCount >= MAX_IMAGES) {
      alert("Maximal 3 KI Bilder erreicht");
      return;
    }

    try {
      const fileInput = document.getElementById("foto-upload");
      const file = fileInput.files[0];

      if (!file) {
        alert("Bitte zuerst ein Bild auswählen");
        return;
      }

      const loader = document.getElementById("loader");
      if (loader) loader.style.display = "block";

      const formData = new FormData();
      formData.append("photo", file);

      console.log("Sende Datei...");

      const response = await fetch("http://127.0.0.1:3000/generate-ai-photo", {
        method: "POST",
        body: formData
      });

      const data = await response.json();

      console.log("Antwort:", data);

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
      } else {
        alert("Kein Bild erhalten");
      }

    } catch (err) {
      console.error("FEHLER:", err);

      const loader = document.getElementById("loader");
      if (loader) loader.style.display = "none";

      alert("Fehler beim Generieren");
    }
  });
}

// =============================
// NEU: BILD AUSWÄHLEN (GRÜNER RAHMEN)
// =============================
function selectImage(element) {
  const allImages = document.querySelectorAll("#foto-container img");
  allImages.forEach(img => {
    img.style.border = "none";
  });

  element.style.border = "3px solid green";

  // 👉 bestehende Daten holen
  let data = JSON.parse(localStorage.getItem("vitagen_motivation") || "{}");

  // 👉 Bild speichern
  data.foto = element.src;

  localStorage.setItem("vitagen_motivation", JSON.stringify(data));

  console.log("Bild gespeichert:", data.foto);
}

// =============================
// VORSCHAU BUTTON
// =============================
const previewBtn = document.getElementById("previewBtn");

if (previewBtn) {
  previewBtn.addEventListener("click", () => {
    window.location.href = "preview.html";
  });
}

// =============================
// KI TEXT GENERATOR
// =============================
const textBtn = document.getElementById("generateTextBtn");

if (textBtn) {
  textBtn.addEventListener("click", async function () {
    console.log("TEXT BUTTON GEKLICKT");

    const stichpunkte = document.getElementById("stichwoerter2").value.trim();
    const funktion = document.getElementById("funktion").value.trim();

    if (!stichpunkte) {
      alert("Bitte Stichwörter eingeben");
      return;
    }

    if (!funktion) {
      alert("Bitte Bewerbung als... eingeben");
      return;
    }

    // Button Status ändern
    textBtn.disabled = true;
    textBtn.innerText = "Generiere Text...";

    try {
      const response = await fetch("http://127.0.0.1:3000/generate-text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          stichpunkte,
          funktion
        })
      });

      const data = await response.json();

      console.log("TEXT ANTWORT:", data);

      if (data.text) {
        document.getElementById("stichwoerter2").value = data.text;
      } else {
        alert("Kein Text erhalten");
      }

    } catch (err) {
      console.error("TEXT FEHLER:", err);
      alert("Fehler beim Generieren");
    }

    // Button zurücksetzen
    textBtn.disabled = false;
    textBtn.innerText = "🛠 KI Hilfe zum Fließtext erstellen";
  });
}
