const test = require("node:test");
const assert = require("node:assert/strict");
const sharp = require("sharp");

const {
  prepareSourceImage,
  selectClosestAspectRatio,
  validateGeneratedImage,
} = require("../services/image-processing");

test("selectClosestAspectRatio preserves the nearest supported composition", () => {
  assert.equal(selectClosestAspectRatio(900, 1200), "3:4");
  assert.equal(selectClosestAspectRatio(1200, 900), "4:3");
  assert.equal(selectClosestAspectRatio(1000, 1000), "1:1");
});

test("prepareSourceImage normalizes orientation, size, format, and metadata", async () => {
  const source = await sharp({
    create: {
      width: 900,
      height: 1200,
      channels: 3,
      background: "#d9d9d9",
    },
  })
    .withMetadata({ orientation: 1 })
    .png()
    .toBuffer();

  const result = await prepareSourceImage(source);
  const metadata = await sharp(result.buffer).metadata();

  assert.equal(result.mimeType, "image/jpeg");
  assert.equal(result.aspectRatio, "3:4");
  assert.equal(metadata.format, "jpeg");
  assert.equal(metadata.orientation, undefined);
  assert.equal(result.width, 900);
  assert.equal(result.height, 1200);
});

test("prepareSourceImage rejects images that are too small", async () => {
  const source = await sharp({
    create: {
      width: 100,
      height: 100,
      channels: 3,
      background: "#ffffff",
    },
  })
    .png()
    .toBuffer();

  await assert.rejects(() => prepareSourceImage(source), {
    code: "INVALID_SOURCE_IMAGE",
  });
});

test("validateGeneratedImage accepts valid output and rejects malformed data", async () => {
  const output = await sharp({
    create: {
      width: 864,
      height: 1184,
      channels: 3,
      background: "#ffffff",
    },
  })
    .png()
    .toBuffer();

  const valid = await validateGeneratedImage(output.toString("base64"));
  assert.equal(valid.width, 864);
  assert.equal(valid.height, 1184);
  assert.equal(valid.format, "png");

  await assert.rejects(() => validateGeneratedImage("not-base64-image"), {
    code: "INVALID_GENERATED_IMAGE",
  });
});
