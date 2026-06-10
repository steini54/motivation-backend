require("dotenv").config({ quiet: true });

const { getAiProvider, validateAiProvider } = require("../config/ai");
const {
  getGeminiConfig,
  validateGeminiConfig,
} = require("../config/gemini");

const provider = getAiProvider();
const providerErrors = validateAiProvider(provider);
const config = getGeminiConfig();
const configErrors = validateGeminiConfig(config);
const errors = [...providerErrors, ...configErrors];

if (errors.length > 0) {
  console.error("AI configuration is not ready:");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exitCode = 1;
} else {
  console.log("AI configuration is ready.");
  console.log(`Provider: ${provider}`);
  console.log(`Text model: ${config.textModel}`);
  console.log(`Image model: ${config.imageModel}`);
  console.log(`Request timeout: ${config.timeoutMs}ms`);
  console.log(
    `Image identity threshold: ${config.imageIdentityMinConfidence}`
  );
  console.log(`Image size: ${config.imageSize}`);
  console.log("No AI API request was made.");
}
