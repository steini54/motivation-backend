const test = require("node:test");
const assert = require("node:assert/strict");

const { createApp } = require("../app");

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

const service = {
  async generateApplicationText() {
    return "Generierter Bewerbungstext.";
  },
  async editApplicationPhoto() {
    return {
      dataUrl: "data:image/png;base64,aW1hZ2U=",
      quality: {
        identityConfidence: 0.96,
        verified: true,
      },
      image: {
        aspectRatio: "3:4",
        width: 864,
        height: 1184,
      },
    };
  },
};

test("health is available while readiness reflects AI configuration", async () => {
  await withServer(
    createApp({ env: {}, logger: { error() {} } }),
    async (url) => {
      const health = await fetch(`${url}/health`);
      const ready = await fetch(`${url}/ready`);

      assert.equal(health.status, 200);
      assert.deepEqual(await health.json(), {
        status: "ok",
        service: "motivation-backend",
      });
      assert.equal(ready.status, 503);
    }
  );
});

test("every preview theme is served as CSS", async () => {
  const themes = [
    "charcoal-frame.css",
    "cobalt-ribbon.css",
    "editorial-azure.css",
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

  await withServer(
    createApp({ env: {}, logger: { error() {} } }),
    async (url) => {
      for (const theme of themes) {
        const response = await fetch(`${url}/styles/${theme}`);
        assert.equal(response.status, 200, theme);
        assert.match(response.headers.get("content-type"), /^text\/css/);

        const productionPathResponse = await fetch(
          `${url}/bewerbungs-generator/motivation/styles/${theme}`
        );
        assert.equal(productionPathResponse.status, 200, theme);
        assert.match(
          productionPathResponse.headers.get("content-type"),
          /^text\/css/
        );
      }
    }
  );
});

test("shared payment script is served from the canonical VitaGen path", async () => {
  await withServer(
    createApp({ env: {}, logger: { error() {} } }),
    async (url) => {
      const response = await fetch(`${url}/bewerbungs-generator/payment.js`);
      const body = await response.text();

      assert.equal(response.status, 200);
      assert.match(response.headers.get("content-type"), /javascript/);
      assert.match(body, /VitaGenPayment/);
      assert.match(body, /\[VitaGen Payment\]/);
    }
  );
});

test("generate-text preserves the frontend response contract", async () => {
  await withServer(
    createApp({
      aiService: service,
      aiProvider: "openai",
      env: {},
      logger: { error() {} },
    }),
    async (url) => {
      const response = await fetch(`${url}/generate-text`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stichpunkte: "Teamarbeit",
          funktion: "Projektleiter",
        }),
      });

      assert.equal(response.status, 200);
      assert.deepEqual(await response.json(), {
        text: "Generierter Bewerbungstext.",
      });
    }
  );
});

test("generate-ai-photo preserves the frontend response contract", async () => {
  await withServer(
    createApp({
      aiService: service,
      aiProvider: "openai",
      env: {},
      logger: { error() {} },
    }),
    async (url) => {
      const form = new FormData();
      form.append(
        "photo",
        new Blob([Buffer.from("image")], { type: "image/png" }),
        "photo.png"
      );

      const response = await fetch(`${url}/generate-ai-photo`, {
        method: "POST",
        body: form,
      });
      const body = await response.json();

      assert.equal(response.status, 200);
      assert.equal(body.aiFoto, "data:image/png;base64,aW1hZ2U=");
      assert.equal(body.quality.verified, true);
    }
  );
});

test("invalid input and disallowed origins are rejected", async () => {
  await withServer(
    createApp({ geminiService: service, env: {}, logger: { error() {} } }),
    async (url) => {
      const missingText = await fetch(`${url}/generate-text`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });
      const blockedOrigin = await fetch(`${url}/health`, {
        headers: { Origin: "https://example.com" },
      });

      assert.equal(missingText.status, 400);
      assert.equal(blockedOrigin.status, 403);
    }
  );
});

test("unsupported uploads are rejected before calling the AI provider", async () => {
  let calls = 0;
  const guardedService = {
    ...service,
    async editApplicationPhoto() {
      calls += 1;
      return service.editApplicationPhoto();
    },
  };

  await withServer(
    createApp({
      geminiService: guardedService,
      env: {},
      logger: { error() {} },
    }),
    async (url) => {
      const form = new FormData();
      form.append(
        "photo",
        new Blob([Buffer.from("not-an-image")], { type: "text/plain" }),
        "photo.txt"
      );

      const response = await fetch(`${url}/generate-ai-photo`, {
        method: "POST",
        body: form,
      });

      assert.equal(response.status, 415);
      assert.equal(calls, 0);
    }
  );
});

test("AI quota errors return a stable client-safe response", async () => {
  const quotaService = {
    ...service,
    async generateApplicationText() {
      const error = new Error("vendor response details");
      error.status = 429;
      throw error;
    },
  };

  await withServer(
    createApp({
      geminiService: quotaService,
      env: {},
      logger: { error() {} },
    }),
    async (url) => {
      const response = await fetch(`${url}/generate-text`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stichpunkte: "Teamarbeit",
          funktion: "Projektleiter",
        }),
      });

      assert.equal(response.status, 429);
      assert.deepEqual(await response.json(), {
        error: "AI request limit reached. Please try again shortly.",
      });
    }
  );
});

test("AI authentication errors return a stable operational response", async () => {
  const authenticationService = {
    ...service,
    async generateApplicationText() {
      const error = new Error("provider credential rejected");
      error.status = 401;
      throw error;
    },
  };

  await withServer(
    createApp({
      geminiService: authenticationService,
      env: {},
      logger: { error() {} },
    }),
    async (url) => {
      const response = await fetch(`${url}/generate-text`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stichpunkte: "Teamarbeit",
          funktion: "Projektleiter",
        }),
      });

      assert.equal(response.status, 503);
      assert.deepEqual(await response.json(), {
        error:
          "The AI service authentication is not configured correctly. Please contact the administrator.",
      });
    }
  );
});

test("AI capacity errors return a retryable service response", async () => {
  const unavailableService = {
    ...service,
    async generateApplicationText() {
      const error = new Error("high demand");
      error.status = 503;
      throw error;
    },
  };

  await withServer(
    createApp({
      aiService: unavailableService,
      aiProvider: "gemini",
      env: {},
      logger: { error() {} },
    }),
    async (url) => {
      const response = await fetch(`${url}/generate-text`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stichpunkte: "Teamarbeit",
          funktion: "Projektleiter",
        }),
      });

      assert.equal(response.status, 503);
      assert.deepEqual(await response.json(), {
        error:
          "The AI model is temporarily busy. Please wait a moment and try again.",
      });
    }
  );
});

test("AI network connection timeouts return a timeout response", async () => {
  const timeoutService = {
    ...service,
    async generateApplicationText() {
      throw new TypeError("fetch failed", {
        cause: { code: "UND_ERR_CONNECT_TIMEOUT" },
      });
    },
  };

  await withServer(
    createApp({
      aiService: timeoutService,
      aiProvider: "gemini",
      env: {},
      logger: { error() {} },
    }),
    async (url) => {
      const response = await fetch(`${url}/generate-text`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stichpunkte: "Teamarbeit",
          funktion: "Projektleiter",
        }),
      });

      assert.equal(response.status, 504);
      assert.deepEqual(await response.json(), {
        error: "The AI service timed out. Please try again.",
      });
    }
  );
});

test("identity-mismatched generated photos are rejected safely", async () => {
  const mismatchService = {
    ...service,
    async editApplicationPhoto() {
      const error = new Error("internal quality details");
      error.code = "IMAGE_IDENTITY_MISMATCH";
      throw error;
    },
  };

  await withServer(
    createApp({
      geminiService: mismatchService,
      env: {},
      logger: { error() {} },
    }),
    async (url) => {
      const form = new FormData();
      form.append(
        "photo",
        new Blob([Buffer.from("image")], { type: "image/png" }),
        "photo.png"
      );

      const response = await fetch(`${url}/generate-ai-photo`, {
        method: "POST",
        body: form,
      });
      const body = await response.json();

      assert.equal(response.status, 422);
      assert.match(body.error, /changed the person too much/i);
      assert.doesNotMatch(JSON.stringify(body), /internal quality details/);
    }
  );
});
