import React, { createContext, useContext, useState, useCallback } from 'react';

export interface UserData {
  username: string;
  decks: CustomDeck[];
  criticalReview: Record<string, CriticalEntry>;
  gameScores: Record<string, number>;
  clearedTermIds: string[];
  studyStreak: number;
  lastStudyDate: string;
  dailyChallengeDate: string;
  dailyChallengeTermIds: string[];
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

interface UserContextType {
  user: UserData | null;
  login: (username: string) => void;
  logout: () => void;
  recordMiss: (termId: string, term: string) => void;
  recordCorrect: (termId: string) => void;
  savePath: (path: string) => void;
  addDeck: (name: string, termIds: string[]) => void;
  removeDeck: (deckId: string) => void;
  updateScore: (gameKey: string, score: number) => void;
  recentUsers: string[];
}

const UserContext = createContext<UserContextType | null>(null);

const storageKey = (username: string) => `anatomix_user_${username.toLowerCase().replace(/\s+/g, '_')}`;
const RECENT_KEY = 'anatomix_recent_users';

function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}

function yesterdayStr(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

function msFromNow(days: number): number {
  return Date.now() + days * 86_400_000;
}

function loadUser(username: string): UserData {
  try {
    const raw = localStorage.getItem(storageKey(username));
    if (raw) {
      const parsed = JSON.parse(raw);
      const criticalReview: Record<string, CriticalEntry> = {};
      for (const [k, v] of Object.entries(parsed.criticalReview || {})) {
        const e = v as any;
        criticalReview[k] = {
          termId: e.termId,
          term: e.term,
          errorCount: e.errorCount ?? 0,
          correctStreak: e.correctStreak ?? 0,
          addedAt: e.addedAt ?? Date.now(),
          interval: e.interval ?? 1,
          nextReview: e.nextReview ?? Date.now(),
        };
      }
      return {
        clearedTermIds: [],
        studyStreak: 0,
        lastStudyDate: '',
        dailyChallengeDate: '',
        dailyChallengeTermIds: [],
        ...parsed,
        criticalReview,
      };
    }
  } catch {}
  return {
    username,
    decks: [],
    criticalReview: {},
    gameScores: {},
    clearedTermIds: [],
    studyStreak: 0,
    lastStudyDate: '',
    dailyChallengeDate: '',
    dailyChallengeTermIds: [],
  };
}

function saveUser(data: UserData) {
  try {
    localStorage.setItem(storageKey(data.username), JSON.stringify(data));
  } catch {}
}

function getRecentUsers(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveRecentUsers(users: string[]) {
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(users.slice(0, 6)));
  } catch {}
}

function updateStreak(prev: UserData): Pick<UserData, 'studyStreak' | 'lastStudyDate'> {
  const today = todayStr();
  if (prev.lastStudyDate === today) {
    return { studyStreak: prev.studyStreak, lastStudyDate: prev.lastStudyDate };
  }
  if (prev.lastStudyDate === yesterdayStr()) {
    return { studyStreak: prev.studyStreak + 1, lastStudyDate: today };
  }
  return { studyStreak: 1, lastStudyDate: today };
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [recentUsers, setRecentUsers] = useState<string[]>(getRecentUsers);

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
      return next;
    });
  }, []);

  const recordMiss = useCallback((termId: string, term: string) => {
    update(prev => {
      const existing = prev.criticalReview[termId];
      const streak = updateStreak(prev);
      return {
        ...prev,
        ...streak,
        criticalReview: {
          ...prev.criticalReview,
          [termId]: {
            termId,
            term,
            errorCount: (existing?.errorCount ?? 0) + 1,
            correctStreak: 0,
            addedAt: existing?.addedAt ?? Date.now(),
            interval: 1,
            nextReview: msFromNow(1),
          },
        },
      };
    });
  }, [update]);

  const recordCorrect = useCallback((termId: string) => {
    update(prev => {
      const streak = updateStreak(prev);
      const cleared = prev.clearedTermIds.includes(termId)
        ? prev.clearedTermIds
        : [...prev.clearedTermIds, termId];
      const existing = prev.criticalReview[termId];
      if (!existing) {
        return { ...prev, ...streak, clearedTermIds: cleared };
      }
      const newStreak = existing.correctStreak + 1;
      const newInterval = existing.interval * 2;
      if (newInterval >= 8) {
        const next = { ...prev.criticalReview };
        delete next[termId];
        return { ...prev, ...streak, clearedTermIds: cleared, criticalReview: next };
      }
      return {
        ...prev,
        ...streak,
        clearedTermIds: cleared,
        criticalReview: {
          ...prev.criticalReview,
          [termId]: {
            ...existing,
            correctStreak: newStreak,
            interval: newInterval,
            nextReview: msFromNow(newInterval),
          },
        },
      };
    });
  }, [update]);

  const savePath = useCallback((path: string) => {
    update(prev => ({ ...prev, lastPath: path }));
  }, [update]);

  const addDeck = useCallback((name: string, termIds: string[]) => {
    update(prev => ({
      ...prev,
      decks: [...prev.decks, { id: Date.now().toString(), name, termIds, createdAt: Date.now() }],
    }));
  }, [update]);

  const removeDeck = useCallback((deckId: string) => {
    update(prev => ({ ...prev, decks: prev.decks.filter(d => d.id !== deckId) }));
  }, [update]);

  const updateScore = useCallback((gameKey: string, score: number) => {
    update(prev => ({
      ...prev,
      gameScores: { ...prev.gameScores, [gameKey]: Math.max(prev.gameScores[gameKey] ?? 0, score) },
    }));
  }, [update]);

  return (
    <UserContext.Provider value={{ user, login, logout, recordMiss, recordCorrect, savePath, addDeck, removeDeck, updateScore, recentUsers }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be inside UserProvider');
  return ctx;
}
