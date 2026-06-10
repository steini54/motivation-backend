const { isTransientAiError } = require("./ai-retry");

function createFallbackAiService({
  primaryService,
  fallbackService,
  primaryProvider,
  fallbackProvider,
  logger = console,
}) {
  if (!primaryService || !fallbackService) {
    throw new TypeError("Primary and fallback AI services are required");
  }

  async function run(method, input) {
    try {
      return await primaryService[method](input);
    } catch (error) {
      if (!isTransientAiError(error)) {
        throw error;
      }

      logger.warn("Primary AI provider unavailable; using fallback", {
        primaryProvider,
        fallbackProvider,
        method,
        status: Number(error?.status) || null,
        code: error?.code || null,
        name: error?.name || "Error",
      });
      return fallbackService[method](input);
    }
  }

  return {
    generateApplicationText(input) {
      return run("generateApplicationText", input);
    },
    editApplicationPhoto(input) {
      return run("editApplicationPhoto", input);
    },
  };
}

module.exports = {
  createFallbackAiService,
};
