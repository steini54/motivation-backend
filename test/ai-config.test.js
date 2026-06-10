const test = require("node:test");
const assert = require("node:assert/strict");

const {
  getAiProvider,
  validateAiProvider,
} = require("../config/ai");

test("AI provider only accepts Gemini", () => {
  assert.equal(getAiProvider({}), "gemini");
  assert.deepEqual(validateAiProvider("gemini"), []);
  assert.deepEqual(validateAiProvider("openai"), [
    "AI_PROVIDER must be gemini",
  ]);
});

test("AI provider rejects unsupported values", () => {
  assert.deepEqual(validateAiProvider("other"), [
    "AI_PROVIDER must be gemini",
  ]);
});
