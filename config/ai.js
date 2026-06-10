const SUPPORTED_AI_PROVIDERS = new Set(["gemini", "openai"]);
const DEFAULT_AI_PROVIDER = "gemini";

function getAiProvider(env = process.env) {
  return (env.AI_PROVIDER || DEFAULT_AI_PROVIDER).trim().toLowerCase();
}

function validateAiProvider(provider) {
  return SUPPORTED_AI_PROVIDERS.has(provider)
    ? []
    : [`AI_PROVIDER must be one of: ${[...SUPPORTED_AI_PROVIDERS].join(", ")}`];
}

module.exports = {
  DEFAULT_AI_PROVIDER,
  SUPPORTED_AI_PROVIDERS,
  getAiProvider,
  validateAiProvider,
};
