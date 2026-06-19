const {
  prepareSourceImage,
  validateGeneratedImage,
} = require("./image-processing");
const {
  IMAGE_EDIT_PROMPT,
  IMAGE_QUALITY_PROMPT,
  IMAGE_QUALITY_SCHEMA,
  buildTextPrompt,
  parseQualityAssessment: parseQualityJson,
  isQualityAccepted,
} = require("./ai-prompts");
const { withAiRetry } = require("./ai-retry");

function getResponseParts(response) {
  return (
    response?.candidates?.flatMap(
      (candidate) => candidate?.content?.parts || []
    ) || []
  );
}

function extractText(response) {
  if (typeof response?.text === "string" && response.text.trim()) {
    return response.text.trim();
  }

  return getResponseParts(response)
    .map((part) => part.text)
    .filter(Boolean)
    .join("")
    .trim();
}

function extractImage(response) {
  const imagePart = getResponseParts(response).find(
    (part) => part.inlineData?.data
  );

  if (!imagePart) {
    return null;
  }

  return {
    data: imagePart.inlineData.data,
    mimeType: imagePart.inlineData.mimeType || "image/png",
  };
}

function createEmptyResponseError(message, response) {
  const candidate = response?.candidates?.[0];
  const finishReason = candidate?.finishReason || null;
  const error = new Error(message);

  error.code =
    finishReason === "IMAGE_SAFETY"
      ? "IMAGE_GENERATION_REJECTED"
      : "EMPTY_AI_RESPONSE";
  error.finishReason = finishReason;
  return error;
}

function parseQualityAssessment(response) {
  return parseQualityJson(extractText(response), "Gemini");
}

function getTextMaxOutputTokens(textLength) {
  if (textLength === "long") {
    return 1100;
  }

  if (textLength === "short") {
    return 450;
  }

  return 800;
}

function createGeminiService({
  client,
  config,
  imageProcessor = {
    prepareSourceImage,
    validateGeneratedImage,
  },
  retry = withAiRetry,
}) {
  if (!client?.models?.generateContent) {
    throw new TypeError("A valid Google Gen AI client is required");
  }

  return {
    async generateApplicationText(input) {
      const response = await retry(
        async () => {
          const result = await client.models.generateContent({
            model: config.textModel,
            contents: buildTextPrompt(input),
            config: {
              temperature: 0.5,
              maxOutputTokens: getTextMaxOutputTokens(input?.textLength),
              thinkingConfig: {
                thinkingBudget: 0,
              },
            },
          });

          if (!extractText(result)) {
            throw createEmptyResponseError("Gemini returned no text", result);
          }
          return result;
        },
        {
          attempts: config.retryAttempts,
          baseDelayMs: config.retryBaseDelayMs,
        }
      );

      const text = extractText(response);
      return text;
    },

    async editApplicationPhoto({ buffer, mimeType }) {
      const source = await imageProcessor.prepareSourceImage(buffer, mimeType);
      const response = await retry(
        async () => {
          const result = await client.models.generateContent({
            model: config.imageModel,
            contents: [
              {
                text: IMAGE_EDIT_PROMPT,
              },
              {
                inlineData: {
                  data: source.buffer.toString("base64"),
                  mimeType: source.mimeType,
                },
              },
            ],
            config: {
              responseModalities: ["IMAGE"],
              responseFormat: {
                image: {
                  aspectRatio: source.aspectRatio,
                  imageSize: config.imageSize || "1K",
                },
              },
            },
          });

          if (!extractImage(result)) {
            throw createEmptyResponseError("Gemini returned no image", result);
          }
          return result;
        },
        {
          attempts: config.retryAttempts,
          baseDelayMs: config.retryBaseDelayMs,
        }
      );

      const image = extractImage(response);
      const generated = await imageProcessor.validateGeneratedImage(image.data);
      const qualityResponse = await retry(
        async () => {
          const result = await client.models.generateContent({
            model: config.textModel,
            contents: [
              { text: IMAGE_QUALITY_PROMPT },
              {
                inlineData: {
                  data: source.buffer.toString("base64"),
                  mimeType: source.mimeType,
                },
              },
              {
                inlineData: {
                  data: generated.buffer.toString("base64"),
                  mimeType: image.mimeType,
                },
              },
            ],
            config: {
              temperature: 0,
              maxOutputTokens: 300,
              thinkingConfig: {
                thinkingBudget: 0,
              },
              responseMimeType: "application/json",
              responseJsonSchema: IMAGE_QUALITY_SCHEMA,
            },
          });

          if (!extractText(result)) {
            throw createEmptyResponseError(
              "Gemini returned no quality assessment",
              result
            );
          }
          return result;
        },
        {
          attempts: config.retryAttempts,
          baseDelayMs: config.retryBaseDelayMs,
        }
      );

      const quality = parseQualityAssessment(qualityResponse);
      const minimumConfidence =
        config.imageIdentityMinConfidence === undefined
          ? 0.85
          : config.imageIdentityMinConfidence;

      if (!isQualityAccepted(quality, minimumConfidence)) {
        const error = new Error(
          "Generated image did not pass identity-preservation checks"
        );
        error.code = "IMAGE_IDENTITY_MISMATCH";
        error.quality = quality;
        throw error;
      }

      return {
        dataUrl: `data:${image.mimeType};base64,${image.data}`,
        quality: {
          identityConfidence: quality.identityConfidence,
          verified: true,
        },
        image: {
          aspectRatio: source.aspectRatio,
          width: generated.width,
          height: generated.height,
        },
      };
    },
  };
}

module.exports = {
  IMAGE_EDIT_PROMPT,
  IMAGE_QUALITY_PROMPT,
  IMAGE_QUALITY_SCHEMA,
  buildTextPrompt,
  extractText,
  extractImage,
  createEmptyResponseError,
  getTextMaxOutputTokens,
  parseQualityAssessment,
  isQualityAccepted,
  createGeminiService,
};
