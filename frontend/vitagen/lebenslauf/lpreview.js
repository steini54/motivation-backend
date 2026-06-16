console.log("lpreview.js geladen");

// 1️⃣ Daten aus localStorage laden
const saved = JSON.parse(localStorage.getItem("vitagen_lebenslauf") || "{}");

// 2️⃣ Deckblatt befüllen
document.getElementById("pv-name").textContent = saved.name || "";
document.getElementById("pv-adresse").textContent = saved.adresse || "";
document.getElementById("pv-kontakt").textContent = saved.kontakt || "";

// Foto anzeigen, nur wenn vorhanden
const fotoEl = document.getElementById("pv-foto");
if (saved.foto && fotoEl) {
  fotoEl.src = saved.foto;
  fotoEl.style.display = "block";
}

// 3️⃣ Mehrfach-Einträge dynamisch füllen
function fillSection(containerId, entries) {
  const container = document.getElementById(containerId);
  if (!container || !entries) return;

  container.innerHTML = "";

  entries.forEach(entry => {

    const div = document.createElement("div");
    div.className = "pv-entry";

    const values = Object.values(entry).filter(v => v && v.trim() !== "");

    // ===== Bereiche mit Datum rechts =====
    if (
      containerId === "pv-schulbildung" ||
      containerId === "pv-beruf" ||
      containerId === "pv-weiterbildung"
    ) {

      if (values.length >= 4) {

        // Erste Zeile mit Datum rechts
        const firstRow = document.createElement("div");
        firstRow.className = "pv-row";

        const left = document.createElement("span");
        left.textContent = values[0];

        const right = document.createElement("span");
        right.className = "pv-date";   // 🔥 eigene Klasse
        right.textContent = values[2] + " – " + values[3];

        firstRow.appendChild(left);
        firstRow.appendChild(right);
        div.appendChild(firstRow);

        // Weitere Werte unterhalb (ohne von/bis)
        values.forEach((val, index) => {
          if (index !== 0 && index !== 2 && index !== 3) {
            const p = document.createElement("p");
            p.textContent = val;
            div.appendChild(p);
          }
        });

      }

    } else {
      // ===== Kenntnisse & Hobbys normal anzeigen =====
      values.forEach(val => {
        const p = document.createElement("p");
        p.textContent = val;
        div.appendChild(p);
      });
    }

    container.appendChild(div);
  });
}

// Sections befüllen
fillSection("pv-schulbildung", saved.schulbildung);
fillSection("pv-beruf", saved.beruf);
fillSection("pv-weiterbildung", saved.weiterbildung);
fillSection("pv-kenntnisse", saved.kenntnisse);
fillSection("pv-hobbys", saved.hobbys);

// 4️⃣ Datum und Unterschrift
document.getElementById("pv-datum").textContent = saved.datum || "";
document.getElementById("pv-unterschrift").textContent = saved.unterschrift || "";

// 5️⃣ Buttons
const backBtn = document.getElementById("backBtn");
if (backBtn) {
  backBtn.addEventListener("click", () => {
    window.location.href = "lebensformular.html";
  });
}

const printBtn = document.getElementById("printBtn");
if (printBtn) {
  printBtn.addEventListener("click", () => window.print());
}

// Style-Switch aktivieren
document.querySelectorAll(".style-switch button").forEach(btn => {
  btn.addEventListener("click", () => {

    const themeLink = document.getElementById("theme-style");
    if (themeLink) {
      themeLink.href = "styles/" + btn.dataset.style;
    }

    document.querySelectorAll(".style-switch button").forEach(b =>
      b.classList.remove("active")
    );

    btn.classList.add("active");
  });
});

// Buy-Modal
const buyBtn = document.getElementById('buyBtn');
if (buyBtn) {
  buyBtn.addEventListener('click', () => {
    document.getElementById('buyModal').style.display = 'flex';
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
