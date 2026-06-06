import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig, type Plugin, type ViteDevServer } from "vite";
import { GoogleGenAI } from "@google/genai";

// Replit AI Integrations: Gemini access without a user-supplied API key.
// Credentials are injected by Replit and stay server-side (never shipped to the browser).
const ai = new GoogleGenAI({
  apiKey: process.env.AI_INTEGRATIONS_GEMINI_API_KEY,
  httpOptions: {
    apiVersion: "",
    baseUrl: process.env.AI_INTEGRATIONS_GEMINI_BASE_URL,
  },
});

function vitePluginLookupTerm(): Plugin {
  return {
    name: "lookup-term",
    configureServer(server: ViteDevServer) {
      server.middlewares.use("/api/lookup-term", async (req, res) => {
        if (req.method !== "POST") { res.writeHead(405); res.end(); return; }
        let body = "";
        req.on("data", (c) => { body += c.toString(); });
        req.on("end", async () => {
          try {
            const { term } = JSON.parse(body);
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
            const parsed = JSON.parse(cleaned);
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(parsed));
          } catch (e) {
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: String(e) }));
          }
        });
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), vitePluginLookupTerm()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  envDir: path.resolve(import.meta.dirname),
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    port: 5000,
    strictPort: true,
    host: "0.0.0.0",
    allowedHosts: true,
    fs: {
      strict: false,
    },
  },
});
