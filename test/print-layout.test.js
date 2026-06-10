const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

test("print layout produces exactly two fixed A4 document pages", () => {
  const css = fs.readFileSync(
    path.join(__dirname, "../frontend/styles/theme-base.css"),
    "utf8"
  );

  assert.match(css, /@page\s*{\s*size:\s*A4 portrait;\s*margin:\s*0;/s);
  assert.match(css, /width:\s*210mm;/);
  assert.match(css, /height:\s*297mm;/);
  assert.match(css, /#preview \.cover\s*{[^}]*break-after:\s*page;/s);
  assert.match(css, /#preview \.page-break\s*{\s*display:\s*none;/s);
});
