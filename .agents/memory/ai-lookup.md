---
name: Term lookup engine
description: How the moderator term-autofill works (free offline engine) and where it's wired
---
Engine: `client/src/data/termLookup.ts` exports `lookupLocalTerm(term)`.
- Pure client-side morphological decomposition (roots/prefixes/suffixes). No network, no API key, no billing.
- Return shape: { meaning, type, casualMeaning, system, example, definition, matched: 'exact'|'composed'|'none' }.
- `tokenizeRoots` requires FULL-coverage tokenization and >=2 parts, so garbage input (e.g. zzcardi, antiinflammatory) returns matched:'none' instead of false positives. Includes vowel-dropped root stems (e.g. fixes pericarditis).
- Called from `ModeratorDashboard.tsx` (handleAiLookup) in the New Term modal.

**Why:** Hard requirement — EVERYTHING must be free, no paid API keys / no billing. The previous Gemini-via-Firebase `/api/lookup-term` proxy (vite middleware + express route) was fully removed, `@google/genai` uninstalled, and server/index.ts + vite.config.ts cleaned to a plain static SPA setup.
**How to apply:** Do NOT reintroduce paid external AI. Extend the offline engine's root/prefix/suffix tables instead.
