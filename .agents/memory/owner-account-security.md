---
name: Owner account security
description: How the "anatomixowner" account is locked down (Firestore-backed, write-once)
---

The `anatomixowner` host account is secured by a password hash stored in Firestore at `config/owner.passwordHash` (SHA-256 via `hashPassword` in `utils/auth.ts`). LoginGate special-cases `IS_HOST`: reads the hash from Firestore (not localStorage), routes to first-claim (no hash yet) or sign-in (hash exists), and verifies the entered password's hash against the stored one. This makes ownership cross-device instead of per-device localStorage.

**Why:** Before this, anyone on a fresh device could type `anatomixowner`, set a password locally, and become moderator. The fix moves the credential server-side and locks first-claim.

**Symptom of undeployed rules:** Owner login shows "Cannot verify the owner account right now" (the `config/owner` read throws permission-denied) while anonymous auth itself succeeds. Confirmed via a node script (firebase web SDK + `signInAnonymously` + `getDoc(config/owner)`): `ANON_AUTH_OK` but `READ_FAIL permission-denied` = the LIVE rules in the Firebase project don't match the repo `firestore.rules`. Regular (non-host) accounts still work because they fall back to localStorage; only the owner requires Firestore, so it's the canary for an undeployed/deny-all ruleset. Fix = publish `firestore.rules` in the Firebase Console (Firestore → Rules → paste → Publish). There is no `firebase.json` deploy setup in the repo.

**How to apply:**
- The lock is only real once `firestore.rules` is **deployed to Firebase** (console or `firebase deploy --only firestore:rules`). The repo file alone does nothing in production.
- `config/owner` is **write-once** in the rules: `allow create` (first claim) but `allow update, delete: if false`. Tradeoff: the owner password cannot be changed later without editing the doc in the Firebase console.
- Residual risk: the hash is readable by any authenticated (incl. anonymous) client, so a weak owner password is brute-forceable offline. Use a strong password. Eliminating this would require a privileged backend verify endpoint (not done — app is intentionally backend-light / no paid services).
- All other `config/*` docs (pins, roles, chapterOrder) remain authed-writable; the general rule excludes `owner` via `document != 'owner'`.
