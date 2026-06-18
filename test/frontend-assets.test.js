const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const frontendPath = path.join(__dirname, "../frontend/vitagen/motivation");
const lebenslaufPath = path.join(__dirname, "../frontend/vitagen/lebenslauf");
const vitagenPath = path.join(__dirname, "../frontend/vitagen");
const styleNames = [
  "charcoal-frame.css",
  "cobalt-ribbon.css",
  "editorial-azure.css",
  "executive-ink.css",
  "graphite-pro.css",
  "midnight-column.css",
  "monograph.css",
  "navy-wave.css",
  "nordic-panel.css",
  "pearl-classic.css",
  "soft-sand.css",
  "swiss-line.css",
  "teal-balance.css",
  "terracotta-arch.css",
];

test("all current motivation themes are included and import the shared base", () => {
  for (const styleName of styleNames) {
    const css = fs.readFileSync(
      path.join(frontendPath, "styles", styleName),
      "utf8"
    );

    assert.match(css, /@import url\("\.?\/?_base\.css"\);/);
    assert.ok(css.length > 300, `${styleName} appears incomplete`);
  }
});

test("current motivation and lebenslauf theme sets stay in sync", () => {
  const motivationStyles = fs
    .readdirSync(path.join(vitagenPath, "motivation", "styles"))
    .filter((name) => name.endsWith(".css") && !name.startsWith("_"))
    .sort();
  const lebenslaufStyles = fs
    .readdirSync(path.join(vitagenPath, "lebenslauf", "styles"))
    .filter((name) => name.endsWith(".css") && !name.startsWith("_"))
    .sort();

  assert.deepEqual(motivationStyles, styleNames.slice().sort());
  assert.deepEqual(lebenslaufStyles, styleNames.slice().sort());
});

test("motivation builder exposes every current style in the live carousel", () => {
  const formHtml = fs.readFileSync(
    path.join(frontendPath, "formular.html"),
    "utf8"
  );
  const carouselStyles = Array.from(
    formHtml.matchAll(/class="style-chip[^"]*"[^>]*data-style="([^"]+)"/g),
    (match) => match[1]
  ).sort();

  assert.deepEqual(carouselStyles, styleNames.slice().sort());
  assert.match(formHtml, /<div class="watermark">VORSCHAU<\/div>/);
});

test("lebenslauf builder keeps preview, styles, payment, and AI photo on one page", () => {
  const formHtml = fs.readFileSync(
    path.join(lebenslaufPath, "lebensformular.html"),
    "utf8"
  );
  const script = fs.readFileSync(
    path.join(lebenslaufPath, "lscript.js"),
    "utf8"
  );
  const sharedNavbarScript = fs.readFileSync(
    path.join(vitagenPath, "shared-navbar.js"),
    "utf8"
  );
  const carouselStyles = Array.from(
    formHtml.matchAll(/class="style-chip[^"]*"[^>]*data-style="([^"]+)"/g),
    (match) => match[1]
  ).sort();

  assert.deepEqual(carouselStyles, styleNames.slice().sort());
  assert.match(formHtml, /id="preview"/);
  assert.match(formHtml, /class="cv"/);
  assert.match(formHtml, /id="previewModal"/);
  assert.match(formHtml, /id="foto-section"/);
  assert.match(formHtml, /id="aiFotoBtn"/);
  assert.match(formHtml, /src="\/bewerbungs-generator\/payment\.js" data-document-type="lebenslauf"/);
  assert.match(sharedNavbarScript, /motivation: "\/bewerbungs-generator\/motivation\/formular\.html"/);
  assert.match(script, /const AI_API_BASE_URL = "https:\/\/motivation-backend-production-2800\.up\.railway\.app";/);
  assert.match(script, /`\$\{AI_API_BASE_URL\}\/generate-ai-photo`/);
  assert.doesNotMatch(script, /window\.open\("lpreview\.html"\)/);
});

test("motivation and lebenslauf builders share the navbar and language switch", () => {
  const motivationHtml = fs.readFileSync(
    path.join(frontendPath, "formular.html"),
    "utf8"
  );
  const lebenslaufHtml = fs.readFileSync(
    path.join(lebenslaufPath, "lebensformular.html"),
    "utf8"
  );
  const motivationScript = fs.readFileSync(
    path.join(frontendPath, "script.js"),
    "utf8"
  );
  const lebenslaufScript = fs.readFileSync(
    path.join(lebenslaufPath, "lscript.js"),
    "utf8"
  );
  const sharedNavbarScript = fs.readFileSync(
    path.join(vitagenPath, "shared-navbar.js"),
    "utf8"
  );
  const sharedNavbarCss = fs.readFileSync(
    path.join(vitagenPath, "shared-navbar.css"),
    "utf8"
  );

  for (const html of [motivationHtml, lebenslaufHtml]) {
    assert.doesNotMatch(html, /<nav class="topbar">/);
    assert.match(html, /href="\/bewerbungs-generator\/shared-navbar\.css"/);
    assert.match(html, /<script src="\/bewerbungs-generator\/shared-navbar\.js"><\/script>/);
  }

  assert.match(motivationHtml, /data-vitagen-navbar data-active="motivation"/);
  assert.match(lebenslaufHtml, /data-vitagen-navbar data-active="cv"/);
  assert.match(sharedNavbarScript, /class="brand" href="\$\{ROUTES\.cv\}"/);
  assert.match(sharedNavbarScript, /<span class="brand-mark">VG<\/span>/);
  assert.match(sharedNavbarScript, /class="product-switch"/);
  assert.match(sharedNavbarScript, /data-lang="de"/);
  assert.match(sharedNavbarScript, /data-lang="en"/);
  assert.match(sharedNavbarScript, /data-i18n="nav.save"/);
  assert.match(sharedNavbarScript, /data-i18n="nav.preview"/);
  assert.match(sharedNavbarScript, /vitagen:languagechange/);
  assert.match(sharedNavbarCss, /\.topbar/);
  assert.match(sharedNavbarCss, /--navbar-primary: #202c39/);
  assert.match(sharedNavbarCss, /\.topbar \.primary-button/);
  assert.match(sharedNavbarCss, /\.topbar \.secondary-button/);
  assert.doesNotMatch(motivationScript, /"nav\.save"/);
  assert.doesNotMatch(lebenslaufScript, /"nav\.save"/);
  assert.match(motivationScript, /const LANGUAGE_STORAGE_KEY = "vitagen_language";/);
  assert.match(lebenslaufScript, /const LANGUAGE_STORAGE_KEY = "vitagen_language";/);
  assert.match(motivationScript, /vitagen:languagechange/);
  assert.match(lebenslaufScript, /vitagen:languagechange/);
  assert.match(motivationScript, /function applyLanguage/);
  assert.match(lebenslaufScript, /function applyLanguage/);
});

test("builder language switch translates page text and attributes", () => {
  const motivationScript = fs.readFileSync(
    path.join(frontendPath, "script.js"),
    "utf8"
  );
  const lebenslaufScript = fs.readFileSync(
    path.join(lebenslaufPath, "lscript.js"),
    "utf8"
  );

  for (const script of [motivationScript, lebenslaufScript]) {
    assert.match(script, /function translateTextNodes/);
    assert.match(script, /function translateAttributes/);
    assert.match(script, /document\.title = t\("document\.title"\)/);
    assert.match(script, /"VORSCHAU": "PREVIEW"/);
    assert.match(script, /"PDF ohne Wasserzeichen": "PDF without watermark"/);
    assert.match(script, /"Professionelles Foto generieren": "Generate professional photo"/);
  }

  assert.match(motivationScript, /"Angaben zur Bewerbung": "Application details"/);
  assert.match(motivationScript, /"Motivationstext formulieren": "Write motivation text"/);
  assert.match(lebenslaufScript, /"Persoenliche Daten": "Personal details"/);
  assert.match(lebenslaufScript, /"Berufserfahrung": "Work experience"/);
});

test("frontend preserves production markup and routes AI to Railway", () => {
  const formHtml = fs.readFileSync(
    path.join(frontendPath, "formular.html"),
    "utf8"
  );
  const previewHtml = fs.readFileSync(
    path.join(frontendPath, "preview.html"),
    "utf8"
  );
  const script = fs.readFileSync(
    path.join(frontendPath, "script.js"),
    "utf8"
  );

  assert.doesNotMatch(formHtml, /api-config\.js|photo-storage\.js/);
  assert.match(previewHtml, /id="buyBtn"/);
  assert.match(previewHtml, /id="buyModal"/);
  assert.match(formHtml, /id="buyModal"/);
  assert.match(formHtml, /PDF ohne Wasserzeichen/);
  assert.match(formHtml, /Finale PDF freischalten/);
  assert.match(formHtml, /id="payBtn"[^>]*>Weiter zur sicheren Zahlung<\/button>/);
  assert.match(formHtml, /data-trigger-buy/);
  assert.match(formHtml, /src="\/bewerbungs-generator\/payment\.js" data-document-type="motivation"/);
  assert.match(formHtml, /html2canvas\/1\.4\.1\/html2canvas\.min\.js" integrity="sha384-ZZ1pncU3bQe8y31yfZdMFdSpttDoPmOZg2wguVK9almUodir1PghgT0eY7Mrty8H"/);
  assert.match(formHtml, /jspdf\/2\.5\.1\/jspdf\.umd\.min\.js" integrity="sha384-JcnsjUPPylna1s1fvi1u12X5qjY5OL56iySh75FdtrwhO\/SWXgMjoVqcKyIIWOLk"/);
  assert.match(previewHtml, /href="print\.css" media="print"/);
  assert.match(
    previewHtml,
    /<script src="photo-storage\.js"><\/script>\s*<script src="preview\.js"><\/script>\s*<script src="https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/html2canvas\/1\.4\.1\/html2canvas\.min\.js"[^>]*><\/script>\s*<script src="https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/jspdf\/2\.5\.1\/jspdf\.umd\.min\.js"[^>]*><\/script>\s*<script src="\/bewerbungs-generator\/payment\.js" data-document-type="motivation"/
  );
  assert.doesNotMatch(script, /window\.location\.hostname/);
  assert.doesNotMatch(script, /window\.location\.origin/);
  assert.match(
    script,
    /const AI_API_BASE_URL = "https:\/\/motivation-backend-production-2800\.up\.railway\.app";/
  );
  assert.match(script, /`\$\{AI_API_BASE_URL\}\/generate-ai-photo`/);
  assert.match(script, /`\$\{AI_API_BASE_URL\}\/generate-text`/);
  assert.match(script, /aiBtn\.disabled = true/);
  assert.match(script, /textBtn\.disabled = true/);
  assert.match(script, /finally \{/);
});

test("Stripe payment layer is shared and loaded after preview scripts", () => {
  const paymentScript = fs.readFileSync(
    path.join(vitagenPath, "payment.js"),
    "utf8"
  );
  const motivationPreview = fs.readFileSync(
    path.join(vitagenPath, "motivation", "preview.html"),
    "utf8"
  );
  const lebenslaufPreview = fs.readFileSync(
    path.join(vitagenPath, "lebenslauf", "lpreview.html"),
    "utf8"
  );

  assert.match(paymentScript, /checkout\/create-session/);
  assert.match(paymentScript, /checkout\/verify-session/);
  assert.match(paymentScript, /VitaGenPayment/);
  assert.match(paymentScript, /\[VitaGen Payment\]/);
  assert.match(paymentScript, /delegated payment trigger clicked/);
  assert.match(paymentScript, /\[data-trigger-buy\], \[data-payment-trigger\]/);
  assert.doesNotMatch(paymentScript, /checkout\/session\/\$\{encodeURIComponent/);
  assert.match(paymentScript, /html2canvas/);
  assert.match(paymentScript, /jsPDF/);
  assert.match(paymentScript, /querySelector\(".watermark"\)/);
  assert.match(paymentScript, /querySelectorAll\(".page-break"\)/);
  assert.match(paymentScript, /pageSelector/);
  assert.match(paymentScript, /returnUrl: getReturnUrl\(\)/);
  assert.doesNotMatch(paymentScript, /payment_method_types/);
  assert.doesNotMatch(paymentScript, /html2pdf/);
  assert.doesNotMatch(paymentScript, /\/generate-pdf/);
  assert.match(motivationPreview, /integrity="sha384-/);
  assert.match(lebenslaufPreview, /integrity="sha384-/);
  assert.doesNotMatch(motivationPreview, /id="paymentMethod"|<select|Zahlungsart:/);
  assert.doesNotMatch(lebenslaufPreview, /id="paymentMethod"|<select|Zahlungsart:/);
  assert.doesNotMatch(motivationPreview, /id="printBtn"|Druckvorschau/);
  assert.doesNotMatch(lebenslaufPreview, /id="printBtn"|Druckvorschau/);
  assert.match(
    motivationPreview,
    /<script src="preview\.js"><\/script>\s*<script src="https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/html2canvas\/1\.4\.1\/html2canvas\.min\.js"[^>]*><\/script>\s*<script src="https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/jspdf\/2\.5\.1\/jspdf\.umd\.min\.js"[^>]*><\/script>\s*<script src="\/bewerbungs-generator\/payment\.js" data-document-type="motivation"/
  );
  assert.match(
    lebenslaufPreview,
    /<script src="lpreview\.js"><\/script>\s*<script src="https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/html2canvas\/1\.4\.1\/html2canvas\.min\.js"[^>]*><\/script>\s*<script src="https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/jspdf\/2\.5\.1\/jspdf\.umd\.min\.js"[^>]*><\/script>\s*<script src="\/bewerbungs-generator\/payment\.js" data-document-type="lebenslauf"/
  );
});

test("frontend payment scripts are valid JavaScript", () => {
  const scripts = [
    path.join(vitagenPath, "payment.js"),
    path.join(vitagenPath, "motivation", "script.js"),
    path.join(vitagenPath, "motivation", "preview.js"),
    path.join(vitagenPath, "lebenslauf", "lscript.js"),
    path.join(vitagenPath, "lebenslauf", "lpreview.js"),
  ];

  for (const scriptPath of scripts) {
    assert.doesNotThrow(() => {
      new vm.Script(fs.readFileSync(scriptPath, "utf8"), {
        filename: scriptPath,
      });
    }, `${path.basename(scriptPath)} should parse`);
  }
});

test("legacy preview scripts no longer call PDF generation directly", () => {
  const motivationPreviewScript = fs.readFileSync(
    path.join(vitagenPath, "motivation", "preview.js"),
    "utf8"
  );
  const lebenslaufPreviewScript = fs.readFileSync(
    path.join(vitagenPath, "lebenslauf", "lpreview.js"),
    "utf8"
  );

  assert.doesNotMatch(motivationPreviewScript, /generate-pdf|payBtn|buyModal/);
  assert.doesNotMatch(lebenslaufPreviewScript, /generate-pdf|payBtn|buyModal/);
  assert.doesNotMatch(motivationPreviewScript, /window\.print/);
  assert.doesNotMatch(lebenslaufPreviewScript, /window\.print/);
});

test("preview resolves IndexedDB photo markers before assigning the image source", () => {
  const previewScript = fs.readFileSync(
    path.join(frontendPath, "preview.js"),
    "utf8"
  );

  assert.match(
    previewScript,
    /data\.foto !== window\.PhotoStorage\?\.STORAGE_MARKER/
  );
  assert.match(previewScript, /photoStorage\.getSelectedPhoto\(\)/);
  assert.match(previewScript, /photoStorage\.createPhotoUrl\(blob\)/);
});
