# Gemini API Setup

This repository is prepared to use the server-side Google Gen AI SDK with:

- Text: `gemini-2.5-flash`
- Image editing and generation: `gemini-2.5-flash-image` (Nano Banana)
- SDK: `@google/genai`

The production endpoints use this configuration:

- `POST /generate-text` returns `{ "text": "..." }`
- `POST /generate-ai-photo` returns `{ "aiFoto": "data:image/..." }`

These response contracts remain compatible with the frontend hosted on
`syntext.ch`.

## Local setup

1. Copy `.env.example` to `.env`.
2. Add the Gemini API key from Google AI Studio to `GEMINI_API_KEY`.
3. Keep the two model variables unchanged.
4. Install dependencies with `npm ci`.
5. Validate the configuration with `npm run check:gemini`.
6. Run the automated tests with `npm test`.
7. Start the application with `npm start`.

The preflight command validates local configuration only. It does not send an
API request or consume Gemini quota.

## Railway variables

Configure these variables in the Railway service:

```text
GEMINI_API_KEY=<client API key>
GEMINI_TEXT_MODEL=gemini-2.5-flash
GEMINI_IMAGE_MODEL=gemini-2.5-flash-image
GEMINI_TIMEOUT_MS=120000
```

Railway provides `PORT`, so it should not be assigned manually there.

Railway uses `/ready` as its deployment health-check path through
`railway.json`. It returns HTTP 503 until the Gemini key and required models
are configured, so an incomplete deployment cannot replace the active
production version. `/health` remains available as a liveness endpoint.

## Runtime controls

- `ALLOWED_ORIGINS`: comma-separated browser origins. Syntext and local
  development origins are allowed by default.
- `AI_RATE_LIMIT`: maximum AI requests per IP per 15 minutes (default `20`).
- `MAX_UPLOAD_MB`: maximum photo upload size in MB (default `10`).
- `GEMINI_TIMEOUT_MS`: Gemini request timeout (default `120000`).

## Security

- Keep Gemini calls in the Node.js backend.
- Never place the API key in frontend JavaScript or HTML.
- Never commit `.env`.
- Prefer `GEMINI_API_KEY` only. The configuration supports
  `GOOGLE_API_KEY` for compatibility, and it takes precedence when both exist.
- Restrict and rotate the production key through Google Cloud when practical.

## Official references

- [Gemini 2.5 Flash](https://ai.google.dev/gemini-api/docs/models/gemini-2.5-flash)
- [Gemini 2.5 Flash Image](https://ai.google.dev/gemini-api/docs/models/gemini-2.5-flash-image)
- [Gemini API quickstart](https://ai.google.dev/gemini-api/docs/quickstart)
- [Gemini API key security](https://ai.google.dev/gemini-api/docs/api-key)
