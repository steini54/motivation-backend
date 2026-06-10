require("dotenv").config({ quiet: true });

const { getAiProvider, validateAiProvider } = require("../config/ai");
const {
  createGeminiClient,
  getGeminiConfig,
  validateGeminiConfig,
} = require("../config/gemini");
const {
  createOpenAIClient,
  getOpenAIConfig,
  validateOpenAIConfig,
} = require("../config/openai");
const { verifyGeminiAccess } = require("../services/gemini-readiness");
const { verifyOpenAIAccess } = require("../services/openai-readiness");

async function main() {
  const provider = getAiProvider();
  const providerErrors = validateAiProvider(provider);
  const config =
    provider === "openai" ? getOpenAIConfig() : getGeminiConfig();
  const configErrors =
    provider === "openai"
      ? validateOpenAIConfig(config)
      : validateGeminiConfig(config);
  const errors = [...providerErrors, ...configErrors];

  if (errors.length > 0) {
    throw new Error(errors.join("; "));
  }

  const client =
    provider === "openai"
      ? createOpenAIClient(config)
      : createGeminiClient(config);
  const verifiedModels =
    provider === "openai"
      ? await verifyOpenAIAccess({ client, config })
      : await verifyGeminiAccess({ client, config });

  for (const model of verifiedModels) {
    console.log(`${provider} model is accessible: ${model}`);
  }
}

main().catch((error) => {
  const status = Number(error?.status) || null;

  console.error("AI live check failed.", {
    status,
    code: error?.code || null,
    name: error?.name || "Error",
  });
  process.exitCode = 1;
});
