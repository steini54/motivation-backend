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
const cvTemplateStyleNames = [
  "aqua-arc-amethyst.css",
  "aqua-arc-contrast.css",
  "aqua-arc-default.css",
  "aqua-arc-emerald.css",
  "aqua-arc-soft.css",
  "aqua-arc-sunset.css",
  "corporate-axis-burgundy.css",
  "corporate-axis-default.css",
  "corporate-axis-forest.css",
  "corporate-axis-monochrome.css",
  "corporate-axis-navy.css",
  "corporate-axis-steel.css",
  "editorial-mono-classic.css",
  "editorial-mono-default.css",
  "editorial-mono-mint.css",
  "editorial-mono-rose.css",
  "editorial-mono-sepia.css",
  "editorial-mono-warm.css",
];
const cvStyleNames = [...styleNames, ...cvTemplateStyleNames];
const documentStyleNames = cvStyleNames;

test("all current motivation themes are included and import the shared base", () => {
  for (const styleName of documentStyleNames) {
    const css = fs.readFileSync(
      path.join(frontendPath, "styles", styleName),
      "utf8"
    );

    assert.match(css, /@import url\("\.?\/?_base\.css"\);/);
    assert.ok(css.length > 300, `${styleName} appears incomplete`);
  }
});

test("motivation and CV expose the matching template style sets", () => {
  const motivationStyles = fs
    .readdirSync(path.join(vitagenPath, "motivation", "styles"))
    .filter((name) => name.endsWith(".css") && !name.startsWith("_"))
    .sort();
  const lebenslaufStyles = fs
    .readdirSync(path.join(vitagenPath, "lebenslauf", "styles"))
    .filter((name) => name.endsWith(".css") && !name.startsWith("_"))
    .sort();

  assert.deepEqual(motivationStyles, documentStyleNames.slice().sort());
  assert.deepEqual(lebenslaufStyles, cvStyleNames.slice().sort());
});

test("motivation builder exposes existing styles, templates, and dynamic variant sets", () => {
  const formHtml = fs.readFileSync(
    path.join(frontendPath, "formular.html"),
    "utf8"
  );
  const script = fs.readFileSync(
    path.join(frontendPath, "script.js"),
    "utf8"
  );
  const carouselStyles = Array.from(
    formHtml.matchAll(/class="style-chip[^"]*"[^>]*data-style="([^"]+)"/g),
    (match) => match[1]
  ).sort();
  const templateIds = Array.from(
    formHtml.matchAll(/class="template-chip[^"]*"[^>]*data-template="([^"]+)"/g),
    (match) => match[1]
  ).sort();

  assert.deepEqual(carouselStyles, styleNames.slice().sort());
  assert.deepEqual(templateIds, ["aqua-arc", "corporate-axis", "editorial-mono", "existing"].sort());
  assert.match(script, /const MOTIVATION_TEMPLATES = \[/);
  assert.match(script, /id: "aqua-arc"/);
  assert.match(script, /id: "corporate-axis"/);
  assert.match(script, /id: "editorial-mono"/);
  assert.match(script, /styles: \["aqua-arc-default\.css", "aqua-arc-soft\.css", "aqua-arc-contrast\.css", "aqua-arc-emerald\.css", "aqua-arc-sunset\.css", "aqua-arc-amethyst\.css"\]/);
  assert.match(script, /styles: \["corporate-axis-default\.css", "corporate-axis-steel\.css", "corporate-axis-navy\.css", "corporate-axis-burgundy\.css", "corporate-axis-forest\.css", "corporate-axis-monochrome\.css"\]/);
  assert.match(script, /styles: \["editorial-mono-default\.css", "editorial-mono-warm\.css", "editorial-mono-classic\.css", "editorial-mono-sepia\.css", "editorial-mono-mint\.css", "editorial-mono-rose\.css"\]/);
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
  const templateIds = Array.from(
    formHtml.matchAll(/class="template-chip[^"]*"[^>]*data-template="([^"]+)"/g),
    (match) => match[1]
  ).sort();

  assert.deepEqual(carouselStyles, styleNames.slice().sort());
  assert.deepEqual(templateIds, ["aqua-arc", "corporate-axis", "editorial-mono", "existing"].sort());
  assert.match(script, /const CV_TEMPLATES = \[/);
  assert.match(script, /id: "aqua-arc"/);
  assert.match(script, /id: "corporate-axis"/);
  assert.match(script, /id: "editorial-mono"/);
  assert.match(script, /styles: \["aqua-arc-default\.css", "aqua-arc-soft\.css", "aqua-arc-contrast\.css", "aqua-arc-emerald\.css", "aqua-arc-sunset\.css", "aqua-arc-amethyst\.css"\]/);
  assert.match(script, /styles: \["corporate-axis-default\.css", "corporate-axis-steel\.css", "corporate-axis-navy\.css", "corporate-axis-burgundy\.css", "corporate-axis-forest\.css", "corporate-axis-monochrome\.css"\]/);
  assert.match(script, /styles: \["editorial-mono-default\.css", "editorial-mono-warm\.css", "editorial-mono-classic\.css", "editorial-mono-sepia\.css", "editorial-mono-mint\.css", "editorial-mono-rose\.css"\]/);
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
  assert.match(sharedNavbarScript, /render\(\);\s*if \(document\.readyState === "loading"\)/s);
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
  assert.match(motivationScript, /"Schweiz & Europa": "Switzerland & Europe"/);
  assert.match(motivationScript, /"KI-Foto": "AI photo"/);
  assert.match(motivationScript, /"Foto andern": "Change photo"/);
  assert.match(motivationScript, /"Aktualisiert sich automatisch beim Tippen": "Updates automatically while typing"/);
  assert.match(motivationScript, /"Nach der Auswahl erscheint das Foto direkt in der Live-Vorschau\.": "After selection, the photo appears directly in the live preview\."/);
  assert.match(lebenslaufScript, /"Persoenliche Daten": "Personal details"/);
  assert.match(lebenslaufScript, /"Berufserfahrung": "Work experience"/);
  assert.match(lebenslaufScript, /"Schweiz & Europa": "Switzerland & Europe"/);
  assert.match(lebenslaufScript, /"KI-Foto": "AI photo"/);
  assert.match(lebenslaufScript, /"Foto andern": "Change photo"/);
  assert.match(lebenslaufScript, /"Beruflicher Werdegang": "Professional experience"/);
  assert.match(lebenslaufScript, /"Aktualisiert sich automatisch beim Tippen": "Updates automatically while typing"/);
  assert.match(lebenslaufScript, /"Nach der Auswahl erscheint das Foto direkt in der Live-Vorschau\.": "After selection, the photo appears directly in the live preview\."/);
});

test("builder full preview watermark is large enough to block free documents", () => {
  const motivationCss = fs.readFileSync(
    path.join(frontendPath, "style.css"),
    "utf8"
  );
  const lebenslaufCss = fs.readFileSync(
    path.join(lebenslaufPath, "lstyle.css"),
    "utf8"
  );

  for (const css of [motivationCss, lebenslaufCss]) {
    assert.match(css, /\.preview-paper \.watermark \{/);
    assert.match(css, /font-size: clamp\(48px, 10vw, 96px\);/);
    assert.match(css, /color: rgba\(15, 23, 42, 0\.16\);/);
    assert.match(css, /\.modal-preview-host \.preview-paper \.watermark \{/);
    assert.match(css, /width: 146%;/);
    assert.match(css, /font-size: clamp\(76px, 11vw, 152px\);/);
    assert.match(css, /color: rgba\(15, 23, 42, 0\.18\);/);
  }
});

test("CV renderer uses measured pagination and the required typography scale", () => {
  const rendererScript = fs.readFileSync(
    path.join(vitagenPath, "document-renderer.js"),
    "utf8"
  );
  const lebenslaufCss = fs.readFileSync(
    path.join(lebenslaufPath, "lstyle.css"),
    "utf8"
  );

  assert.match(rendererScript, /function createCvMeasurer/);
  assert.match(rendererScript, /CV_TEMPLATE_BY_STYLE/);
  assert.match(rendererScript, /buildTemplateCvHero/);
  assert.match(rendererScript, /cv-template--\$\{templateId\}/);
  assert.match(rendererScript, /target\.dataset\.template = cvTemplateId\(options\)/);
  assert.match(rendererScript, /document-measurement-root/);
  assert.match(rendererScript, /getBoundingClientRect\(\)/);
  assert.match(rendererScript, /function splitEntryToMeasuredChunks/);
  assert.match(rendererScript, /function ensureFinalFooterFits/);
  assert.match(rendererScript, /function paginateCvSidebar/);
  assert.match(rendererScript, /function addSidebarUnitToPage/);
  assert.match(rendererScript, /sidebarFits/);
  assert.match(rendererScript, /buildCvSidebar\(data, language, pageNumber, pageModels\.length, templateId, model\.sidebar\)/);
  assert.doesNotMatch(rendererScript, /function entryUnits/);
  assert.doesNotMatch(rendererScript, /CV_PAGE_ONE_BUDGET/);
  assert.doesNotMatch(rendererScript, /CV_CONTINUATION_BUDGET/);

  assert.match(lebenslaufCss, /--cv-body-size: 11pt;/);
  assert.match(lebenslaufCss, /--cv-body-line-height: 1\.38;/);
  assert.match(lebenslaufCss, /--cv-entry-meta-size: 9\.2pt;/);
  assert.match(lebenslaufCss, /\.preview-paper\.document-rendered \.cv--continuation \{\s*grid-template-columns: 34% 1fr;/);
  assert.match(lebenslaufCss, /\.document-measurement-root/);
  assert.match(lebenslaufCss, /\.cv-entry \{/);
  assert.match(lebenslaufCss, /break-inside: avoid;/);
  assert.doesNotMatch(lebenslaufCss, /font-size: 12pt;/);
});

test("motivation letter body typography uses 11pt and supports templates", () => {
  const motivationCss = fs.readFileSync(
    path.join(frontendPath, "style.css"),
    "utf8"
  );
  const renderer = fs.readFileSync(
    path.join(vitagenPath, "document-renderer.js"),
    "utf8"
  );

  assert.match(
    motivationCss,
    /\.preview-paper\.document-rendered \.letter-body p,\s*\.preview-paper\.document-rendered \.closing-block p \{\s*margin: 0;\s*color: #1f2933;\s*font-size: 11pt;/s
  );
  assert.match(motivationCss, /\.preview-paper\.document-rendered \.letter-greeting \{\s*margin: 0 0 5mm;\s*font-size: 11pt;/);
  assert.match(motivationCss, /\.preview-paper\.document-rendered \.closing-block strong \{[\s\S]*font-size: 11pt;/);
  assert.match(motivationCss, /\.preview-paper\.document-rendered \.letter-template--aqua-arc/);
  assert.match(motivationCss, /\.preview-paper\.document-rendered \.letter-template--corporate-axis/);
  assert.match(motivationCss, /\.preview-paper\.document-rendered \.letter-template--editorial-mono/);
  assert.match(renderer, /letter-template--\$\{templateId\}/);
});

test("motivation renderer does not invent an empty closing sentence", () => {
  const renderer = fs.readFileSync(
    path.join(vitagenPath, "document-renderer.js"),
    "utf8"
  );

  assert.match(renderer, /splitParagraphs\(data\.stichwoerter3, ""\)/);
  assert.doesNotMatch(renderer, /I would be happy to discuss my motivation/);
  assert.doesNotMatch(renderer, /Gerne ueberzeuge ich Sie in einem persoenlichen Gespraech/);
});

test("builder photo state persists blobs without storing base64 in localStorage", () => {
  const motivationScript = fs.readFileSync(
    path.join(frontendPath, "script.js"),
    "utf8"
  );
  const lebenslaufScript = fs.readFileSync(
    path.join(lebenslaufPath, "lscript.js"),
    "utf8"
  );

  for (const script of [motivationScript, lebenslaufScript]) {
    assert.match(script, /function getSelectedPhotoSrc\(\)/);
    assert.match(script, /function clearStoredPhotoState/);
    assert.match(script, /function restoreSelectedPhoto/);
    assert.match(script, /function persistSelectedPhoto/);
    assert.match(script, /window\.VitaGenPhotoReady/);
    assert.match(script, /PhotoStorage\.saveSelectedPhoto/);
    assert.match(script, /PhotoStorage\.getSelectedPhoto/);
    assert.match(script, /PhotoStorage\.saveSourcePhoto/);
    assert.match(script, /PhotoStorage\.getSourcePhoto/);
    assert.match(script, /PhotoStorage\.migrateLegacyPhoto/);
    assert.match(script, /await pendingPhotoMigration/);
    assert.match(script, /delete data\.foto/);
    assert.match(script, /clearStoredPhotoState\(\{ resetUi: false \}\)/);
    assert.match(script, /selectImage\(img, \{ persist: false \}\)/);
    assert.doesNotMatch(script, /data\.foto = element\.src/);
    assert.doesNotMatch(script, /if \(saved\.foto\) \{\s*renderUploadPreview/s);
  }
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

  assert.doesNotMatch(formHtml, /api-config\.js/);
  assert.match(
    formHtml,
    /<script src="\/bewerbungs-generator\/motivation\/photo-storage\.js"><\/script>\s*<script src="\/bewerbungs-generator\/document-renderer\.js"><\/script>\s*<script src="script\.js"><\/script>/
  );
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
  assert.match(paymentScript, /vitagen_dev_discount_token/);
  assert.match(paymentScript, /developerDiscountToken/);
  assert.match(paymentScript, /getPendingCheckoutStyleName/);
  assert.match(paymentScript, /complete-order-modal/);
  assert.match(paymentScript, /Your PDF will download automatically/);
  assert.match(paymentScript, /Download PDF manually/);
  assert.match(paymentScript, /updateCompleteOrderModal\("pending"\)/);
  assert.match(paymentScript, /updateCompleteOrderModal\("ready"\)/);
  assert.match(paymentScript, /data-complete-order-download/);
  assert.match(
    paymentScript,
    /const candidates = \[\s*getPendingCheckoutStyleName\(\),\s*getStoredStyleName\(\),\s*getPreviewStyleName\(\),\s*getThemeHrefStyleName\(\),\s*"swiss-line\.css",\s*\]/s
  );
  assert.match(paymentScript, /syncSelectedStyleToDom\(selectedStyle\)/);
  assert.doesNotMatch(paymentScript, /checkout\/session\/\$\{encodeURIComponent/);
  assert.match(paymentScript, /html2canvas/);
  assert.match(paymentScript, /jsPDF/);
  assert.match(paymentScript, /format: "a4"/);
  assert.match(paymentScript, /TARGET_CANVAS_WIDTH_PX = 2480/);
  assert.match(paymentScript, /MAX_CANVAS_SCALE = 5/);
  assert.match(paymentScript, /waitForBuilderPhotoReady/);
  assert.match(paymentScript, /createPdfExportPreview/);
  assert.match(paymentScript, /toDataURL\("image\/png"\)/);
  assert.match(paymentScript, /addImage\(imageData, "PNG"/);
  assert.match(paymentScript, /querySelectorAll\("\.document-watermark, \.watermark"\)/);
  assert.match(paymentScript, /querySelectorAll\("\.page-break"\)/);
  assert.match(paymentScript, /querySelectorAll\("\.document-page"\)/);
  assert.doesNotMatch(paymentScript, /sliceHeight/);
  assert.doesNotMatch(paymentScript, /while \(offsetY < canvas\.height\)/);
  assert.match(paymentScript, /returnUrl: getReturnUrl\(\)/);
  assert.match(paymentScript, /createCheckoutAttemptId/);
  assert.match(paymentScript, /checkoutAttemptId/);
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
    path.join(vitagenPath, "shared-navbar.js"),
    path.join(vitagenPath, "document-renderer.js"),
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
