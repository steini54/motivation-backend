const test = require("node:test");
const assert = require("node:assert/strict");

const {
  createGeminiService,
  buildTextPrompt,
  getTextMaxOutputTokens,
  isQualityAccepted,
} = require("../services/gemini-service");

const config = {
  textModel: "gemini-2.5-flash",
  imageModel: "gemini-3.1-flash-image",
  imageSize: "1K",
  imageIdentityMinConfidence: 0.85,
  retryAttempts: 3,
  retryBaseDelayMs: 1,
};

const passingQuality = {
  samePerson: true,
  facePreserved: true,
  professionalPortrait: true,
  naturalPose: true,
  professionalAttire: true,
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
    textLength: "long",
    arbeitgeber: "Musterfirma AG",
  });

  assert.equal(text, "Ein professioneller Motivationstext.");
  assert.equal(request.model, "gemini-2.5-flash");
  assert.match(request.contents, /Projektleiter/);
  assert.match(request.contents, /Musterfirma AG/);
  assert.equal(request.config.maxOutputTokens, 1100);
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
  assert.equal(requests[0].model, "gemini-3.1-flash-image");
  assert.match(requests[0].contents[0].text, /Adaptive transformation/);
  assert.match(requests[0].contents[0].text, /not a background-only edit/);
  assert.equal(requests[0].contents[1].inlineData.mimeType, "image/jpeg");
  assert.equal(
    requests[0].contents[1].inlineData.data,
    Buffer.from("source-image").toString("base64")
  );
  assert.deepEqual(requests[0].config.responseModalities, ["IMAGE"]);
  assert.equal(
    requests[0].config.responseFormat.image.aspectRatio,
    "3:4"
  );
  assert.equal(requests[0].config.responseFormat.image.imageSize, "1K");
  assert.equal(requests[1].model, "gemini-2.5-flash");
  assert.equal(requests[1].config.responseMimeType, "application/json");
  assert.equal(requests[1].contents.length, 3);
});

test("buildTextPrompt constrains unsupported personal facts", () => {
  const prompt = buildTextPrompt({
    stichpunkte: "Teamarbeit",
    funktion: "Sachbearbeiter",
    textLength: "short",
  });

  assert.match(prompt, /Do not invent qualifications/);
  assert.match(prompt, /European motivation-letter standards/);
  assert.match(prompt, /Target language:\nGerman/);
  assert.match(prompt, /4 to 5 concise sentences/);
});

test("buildTextPrompt follows English input language and detailed length", () => {
  const prompt = buildTextPrompt({
    stichpunkte: "I have five years of customer success experience and enjoy improving onboarding.",
    funktion: "Customer Success Manager",
    textLength: "long",
    arbeitgeber: "Example Ltd",
  });

  assert.match(prompt, /Target language:\nEnglish/);
  assert.match(prompt, /9 to 11 complete sentences/);
  assert.match(prompt, /Example Ltd/);
});

test("text output token budget follows requested length", () => {
  assert.equal(getTextMaxOutputTokens("short"), 450);
  assert.equal(getTextMaxOutputTokens("standard"), 800);
  assert.equal(getTextMaxOutputTokens("long"), 1100);
  assert.equal(getTextMaxOutputTokens("unexpected"), 800);
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
    isQualityAccepted({ ...passingQuality, professionalPortrait: false }, 0.85),
    false
  );
  assert.equal(
    isQualityAccepted({ ...passingQuality, professionalAttire: false }, 0.85),
    false
  );
  assert.equal(
    isQualityAccepted({ ...passingQuality, identityConfidence: 0.84 }, 0.85),
    false
  );
});

test("Gemini requests retry transient 503 errors", async () => {
  let calls = 0;
  const delays = [];
  const service = createGeminiService({
    config,
    retry(operation, options) {
      const { withAiRetry } = require("../services/ai-retry");
      return withAiRetry(operation, {
        ...options,
        sleep: async (delay) => delays.push(delay),
      });
    },
    client: {
      models: {
        async generateContent() {
          calls += 1;
          if (calls < 3) {
            const error = new Error("high demand");
            error.status = 503;
            throw error;
          }
          return { text: "Erfolgreich nach Retry." };
        },
      },
    },
  });

  const text = await service.generateApplicationText({
    stichpunkte: "Zuverlaessig",
    funktion: "Sachbearbeiter",
  });

  assert.equal(text, "Erfolgreich nach Retry.");
  assert.equal(calls, 3);
  assert.deepEqual(delays, [1, 2]);
});

test("Gemini image safety rejection is not retried", async () => {
  let calls = 0;
  const service = createGeminiService({
    config,
    imageProcessor,
    retry(operation, options) {
      const { withAiRetry } = require("../services/ai-retry");
      return withAiRetry(operation, {
        ...options,
        sleep: async () => {},
      });
    },
    client: {
      models: {
        async generateContent() {
          calls += 1;
          return {
            candidates: [{ finishReason: "IMAGE_SAFETY", content: {} }],
          };
        },
      },
    },
  });

  await assert.rejects(
    service.editApplicationPhoto({
      buffer: Buffer.from("source-image"),
      mimeType: "image/jpeg",
    }),
    { code: "IMAGE_GENERATION_REJECTED" }
  );
  assert.equal(calls, 1);
});
