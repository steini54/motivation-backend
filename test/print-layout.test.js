const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

function read(relativePath) {
  return fs.readFileSync(path.join(__dirname, "..", relativePath), "utf8");
}

function assertStablePrintLayout(css) {
  assert.match(css, /@page\s*{\s*size:\s*A4 portrait;\s*margin:\s*0;/s);
  assert.match(css, /#preview-wrapper\s*{[^}]*width:\s*210mm\s*!important;/s);
  assert.match(css, /#preview\s*{[^}]*width:\s*210mm\s*!important;/s);
  assert.match(
    css,
    /#preview \.cover(?:\s*,\s*#preview \.[a-z-]+)?\s*{[^}]*height:\s*297mm\s*!important;/s
  );
  assert.match(
    css,
    /#preview \.cover\s*{[^}]*break-after:\s*page\s*!important;/s
  );
  assert.match(css, /#preview \.page-break\s*{[^}]*display:\s*none\s*!important;/s);
  assert.match(css, /#preview \.watermark\s*{[^}]*position:\s*fixed\s*!important;/s);
}

test("motivation print layout keeps a fixed two-page watermark preview", () => {
  assertStablePrintLayout(read("frontend/vitagen/motivation/print.css"));
});

test("lebenslauf print layout keeps a stable watermark preview without forced blank pages", () => {
  const css = read("frontend/vitagen/lebenslauf/lprint.css");

  assertStablePrintLayout(css);
  assert.match(css, /#preview \.new-page\s*{[^}]*break-before:\s*auto\s*!important;/s);
});
