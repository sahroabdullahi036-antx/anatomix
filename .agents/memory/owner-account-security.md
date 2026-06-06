---
name: Owner account security
description: How the "anatomixowner" account is locked down (Firestore-backed, write-once)
---

The `anatomixowner` host account is secured by a password hash stored in Firestore at `config/owner.passwordHash` (SHA-256 via `hashPassword` in `utils/auth.ts`). LoginGate special-cases `IS_HOST`: reads the hash from Firestore (not localStorage), routes to first-claim (no hash yet) or sign-in (hash exists), and verifies the entered password's hash against the stored one. This makes ownership cross-device instead of per-device localStorage.

**Why:** Before this, anyone on a fresh device could type `anatomixowner`, set a password locally, and become moderator. The fix moves the credential server-side and locks first-claim.

**How to apply:**
- The lock is only real once `firestore.rules` is **deployed to Firebase** (console or `firebase deploy --only firestore:rules`). The repo file alone does nothing in production.
- `config/owner` is **write-once** in the rules: `allow create` (first claim) but `allow update, delete: if false`. Tradeoff: the owner password cannot be changed later without editing the doc in the Firebase console.
- Residual risk: the hash is readable by any authenticated (incl. anonymous) client, so a weak owner password is brute-forceable offline. Use a strong password. Eliminating this would require a privileged backend verify endpoint (not done — app is intentionally backend-light / no paid services).
- All other `config/*` docs (pins, roles, chapterOrder) remain authed-writable; the general rule excludes `owner` via `document != 'owner'`.
