# VitaGen AI Photo System - Client Summary

Date: June 11, 2026

## What The AI Photo Function Does

The photo feature is designed to turn a user-uploaded picture into a more
professional application photo.

The user can upload a normal image, for example:

- a casual photo
- a seated photo
- a photo with a busy background
- a photo with bad lighting
- a photo where the person is holding something
- an already good portrait that only needs small improvements

The AI then uses the uploaded image as a face and identity reference. The goal
is not only to replace the background. If the original photo is not suitable,
the system can rebuild the result as a clean professional portrait while still
keeping the same person's face.

## Main Features

- Uses the uploaded image as the reference.
- Keeps the same person's identity and facial features.
- Creates a professional job-application style portrait.
- Can improve lighting, background, crop, pose, and clothing.
- Can create a cleaner business look, such as a blazer or professional shirt.
- Uses a neutral background suitable for a German or Swiss application.
- Keeps the output natural and photorealistic, not cartoon-like or overly
  edited.
- Runs an additional quality check to reduce the chance of returning a photo
  that no longer looks like the same person.
- Allows up to 3 generated photo options in the current frontend flow.
- Prevents repeated button clicks while the AI request is still running.

## How The System Decides What To Do

The AI prompt is adaptive:

- If the uploaded photo is already good, the system makes only small
  improvements, such as better lighting, background, and color.
- If the uploaded photo is casual or unsuitable, the system uses the face as the
  identity reference and creates a new professional application portrait.

This makes the feature useful for different real user situations, not only for
simple background replacement.

## Models Used

Image generation/editing:

- `gemini-3.1-flash-image`

Quality/identity check:

- `gemini-2.5-flash`

The system uses Gemini only. No OpenAI fallback is used.

## Estimated Cost Per Generated Image

The image model is configured for `1K` output.

According to Google's Gemini API pricing page, `gemini-3.1-flash-image` costs
about **$0.067 per 1K generated image** on the standard paid tier.

The system also sends a small quality-check request with `gemini-2.5-flash` to
compare the original and generated image. This adds a small extra token cost,
normally only a fraction of a cent.

Practical estimate:

- One generated photo: about **$0.07 - $0.08 USD**
- Safer budget estimate per generated photo: about **$0.10 USD**
- If a user generates all 3 allowed options: about **$0.21 - $0.30 USD**
- 100 generated photos: about **$7 - $10 USD**
- 1,000 generated photos: about **$70 - $100 USD**

These numbers are estimates. The final invoice is always determined by Google's
actual API billing, model pricing, token usage, retries, and any future price
changes.

## Reliability Notes

Sometimes Gemini can temporarily return a "model busy" or `503` response. This
is a provider-side capacity issue, not a Hosttech or Railway hosting issue.

To reduce the impact, the backend now retries temporary Gemini errors, and the
frontend prevents duplicate clicks while a request is still running.

## What This Does Not Include

This feature does not change:

- payment processing
- premium download logic
- watermark logic
- the general website design
- the selectable CV/application styles

Those areas remain separate from the AI photo generation work.

## Sources

- Gemini API pricing:
  https://ai.google.dev/gemini-api/docs/pricing
- Gemini image generation documentation:
  https://ai.google.dev/gemini-api/docs/image-generation
- Gemini image prompting best practices:
  https://developers.googleblog.com/how-to-prompt-gemini-2-5-flash-image-generation-for-the-best-results/
