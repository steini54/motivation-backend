const path = require("path");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const multer = require("multer");
const { rateLimit } = require("express-rate-limit");

const DEFAULT_ALLOWED_ORIGINS = [
  "http://syntext.ch",
  "https://syntext.ch",
  "http://www.syntext.ch",
  "https://www.syntext.ch",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

function parseAllowedOrigins(value) {
  if (!value) {
    return DEFAULT_ALLOWED_ORIGINS;
  }

  return value
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function createCorsOptions(env) {
  const allowedOrigins = new Set(parseAllowedOrigins(env.ALLOWED_ORIGINS));

  return {
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }

      const error = new Error("Origin is not allowed");
      error.code = "CORS_NOT_ALLOWED";
      callback(error);
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
    maxAge: 86400,
  };
}

function createUpload(env) {
  const maxUploadMb = Number.parseInt(env.MAX_UPLOAD_MB || "10", 10);
  const maxFileSize =
    (Number.isFinite(maxUploadMb) && maxUploadMb > 0 ? maxUploadMb : 10) *
    1024 *
    1024;

  return multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: maxFileSize,
      files: 1,
    },
    fileFilter(req, file, callback) {
      if (!ALLOWED_IMAGE_TYPES.has(file.mimetype)) {
        const error = new Error("Unsupported image type");
        error.code = "UNSUPPORTED_IMAGE_TYPE";
        callback(error);
        return;
      }

      callback(null, true);
    },
  });
}

function normalizeTextField(value, maxLength) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().slice(0, maxLength);
}

function classifyAiError(error) {
  const status = Number(error?.status);

  if (status === 429) {
    return {
      status: 429,
      body: { error: "AI request limit reached. Please try again shortly." },
    };
  }

  if (status === 400) {
    return {
      status: 400,
      body: { error: "The AI service rejected the submitted content." },
    };
  }

  if (
    status === 408 ||
    status === 504 ||
    error?.name === "AbortError" ||
    error?.code === "ETIMEDOUT"
  ) {
    return {
      status: 504,
      body: { error: "The AI service timed out. Please try again." },
    };
  }

  return {
    status: 502,
    body: { error: "The AI service could not complete the request." },
  };
}

function logAiError(logger, route, error) {
  logger.error("AI request failed", {
    route,
    provider: "gemini",
    status: Number(error?.status) || null,
    code: error?.code || null,
    name: error?.name || "Error",
  });
}

function createApp({
  geminiService = null,
  env = process.env,
  logger = console,
} = {}) {
  const app = express();
  const upload = createUpload(env);

  app.disable("x-powered-by");
  app.set("trust proxy", 1);
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: { policy: "cross-origin" },
    })
  );
  app.use(cors(createCorsOptions(env)));
  app.use(express.json({ limit: "32kb" }));

  const configuredRateLimit = Number.parseInt(env.AI_RATE_LIMIT || "20", 10);
  const aiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit:
      Number.isFinite(configuredRateLimit) && configuredRateLimit > 0
        ? configuredRateLimit
        : 20,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { error: "Too many AI requests. Please try again later." },
  });

  app.get("/health", (req, res) => {
    res.json({ status: "ok", service: "motivation-backend" });
  });

  app.get("/ready", (req, res) => {
    const ready = Boolean(geminiService);
    res.status(ready ? 200 : 503).json({
      status: ready ? "ready" : "not_ready",
      geminiConfigured: ready,
    });
  });

  app.post(
    "/generate-ai-photo",
    aiLimiter,
    upload.single("photo"),
    async (req, res) => {
      if (!geminiService) {
        res.status(503).json({ error: "AI service is not configured." });
        return;
      }

      if (!req.file) {
        res.status(400).json({ error: "No image received" });
        return;
      }

      try {
        const aiFoto = await geminiService.editApplicationPhoto({
          buffer: req.file.buffer,
          mimeType: req.file.mimetype,
        });

        res.json({
          aiFoto,
          message: "Application photo generated successfully.",
        });
      } catch (error) {
        logAiError(logger, "/generate-ai-photo", error);
        const mapped = classifyAiError(error);
        res.status(mapped.status).json(mapped.body);
      }
    }
  );

  app.post("/generate-text", aiLimiter, async (req, res) => {
    if (!geminiService) {
      res.status(503).json({ error: "AI service is not configured." });
      return;
    }

    const stichpunkte = normalizeTextField(req.body?.stichpunkte, 4000);
    const funktion = normalizeTextField(req.body?.funktion, 300);

    if (!stichpunkte || !funktion) {
      res.status(400).json({ error: "Missing data for text generation" });
      return;
    }

    try {
      const text = await geminiService.generateApplicationText({
        stichpunkte,
        funktion,
      });
      res.json({ text });
    } catch (error) {
      logAiError(logger, "/generate-text", error);
      const mapped = classifyAiError(error);
      res.status(mapped.status).json(mapped.body);
    }
  });

  app.use(express.static(path.join(__dirname, "frontend")));
  app.get("/", (req, res) => {
    res.redirect("/formular.html");
  });

  app.use((error, req, res, next) => {
    if (res.headersSent) {
      next(error);
      return;
    }

    if (error.code === "CORS_NOT_ALLOWED") {
      res.status(403).json({ error: "Origin is not allowed." });
      return;
    }

    if (error instanceof multer.MulterError) {
      const status = error.code === "LIMIT_FILE_SIZE" ? 413 : 400;
      res.status(status).json({ error: "Invalid image upload." });
      return;
    }

    if (error.code === "UNSUPPORTED_IMAGE_TYPE") {
      res.status(415).json({
        error: "Only JPEG, PNG, and WebP images are supported.",
      });
      return;
    }

    logger.error("Unhandled request error", {
      path: req.path,
      code: error.code || null,
      name: error.name || "Error",
    });
    res.status(500).json({ error: "Internal server error." });
  });

  return app;
}

module.exports = {
  DEFAULT_ALLOWED_ORIGINS,
  createApp,
  createCorsOptions,
  normalizeTextField,
  classifyAiError,
};
