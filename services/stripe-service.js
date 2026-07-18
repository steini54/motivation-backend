const crypto = require("node:crypto");
const Stripe = require("stripe");
const {
  getPaymentConfig,
  validatePaymentConfig,
} = require("../config/payment");
const {
  DOCUMENT_TYPES,
  createPaymentError,
  normalizeAccessId,
  normalizeBuyerName,
  normalizeDocumentHash,
  normalizeDocumentType,
  normalizeEmail,
  normalizeStyleName,
} = require("./document-purchase");

function createStripeClient(config) {
  return new Stripe(config.secretKey, {
    apiVersion: config.stripeApiVersion,
    maxNetworkRetries: 2,
    timeout: 20000,
  });
}

function buildLineItem(config) {
  if (config.freeCheckout) {
    return {
      price_data: {
        currency: config.currency,
        unit_amount: 0,
        product_data: {
          name: config.productName,
        },
      },
      quantity: 1,
    };
  }

  if (config.priceId) {
    return {
      price: config.priceId,
      quantity: 1,
    };
  }

  return {
    price_data: {
      currency: config.currency,
      unit_amount: config.priceCents,
      product_data: {
        name: config.productName,
      },
    },
    quantity: 1,
  };
}

function getFallbackPreviewUrl(config, documentType) {
  const documentConfig = DOCUMENT_TYPES[documentType];
  return `${config.baseUrl}/${documentConfig.previewPath}`;
}

function normalizeReturnUrl(value, fallbackUrl) {
  const rawUrl = String(value || "").trim();
  const url = new URL(rawUrl || fallbackUrl);
  const hostname = url.hostname.toLowerCase();
  const isLocalhost = hostname === "localhost" || hostname === "127.0.0.1";
  const isProductionHost = hostname === "syntext.ch" || hostname === "www.syntext.ch";

  if (!isLocalhost && !isProductionHost) {
    throw createPaymentError(400, "INVALID_RETURN_URL", "Invalid payment return URL.");
  }

  if (isProductionHost && url.protocol !== "https:") {
    throw createPaymentError(400, "INVALID_RETURN_URL", "Production payment return URL must use HTTPS.");
  }

  if (isLocalhost && !["http:", "https:"].includes(url.protocol)) {
    throw createPaymentError(400, "INVALID_RETURN_URL", "Invalid local payment return URL.");
  }

  url.searchParams.delete("checkout");
  url.searchParams.delete("session_id");
  url.hash = "";

  return url.toString();
}

function buildReturnUrl(returnUrl, kind) {
  const url = new URL(returnUrl);

  if (kind === "success") {
    url.searchParams.set("checkout", "success");
    url.searchParams.set("session_id", "{CHECKOUT_SESSION_ID}");
  } else {
    url.searchParams.set("checkout", "cancel");
  }

  return url.toString().replace("%7BCHECKOUT_SESSION_ID%7D", "{CHECKOUT_SESSION_ID}");
}

function sanitizeSessionId(value) {
  const sessionId = String(value || "").trim();
  if (!/^cs_(test|live)_[A-Za-z0-9_]+$/.test(sessionId)) {
    throw createPaymentError(400, "INVALID_SESSION_ID", "Invalid checkout session.");
  }
  return sessionId;
}

function createCheckoutAttemptId(value) {
  const attemptId = String(value || "").trim();
  if (/^[A-Za-z0-9_-]{8,64}$/.test(attemptId)) {
    return attemptId;
  }

  return `${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 12)}`;
}

function createPaymentService({ stripeClient, config, logger = console }) {
  function shouldApplyDeveloperDiscount(token) {
    const provided = String(token || "").trim();
    const expected = String(config.devDiscountToken || "").trim();

    if (!config.checkoutCouponId || !provided || !expected) {
      return false;
    }

    const providedBuffer = Buffer.from(provided);
    const expectedBuffer = Buffer.from(expected);

    return (
      providedBuffer.length === expectedBuffer.length &&
      crypto.timingSafeEqual(providedBuffer, expectedBuffer)
    );
  }

  function isAllowedAmountTotal(session) {
    const amountTotal = session.amount_total;
    if (!Number.isInteger(amountTotal)) {
      return true;
    }

    if (amountTotal === config.priceCents) {
      return true;
    }

    if (amountTotal !== 0) {
      return false;
    }

    const metadata = session.metadata || {};
    return (
      (Boolean(config.checkoutCouponId) &&
        metadata.discount_mode === "developer_100_percent") ||
      (Boolean(config.freeCheckout) && metadata.discount_mode === "free_checkout")
    );
  }

  async function createCheckoutSession(input = {}) {
    const documentType = normalizeDocumentType(input.documentType);
    const styleName = normalizeStyleName(input.styleName);
    const documentHash = normalizeDocumentHash(input.documentHash);
    const customerEmail = normalizeEmail(input.customerEmail);
    const buyerName = normalizeBuyerName(input.buyerName);
    const checkoutAttemptId = createCheckoutAttemptId(input.checkoutAttemptId);
    const accessId = input.accessId ? normalizeAccessId(input.accessId) : "";
    const developerDiscount = shouldApplyDeveloperDiscount(input.developerDiscountToken);
    const returnUrl = normalizeReturnUrl(
      input.returnUrl,
      getFallbackPreviewUrl(config, documentType)
    );

    const metadata = {
      product: "vitagen_pdf",
      document_type: documentType,
      style_name: styleName,
      document_hash: documentHash,
    };

    if (accessId) {
      metadata.access_id = accessId;
    }

    if (buyerName) {
      metadata.buyer_name = buyerName;
    }

    if (developerDiscount) {
      metadata.discount_mode = "developer_100_percent";
    } else if (config.freeCheckout) {
      metadata.discount_mode = "free_checkout";
    }

    const params = {
      mode: "payment",
      line_items: [buildLineItem(config)],
      success_url: buildReturnUrl(returnUrl, "success"),
      cancel_url: buildReturnUrl(returnUrl, "cancel"),
      client_reference_id: `vitagen_${documentType}_${documentHash.slice(0, 24)}`,
      metadata,
      payment_intent_data: {
        metadata,
      },
    };

    if (customerEmail) {
      params.customer_email = customerEmail;
    }

    if (config.invoiceCreation) {
      params.invoice_creation = { enabled: true };
    }

    if (
      Array.isArray(config.checkoutPaymentMethodTypes) &&
      config.checkoutPaymentMethodTypes.length > 0 &&
      !developerDiscount &&
      !config.freeCheckout
    ) {
      params.payment_method_types = config.checkoutPaymentMethodTypes;
    }

    if (developerDiscount) {
      params.discounts = [{ coupon: config.checkoutCouponId }];
    }

    const idempotencyKey = [
      "vitagen-checkout",
      checkoutAttemptId,
      documentType,
      documentHash.slice(0, 24),
      developerDiscount ? "developer-discount" : "standard",
      config.freeCheckout ? "free-checkout" : "paid-checkout",
    ].join(":");

    const session = await stripeClient.checkout.sessions.create(params, {
      idempotencyKey,
    });

    return {
      id: session.id,
      url: session.url,
    };
  }

  async function retrieveCheckoutSession(sessionId) {
    return stripeClient.checkout.sessions.retrieve(sanitizeSessionId(sessionId));
  }

  async function verifyPaidSession(input = {}) {
    const session = await retrieveCheckoutSession(input.sessionId);
    const documentType = normalizeDocumentType(input.documentType);
    const styleName = normalizeStyleName(input.styleName);
    const documentHash = normalizeDocumentHash(input.documentHash);

    if (session.payment_status !== "paid") {
      throw createPaymentError(
        402,
        "PAYMENT_NOT_PAID",
        "Payment has not been completed yet."
      );
    }

    if (session.currency && session.currency.toLowerCase() !== config.currency) {
      throw createPaymentError(403, "PAYMENT_CURRENCY_MISMATCH", "Payment currency mismatch.");
    }

    if (
      Number.isInteger(session.amount_total) &&
      !isAllowedAmountTotal(session)
    ) {
      throw createPaymentError(403, "PAYMENT_AMOUNT_MISMATCH", "Payment amount mismatch.");
    }

    const metadata = session.metadata || {};
    if (
      metadata.document_type !== documentType ||
      metadata.style_name !== styleName ||
      metadata.document_hash !== documentHash
    ) {
      throw createPaymentError(403, "PAYMENT_DOCUMENT_MISMATCH", "Payment does not match this document.");
    }

    return {
      id: session.id,
      paymentStatus: session.payment_status,
      documentType,
      styleName,
      documentHash,
      filename: DOCUMENT_TYPES[documentType].filename,
    };
  }

  async function verifyPremiumAccess(input = {}) {
    const session = await retrieveCheckoutSession(input.sessionId);
    const documentType = normalizeDocumentType(input.documentType);
    const accessId = normalizeAccessId(input.accessId);

    if (session.payment_status !== "paid") {
      throw createPaymentError(
        402,
        "PAYMENT_NOT_PAID",
        "Payment has not been completed yet."
      );
    }

    if (session.currency && session.currency.toLowerCase() !== config.currency) {
      throw createPaymentError(403, "PAYMENT_CURRENCY_MISMATCH", "Payment currency mismatch.");
    }

    if (Number.isInteger(session.amount_total) && !isAllowedAmountTotal(session)) {
      throw createPaymentError(403, "PAYMENT_AMOUNT_MISMATCH", "Payment amount mismatch.");
    }

    const metadata = session.metadata || {};
    if (
      metadata.document_type !== documentType ||
      metadata.access_id !== accessId
    ) {
      throw createPaymentError(
        403,
        "PAYMENT_ACCESS_MISMATCH",
        "Payment does not match this document access."
      );
    }

    return {
      id: session.id,
      paymentStatus: session.payment_status,
      documentType,
      accessId,
    };
  }

  function constructWebhookEvent(rawBody, signature) {
    if (!config.webhookSecret) {
      throw createPaymentError(503, "WEBHOOK_NOT_CONFIGURED", "Stripe webhook is not configured.");
    }

    if (!signature) {
      throw createPaymentError(400, "MISSING_STRIPE_SIGNATURE", "Missing Stripe signature.");
    }

    return stripeClient.webhooks.constructEvent(
      rawBody,
      signature,
      config.webhookSecret
    );
  }

  async function handleWebhookEvent(event) {
    if (
      event.type === "checkout.session.completed" ||
      event.type === "checkout.session.async_payment_succeeded"
    ) {
      const session = event.data?.object || {};
      logger.log("Stripe checkout event received", {
        type: event.type,
        sessionId: session.id,
        paymentStatus: session.payment_status,
      });
    }

    if (event.type === "checkout.session.async_payment_failed") {
      const session = event.data?.object || {};
      logger.warn("Stripe async payment failed", {
        sessionId: session.id,
      });
    }

    return { received: true };
  }

  return {
    createCheckoutSession,
    retrieveCheckoutSession,
    verifyPaidSession,
    verifyPremiumAccess,
    constructWebhookEvent,
    handleWebhookEvent,
  };
}

function createPaymentServiceFromEnv(env = process.env, logger = console) {
  const config = getPaymentConfig(env);
  const errors = validatePaymentConfig(config);

  if (errors.length > 0) {
    logger.warn("Stripe payments are not ready:", errors.join("; "));
    return null;
  }

  return createPaymentService({
    stripeClient: createStripeClient(config),
    config,
    logger,
  });
}

module.exports = {
  buildReturnUrl,
  createPaymentService,
  createPaymentServiceFromEnv,
  createStripeClient,
  normalizeReturnUrl,
  sanitizeSessionId,
};
