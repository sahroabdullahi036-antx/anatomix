---
name: Chapter order persistence
description: How moderator chapter reordering works
---
- Firestore: config/chapterOrder → { nums: number[] }
- medicalData.ts: applyChapterOrder(nums) reorders CHAPTERS array in place
- App.tsx loads order on startup via getChapterOrder()
- ModeratorDashboard Chapters tab: ▲▼ buttons call moveChapter(), saves to Firestore immediately
- chapterOrderNums state initialized from CHAPTERS on mount, refreshed from Firestore in useEffect

**Why:** All ordering must be moderator-only and persist for all users via Firestore.
