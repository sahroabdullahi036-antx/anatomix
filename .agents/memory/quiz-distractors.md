---
name: Quiz/game distractor correctness
description: Why answer choices must be deduped by meaning, and why game win-conditions must be data-driven
---

# Distractors must be distinct by meaning

The term dataset has many terms that share an IDENTICAL `meaning` string (~42 collisions:
"inflammation" appears 11x, "condition" 8x, "heart"/"kidney"/"without" 4x, etc.), and several
share `casualMeaning`.

**Rule:** When building answer choices for any quiz/game, select distractors with
`distinctByKey(pool, keyOf, excludeValue)` (in `games/shared.tsx`) so no distractor's key
equals another's OR the correct answer's. Use `t => t.meaning` for meaning-based modes
(PracticeTest, MultipleChoice, IschemicCountdown) and `t => t.casualMeaning` for TextbookDefender.

**Why:** Without dedupe, two visually-identical choices appear but scoring compares by `id`
(or exact-string), so the user's correct pick is marked wrong. This was the root cause of the
"all tests are wrong" report. Dropping below 4 choices in a tiny pool is acceptable; duplicate
answers are not.

# Game win-conditions must be data-driven, not hardcoded counts

- TextbookDefender: win = all wrong invaders destroyed = `invaders.length - 1`, NOT a hardcoded 2
  (distractor count can be <2 in small pools). Guard `invaders.length < 2` with GameEmpty.
- MemoryMatch: deck size can be smaller than `PAIR_COUNT`; track the ACTUAL pair count in state
  and finish on `>= pairCount`, not `=== PAIR_COUNT`.

# Empty pools

Quiz/game components must render `GameEmpty` (friendly state) when `current`/pool is unavailable,
never `return null` (blank screen) — that was why "some games don't appear".
