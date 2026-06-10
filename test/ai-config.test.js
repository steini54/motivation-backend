const test = require("node:test");
const assert = require("node:assert/strict");

const {
  getAiProvider,
  validateAiProvider,
} = require("../config/ai");

test("AI provider defaults to Gemini and accepts OpenAI", () => {
  assert.equal(getAiProvider({}), "gemini");
  assert.equal(getAiProvider({ AI_PROVIDER: " OpenAI " }), "openai");
  assert.deepEqual(validateAiProvider("gemini"), []);
  assert.deepEqual(validateAiProvider("openai"), []);
});

test("AI provider rejects unsupported values", () => {
  assert.deepEqual(validateAiProvider("other"), [
    "AI_PROVIDER must be one of: gemini, openai",
  ]);
});
