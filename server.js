// require("dotenv").config();
// const express = require("express");
// const bodyParser = require("body-parser");
// const cors = require("cors");
// const multer = require("multer");
// const FormData = require("form-data"); // Needed for OpenAI image edit
// const fetch = require("node-fetch");    // Needed for both OpenAI APIs
// const path = require("path");

// // Google AI Studio (Gemini API) SDK - ONLY for KI TEXT part
// const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require("@google/generative-ai");

// const app = express();
// const PORT = process.env.PORT || 3000;

// // Multer for file uploads (stores in RAM)
// const upload = multer({ storage: multer.memoryStorage() });

// app.use(cors());
// app.use(bodyParser.json());

// // Initialize Google Generative AI for TEXT generation
// // Ensure GOOGLE_API_KEY is set in your .env file
// const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "YOUR_GOOGLE_API_KEY_HERE"); // Use process.env.GOOGLE_API_KEY

// // Serve frontend static files
// app.use(express.static(path.join(__dirname, "frontend")));

// // Root → redirect to form
// app.get("/", (req, res) => {
//   res.redirect("/formular.html");
// });

// // ==============================
// // KI FOTO (Using OpenAI API for REAL FILE EDITING)
// // ==============================
// app.post("/generate-ai-photo", upload.single("photo"), async (req, res) => {
//   console.log("=== KI FOTO REQUEST (OpenAI Image Edit) ===");

//   try {
//     if (!req.file) {
//       return res.status(400).json({ error: "Kein Bild erhalten" });
//     }

//     const formData = new FormData();
//     formData.append("model", "gpt-image-1"); // DALL-E-2 is good for image edits

//     // --- YOUR ORIGINAL PROMPT FOR BACKGROUND EDITING ---
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

// If you cannot guarantee this:
// → return the original image unchanged.
// `);
//     formData.append("size", "1024x1024"); // DALL-E-2 edit sizes are 256x256, 512x512, or 1024x1024
//     // Note: DALL-E-2 images/edits are typically square. Your original image might be cropped.

//     // OpenAI's image edit endpoint also allows an optional `mask` parameter
//     // if you want to explicitly define the area to be changed.
//     // Without a mask, DALL-E-2 will try to infer the background.

//     formData.append("image", req.file.buffer, {
//       filename: "upload.png", // Filename is important for FormData
//       contentType: req.file.mimetype // Mimetype is important
//     });

//     // Ensure your OPENAI_API_KEY is set in your .env file
//     if (!process.env.OPENAI_API_KEY) {
//       console.error("OPENAI_API_KEY is not set in .env file.");
//       return res.status(500).json({ error: "OpenAI API Key fehlt." });
//     }

//     const response = await fetch("https://api.openai.com/v1/images/edits", {
//       method: "POST",
//       headers: {
//         "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
//         // Do NOT set Content-Type header for FormData, node-fetch sets it automatically with boundary
//       },
//       body: formData
//     });

//     const data = await response.json();

//     console.log("OpenAI Image Edit Response:", data);

//     // Check if OpenAI returned an error
//     if (data.error) {
//         console.error("OpenAI API Error:", data.error);
//         return res.status(data.error.status || 500).json({
//             error: data.error.message || "Fehler von OpenAI API",
//             details: data.error
//         });
//     }

//     const generatedImageB64 = data?.data?.[0]?.b64_json;

//     if (!generatedImageB64) {
//       return res.status(500).json({
//         error: "Kein Bild von OpenAI erhalten.",
//         details: data
//       });
//     }

//     // Send the Base64 image back to the frontend
//     res.json({
//       aiFoto: `data:image/png;base64,${generatedImageB64}`,
//       message: "Bild erfolgreich mit OpenAI bearbeitet."
//     });

//   } catch (err) {
//     console.error("SERVER FEHLER (OpenAI Image Edit):", err);
//     res.status(500).json({ error: "KI Foto Fehler (Server Intern)" });
//   }
// });

// // ==============================
// // KI TEXT GENERATION (Using Google Generative AI - Gemini Pro)
// // ==============================
// app.post("/generate-text", async (req, res) => {
//   console.log("=== KI TEXT REQUEST (Google Gemini Pro) ===");

//   try {
//     const { stichpunkte, funktion } = req.body;

//     if (!stichpunkte || !funktion) {
//       return res.status(400).json({ error: "Fehlende Daten für Textgenerierung" });
//     }

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

//     // Ensure GOOGLE_API_KEY is set
//     if (!process.env.GOOGLE_API_KEY) {
//         console.error("GOOGLE_API_KEY is not set in .env file.");
//         return res.status(500).json({ error: "Google API Key fehlt." });
//     }

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
//       return res.status(500).json({ error: "Kein Text von Google AI Studio generiert", details: response });
//     }

//     res.json({ text: generatedText });

//   } catch (err) {
//     console.error("SERVER FEHLER (Google Gemini Pro Text):", err);
//     res.status(500).json({ error: "KI Text Fehler (Server Intern)" });
//   }
// });

// app.listen(PORT, () => {
//   console.log(`Server läuft auf http://127.0.0.1:${PORT}`);
// });
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const multer = require("multer");
const FormData = require("form-data");
const fetch = require("node-fetch");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Multer for file uploads (stores in RAM)
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
// KI FOTO (Using OpenAI API for REAL FILE EDITING)
// ==============================
app.post("/generate-ai-photo", upload.single("photo"), async (req, res) => {
  console.log("=== KI FOTO REQUEST (OpenAI Image Edit) ===");

  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image received" });
    }

    const formData = new FormData();
    formData.append("model", "dall-e-2"); // DALL-E-2 is currently used for image edits
    
    // Original prompt for background editing
    formData.append("prompt", `
Edit ONLY the background of this image.
STRICT RULES:
- Do NOT modify the face
- Do NOT modify the person
- Do NOT change body, pose, or proportions
- Do NOT crop or zoom
The person must remain EXACTLY the same.
ONLY:
- Replace or blur the background (neutral white or soft office)
- Improve lighting VERY subtly without touching facial details
If you cannot guarantee this:
→ return the original image unchanged.
`);
    formData.append("size", "1024x1024"); 

    formData.append("image", req.file.buffer, {
      filename: "upload.png",
      contentType: req.file.mimetype
    });

    if (!process.env.OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY is not set in .env file.");
      return res.status(500).json({ error: "OpenAI API Key is missing." });
    }

    const response = await fetch("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: formData
    });

    const data = await response.json();

    console.log("OpenAI Image Edit Response:", data);

    if (data.error) {
        console.error("OpenAI API Error:", data.error);
        return res.status(data.error.status || 500).json({
            error: data.error.message || "Error from OpenAI API",
            details: data.error
        });
    }

    // For image edits, OpenAI typically returns a URL or base64 (if response_format is b64_json)
    const generatedImageURL = data?.data?.[0]?.url; // If response_format is not specified, it defaults to url

    if (!generatedImageURL) {
      return res.status(500).json({
        error: "No image URL received from OpenAI.",
        details: data
      });
    }

    // Send the image URL back to the frontend
    res.json({
      aiFoto: generatedImageURL, // Frontend will need to handle a URL
      message: "Image successfully edited with OpenAI."
    });

  } catch (err) {
    console.error("SERVER ERROR (OpenAI Image Edit):", err);
    res.status(500).json({ error: "AI Photo Error (Internal Server)" });
  }
});

// ==============================
// KI TEXT GENERATION (Using OpenAI Chat Completions API)
// ==============================
app.post("/generate-text", async (req, res) => {
  console.log("=== KI TEXT REQUEST (OpenAI Chat Completions) ===");

  try {
    const { stichpunkte, funktion } = req.body;

    if (!stichpunkte || !funktion) {
      return res.status(400).json({ error: "Missing data for text generation" });
    }

    const openaiTextModel = "gpt-3.5-turbo"; // You can use "gpt-4" if you have access

    const prompt = `You are an expert in professional application letters. Create a professional flowing text for an application based on the following bullet points.

Function: ${funktion}

Bullet points:
${stichpunkte}

Rules:
- professional
- clear
- convincing
- no bullet points
- max. 5-7 sentences`;

    if (!process.env.OPENAI_API_KEY) {
        console.error("OPENAI_API_KEY is not set in .env file.");
        return res.status(500).json({ error: "OpenAI API Key is missing." });
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: openaiTextModel,
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 150, // Roughly corresponds to 5-7 sentences
      })
    });

    const data = await response.json();

    console.log("OpenAI Text Generation Response:", data);

    if (data.error) {
        console.error("OpenAI API Error:", data.error);
        return res.status(data.error.status || 500).json({
            error: data.error.message || "Error from OpenAI API",
            details: data.error
        });
    }

    const generatedText = data?.choices?.[0]?.message?.content;

    if (!generatedText) {
      return res.status(500).json({ error: "No text generated by OpenAI.", details: data });
    }

    res.json({ text: generatedText });

  } catch (err) {
    console.error("SERVER ERROR (OpenAI Chat Completions Text):", err);
    res.status(500).json({ error: "AI Text Error (Internal Server)" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://127.0.0.1:${PORT}`);
});