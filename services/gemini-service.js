const {
  prepareSourceImage,
  validateGeneratedImage,
} = require("./image-processing");

const IMAGE_EDIT_PROMPT = `
Purpose: create a professional application photo by editing the supplied
reference photo, not by inventing a new person.

Identity lock:
- The supplied person is the immutable subject of the photograph.
- Preserve the exact same identity, facial structure, eyes, eyebrows, nose,
  mouth, jawline, ears, hairline, hairstyle, skin texture, skin tone, expression,
  age appearance, body shape, pose, clothing, proportions, framing, and camera
  angle.
- Preserve natural facial asymmetry and distinguishing details from the source.
- Keep the subject photorealistic and recognizably identical to the reference.

Requested edit:
- Replace only the surrounding background with a clean, understated,
  professional application-photo background.
- Use a neutral warm white, light gray, or softly blurred modern office setting.
- Match the source camera perspective and create natural, subtle studio lighting
  around the subject.
- Keep the composition uncluttered and suitable for a German or Swiss job
  application.

The result must remain a natural photograph. Treat the person as protected
content and make the smallest possible visual change outside the subject.
`.trim();

const IMAGE_QUALITY_SCHEMA = {
  type: "object",
  properties: {
    samePerson: { type: "boolean" },
    facePreserved: { type: "boolean" },
    posePreserved: { type: "boolean" },
    clothingPreserved: { type: "boolean" },
    framingPreserved: { type: "boolean" },
    artifactFree: { type: "boolean" },
    professionalBackground: { type: "boolean" },
    identityConfidence: {
      type: "number",
      minimum: 0,
      maximum: 1,
    },
    reasons: {
      type: "array",
      maxItems: 3,
      items: { type: "string" },
    },
  },
  required: [
    "samePerson",
    "facePreserved",
    "posePreserved",
    "clothingPreserved",
    "framingPreserved",
    "artifactFree",
    "professionalBackground",
    "identityConfidence",
    "reasons",
  ],
};

const IMAGE_QUALITY_PROMPT = `
Compare the first image (the user's original reference photo) with the second
image (the edited candidate).

This is a strict identity-preservation quality check for a job application
photo. Ignore the intended background and subtle lighting change when comparing
identity. Reject the candidate if the face, identity, expression, hairstyle,
pose, clothing, proportions, framing, or camera angle changed noticeably.
Also reject obvious generation artifacts or an unprofessional background.

Be conservative. A candidate should pass only when an ordinary person who knows
the subject would immediately recognize the exact same photograph subject.
Return only the requested JSON assessment.
`.trim();

function buildTextPrompt({ stichpunkte, funktion }) {
  return `
You are an expert German application writer.

Write one polished motivation paragraph in German for the following role:
${funktion}

Use only the information in these notes:
${stichpunkte}

Requirements:
- Write exactly 5 to 7 complete sentences as one flowing paragraph.
- Use a professional, clear, credible, and convincing tone.
- Do not use headings, bullet points, placeholders, greetings, or a closing.
- Do not invent qualifications, employers, dates, or personal facts.
- Avoid generic filler and repetition.
- Return only the finished German paragraph.
`.trim();
}

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

function parseQualityAssessment(response) {
  const text = extractText(response);

  try {
    return JSON.parse(text);
  } catch {
    const error = new Error("Gemini returned an invalid quality assessment");
    error.code = "IMAGE_QUALITY_CHECK_FAILED";
    throw error;
  }
}

function isQualityAccepted(quality, minimumConfidence) {
  return (
    quality.samePerson === true &&
    quality.facePreserved === true &&
    quality.posePreserved === true &&
    quality.clothingPreserved === true &&
    quality.framingPreserved === true &&
    quality.artifactFree === true &&
    quality.professionalBackground === true &&
    Number(quality.identityConfidence) >= minimumConfidence
  );
}

function createGeminiService({
  client,
  config,
  imageProcessor = {
    prepareSourceImage,
    validateGeneratedImage,
  },
}) {
  if (!client?.models?.generateContent) {
    throw new TypeError("A valid Google Gen AI client is required");
  }

  return {
    async generateApplicationText(input) {
      const response = await client.models.generateContent({
        model: config.textModel,
        contents: buildTextPrompt(input),
        config: {
          temperature: 0.5,
          maxOutputTokens: 600,
          thinkingConfig: {
            thinkingBudget: 0,
          },
        },
      });

      const text = extractText(response);
      if (!text) {
        const error = new Error("Gemini returned no text");
        error.code = "EMPTY_AI_RESPONSE";
        throw error;
      }

      return text;
    },

    async editApplicationPhoto({ buffer, mimeType }) {
      const source = await imageProcessor.prepareSourceImage(buffer, mimeType);
      const response = await client.models.generateContent({
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
          imageConfig: {
            aspectRatio: source.aspectRatio,
          },
        },
      });

      const image = extractImage(response);
      if (!image) {
        const error = new Error("Gemini returned no image");
        error.code = "EMPTY_AI_RESPONSE";
        throw error;
      }

      const generated = await imageProcessor.validateGeneratedImage(image.data);
      const qualityResponse = await client.models.generateContent({
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
  parseQualityAssessment,
  isQualityAccepted,
  createGeminiService,
};
