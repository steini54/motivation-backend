const test = require("node:test");
const assert = require("node:assert/strict");

const {
  createOpenAIService,
  selectOpenAIImageSize,
} = require("../services/openai-service");

const config = {
  textModel: "gpt-4.1-nano",
  imageModel: "gpt-image-1",
  imageQuality: "low",
  imageIdentityMinConfidence: 0.85,
};

const passingQuality = {
  samePerson: true,
  facePreserved: true,
  posePreserved: true,
  clothingPreserved: true,
  framingPreserved: true,
  artifactFree: true,
  professionalBackground: true,
  identityConfidence: 0.96,
  reasons: [],
};

const imageProcessor = {
  async prepareSourceImage(buffer) {
    return {
      buffer,
      mimeType: "image/jpeg",
      width: 900,
      height: 1200,
      aspectRatio: "3:4",
    };
  },
  async validateGeneratedImage(data) {
    return {
      buffer: Buffer.from(data, "base64"),
      width: 1024,
      height: 1536,
      format: "jpeg",
    };
  },
};

function createMockClient(quality = passingQuality) {
  const requests = { responses: [], images: [] };
  const client = {
    responses: {
      async create(input) {
        requests.responses.push(input);
        if (Array.isArray(input.input)) {
          return { output_text: JSON.stringify(quality) };
        }
        return { output_text: "Ein professioneller Motivationstext." };
      },
    },
    images: {
      async edit(input) {
        requests.images.push(input);
        return { data: [{ b64_json: "aW1hZ2U=" }] };
      },
    },
  };

  return { client, requests };
}

test("generateApplicationText uses the lightweight OpenAI text model", async () => {
  const { client, requests } = createMockClient();
  const service = createOpenAIService({ client, config });
  const text = await service.generateApplicationText({
    stichpunkte: "Teamarbeit",
    funktion: "Projektleiter",
  });

  assert.equal(text, "Ein professioneller Motivationstext.");
  assert.equal(requests.responses[0].model, "gpt-4.1-nano");
  assert.equal(requests.responses[0].store, false);
  assert.match(requests.responses[0].input, /Projektleiter/);
});

test("editApplicationPhoto uses high-fidelity OpenAI image editing and QA", async () => {
  const { client, requests } = createMockClient();
  const service = createOpenAIService({
    client,
    config,
    imageProcessor,
    async createUpload(buffer, name, options) {
      return { buffer, name, options };
    },
  });

  const result = await service.editApplicationPhoto({
    buffer: Buffer.from("source-image"),
    mimeType: "image/jpeg",
  });

  assert.equal(result.dataUrl, "data:image/jpeg;base64,aW1hZ2U=");
  assert.equal(result.quality.verified, true);
  assert.equal(result.quality.identityConfidence, 0.96);
  assert.equal(requests.images[0].model, "gpt-image-1");
  assert.equal(requests.images[0].input_fidelity, "high");
  assert.equal(requests.images[0].quality, "low");
  assert.equal(requests.images[0].size, "1024x1536");
  assert.equal(requests.images[0].output_format, "jpeg");
  assert.equal(requests.responses[0].text.format.type, "json_schema");
  assert.equal(requests.responses[0].input[1].content[1].detail, "high");
});

test("editApplicationPhoto rejects an identity mismatch", async () => {
  const { client } = createMockClient({
    ...passingQuality,
    samePerson: false,
    identityConfidence: 0.42,
  });
  const service = createOpenAIService({
    client,
    config,
    imageProcessor,
    async createUpload() {
      return {};
    },
  });

  await assert.rejects(
    service.editApplicationPhoto({
      buffer: Buffer.from("source-image"),
      mimeType: "image/jpeg",
    }),
    { code: "IMAGE_IDENTITY_MISMATCH" }
  );
});

test("selectOpenAIImageSize maps source orientation to supported sizes", () => {
  assert.equal(selectOpenAIImageSize("3:4"), "1024x1536");
  assert.equal(selectOpenAIImageSize("4:3"), "1536x1024");
  assert.equal(selectOpenAIImageSize("1:1"), "1024x1024");
});
