const crypto = require("node:crypto");
const sharp = require("sharp");

const TOKEN_VERSION = 1;
const MAX_ENCRYPTED_IMAGE_BYTES = 8 * 1024 * 1024;
const MAX_ASSET_TOKEN_LENGTH = 12 * 1024 * 1024;
const SUPPORTED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function createAssetError(status, code, message) {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  return error;
}

function parseImageDataUrl(value) {
  const match = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=\r\n]+)$/.exec(
    String(value || "")
  );

  if (!match || !SUPPORTED_IMAGE_TYPES.has(match[1])) {
    throw createAssetError(422, "INVALID_AI_PHOTO", "Generated photo data is invalid.");
  }

  const buffer = Buffer.from(match[2], "base64");
  if (!buffer.length || buffer.length > MAX_ENCRYPTED_IMAGE_BYTES) {
    throw createAssetError(422, "INVALID_AI_PHOTO", "Generated photo size is invalid.");
  }

  return { buffer, mimeType: match[1] };
}

function deriveEncryptionKey(secret) {
  const normalized = String(secret || "").trim();
  if (normalized.length < 24) {
    throw createAssetError(
      503,
      "ASSET_PROTECTION_NOT_CONFIGURED",
      "Premium asset protection is not configured."
    );
  }

  return crypto
    .createHash("sha256")
    .update(`vitagen-premium-assets:v1:${normalized}`)
    .digest();
}

function encodeToken(payload) {
  const { encrypted, ...metadata } = payload;
  return `${Buffer.from(JSON.stringify(metadata), "utf8").toString(
    "base64url"
  )}.${encrypted}`;
}

function decodeToken(value) {
  const token = String(value || "").trim();
  if (
    token.length < 40 ||
    token.length > MAX_ASSET_TOKEN_LENGTH ||
    !/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(token)
  ) {
    throw createAssetError(400, "INVALID_ASSET_TOKEN", "Invalid premium asset token.");
  }

  try {
    const [encodedMetadata, encrypted] = token.split(".");
    const payload = JSON.parse(
      Buffer.from(encodedMetadata, "base64url").toString("utf8")
    );
    if (!payload || payload.v !== TOKEN_VERSION) {
      throw new Error("Unsupported token version");
    }
    return { ...payload, encrypted };
  } catch {
    throw createAssetError(400, "INVALID_ASSET_TOKEN", "Invalid premium asset token.");
  }
}

function watermarkSvg(width, height) {
  const fontSize = Math.max(30, Math.round(width / 9));
  return Buffer.from(
    `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <g transform="translate(${width / 2} ${height / 2}) rotate(-28)">
        <rect x="${-width * 0.62}" y="${-fontSize * 0.9}" width="${width * 1.24}" height="${fontSize * 1.8}" fill="rgba(255,255,255,0.56)"/>
        <text x="0" y="${fontSize * 0.34}" text-anchor="middle" font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="700" fill="rgba(31,41,55,0.52)">VITAGEN PREVIEW</text>
      </g>
    </svg>`
  );
}

function createPremiumAssetService({ secret, imageProcessor = sharp } = {}) {
  const encryptionKey = deriveEncryptionKey(secret);

  async function protectImage(dataUrl) {
    const { buffer, mimeType } = parseImageDataUrl(dataUrl);
    const metadata = await imageProcessor(buffer).metadata();
    const resizedPreview = await imageProcessor(buffer)
      .resize({
        width: 560,
        height: 720,
        fit: "inside",
        withoutEnlargement: true,
      })
      .jpeg({ quality: 72, chromaSubsampling: "4:2:0" })
      .toBuffer({ resolveWithObject: true });
    const previewBuffer = await imageProcessor(resizedPreview.data)
      .composite([
        {
          input: watermarkSvg(
            resizedPreview.info.width || metadata.width || 560,
            resizedPreview.info.height || metadata.height || 720
          ),
          gravity: "center",
        },
      ])
      .jpeg({ quality: 72, chromaSubsampling: "4:2:0" })
      .toBuffer();

    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv("aes-256-gcm", encryptionKey, iv);
    cipher.setAAD(Buffer.from(mimeType, "utf8"));
    const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
    const authTag = cipher.getAuthTag();

    return {
      previewDataUrl: `data:image/jpeg;base64,${previewBuffer.toString("base64")}`,
      protectedAsset: encodeToken({
        v: TOKEN_VERSION,
        mimeType,
        iv: iv.toString("base64url"),
        authTag: authTag.toString("base64url"),
        encrypted: encrypted.toString("base64url"),
      }),
    };
  }

  function unlockImage(token) {
    const payload = decodeToken(token);
    if (!SUPPORTED_IMAGE_TYPES.has(payload.mimeType)) {
      throw createAssetError(400, "INVALID_ASSET_TOKEN", "Invalid premium asset token.");
    }

    try {
      const encrypted = Buffer.from(payload.encrypted, "base64url");
      if (!encrypted.length || encrypted.length > MAX_ENCRYPTED_IMAGE_BYTES) {
        throw new Error("Invalid encrypted image size");
      }
      const decipher = crypto.createDecipheriv(
        "aes-256-gcm",
        encryptionKey,
        Buffer.from(payload.iv, "base64url")
      );
      decipher.setAAD(Buffer.from(payload.mimeType, "utf8"));
      decipher.setAuthTag(Buffer.from(payload.authTag, "base64url"));
      const buffer = Buffer.concat([decipher.update(encrypted), decipher.final()]);
      return { buffer, mimeType: payload.mimeType };
    } catch {
      throw createAssetError(400, "INVALID_ASSET_TOKEN", "Invalid premium asset token.");
    }
  }

  return {
    protectImage,
    unlockImage,
  };
}

function createPremiumAssetServiceFromEnv(env = process.env) {
  const secret = env.VITAGEN_ASSET_SECRET || env.STRIPE_SECRET_KEY || "";
  if (!secret) {
    return null;
  }
  return createPremiumAssetService({ secret });
}

module.exports = {
  createPremiumAssetService,
  createPremiumAssetServiceFromEnv,
  parseImageDataUrl,
};
