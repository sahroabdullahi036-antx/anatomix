---
name: Chapter unlock model
description: How AnatomiX gates chapter access — driven by passing chapter TESTS, not flashcards
---

# Chapter unlock = pass the chapter TEST, not flashcards

A student unlocks the next chapter ONLY by passing that chapter's single-chapter
Practice Test at >= 70% (`CHAPTER_TEST_PASS_PCT`). Getting flashcards right does
NOT unlock anything.

**Why:** explicit user requirement — flashcard mastery must never gate progression;
only a test pass proves the chapter and opens the next one.

**How to apply:**
- `computeAccessibleChapters(passedChapters, clearedIds, modUnlocked)` in
  `client/src/lib/chapterAccess.ts`: the first chapter in CHAPTERS order is always
  open; chapter at position i+1 opens only when the chapter at position i has its
  `.num` in `passedChapters`. Plus moderator-unlocked chapters and any
  already-started chapter (has a cleared term) stay accessible.
- Progression follows CHAPTERS *array order* (not raw numeric order) because
  `applyChapterOrder()` reorders CHAPTERS in place to the moderator's chosen
  learning sequence — that order IS the intended progression.
- `passedChapters` lives on the user doc (Firestore `FirestoreUserProgress`,
  persisted by `syncUserToFirestore`) and UserContext; append idempotently via
  `recordChapterPass(num)`.
- PracticeTest records a pass via a `useEffect` only when
  `finished && passed && chapterFilter > 0` (never for the all-chapters pool,
  `chapterFilter === 0`).
- IMPORTANT loophole guard: a single-chapter test (`chapterFilter > 0`) must use
  ONLY that chapter's terms — never widen the question pool to the accessible
  union. Widening would let a chapter be "passed" on mixed questions. The
  all-chapters option (`chapterFilter === 0`) is the only one that mixes.
- Games stay gated on the started set (`useUnlockedChapters` in games/shared.tsx),
  a subset of accessible — intentional, games need studied terms.
