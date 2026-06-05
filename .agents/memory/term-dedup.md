---
name: Term deduplication
description: How duplicate terms are handled in ALL_TERMS
---
- dedupeTerms() runs after sortTerms() at module init in medicalData.ts
- Key: t.term.replace(/^[^a-zA-Z]*/, '').toLowerCase()
- When two terms share a key: ct_* (custom) wins; base term is removed
- addCustomTerms() and applyTermOverrides() call sortTerms() but NOT dedupeTerms (only runs at init)

**Why:** Owner may add a custom term that overlaps with a base term; custom version should always win.
**How to apply:** If adding terms programmatically post-init, manually remove the base duplicate or call dedupeTerms() again.
