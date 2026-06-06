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
   UI in `client/src/pages/v2`.
2. Never use white or off-white as a background or surface fill. Backgrounds stay on the
   existing dark surfaces. Text may use the existing light token (`#fcfaf7`).
3. No emojis anywhere in the UI or in copy.
4. No em dashes and no en dashes anywhere. Use a hyphen, comma, or colon instead.
5. Everything must be free. No paid APIs or services or asset libraries. Persistence is
   the existing Firebase or Firestore only. Any sound must be free or generated locally.
6. Respect the global palette filter: the whole app is wrapped in a CSS hue-rotate
   filter. Elements that must show a literal color use `inverseFilter` from
   `usePalette()`. New palette-following colors should be authored on the blue base hue
   (about hue 216) so they recolor consistently.
7. Gate every Firestore read on the `ready` flag (anonymous auth).
8. Reuse existing Firestore helpers and collections. Do not build a parallel data layer.

---

## RECOMMENDATIONS SO FAR (proposals, not approved)

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

---

## IDEAS NOT YET DETAILED (seeds for the next bot to expand)

- Resume strip on the dashboard: streak, today's quest, and a one tap resume of the last
  game played.
- Speed or blitz mode on existing games with a combo multiplier.
- Chapter gauntlet: a mixed run through one chapter across several existing game types.
- Class vs class weekly challenge.
- Per student weekly recap shown on the dashboard.

The next bot should expand these and add new ones, then ask the user which to build.

---

## NEXT BOT INSTRUCTIONS

1. Read the hard preferences above and keep every proposal inside them.
2. Add more recommendations in the same format as R1 through R8.
3. Present the list to the user and let them pick.
4. Only implement an item after the user explicitly approves that item.
5. After any approved build, run `npx tsc --noEmit` and confirm it passes, then restart
   the `Start application` workflow and confirm no errors.
