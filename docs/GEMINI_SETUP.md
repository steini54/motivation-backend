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

## Image editing workflow

`POST /generate-ai-photo` is a text-and-image-to-image editing workflow:

1. The browser uploads the user's original JPEG, PNG, or WebP photo.
2. The backend keeps the upload in memory only.
3. `sharp` validates the file, applies EXIF orientation, removes metadata,
   limits the processing resolution, and selects the nearest aspect ratio
   supported by Gemini 2.5 Flash Image.
4. The normalized reference image and a strict identity-preservation prompt
   are sent to `gemini-2.5-flash-image`.
5. The generated image is validated as a real image.
6. `gemini-2.5-flash` compares the original and edited images. Results that
   change the face, identity, pose, clothing, framing, or contain artifacts are
   rejected before they reach the browser.
7. A verified image is returned as `aiFoto`. The browser stores the original
   source and the selected result as separate Blobs in IndexedDB, so every new
   variation still starts from the original. Large personal-photo data is not
   kept in `localStorage`.

Gemini is generative software, so the identity quality gate reduces bad
results but cannot provide a biometric or pixel-perfect identity guarantee.
Users must review and select the final application photo.

## Local setup

1. Copy `.env.example` to `.env`.
2. Add the Gemini API key copied from Google AI Studio to `GEMINI_API_KEY`.
   Standard and authorization keys can use different formats, so do not
   validate the key only by its prefix.
3. Keep the two model variables unchanged.
4. Install dependencies with `npm ci`.
5. Validate the configuration with `npm run check:gemini`.
6. Verify the credential and both model names with `npm run check:gemini:live`.
7. Run the automated tests with `npm test`.
8. Start the application with `npm start`.

The preflight command validates local configuration only. It does not send an
API request or consume Gemini quota. The live check calls model metadata
endpoints, so it verifies authentication and model access without generating
text or images.

## Railway variables

Configure these variables in the Railway service:

```text
GEMINI_API_KEY=<client API key>
GEMINI_TEXT_MODEL=gemini-2.5-flash
GEMINI_IMAGE_MODEL=gemini-2.5-flash-image
GEMINI_TIMEOUT_MS=120000
IMAGE_IDENTITY_MIN_CONFIDENCE=0.85
```

Railway provides `PORT`, so it should not be assigned manually there.

Railway uses `/ready` as its deployment health-check path through
`railway.json`. It returns HTTP 503 until the Gemini key and required models
are configured and both model metadata endpoints are accessible, so an
incomplete or invalid deployment cannot replace the active production version.
This startup check does not generate billable text or images. `/health` remains
available as a liveness endpoint.

## Runtime controls

- `ALLOWED_ORIGINS`: comma-separated browser origins. Syntext and local
  development origins are allowed by default.
- `AI_RATE_LIMIT`: maximum AI requests per IP per 15 minutes (default `20`).
- `MAX_UPLOAD_MB`: maximum photo upload size in MB (default `10`).
- `GEMINI_TIMEOUT_MS`: Gemini request timeout (default `120000`).
- `IMAGE_IDENTITY_MIN_CONFIDENCE`: minimum visual identity score required from
  the post-generation quality check (default `0.85`).

## Security

- Keep Gemini calls in the Node.js backend.
- Never place the API key in frontend JavaScript or HTML.
- Never commit `.env`.
- Prefer `GEMINI_API_KEY` only. The configuration supports
  `GOOGLE_API_KEY` for compatibility, and it takes precedence when both exist.
- Google AI Studio now creates authorization keys by default. Follow the
  current AI Studio migration guidance instead of assuming every key starts
  with `AIza`.
- Restrict and rotate the production key through Google Cloud when practical.

## Official references

- [Gemini 2.5 Flash](https://ai.google.dev/gemini-api/docs/models/gemini-2.5-flash)
- [Gemini 2.5 Flash Image](https://ai.google.dev/gemini-api/docs/models/gemini-2.5-flash-image)
- [Gemini API quickstart](https://ai.google.dev/gemini-api/docs/quickstart)
- [Gemini API key security](https://ai.google.dev/gemini-api/docs/api-key)
