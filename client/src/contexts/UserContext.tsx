import React, { createContext, useContext, useState, useCallback } from 'react';

export interface UserData {
  username: string;
  decks: CustomDeck[];
  criticalReview: Record<string, CriticalEntry>;
  gameScores: Record<string, number>;
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

function loadUser(username: string): UserData {
  try {
    const raw = localStorage.getItem(storageKey(username));
    if (raw) return JSON.parse(raw);
  } catch {}
  return { username, decks: [], criticalReview: {}, gameScores: {} };
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

  const logout = useCallback(() => {
    setUser(null);
  }, []);

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
      return {
        ...prev,
        criticalReview: {
          ...prev.criticalReview,
          [termId]: {
            termId,
            term,
            errorCount: (existing?.errorCount ?? 0) + 1,
            correctStreak: 0,
            addedAt: existing?.addedAt ?? Date.now(),
          }
        }
      };
    });
  }, [update]);

  const recordCorrect = useCallback((termId: string) => {
    update(prev => {
      const existing = prev.criticalReview[termId];
      if (!existing) return prev;
      const newStreak = existing.correctStreak + 1;
      if (newStreak >= 2) {
        const next = { ...prev.criticalReview };
        delete next[termId];
        return { ...prev, criticalReview: next };
      }
      return {
        ...prev,
        criticalReview: {
          ...prev.criticalReview,
          [termId]: { ...existing, correctStreak: newStreak }
        }
      };
    });
  }, [update]);

  const savePath = useCallback((path: string) => {
    update(prev => ({ ...prev, lastPath: path }));
  }, [update]);

  const addDeck = useCallback((name: string, termIds: string[]) => {
    update(prev => ({
      ...prev,
      decks: [...prev.decks, { id: Date.now().toString(), name, termIds, createdAt: Date.now() }]
    }));
  }, [update]);

  const removeDeck = useCallback((deckId: string) => {
    update(prev => ({ ...prev, decks: prev.decks.filter(d => d.id !== deckId) }));
  }, [update]);

  const updateScore = useCallback((gameKey: string, score: number) => {
    update(prev => ({
      ...prev,
      gameScores: { ...prev.gameScores, [gameKey]: Math.max(prev.gameScores[gameKey] ?? 0, score) }
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
