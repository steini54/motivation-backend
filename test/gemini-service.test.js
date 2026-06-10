const test = require("node:test");
const assert = require("node:assert/strict");

const {
  createGeminiService,
  buildTextPrompt,
  isQualityAccepted,
} = require("../services/gemini-service");

const config = {
  textModel: "gemini-2.5-flash",
  imageModel: "gemini-2.5-flash-image",
  imageIdentityMinConfidence: 0.85,
};

const passingQuality = {
  samePerson: true,
  facePreserved: true,
  posePreserved: true,
  clothingPreserved: true,
  framingPreserved: true,
  artifactFree: true,
  professionalBackground: true,
  identityConfidence: 0.96,
  reasons: [],
};

const imageProcessor = {
  async prepareSourceImage(buffer) {
    return {
      buffer,
      mimeType: "image/jpeg",
      width: 900,
      height: 1200,
      aspectRatio: "3:4",
    };
  },
  async validateGeneratedImage(data) {
    return {
      buffer: Buffer.from(data, "base64"),
      width: 864,
      height: 1184,
      format: "png",
    };
  },
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

test("editApplicationPhoto uses image-to-image and verifies identity", async () => {
  const requests = [];
  const service = createGeminiService({
    config,
    imageProcessor,
    client: {
      models: {
        async generateContent(input) {
          requests.push(input);
          if (input.model === config.textModel) {
            return { text: JSON.stringify(passingQuality) };
          }

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

  assert.equal(result.dataUrl, "data:image/png;base64,aW1hZ2U=");
  assert.equal(result.quality.verified, true);
  assert.equal(result.quality.identityConfidence, 0.96);
  assert.equal(requests.length, 2);
  assert.equal(requests[0].model, "gemini-2.5-flash-image");
  assert.match(requests[0].contents[0].text, /Identity lock/);
  assert.equal(requests[0].contents[1].inlineData.mimeType, "image/jpeg");
  assert.equal(
    requests[0].contents[1].inlineData.data,
    Buffer.from("source-image").toString("base64")
  );
  assert.deepEqual(requests[0].config.responseModalities, ["IMAGE"]);
  assert.equal(requests[0].config.imageConfig.aspectRatio, "3:4");
  assert.equal(requests[1].model, "gemini-2.5-flash");
  assert.equal(requests[1].config.responseMimeType, "application/json");
  assert.equal(requests[1].contents.length, 3);
});

test("buildTextPrompt constrains unsupported personal facts", () => {
  const prompt = buildTextPrompt({
    stichpunkte: "Teamarbeit",
    funktion: "Sachbearbeiter",
  });

  assert.match(prompt, /Do not invent qualifications/);
  assert.match(prompt, /5 to 7 complete sentences/);
});

test("editApplicationPhoto rejects candidates that fail identity checks", async () => {
  const service = createGeminiService({
    config,
    imageProcessor,
    client: {
      models: {
        async generateContent(input) {
          if (input.model === config.textModel) {
            return {
              text: JSON.stringify({
                ...passingQuality,
                facePreserved: false,
                identityConfidence: 0.61,
                reasons: ["Facial structure changed"],
              }),
            };
          }

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

  await assert.rejects(
    () =>
      service.editApplicationPhoto({
        buffer: Buffer.from("source-image"),
        mimeType: "image/jpeg",
      }),
    { code: "IMAGE_IDENTITY_MISMATCH" }
  );
});

test("isQualityAccepted enforces every preservation signal", () => {
  assert.equal(isQualityAccepted(passingQuality, 0.85), true);
  assert.equal(
    isQualityAccepted({ ...passingQuality, framingPreserved: false }, 0.85),
    false
  );
  assert.equal(
    isQualityAccepted({ ...passingQuality, identityConfidence: 0.84 }, 0.85),
    false
  );
});
