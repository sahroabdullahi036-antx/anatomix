---
name: Profile pictures
description: How user profile pictures are stored and displayed (replaces the removed dress-up avatar system)
---

# Profile pictures

The custom dress-up SVG avatar + closet was fully removed and replaced by a real
profile-picture upload feature.

- Uploads are center-cropped + downscaled to a ~128px JPEG **data URL** (canvas,
  quality ~0.72) and stored in two places:
  - localStorage cache (`anatomix_pfp_<userKey>`) for instant same-device display.
  - the user's Firestore doc as an optional `profilePic` field, so the picture
    shows for everyone on the Leaderboard.
- Display uses a single `ProfilePic` component (circular img with single-letter
  initials fallback). The old shadcn `components/ui/avatar.tsx` Radix primitive is
  unused but kept.

**Why no Firebase Storage:** hard no-billing constraint. Tiny compressed
thumbnails fit comfortably in the Firestore 1MB doc limit; an upload-time size
guard (~200KB) rejects anything unexpectedly large.

**How to apply:** `setProfilePic()` and `syncUserToFirestore()` are both
`setDoc(..., { merge: true })` on disjoint fields, so sync never wipes the picture.
Keep any new user-doc writer on merge to preserve this.

**Known gap (pre-existing, broader scope):** Firestore rules let any authed user
write any `/users/{id}` doc, so profilePic/progress are overwritable cross-user.
Tighten rules if this feature's integrity matters.
