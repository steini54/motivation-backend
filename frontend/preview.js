console.log("preview.js geladen");

// =============================
// === Style-Switching
// =============================
const themeLink = document.getElementById("theme-style");
const buttons = document.querySelectorAll(".style-switch button");

if (themeLink) {
  const savedStyle = localStorage.getItem("vitagen_style");
  if (savedStyle) {
    themeLink.href = "styles/" + savedStyle;
  }
  buttons.forEach(button => {
    button.addEventListener("click", () => {
      const file = button.dataset.style;
      themeLink.href = "styles/" + file;
      localStorage.setItem("vitagen_style", file);

      // Aktiven Button markieren
      buttons.forEach(btn => btn.classList.remove("active"));
      button.classList.add("active");
    });
  });
}

// =============================
// === Vorschau-Daten aus localStorage
// =============================
const savedData = JSON.parse(localStorage.getItem("vitagen_motivation") || "{}");

// =============================
// === Funktion: Update Preview
// =============================
function updatePreview(data) {
  if (!data) return;

  const setText = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value || "";
  };

  // Basisinformationen
  setText("pv-adresse", data.adresse);
  setText("pv-kontakt", data.kontakt);
  setText("pv-kontakt-text", data.kontakt);
  setText("pv-name", data.name);
  setText("pv-posten", data.posten);
  setText("pv-posten-cover", data.posten);
  setText("pv-funktion", data.funktion); // Korrekt: Funktion statt posten
  setText("pv-text", data.text);
  setText("pv-stichwoerter", data.stichwoerter);
  setText("pv-stichwoerter2", data.stichwoerter2);
  setText("pv-stichwoerter3", data.stichwoerter3);
  setText("pv-hallo", data.hallo);
  setText("pv-adieu", data.adieu);
  setText("pv-datum", data.datum);
  setText("pv-unterschrift", data.unterschrift);

  // Adresse mit Zeilenumbruch
  const adresseEl = document.getElementById("pv-adresse");
  if (adresseEl) {
    adresseEl.innerHTML = (data.adresse || "").replace(/\n/g, "<br>");
  }

  // Arbeitgeber mit Zeilenumbruch
  const arbeitgeberEl = document.getElementById("pv-arbeitgeber");
  if (arbeitgeberEl) {
    arbeitgeberEl.innerHTML = (data.arbeitgeber || "").replace(/\n/g, "<br>");
  }

  // Optionaler Fliesstext
  const textEl = document.getElementById("pv-text");
  if (textEl) {
    textEl.textContent = data.stichwoerter || "";
  }

  // Bewerbungsfoto
  const img = document.getElementById("pv-foto");
  if (img) {
    if (data.foto) {
      img.src = data.foto;
      img.style.display = "block";
    } else {
      img.style.display = "none";
    }
  }
}

// Vorschau beim Laden setzen
updatePreview(savedData);

// =============================
// === Buttons
// =============================

// Zurück-zur-Eingabe
const backBtn = document.getElementById("backBtn");
if (backBtn) {
  backBtn.addEventListener("click", () => {
    window.location.href = "formular.html";
  });
}

// Druckvorschau
const printBtn = document.getElementById("printBtn");
if (printBtn) {
  printBtn.addEventListener("click", () => {
    window.print();
  });
}

// =============================
// === Live-Update für Feld "Funktion"
// =============================
const inputFunktion = document.getElementById("funktion");
const pvFunktion = document.getElementById("pv-funktion");

if (inputFunktion && pvFunktion) {
  // Gespeicherten Wert beim Laden setzen
  pvFunktion.textContent = savedData.funktion || "||";

  // Live-Update beim Tippen
  inputFunktion.addEventListener("input", () => {
    pvFunktion.textContent = inputFunktion.value.trim() || "||";
  });
}

document.getElementById("payBtn").addEventListener("click", async () => {

  const htmlContent = document.getElementById("preview").innerHTML;
  const stylePath = document.getElementById("theme-style").getAttribute("href");

  const response = await fetch("/generate-pdf", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      htmlContent,
      stylePath,
    }),
  });

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "Bewerbung.pdf";
  a.click();

  window.URL.revokeObjectURL(url);
});