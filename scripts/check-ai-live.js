require("dotenv").config({ quiet: true });

const { getAiProvider, validateAiProvider } = require("../config/ai");
const {
  createGeminiClient,
  getGeminiConfig,
  validateGeminiConfig,
} = require("../config/gemini");
const { verifyGeminiAccess } = require("../services/gemini-readiness");

async function main() {
  const provider = getAiProvider();
  const providerErrors = validateAiProvider(provider);
  const config = getGeminiConfig();
  const configErrors = validateGeminiConfig(config);
  const errors = [...providerErrors, ...configErrors];

  if (errors.length > 0) {
    throw new Error(errors.join("; "));
  }

  const client = createGeminiClient(config);
  const verifiedModels = await verifyGeminiAccess({ client, config });

  for (const model of verifiedModels) {
    console.log(`Gemini model is accessible: ${model}`);
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
