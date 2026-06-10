require("dotenv").config({ quiet: true });

const {
  DEFAULT_GEMINI_TEXT_MODEL,
  DEFAULT_GEMINI_IMAGE_MODEL,
  getGeminiConfig,
  validateGeminiConfig,
} = require("../config/gemini");

const config = getGeminiConfig();
const errors = validateGeminiConfig(config);

if (errors.length > 0) {
  console.error("Gemini configuration is not ready:");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exitCode = 1;
} else {
  console.log("Gemini configuration is ready.");
  console.log(`API key source: ${config.apiKeySource}`);
  console.log(`Text model: ${config.textModel}`);
  console.log(`Image model: ${config.imageModel}`);
  console.log(`Image size: ${config.imageSize}`);
  console.log(`Request timeout: ${config.timeoutMs}ms`);
  console.log(
    `Image identity threshold: ${config.imageIdentityMinConfidence}`
  );
  console.log("No Gemini API request was made.");
}
