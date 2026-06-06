# AnatomiX - Build Spec

This is an exact implementation brief. Build every section. Do not redesign existing
systems. Reuse existing patterns. When a detail is not specified, match the closest
existing code in the same folder.

---

## 0. GLOBAL CONSTRAINTS (apply to EVERY section, non-negotiable)

1. Style: cartoon soft game look, rounded corners, playful but clean. Match the
   existing dark UI in `client/src/pages/v2`.
2. Never use white or off-white as a background or surface fill. Backgrounds stay on
   the existing dark surfaces (for example `#252830`, `rgba(0,0,0,0.3)`). Text may use
   the existing light token already in the codebase (`#fcfaf7`). Do not introduce any
   new white or near-white panel, card, or modal.
3. No emojis anywhere in the UI or in any copy.
4. No em dashes and no en dashes anywhere in UI text, labels, or copy. Use a plain
   hyphen, a comma, or a colon instead.
5. Everything must be free. No paid APIs, no paid third-party services, no paid asset
   libraries. Persistence is the existing Firebase or Firestore setup only. Any sound
   must be royalty-free or generated locally with the Web Audio API.
6. Palette filter rule: the whole app is wrapped in a single CSS hue-rotate palette
   filter (see `client/src/App.tsx`). Any element that must display a literal color
   (logos, palette swatches, brand colors) MUST apply `inverseFilter` from
   `usePalette()`. Any new colored surface that should follow the palette must be
   authored on the blue base hue (about hue 216, base accent `#4a6080`) so the filter
   recolors it consistently across all palettes.
7. Firestore timing rule: gate every Firestore read on the `ready` flag (anonymous
   auth). Reads issued before auth is ready fail silently and fall back to defaults.
8. Reuse the existing Firestore helpers and collections (for example
   `subscribeToClasses`, `syncUserToFirestore`, `subscribeToUser`, the `users`,
   `classes`, `config`, `chatChannels` collections). Do not create a parallel
   persistence layer.
9. Game scores are stored in `UserData.gameScores`, keyed by the last segment of the
   game route path, and `updateScore(key, score)` keeps the maximum. Follow this for
   any new score writes.
10. Add a unique `data-testid` to every interactive element (buttons, inputs, links)
    and every element that displays meaningful dynamic data.
11. After all work: run `npx tsc --noEmit`. It must pass with zero errors. Restart the
    `Start application` workflow and confirm no runtime or console errors.

### Reference: current user model (`client/src/contexts/UserContext.tsx`, `UserData`)
Existing fields you will read or extend: `username`, `decks`, `criticalReview`,
`srsDeck`, `gameScores` (Record<string, number>), `clearedTermIds`, `studyStreak`,
`lastStudyDate`, `dailyChallengeDate`, `dailyChallengeTermIds`, `earnedAchievements`,
`studiedCount`, `classIds` (string[]).
`studyStreak` and `lastStudyDate` already exist and are maintained by `calcStreak`.
`ACHIEVEMENTS` is a `Record<string, {label, description}>`.

When you add a new field to `UserData`, also:
- add a default value in BOTH places that build a user object (the loader spread and
  the fresh-user factory),
- ensure it is included in the Firestore sync so it persists.

---

## 1. Moderator announcement system

Goal: the moderator (`anatomixowner`) can broadcast a short message to one group, many
groups, or everyone. Targeted students see a dismissible banner on their dashboard.

### Data (Firestore)
- New collection `announcements`. Each doc:
  - `id` (doc id)
  - `text` (string, the message)
  - `tag` (string, one of: `general`, `test`, `reminder`) default `general`
  - `classIds` (string[], target class ids; empty array means everyone)
  - `createdAt` (number, epoch ms)
  - `active` (boolean, default true)
- Add a subscribe helper following the same pattern as `subscribeToClasses`, for
  example `subscribeToAnnouncements(callback)` returning an unsubscribe function.
- Add a write helper, for example `createAnnouncement(data)` and
  `setAnnouncementActive(id, active)`.

### Moderator UI (`client/src/pages/v2/ModeratorDashboard.tsx`)
- Add a new tab or panel labeled "Announcements".
- Controls:
  - a multiline text input for the message,
  - a tag selector (General, Test, Reminder),
  - a target selector: a checkbox list of existing classes plus an "Everyone" option
    (Everyone means store `classIds: []`),
  - a "Broadcast" button (`data-testid="button-broadcast-announcement"`).
- Below the form, list existing announcements newest first, each with its tag, target
  summary, time, and a "Deactivate" button that sets `active=false`.

### Student UI (`client/src/pages/v2/Dashboard.tsx`)
- Subscribe to announcements (gated on `ready`).
- Show banners at the very top of the dashboard for every active announcement whose
  `classIds` is empty OR intersects the student's `user.classIds`.
- Banner: rounded, dark surface, left color accent by tag (test, reminder, general use
  three distinct shades on the blue base hue so the palette filter handles them; do not
  use red, use the existing warning shade only if it already exists). Show the tag label
  in small caps, the message text, and a dismiss button
  (`data-testid="button-dismiss-announcement-{id}"`).
- Dismissal is per student and per announcement, stored in `localStorage` under a key
  like `anatomix_dismissed_announcements_{slugified-username}` (a JSON array of ids).
  Dismissed announcements do not reappear for that student.
- If multiple banners apply, stack them; cap visible at 3 and collapse the rest behind
  a "show more" toggle.

### Acceptance
- Moderator can broadcast to Everyone and to a specific class.
- Only targeted students see the banner. Dismiss persists across reloads.
- Deactivating an announcement removes it for all students.

---

## 2. Daily streak display and streak freeze

Goal: make the existing `studyStreak` visible and motivating, and add one "freeze" so a
single missed day does not reset the streak.

### Data (extend `UserData`)
- Add `streakFreezes` (number, default 1).
- Add `streakFrozenDate` (string, default "").
- Defaults added in both user-build sites and included in Firestore sync.

### Logic (`calcStreak` in `client/src/contexts/UserContext.tsx`)
- Current behavior: consecutive day keeps streak, gap resets to 1.
- New behavior: when the gap is exactly one missed day AND `streakFreezes > 0` AND that
  day was not already frozen, consume one freeze (`streakFreezes -= 1`), set
  `streakFrozenDate` to that missed day, and preserve the streak instead of resetting.
- A gap of two or more missed days still resets to 1 regardless of freezes.
- Do not change any other part of the streak calculation.

### UI (`client/src/pages/v2/Dashboard.tsx`)
- Add a streak indicator in the top "today" area: a flame-style meter (CSS only, no
  image, no emoji) showing the current `studyStreak` number and the count of remaining
  freezes (`data-testid="text-streak-count"`, `data-testid="text-streak-freezes"`).
- When a freeze was just used, show a small one-time note: "Streak saved by a freeze".

### Acceptance
- Streak number is visible on the dashboard.
- Missing exactly one day with a freeze available keeps the streak and decrements
  freezes by 1. Missing two days resets to 1.

---

## 3. XP and levels

Goal: every meaningful action grants XP. XP maps to a level with a soft level-up moment.

### Data (extend `UserData`)
- Add `xp` (number, default 0). Level is derived from xp, not stored.
- Default added in both build sites and included in sync.

### Level formula (put in a single shared helper, for example in UserContext)
- `levelFromXp(xp)` returns `Math.floor(Math.sqrt(xp / 50)) + 1`.
- `xpForLevel(level)` returns `50 * (level - 1) * (level - 1)` (inverse, used for the
  progress bar bounds).
- Expose a `addXp(amount)` action on the user context that increments `xp` and persists.

### XP awards (wire `addXp` at these existing events; do not invent new flows)
- Clear a term: +5 each.
- Finish any game round (the same place `updateScore` is called): +10, plus +1 per
  correct answer if that count is available locally.
- Complete the daily challenge: +25.
- Earn an achievement: +50.

### UI (`client/src/pages/v2/Dashboard.tsx`)
- Add a level badge and an XP progress bar in the top area
  (`data-testid="text-level"`, `data-testid="bar-xp"`). The bar fills from the current
  level threshold to the next.
- On level-up (detected when `levelFromXp` increases after an `addXp`), show a brief
  non-blocking celebration (CSS animation, see section 8). No emoji, no white flash.

### Acceptance
- Clearing terms and finishing games increases XP and, at thresholds, the level.
- The XP bar reflects progress toward the next level. Values persist across reloads.

---

## 4. Daily quests

Goal: three small daily goals that reset each day and grant XP on completion.

### Data (extend `UserData`)
- Add `questDate` (string, the day the current quests belong to, default "").
- Add `questProgress` (Record<string, number>, default {}).
- Add `questClaimed` (string[], quest ids already rewarded today, default []).
- Defaults in both build sites and included in sync.

### Quest definitions (static array in code, not in Firestore)
Three fixed quests, ids stable:
- `q_clear10`: "Clear 10 terms today", target 10, reward 30 xp.
- `q_play2`: "Play 2 games today", target 2, reward 30 xp.
- `q_beatbest`: "Beat one game best score", target 1, reward 40 xp.

### Logic (UserContext)
- On any user update, if `questDate` is not today, reset: set `questDate` to today,
  clear `questProgress` and `questClaimed`.
- Increment progress at the existing events:
  - term cleared increments `q_clear10`,
  - game finished increments `q_play2`,
  - when `updateScore` actually raises a stored best, increment `q_beatbest`.
- When a quest reaches its target and is not yet in `questClaimed`, call `addXp(reward)`
  and add its id to `questClaimed`.

### UI (`client/src/pages/v2/Dashboard.tsx`)
- A "Daily Quests" card listing the three quests with a small progress bar each and a
  done state when claimed (`data-testid="quest-{id}"`). No emoji.

### Acceptance
- Quests reset at the start of a new day.
- Reaching a target grants the XP exactly once per day and shows the done state.

---

## 5. Class leaderboard (weekly)

Goal: per-class ranking that resets weekly so newcomers can compete.

### Approach (no new heavy writes)
- Reuse existing per-user Firestore progress already synced by `syncUserToFirestore`.
- Add a weekly counter on `UserData`: `weeklyTerms` (number, default 0) and
  `weeklyTermsWeek` (string, ISO week key like `2026-W23`, default "").
  - On term clear, if `weeklyTermsWeek` is the current ISO week, increment
    `weeklyTerms`; otherwise set the week key and reset `weeklyTerms` to that clear.
  - Include both fields in sync. Add defaults in both build sites.

### UI (new section, place on `client/src/pages/v2/Dashboard.tsx` or a new
`client/src/pages/v2/Leaderboard.tsx` linked from a dashboard tile)
- For the current student, read all users in the same class via the existing class and
  user subscriptions (gated on `ready`).
- Rank classmates by `weeklyTerms` descending for the current ISO week. Show rank,
  username, and weekly terms (`data-testid="row-leader-{username}"`). Highlight the
  current user's row using a blue-base-hue accent.
- If the student is in multiple classes, add a small class selector at the top.

### Acceptance
- Leaderboard shows only classmates, ranked by this week's cleared terms.
- Counts reset when the ISO week changes.

---

## 6. Class shared goal bar

Goal: a single shared progress bar per class, for example "Cleared 500 terms this week
as a class".

### Data
- Reuse `weeklyTerms` from section 5. The class total is the sum of `weeklyTerms` across
  all `memberUsernames` for the current ISO week.
- Store the per-class target in the class document: add `weeklyGoal` (number, default
  500) to the class model, editable by the moderator in the Classes panel of
  `ModeratorDashboard.tsx` (`data-testid="input-class-goal-{classId}"`).

### UI (`client/src/pages/v2/Dashboard.tsx`)
- Show a goal bar for the student's primary class: current class total vs `weeklyGoal`,
  with a label like "Class goal: 320 of 500 terms this week"
  (`data-testid="bar-class-goal"`). Blue-base-hue fill.

### Acceptance
- The bar reflects the live sum of classmates' weekly terms against the class goal.
- Moderator can change the goal and it updates for students.

---

## 7. Game power-ups (50/50, hint, freeze)

Goal: optional in-game helpers that add depth, spent from an XP-based balance.

### Data (extend `UserData`)
- Add `powerups` (Record<string, number>, default `{ fifty: 1, hint: 1, freeze: 1 }`).
- Defaults in both build sites and included in sync.
- Add a context action `spendPowerup(kind)` that decrements if available and returns a
  boolean for success.
- Optional earn rule: every level-up (section 3) grants `+1` to each power-up.

### Behavior (apply to the multiple choice and timed games where it fits)
- `fifty`: in a multiple choice game, remove two wrong options. Only enabled when the
  current question has at least three options.
- `hint`: reveal the first letter of the answer, or the meaning, depending on the game.
- `freeze`: in a timed game, pause the timer for 10 seconds.
- Each power-up shows as a small button row above the question
  (`data-testid="button-powerup-{kind}"`), disabled and greyed when the count is 0 or
  not applicable. Spending calls `spendPowerup` and applies the effect immediately.

### Files
- Multiple Choice game: `client/src/pages/v2/games/MultipleChoice.tsx`.
- Timed games: apply `freeze` in `client/src/pages/v2/games/IschemicCountdown.tsx`.
- Keep effects local to each game; do not refactor the game engines.

### Acceptance
- Each power-up works in at least one game, decrements the balance, and disables when
  the balance is 0 or not applicable.

---

## 8. Sound effects and micro-animations

Goal: tactile feedback. Free only.

### Sound (Web Audio API, no asset downloads, no paid libs)
- Create one small helper `client/src/lib/sound.ts` exposing `playSound(name)` for
  `correct`, `wrong`, `levelup`, `click`. Generate short tones with an
  `AudioContext` oscillator. No external files.
- Add a global mute toggle persisted in `localStorage` under
  `anatomix_sound_enabled` (default enabled). Expose a small speaker toggle in the
  dashboard header (`data-testid="button-toggle-sound"`). No emoji; use a `lucide-react`
  icon. Respect the mute flag in `playSound`.

### Animations (CSS only)
- Correct answer: brief green-tinted pulse on the answer element (use the existing
  success shade if present; otherwise a blue-base-hue pulse). Wrong answer: short shake.
- Card flip on Memory Match already may exist; if not, add a CSS flip.
- Level-up: a brief scale-and-fade celebration overlay (no white flash, no emoji,
  no confetti images; use small CSS shapes on the blue base hue).
- Keep all animations under 600 ms and non-blocking. Respect
  `prefers-reduced-motion: reduce` by disabling non-essential motion.

### Acceptance
- Correct, wrong, and level-up have both a sound and an animation.
- Mute toggle silences all sounds and persists across reloads.
- Reduced-motion users get a calm experience.

---

## 9. Button anatomy page (wire the existing orphaned page)

Goal: restore a clickable button-based anatomy explorer alongside the existing visual
Body Explorer. Do not delete the visual page.

### Choose ONE source page
- Preferred: `client/src/pages/v2/SystemExplorer.tsx` (button drill-down that uses the
  shared `SYSTEMS` data from `@/data/medicalData`, so it stays in sync).
- Alternative: `client/src/pages/Anatomy.tsx` (older colorful button grid, uses its own
  hardcoded `ANATOMY_HIERARCHY`).
Use `SystemExplorer.tsx` unless instructed otherwise.

### Edits
1. `client/src/App.tsx`: add the import and a route.
   - Import the chosen page.
   - Add `<Route path="/anatomy" component={SystemExplorer} />` (or the chosen
     component) next to the other routes.
2. `client/src/pages/v2/Dashboard.tsx`: add a new tile to the `MODULES` array.
   - `{ path: "/anatomy", title: "Anatomy Explorer", color: TILE, tag: "" }`.
   - Use the existing `TILE` constant so it matches every other tile. Do not give it a
     custom color (only Multiplayer uses `MP_TILE`).
3. Verify the chosen page renders inside the global palette filter and uses dark
   surfaces only. If it uses any white or off-white fill, recolor to the existing dark
   surfaces. If it shows literal swatch colors, apply `inverseFilter`.

### Acceptance
- A new "Anatomy Explorer" tile appears on the dashboard and routes to `/anatomy`.
- The page renders with no white surfaces, no emoji, and follows the palette.
- The existing visual "Body Explorer" still works.

---

## 10. Final verification checklist (run all)
- `npx tsc --noEmit` passes with zero errors.
- Restart the `Start application` workflow; no runtime or console errors.
- No white or off-white backgrounds were introduced anywhere.
- No emojis and no em or en dashes in any new copy.
- All new Firestore reads are gated on `ready`.
- All new interactive and dynamic elements have `data-testid`.
- New `UserData` fields have defaults in both user-build sites and are persisted in sync.
