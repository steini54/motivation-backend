const test = require("node:test");
const assert = require("node:assert/strict");

const {
  DEFAULT_GEMINI_IMAGE_MODEL,
  DEFAULT_GEMINI_TEXT_MODEL,
  getGeminiConfig,
  validateGeminiConfig,
} = require("../config/gemini");

test("getGeminiConfig uses the required stable Gemini models", () => {
  const config = getGeminiConfig({ GEMINI_API_KEY: "test-key" });

  assert.equal(config.textModel, DEFAULT_GEMINI_TEXT_MODEL);
  assert.equal(config.imageModel, DEFAULT_GEMINI_IMAGE_MODEL);
  assert.equal(config.imageSize, "1K");
  assert.equal(config.apiKeySource, "GEMINI_API_KEY");
  assert.equal(config.timeoutMs, 120000);
  assert.equal(config.retryAttempts, 3);
  assert.equal(config.retryBaseDelayMs, 1500);
  assert.equal(config.imageIdentityMinConfidence, 0.85);
  assert.deepEqual(validateGeminiConfig(config), []);
});

test("validateGeminiConfig rejects missing keys and unexpected models", () => {
  const config = getGeminiConfig({
    GEMINI_TEXT_MODEL: "unexpected-text-model",
    GEMINI_IMAGE_MODEL: "unexpected-image-model",
    GEMINI_IMAGE_SIZE: "8K",
  });

  assert.deepEqual(validateGeminiConfig(config), [
    "GEMINI_API_KEY is missing",
    `GEMINI_TEXT_MODEL must be ${DEFAULT_GEMINI_TEXT_MODEL}`,
    `GEMINI_IMAGE_MODEL must be ${DEFAULT_GEMINI_IMAGE_MODEL}`,
    "GEMINI_IMAGE_SIZE must be one of: 512, 1K, 2K, 4K",
  ]);
});
