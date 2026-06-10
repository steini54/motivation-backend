require("dotenv").config({ quiet: true });

const {
  createGeminiClient,
  getGeminiConfig,
  validateGeminiConfig,
} = require("../config/gemini");
const { verifyGeminiAccess } = require("../services/gemini-readiness");

async function main() {
  const config = getGeminiConfig();
  const errors = validateGeminiConfig(config);

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

  console.error("Gemini live check failed.", {
    status,
    code: error?.code || null,
    name: error?.name || "Error",
  });

  if (status === 401 || status === 403) {
    console.error(
      "The credential was rejected. Copy a current Gemini API key from Google AI Studio and verify that the Generative Language API is enabled for its project."
    );
  } else if (status === 429) {
    console.error(
      "The credential is recognized, but the project has no available Gemini quota or billing credit."
    );
  }

  process.exitCode = 1;
});
