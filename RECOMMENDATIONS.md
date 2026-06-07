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

The user wants AnatomiX to help adult learners retain medical terminology efficiently.
The target audience includes people with demanding schedules: parents, working adults,
students in accelerated programs. The goal is for a student to complete the full
curriculum in under two months without burning out. Features should feel professional
and purposeful, not childish or game-like. The design is already dark and clean and
should stay that way.

The user also wants a moderator announcement system where the moderator can broadcast
a message that blocks the screen until the student responds, and the moderator can see
exactly who acknowledged, who ignored, and who has not seen it yet.

Already handled separately by the main agent (not part of this approval list): the
anatomy page has been switched back to a button based explorer.

---

## HARD PREFERENCES (every recommendation must respect these)

1. Style: clean, professional, purposeful. Match the existing dark UI in
   `client/src/pages/v2`. Design constants: bg #252830, text #fcfaf7, primary buttons
   #4a6080. Use inline styles, not Tailwind classes, in v2 pages.
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
11. Tone: professional and direct. No game metaphors, no "coins", no "power-ups", no
    "levels" unless clearly framed as study progress. This is a study platform for adults.

---

## RECOMMENDATIONS (proposals, not approved)

Each item lists the idea, why it helps, and a short note on how it could work. Detail is
for evaluation only. Do not build until the user approves the specific item.

### R1. Moderator announcement system (REVISED)
Idea: the moderator writes a message, tags it as general, test alert, or chapter
reminder, and targets it at one class, several classes, or everyone. When a student
opens the app, a full-screen modal overlay appears immediately and cannot be dismissed
without clicking one of two buttons: "Got it" (understood) or "Noted" (acknowledged but
not acting on it). The modal stays across page navigations until they respond, so it
catches them even if they were already in a game. The moderator dashboard shows a live
response table per announcement: how many students have seen it, how many clicked "Got
it", how many clicked "Noted", and a list of names in each group with a third column for
students who have not opened the app yet.
Why: direct communication with accountability. The moderator knows the message was
actually received, not just sent.
How: a new `announcements` Firestore collection. Each document holds message, type,
targetClassIds (empty array means all), createdAt, and a `responses` sub-collection
where each doc is `{ username, response: "acknowledged"|"noted", seenAt }`. On student
login or app focus, check for any unanswered announcement matching their classIds. The
modal blocks interaction until responded. The response sub-collection drives the live
table in the moderator dashboard.

### R2. Study streak with grace period
Idea: show the current study streak on the dashboard with a one-day grace period so a
single missed day does not reset it, and a clear "streak at risk" warning on the day
of the grace period.
Why: streak loss is the single biggest reason adult learners abandon study apps. A
visible grace period warning the day before loss also nudges them to open the app.
How: surface `studyStreak` and `lastStudyDate` on the dashboard. If today minus
lastStudyDate is exactly 2 days, show the streak in a warning state but do not reset it
yet. If it is 3 or more days, reset. Store a `streakFreezeUsed` boolean on UserData
so the grace only applies once per gap.

### R3. Study progress estimate
Idea: on the dashboard, show a simple calculation: terms cleared out of total, and at
the student's recent pace, an estimated weeks-to-completion number.
Why: adults with deadlines need to know if they are on track. A concrete number is more
useful than a percentage bar.
How: compute average terms cleared per day over the last 7 days from the clearedTermIds
timestamps stored in Firestore. Divide remaining terms by daily rate. Display as "At
your current pace, you will finish in about X weeks." Update once per session.

### R4. 10-minute session mode
Idea: a "Quick Study" button on the dashboard that launches a focused 10-minute session:
the app picks the highest-priority terms (due SRS cards, then critical review, then
unseen chapter terms) and drills them in flashcard mode with a visible countdown.
Why: the biggest barrier for busy adults is starting. Removing the need to decide what
to study and setting a short fixed time makes it easy to sit down for one round before
work, during a break, or after the kids go to bed.
How: a route or modal that seeds from the existing `srsDeck` and `criticalReview` data,
then fills remaining slots from unseen terms. A 10-minute timer runs in the corner. At
the end, a brief summary card shows what was covered.

### R5. Class progress board (teacher view)
Idea: the teacher dashboard shows a ranked list of students in each class by terms
cleared this week, with a quick visual indicator of who has not studied in more than
three days.
Why: teachers need to know who is falling behind without having to ask. A simple at-a-
glance table lets them reach out to struggling students early.
How: read each student's Firestore progress document. Compute weekly terms cleared from
a new `weeklyTermCount` field (keyed by ISO week) that increments alongside
clearedTermIds. Flag students whose lastStudyDate is more than 3 days ago in a muted
color.

### R6. Smart chapter recommendation
Idea: after each session, the app tells the student which chapter to focus on next based
on their weakest chapter proficiency score.
Why: students often default to chapters they already know, ignoring the gaps. A direct
recommendation removes the decision and focuses time where it matters.
How: compute chapter proficiency from `clearedTermIds` vs each chapter's `termIds`. Find
the chapter with the lowest score that is not already above 80%. Display it as a
"Suggested next: Chapter X" card with a one-tap launch button into that chapter's study
mode.

### R7. Pronunciation guide (audio)
Idea: every term in the dictionary and flashcard views has a "hear it" button that uses
the browser's free Web Speech API to read the term aloud at a measured pace.
Why: medical terminology is hard to retain partly because students cannot hear it in
their head. Hearing the pronunciation once locks in recall significantly better than
reading alone, especially for commuters or people who study while doing other tasks.
How: call `window.speechSynthesis.speak()` with the term text and a slow rate (0.8).
No external API or cost. A small speaker icon button next to each term.

### R8. Root pattern drill
Idea: a dedicated "Build a Word" session that shows a medical word and asks the student
to identify the prefix, root, and suffix separately before revealing the meaning.
Why: adults retain vocabulary better when they understand the structure than when they
memorize whole words. Once a student knows that "cardio" always means heart, they can
decode dozens of terms they have never seen.
How: use the existing `termLookup.ts` offline engine to decompose the term. Present the
parts as three blank slots. The student fills each. This is a distinct study mode, not a
new page, and can live under `/games/root-drill`.

### R9. Session resume and last position
Idea: the dashboard shows a one-line card pointing back to wherever the student last was
(last chapter, last flashcard deck, or last game), with a single "Continue" button.
Why: reducing the number of taps to re-enter a session dramatically increases the chance
a busy student actually studies during a short window.
How: `lastPath` already exists on UserData and is already saved. Render it as a card
near the top of the dashboard. Show the chapter or section name, not the raw URL.

### R10. Chapter gauntlet (assessment mode)
Idea: a structured end-of-chapter assessment that cycles through multiple question
formats (multiple choice, fill-in, term matching) for one chapter and gives a final
percentage score with a breakdown by question type.
Why: a realistic test-style run builds retrieval practice, which is one of the most
evidence-backed methods for long-term retention. Students also need a way to know
whether they are actually ready before a real exam.
How: a new route `/assessment/:chapterNum` that sequences questions from MultipleChoice,
a short fill-in round, and a matching round, then shows a results breakdown. Score is
written to `gameScores` under `assessment_chN`.

### R11. Weekly study recap on the dashboard
Idea: at the start of each week, the student sees a brief recap card showing last week's
total terms studied, days studied, and correct rate, with a plain "This week's goal"
reminder below.
Why: reflection on past performance helps adults calibrate their effort for the next
week. It also serves as a re-engagement hook for anyone who had a slow week.
How: store a weekly snapshot in localStorage keyed by ISO week number. Render the recap
card on Monday and Tuesday only, then dismiss it. No Firestore write needed.

### R12. Missed terms focused review
Idea: a "Weak Spots" section on the dashboard that shows the terms the student gets
wrong most often across all activities, with a direct entry into a focused flashcard
session covering only those terms.
Why: students rarely know which specific terms they actually struggle with across all
study modes. A compiled weak-spots list turns scattered errors into a targeted 5-minute
session.
How: `criticalReview` already stores errorCount per term. Sort by errorCount descending,
show the top 10, and launch a flashcard session seeded with those termIds. No new data
model.

### R13. Personal best and progress comparison per game
Idea: on each game's results screen, show the student's previous best score and whether
this run improved it. On the game selector, show the current best next to each game
tile.
Why: having a personal benchmark creates a concrete target and increases voluntary
replays, which increases exposure to terms.
How: `gameScores` already stores the best per key. Display it on GameSelector tiles and
in game result screens. No new data or Firestore calls.

### R14. Study plan builder (moderator sets it, students see it)
Idea: the moderator sets a week-by-week curriculum plan in the moderator dashboard:
which chapter each week of the course. Students see a simple timeline on their
dashboard showing the current week's chapter target and whether they are on track.
Why: adult learners in a class context need external structure. A visible curriculum
calendar removes the guesswork of "what should I be studying right now."
How: a new Firestore document `config/studyPlan` with an array of `{ week, chapterNum
}` entries. The moderator fills it in. The student dashboard computes the current week's
target from the plan and shows a status card.

### R15. Offline-capable term cards
Idea: any term the student marks as "save for offline" gets written to localStorage so
the flashcard is available when there is no internet connection.
Why: many adult learners study during commutes or in areas with unreliable connection.
Even a small offline deck removes the "I cannot study right now" excuse.
How: a save button on each term card in the dictionary and flashcard views. Saved terms
are written to localStorage under a fixed key. A fallback view reads from localStorage
when Firestore is unavailable.

### R16. Smart notification dot for unseen announcements
Idea: a persistent indicator on the student dashboard that shows how many unread
moderator announcements are waiting. Clicking it opens the announcement modal directly.
Why: students who have not opened the app will see the modal on next login, but students
who are already in the app need a way to notice a new announcement without the modal
interrupting a game in progress.
How: subscribe to the `announcements` collection filtered to the student's classIds and
check for documents with no matching response for their username. Show a count badge.

### R17. Contextual mnemonic hints
Idea: for terms that have a mnemonic stored in the database, show a collapsible "Memory
hint" section below the definition in flashcard and dictionary views.
Why: mnemonics are one of the most effective memorization tools for adult learners, but
only if they are seen at the right moment. Surfacing them inline during study removes
the need to look them up.
How: the medicalData terms already have a `mnemonic` field. Render it as a collapsible
section that is collapsed by default so it does not give away the answer immediately.

### R18. Chapter mastery milestone
Idea: when a chapter hits 100% cleared, a one-time milestone card appears on the chapter
summary page marking it as complete with the date it was achieved.
Why: a clear finish line per chapter gives adult learners a concrete sense of
accomplishment and forward momentum. It also helps when planning which chapters still
need attention.
How: add `masteredChapters: Record<string, string>` (chapterNum to ISO date string) to
UserData. Write the entry when clearedTermIds covers all termIds for a chapter. Display
the mastery date on ChapterSummary for completed chapters.

---

## NEXT BOT INSTRUCTIONS

1. Read the hard preferences above and keep every proposal inside them.
2. The audience is adult learners under time pressure. Every feature should help them
   learn more efficiently or remove friction, not add entertainment.
3. Add more recommendations in the same format as R1 through R18.
4. Present the list to the user and let them pick.
5. Only implement an item after the user explicitly approves that item.
6. After any approved build, run `npx tsc --noEmit` and confirm it passes, then restart
   the `Start application` workflow and confirm no errors.
