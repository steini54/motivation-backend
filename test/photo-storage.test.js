const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");
const { IDBFactory } = require("fake-indexeddb");

const photoStorageSource = fs.readFileSync(
  path.join(
    __dirname,
    "..",
    "frontend",
    "vitagen",
    "motivation",
    "photo-storage.js"
  ),
  "utf8"
);

function loadPhotoStorage() {
  const listeners = new Map();
  const revokedUrls = [];
  let nextUrlId = 1;

  const window = {
    indexedDB: new IDBFactory(),
    URL: {
      createObjectURL() {
        return `blob:test-${nextUrlId++}`;
      },
      revokeObjectURL(url) {
        revokedUrls.push(url);
      },
    },
    addEventListener(type, listener) {
      listeners.set(type, listener);
    },
  };

  vm.runInNewContext(photoStorageSource, {
    Blob,
    fetch,
    window,
  });

  return {
    listeners,
    revokedUrls,
    storage: window.PhotoStorage,
  };
}

test("photo storage saves, restores, and clears selected image blobs", async () => {
  const { storage } = loadPhotoStorage();
  const original = new Blob(["source"], { type: "image/jpeg" });
  const selected = new Blob(["selected"], { type: "image/png" });

  await storage.saveSourcePhoto(original);
  await storage.saveSelectedPhoto(selected);
  const source = await storage.getSourcePhoto();
  const restored = await storage.getSelectedPhoto();

  assert.equal(source.type, "image/jpeg");
  assert.equal(await source.text(), "source");
  assert.equal(restored.type, "image/png");
  assert.equal(await restored.text(), "selected");

  await storage.clearSelectedPhoto();
  assert.equal(await storage.getSelectedPhoto(), undefined);
});

test("photo storage rejects non-image blobs", async () => {
  const { storage } = loadPhotoStorage();
  const invalidBlob = new Blob(["text"], { type: "text/plain" });

  await assert.rejects(
    storage.saveSelectedPhoto(invalidBlob),
    /valid image Blob/
  );
  await assert.rejects(storage.saveSourcePhoto(invalidBlob), /valid source image/);
});

test("photo storage migrates legacy data URLs and revokes object URLs", async () => {
  const { listeners, revokedUrls, storage } = loadPhotoStorage();
  const dataUrl = "data:image/png;base64,iVBORw0KGgo=";

  const migrated = await storage.migrateLegacyPhoto(dataUrl);
  const source = await storage.getSourcePhoto();
  const restored = await storage.getSelectedPhoto();
  const objectUrl = storage.createPhotoUrl(restored);

  assert.equal(migrated.type, "image/png");
  assert.equal(source.type, "image/png");
  assert.equal(restored.type, "image/png");
  assert.equal(objectUrl, "blob:test-1");

  listeners.get("unload")();
  assert.deepEqual(revokedUrls, ["blob:test-1"]);
});

test("photo storage persists and clears protected AI photo assets", async () => {
  const { storage } = loadPhotoStorage();

  await storage.saveProtectedPhotoAsset("encrypted-ai-photo-token");
  assert.equal(
    await storage.getProtectedPhotoAsset(),
    "encrypted-ai-photo-token"
  );

  await storage.clearProtectedPhotoAsset();
  assert.equal(await storage.getProtectedPhotoAsset(), undefined);
});
