const sharp = require("sharp");

const MAX_INPUT_PIXELS = 40_000_000;
const MIN_INPUT_EDGE = 256;
const MIN_OUTPUT_EDGE = 512;
const MAX_PROCESSING_EDGE = 2048;

const SUPPORTED_ASPECT_RATIOS = [
  { label: "1:1", value: 1 },
  { label: "2:3", value: 2 / 3 },
  { label: "3:2", value: 3 / 2 },
  { label: "3:4", value: 3 / 4 },
  { label: "4:3", value: 4 / 3 },
  { label: "4:5", value: 4 / 5 },
  { label: "5:4", value: 5 / 4 },
  { label: "9:16", value: 9 / 16 },
  { label: "16:9", value: 16 / 9 },
  { label: "21:9", value: 21 / 9 },
];

function createImageError(message, code = "INVALID_SOURCE_IMAGE") {
  const error = new Error(message);
  error.code = code;
  return error;
}

function selectClosestAspectRatio(width, height) {
  const ratio = width / height;

  return SUPPORTED_ASPECT_RATIOS.reduce((closest, candidate) => {
    const currentDistance = Math.abs(Math.log(ratio / candidate.value));
    const closestDistance = Math.abs(Math.log(ratio / closest.value));
    return currentDistance < closestDistance ? candidate : closest;
  }).label;
}

function validateDimensions(metadata) {
  const width = Number(metadata.width);
  const height = Number(metadata.height);

  if (!width || !height) {
    throw createImageError("The uploaded image dimensions could not be read.");
  }

  if (width < MIN_INPUT_EDGE || height < MIN_INPUT_EDGE) {
    throw createImageError(
      `The uploaded image must be at least ${MIN_INPUT_EDGE}px on each side.`
    );
  }

  if (width * height > MAX_INPUT_PIXELS) {
    throw createImageError("The uploaded image resolution is too large.");
  }
}

async function prepareSourceImage(buffer) {
  try {
    const source = sharp(buffer, {
      failOn: "warning",
      limitInputPixels: MAX_INPUT_PIXELS,
    });
    const metadata = await source.metadata();
    validateDimensions(metadata);

    const prepared = await source
      .rotate()
      .flatten({ background: "#ffffff" })
      .resize({
        width: MAX_PROCESSING_EDGE,
        height: MAX_PROCESSING_EDGE,
        fit: "inside",
        withoutEnlargement: true,
      })
      .jpeg({
        quality: 92,
        chromaSubsampling: "4:4:4",
        mozjpeg: true,
      })
      .toBuffer({ resolveWithObject: true });

    return {
      buffer: prepared.data,
      mimeType: "image/jpeg",
      width: prepared.info.width,
      height: prepared.info.height,
      aspectRatio: selectClosestAspectRatio(
        prepared.info.width,
        prepared.info.height
      ),
    };
  } catch (error) {
    if (error.code === "INVALID_SOURCE_IMAGE") {
      throw error;
    }

    throw createImageError("The uploaded file is not a valid supported image.");
  }
}

async function validateGeneratedImage(base64Data) {
  let buffer;

  try {
    buffer = Buffer.from(base64Data, "base64");
    if (buffer.length === 0) {
      throw new Error("Empty image");
    }

    const metadata = await sharp(buffer, {
      failOn: "warning",
      limitInputPixels: MAX_INPUT_PIXELS,
    }).metadata();

    if (
      !metadata.width ||
      !metadata.height ||
      metadata.width < MIN_OUTPUT_EDGE ||
      metadata.height < MIN_OUTPUT_EDGE
    ) {
      throw new Error("Generated image is too small");
    }

    if (!["jpeg", "png", "webp"].includes(metadata.format)) {
      throw new Error("Generated image format is unsupported");
    }

    return {
      buffer,
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
    };
  } catch {
    throw createImageError(
      "Gemini returned an invalid image.",
      "INVALID_GENERATED_IMAGE"
    );
  }
}

module.exports = {
  MAX_INPUT_PIXELS,
  MIN_INPUT_EDGE,
  MIN_OUTPUT_EDGE,
  SUPPORTED_ASPECT_RATIOS,
  selectClosestAspectRatio,
  prepareSourceImage,
  validateGeneratedImage,
};
