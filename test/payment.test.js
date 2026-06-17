const test = require("node:test");
const assert = require("node:assert/strict");

const { createApp } = require("../app");
const { createDocumentHash } = require("../services/document-purchase");
const { buildReturnUrl, normalizeReturnUrl } = require("../services/stripe-service");

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

test("checkout session endpoint returns a Stripe redirect URL", async () => {
  const documentData = { name: "Max Muster", funktion: "Kaufmann" };
  const documentHash = createDocumentHash({
    documentType: "motivation",
    styleName: "standard.css",
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
          styleName: "standard.css",
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

test("clean PDF generation requires a paid matching checkout session", async () => {
  const documentData = { name: "Max Muster", funktion: "Kaufmann" };
  const documentHash = createDocumentHash({
    documentType: "motivation",
    styleName: "standard.css",
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
            styleName: "standard.css",
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
          styleName: "standard.css",
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
    styleName: "standard.css",
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
            styleName: "standard.css",
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
          styleName: "standard.css",
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
          styleName: "standard.css",
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
