# AnatomiX

Medical terminology learning platform built with React + Vite + Firebase. Client-side app (no real backend) that talks directly to Firebase (Firestore + anonymous Auth). ~230 terms across 13 chapters, with flashcards, quizzes, mini-games, a dictionary lookup, multiplayer, chat, and a moderator/owner area.

## Tech notes
- Frontend: React + Vite, mostly inline styles on the v2 pages.
- Data/auth: Firebase (Firestore + anonymous Auth). Firestore reads are gated on the `ready` flag from `useFirebase()` (anonymous auth must finish first).
- Term lookup runs fully offline (no paid AI). Hard requirement: no paid services / backend billing.
- Hosting: Firebase Hosting (free). Deploy with `bash deploy.sh`. Firestore security rules live in `firestore.rules` (must be published to Firebase to take effect).

## User preferences
- The user is a non-technical beginner. Keep instructions plain and step-by-step — no jargon.
- When giving steps that involve a website or app, use the **actual names of buttons, tabs, and menus** the user will see on screen, rather than technical descriptions.
- The user prefers to find/click things themselves as long as the instructions are clear.
- Hard constraint: do not use paid services or add a paid backend. Keep everything free (Firebase free tier, offline term lookup).
- Never comment on Replit refund/billing/membership policy; direct the user to Replit support for those.
