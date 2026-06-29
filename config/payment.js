const DEFAULT_PRICE_CENTS = 999;
const DEFAULT_CURRENCY = "chf";
const DEFAULT_PRODUCT_NAME = "VitaGen PDF Download";
const DEFAULT_BASE_URL = "https://syntext.ch/bewerbungs-generator";
const STRIPE_API_VERSION = "2026-05-27.dahlia";

function normalizeBaseUrl(value) {
  const baseUrl = (value || DEFAULT_BASE_URL).trim().replace(/\/+$/, "");
  return baseUrl || DEFAULT_BASE_URL;
}

function parsePositiveInt(value, fallback) {
  const parsed = Number.parseInt(value || "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function parseBoolean(value, fallback = false) {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  return ["1", "true", "yes", "on"].includes(String(value).toLowerCase());
}

function parsePaymentMethodTypes(value) {
  return String(value || "")
    .split(",")
    .map((method) => method.trim().toLowerCase())
    .filter(Boolean);
}

function getPaymentConfig(env = process.env) {
  return {
    secretKey: env.STRIPE_SECRET_KEY || "",
    webhookSecret: env.STRIPE_WEBHOOK_SECRET || "",
    priceId: env.STRIPE_PRICE_ID || "",
    currency: (env.VITAGEN_CURRENCY || DEFAULT_CURRENCY).toLowerCase(),
    priceCents: parsePositiveInt(env.VITAGEN_PRICE_CENTS, DEFAULT_PRICE_CENTS),
    productName: env.VITAGEN_PRODUCT_NAME || DEFAULT_PRODUCT_NAME,
    baseUrl: normalizeBaseUrl(env.VITAGEN_BASE_URL),
    invoiceCreation: parseBoolean(env.STRIPE_INVOICE_CREATION, true),
    stripeApiVersion: env.STRIPE_API_VERSION || STRIPE_API_VERSION,
    checkoutCouponId: (env.STRIPE_CHECKOUT_COUPON_ID || "").trim(),
    devDiscountToken: (env.VITAGEN_DEV_DISCOUNT_TOKEN || "").trim(),
    freeCheckout: parseBoolean(env.VITAGEN_FREE_CHECKOUT, false),
    checkoutPaymentMethodTypes: parsePaymentMethodTypes(
      env.STRIPE_CHECKOUT_PAYMENT_METHOD_TYPES
    ),
  };
}

function validatePaymentConfig(config, { requireWebhook = false } = {}) {
  const errors = [];

  if (!config.secretKey) {
    errors.push("STRIPE_SECRET_KEY is missing");
  }

  if (
    config.secretKey &&
    !config.secretKey.startsWith("sk_") &&
    !config.secretKey.startsWith("rk_")
  ) {
    errors.push("STRIPE_SECRET_KEY must be a Stripe secret or restricted key");
  }

  if (requireWebhook && !config.webhookSecret) {
    errors.push("STRIPE_WEBHOOK_SECRET is missing");
  }

  if (config.webhookSecret && !config.webhookSecret.startsWith("whsec_")) {
    errors.push("STRIPE_WEBHOOK_SECRET must start with whsec_");
  }

  if (!/^[a-z]{3}$/.test(config.currency)) {
    errors.push("VITAGEN_CURRENCY must be a three-letter currency code");
  }

  if (!Number.isInteger(config.priceCents) || config.priceCents <= 0) {
    errors.push("VITAGEN_PRICE_CENTS must be a positive integer");
  }

  if (config.checkoutCouponId && /\s/.test(config.checkoutCouponId)) {
    errors.push("STRIPE_CHECKOUT_COUPON_ID must not contain whitespace");
  }

  if (config.checkoutPaymentMethodTypes.some((method) => /\s/.test(method))) {
    errors.push("STRIPE_CHECKOUT_PAYMENT_METHOD_TYPES must be a comma-separated list without whitespace inside method names");
  }

  if (
    config.checkoutPaymentMethodTypes.includes("twint") &&
    config.currency !== "chf"
  ) {
    errors.push("STRIPE_CHECKOUT_PAYMENT_METHOD_TYPES can include twint only when VITAGEN_CURRENCY is chf");
  }

  if (config.devDiscountToken && /\s/.test(config.devDiscountToken)) {
    errors.push("VITAGEN_DEV_DISCOUNT_TOKEN must not contain whitespace");
  }

  if (config.checkoutCouponId && !config.devDiscountToken) {
    errors.push("VITAGEN_DEV_DISCOUNT_TOKEN is required when STRIPE_CHECKOUT_COUPON_ID is set");
  }

  try {
    const url = new URL(config.baseUrl);
    if (!["https:", "http:"].includes(url.protocol)) {
      errors.push("VITAGEN_BASE_URL must be http or https");
    }
  } catch {
    errors.push("VITAGEN_BASE_URL must be a valid URL");
  }

  return errors;
}

module.exports = {
  DEFAULT_BASE_URL,
  DEFAULT_CURRENCY,
  DEFAULT_PRICE_CENTS,
  DEFAULT_PRODUCT_NAME,
  STRIPE_API_VERSION,
  getPaymentConfig,
  validatePaymentConfig,
};
