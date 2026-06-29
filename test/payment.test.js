const test = require("node:test");
const assert = require("node:assert/strict");

const { createApp } = require("../app");
const { STYLE_NAMES, createDocumentHash } = require("../services/document-purchase");
const {
  buildReturnUrl,
  createPaymentService,
  normalizeReturnUrl,
} = require("../services/stripe-service");

async function withServer(app, callback) {
  const server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  const address = server.address();

  try {
    await callback(`http://127.0.0.1:${address.port}`);
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
}

function createFakePaymentService(overrides = {}) {
  return {
    async createCheckoutSession(input) {
      return {
        id: "cs_test_123",
        url: `https://checkout.stripe.com/c/pay/${input.documentHash}`,
      };
    },
    async retrieveCheckoutSession(sessionId) {
      return {
        id: sessionId,
        payment_status: "paid",
        status: "complete",
      };
    },
    async verifyPaidSession(input) {
      return {
        id: input.sessionId,
        paymentStatus: "paid",
        documentType: input.documentType,
        styleName: input.styleName,
        documentHash: input.documentHash,
        filename:
          input.documentType === "lebenslauf" ? "Lebenslauf.pdf" : "Bewerbung.pdf",
      };
    },
    constructWebhookEvent(rawBody, signature) {
      assert.ok(Buffer.isBuffer(rawBody));
      assert.equal(signature, "signed");
      return JSON.parse(rawBody.toString("utf8"));
    },
    async handleWebhookEvent(event) {
      return { received: event.type === "checkout.session.completed" };
    },
    ...overrides,
  };
}

test("payment style allowlist matches the current VitaGen style set", () => {
  const styleNames = [
    "aqua-arc-amethyst.css",
    "aqua-arc-contrast.css",
    "aqua-arc-default.css",
    "aqua-arc-emerald.css",
    "aqua-arc-soft.css",
    "aqua-arc-sunset.css",
    "charcoal-frame.css",
    "cobalt-ribbon.css",
    "corporate-axis-burgundy.css",
    "corporate-axis-default.css",
    "corporate-axis-forest.css",
    "corporate-axis-monochrome.css",
    "corporate-axis-navy.css",
    "corporate-axis-steel.css",
    "editorial-azure.css",
    "editorial-mono-classic.css",
    "editorial-mono-default.css",
    "editorial-mono-mint.css",
    "editorial-mono-rose.css",
    "editorial-mono-sepia.css",
    "editorial-mono-warm.css",
    "executive-ink.css",
    "graphite-pro.css",
    "midnight-column.css",
    "monograph.css",
    "navy-wave.css",
    "nordic-panel.css",
    "pearl-classic.css",
    "soft-sand.css",
    "swiss-line.css",
    "teal-balance.css",
    "terracotta-arch.css",
  ];

  assert.deepEqual([...STYLE_NAMES].sort(), styleNames.sort());
});

test("all registered styles can pass checkout and paid PDF download", async () => {
  const documentDataByType = {
    motivation: { name: "Max Muster", funktion: "Kaufmann" },
    lebenslauf: {
      name: "Max Muster",
      beruf: [{ position: "Kaufmann", arbeitgeber: "Musterfirma AG" }],
    },
  };

  const verifiedPairs = new Set();
  await withServer(
    createApp({
      env: { ...process.env, PAYMENT_RATE_LIMIT: "500" },
      paymentService: createFakePaymentService({
        async createCheckoutSession(input) {
          return {
            id: `cs_${input.documentType}_${input.styleName.replace(/[^a-z0-9]+/gi, "_")}`,
            url: `https://checkout.stripe.com/c/pay/${input.documentHash}`,
          };
        },
        async verifyPaidSession(input) {
          const expectedHash = createDocumentHash({
            documentType: input.documentType,
            styleName: input.styleName,
            documentData: documentDataByType[input.documentType],
          });
          assert.equal(input.documentHash, expectedHash);
          verifiedPairs.add(`${input.documentType}:${input.styleName}`);
          return {
            id: input.sessionId,
            paymentStatus: "paid",
            documentType: input.documentType,
            styleName: input.styleName,
            documentHash: input.documentHash,
            filename:
              input.documentType === "lebenslauf" ? "Lebenslauf.pdf" : "Bewerbung.pdf",
          };
        },
      }),
    }),
    async (url) => {
      for (const documentType of Object.keys(documentDataByType)) {
        for (const styleName of STYLE_NAMES) {
          const documentData = documentDataByType[documentType];
          const documentHash = createDocumentHash({
            documentType,
            styleName,
            documentData,
          });
          const checkout = await fetch(`${url}/checkout/create-session`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ documentType, styleName, documentHash }),
          });
          assert.equal(checkout.status, 200, `${documentType} ${styleName} checkout failed`);

          const checkoutBody = await checkout.json();
          const pdf = await fetch(`${url}/generate-pdf`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sessionId: checkoutBody.id,
              documentType,
              styleName,
              documentHash,
              documentData,
            }),
          });
          const bytes = Buffer.from(await pdf.arrayBuffer());

          assert.equal(pdf.status, 200, `${documentType} ${styleName} PDF failed`);
          assert.match(pdf.headers.get("content-type"), /^application\/pdf/);
          assert.equal(bytes.subarray(0, 4).toString("utf8"), "%PDF");
        }
      }
    }
  );

  assert.equal(verifiedPairs.size, STYLE_NAMES.size * 2);
});

test("checkout session endpoint returns a Stripe redirect URL", async () => {
  const documentData = { name: "Max Muster", funktion: "Kaufmann" };
  const documentHash = createDocumentHash({
    documentType: "motivation",
    styleName: "swiss-line.css",
    documentData,
  });

  await withServer(
    createApp({
      paymentService: createFakePaymentService(),
      env: {},
      logger: { error() {} },
    }),
    async (url) => {
      const response = await fetch(`${url}/checkout/create-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentType: "motivation",
          styleName: "swiss-line.css",
          documentHash,
          customerEmail: "max@example.com",
        }),
      });
      const body = await response.json();

      assert.equal(response.status, 200);
      assert.equal(body.id, "cs_test_123");
      assert.match(body.url, /^https:\/\/checkout\.stripe\.com/);
    }
  );
});

test("Stripe checkout applies the configured server-side coupon", async () => {
  let receivedParams = null;
  let receivedOptions = null;
  const payment = createPaymentService({
    config: {
      secretKey: "sk_test_123",
      webhookSecret: "whsec_123",
      priceId: "",
      currency: "chf",
      priceCents: 999,
      productName: "VitaGen PDF Download",
      baseUrl: "https://syntext.ch/bewerbungs-generator",
      invoiceCreation: true,
      stripeApiVersion: "2026-05-27.dahlia",
      checkoutCouponId: "coupon_free_test",
      devDiscountToken: "dev_token_123456",
    },
    stripeClient: {
      checkout: {
        sessions: {
          async create(params, options) {
            receivedParams = params;
            receivedOptions = options;
            return {
              id: "cs_test_coupon",
              url: "https://checkout.stripe.com/c/pay/cs_test_coupon",
            };
          },
        },
      },
      webhooks: { constructEvent() {} },
    },
  });

  const session = await payment.createCheckoutSession({
    documentType: "motivation",
    styleName: "swiss-line.css",
    documentHash: "a".repeat(64),
    checkoutAttemptId: "attempt_coupon_001",
    developerDiscountToken: "dev_token_123456",
    returnUrl: "https://syntext.ch/bewerbungs-generator/motivation/formular.html",
  });

  assert.equal(session.id, "cs_test_coupon");
  assert.deepEqual(receivedParams.discounts, [{ coupon: "coupon_free_test" }]);
  assert.equal(receivedParams.metadata.discount_mode, "developer_100_percent");
  assert.equal(
    receivedOptions.idempotencyKey,
    `vitagen-checkout:attempt_coupon_001:motivation:${"a".repeat(24)}:developer-discount:paid-checkout`
  );
});

test("Stripe checkout uses a fresh idempotency key for every checkout attempt", async () => {
  const receivedOptions = [];
  const payment = createPaymentService({
    config: {
      secretKey: "sk_test_123",
      webhookSecret: "whsec_123",
      priceId: "",
      currency: "chf",
      priceCents: 999,
      productName: "VitaGen PDF Download",
      baseUrl: "https://syntext.ch/bewerbungs-generator",
      invoiceCreation: true,
      stripeApiVersion: "2026-05-27.dahlia",
      checkoutCouponId: "",
      devDiscountToken: "",
    },
    stripeClient: {
      checkout: {
        sessions: {
          async create(params, options) {
            receivedOptions.push(options);
            return {
              id: `cs_test_${receivedOptions.length}`,
              url: `https://checkout.stripe.com/c/pay/${receivedOptions.length}`,
            };
          },
        },
      },
      webhooks: { constructEvent() {} },
    },
  });
  const input = {
    documentType: "motivation",
    styleName: "swiss-line.css",
    documentHash: "b".repeat(64),
    returnUrl: "https://syntext.ch/bewerbungs-generator/motivation/formular.html",
  };

  await payment.createCheckoutSession({
    ...input,
    checkoutAttemptId: "attempt_first_001",
  });
  await payment.createCheckoutSession({
    ...input,
    checkoutAttemptId: "attempt_second_002",
  });

  assert.equal(receivedOptions.length, 2);
  assert.notEqual(
    receivedOptions[0].idempotencyKey,
    receivedOptions[1].idempotencyKey
  );
  assert.match(receivedOptions[0].idempotencyKey, /attempt_first_001/);
  assert.match(receivedOptions[1].idempotencyKey, /attempt_second_002/);
});

test("Stripe checkout can request configured payment methods such as TWINT", async () => {
  let receivedParams = null;
  const payment = createPaymentService({
    config: {
      secretKey: "sk_test_123",
      webhookSecret: "whsec_123",
      priceId: "",
      currency: "chf",
      priceCents: 999,
      productName: "VitaGen PDF Download",
      baseUrl: "https://syntext.ch/bewerbungs-generator",
      invoiceCreation: true,
      stripeApiVersion: "2026-05-27.dahlia",
      checkoutCouponId: "",
      devDiscountToken: "",
      checkoutPaymentMethodTypes: ["card", "twint"],
    },
    stripeClient: {
      checkout: {
        sessions: {
          async create(params) {
            receivedParams = params;
            return {
              id: "cs_test_twint",
              url: "https://checkout.stripe.com/c/pay/cs_test_twint",
            };
          },
        },
      },
      webhooks: { constructEvent() {} },
    },
  });

  await payment.createCheckoutSession({
    documentType: "motivation",
    styleName: "swiss-line.css",
    documentHash: "d".repeat(64),
    checkoutAttemptId: "attempt_twint_001",
    returnUrl: "https://syntext.ch/bewerbungs-generator/motivation/formular.html",
  });

  assert.deepEqual(receivedParams.payment_method_types, ["card", "twint"]);
  assert.equal(receivedParams.line_items[0].price_data.currency, "chf");
});

test("Stripe checkout can create a no-cost session behind an explicit env flag", async () => {
  let receivedParams = null;
  const payment = createPaymentService({
    config: {
      secretKey: "sk_test_123",
      webhookSecret: "whsec_123",
      priceId: "",
      currency: "chf",
      priceCents: 999,
      productName: "VitaGen PDF Download",
      baseUrl: "https://syntext.ch/bewerbungs-generator",
      invoiceCreation: true,
      stripeApiVersion: "2026-05-27.dahlia",
      checkoutCouponId: "",
      devDiscountToken: "",
      freeCheckout: true,
    },
    stripeClient: {
      checkout: {
        sessions: {
          async create(params) {
            receivedParams = params;
            return {
              id: "cs_test_free",
              url: "https://checkout.stripe.com/c/pay/cs_test_free",
            };
          },
        },
      },
      webhooks: { constructEvent() {} },
    },
  });

  await payment.createCheckoutSession({
    documentType: "motivation",
    styleName: "swiss-line.css",
    documentHash: "c".repeat(64),
    returnUrl: "https://syntext.ch/bewerbungs-generator/motivation/formular.html",
  });

  assert.equal(receivedParams.line_items[0].price_data.unit_amount, 0);
  assert.equal(receivedParams.line_items[0].price_data.currency, "chf");
  assert.equal(receivedParams.discounts, undefined);
  assert.equal(receivedParams.metadata.discount_mode, "free_checkout");
});

test("Stripe verification accepts no-cost sessions only when a checkout coupon is configured", async () => {
  function makePayment({
    checkoutCouponId = "",
    devDiscountToken = "",
    freeCheckout = false,
    discountMode = "",
  } = {}) {
    return createPaymentService({
      config: {
        secretKey: "sk_test_123",
        webhookSecret: "whsec_123",
        priceId: "",
        currency: "chf",
        priceCents: 999,
        productName: "VitaGen PDF Download",
        baseUrl: "https://syntext.ch/bewerbungs-generator",
        invoiceCreation: true,
        stripeApiVersion: "2026-05-27.dahlia",
        checkoutCouponId,
        devDiscountToken,
        freeCheckout,
      },
      stripeClient: {
        checkout: {
          sessions: {
            async retrieve() {
              return {
                id: "cs_test_free",
                payment_status: "paid",
                currency: "chf",
                amount_total: 0,
                metadata: {
                  document_type: "motivation",
                  style_name: "swiss-line.css",
                  document_hash: "b".repeat(64),
                  ...(discountMode ? { discount_mode: discountMode } : {}),
                },
              };
            },
          },
        },
        webhooks: { constructEvent() {} },
      },
    });
  }

  await assert.rejects(
    () =>
      makePayment().verifyPaidSession({
        sessionId: "cs_test_free",
        documentType: "motivation",
        styleName: "swiss-line.css",
        documentHash: "b".repeat(64),
      }),
    /Payment amount mismatch/
  );

  const verification = await makePayment({
    checkoutCouponId: "coupon_free_test",
    devDiscountToken: "dev_token_123456",
    discountMode: "developer_100_percent",
  }).verifyPaidSession({
    sessionId: "cs_test_free",
    documentType: "motivation",
    styleName: "swiss-line.css",
    documentHash: "b".repeat(64),
  });

  assert.equal(verification.paymentStatus, "paid");
  assert.equal(verification.filename, "Bewerbung.pdf");

  const freeVerification = await makePayment({
    freeCheckout: true,
    discountMode: "free_checkout",
  }).verifyPaidSession({
    sessionId: "cs_test_free",
    documentType: "motivation",
    styleName: "swiss-line.css",
    documentHash: "b".repeat(64),
  });

  assert.equal(freeVerification.paymentStatus, "paid");
});

test("clean PDF generation requires a paid matching checkout session", async () => {
  const documentData = { name: "Max Muster", funktion: "Kaufmann" };
  const documentHash = createDocumentHash({
    documentType: "motivation",
    styleName: "swiss-line.css",
    documentData,
  });
  let verified = false;

  await withServer(
    createApp({
      paymentService: createFakePaymentService({
        async verifyPaidSession(input) {
          verified = true;
          assert.equal(input.sessionId, "cs_test_paid");
          assert.equal(input.documentHash, documentHash);
          return {
            documentType: "motivation",
            styleName: "swiss-line.css",
            documentHash,
            filename: "Bewerbung.pdf",
          };
        },
      }),
      env: {},
      logger: { error() {} },
    }),
    async (url) => {
      const response = await fetch(`${url}/generate-pdf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: "cs_test_paid",
          documentType: "motivation",
          styleName: "swiss-line.css",
          documentData,
          documentHash,
        }),
      });
      const bytes = Buffer.from(await response.arrayBuffer());

      assert.equal(response.status, 200);
      assert.match(response.headers.get("content-type"), /^application\/pdf/);
      assert.equal(bytes.subarray(0, 4).toString("utf8"), "%PDF");
      assert.equal(verified, true);
    }
  );
});

test("checkout session verification requires paid matching metadata", async () => {
  const documentData = { name: "Max Muster", funktion: "Kaufmann" };
  const documentHash = createDocumentHash({
    documentType: "motivation",
    styleName: "swiss-line.css",
    documentData,
  });
  let verified = false;

  await withServer(
    createApp({
      paymentService: createFakePaymentService({
        async verifyPaidSession(input) {
          verified = true;
          assert.deepEqual(input, {
            sessionId: "cs_test_paid",
            documentType: "motivation",
            styleName: "swiss-line.css",
            documentHash,
          });
          return {
            id: input.sessionId,
            paymentStatus: "paid",
            documentType: input.documentType,
            styleName: input.styleName,
            documentHash: input.documentHash,
          };
        },
      }),
      env: {},
      logger: { error() {} },
    }),
    async (url) => {
      const response = await fetch(`${url}/checkout/verify-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: "cs_test_paid",
          documentType: "motivation",
          styleName: "swiss-line.css",
          documentHash,
        }),
      });
      const body = await response.json();

      assert.equal(response.status, 200);
      assert.equal(body.paymentStatus, "paid");
      assert.equal(body.documentHash, documentHash);
      assert.equal(verified, true);
    }
  );
});

test("checkout session verification rejects document mismatch", async () => {
  await withServer(
    createApp({
      paymentService: createFakePaymentService({
        async verifyPaidSession() {
          const error = new Error("Payment does not match this document.");
          error.status = 403;
          error.code = "PAYMENT_DOCUMENT_MISMATCH";
          throw error;
        },
      }),
      env: {},
      logger: { error() {} },
    }),
    async (url) => {
      const response = await fetch(`${url}/checkout/verify-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: "cs_test_paid",
          documentType: "motivation",
          styleName: "swiss-line.css",
          documentHash: "a".repeat(64),
        }),
      });

      assert.equal(response.status, 403);
      assert.deepEqual(await response.json(), {
        error: "Payment does not match this document.",
      });
    }
  );
});

test("PDF generation rejects tampered document hashes before payment verification", async () => {
  let verifyCalls = 0;

  await withServer(
    createApp({
      paymentService: createFakePaymentService({
        async verifyPaidSession() {
          verifyCalls += 1;
        },
      }),
      env: {},
      logger: { error() {} },
    }),
    async (url) => {
      const response = await fetch(`${url}/generate-pdf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: "cs_test_paid",
          documentType: "motivation",
          styleName: "classic.css",
          documentData: { name: "Max Muster" },
          documentHash: "a".repeat(64),
        }),
      });

      assert.equal(response.status, 400);
      assert.equal(verifyCalls, 0);
    }
  );
});

test("Stripe webhook endpoint requires raw-body signature verification", async () => {
  await withServer(
    createApp({
      paymentService: createFakePaymentService(),
      env: {},
      logger: { error() {} },
    }),
    async (url) => {
      const response = await fetch(`${url}/stripe/webhook`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Stripe-Signature": "signed",
        },
        body: JSON.stringify({
          id: "evt_test",
          type: "checkout.session.completed",
          data: { object: { id: "cs_test_123", payment_status: "paid" } },
        }),
      });

      assert.equal(response.status, 200);
      assert.deepEqual(await response.json(), { received: true });
    }
  );
});

test("Stripe return URLs support localhost and production only", () => {
  const localReturnUrl = normalizeReturnUrl(
    "http://localhost:3000/preview.html?checkout=cancel&session_id=old#top",
    "https://syntext.ch/bewerbungs-generator/motivation/preview.html"
  );

  assert.equal(localReturnUrl, "http://localhost:3000/preview.html");
  assert.equal(
    buildReturnUrl(localReturnUrl, "success"),
    "http://localhost:3000/preview.html?checkout=success&session_id={CHECKOUT_SESSION_ID}"
  );
  assert.equal(
    buildReturnUrl(
      normalizeReturnUrl(
        "https://syntext.ch/bewerbungs-generator/motivation/preview.html",
        "https://syntext.ch/bewerbungs-generator/motivation/preview.html"
      ),
      "cancel"
    ),
    "https://syntext.ch/bewerbungs-generator/motivation/preview.html?checkout=cancel"
  );
  assert.throws(
    () =>
      normalizeReturnUrl(
        "https://attacker.example/preview.html",
        "https://syntext.ch/bewerbungs-generator/motivation/preview.html"
      ),
    /Invalid payment return URL/
  );
});
