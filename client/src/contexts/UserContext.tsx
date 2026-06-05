import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';

export interface UserData {
  username: string;
  decks: CustomDeck[];
  criticalReview: Record<string, CriticalEntry>;
  srsDeck: Record<string, SRSEntry>;
  gameScores: Record<string, number>;
  clearedTermIds: string[];
  studyStreak: number;
  lastStudyDate: string;
  dailyChallengeDate: string;
  dailyChallengeTermIds: string[];
  earnedAchievements: string[];
  studiedCount: number;
  classIds: string[];
  lastPath?: string;
}

export interface CustomDeck {
  id: string;
  name: string;
  termIds: string[];
  createdAt: number;
}

export interface CriticalEntry {
  termId: string;
  term: string;
  errorCount: number;
  correctStreak: number;
  addedAt: number;
  interval: number;
  nextReview: number;
}

export interface SRSEntry {
  termId: string;
  interval: number;
  nextReview: number;
  totalReviews: number;
}

export const ACHIEVEMENTS: Record<string, { label: string; description: string }> = {
  first_correct:  { label: "First Step",        description: "Answered your first term correctly" },
  streak_3:       { label: "3-Day Streak",       description: "Studied 3 days in a row" },
  streak_7:       { label: "Week Warrior",       description: "Studied 7 days in a row" },
  streak_30:      { label: "Monthly Mastery",    description: "Studied 30 days in a row" },
  terms_50:       { label: "50 Terms",           description: "Cleared 50 terms" },
  terms_100:      { label: "Century",            description: "Cleared 100 terms" },
  terms_500:      { label: "Lexicon Master",     description: "Cleared 500 terms" },
  chapter_cleared:{ label: "Chapter Complete",   description: "Reached 80% in a chapter" },
  all_chapters:   { label: "Full Curriculum",    description: "Reached 80% in all 13 chapters" },
  boss_beaten:    { label: "Boss Defeated",      description: "Completed the Boss Round" },
  perfect_test:   { label: "Perfect Score",      description: "Scored 100% on a Practice Test" },
  perfect_spelling:{ label: "Spelling Champion", description: "Scored 10/10 on Spelling Bee" },
  no_critical:    { label: "Clean Slate",        description: "Cleared all Critical Review terms" },
};

interface UserContextType {
  user: UserData | null;
  login: (username: string) => void;
  logout: () => void;
  recordMiss: (termId: string, term: string) => void;
  recordCorrect: (termId: string) => void;
  awardAchievement: (id: string) => void;
  savePath: (path: string) => void;
  addDeck: (name: string, termIds: string[]) => void;
  removeDeck: (deckId: string) => void;
  updateScore: (gameKey: string, score: number) => void;
  updateSRS: (termId: string, quality: "wrong" | "hard" | "easy") => void;
  recentUsers: string[];
  onSyncNeeded: (cb: (user: UserData) => void) => () => void;
}

const UserContext = createContext<UserContextType | null>(null);

const storageKey = (u: string) => `anatomix_user_${u.toLowerCase().replace(/\s+/g, '_')}`;
const RECENT_KEY = 'anatomix_recent_users';

function todayStr() { return new Date().toISOString().split('T')[0]; }
function yesterdayStr() { const d = new Date(); d.setDate(d.getDate() - 1); return d.toISOString().split('T')[0]; }
function msFromNow(days: number) { return Date.now() + days * 86_400_000; }

function loadUser(username: string): UserData {
  try {
    const raw = localStorage.getItem(storageKey(username));
    if (raw) {
      const p = JSON.parse(raw);
      const criticalReview: Record<string, CriticalEntry> = {};
      for (const [k, v] of Object.entries(p.criticalReview || {})) {
        const e = v as any;
        criticalReview[k] = { termId: e.termId, term: e.term, errorCount: e.errorCount ?? 0, correctStreak: e.correctStreak ?? 0, addedAt: e.addedAt ?? Date.now(), interval: e.interval ?? 1, nextReview: e.nextReview ?? Date.now() };
      }
      return { clearedTermIds: [], studyStreak: 0, lastStudyDate: '', dailyChallengeDate: '', dailyChallengeTermIds: [], earnedAchievements: [], studiedCount: 0, classIds: [], srsDeck: {}, ...p, criticalReview };
    }
  } catch {}
  return { username, decks: [], criticalReview: {}, srsDeck: {}, gameScores: {}, clearedTermIds: [], studyStreak: 0, lastStudyDate: '', dailyChallengeDate: '', dailyChallengeTermIds: [], earnedAchievements: [], studiedCount: 0, classIds: [] };
}

function saveUser(data: UserData) {
  try { localStorage.setItem(storageKey(data.username), JSON.stringify(data)); } catch {}
}

function getRecentUsers(): string[] {
  try { const r = localStorage.getItem(RECENT_KEY); return r ? JSON.parse(r) : []; } catch { return []; }
}

function saveRecentUsers(users: string[]) {
  try { localStorage.setItem(RECENT_KEY, JSON.stringify(users.slice(0, 6))); } catch {}
}

function calcStreak(prev: UserData): Pick<UserData, 'studyStreak' | 'lastStudyDate'> {
  const today = todayStr();
  if (prev.lastStudyDate === today) return { studyStreak: prev.studyStreak, lastStudyDate: prev.lastStudyDate };
  if (prev.lastStudyDate === yesterdayStr()) return { studyStreak: prev.studyStreak + 1, lastStudyDate: today };
  return { studyStreak: 1, lastStudyDate: today };
}

function checkAchievements(user: UserData, earned: string[]): string[] {
  const newly: string[] = [];
  const has = (id: string) => earned.includes(id);
  const cleared = user.clearedTermIds.length;
  if (!has('first_correct') && cleared >= 1) newly.push('first_correct');
  if (!has('streak_3') && user.studyStreak >= 3) newly.push('streak_3');
  if (!has('streak_7') && user.studyStreak >= 7) newly.push('streak_7');
  if (!has('streak_30') && user.studyStreak >= 30) newly.push('streak_30');
  if (!has('terms_50') && cleared >= 50) newly.push('terms_50');
  if (!has('terms_100') && cleared >= 100) newly.push('terms_100');
  if (!has('terms_500') && cleared >= 500) newly.push('terms_500');
  if (!has('no_critical') && Object.keys(user.criticalReview).length === 0 && user.studiedCount > 0) newly.push('no_critical');
  return newly;
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [recentUsers, setRecentUsers] = useState<string[]>(getRecentUsers);
  const syncListeners = useRef<Set<(u: UserData) => void>>(new Set());

  const onSyncNeeded = useCallback((cb: (u: UserData) => void) => {
    syncListeners.current.add(cb);
    return () => syncListeners.current.delete(cb);
  }, []);

  const login = useCallback((username: string) => {
    const trimmed = username.trim();
    if (!trimmed) return;
    const data = loadUser(trimmed);
    setUser(data);
    const updated = [trimmed, ...recentUsers.filter(u => u !== trimmed)];
    setRecentUsers(updated);
    saveRecentUsers(updated);
  }, [recentUsers]);

  const logout = useCallback(() => setUser(null), []);

  const update = useCallback((fn: (prev: UserData) => UserData) => {
    setUser(prev => {
      if (!prev) return prev;
      const next = fn(prev);
      saveUser(next);
      syncListeners.current.forEach(cb => cb(next));
      return next;
    });
  }, []);

  const recordMiss = useCallback((termId: string, term: string) => {
    update(prev => {
      const existing = prev.criticalReview[termId];
      const streak = calcStreak(prev);
      return {
        ...prev, ...streak,
        studiedCount: prev.studiedCount + 1,
        criticalReview: {
          ...prev.criticalReview,
          [termId]: { termId, term, errorCount: (existing?.errorCount ?? 0) + 1, correctStreak: 0, addedAt: existing?.addedAt ?? Date.now(), interval: 1, nextReview: msFromNow(1) },
        },
      };
    });
  }, [update]);

  const recordCorrect = useCallback((termId: string) => {
    update(prev => {
      const streak = calcStreak(prev);
      const cleared = prev.clearedTermIds.includes(termId) ? prev.clearedTermIds : [...prev.clearedTermIds, termId];
      const existing = prev.criticalReview[termId];
      const newStudied = prev.studiedCount + 1;
      const newUser: UserData = { ...prev, ...streak, clearedTermIds: cleared, studiedCount: newStudied };
      if (!existing) {
        const newlyEarned = checkAchievements(newUser, prev.earnedAchievements);
        return { ...newUser, earnedAchievements: [...prev.earnedAchievements, ...newlyEarned] };
      }
      const newInterval = existing.interval * 2;
      const mastered = newInterval >= 8;
      const nextCrit = mastered ? (() => { const c = { ...prev.criticalReview }; delete c[termId]; return c; })() : {
        ...prev.criticalReview,
        [termId]: { ...existing, correctStreak: existing.correctStreak + 1, interval: newInterval, nextReview: msFromNow(newInterval) },
      };
      const withCrit = { ...newUser, criticalReview: nextCrit };
      const newlyEarned = checkAchievements(withCrit, prev.earnedAchievements);
      return { ...withCrit, earnedAchievements: [...prev.earnedAchievements, ...newlyEarned] };
    });
  }, [update]);

  const awardAchievement = useCallback((id: string) => {
    update(prev => {
      if (prev.earnedAchievements.includes(id)) return prev;
      return { ...prev, earnedAchievements: [...prev.earnedAchievements, id] };
    });
  }, [update]);

  const savePath = useCallback((path: string) => { update(prev => ({ ...prev, lastPath: path })); }, [update]);
  const addDeck = useCallback((name: string, termIds: string[]) => { update(prev => ({ ...prev, decks: [...prev.decks, { id: Date.now().toString(), name, termIds, createdAt: Date.now() }] })); }, [update]);
  const removeDeck = useCallback((deckId: string) => { update(prev => ({ ...prev, decks: prev.decks.filter(d => d.id !== deckId) })); }, [update]);
  const updateScore = useCallback((gameKey: string, score: number) => { update(prev => ({ ...prev, gameScores: { ...prev.gameScores, [gameKey]: Math.max(prev.gameScores[gameKey] ?? 0, score) } })); }, [update]);

  const updateSRS = useCallback((termId: string, quality: "wrong" | "hard" | "easy") => {
    update(prev => {
      const existing = (prev.srsDeck ?? {})[termId];
      let interval = existing?.interval ?? 1;
      if (quality === "wrong") interval = 1;
      else if (quality === "easy") interval = Math.min(interval * 2, 90);
      return {
        ...prev,
        srsDeck: {
          ...(prev.srsDeck ?? {}),
          [termId]: { termId, interval, nextReview: Date.now() + interval * 86_400_000, totalReviews: (existing?.totalReviews ?? 0) + 1 },
        },
      };
    });
  }, [update]);

  return (
    <UserContext.Provider value={{ user, login, logout, recordMiss, recordCorrect, awardAchievement, savePath, addDeck, removeDeck, updateScore, updateSRS, recentUsers, onSyncNeeded }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be inside UserProvider');
  return ctx;
}
