const test = require("node:test");
const assert = require("node:assert/strict");

const { verifyOpenAIAccess } = require("../services/openai-readiness");

test("verifyOpenAIAccess checks both configured models", async () => {
  const calls = [];
  const client = {
    models: {
      async retrieve(model) {
        calls.push(model);
        return { id: model };
      },
    },
  };
  const config = {
    textModel: "gpt-4.1-nano",
    imageModel: "gpt-image-1",
  };

  const verifiedModels = await verifyOpenAIAccess({ client, config });

  assert.deepEqual(calls, ["gpt-4.1-nano", "gpt-image-1"]);
  assert.deepEqual(verifiedModels, ["gpt-4.1-nano", "gpt-image-1"]);
});
