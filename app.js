const path = require("path");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const multer = require("multer");
const { rateLimit } = require("express-rate-limit");
const { getAiErrorCode } = require("./services/ai-retry");
const { createDocumentHash } = require("./services/document-purchase");
const { createCleanPdfBuffer } = require("./services/pdf-service");

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

function normalizeTextLength(value) {
  return ["short", "standard", "long"].includes(value) ? value : "standard";
}

function classifyAiError(error) {
  const status = Number(error?.status);

  if (error?.code === "INVALID_SOURCE_IMAGE") {
    return {
      status: 400,
      body: {
        error:
          error.message || "The uploaded image could not be processed safely.",
      },
    };
  }

  if (error?.code === "IMAGE_IDENTITY_MISMATCH") {
    return {
      status: 422,
      body: {
        error:
          "The generated result changed the person too much and was rejected. Please try a clear, front-facing source photo.",
      },
    };
  }

  if (
    error?.code === "IMAGE_QUALITY_CHECK_FAILED" ||
    error?.code === "INVALID_GENERATED_IMAGE"
  ) {
    return {
      status: 502,
      body: {
        error:
          "The generated image could not be verified safely. Please try again.",
      },
    };
  }

  if (error?.code === "IMAGE_GENERATION_REJECTED") {
    return {
      status: 422,
      body: {
        error:
          "The AI model could not safely generate an edited result from this photo. Please try another clear photo.",
      },
    };
  }

  if (status === 429) {
    return {
      status: 429,
      body: { error: "AI request limit reached. Please try again shortly." },
    };
  }

  if (status === 401 || status === 403) {
    return {
      status: 503,
      body: {
        error:
          "The AI service authentication is not configured correctly. Please contact the administrator.",
      },
    };
  }

  if (status === 503) {
    return {
      status: 503,
      body: {
        error:
          "The AI model is temporarily busy. Please wait a moment and try again.",
      },
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
    getAiErrorCode(error) === "ETIMEDOUT" ||
    getAiErrorCode(error)?.startsWith("UND_ERR_")
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

function logAiError(logger, route, provider, error) {
  logger.error("AI request failed", {
    route,
    provider,
    status: Number(error?.status) || null,
    code: getAiErrorCode(error),
    name: error?.name || "Error",
  });
}

function classifyPaymentError(error) {
  const status = Number(error?.status);
  const safeStatus = [400, 402, 403, 404, 409, 422, 429, 503].includes(status)
    ? status
    : 500;

  if (safeStatus === 500) {
    return {
      status: 500,
      body: { error: "Payment service could not complete the request." },
    };
  }

  return {
    status: safeStatus,
    body: {
      error: error?.message || "Payment request could not be completed.",
    },
  };
}

function createApp({
  aiService = null,
  aiProvider = "gemini",
  geminiService = null,
  paymentService = null,
  env = process.env,
  logger = console,
} = {}) {
  const service = aiService || geminiService;
  const payment = paymentService;
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

  app.post(
    "/stripe/webhook",
    express.raw({ type: "application/json", limit: "1mb" }),
    async (req, res) => {
      if (!payment) {
        res.status(503).json({ error: "Payment service is not configured." });
        return;
      }

      try {
        const event = payment.constructWebhookEvent(
          req.body,
          req.headers["stripe-signature"]
        );
        const result = await payment.handleWebhookEvent(event);
        res.json(result);
      } catch (error) {
        const mapped = classifyPaymentError(error);
        res.status(mapped.status).json(mapped.body);
      }
    }
  );

  app.use(express.json({ limit: env.JSON_BODY_LIMIT || "8mb" }));

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
  const configuredPaymentRateLimit = Number.parseInt(
    env.PAYMENT_RATE_LIMIT || "60",
    10
  );
  const paymentLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit:
      Number.isFinite(configuredPaymentRateLimit) &&
      configuredPaymentRateLimit > 0
        ? configuredPaymentRateLimit
        : 60,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { error: "Too many payment requests. Please try again later." },
  });

  app.get("/health", (req, res) => {
    res.json({ status: "ok", service: "motivation-backend" });
  });

  app.get("/ready", (req, res) => {
    const ready = Boolean(service);
    res.status(ready ? 200 : 503).json({
      status: ready ? "ready" : "not_ready",
      aiConfigured: ready,
      provider: aiProvider,
      geminiConfigured: ready && aiProvider === "gemini",
      paymentsConfigured: Boolean(payment),
    });
  });

  app.post("/checkout/create-session", paymentLimiter, async (req, res) => {
    if (!payment) {
      res.status(503).json({ error: "Payment service is not configured." });
      return;
    }

    try {
      const session = await payment.createCheckoutSession(req.body);
      res.json(session);
    } catch (error) {
      const mapped = classifyPaymentError(error);
      res.status(mapped.status).json(mapped.body);
    }
  });

  app.post("/checkout/verify-session", paymentLimiter, async (req, res) => {
    if (!payment) {
      res.status(503).json({ error: "Payment service is not configured." });
      return;
    }

    try {
      const verification = await payment.verifyPaidSession(req.body);
      res.json({
        id: verification.id,
        paymentStatus: verification.paymentStatus,
        documentType: verification.documentType,
        styleName: verification.styleName,
        documentHash: verification.documentHash,
      });
    } catch (error) {
      const mapped = classifyPaymentError(error);
      res.status(mapped.status).json(mapped.body);
    }
  });

  app.get("/checkout/session/:sessionId", paymentLimiter, async (req, res) => {
    if (!payment) {
      res.status(503).json({ error: "Payment service is not configured." });
      return;
    }

    try {
      const session = await payment.retrieveCheckoutSession(
        req.params.sessionId
      );
      res.json({
        id: session.id,
        paymentStatus: session.payment_status,
        status: session.status,
      });
    } catch (error) {
      const mapped = classifyPaymentError(error);
      res.status(mapped.status).json(mapped.body);
    }
  });

  app.post("/generate-pdf", paymentLimiter, async (req, res) => {
    if (!payment) {
      res.status(503).json({ error: "Payment service is not configured." });
      return;
    }

    try {
      const { sessionId, documentType, styleName, documentData } = req.body || {};
      const documentHash = createDocumentHash({
        documentType,
        styleName,
        documentData,
      });

      if (req.body?.documentHash && req.body.documentHash !== documentHash) {
        res.status(400).json({ error: "Document hash does not match." });
        return;
      }

      const verification = await payment.verifyPaidSession({
        sessionId,
        documentType,
        styleName,
        documentHash,
      });
      const pdfBuffer = await createCleanPdfBuffer({
        documentType: verification.documentType,
        documentData,
      });

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${verification.filename}"`
      );
      res.setHeader("Cache-Control", "no-store");
      res.send(pdfBuffer);
    } catch (error) {
      const mapped = classifyPaymentError(error);
      res.status(mapped.status).json(mapped.body);
    }
  });

  app.post(
    "/generate-ai-photo",
    aiLimiter,
    upload.single("photo"),
    async (req, res) => {
      if (!service) {
        res.status(503).json({ error: "AI service is not configured." });
        return;
      }

      if (!req.file) {
        res.status(400).json({ error: "No image received" });
        return;
      }

      try {
        const result = await service.editApplicationPhoto({
          buffer: req.file.buffer,
          mimeType: req.file.mimetype,
        });

        res.json({
          aiFoto: result.dataUrl,
          quality: result.quality,
          image: result.image,
          message: "Application photo generated successfully.",
        });
      } catch (error) {
        logAiError(logger, "/generate-ai-photo", aiProvider, error);
        const mapped = classifyAiError(error);
        res.status(mapped.status).json(mapped.body);
      }
    }
  );

  app.post("/generate-text", aiLimiter, async (req, res) => {
    if (!service) {
      res.status(503).json({ error: "AI service is not configured." });
      return;
    }

    const stichpunkte = normalizeTextField(req.body?.stichpunkte, 4000);
    const funktion = normalizeTextField(req.body?.funktion, 300);
    const textLength = normalizeTextLength(req.body?.textLength);

    if (!stichpunkte || !funktion) {
      res.status(400).json({ error: "Missing data for text generation" });
      return;
    }

    try {
      const text = await service.generateApplicationText({
        stichpunkte,
        funktion,
        textLength,
        name: normalizeTextField(req.body?.name, 200),
        adresse: normalizeTextField(req.body?.adresse, 600),
        posten: normalizeTextField(req.body?.posten, 300),
        arbeitgeber: normalizeTextField(req.body?.arbeitgeber, 1000),
        greeting: normalizeTextField(req.body?.greeting, 600),
        closing: normalizeTextField(req.body?.closing, 800),
      });
      res.json({ text });
    } catch (error) {
      logAiError(logger, "/generate-text", aiProvider, error);
      const mapped = classifyAiError(error);
      res.status(mapped.status).json(mapped.body);
    }
  });

  const frontendPath = path.join(__dirname, "frontend");
  const vitagenPath = path.join(frontendPath, "vitagen");
  const vitagenMotivationPath = path.join(vitagenPath, "motivation");

  app.get(["/bewerbungs-generator", "/bewerbungs-generator/"], (req, res) => {
    res.redirect("/bewerbungs-generator/start.html");
  });
  app.get(
    ["/bewerbungs-generator/motivation", "/bewerbungs-generator/motivation/"],
    (req, res) => {
      res.redirect("/bewerbungs-generator/motivation/formular.html");
    }
  );
  app.get(
    ["/bewerbungs-generator/lebenslauf", "/bewerbungs-generator/lebenslauf/"],
    (req, res) => {
      res.redirect("/bewerbungs-generator/lebenslauf/lebensformular.html");
    }
  );
  app.use(
    "/bewerbungs-generator/motivation",
    express.static(vitagenMotivationPath)
  );
  app.use("/bewerbungs-generator", express.static(vitagenPath));
  app.use(express.static(vitagenMotivationPath));
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
  normalizeTextLength,
  classifyAiError,
};
