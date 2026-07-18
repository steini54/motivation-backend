const test = require("node:test");
const assert = require("node:assert/strict");

const VitaGenAccess = require("../frontend/vitagen/access-control");
const { createApp } = require("../app");

async function withServer(app, callback) {
  const server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  const address = server.address();

  try {
    await callback(`http://127.0.0.1:${address.port}`);
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
}

test("manual content in the free template remains free", () => {
  const state = VitaGenAccess.stateFromDocument({
    documentType: "lebenslauf",
    selectedTemplateId: "simple-free",
    styleName: "simple-free-blue.css",
    documentData: {
      name: "Max Muster",
      profil: "Manual profile text",
      foto: "indexeddb:selected-application-photo",
      foto_is_ai: false,
    },
  });

  assert.equal(state.documentTier, "free");
  assert.equal(state.selectedTemplateTier, "free");
  assert.equal(state.normalPhotoUsed, true);
  assert.deepEqual(state.premiumReasons, []);
});

test("Premium template and AI features produce explicit reasons", () => {
  const premiumTemplate = VitaGenAccess.stateFromDocument({
    documentType: "motivation",
    selectedTemplateId: "existing",
    styleName: "swiss-line.css",
    documentData: {},
  });
  const aiText = VitaGenAccess.stateFromDocument({
    documentType: "motivation",
    selectedTemplateId: "simple-free",
    styleName: "simple-free-gray.css",
    documentData: { stichwoerter2_is_ai: true },
  });
  const aiPhoto = VitaGenAccess.stateFromDocument({
    documentType: "lebenslauf",
    selectedTemplateId: "simple-free",
    styleName: "simple-free-blue.css",
    documentData: {
      foto: "indexeddb:selected-application-photo",
      foto_is_ai: true,
    },
  });

  assert.deepEqual(premiumTemplate.premiumReasons, ["premium_template"]);
  assert.deepEqual(aiText.premiumReasons, ["ai_text"]);
  assert.deepEqual(aiPhoto.premiumReasons, ["ai_photo"]);
});

test("preview download copy follows the derived document tier", () => {
  const freeCopy = VitaGenAccess.getPreviewDownloadCopy(
    {
      documentType: "lebenslauf",
      selectedTemplateId: "simple-free",
      styleName: "simple-free-gray.css",
    },
    "en"
  );
  const premiumCopy = VitaGenAccess.getPreviewDownloadCopy(
    {
      documentType: "motivation",
      selectedTemplateId: "existing",
      styleName: "swiss-line.css",
    },
    "de"
  );

  assert.equal(freeCopy.action, "Download free PDF");
  assert.match(freeCopy.description, /without payment/i);
  assert.equal(premiumCopy.action, "Premium-PDF freischalten");
  assert.match(premiumCopy.description, /Nach der Zahlung/);
});

test("backend free verification rejects Premium state", async () => {
  await withServer(
    createApp({ env: {}, logger: { error() {} } }),
    async (url) => {
      const freeResponse = await fetch(`${url}/document/verify-free`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentType: "motivation",
          selectedTemplateId: "simple-free",
          styleName: "simple-free-blue.css",
          documentData: { stichwoerter2: "Manual letter" },
        }),
      });
      const premiumResponse = await fetch(`${url}/document/verify-free`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentType: "motivation",
          selectedTemplateId: "simple-free",
          styleName: "simple-free-blue.css",
          documentData: {
            stichwoerter2: "Generated letter",
            stichwoerter2_is_ai: true,
          },
        }),
      });

      assert.equal(freeResponse.status, 200);
      assert.equal((await freeResponse.json()).allowed, true);
      assert.equal(premiumResponse.status, 403);
      assert.deepEqual((await premiumResponse.json()).premiumReasons, ["ai_text"]);
    }
  );
});
