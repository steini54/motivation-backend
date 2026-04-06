// ==============================
// KI FOTO (ECHTES FILE EDIT)
// ==============================
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fetch = require("node-fetch");
const multer = require("multer");
const FormData = require("form-data");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Speicher im RAM
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(bodyParser.json());

// Test
app.get("/", (req, res) => {
  res.send("Backend läuft ✅");
});

// ==============================
// KI FOTO (ECHTES FILE EDIT)
// ==============================
app.post("/generate-ai-photo", upload.single("photo"), async (req, res) => {
  console.log("=== KI FOTO REQUEST (FILE) ===");

  try {
    if (!req.file) {
      return res.status(400).json({ error: "Kein Bild erhalten" });
    }

    const formData = new FormData();

    formData.append("model", "gpt-image-1");

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

    formData.append("size", "1024x1536");

    formData.append("image", req.file.buffer, {
      filename: "upload.png",
      contentType: req.file.mimetype
    });

    const response = await fetch("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: formData
    });

    const data = await response.json();

    console.log("OpenAI Antwort:", data);

    const generatedImage = data?.data?.[0]?.b64_json;

    if (!generatedImage) {
      return res.status(500).json({
        error: "Kein Bild erhalten",
        details: data
      });
    }

    res.json({
      aiFoto: `data:image/png;base64,${generatedImage}`
    });

  } catch (err) {
    console.error("SERVER FEHLER:", err);
    res.status(500).json({ error: "KI Fehler" });
  }
});

// ==============================
// KI TEXT GENERIERUNG
// ==============================
app.post("/generate-text", async (req, res) => {
  console.log("=== KI TEXT REQUEST ===");

  try {
    const { stichpunkte, funktion } = req.body;

    if (!stichpunkte || !funktion) {
      return res.status(400).json({ error: "Fehlende Daten" });
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        messages: [
          {
            role: "system",
            content: "Du bist ein Experte für professionelle Bewerbungsschreiben."
          },
          {
            role: "user",
            content: `
Erstelle aus folgenden Stichpunkten einen professionellen Fließtext für eine Bewerbung.

Funktion: ${funktion}

Stichpunkte:
${stichpunkte}

Regeln:
- professionell
- klar
- überzeugend
- keine Aufzählung
- max. 5-7 Sätze
`
          }
        ],
        temperature: 0.7
      })
    });

    const data = await response.json();

    const text = data?.choices?.[0]?.message?.content;

    if (!text) {
      return res.status(500).json({ error: "Kein Text generiert", details: data });
    }

    res.json({ text });

  } catch (err) {
    console.error("TEXT SERVER FEHLER:", err);
    res.status(500).json({ error: "Serverfehler" });
  }
});

// ==============================

app.listen(PORT, () => {
  console.log(`Server läuft auf http://127.0.0.1:${PORT}`);
});

