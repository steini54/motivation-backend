const test = require("node:test");
const assert = require("node:assert/strict");

const {
  DEFAULT_GEMINI_IMAGE_MODEL,
  DEFAULT_GEMINI_TEXT_MODEL,
  getGeminiConfig,
  validateGeminiConfig,
} = require("../config/gemini");
const { getPaymentConfig, validatePaymentConfig } = require("../config/payment");

test("getGeminiConfig uses the required stable Gemini models", () => {
  const config = getGeminiConfig({ GEMINI_API_KEY: "test-key" });

  assert.equal(config.textModel, DEFAULT_GEMINI_TEXT_MODEL);
  assert.equal(config.imageModel, DEFAULT_GEMINI_IMAGE_MODEL);
  assert.equal(config.imageSize, "1K");
  assert.equal(config.apiKeySource, "GEMINI_API_KEY");
  assert.equal(config.timeoutMs, 120000);
  assert.equal(config.retryAttempts, 3);
  assert.equal(config.retryBaseDelayMs, 1500);
  assert.equal(config.imageIdentityMinConfidence, 0.85);
  assert.deepEqual(validateGeminiConfig(config), []);
});

test("validateGeminiConfig rejects missing keys and unexpected models", () => {
  const config = getGeminiConfig({
    GEMINI_TEXT_MODEL: "unexpected-text-model",
    GEMINI_IMAGE_MODEL: "unexpected-image-model",
    GEMINI_IMAGE_SIZE: "8K",
  });

  assert.deepEqual(validateGeminiConfig(config), [
    "GEMINI_API_KEY is missing",
    `GEMINI_TEXT_MODEL must be ${DEFAULT_GEMINI_TEXT_MODEL}`,
    `GEMINI_IMAGE_MODEL must be ${DEFAULT_GEMINI_IMAGE_MODEL}`,
    "GEMINI_IMAGE_SIZE must be one of: 512, 1K, 2K, 4K",
  ]);
});

test("payment config defaults to VitaGen one-time CHF checkout", () => {
  const config = getPaymentConfig({
    STRIPE_SECRET_KEY: "sk_test_123",
    STRIPE_WEBHOOK_SECRET: "whsec_123",
  });

  assert.equal(config.currency, "chf");
  assert.equal(config.priceCents, 999);
  assert.equal(config.productName, "VitaGen PDF Download");
  assert.equal(config.invoiceCreation, true);
  assert.equal(config.checkoutCouponId, "");
  assert.equal(config.devDiscountToken, "");
  assert.equal(config.freeCheckout, false);
  assert.deepEqual(config.checkoutPaymentMethodTypes, ["card", "twint"]);
  assert.deepEqual(validatePaymentConfig(config, { requireWebhook: true }), []);
});

test("payment config supports explicit Stripe Checkout payment methods", () => {
  const config = getPaymentConfig({
    STRIPE_SECRET_KEY: "sk_test_123",
    VITAGEN_CURRENCY: "chf",
    STRIPE_CHECKOUT_PAYMENT_METHOD_TYPES: "card,twint",
  });

  assert.deepEqual(config.checkoutPaymentMethodTypes, ["card", "twint"]);
  assert.deepEqual(validatePaymentConfig(config), []);
});

test("payment config rejects TWINT for non-CHF checkout", () => {
  const config = getPaymentConfig({
    STRIPE_SECRET_KEY: "sk_test_123",
    VITAGEN_CURRENCY: "eur",
    STRIPE_CHECKOUT_PAYMENT_METHOD_TYPES: "card,twint",
  });

  assert.deepEqual(validatePaymentConfig(config), [
    "STRIPE_CHECKOUT_PAYMENT_METHOD_TYPES can include twint only when VITAGEN_CURRENCY is chf",
  ]);
});

test("payment config supports an optional server-side checkout coupon", () => {
  const config = getPaymentConfig({
    STRIPE_SECRET_KEY: "rk_live_123",
    STRIPE_CHECKOUT_COUPON_ID: "coupon_free_test",
    VITAGEN_DEV_DISCOUNT_TOKEN: "dev_token_123456",
    VITAGEN_FREE_CHECKOUT: "true",
  });

  assert.equal(config.checkoutCouponId, "coupon_free_test");
  assert.equal(config.devDiscountToken, "dev_token_123456");
  assert.equal(config.freeCheckout, true);
  assert.deepEqual(validatePaymentConfig(config), []);
});

test("payment config rejects missing or unsafe Stripe settings", () => {
  const config = getPaymentConfig({
    STRIPE_SECRET_KEY: "plain-text-key",
    STRIPE_WEBHOOK_SECRET: "wrong",
    VITAGEN_CURRENCY: "swiss-franc",
    VITAGEN_PRICE_CENTS: "-1",
    VITAGEN_BASE_URL: "not-a-url",
    STRIPE_CHECKOUT_COUPON_ID: "coupon with space",
    VITAGEN_DEV_DISCOUNT_TOKEN: "token with space",
  });

  assert.deepEqual(validatePaymentConfig(config, { requireWebhook: true }), [
    "STRIPE_SECRET_KEY must be a Stripe secret or restricted key",
    "STRIPE_WEBHOOK_SECRET must start with whsec_",
    "VITAGEN_CURRENCY must be a three-letter currency code",
    "STRIPE_CHECKOUT_COUPON_ID must not contain whitespace",
    "STRIPE_CHECKOUT_PAYMENT_METHOD_TYPES can include twint only when VITAGEN_CURRENCY is chf",
    "VITAGEN_DEV_DISCOUNT_TOKEN must not contain whitespace",
    "VITAGEN_BASE_URL must be a valid URL",
  ]);
});

test("payment config requires a developer token when checkout coupon is configured", () => {
  const config = getPaymentConfig({
    STRIPE_SECRET_KEY: "rk_live_123",
    STRIPE_CHECKOUT_COUPON_ID: "coupon_free_test",
  });

  assert.deepEqual(validatePaymentConfig(config), [
    "VITAGEN_DEV_DISCOUNT_TOKEN is required when STRIPE_CHECKOUT_COUPON_ID is set",
  ]);
});
