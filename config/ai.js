const DEFAULT_AI_PROVIDER = "gemini";

function getAiProvider(env = process.env) {
  return (env.AI_PROVIDER || DEFAULT_AI_PROVIDER).trim().toLowerCase();
}

function validateAiProvider(provider) {
  return provider === DEFAULT_AI_PROVIDER
    ? []
    : ["AI_PROVIDER must be gemini"];
}

module.exports = {
  DEFAULT_AI_PROVIDER,
  getAiProvider,
  validateAiProvider,
};
