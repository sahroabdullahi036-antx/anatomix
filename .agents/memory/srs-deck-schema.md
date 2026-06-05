---
name: SRS deck schema
description: Spaced repetition system data model and interval logic in AnatomiX
---

`SRSEntry` interface (UserContext.tsx):
- `termId: string`
- `interval: number` (days until next review)
- `nextReview: number` (Unix ms timestamp)
- `totalReviews: number`

Stored as `srsDeck: Record<string, SRSEntry>` on `UserData`, persisted to localStorage.

**Interval logic in `updateSRS(termId, quality)`:**
- `"wrong"` → interval = 1
- `"hard"` → interval unchanged (same as current)
- `"easy"` → interval = min(interval * 2, 90)
- First entry defaults to interval = 1 if not existing

**Integration points:**
- Study tab `handleCorrect` calls `updateSRS(id, "easy")`, `handleMiss` calls `updateSRS(id, "wrong")` — terms populate the deck automatically as students study
- SRS tab in FlashcardsHub shows due terms (nextReview <= now), sorted oldest first, with Wrong/Hard/Easy buttons after flipping
- `srsDueTerms` memo derived from `user.srsDeck` in FlashcardsHub

**Why:** SM-2-inspired but simplified. No efactor. Wrong always resets to 1 day; easy doubles (cap 90). Populates passively from regular study, no separate enrollment step needed.
