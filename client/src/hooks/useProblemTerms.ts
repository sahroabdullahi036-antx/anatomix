import { useState, useEffect } from "react";

export interface ProblemTerm {
  id: string;
  term: string;
  meaning: string;
  phonetic: string;
  category: string;
  addedAt: number;
}

const STORAGE_KEY = "problemTerms";

export function useProblemTerms() {
  const [problems, setProblems] = useState<ProblemTerm[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setProblems(JSON.parse(saved));
  }, []);

  const save = (updated: ProblemTerm[]) => {
    setProblems(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const addProblem = (term: any) => {
    if (problems.find(p => p.id === term.id)) return;
    save([...problems, { id: term.id, term: term.term, meaning: term.meaning, phonetic: term.phonetic, category: term.category, addedAt: Date.now() }]);
  };

  const removeProblem = (id: string) => {
    save(problems.filter(p => p.id !== id));
  };

  const isProblem = (id: string) => problems.some(p => p.id === id);

  return { problems, addProblem, removeProblem, isProblem };
}
