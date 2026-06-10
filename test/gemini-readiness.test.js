const assert = require("node:assert/strict");
const test = require("node:test");

const { verifyGeminiAccess } = require("../services/gemini-readiness");

test("verifyGeminiAccess checks both configured production models", async () => {
  const calls = [];
  const client = {
    models: {
      async get({ model }) {
        calls.push(model);
        return { name: `models/${model}` };
      },
    },
  };
  const config = {
    textModel: "gemini-2.5-flash",
    imageModel: "gemini-2.5-flash-image",
  };

  const verifiedModels = await verifyGeminiAccess({ client, config });

  assert.deepEqual(calls, [
    "gemini-2.5-flash",
    "gemini-2.5-flash-image",
  ]);
  assert.deepEqual(verifiedModels, [
    "models/gemini-2.5-flash",
    "models/gemini-2.5-flash-image",
  ]);
});

test("verifyGeminiAccess stops when a configured model is unavailable", async () => {
  const error = new Error("model unavailable");
  error.status = 404;

  await assert.rejects(
    verifyGeminiAccess({
      client: {
        models: {
          async get() {
            throw error;
          },
        },
      },
      config: {
        textModel: "gemini-2.5-flash",
        imageModel: "gemini-2.5-flash-image",
      },
    }),
    error
  );
});
