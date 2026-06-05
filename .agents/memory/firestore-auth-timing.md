---
name: Firestore auth-timing / silent fallback
description: Why Firestore reads must wait for anonymous auth before firing, or they fail silently and fall back to defaults
---

# Firestore reads must be gated on auth `ready`

Any effect that reads/subscribes to Firestore (term/chapter overrides, custom terms,
teachers, users, classes, pins, chapter order) must wait until anonymous auth has
completed before firing. The FirebaseContext exposes a `ready` flag for exactly this.

Pattern: `if (!db || !ready) return;` and include `ready` in the dependency array
(`[db, ready]`), not just `[db]`.

**Why:** firestore.rules are auth-gated. If a read fires on `[db]` before anon auth
resolves, Firestore returns permission-denied. The app's catch paths swallow the error
and silently fall back to in-memory defaults, so the user sees stale/default content
(e.g. flashcard terms reverting to defaults) with no visible error. The root cause is
ordering, not data loss or removed config.

**How to apply:** when adding any new Firestore read/subscribe effect in a v2 page or
context, gate it on `ready`. If content mysteriously "resets to defaults" on load,
suspect a read that ran before auth was ready, not a data/secret problem.
