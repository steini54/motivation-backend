console.log("lpreview.js loaded");

const saved = JSON.parse(localStorage.getItem("vitagen_lebenslauf") || "{}");

document.getElementById("pv-name").textContent = saved.name || "";
document.getElementById("pv-adresse").textContent = saved.adresse || "";
document.getElementById("pv-kontakt").textContent = saved.kontakt || "";

const fotoEl = document.getElementById("pv-foto");
if (saved.foto && fotoEl) {
  fotoEl.src = saved.foto;
  fotoEl.style.display = "block";
}

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

document.getElementById("pv-datum").textContent = saved.datum || "";
document.getElementById("pv-unterschrift").textContent = saved.unterschrift || "";

const backBtn = document.getElementById("backBtn");
if (backBtn) {
  backBtn.addEventListener("click", () => {
    window.location.href = "lebensformular.html";
  });
}

const STYLE_STORAGE_KEY = "vitagen_lebenslauf_style";
const DEFAULT_STYLE = "standard.css";
const themeLink = document.getElementById("theme-style");
const styleButtons = Array.from(document.querySelectorAll(".style-switch button"));

function applyPreviewStyle(file) {
  const selectedFile = styleButtons.some((button) => button.dataset.style === file)
    ? file
    : DEFAULT_STYLE;

  if (themeLink) {
    themeLink.href = "styles/" + selectedFile;
  }

  localStorage.setItem(STYLE_STORAGE_KEY, selectedFile);
  styleButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.style === selectedFile);
  });
}

if (themeLink && styleButtons.length > 0) {
  applyPreviewStyle(localStorage.getItem(STYLE_STORAGE_KEY) || DEFAULT_STYLE);

  styleButtons.forEach((button) => {
    button.addEventListener("click", () => {
      applyPreviewStyle(button.dataset.style);
    });
  });
}
