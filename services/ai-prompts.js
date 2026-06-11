const IMAGE_EDIT_PROMPT = `
Purpose: create a professional job-application portrait from the supplied
reference photo. Use the reference primarily to preserve the person's identity,
not to preserve the original casual scene.

Identity lock:
- The supplied person is the immutable subject of the photograph.
- Preserve the exact same identity, facial structure, eyes, eyebrows, nose,
  mouth, jawline, ears, hairline, natural hair color, skin texture, skin tone,
  age appearance, natural facial asymmetry, and distinguishing facial details.
- Preserve natural facial asymmetry and distinguishing details from the source.
- Keep the subject photorealistic and recognizably the same person as the
  reference.
- Do not beautify, age-shift, slim, masculinize, feminize, or otherwise change
  the person's identity.

Adaptive transformation:
- If the reference is already a good application portrait (front-facing,
  professional clothing, clean background, usable lighting), make only subtle
  improvements: clean background, balanced exposure, natural color correction,
  and light retouching.
- If the reference is casual, seated, angled, poorly lit, cropped, busy, or
  includes objects such as a phone, use the face as the identity reference and
  reconstruct a new professional portrait.

Target result:
- Create a front-facing or slightly three-quarter head-and-shoulders portrait
  suitable for a German or Swiss job application.
- The person should have an upright professional posture, relaxed shoulders,
  direct eye contact, and a neutral confident expression with a slight friendly
  smile.
- Dress the person in clean professional business attire, such as a dark blazer,
  suit jacket, or smart business shirt, choosing a conservative style that fits
  the subject naturally.
- Use a clean warm white, light gray, or softly blurred modern office background.
- Use soft studio lighting, realistic shadows, natural skin texture, sharp focus
  on the face, and a polished but natural photographic look.
- Crop as an application photo: head and upper torso visible, centered,
  uncluttered, and balanced.

Important:
- This is not a background-only edit. Recompose the pose, clothing, crop,
  lighting, and background when needed to make a professional application photo.
- Keep the output as a natural photograph, not a glamor portrait, fashion shoot,
  avatar, illustration, or corporate advertisement.
`.trim();

const IMAGE_QUALITY_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    samePerson: { type: "boolean" },
    facePreserved: { type: "boolean" },
    professionalPortrait: { type: "boolean" },
    naturalPose: { type: "boolean" },
    professionalAttire: { type: "boolean" },
    artifactFree: { type: "boolean" },
    professionalBackground: { type: "boolean" },
    identityConfidence: {
      type: "number",
      minimum: 0,
      maximum: 1,
    },
    reasons: {
      type: "array",
      maxItems: 3,
      items: { type: "string" },
    },
  },
  required: [
    "samePerson",
    "facePreserved",
    "professionalPortrait",
    "naturalPose",
    "professionalAttire",
    "artifactFree",
    "professionalBackground",
    "identityConfidence",
    "reasons",
  ],
};

const IMAGE_QUALITY_PROMPT = `
Compare the first image (the user's original reference photo) with the second
image (the edited candidate).

This is a strict identity-preservation quality check for a job application
photo. The candidate is allowed to change pose, clothing, framing, lighting, and
background to become a professional application portrait. Do not reject the
candidate merely because the original casual scene, sitting pose, object, outfit,
or camera angle changed.

Reject the candidate if the person no longer appears to be the same individual,
if the facial structure or defining facial features changed, if the face has
obvious generation artifacts, or if the result is not a professional
job-application portrait.

Be conservative. A candidate should pass only when an ordinary person who knows
the subject would immediately recognize the same person, even though the outfit,
pose, background, and crop may have been reconstructed.
Return only the requested JSON assessment.
`.trim();

function buildTextPrompt({ stichpunkte, funktion }) {
  return `
You are an expert German application writer.

Write one polished motivation paragraph in German for the following role:
${funktion}

Use only the information in these notes:
${stichpunkte}

Requirements:
- Write exactly 5 to 7 complete sentences as one flowing paragraph.
- Use a professional, clear, credible, and convincing tone.
- Do not use headings, bullet points, placeholders, greetings, or a closing.
- Do not invent qualifications, employers, dates, or personal facts.
- Avoid generic filler and repetition.
- Return only the finished German paragraph.
`.trim();
}

function parseQualityAssessment(text, providerName) {
  try {
    return JSON.parse(text);
  } catch {
    const error = new Error(
      `${providerName} returned an invalid quality assessment`
    );
    error.code = "IMAGE_QUALITY_CHECK_FAILED";
    throw error;
  }
}

function isQualityAccepted(quality, minimumConfidence) {
  return (
    quality.samePerson === true &&
    quality.facePreserved === true &&
    quality.professionalPortrait === true &&
    quality.naturalPose === true &&
    quality.professionalAttire === true &&
    quality.artifactFree === true &&
    quality.professionalBackground === true &&
    Number(quality.identityConfidence) >= minimumConfidence
  );
}

module.exports = {
  IMAGE_EDIT_PROMPT,
  IMAGE_QUALITY_PROMPT,
  IMAGE_QUALITY_SCHEMA,
  buildTextPrompt,
  parseQualityAssessment,
  isQualityAccepted,
};
