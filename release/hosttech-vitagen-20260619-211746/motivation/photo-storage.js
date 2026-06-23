(function initializePhotoStorage(global) {
  "use strict";

  const DB_NAME = "vitagen-media";
  const DB_VERSION = 1;
  const STORE_NAME = "photos";
  const SOURCE_PHOTO_KEY = "source-application-photo";
  const SELECTED_PHOTO_KEY = "selected-application-photo";
  const STORAGE_MARKER = "indexeddb:selected-application-photo";
  const objectUrls = new Set();

  function openDatabase() {
    return new Promise((resolve, reject) => {
      if (!global.indexedDB) {
        reject(new Error("IndexedDB is not supported by this browser."));
        return;
      }

      const request = global.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = () => {
        const database = request.result;
        if (!database.objectStoreNames.contains(STORE_NAME)) {
          database.createObjectStore(STORE_NAME);
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async function runTransaction(mode, operation) {
    const database = await openDatabase();

    return new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, mode);
      const store = transaction.objectStore(STORE_NAME);
      const request = operation(store);
      let result;

      request.onsuccess = () => {
        result = request.result;
      };
      request.onerror = () => {
        database.close();
        reject(request.error);
      };
      transaction.oncomplete = () => {
        database.close();
        resolve(result);
      };
      transaction.onerror = () => {
        database.close();
        reject(transaction.error);
      };
      transaction.onabort = () => {
        database.close();
        reject(transaction.error || new Error("Photo storage transaction aborted."));
      };
    });
  }

  function createPhotoUrl(blob) {
    const url = global.URL.createObjectURL(blob);
    objectUrls.add(url);
    return url;
  }

  async function dataUrlToBlob(dataUrl) {
    const response = await fetch(dataUrl);
    return response.blob();
  }

  async function blobFromImageElement(element) {
    if (element.photoBlob instanceof Blob) {
      return element.photoBlob;
    }

    const response = await fetch(element.src);
    return response.blob();
  }

  async function saveSelectedPhoto(blob) {
    if (!(blob instanceof Blob) || !blob.type.startsWith("image/")) {
      throw new TypeError("A valid image Blob is required.");
    }

    await runTransaction("readwrite", (store) =>
      store.put(blob, SELECTED_PHOTO_KEY)
    );
  }

  async function saveSourcePhoto(blob) {
    if (!(blob instanceof Blob) || !blob.type.startsWith("image/")) {
      throw new TypeError("A valid source image Blob is required.");
    }

    await runTransaction("readwrite", (store) =>
      store.put(blob, SOURCE_PHOTO_KEY)
    );
  }

  async function getSourcePhoto() {
    return runTransaction("readonly", (store) => store.get(SOURCE_PHOTO_KEY));
  }

  async function getSelectedPhoto() {
    return runTransaction("readonly", (store) =>
      store.get(SELECTED_PHOTO_KEY)
    );
  }

  async function clearSelectedPhoto() {
    await runTransaction("readwrite", (store) =>
      store.delete(SELECTED_PHOTO_KEY)
    );
  }

  async function migrateLegacyPhoto(photoValue) {
    if (typeof photoValue !== "string" || !photoValue.startsWith("data:image/")) {
      return null;
    }

    const blob = await dataUrlToBlob(photoValue);
    await saveSourcePhoto(blob);
    await saveSelectedPhoto(blob);
    return blob;
  }

  global.addEventListener("unload", () => {
    objectUrls.forEach((url) => global.URL.revokeObjectURL(url));
    objectUrls.clear();
  });

  global.PhotoStorage = {
    STORAGE_MARKER,
    blobFromImageElement,
    clearSelectedPhoto,
    createPhotoUrl,
    dataUrlToBlob,
    getSourcePhoto,
    getSelectedPhoto,
    migrateLegacyPhoto,
    saveSourcePhoto,
    saveSelectedPhoto,
  };
})(window);
