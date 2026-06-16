require("dotenv").config({ quiet: true });

const { createApp } = require("./app");
const { getAiProvider, validateAiProvider } = require("./config/ai");
const {
  createGeminiClient,
  getGeminiConfig,
  validateGeminiConfig,
} = require("./config/gemini");
const { verifyGeminiAccess } = require("./services/gemini-readiness");
const { createGeminiService } = require("./services/gemini-service");
const { createPaymentServiceFromEnv } = require("./services/stripe-service");

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

async function createVerifiedProviderService(provider, env) {
  const providerErrors = validateAiProvider(provider);
  if (providerErrors.length > 0) {
    throw new Error(providerErrors.join("; "));
  }

  const config = getGeminiConfig(env);
  const errors = validateGeminiConfig(config);
  if (errors.length > 0) {
    throw new Error(errors.join("; "));
  }
  return createVerifiedGeminiService(config);
}

async function startServer({
  env = process.env,
  logger = console,
  listen = true,
  createProviderService = createVerifiedProviderService,
} = {}) {
  const aiProvider = getAiProvider(env);
  const providerErrors = validateAiProvider(aiProvider);
  let aiService = null;

  if (providerErrors.length > 0) {
    logger.warn("AI provider is not ready:", providerErrors.join("; "));
  } else {
    const config = getGeminiConfig(env);
    const configErrors = validateGeminiConfig(config);

    if (configErrors.length > 0) {
      logger.warn(`${aiProvider} is not ready:`, configErrors.join("; "));
    } else {
      try {
        aiService = await createProviderService(aiProvider, env);
      } catch (error) {
        logger.error(`${aiProvider} access verification failed`, {
          status: Number(error?.status) || null,
          code: error?.code || null,
          name: error?.name || "Error",
        });
      }
    }
  }

  const app = createApp({
    aiService,
    aiProvider,
    paymentService: createPaymentServiceFromEnv(env, logger),
    env,
    logger,
  });
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
  createVerifiedProviderService,
  startServer,
};
