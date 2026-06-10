const test = require("node:test");
const assert = require("node:assert/strict");

const {
  createFallbackAiService,
} = require("../services/fallback-ai-service");

test("fallback service uses secondary provider after transient failure", async () => {
  const warnings = [];
  const service = createFallbackAiService({
    primaryProvider: "gemini",
    fallbackProvider: "openai",
    logger: {
      warn(message, details) {
        warnings.push({ message, details });
      },
    },
    primaryService: {
      async generateApplicationText() {
        const error = new Error("high demand");
        error.status = 503;
        throw error;
      },
    },
    fallbackService: {
      async generateApplicationText() {
        return "Fallback response";
      },
    },
  });

  assert.equal(
    await service.generateApplicationText({}),
    "Fallback response"
  );
  assert.equal(warnings.length, 1);
  assert.equal(warnings[0].details.fallbackProvider, "openai");
});

test("fallback service does not bypass identity or safety rejection", async () => {
  let fallbackCalls = 0;
  const service = createFallbackAiService({
    primaryProvider: "gemini",
    fallbackProvider: "openai",
    logger: { warn() {} },
    primaryService: {
      async editApplicationPhoto() {
        const error = new Error("identity mismatch");
        error.code = "IMAGE_IDENTITY_MISMATCH";
        throw error;
      },
    },
    fallbackService: {
      async editApplicationPhoto() {
        fallbackCalls += 1;
        return {};
      },
    },
  });

  await assert.rejects(service.editApplicationPhoto({}), {
    code: "IMAGE_IDENTITY_MISMATCH",
  });
  assert.equal(fallbackCalls, 0);
});
