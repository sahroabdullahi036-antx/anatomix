---
name: Teacher role system
description: How teacher accounts are stored, detected, and routed in AnatomiX
---

Teachers are stored in Firestore at `/config/roles` as `{ teacherUsernames: string[] }` (all lowercase).

**Detection:** `subscribeToTeachers(db, cb)` in firestoreService.ts subscribes in real time. AppRoutes (App.tsx) subscribes on mount when db is ready and sets `teachers` state. `isTeacher = !isHost && teachers.includes(user.username.toLowerCase())`.

**Routing:** `HomeComponent = isHost ? ModeratorDashboard : isTeacher ? TeacherDashboard : Dashboard`. All three cases land on `/`.

**TeacherDashboard:** at `client/src/pages/v2/TeacherDashboard.tsx`. Shows only classes where `ownerUsername === myUsername`. Cannot manage other teachers or see all students.

**ModeratorDashboard Teachers tab:** Moderator can addTeacher / removeTeacher via the Teachers tab. New classes created by moderator get `ownerUsername: "anatomixowner"`.

**Why:** Separates instructor role from full admin without a separate auth system -- Firestore document acts as a role registry.
