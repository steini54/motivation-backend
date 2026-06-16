const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const frontendPath = path.join(__dirname, "../frontend/vitagen/motivation");
const vitagenPath = path.join(__dirname, "../frontend/vitagen");
const styleNames = [
  "basic.css",
  "basic2.css",
  "classic.css",
  "classic2.css",
  "crosser.css",
  "crosser2.css",
  "headerbar.css",
  "headerbarlight.css",
  "modern.css",
  "modern2.css",
  "report.css",
  "report2.css",
  "simmons.css",
  "simmons2.css",
];

test("all original motivation themes are included without generated imports", () => {
  for (const styleName of styleNames) {
    const css = fs.readFileSync(
      path.join(frontendPath, "styles", styleName),
      "utf8"
    );

    assert.doesNotMatch(css, /theme-base\.css/);
    assert.ok(css.length > 4000, `${styleName} appears incomplete`);
  }
});

test("image-backed themes preserve the production Hosttech paths", () => {
  const modern = fs.readFileSync(
    path.join(frontendPath, "styles", "modern2.css"),
    "utf8"
  );
  const simmons = fs.readFileSync(
    path.join(frontendPath, "styles", "simmons2.css"),
    "utf8"
  );

  assert.match(
    modern,
    /url\("\/bewerbungs-generator\/motivation\/images\/80s\.PNG"\)/
  );
  assert.match(
    modern,
    /url\("\/bewerbungs-generator\/motivation\/images\/NEON2\.PNG"\)/
  );
  assert.match(
    simmons,
    /url\("\/bewerbungs-generator\/motivation\/images\/90s\.PNG"\)/
  );
  assert.match(
    simmons,
    /url\("\/bewerbungs-generator\/motivation\/images\/902\.PNG"\)/
  );

  for (const imageName of ["80s.PNG", "902.PNG", "90s.PNG", "NEON2.PNG"]) {
    assert.ok(fs.existsSync(path.join(frontendPath, "images", imageName)));
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

  assert.doesNotMatch(formHtml, /api-config\.js|photo-storage\.js/);
  assert.match(previewHtml, /id="buyBtn"/);
  assert.match(previewHtml, /id="buyModal"/);
  assert.match(previewHtml, /href="print\.css" media="print"/);
  assert.match(
    previewHtml,
    /<script src="photo-storage\.js"><\/script>\s*<script src="preview\.js"><\/script>\s*<script src="\/bewerbungs-generator\/payment\.js" data-document-type="motivation"/
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
  assert.match(paymentScript, /checkout\/session/);
  assert.match(paymentScript, /generate-pdf/);
  assert.match(paymentScript, /returnUrl: getReturnUrl\(\)/);
  assert.doesNotMatch(paymentScript, /payment_method_types/);
  assert.doesNotMatch(motivationPreview, /id="paymentMethod"|<select|Zahlungsart:/);
  assert.doesNotMatch(lebenslaufPreview, /id="paymentMethod"|<select|Zahlungsart:/);
  assert.match(
    motivationPreview,
    /<script src="preview\.js"><\/script>\s*<script src="\/bewerbungs-generator\/payment\.js" data-document-type="motivation"/
  );
  assert.match(
    lebenslaufPreview,
    /<script src="lpreview\.js"><\/script>\s*<script src="\/bewerbungs-generator\/payment\.js" data-document-type="lebenslauf"/
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
