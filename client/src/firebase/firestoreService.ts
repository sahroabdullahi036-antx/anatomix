import {
  Firestore, doc, setDoc, getDoc, collection, getDocs,
  onSnapshot, deleteDoc, updateDoc, Unsubscribe, query, orderBy
} from "firebase/firestore";
import type { UserData } from "@/contexts/UserContext";

export interface FirestoreUserProgress {
  username: string;
  clearedTermIds: string[];
  studyStreak: number;
  lastStudyDate: string;
  criticalReviewCount: number;
  chapterProgress: Record<string, number>;
  gameScores: Record<string, number>;
  earnedAchievements: string[];
  lastSeen: number;
  classIds: string[];
}

export interface RoomPlayer {
  username: string;
  score: number;
  status: "alive" | "eliminated" | "waiting";
  answered: boolean;
  answerCorrect?: boolean;
  answerTime?: number;
  typedAnswer?: string;
}

export interface FirestoreRoom {
  roomCode: string;
  hostUsername: string;
  mode: "blitz" | "elimination" | "quiz-show" | "cooperative" | "speed-typing" | "class-review";
  chapterFilter: number;
  status: "lobby" | "playing" | "finished";
  players: Record<string, RoomPlayer>;
  questionIndex: number;
  questions: Array<{ termId: string; term: string; meaning: string; definition: string; choices: string[] }>;
  groupHealth: number;
  maxHealth: number;
  winnerUsername?: string;
  createdAt: number;
  startedAt?: number;
}

export interface FirestoreClass {
  id: string;
  name: string;
  memberUsernames: string[];
  createdAt: number;
  ownerUsername?: string;
}

function userKey(username: string) {
  return username.toLowerCase().replace(/\s+/g, "_");
}

export async function syncUserToFirestore(db: Firestore, user: UserData): Promise<void> {
  try {
    const cleared = user.clearedTermIds ?? [];
    const data: FirestoreUserProgress = {
      username: user.username,
      clearedTermIds: cleared,
      studyStreak: user.studyStreak ?? 0,
      lastStudyDate: user.lastStudyDate ?? "",
      criticalReviewCount: Object.keys(user.criticalReview ?? {}).length,
      chapterProgress: {},
      gameScores: user.gameScores ?? {},
      earnedAchievements: (user as any).earnedAchievements ?? [],
      lastSeen: Date.now(),
      classIds: (user as any).classIds ?? [],
    };
    await setDoc(doc(db, "users", userKey(user.username)), data, { merge: true });
  } catch {}
}

export async function getAllUsers(db: Firestore): Promise<FirestoreUserProgress[]> {
  try {
    const snap = await getDocs(collection(db, "users"));
    return snap.docs.map(d => d.data() as FirestoreUserProgress);
  } catch { return []; }
}

export function subscribeToUsers(
  db: Firestore,
  cb: (users: FirestoreUserProgress[]) => void
): Unsubscribe {
  return onSnapshot(collection(db, "users"), snap => {
    cb(snap.docs.map(d => d.data() as FirestoreUserProgress));
  });
}

export async function getAllClasses(db: Firestore): Promise<FirestoreClass[]> {
  try {
    const snap = await getDocs(collection(db, "classes"));
    return snap.docs.map(d => d.data() as FirestoreClass);
  } catch { return []; }
}

export function subscribeToClasses(
  db: Firestore,
  cb: (classes: FirestoreClass[]) => void
): Unsubscribe {
  return onSnapshot(collection(db, "classes"), snap => {
    cb(snap.docs.map(d => d.data() as FirestoreClass));
  });
}

export async function saveClass(db: Firestore, cls: FirestoreClass): Promise<void> {
  await setDoc(doc(db, "classes", cls.id), cls);
}

export async function deleteClass(db: Firestore, classId: string): Promise<void> {
  await deleteDoc(doc(db, "classes", classId));
}

export async function addStudentToClass(db: Firestore, classId: string, username: string): Promise<void> {
  const ref = doc(db, "classes", classId);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    const cls = snap.data() as FirestoreClass;
    if (!cls.memberUsernames.includes(username)) {
      await updateDoc(ref, { memberUsernames: [...cls.memberUsernames, username] });
    }
  }
}

export async function removeStudentFromClass(db: Firestore, classId: string, username: string): Promise<void> {
  const ref = doc(db, "classes", classId);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    const cls = snap.data() as FirestoreClass;
    await updateDoc(ref, { memberUsernames: cls.memberUsernames.filter(u => u !== username) });
  }
}

export async function createRoom(db: Firestore, room: FirestoreRoom): Promise<void> {
  await setDoc(doc(db, "rooms", room.roomCode), room);
}

export async function getRoom(db: Firestore, roomCode: string): Promise<FirestoreRoom | null> {
  const snap = await getDoc(doc(db, "rooms", roomCode));
  return snap.exists() ? (snap.data() as FirestoreRoom) : null;
}

export function subscribeToRoom(
  db: Firestore,
  roomCode: string,
  cb: (room: FirestoreRoom | null) => void
): Unsubscribe {
  return onSnapshot(doc(db, "rooms", roomCode), snap => {
    cb(snap.exists() ? (snap.data() as FirestoreRoom) : null);
  });
}

export async function updateRoom(db: Firestore, roomCode: string, data: Partial<FirestoreRoom>): Promise<void> {
  await updateDoc(doc(db, "rooms", roomCode), data as any);
}

export async function deleteRoom(db: Firestore, roomCode: string): Promise<void> {
  await deleteDoc(doc(db, "rooms", roomCode));
}

export async function joinRoom(db: Firestore, roomCode: string, player: RoomPlayer): Promise<void> {
  const ref = doc(db, "rooms", roomCode);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error("Room not found");
  const room = snap.data() as FirestoreRoom;
  await updateDoc(ref, {
    [`players.${player.username}`]: player,
  });
}

export interface UserPinEntry {
  pin: string;
  locked: boolean;
}

export function subscribeToUserPins(
  db: Firestore,
  cb: (pins: Record<string, UserPinEntry>) => void
): Unsubscribe {
  return onSnapshot(doc(db, "config", "pins"), snap => {
    cb(snap.exists() ? (snap.data() as Record<string, UserPinEntry>) : {});
  });
}

export async function setUserPin(db: Firestore, username: string, pin: string, locked = false): Promise<void> {
  const key = userKey(username);
  await setDoc(doc(db, "config", "pins"), { [key]: { pin, locked } }, { merge: true });
}

export async function clearUserPin(db: Firestore, username: string): Promise<void> {
  const ref = doc(db, "config", "pins");
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  const data = { ...(snap.data() as Record<string, UserPinEntry>) };
  delete data[userKey(username)];
  await setDoc(ref, data);
}

export async function setUsernameLocked(db: Firestore, username: string, locked: boolean): Promise<void> {
  const ref = doc(db, "config", "pins");
  const snap = await getDoc(ref);
  const data = snap.exists() ? (snap.data() as Record<string, UserPinEntry>) : {};
  const key = userKey(username);
  if (!data[key]) return;
  await setDoc(ref, { [key]: { ...data[key], locked } }, { merge: true });
}

export async function renameUser(
  db: Firestore,
  oldUsername: string,
  newUsername: string,
  allClasses: FirestoreClass[]
): Promise<void> {
  const oldKey = userKey(oldUsername);
  const newKey = userKey(newUsername);
  const oldRef = doc(db, "users", oldKey);
  const snap = await getDoc(oldRef);
  if (snap.exists()) {
    await setDoc(doc(db, "users", newKey), { ...snap.data(), username: newUsername });
    await deleteDoc(oldRef);
  }
  for (const cls of allClasses) {
    if (cls.memberUsernames.includes(oldUsername)) {
      await updateDoc(doc(db, "classes", cls.id), {
        memberUsernames: cls.memberUsernames.map(u => u === oldUsername ? newUsername : u),
      });
    }
  }
  const rolesRef = doc(db, "config", "roles");
  const rolesSnap = await getDoc(rolesRef);
  if (rolesSnap.exists()) {
    const teachers: string[] = (rolesSnap.data() as any).teacherUsernames ?? [];
    if (teachers.includes(oldKey)) {
      await setDoc(rolesRef, { teacherUsernames: teachers.map(t => t === oldKey ? newKey : t) }, { merge: true });
    }
  }
  const pinsRef = doc(db, "config", "pins");
  const pinsSnap = await getDoc(pinsRef);
  if (pinsSnap.exists()) {
    const pins = { ...(pinsSnap.data() as Record<string, UserPinEntry>) };
    if (pins[oldKey]) {
      pins[newKey] = pins[oldKey];
      delete pins[oldKey];
      await setDoc(pinsRef, pins);
    }
  }
}

export async function removeUserEntirely(
  db: Firestore,
  username: string,
  allClasses: FirestoreClass[]
): Promise<void> {
  await deleteDoc(doc(db, "users", userKey(username)));
  for (const cls of allClasses) {
    if (cls.memberUsernames.includes(username)) {
      await removeStudentFromClass(db, cls.id, username);
    }
  }
  await removeTeacher(db, username);
  await clearUserPin(db, username);
}

export function subscribeToTeachers(db: Firestore, cb: (usernames: string[]) => void): Unsubscribe {
  return onSnapshot(doc(db, "config", "roles"), snap => {
    cb(snap.exists() ? ((snap.data() as any).teacherUsernames ?? []) : []);
  });
}

export async function addTeacher(db: Firestore, username: string): Promise<void> {
  const ref = doc(db, "config", "roles");
  const snap = await getDoc(ref);
  const existing: string[] = snap.exists() ? ((snap.data() as any).teacherUsernames ?? []) : [];
  const lower = username.toLowerCase().trim();
  if (!existing.includes(lower)) {
    await setDoc(ref, { teacherUsernames: [...existing, lower] }, { merge: true });
  }
}

export async function removeTeacher(db: Firestore, username: string): Promise<void> {
  const ref = doc(db, "config", "roles");
  const snap = await getDoc(ref);
  const existing: string[] = snap.exists() ? ((snap.data() as any).teacherUsernames ?? []) : [];
  await setDoc(ref, { teacherUsernames: existing.filter(u => u !== username.toLowerCase().trim()) }, { merge: true });
}
