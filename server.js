require("dotenv").config();

const { createApp } = require("./app");
const {
  createGeminiClient,
  getGeminiConfig,
  validateGeminiConfig,
} = require("./config/gemini");
const { createGeminiService } = require("./services/gemini-service");

const config = getGeminiConfig();
const configErrors = validateGeminiConfig(config);

let geminiService = null;
if (configErrors.length === 0) {
  const client = createGeminiClient(config);
  geminiService = createGeminiService({ client, config });
} else {
  console.warn("Gemini is not ready:", configErrors.join("; "));
}

const app = createApp({ geminiService });
const port = Number.parseInt(process.env.PORT || "3000", 10);
const server = app.listen(port, "0.0.0.0", () => {
  console.log(`motivation-backend listening on port ${port}`);
});

function shutdown(signal) {
  console.log(`${signal} received; shutting down`);
  server.close((error) => {
    if (error) {
      console.error("Graceful shutdown failed");
      process.exitCode = 1;
    }
  });
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

module.exports = { app, server };
