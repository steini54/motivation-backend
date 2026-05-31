// const express = require("express");
// const bodyParser = require("body-parser");
// const cors = require("cors");
// const fetch = require("node-fetch");
// const multer = require("multer");
// const FormData = require("form-data");
// const path = require("path");
// require("dotenv").config();

// const app = express();
// const PORT = process.env.PORT || 3000;

// const upload = multer({ storage: multer.memoryStorage() });

// app.use(cors());
// app.use(bodyParser.json());

// // Serve frontend static files
// app.use(express.static(path.join(__dirname, "frontend")));

// // Root → redirect to form
// app.get("/", (req, res) => {
//   res.redirect("/formular.html");
// });

// // ==============================
// // KI FOTO
// // ==============================
// app.post("/generate-ai-photo", upload.single("photo"), async (req, res) => {
//   console.log("=== KI FOTO REQUEST ===");
//   try {
//     if (!req.file) return res.status(400).json({ error: "Kein Bild erhalten" });

//     const formData = new FormData();
//     formData.append("model", "gpt-image-1");
//     formData.append("prompt", `
// Edit ONLY the background of this image.
// STRICT RULES:
// - Do NOT modify the face
// - Do NOT modify the person
// - Do NOT change body, pose, or proportions
// - Do NOT crop or zoom
// The person must remain EXACTLY the same.
// ONLY:
// - Replace or blur the background (neutral white or soft office)
// - Improve lighting VERY subtly without touching facial details
// If you cannot guarantee this: return the original image unchanged.
// `);
//     formData.append("size", "1024x1536");
//     formData.append("image", req.file.buffer, {
//       filename: "upload.png",
//       contentType: req.file.mimetype
//     });

//     const response = await fetch("https://api.openai.com/v1/images/edits", {
//       method: "POST",
//       headers: { "Authorization": `Bearer ${process.env.OPENAI_API_KEY}` },
//       body: formData
//     });

//     const data = await response.json();
//     console.log("OpenAI Antwort:", data);

//     const generatedImage = data?.data?.[0]?.b64_json;
//     if (!generatedImage) return res.status(500).json({ error: "Kein Bild erhalten", details: data });

//     res.json({ aiFoto: `data:image/png;base64,${generatedImage}` });

//   } catch (err) {
//     console.error("KI FOTO FEHLER:", err);
//     res.status(500).json({ error: "KI Fehler" });
//   }
// });

// // ==============================
// // KI TEXT
// // ==============================
// app.post("/generate-text", async (req, res) => {
//   console.log("=== KI TEXT REQUEST ===");
//   try {
//     const { stichpunkte, funktion } = req.body;
//     if (!stichpunkte || !funktion) return res.status(400).json({ error: "Fehlende Daten" });

//     const response = await fetch("https://api.openai.com/v1/chat/completions", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
//       },
//       body: JSON.stringify({
//         model: "gpt-4.1-mini",
//         messages: [
//           { role: "system", content: "Du bist ein Experte für professionelle Bewerbungsschreiben." },
//           { role: "user", content: `Erstelle aus folgenden Stichpunkten einen professionellen Fließtext für eine Bewerbung.\n\nFunktion: ${funktion}\n\nStichpunkte:\n${stichpunkte}\n\nRegeln:\n- professionell\n- klar\n- überzeugend\n- keine Aufzählung\n- max. 5-7 Sätze` }
//         ],
//         temperature: 0.7
//       })
//     });

//     const data = await response.json();
//     const text = data?.choices?.[0]?.message?.content;
//     if (!text) return res.status(500).json({ error: "Kein Text generiert", details: data });

//     res.json({ text });

//   } catch (err) {
//     console.error("KI TEXT FEHLER:", err);
//     res.status(500).json({ error: "Serverfehler" });
//   }
// });

// app.listen(PORT, () => {
//   console.log(`Server läuft auf http://127.0.0.1:${PORT}`);
// });

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fetch = require("node-fetch");
const multer = require("multer");
const FormData = require("form-data");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(bodyParser.json());

// Serve frontend static files
app.use(express.static(path.join(__dirname, "frontend")));

// Root → redirect to form
app.get("/", (req, res) => {
  res.redirect("/formular.html");
});

// ==============================
// KI FOTO
// ==============================
// app.post("/generate-ai-photo", upload.single("photo"), async (req, res) => {
//   console.log("=== KI FOTO REQUEST ===");
//   try {
//     if (!req.file) return res.status(400).json({ error: "Kein Bild erhalten" });

//     const formData = new FormData();
//     formData.append("model", "gpt-image-1");
//     formData.append("prompt", `
// You are editing a professional portrait photo for a job application (Bewerbungsfoto).

// YOUR ONLY TASK: Replace the background with a clean, neutral, light gray or soft white studio background.

// ABSOLUTE RULES — these must be followed exactly:
// 1. The person's face must remain 100% identical — same features, skin tone, expression, age, and details.
// 2. The person's hair must remain exactly the same — same color, style, and shape.
// 3. The person's clothing must remain exactly the same — same colors, style, and fit.
// 4. The person's body, posture, and proportions must not change at all.
// 5. Do NOT add any effects, filters, or enhancements to the person.
// 6. Do NOT retouch, smooth, or alter the face in any way.
// 7. Do NOT change the zoom level, crop, or framing.
// 8. ONLY replace what is behind the person with a soft neutral studio background (light gray or off-white).
// 9. The result must look like a professional passport or ID photo background.
// 10. Keep the lighting on the person natural and unchanged.

// The person must look IDENTICAL to the original — only the background changes.
// `);
//     formData.append("size", "1024x1536");
//     formData.append("image", req.file.buffer, {
//       filename: "upload.png",
//       contentType: req.file.mimetype
//     });

//     const response = await fetch("https://api.openai.com/v1/images/edits", {
//       method: "POST",
//       headers: { "Authorization": `Bearer ${process.env.OPENAI_API_KEY}` },
//       body: formData
//     });

//     const data = await response.json();
//     console.log("OpenAI Antwort:", data);

//     const generatedImage = data?.data?.[0]?.b64_json;
//     if (!generatedImage) return res.status(500).json({ error: "Kein Bild erhalten", details: data });

//     res.json({ aiFoto: `data:image/png;base64,${generatedImage}` });

//   } catch (err) {
//     console.error("KI FOTO FEHLER:", err);
//     res.status(500).json({ error: "KI Fehler" });
//   }
// });
// ==============================
// KI FOTO
// ==============================
app.post("/generate-ai-photo", upload.single("photo"), async (req, res) => {
  console.log("=== KI FOTO REQUEST ===");
  try {
    if (!req.file) return res.status(400).json({ error: "Kein Bild erhalten" });

    // IMPORTANT: OpenAI's dall-e-2 /images/edits endpoint expects a square PNG image (256x256, 512x512, or 1024x1024).
    // Your input image might need to be preprocessed to fit these requirements.
    // If your input is not square, the API might crop or resize it automatically,
    // which could affect framing.

    const formData = new FormData();
    formData.append("model", "gpt-image-1"); 

    formData.append("prompt", `
Create a professional LinkedIn and job application portrait from the uploaded photo.

IMPORTANT REQUIREMENTS:

The person must remain the same individual:
- Keep the exact same face and facial features.
- Keep the same skin tone and complexion.
- Keep the same age and natural appearance.
- Keep the same hairstyle and hair color.
- Keep the same eye color and facial characteristics.
- Do not make the person look younger or older.
- Do not change ethnicity or identity.
- Maintain a natural and realistic appearance.

Professional Enhancement:
- Upgrade the overall portrait to a high-quality professional LinkedIn and corporate headshot.
- Dress the person in professional business attire suitable for office, corporate, engineering, management, IT, and professional job applications.
- Use elegant business clothing such as a suit jacket, blazer, dress shirt, or other professional attire appropriate for LinkedIn.
- Ensure the clothing looks realistic and naturally fitted.

Background:
- Replace the background with a clean professional studio background.
- Use neutral light gray, soft white, or modern corporate office-style background.
- Keep the background simple, clean, and distraction-free.

Photo Quality:
- Improve image quality, sharpness, lighting, and professionalism.
- Maintain natural skin texture.
- Do not over-retouch the face.
- Do not apply beauty filters.
- Keep the person looking authentic and trustworthy.

Composition:
- Keep the original pose and framing as much as possible.
- Ensure the result looks like a premium LinkedIn profile photo and a professional photo suitable for CVs, motivation letters, resumes, job applications, and corporate profiles.

The final image should look like a professional studio headshot while preserving the person's real identity, age, facial features, and skin tone.
`);
    formData.append("size", "1024x1024"); // Changed to 1024x1024 to match DALL-E 2 square requirement
    // NOTE: Your input image also needs to be this size and square.

    formData.append("image", req.file.buffer, {
      filename: "upload.png",
      contentType: req.file.mimetype // Ensure this is 'image/png' if you're sending PNG,
      // or handle conversion if the original is JPG.
    });

    const response = await fetch("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: { "Authorization": `Bearer ${process.env.OPENAI_API_KEY}` },
      body: formData
    });

    const data = await response.json();
    console.log("OpenAI Antwort:", data);

    const generatedImage = data?.data?.[0]?.b64_json;
    if (!generatedImage) return res.status(500).json({ error: "Kein Bild erhalten", details: data });

    res.json({ aiFoto: `data:image/png;base64,${generatedImage}` });

  } catch (err) {
    console.error("KI FOTO FEHLER:", err);
    res.status(500).json({ error: "KI Fehler", details: err.message });
  }
});
// ==============================
// KI TEXT
// ==============================
app.post("/generate-text", async (req, res) => {
  console.log("=== KI TEXT REQUEST ===");
  try {
    const { stichpunkte, funktion } = req.body;
    if (!stichpunkte || !funktion) return res.status(400).json({ error: "Fehlende Daten" });

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        messages: [
          { role: "system", content: "Du bist ein Experte für professionelle Bewerbungsschreiben." },
          { role: "user", content: `Erstelle aus folgenden Stichpunkten einen professionellen Fließtext für eine Bewerbung.\n\nFunktion: ${funktion}\n\nStichpunkte:\n${stichpunkte}\n\nRegeln:\n- professionell\n- klar\n- überzeugend\n- keine Aufzählung\n- max. 5-7 Sätze` }
        ],
        temperature: 0.7
      })
    });

    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content;
    if (!text) return res.status(500).json({ error: "Kein Text generiert", details: data });

    res.json({ text });

  } catch (err) {
    console.error("KI TEXT FEHLER:", err);
    res.status(500).json({ error: "Serverfehler" });
  }
});

app.listen(PORT, () => {
  console.log(`Server läuft auf http://127.0.0.1:${PORT}`);
});