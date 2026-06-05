---
name: AI term lookup
description: How the Chabner AI autofill works and where it's wired
---
Endpoint: POST /api/lookup-term
- Dev: vite.config.ts `vitePluginLookupTerm()` middleware
- Prod: server/index.ts express route
- Uses VITE_FIREBASE_API_KEY with generativelanguage.googleapis.com Gemini 2.0 Flash
- Prompt instructs returning raw JSON (no fences): meaning, type, casualMeaning, system, example, definition
- Called from ModeratorDashboard.tsx handleAiLookup() — "✦ Chabner" button in New Term modal

**Why:** Static Vite SPA needs a server-side proxy to keep the API key secret and call Google's API.
**How to apply:** Any new AI feature should extend the same /api/lookup-term endpoint or add a parallel route in both vite.config.ts and server/index.ts.
