const test = require("node:test");
const assert = require("node:assert/strict");

const {
  createGeminiService,
  buildTextPrompt,
} = require("../services/gemini-service");

const config = {
  textModel: "gemini-2.5-flash",
  imageModel: "gemini-2.5-flash-image",
};

test("generateApplicationText calls Gemini 2.5 Flash and returns text", async () => {
  let request;
  const service = createGeminiService({
    config,
    client: {
      models: {
        async generateContent(input) {
          request = input;
          return { text: "Ein professioneller Motivationstext." };
        },
      },
    },
  });

  const text = await service.generateApplicationText({
    stichpunkte: "Zuverlaessig, fuenf Jahre Erfahrung",
    funktion: "Projektleiter",
  });

  assert.equal(text, "Ein professioneller Motivationstext.");
  assert.equal(request.model, "gemini-2.5-flash");
  assert.match(request.contents, /Projektleiter/);
  assert.equal(request.config.thinkingConfig.thinkingBudget, 0);
});

test("editApplicationPhoto sends inline image data and returns a data URL", async () => {
  let request;
  const service = createGeminiService({
    config,
    client: {
      models: {
        async generateContent(input) {
          request = input;
          return {
            candidates: [
              {
                content: {
                  parts: [
                    {
                      inlineData: {
                        mimeType: "image/png",
                        data: "aW1hZ2U=",
                      },
                    },
                  ],
                },
              },
            ],
          };
        },
      },
    },
  });

  const result = await service.editApplicationPhoto({
    buffer: Buffer.from("source-image"),
    mimeType: "image/jpeg",
  });

  assert.equal(result, "data:image/png;base64,aW1hZ2U=");
  assert.equal(request.model, "gemini-2.5-flash-image");
  assert.equal(request.contents[0].inlineData.mimeType, "image/jpeg");
  assert.equal(
    request.contents[0].inlineData.data,
    Buffer.from("source-image").toString("base64")
  );
  assert.deepEqual(request.config.responseModalities, ["TEXT", "IMAGE"]);
});

test("buildTextPrompt constrains unsupported personal facts", () => {
  const prompt = buildTextPrompt({
    stichpunkte: "Teamarbeit",
    funktion: "Sachbearbeiter",
  });

  assert.match(prompt, /Do not invent qualifications/);
  assert.match(prompt, /5 to 7 complete sentences/);
});
