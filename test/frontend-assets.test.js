const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const frontendPath = path.join(__dirname, "../frontend/vitagen/motivation");
const vitagenPath = path.join(__dirname, "../frontend/vitagen");
const styleNames = [
  "standard.css",
  "swiss.css",
  "executive.css",
  "academic.css",
  "technical.css",
  "creative.css",
  "compact.css",
  "service.css",
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
