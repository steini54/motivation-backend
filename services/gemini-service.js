const IMAGE_EDIT_PROMPT = `
Edit this image into a professional, realistic application portrait.

Strict preservation rules:
- Keep the person's identity, face, facial features, expression, hair, skin tone,
  body, pose, clothing, proportions, framing, and camera angle unchanged.
- Do not beautify, reshape, retouch, crop, zoom, or add/remove body features.
- Change only the background to a clean neutral white or softly blurred
  professional office background.
- Improve lighting and color balance only very subtly, without changing facial
  details.
- The result must look like a natural photograph, not an illustration.
- If the requested edit cannot be made while preserving the person exactly,
  return the original image unchanged.
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

function createGeminiService({ client, config }) {
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
      const response = await client.models.generateContent({
        model: config.imageModel,
        contents: [
          {
            inlineData: {
              data: buffer.toString("base64"),
              mimeType,
            },
          },
          {
            text: IMAGE_EDIT_PROMPT,
          },
        ],
        config: {
          responseModalities: ["TEXT", "IMAGE"],
        },
      });

      const image = extractImage(response);
      if (!image) {
        const error = new Error("Gemini returned no image");
        error.code = "EMPTY_AI_RESPONSE";
        throw error;
      }

      return `data:${image.mimeType};base64,${image.data}`;
    },
  };
}

module.exports = {
  IMAGE_EDIT_PROMPT,
  buildTextPrompt,
  extractText,
  extractImage,
  createGeminiService,
};
