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

const TEXT_LENGTH_GUIDES = {
  short: {
    label: "Short",
    instruction:
      "Write 4 to 5 concise sentences, about 110 to 150 words, in one paragraph.",
  },
  standard: {
    label: "Standard",
    instruction:
      "Write 6 to 8 complete sentences, about 170 to 240 words, in one or two short paragraphs.",
  },
  long: {
    label: "Detailed",
    instruction:
      "Write 9 to 11 complete sentences, about 280 to 360 words, in two well-structured paragraphs.",
  },
};

function normalizeTextLength(textLength) {
  return Object.hasOwn(TEXT_LENGTH_GUIDES, textLength) ? textLength : "standard";
}

function countPatternMatches(text, patterns) {
  return patterns.reduce((count, pattern) => {
    return count + (text.match(pattern) || []).length;
  }, 0);
}

function detectTextLanguage(input = {}) {
  const source = [
    input.stichpunkte,
    input.funktion,
    input.posten,
    input.arbeitgeber,
    input.greeting,
    input.closing,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const germanScore =
    countPatternMatches(source, [
      /\b(ich|mich|mein|meine|meinen|mit|fuer|fur|und|der|die|das|als|bei|sehr|geehrte|herren|damen|erfahrung|staerken|starken|bewerbung|motivation|team|unternehmen)\b/g,
      /[\u00e4\u00f6\u00fc\u00df]/g,
    ]) + (/\b(deutsch|german|de)\b/.test(source) ? 2 : 0);

  const englishScore =
    countPatternMatches(source, [
      /\b(i|my|me|with|for|and|the|as|at|dear|experience|strengths|skills|application|motivation|team|company|organisation|organization|role|position)\b/g,
    ]) + (/\b(english|englisch|en)\b/.test(source) ? 2 : 0);

  return englishScore > germanScore ? "English" : "German";
}

function formatPromptField(label, value) {
  if (!value) {
    return null;
  }

  return `${label}: ${value}`;
}

function buildTextPrompt(input = {}) {
  const {
    stichpunkte,
    funktion,
    name,
    posten,
    arbeitgeber,
    adresse,
    greeting,
    closing,
  } = input;
  const textLength = normalizeTextLength(input.textLength);
  const lengthGuide = TEXT_LENGTH_GUIDES[textLength];
  const targetLanguage = detectTextLanguage(input);
  const context = [
    formatPromptField("Applicant name", name),
    formatPromptField("Target role for the motivation text", funktion),
    formatPromptField("Role / subject-line wording", posten),
    formatPromptField("Employer or recipient details", arbeitgeber),
    formatPromptField("Applicant address or location clues", adresse),
    formatPromptField("Existing greeting", greeting),
    formatPromptField("Existing closing text", closing),
    formatPromptField("User notes or draft to rewrite", stichpunkte),
  ]
    .filter(Boolean)
    .join("\n");

  return `
System role:
You are a senior European application-writing coach for motivation letters and cover letters.

Task:
Write the main motivation body text for a job application. The result must feel specific to the form context, not like a random generic paragraph.

Target language:
${targetLanguage}. Use the language of the user's own notes or draft. If the source is mixed, prioritize the motivation notes and role text. Do not switch languages mid-text.

Length:
${lengthGuide.label}. ${lengthGuide.instruction}

Application context:
${context}

European motivation-letter standards:
- Connect the applicant's motivation, relevant experience, strengths, and concrete examples to the target role and employer.
- Use a formal, credible tone common in Germany, Switzerland, Austria, and broader European applications.
- Prefer precise, evidence-based wording over hype, slogans, exaggerated passion, or empty claims.
- Make the text readable for recruiters: clear opening fit, relevant proof, value for the employer, and a confident forward-looking final sentence.
- In German, use formal "Sie/Ihr" when addressing the employer. In English, use polished professional English suitable for European applications.
- If the employer details are sparse, stay role-focused and do not invent company facts.

Hard rules:
- Use only the provided context. Do not invent qualifications, employers, dates, languages, degrees, metrics, or personal facts.
- Preserve any specific facts from the user's notes, but rewrite them into fluent professional prose.
- Do not include headings, bullet points, markdown, placeholders, greeting, closing, signature, or subject line.
- Return only the finished motivation body text as plain text. Paragraph breaks are allowed for standard and detailed length.
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
