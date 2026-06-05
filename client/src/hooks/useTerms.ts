import { useState, useEffect } from "react";
import { PRELOADED_TERMS, MedicalTerm } from "../lib/medicalDatabase";

const STORAGE_KEY = "study_sanctuary_custom_terms";

export const useTerms = () => {
  const [customTerms, setCustomTerms] = useState<MedicalTerm[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setCustomTerms(JSON.parse(stored));
      } catch (error) {
        console.error("Failed to load custom terms:", error);
      }
    }
  }, []);

  const allTerms = [...PRELOADED_TERMS, ...customTerms];

  const addCustomTerm = (term: Omit<MedicalTerm, "id" | "createdAt" | "source">) => {
    // Check if term already exists (case-insensitive)
    const isDuplicate = allTerms.some(t => t.term.toLowerCase() === term.term.toLowerCase());
    
    if (isDuplicate) {
      return { isDuplicate: true, term: null };
    }

    const newTerm: MedicalTerm = {
      ...term,
      id: `custom_${Date.now()}`,
      source: "Custom Input",
      createdAt: Date.now()
    };
    const updated = [...customTerms, newTerm];
    setCustomTerms(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return { isDuplicate: false, term: newTerm };
  };

  const deleteCustomTerm = (id: string) => {
    const updated = customTerms.filter((t) => t.id !== id);
    setCustomTerms(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  return {
    allTerms,
    customTerms,
    addCustomTerm,
    deleteCustomTerm,
    search: (query: string) => allTerms.filter(t => t.term.toLowerCase().includes(query.toLowerCase())),
    getByCategory: (category: string) => allTerms.filter(t => t.category === category),
    getCategories: () => Array.from(new Set(allTerms.map(t => t.category))),
    hasTerm: (termName: string) => allTerms.some(t => t.term.toLowerCase() === termName.toLowerCase())
  };
};
