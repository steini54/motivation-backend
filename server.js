
// // const express = require("express");
// // const bodyParser = require("body-parser");
// // const cors = require("cors");
// // const fetch = require("node-fetch");
// // const multer = require("multer");
// // const FormData = require("form-data");
// // const path = require("path");
// // require("dotenv").config();

// // const app = express();
// // const PORT = process.env.PORT || 3000;

// // const upload = multer({ storage: multer.memoryStorage() });

// // app.use(cors());
// // app.use(bodyParser.json());

// // // Serve frontend static files
// // app.use(express.static(path.join(__dirname, "frontend")));

// // // Root → redirect to form
// // app.get("/", (req, res) => {
// //   res.redirect("/formular.html");
// // });

// // // ==============================
// // // KI FOTO
// // // ==============================
// // // app.post("/generate-ai-photo", upload.single("photo"), async (req, res) => {
// // //   console.log("=== KI FOTO REQUEST ===");
// // //   try {
// // //     if (!req.file) return res.status(400).json({ error: "Kein Bild erhalten" });

// // //     const formData = new FormData();
// // //     formData.append("model", "gpt-image-1");
// // //     formData.append("prompt", `
// // // You are editing a professional portrait photo for a job application (Bewerbungsfoto).

// // // YOUR ONLY TASK: Replace the background with a clean, neutral, light gray or soft white studio background.

// // // ABSOLUTE RULES — these must be followed exactly:
// // // 1. The person's face must remain 100% identical — same features, skin tone, expression, age, and details.
// // // 2. The person's hair must remain exactly the same — same color, style, and shape.
// // // 3. The person's clothing must remain exactly the same — same colors, style, and fit.
// // // 4. The person's body, posture, and proportions must not change at all.
// // // 5. Do NOT add any effects, filters, or enhancements to the person.
// // // 6. Do NOT retouch, smooth, or alter the face in any way.
// // // 7. Do NOT change the zoom level, crop, or framing.
// // // 8. ONLY replace what is behind the person with a soft neutral studio background (light gray or off-white).
// // // 9. The result must look like a professional passport or ID photo background.
// // // 10. Keep the lighting on the person natural and unchanged.

// // // The person must look IDENTICAL to the original — only the background changes.
// // // `);
// // //     formData.append("size", "1024x1536");
// // //     formData.append("image", req.file.buffer, {
// // //       filename: "upload.png",
// // //       contentType: req.file.mimetype
// // //     });

// // //     const response = await fetch("https://api.openai.com/v1/images/edits", {
// // //       method: "POST",
// // //       headers: { "Authorization": `Bearer ${process.env.OPENAI_API_KEY}` },
// // //       body: formData
// // //     });

// // //     const data = await response.json();
// // //     console.log("OpenAI Antwort:", data);

// // //     const generatedImage = data?.data?.[0]?.b64_json;
// // //     if (!generatedImage) return res.status(500).json({ error: "Kein Bild erhalten", details: data });

// // //     res.json({ aiFoto: `data:image/png;base64,${generatedImage}` });

// // //   } catch (err) {
// // //     console.error("KI FOTO FEHLER:", err);
// // //     res.status(500).json({ error: "KI Fehler" });
// // //   }
// // // });
// // // ==============================
// // // KI FOTO
// // // ==============================
// // app.post("/generate-ai-photo", upload.single("photo"), async (req, res) => {
// //   console.log("=== KI FOTO REQUEST ===");
// //   try {
// //     if (!req.file) return res.status(400).json({ error: "Kein Bild erhalten" });

// //     // IMPORTANT: OpenAI's dall-e-2 /images/edits endpoint expects a square PNG image (256x256, 512x512, or 1024x1024).
// //     // Your input image might need to be preprocessed to fit these requirements.
// //     // If your input is not square, the API might crop or resize it automatically,
// //     // which could affect framing.

// //     const formData = new FormData();
// //     formData.append("model", "gpt-image-1"); 

// //     formData.append("prompt", `
// // Create a professional LinkedIn and job application portrait from the uploaded photo.

// // IMPORTANT REQUIREMENTS:

// // The person must remain the same individual:
// // - Keep the exact same face and facial features.
// // - Keep the same skin tone and complexion.
// // - Keep the same age and natural appearance.
// // - Keep the same hairstyle and hair color.
// // - Keep the same eye color and facial characteristics.
// // - Do not make the person look younger or older.
// // - Do not change ethnicity or identity.
// // - Maintain a natural and realistic appearance.

// // Professional Enhancement:
// // - Upgrade the overall portrait to a high-quality professional LinkedIn and corporate headshot.
// // - Dress the person in professional business attire suitable for office, corporate, engineering, management, IT, and professional job applications.
// // - Use elegant business clothing such as a suit jacket, blazer, dress shirt, or other professional attire appropriate for LinkedIn.
// // - Ensure the clothing looks realistic and naturally fitted.

// // Background:
// // - Replace the background with a clean professional studio background.
// // - Use neutral light gray, soft white, or modern corporate office-style background.
// // - Keep the background simple, clean, and distraction-free.

// // Photo Quality:
// // - Improve image quality, sharpness, lighting, and professionalism.
// // - Maintain natural skin texture.
// // - Do not over-retouch the face.
// // - Do not apply beauty filters.
// // - Keep the person looking authentic and trustworthy.

// // Composition:
// // - Keep the original pose and framing as much as possible.
// // - Ensure the result looks like a premium LinkedIn profile photo and a professional photo suitable for CVs, motivation letters, resumes, job applications, and corporate profiles.

// // The final image should look like a professional studio headshot while preserving the person's real identity, age, facial features, and skin tone.
// // `);
// //     formData.append("size", "1024x1024"); // Changed to 1024x1024 to match DALL-E 2 square requirement
// //     // NOTE: Your input image also needs to be this size and square.

// //     formData.append("image", req.file.buffer, {
// //       filename: "upload.png",
// //       contentType: req.file.mimetype // Ensure this is 'image/png' if you're sending PNG,
// //       // or handle conversion if the original is JPG.
// //     });

// //     const response = await fetch("https://api.openai.com/v1/images/edits", {
// //       method: "POST",
// //       headers: { "Authorization": `Bearer ${process.env.OPENAI_API_KEY}` },
// //       body: formData
// //     });

// //     const data = await response.json();
// //     console.log("OpenAI Antwort:", data);

// //     const generatedImage = data?.data?.[0]?.b64_json;
// //     if (!generatedImage) return res.status(500).json({ error: "Kein Bild erhalten", details: data });

// //     res.json({ aiFoto: `data:image/png;base64,${generatedImage}` });

// //   } catch (err) {
// //     console.error("KI FOTO FEHLER:", err);
// //     res.status(500).json({ error: "KI Fehler", details: err.message });
// //   }
// // });
// // // ==============================
// // // KI TEXT
// // // ==============================
// // app.post("/generate-text", async (req, res) => {
// //   console.log("=== KI TEXT REQUEST ===");
// //   try {
// //     const { stichpunkte, funktion } = req.body;
// //     if (!stichpunkte || !funktion) return res.status(400).json({ error: "Fehlende Daten" });

// //     const response = await fetch("https://api.openai.com/v1/chat/completions", {
// //       method: "POST",
// //       headers: {
// //         "Content-Type": "application/json",
// //         "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
// //       },
// //       body: JSON.stringify({
// //         model: "gpt-4.1-mini",
// //         messages: [
// //           { role: "system", content: "Du bist ein Experte für professionelle Bewerbungsschreiben." },
// //           { role: "user", content: `Erstelle aus folgenden Stichpunkten einen professionellen Fließtext für eine Bewerbung.\n\nFunktion: ${funktion}\n\nStichpunkte:\n${stichpunkte}\n\nRegeln:\n- professionell\n- klar\n- überzeugend\n- keine Aufzählung\n- max. 5-7 Sätze` }
// //         ],
// //         temperature: 0.7
// //       })
// //     });

// //     const data = await response.json();
// //     const text = data?.choices?.[0]?.message?.content;
// //     if (!text) return res.status(500).json({ error: "Kein Text generiert", details: data });

// //     res.json({ text });

// //   } catch (err) {
// //     console.error("KI TEXT FEHLER:", err);
// //     res.status(500).json({ error: "Serverfehler" });
// //   }
// // });

// // app.listen(PORT, () => {
// //   console.log(`Server läuft auf http://127.0.0.1:${PORT}`);
// // });


// const express = require("express");
// const bodyParser = require("body-parser");
// const cors = require("cors");
// const multer = require("multer");
// const path = require("path");
// require("dotenv").config();

// // Google AI Studio (Gemini API) SDK
// const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require("@google/generative-ai");

// const app = express();
// const PORT = process.env.PORT || 3000;

// // Multer for file uploads
// const upload = multer({ storage: multer.memoryStorage() });

// app.use(cors());
// app.use(bodyParser.json());

// // Initialize Google Generative AI
// // Ensure GOOGLE_API_KEY is set in your .env file
// const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// // Serve frontend static files
// app.use(express.static(path.join(__dirname, "frontend")));

// // Root → redirect to form
// app.get("/", (req, res) => {
//   res.redirect("/formular.html");
// });

// // Helper function to convert buffer to GoogleGenerativeAI's Part object
// function fileToGenerativePart(buffer, mimeType) {
//   return {
//     inlineData: {
//       data: buffer.toString("base64"),
//       mimeType,
//     },
//   };
// }

// // ==============================
// // KI FOTO (Using Google AI Studio for prompt creation, then hypothetical image gen)
// // ==============================
// app.post("/generate-ai-photo", upload.single("photo"), async (req, res) => {
//   console.log("=== KI FOTO REQUEST (Google AI Studio Integration) ===");
//   try {
//     if (!req.file) return res.status(400).json({ error: "Kein Bild erhalten" });

//     const imageBuffer = req.file.buffer;
//     const imageMimeType = req.file.mimetype;

//     // IMPORTANT: Google AI Studio's Gemini models (like gemini-pro-vision)
//     // are great for understanding images and generating text from them.
//     // They are NOT directly for "editing" images in the DALL-E 2 /edits sense
//     // where you modify parts of an uploaded image.
//     //
//     // For a "professional photo," a common approach with Google's generative AI
//     // would be to either:
//     // 1. Describe the ideal photo and use a Text-to-Image model (e.g., Imagen on Vertex AI)
//     // 2. Use Gemini-Pro-Vision to analyze the person in the photo and then
//     //    generate a *text prompt* that accurately describes them in professional attire/background,
//     //    which you would then feed to a Text-to-Image model.
//     //
//     // This example implements approach 2: Using Gemini to create a descriptive prompt.
//     // You would need a SEPARATE Text-to-Image API (from Google Vertex AI or another provider)
//     // to actually generate the image from this prompt.

//     const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

//     const parts = [
//       fileToGenerativePart(imageBuffer, imageMimeType),
//       `Analyze this person's appearance and pose. Based on this, generate a very detailed, high-quality, professional prompt suitable for a text-to-image AI model. The prompt should describe the person in a modern business suit/attire, with a clean, blurred, professional office or studio background (light gray or white). Emphasize that the person's face, hair, and overall identity must remain consistent with the input image. Include details about good lighting, sharp focus, and a friendly, confident expression. Ensure the generated prompt leads to a professional LinkedIn or CV photo.`,
//     ];

//     const result = await model.generateContent({
//       contents: [{ role: "user", parts }],
//       safetySettings: [
//         {
//           category: HarmCategory.HARM_CATEGORY_HARASSMENT,
//           threshold: HarmBlockThreshold.BLOCK_NONE,
//         },
//         {
//           category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
//           threshold: HarmBlockThreshold.BLOCK_NONE,
//         },
//         {
//           category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
//           threshold: HarmBlockThreshold.BLOCK_NONE,
//         },
//         {
//           category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
//           threshold: HarmBlockThreshold.BLOCK_NONE,
//         },
//       ],
//     });

//     const response = await result.response;
//     const generatedPromptForImage = response.text();

//     if (!generatedPromptForImage) {
//       return res.status(500).json({ error: "Could not generate image prompt from Google AI Studio", details: response });
//     }

//     console.log("Generated Prompt for Image:", generatedPromptForImage);

//     // --- HYPOTHETICAL IMAGE GENERATION API CALL ---
//     // This part requires a separate text-to-image model/API.
//     // Google's text-to-image is typically via Vertex AI (Imagen).
//     // The Gemini API itself *does not directly generate images from text prompts*
//     // in the way DALL-E 3 does. It's for multimodal understanding and text generation.
//     //
//     // For a full solution, you would integrate with a service like:
//     // - Google Cloud Vertex AI (Imagen)
//     // - Stability AI (Stable Diffusion API)
//     // - Another text-to-image provider
//     //
//     // For now, we'll return the *generated prompt* as a text result,
//     // and you can manually feed this to a text-to-image generator.
//     // OR, if you just want a placeholder, you can return a static image.
//     //
//     // As a placeholder, let's just return the prompt for the user to see,
//     // and instruct them what to do.

//     // If you actually had a text-to-image API (e.g., using 'node-fetch' to another endpoint):
//     /*
//     const textToImageResponse = await fetch("YOUR_TEXT_TO_IMAGE_API_URL", {
//         method: "POST",
//         headers: {
//             "Content-Type": "application/json",
//             "Authorization": `Bearer ${process.env.YOUR_TEXT_TO_IMAGE_API_KEY}`
//         },
//         body: JSON.stringify({
//             prompt: generatedPromptForImage,
//             size: "1024x1024",
//             // other parameters
//         })
//     });
//     const imageData = await textToImageResponse.json();
//     const finalGeneratedImageBase64 = imageData?.data?.[0]?.b64_json;
//     if (!finalGeneratedImageBase64) {
//         return res.status(500).json({ error: "Failed to generate image from text-to-image API", details: imageData });
//     }
//     res.json({ aiFoto: `data:image/png;base64,${finalGeneratedImageBase64}` });
//     */

//     // For now, return the generated prompt for the image, as we don't have a direct T2I here
//     res.json({
//       aiFoto: `data:image/svg+xml;base64,${Buffer.from(`<svg width="1024" height="1024" viewBox="0 0 1024 1024" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="1024" height="1024" fill="#E0E0E0"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="28" fill="#333" width="900">Image would be generated by a Text-to-Image AI using this prompt:</text><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="20" fill="#666" width="900">${generatedPromptForImage.substring(0, 150)}...</text></svg>`).toString('base64')}`,
//       // In a real app, you'd integrate a text-to-image API here.
//       // For now, we return the generated prompt text for debugging/info
//       imageGenerationPrompt: generatedPromptForImage,
//       message: "Generated a detailed prompt for your professional photo. You would now feed this prompt to a Text-to-Image AI (e.g., Google Vertex AI Imagen, Stability AI, etc.) to get the actual image. The displayed image is a placeholder."
//     });

//   } catch (err) {
//     console.error("KI FOTO FEHLER (Google AI Studio):", err);
//     res.status(500).json({ error: "KI Foto Fehler", details: err.message });
//   }
// });

// // ==============================
// // KI TEXT (Using Google AI Studio - Gemini Pro)
// // ==============================
// app.post("/generate-text", async (req, res) => {
//   console.log("=== KI TEXT REQUEST (Google AI Studio Integration) ===");
//   try {
//     const { stichpunkte, funktion } = req.body;
//     if (!stichpunkte || !funktion) return res.status(400).json({ error: "Fehlende Daten" });

//     const model = genAI.getGenerativeModel({ model: "gemini-pro" });

//     const prompt = `Du bist ein Experte für professionelle Bewerbungsschreiben. Erstelle aus folgenden Stichpunkten einen professionellen Fließtext für eine Bewerbung.

// Funktion: ${funktion}

// Stichpunkte:
// ${stichpunkte}

// Regeln:
// - professionell
// - klar
// - überzeugend
// - keine Aufzählung
// - max. 5-7 Sätze`;

//     const result = await model.generateContent({
//       contents: [{ role: "user", parts: [{ text: prompt }] }],
//       safetySettings: [
//         {
//           category: HarmCategory.HARM_CATEGORY_HARASSMENT,
//           threshold: HarmBlockThreshold.BLOCK_NONE,
//         },
//         {
//           category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
//           threshold: HarmBlockThreshold.BLOCK_NONE,
//         },
//         {
//           category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
//           threshold: HarmBlockThreshold.BLOCK_NONE,
//         },
//         {
//           category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
//           threshold: HarmBlockThreshold.BLOCK_NONE,
//         },
//       ],
//       generationConfig: {
//         temperature: 0.7,
//         maxOutputTokens: 200, // Limit for ~5-7 sentences
//       },
//     });

//     const response = await result.response;
//     const generatedText = response.text();

//     if (!generatedText) {
//       return res.status(500).json({ error: "Kein Text generiert von Google AI Studio", details: response });
//     }

//     res.json({ text: generatedText });

//   } catch (err) {
//     console.error("KI TEXT FEHLER (Google AI Studio):", err);
//     res.status(500).json({ error: "Serverfehler", details: err.message });
//   }
// });

// app.listen(PORT, () => {
//   console.log(`Server läuft auf http://127.0.0.1:${PORT}`);
// });

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
require("dotenv").config();

// Google AI Studio (Gemini API) SDK
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require("@google/generative-ai");

const app = express();
const PORT = process.env.PORT || 3000;

// Multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(bodyParser.json());

// Initialize Google Generative AI
// Ensure GOOGLE_API_KEY is set in your .env file
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// Serve frontend static files
app.use(express.static(path.join(__dirname, "frontend")));

// Root → redirect to form
app.get("/", (req, res) => {
  res.redirect("/formular.html");
});

// Helper function to convert buffer to GoogleGenerativeAI's Part object
function fileToGenerativePart(buffer, mimeType) {
  return {
    inlineData: {
      data: buffer.toString("base64"),
      mimeType,
    },
  };
}

// ==============================
// KI FOTO (Using Google AI Studio for prompt creation, then hypothetical image gen)
// ==============================
app.post("/generate-ai-photo", upload.single("photo"), async (req, res) => {
  console.log("=== KI FOTO REQUEST (Google AI Studio Integration) ===");
  try {
    if (!req.file) return res.status(400).json({ error: "Kein Bild erhalten" });

    const imageBuffer = req.file.buffer;
    const imageMimeType = req.file.mimetype;

    const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

    const parts = [
      fileToGenerativePart(imageBuffer, imageMimeType),
      // --- THIS IS THE CORRECTED PART ---
      {
        text: `Analyze this person's appearance and pose. Based on this, generate a very detailed, high-quality, professional prompt suitable for a text-to-image AI model. The prompt should describe the person in a modern business suit/attire, with a clean, blurred, professional office or studio background (light gray or white). Emphasize that the person's face, hair, and overall identity must remain consistent with the input image. Include details about good lighting, sharp focus, and a friendly, confident expression. Ensure the generated prompt leads to a professional LinkedIn or CV photo.`,
      },
    ];

    const result = await model.generateContent({
      contents: [{ role: "user", parts }],
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
      ],
    });

    const response = await result.response;
    const generatedPromptForImage = response.text();

    if (!generatedPromptForImage) {
      return res.status(500).json({ error: "Could not generate image prompt from Google AI Studio", details: response });
    }

    console.log("Generated Prompt for Image:", generatedPromptForImage);

    res.json({
      aiFoto: `data:image/svg+xml;base64,${Buffer.from(`<svg width="1024" height="1024" viewBox="0 0 1024 1024" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="1024" height="1024" fill="#E0E0E0"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="28" fill="#333" width="900">Image would be generated by a Text-to-Image AI using this prompt:</text><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="20" fill="#666" width="900">${generatedPromptForImage.substring(0, 150)}...</text></svg>`).toString('base64')}`,
      imageGenerationPrompt: generatedPromptForImage,
      message: "Generated a detailed prompt for your professional photo. You would now feed this prompt to a Text-to-Image AI (e.g., Google Vertex AI Imagen, Stability AI, etc.) to get the actual image. The displayed image is a placeholder."
    });

  } catch (err) {
    console.error("KI FOTO FEHLER (Google AI Studio):", err);
    res.status(500).json({ error: "KI Foto Fehler", details: err.message });
  }
});

// ==============================
// KI TEXT (Using Google AI Studio - Gemini Pro)
// ==============================
app.post("/generate-text", async (req, res) => {
  console.log("=== KI TEXT REQUEST (Google AI Studio Integration) ===");
  try {
    const { stichpunkte, funktion } = req.body;
    if (!stichpunkte || !funktion) return res.status(400).json({ error: "Fehlende Daten" });

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `Du bist ein Experte für professionelle Bewerbungsschreiben. Erstelle aus folgenden Stichpunkten einen professionellen Fließtext für eine Bewerbung.

Funktion: ${funktion}

Stichpunkte:
${stichpunkte}

Regeln:
- professionell
- klar
- überzeugend
- keine Aufzählung
- max. 5-7 Sätze`;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 200, // Limit for ~5-7 sentences
      },
    });

    const response = await result.response;
    const generatedText = response.text();

    if (!generatedText) {
      return res.status(500).json({ error: "Kein Text generiert von Google AI Studio", details: response });
    }

    res.json({ text: generatedText });

  } catch (err) {
    console.error("KI TEXT FEHLER (Google AI Studio):", err);
    res.status(500).json({ error: "Serverfehler", details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server läuft auf http://127.0.0.1:${PORT}`);
});