import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Replit AI Integrations: Gemini access without a user-supplied API key.
// Credentials are injected by Replit and stay server-side (never shipped to the browser).
const ai = new GoogleGenAI({
  apiKey: process.env.AI_INTEGRATIONS_GEMINI_API_KEY,
  httpOptions: {
    apiVersion: "",
    baseUrl: process.env.AI_INTEGRATIONS_GEMINI_BASE_URL,
  },
});

async function startServer() {
  const app = express();
  const server = createServer(app);

  app.use(express.json());

  app.post("/api/lookup-term", async (req, res) => {
    try {
      const { term } = req.body as { term: string };
      if (!term || typeof term !== "string") {
        return res.status(400).json({ error: "A term is required." });
      }

      const prompt = `You are an expert on the medical terminology in "The Language of Medicine" 11th edition. For the medical term or word part "${term}", return ONLY a raw JSON object with no markdown, no code fences, no extra text. Fields: meaning (1-2 word exact textbook-style definition), type (one of: prefix/suffix/root/condition/procedure/word), casualMeaning (informal 4-7 word plain-English meaning), system (one of: General/Cardiovascular/Respiratory/Digestive/Nervous/Musculoskeletal/Urinary/Endocrine/Integumentary/Blood/Reproductive/Lymphatic/Special Senses), example (2-3 clinical example words with short parenthetical meanings comma-separated), definition (1-2 sentences in standard medical textbook style).`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          temperature: 0.1,
          maxOutputTokens: 600,
          responseMimeType: "application/json",
        },
      });

      const text = response.text ?? "{}";
      const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      res.json(JSON.parse(cleaned));
    } catch (e) {
      console.error("lookup-term error:", e);
      res.status(500).json({ error: String(e) });
    }
  });

  // Serve static files from dist/public in production
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));

  // Handle client-side routing - serve index.html for all routes
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 3000;

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
