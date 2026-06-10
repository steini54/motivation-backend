const OpenAI = require("openai");

const DEFAULT_OPENAI_TEXT_MODEL = "gpt-4.1-nano";
const DEFAULT_OPENAI_IMAGE_MODEL = "gpt-image-1";
const DEFAULT_OPENAI_TIMEOUT_MS = 120000;
const DEFAULT_OPENAI_IMAGE_QUALITY = "low";
const DEFAULT_IMAGE_IDENTITY_MIN_CONFIDENCE = 0.85;
const OPENAI_IMAGE_QUALITIES = new Set(["low", "medium", "high", "auto"]);

function parsePositiveInteger(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function parseConfidence(value, fallback) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) && parsed >= 0 && parsed <= 1
    ? parsed
    : fallback;
}

function getOpenAIConfig(env = process.env) {
  return {
    apiKey: env.OPENAI_API_KEY || "",
    textModel: env.OPENAI_TEXT_MODEL || DEFAULT_OPENAI_TEXT_MODEL,
    imageModel: env.OPENAI_IMAGE_MODEL || DEFAULT_OPENAI_IMAGE_MODEL,
    timeoutMs: parsePositiveInteger(
      env.OPENAI_TIMEOUT_MS,
      DEFAULT_OPENAI_TIMEOUT_MS
    ),
    imageQuality:
      env.OPENAI_IMAGE_QUALITY || DEFAULT_OPENAI_IMAGE_QUALITY,
    imageIdentityMinConfidence: parseConfidence(
      env.IMAGE_IDENTITY_MIN_CONFIDENCE,
      DEFAULT_IMAGE_IDENTITY_MIN_CONFIDENCE
    ),
  };
}

function validateOpenAIConfig(config) {
  const errors = [];

  if (!config.apiKey) {
    errors.push("OPENAI_API_KEY is missing");
  }

  if (config.textModel !== DEFAULT_OPENAI_TEXT_MODEL) {
    errors.push(`OPENAI_TEXT_MODEL must be ${DEFAULT_OPENAI_TEXT_MODEL}`);
  }

  if (config.imageModel !== DEFAULT_OPENAI_IMAGE_MODEL) {
    errors.push(`OPENAI_IMAGE_MODEL must be ${DEFAULT_OPENAI_IMAGE_MODEL}`);
  }

  if (!OPENAI_IMAGE_QUALITIES.has(config.imageQuality)) {
    errors.push(
      `OPENAI_IMAGE_QUALITY must be one of: ${[
        ...OPENAI_IMAGE_QUALITIES,
      ].join(", ")}`
    );
  }

  return errors;
}

function createOpenAIClient(config = getOpenAIConfig()) {
  const errors = validateOpenAIConfig(config);

  if (errors.length > 0) {
    throw new Error(errors.join("; "));
  }

  return new OpenAI({
    apiKey: config.apiKey,
    timeout: config.timeoutMs,
    maxRetries: 2,
  });
}

module.exports = {
  DEFAULT_OPENAI_TEXT_MODEL,
  DEFAULT_OPENAI_IMAGE_MODEL,
  DEFAULT_OPENAI_TIMEOUT_MS,
  DEFAULT_OPENAI_IMAGE_QUALITY,
  OPENAI_IMAGE_QUALITIES,
  getOpenAIConfig,
  validateOpenAIConfig,
  createOpenAIClient,
};
