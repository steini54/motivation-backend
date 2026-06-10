const { GoogleGenAI } = require("@google/genai");

const DEFAULT_GEMINI_TEXT_MODEL = "gemini-2.5-flash";
const DEFAULT_GEMINI_IMAGE_MODEL = "gemini-3.1-flash-image";
const DEFAULT_GEMINI_IMAGE_SIZE = "1K";
const DEFAULT_GEMINI_TIMEOUT_MS = 120000;
const DEFAULT_GEMINI_RETRY_ATTEMPTS = 3;
const DEFAULT_GEMINI_RETRY_BASE_DELAY_MS = 1500;
const DEFAULT_IMAGE_IDENTITY_MIN_CONFIDENCE = 0.85;

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

function getGeminiConfig(env = process.env) {
  const apiKeySource = env.GOOGLE_API_KEY
    ? "GOOGLE_API_KEY"
    : env.GEMINI_API_KEY
      ? "GEMINI_API_KEY"
      : null;

  return {
    apiKey: apiKeySource ? env[apiKeySource] : "",
    apiKeySource,
    textModel: env.GEMINI_TEXT_MODEL || DEFAULT_GEMINI_TEXT_MODEL,
    imageModel: env.GEMINI_IMAGE_MODEL || DEFAULT_GEMINI_IMAGE_MODEL,
    imageSize: env.GEMINI_IMAGE_SIZE || DEFAULT_GEMINI_IMAGE_SIZE,
    timeoutMs: parsePositiveInteger(
      env.GEMINI_TIMEOUT_MS,
      DEFAULT_GEMINI_TIMEOUT_MS
    ),
    retryAttempts: parsePositiveInteger(
      env.GEMINI_RETRY_ATTEMPTS,
      DEFAULT_GEMINI_RETRY_ATTEMPTS
    ),
    retryBaseDelayMs: parsePositiveInteger(
      env.GEMINI_RETRY_BASE_DELAY_MS,
      DEFAULT_GEMINI_RETRY_BASE_DELAY_MS
    ),
    imageIdentityMinConfidence: parseConfidence(
      env.IMAGE_IDENTITY_MIN_CONFIDENCE,
      DEFAULT_IMAGE_IDENTITY_MIN_CONFIDENCE
    ),
  };
}

function validateGeminiConfig(config) {
  const errors = [];

  if (!config.apiKey) {
    errors.push("GEMINI_API_KEY is missing");
  }

  if (config.textModel !== DEFAULT_GEMINI_TEXT_MODEL) {
    errors.push(`GEMINI_TEXT_MODEL must be ${DEFAULT_GEMINI_TEXT_MODEL}`);
  }

  if (config.imageModel !== DEFAULT_GEMINI_IMAGE_MODEL) {
    errors.push(`GEMINI_IMAGE_MODEL must be ${DEFAULT_GEMINI_IMAGE_MODEL}`);
  }

  if (!["512", "1K", "2K", "4K"].includes(config.imageSize)) {
    errors.push("GEMINI_IMAGE_SIZE must be one of: 512, 1K, 2K, 4K");
  }

  return errors;
}

function createGeminiClient(config = getGeminiConfig()) {
  const errors = validateGeminiConfig(config);

  if (errors.length > 0) {
    throw new Error(errors.join("; "));
  }

  return new GoogleGenAI({
    apiKey: config.apiKey,
    httpOptions: {
      timeout: config.timeoutMs,
    },
  });
}

module.exports = {
  DEFAULT_GEMINI_TEXT_MODEL,
  DEFAULT_GEMINI_IMAGE_MODEL,
  DEFAULT_GEMINI_IMAGE_SIZE,
  DEFAULT_GEMINI_TIMEOUT_MS,
  DEFAULT_GEMINI_RETRY_ATTEMPTS,
  DEFAULT_GEMINI_RETRY_BASE_DELAY_MS,
  DEFAULT_IMAGE_IDENTITY_MIN_CONFIDENCE,
  getGeminiConfig,
  validateGeminiConfig,
  createGeminiClient,
};
