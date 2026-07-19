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

test("switching between a normal and AI photo recalculates Free and Premium", () => {
  const common = {
    documentType: "lebenslauf",
    selectedTemplateId: "simple-free",
    styleName: "simple-free-blue.css",
  };
  const freeBefore = VitaGenAccess.stateFromDocument({
    ...common,
    documentData: {
      foto: "indexeddb:selected-application-photo",
      foto_is_ai: false,
    },
  });
  const premiumWithAi = VitaGenAccess.stateFromDocument({
    ...common,
    documentData: {
      foto: "indexeddb:selected-application-photo",
      foto_is_ai: true,
    },
  });
  const freeAgain = VitaGenAccess.stateFromDocument({
    ...common,
    documentData: {
      foto: "indexeddb:selected-application-photo",
      foto_is_ai: false,
    },
  });

  assert.equal(freeBefore.documentTier, "free");
  assert.equal(premiumWithAi.documentTier, "premium");
  assert.deepEqual(premiumWithAi.premiumReasons, ["ai_photo"]);
  assert.equal(freeAgain.documentTier, "free");
  assert.deepEqual(freeAgain.premiumReasons, []);
});

test("AI text attribution follows the content still used in the document", () => {
  const generatedText = [
    "I bring several years of experience in customer service and operational coordination.",
    "My structured approach helps teams resolve issues efficiently while maintaining clear communication.",
    "I am motivated to contribute these strengths and continue developing in the advertised role.",
  ].join(" ");
  const signatures = VitaGenAccess.addAiTextSignature([], generatedText);
  const premiumState = VitaGenAccess.stateFromDocument({
    documentType: "motivation",
    selectedTemplateId: "simple-free",
    styleName: "simple-free-blue.css",
    documentData: {
      stichwoerter2: generatedText,
      stichwoerter2_is_ai: false,
      stichwoerter2_ai_signatures: signatures,
    },
  });
  const clearedState = VitaGenAccess.stateFromDocument({
    documentType: "motivation",
    selectedTemplateId: "simple-free",
    styleName: "simple-free-blue.css",
    documentData: {
      stichwoerter2: "",
      stichwoerter2_is_ai: false,
      stichwoerter2_ai_signatures: signatures,
    },
  });
  const manualState = VitaGenAccess.stateFromDocument({
    documentType: "motivation",
    selectedTemplateId: "simple-free",
    styleName: "simple-free-blue.css",
    documentData: {
      stichwoerter2:
        "This letter was written manually and describes a different background in logistics.",
      stichwoerter2_is_ai: false,
      stichwoerter2_ai_signatures: signatures,
    },
  });

  assert.equal(premiumState.documentTier, "premium");
  assert.equal(premiumState.aiTextUsed, true);
  assert.equal(clearedState.documentTier, "free");
  assert.equal(clearedState.aiTextUsed, false);
  assert.equal(manualState.documentTier, "free");
  assert.equal(manualState.aiTextUsed, false);
});

test("copying or lightly editing generated text keeps AI attribution", () => {
  const generatedText = [
    "I bring several years of experience in customer service and operational coordination.",
    "My structured approach helps teams resolve issues efficiently while maintaining clear communication.",
    "I am motivated to contribute these strengths and continue developing in the advertised role.",
  ].join(" ");
  const signatures = VitaGenAccess.addAiTextSignature([], generatedText);
  const lightlyEdited = generatedText.replace(
    "several years",
    "more than five years"
  );

  assert.equal(
    VitaGenAccess.usesAiGeneratedText(generatedText, signatures),
    true
  );
  assert.equal(
    VitaGenAccess.usesAiGeneratedText(lightlyEdited, signatures),
    true
  );
  assert.equal(VitaGenAccess.usesAiGeneratedText("", signatures), false);
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
  const generatedText = [
    "I bring several years of experience in customer service and operational coordination.",
    "My structured approach helps teams resolve issues efficiently while maintaining clear communication.",
  ].join(" ");
  const signatures = VitaGenAccess.addAiTextSignature([], generatedText);

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
            stichwoerter2: generatedText,
            stichwoerter2_is_ai: false,
            stichwoerter2_ai_signatures: signatures,
          },
        }),
      });
      const clearedResponse = await fetch(`${url}/document/verify-free`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentType: "motivation",
          selectedTemplateId: "simple-free",
          styleName: "simple-free-blue.css",
          documentData: {
            stichwoerter2: "",
            stichwoerter2_is_ai: false,
            stichwoerter2_ai_signatures: signatures,
          },
        }),
      });

      assert.equal(freeResponse.status, 200);
      assert.equal((await freeResponse.json()).allowed, true);
      assert.equal(premiumResponse.status, 403);
      assert.deepEqual((await premiumResponse.json()).premiumReasons, ["ai_text"]);
      assert.equal(clearedResponse.status, 200);
      assert.equal((await clearedResponse.json()).allowed, true);
    }
  );
});
