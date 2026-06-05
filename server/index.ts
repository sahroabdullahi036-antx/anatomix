import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = createServer(app);

  app.use(express.json());

  app.post("/api/lookup-term", async (req, res) => {
    try {
      const { term } = req.body as { term: string };
      const apiKey = process.env.VITE_FIREBASE_API_KEY;
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
      const r = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `You are an expert on Chabner's "The Language of Medicine" 11th edition. For the medical term or word part "${term}", return ONLY a raw JSON object with no markdown, no code fences, no extra text. Fields: meaning (1-2 word exact Chabner-style definition), type (one of: prefix/suffix/root/condition/procedure/word), casualMeaning (informal 4-7 word plain-English meaning), system (one of: General/Cardiovascular/Respiratory/Digestive/Nervous/Musculoskeletal/Urinary/Endocrine/Integumentary/Blood/Reproductive/Lymphatic/Special Senses), example (2-3 clinical example words with short parenthetical meanings comma-separated), definition (1-2 sentences in Chabner textbook style).` }] }],
          generationConfig: { temperature: 0.1, maxOutputTokens: 600 }
        })
      });
      const data = await r.json() as any;
      const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
      const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      res.json(JSON.parse(cleaned));
    } catch (e) {
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
