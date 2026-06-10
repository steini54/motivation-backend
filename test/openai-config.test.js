const test = require("node:test");
const assert = require("node:assert/strict");

const {
  DEFAULT_OPENAI_IMAGE_MODEL,
  DEFAULT_OPENAI_TEXT_MODEL,
  getOpenAIConfig,
  validateOpenAIConfig,
} = require("../config/openai");

test("getOpenAIConfig uses low-cost local verification defaults", () => {
  const config = getOpenAIConfig({ OPENAI_API_KEY: "test-key" });

  assert.equal(config.textModel, DEFAULT_OPENAI_TEXT_MODEL);
  assert.equal(config.imageModel, DEFAULT_OPENAI_IMAGE_MODEL);
  assert.equal(config.imageQuality, "low");
  assert.equal(config.timeoutMs, 120000);
  assert.equal(config.imageIdentityMinConfidence, 0.85);
  assert.deepEqual(validateOpenAIConfig(config), []);
});

test("validateOpenAIConfig rejects missing keys and unexpected models", () => {
  const config = getOpenAIConfig({
    OPENAI_TEXT_MODEL: "unexpected-text-model",
    OPENAI_IMAGE_MODEL: "unexpected-image-model",
    OPENAI_IMAGE_QUALITY: "ultra",
  });

  assert.deepEqual(validateOpenAIConfig(config), [
    "OPENAI_API_KEY is missing",
    `OPENAI_TEXT_MODEL must be ${DEFAULT_OPENAI_TEXT_MODEL}`,
    `OPENAI_IMAGE_MODEL must be ${DEFAULT_OPENAI_IMAGE_MODEL}`,
    "OPENAI_IMAGE_QUALITY must be one of: low, medium, high, auto",
  ]);
});
