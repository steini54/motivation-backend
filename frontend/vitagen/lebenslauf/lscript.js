console.log("lscript.js geladen");

// =============================
// === Formular Setup
// =============================
const form = document.getElementById("vitagenForm");

// =============================
// === Daten speichern / laden
// =============================
function saveFormData() {
  const data = {};

  // Einzelne Felder
  ["name", "adresse", "kontakt", "datum", "unterschrift"].forEach(id => {
    const el = document.getElementById(id);
    if (el) data[id] = el.value;
  });

  // Foto
  const savedData = JSON.parse(localStorage.getItem("vitagen_lebenslauf") || "{}");
  if (savedData.foto) data.foto = savedData.foto;

  // Arrays für Mehrfach-Einträge
  ["schulbildung","beruf","weiterbildung","kenntnisse","hobbys"].forEach(section => {
    data[section] = getEntriesData(section);
  });

  localStorage.setItem("vitagen_lebenslauf", JSON.stringify(data));
}

// =============================
// === Hilfsfunktion: alle Einträge einer Section sammeln
// =============================
function getEntriesData(sectionClass) {
  const entries = [];
  const container = document.querySelector(`.${sectionClass}-entries`);
  if (!container) return entries;

  container.querySelectorAll(".entry").forEach(entry => {
    const obj = {};
    entry.querySelectorAll("input, textarea").forEach(input => {
      obj[input.className] = input.value;
    });
    entries.push(obj);
  });

  return entries;
}

// =============================
// === Daten laden
// =============================
function loadFormData() {
  const saved = JSON.parse(localStorage.getItem("vitagen_lebenslauf") || "{}");

  // Einzelne Felder
  ["name", "adresse", "kontakt", "datum", "unterschrift"].forEach(id => {
    const el = document.getElementById(id);
    if (el && saved[id]) el.value = saved[id];
  });

  // Foto
  if (saved.foto) {
    const fotoContainer = document.getElementById("foto-container");
    if (fotoContainer) {
      fotoContainer.innerHTML = `<img src="${saved.foto}" style="max-width:150px;margin:10px auto;display:block;border-radius:4px;">`;
    }
  }

  // Mehrfach-Einträge laden
  ["schulbildung","beruf","weiterbildung","kenntnisse","hobbys"].forEach(section => {
    loadEntries(section, saved[section] || []);
  });
}

// =============================
// === FOTO-UPLOAD
// =============================
const fileInput = document.getElementById('foto-upload');
if (fileInput) {
  fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
      const fotoData = e.target.result;
      const savedData = JSON.parse(localStorage.getItem("vitagen_lebenslauf") || "{}");
      savedData.foto = fotoData;
      localStorage.setItem("vitagen_lebenslauf", JSON.stringify(savedData));

      const fotoContainer = document.getElementById('foto-container');
      if (fotoContainer) {
        fotoContainer.innerHTML = `<img src="${fotoData}" style="max-width:150px;margin:10px auto;display:block;border-radius:4px;">`;
      }
    };
    reader.readAsDataURL(file);
  });
}

// =============================
// === Buttons: Speichern & Vorschau
// =============================
const saveBtn = document.getElementById("saveBtn");
if (saveBtn) saveBtn.addEventListener("click", saveFormData);

const previewBtn = document.getElementById("previewBtn");
if (previewBtn) {
  previewBtn.addEventListener("click", () => {
    saveFormData();
    window.open("lpreview.html");
  });
}

// Formular niemals normal absenden
if (form) form.addEventListener("submit", e => e.preventDefault());

// =============================
// === + Eintrag hinzufügen / Toggle / Löschen
// =============================
document.querySelectorAll(".add-btn").forEach(btn => {
  btn.addEventListener("click", () => handleAddEntry(btn.dataset.section));
});

function handleAddEntry(section) {
  switch (section) {
    case "schulbildung": addSchulbildungEntry(); break;
    case "beruf": addBerufEntry(); break;
    case "weiterbildung": addWeiterbildungEntry(); break;
    case "kenntnisse": addKenntnisseEntry(); break;
    case "hobbys": addHobbysEntry(); break;
    default: console.warn("Unbekannte Section:", section);
  }
}

// =============================
// === Generische Entry-Erstellung
// =============================
function createEntry(section, fieldsArray, data = {}) {
  const container = document.querySelector(`.${section}-entries`);
  if (!container) return;

  const entry = document.createElement("div");
  entry.className = "entry";

  let innerHTML = `<div class="entry-header">
    <span class="entry-title">${Object.values(data)[0] || "Neuer Eintrag"}</span>
    <button type="button" class="toggle">▾</button>
    <button type="button" class="delete">🗑️</button>
  </div><div class="entry-body hidden">`;

  fieldsArray.forEach(f => {
    if (f.type === "textarea") {
      innerHTML += `<label>${f.label}</label>
        <textarea class="${section}-${f.name}">${data[section + "-" + f.name] || ""}</textarea>`;
    } else {
      innerHTML += `<label>${f.label}</label>
        <input type="text" class="${section}-${f.name}" value="${data[section + "-" + f.name] || ""}">`;
    }
  });

  innerHTML += `</div>`;
  entry.innerHTML = innerHTML;
  container.appendChild(entry);

  // Toggle
  const body = entry.querySelector(".entry-body");
  entry.querySelector(".toggle").onclick = () => body.classList.toggle("hidden");

  // Löschen
  entry.querySelector(".delete").onclick = () => {
    entry.remove();
    saveFormData();
  };

  // Live Update für Titel
  const firstInput = entry.querySelector("input, textarea");
  if (firstInput) {
    firstInput.addEventListener("input", e => {
      entry.querySelector(".entry-title").textContent = e.target.value || "Neuer Eintrag";
      saveFormData();
    });
  }

  // Auto-Save für alle Inputs & Textareas
  entry.querySelectorAll("input, textarea").forEach(i => i.addEventListener("input", saveFormData));
}

// =============================
// === Section-spezifische Funktionen
// =============================
function addSchulbildungEntry(data = {}) {
  createEntry("schulbildung", [
    {name:"schule", label:"Schule"}, 
    {name:"schule-ort", label:"Ort / Land"}, 
    {name:"von", label:"Von"}, 
    {name:"bis", label:"Bis"}, 
    {name:"abschluss", label:"Abschluss"}
  ], data);
}

function addBerufEntry(data = {}) {
  createEntry("beruf", [
    {name:"position", label:"Position"}, 
	{name:"firma", label:"Unternehmen"}, 
    {name:"ort", label:"Ort / Land"}, 
    {name:"von", label:"Von"}, 
    {name:"bis", label:"Bis"}, 
    {name:"aufgaben", label:"Tätigkeit / Aufgaben", type:"textarea"}
  ], data);
}

function addWeiterbildungEntry(data = {}) {
  createEntry("weiterbildung", [
    {name:"titel", label:"Titel"}, 
    {name:"weiterbildung-ort", label:"Ausbildungsstätte / Ort"}, 
    {name:"von", label:"Von"}, 
    {name:"bis", label:"Bis"}, 
    {name:"inhalt", label:"Inhalte", type:"textarea"}
  ], data);
}

function addKenntnisseEntry(data = {}) {
  createEntry("kenntnisse", [
    {name:"kenntnisse", label:"Kenntnisse"}
  ], data);
}

function addHobbysEntry(data = {}) {
  createEntry("hobbys", [
    {name:"hobbys", label:"Hobbies"}
  ], data);
}

// =============================
// === Funktion zum Laden gespeicherter Entries
// =============================
function loadEntries(section, list) {
  if (!list || list.length === 0) return;
  list.forEach(item => {
    switch (section) {
      case "schulbildung": addSchulbildungEntry(item); break;
      case "beruf": addBerufEntry(item); break;
      case "weiterbildung": addWeiterbildungEntry(item); break;
      case "kenntnisse": addKenntnisseEntry(item); break;
      case "hobbys": addHobbysEntry(item); break;
    }
  });
}