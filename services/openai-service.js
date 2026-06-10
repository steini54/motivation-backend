const { toFile } = require("openai");
const {
  prepareSourceImage,
  validateGeneratedImage,
} = require("./image-processing");
const {
  IMAGE_EDIT_PROMPT,
  IMAGE_QUALITY_PROMPT,
  IMAGE_QUALITY_SCHEMA,
  buildTextPrompt,
  parseQualityAssessment,
  isQualityAccepted,
} = require("./ai-prompts");

function selectOpenAIImageSize(aspectRatio) {
  const [width, height] = String(aspectRatio)
    .split(":")
    .map((part) => Number(part));
  const ratio = width > 0 && height > 0 ? width / height : 1;

  if (ratio < 0.9) {
    return "1024x1536";
  }

  if (ratio > 1.1) {
    return "1536x1024";
  }

  return "1024x1024";
}

function getOutputText(response) {
  return typeof response?.output_text === "string"
    ? response.output_text.trim()
    : "";
}

function createOpenAIService({
  client,
  config,
  imageProcessor = {
    prepareSourceImage,
    validateGeneratedImage,
  },
  createUpload = toFile,
}) {
  if (!client?.responses?.create || !client?.images?.edit) {
    throw new TypeError("A valid OpenAI client is required");
  }

  return {
    async generateApplicationText(input) {
      const response = await client.responses.create({
        model: config.textModel,
        input: buildTextPrompt(input),
        temperature: 0.5,
        max_output_tokens: 600,
        store: false,
      });

      const text = getOutputText(response);
      if (!text) {
        const error = new Error("OpenAI returned no text");
        error.code = "EMPTY_AI_RESPONSE";
        throw error;
      }

      return text;
    },

    async editApplicationPhoto({ buffer, mimeType }) {
      const source = await imageProcessor.prepareSourceImage(buffer, mimeType);
      const upload = await createUpload(source.buffer, "source.jpg", {
        type: source.mimeType,
      });
      const imageResponse = await client.images.edit({
        model: config.imageModel,
        image: upload,
        prompt: IMAGE_EDIT_PROMPT,
        input_fidelity: "high",
        quality: config.imageQuality,
        size: selectOpenAIImageSize(source.aspectRatio),
        output_format: "jpeg",
        output_compression: 90,
        n: 1,
      });
      const imageData = imageResponse?.data?.[0]?.b64_json;

      if (!imageData) {
        const error = new Error("OpenAI returned no image");
        error.code = "EMPTY_AI_RESPONSE";
        throw error;
      }

      const generated = await imageProcessor.validateGeneratedImage(imageData);
      const qualityResponse = await client.responses.create({
        model: config.textModel,
        input: [
          {
            role: "developer",
            content: [{ type: "input_text", text: IMAGE_QUALITY_PROMPT }],
          },
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: "First image: original reference. Second image: edited candidate.",
              },
              {
                type: "input_image",
                image_url: `data:${source.mimeType};base64,${source.buffer.toString(
                  "base64"
                )}`,
                detail: "high",
              },
              {
                type: "input_image",
                image_url: `data:image/jpeg;base64,${generated.buffer.toString(
                  "base64"
                )}`,
                detail: "high",
              },
            ],
          },
        ],
        text: {
          format: {
            type: "json_schema",
            name: "image_quality_assessment",
            strict: true,
            schema: IMAGE_QUALITY_SCHEMA,
          },
        },
        temperature: 0,
        max_output_tokens: 300,
        store: false,
      });
      const quality = parseQualityAssessment(
        getOutputText(qualityResponse),
        "OpenAI"
      );
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
        dataUrl: `data:image/jpeg;base64,${imageData}`,
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
  selectOpenAIImageSize,
  getOutputText,
  createOpenAIService,
};
