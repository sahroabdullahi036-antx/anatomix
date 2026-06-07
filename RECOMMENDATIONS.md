# AnatomiX - Recommendations and Direction

## STATUS AND RULES (read first)

- This is a list of recommendations and context only. Nothing here is approved.
- Do not implement anything in this file unless the user explicitly approves it first.
- Approval is per item. Propose, wait for the user to say yes, then build that one item.
- The user wants the next bot to ADD MORE recommendations in this same style. Treat
  the list below as a starting point and extend it with new ideas.
- When you propose, keep it concrete enough for the user to judge, but do not start
  coding until approved.

---

## WHAT THE USER IS LOOKING FOR

The user wants ideas that make AnatomiX more enjoyable so that more students play more
and therefore study more. They are also interested in a way for the moderator to send
announcements to students in specific groups, for example about upcoming tests or which
week or chapter the class is on. The user wants a running list of recommendations they
can pick from, and wants more options proposed over time.

Already handled separately by the main agent (not part of this approval list): the
anatomy page has been switched back to a button based explorer.

---

## HARD PREFERENCES (every recommendation must respect these)

1. Style: cartoon soft game look, rounded, playful but clean. Match the existing dark
   UI in `client/src/pages/v2`. Design constants: bg #252830, text #fcfaf7, primary
   buttons #4a6080. Use inline styles, not Tailwind classes, in v2 pages.
2. Never use white or off-white as a background or surface fill. Backgrounds stay on the
   existing dark surfaces. Text may use the existing light token (#fcfaf7).
3. No emojis anywhere in the UI or in copy.
4. No em dashes and no en dashes anywhere. Use a hyphen, comma, or colon instead.
5. Everything must be free. No paid APIs or services or asset libraries. Persistence is
   the existing Firebase or Firestore only. Any sound must be free or generated locally
   (Web Audio API).
6. Respect the global palette filter: the whole app is wrapped in a CSS hue-rotate
   filter. Elements that must show a literal color use `inverseFilter` from
   `usePalette()`. New palette-following colors should be authored on the blue base hue
   (about hue 216) so they recolor consistently.
7. Gate every Firestore read on the `ready` flag (anonymous auth). Pattern:
   `if (!db || !ready) return;` with `[db, ready]` as deps.
8. Reuse existing Firestore helpers and collections. Do not build a parallel data layer.
9. No paid AI. The offline term lookup engine in `termLookup.ts` is the only lookup
   allowed. Do not reintroduce Gemini or any paid API.
10. UserData fields already in use: username, decks, criticalReview, srsDeck, gameScores,
    clearedTermIds, studyStreak, lastStudyDate, dailyChallengeDate, dailyChallengeTermIds,
    earnedAchievements, studiedCount, classIds, lastPath. Extend carefully and persist
    changes via the existing Firestore sync path (onSyncNeeded / useFirebaseSync).

---

## RECOMMENDATIONS (proposals, not approved)

Each item lists the idea, why it helps, and a short note on how it could work. Detail is
for evaluation only. Do not build until the user approves the specific item.

### R1. Moderator announcement system
Idea: the moderator broadcasts a short message to one group, several groups, or
everyone. Targeted students see a dismissible banner on their dashboard, tagged as
general, test, or reminder.
Why: directly answers the user's request and creates a reason to open the app daily.
How: a new `announcements` Firestore collection, a panel in the moderator dashboard to
write and target messages, and a banner on the student dashboard filtered by the
student's `classIds`, with per student dismissal stored in localStorage.

### R2. Daily streak display and streak freeze
Idea: make the existing study streak visible and add one freeze so a single missed day
does not reset it.
Why: visible streaks plus loss protection are one of the strongest return drivers.
How: surface `studyStreak` on the dashboard, extend the user model with a small freeze
count, and adjust the streak calculation so one missed day with a freeze available keeps
the streak.

### R3. XP and levels
Idea: every meaningful action grants XP, and XP maps to a level with a soft level up
moment.
Why: progress that always moves forward feels better than raw scores and keeps players
engaged across sessions.
How: add an `xp` field, derive level from XP with a simple curve, award XP on clearing
terms, finishing games, completing the daily challenge, and earning achievements, and
show a level badge with a progress bar.

### R4. Daily quests
Idea: three small daily goals that reset each day and grant XP, for example clear ten
terms, play two games, beat one best score.
Why: gives a clear, light daily to do list that nudges study sessions.
How: store the quest day and progress on the user, define three fixed quests in code,
increment progress on the existing events, and reward XP once per quest per day.

### R5. Class leaderboard, weekly
Idea: a per class ranking by terms cleared this week that resets weekly so newcomers can
still compete.
Why: friendly competition inside a class motivates without permanently discouraging
late starters.
How: add a weekly term counter keyed by ISO week to the user, then rank classmates for
the current week using the existing class and user data.

### R6. Class shared goal bar
Idea: a single shared progress bar per class, for example cleared a target number of
terms this week as a class.
Why: a shared goal builds group momentum and pairs naturally with announcements.
How: sum classmates' weekly term counts against a per class goal that the moderator can
set.

### R7. Game power-ups
Idea: optional in game helpers such as fifty fifty, hint, and freeze the timer, spent
from a small balance.
Why: adds depth and replay value to the existing games without new game engines.
How: store a small power-up balance on the user, add a button row in the relevant games,
and apply each effect locally.

### R8. Sound effects and micro-animations
Idea: short correct, wrong, and level up sounds plus light CSS animations, with a mute
toggle.
Why: tactile feedback makes the games feel alive and rewarding.
How: generate tones locally with the Web Audio API, add a persisted mute toggle, and add
short CSS pulses and shakes that respect reduced motion.

### R9. Resume strip on the dashboard
Idea: a compact strip near the top of the student dashboard showing the current streak,
today's daily challenge status, and a one-tap button to jump back to the last page or
game the student was on.
Why: removes friction to re-entering a session and makes the dashboard feel alive.
How: `lastPath` already exists on UserData. Render it as a pill button that routes to
the saved path. Streak and daily challenge status come from existing UserData fields
(`studyStreak`, `dailyChallengeDate`).

### R10. Blitz mode with combo multiplier
Idea: a timed sub-mode available inside existing games where a run of consecutive correct
answers builds a combo that multiplies the score, broken by any wrong answer.
Why: adds adrenaline and replay value to games students already know without building a
new game engine.
How: add an optional `blitz` query param or toggle on the GameSelector entry for
compatible games (MultipleChoice, SpellingBee, IschemicCountdown). Track a `combo`
counter and `multiplier` locally, display a combo counter UI element, and record the
blitz score separately under a new `gameScores` key like `mc_blitz`.

### R11. Chapter gauntlet
Idea: a run that pulls one question from each game type in sequence for a single
chapter, scoring a combined total.
Why: tests the chapter from every angle in one sitting and gives a meaningful "chapter
cleared" moment beyond the progress bar.
How: a new route `/games/gauntlet/:chapterNum` that sequences mini-rounds from
MultipleChoice, SpellingBee, and one other game, totals the score, and writes to a
`gauntlet_chN` key in `gameScores`. A launch button on ChapterSummary pages.

### R12. Class vs class weekly challenge
Idea: each class competes against one other class (or all others) on total terms cleared
in a week, with the winning class shown a banner at the start of the next week.
Why: interclass competition gives students a team identity and a reason to help
classmates study.
How: build on R5 (class leaderboard). Sum each class's weekly term counts in Firestore
and display a ranked class list visible to students inside the class view. The moderator
sets whether inter-class comparison is enabled.

### R13. Per-student weekly recap
Idea: every Monday the student dashboard shows a small card with last week's terms
cleared, games played, streak days, and top game score, then fades away after dismissal.
Why: personal history makes progress feel real and gives a natural re-engagement hook at
the start of each week.
How: store a snapshot of key counters on Sunday night (client-side, keyed by ISO week in
localStorage), render the recap card when the stored week is the previous week, and
dismiss on a button tap.

### R14. Term of the day
Idea: each day the dashboard highlights one term with its full breakdown (prefix, root,
suffix meanings), a short definition, and a quick single-question challenge the student
can tap through in seconds.
Why: a tiny daily ritual keeps the app in habit without requiring a full session.
How: select the term deterministically by day index mod the chapter's term list (same
pattern as Clinical Spotlight in anatomix-arch.md). Store whether the student answered
today's term in `dailyChallengeDate`-style localStorage key so it does not repeat within
the day.

### R15. Missed terms smart review queue
Idea: a dedicated "Weak Spots" session on the dashboard that surfaces the terms the
student gets wrong most often across all games, ordered by error count.
Why: students often do not know which terms they actually struggle with across game
types. A focused list turns scattered errors into a targeted study plan.
How: `criticalReview` already records errorCount per term. Render the top 10 by
errorCount as a mini flashcard session. No new data model needed, just a new entry point
on the dashboard.

### R16. Personal best tracker per game
Idea: on the GameSelector tile and inside each game's results screen, prominently display
the student's all-time best score and how the current run compared.
Why: knowing a personal best before starting creates a target and increases motivation to
replay.
How: `gameScores` already stores the best score per key. Add a "Your best" line to each
GameSelector tile and a "beat your best" vs "new record" result banner at game end. Zero
extra Firestore work.

### R17. Study timer with session summary
Idea: an optional countdown (25 min default, adjustable) the student can start from the
dashboard. When it ends, a summary card shows terms studied, correct rate, and which
chapter was active.
Why: timed sessions help students manage study time and create a natural stopping point
that feels satisfying rather than abrupt.
How: purely client-side. A floating timer button on the dashboard that starts a
Web Worker or setInterval countdown, minimizes to a corner pill during games, and shows
a summary modal on expiry. No persistence needed beyond the current session.

### R18. Chapter mastery card
Idea: when a chapter hits 100% cleared, a one-time styled card appears with the chapter
name, date achieved, and a label like "Mastered". The card stays visible on
ChapterSummary and can be dismissed.
Why: a clear finish line and a visible trophy for each chapter make long-term progress
feel rewarding.
How: track mastered chapters in a `masteredChapters: string[]` field on UserData,
written when clearedTermIds covers all termIds in that chapter. Render a highlighted
card at the top of ChapterSummary for mastered chapters.

---

## NEXT BOT INSTRUCTIONS

1. Read the hard preferences above and keep every proposal inside them.
2. Add more recommendations in the same format as R1 through R18.
3. Present the list to the user and let them pick.
4. Only implement an item after the user explicitly approves that item.
5. After any approved build, run `npx tsc --noEmit` and confirm it passes, then restart
   the `Start application` workflow and confirm no errors.
