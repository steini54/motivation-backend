const test = require("node:test");
const assert = require("node:assert/strict");
const sharp = require("sharp");

const {
  createPremiumAssetService,
} = require("../services/premium-asset-service");

async function createTestPngDataUrl() {
  const buffer = await sharp({
    create: {
      width: 48,
      height: 64,
      channels: 4,
      background: "#dbeafe",
    },
  })
    .png()
    .toBuffer();
  return `data:image/png;base64,${buffer.toString("base64")}`;
}

test("AI photo assets expose a preview and keep the final image encrypted", async () => {
  const service = createPremiumAssetService({
    secret: "test-secret-with-at-least-thirty-two-characters",
  });
  const sourceDataUrl = await createTestPngDataUrl();

  const protectedImage = await service.protectImage(sourceDataUrl);
  const unlocked = service.unlockImage(protectedImage.protectedAsset);

  assert.match(protectedImage.previewDataUrl, /^data:image\/jpeg;base64,/);
  assert.match(protectedImage.protectedAsset, /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/);
  assert.doesNotMatch(protectedImage.protectedAsset, /iVBORw0KGgo/);
  assert.equal(unlocked.mimeType, "image/png");
  assert.equal(unlocked.buffer.toString("base64"), sourceDataUrl.split(",")[1]);
});

test("AI photo tokens cannot be unlocked with another server secret", async () => {
  const first = createPremiumAssetService({
    secret: "first-test-secret-with-at-least-thirty-two-characters",
  });
  const second = createPremiumAssetService({
    secret: "second-test-secret-with-at-least-thirty-two-characters",
  });
  const protectedImage = await first.protectImage(await createTestPngDataUrl());

  assert.throws(
    () => second.unlockImage(protectedImage.protectedAsset),
    /Invalid premium asset token/
  );
});
