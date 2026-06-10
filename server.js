require("dotenv").config({ quiet: true });

const { createApp } = require("./app");
const {
  createGeminiClient,
  getGeminiConfig,
  validateGeminiConfig,
} = require("./config/gemini");
const { verifyGeminiAccess } = require("./services/gemini-readiness");
const { createGeminiService } = require("./services/gemini-service");

async function createVerifiedGeminiService(config) {
  const readinessClient = createGeminiClient({
    ...config,
    timeoutMs: Math.min(config.timeoutMs, 15000),
  });

  await verifyGeminiAccess({ client: readinessClient, config });

  return createGeminiService({
    client: createGeminiClient(config),
    config,
  });
}

async function startServer({
  env = process.env,
  logger = console,
  listen = true,
} = {}) {
  const config = getGeminiConfig(env);
  const configErrors = validateGeminiConfig(config);
  let geminiService = null;

  if (configErrors.length > 0) {
    logger.warn("Gemini is not ready:", configErrors.join("; "));
  } else {
    try {
      geminiService = await createVerifiedGeminiService(config);
    } catch (error) {
      logger.error("Gemini access verification failed", {
        status: Number(error?.status) || null,
        code: error?.code || null,
        name: error?.name || "Error",
      });
    }
  }

  const app = createApp({ geminiService, env, logger });
  if (!listen) {
    return { app, server: null };
  }

  const port = Number.parseInt(env.PORT || "3000", 10);
  const server = app.listen(port, "0.0.0.0", () => {
    logger.log(`motivation-backend listening on port ${port}`);
  });

  function shutdown(signal) {
    logger.log(`${signal} received; shutting down`);
    server.close((error) => {
      if (error) {
        logger.error("Graceful shutdown failed");
        process.exitCode = 1;
      }
    });
  }

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));

  return { app, server };
}

if (require.main === module) {
  startServer().catch((error) => {
    console.error("Server startup failed", {
      name: error?.name || "Error",
    });
    process.exitCode = 1;
  });
}

module.exports = {
  createVerifiedGeminiService,
  startServer,
};
