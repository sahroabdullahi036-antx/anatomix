---
name: AnatomiX architecture
description: Key routing, auth, Firebase, and design decisions for the AnatomiX platform
---

**Moderator account:** Username "AnatomiXOwner" (IS_HOST = toLowerCase === "anatomixowner"). Password is REQUIRED (cannot skip). After login, AppRoutes renders ModeratorDashboard for "/" instead of Dashboard.

**Why:** Class instructor needs a protected account that cannot accidentally be used by students.

**How to apply:** Any IS_HOST check must use toLowerCase comparison. LoginGate enforces mandatory password when isHost is true.

---

**Firebase sync:** useFirebaseSync hook (in InnerApp inside UserProvider) debounces writes 3s via onSyncNeeded callback from UserContext. UserContext itself has no Firebase imports — clean separation.

**Why:** Avoid circular deps; keep UserContext pure and testable without Firebase.

**How to apply:** InnerApp wraps AppRoutes and calls useFirebaseSync(). FirebaseProvider wraps the whole tree above UserProvider.

---

**Room codes:** 6-char uppercase, alphabet = ABCDEFGHJKLMNPQRSTUVWXYZ23456789 (no ambiguous chars I/O/0/1). Stored in Firestore /rooms/{code}.

---

**Clinical Spotlight:** Deterministic term selection using (dayOfYear * 6 + slotIndex) as seed. Slots change at 8am/11am/2pm/5pm/8pm America/Chicago. Seeded with Math.sin(seed+1)*10000.

---

**Design constants:** bg #252830, text #fcfaf7, primary buttons #4a6080, inline styles only (no Tailwind classes in v2 pages).

---

**CHAPTERS.termIds:** Each chapter object in medicalData.ts has a `termIds: string[]` property used for proficiency calculations.

---

**Achievements:** Stored in UserData.earnedAchievements[]. Checked in recordCorrect() via checkAchievements(). External award via awardAchievement(id). ACHIEVEMENTS dict exported from UserContext for UI display.

---

**Body Reference term filtering:** Uses `t.system?.toLowerCase().includes(selected.replace("-", " "))` because system IDs use hyphens ("special-senses") but term system values use spaces ("Special Senses").
