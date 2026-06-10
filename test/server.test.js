const assert = require("node:assert/strict");
const test = require("node:test");

const { startServer } = require("../server");

test("startServer remains unready when Gemini configuration is missing", async () => {
  const messages = [];
  const logger = {
    log() {},
    error() {},
    warn(...parts) {
      messages.push(parts.join(" "));
    },
  };

  const { app, server } = await startServer({
    env: {},
    logger,
    listen: false,
  });

  assert.equal(server, null);
  assert.equal(typeof app, "function");
  assert.match(messages.join("\n"), /GEMINI_API_KEY is missing/);
});

test("startServer validates OpenAI configuration when selected", async () => {
  const messages = [];
  const logger = {
    log() {},
    error() {},
    warn(...parts) {
      messages.push(parts.join(" "));
    },
  };

  const { app, server } = await startServer({
    env: { AI_PROVIDER: "openai" },
    logger,
    listen: false,
  });

  assert.equal(server, null);
  assert.equal(typeof app, "function");
  assert.match(messages.join("\n"), /OPENAI_API_KEY is missing/);
  assert.doesNotMatch(messages.join("\n"), /GEMINI_API_KEY/);
});
