import { useState, useEffect } from "react";
import { MedicalTerm } from "../lib/medicalDatabase";

export interface FlashcardState {
  id: string;
  term: string;
  type: "root" | "prefix" | "suffix" | "word";
  meaning: string;
  phonetic: string;
  example: string;
  mnemonic: string;
  category: string;
  difficulty: "easy" | "good" | "hard";
  lastReviewed: number;
  reviewCount: number;
  nextReviewDate: number;
}

const STORAGE_KEY = "study_sanctuary_flashcard_state";

export const useFlashcards = (terms: MedicalTerm[]) => {
  const [cardStates, setCardStates] = useState<Map<string, FlashcardState>>(new Map());

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setCardStates(new Map(parsed));
      } catch (error) {
        console.error("Failed to load flashcard states:", error);
      }
    }
  }, []);

  const cards = terms.map(term => {
    const state = cardStates.get(term.id);
    return {
      ...term,
      difficulty: state?.difficulty || "good",
      lastReviewed: state?.lastReviewed || 0,
      reviewCount: state?.reviewCount || 0,
      nextReviewDate: state?.nextReviewDate || Date.now()
    };
  });

  const updateCardDifficulty = (cardId: string, difficulty: "easy" | "good" | "hard") => {
    const now = Date.now();
    let daysUntilNextReview = 1;

    if (difficulty === "easy") {
      daysUntilNextReview = 7;
    } else if (difficulty === "good") {
      daysUntilNextReview = 3;
    } else if (difficulty === "hard") {
      daysUntilNextReview = 1;
    }

    const newState: FlashcardState = {
      id: cardId,
      term: "",
      type: "word",
      meaning: "",
      phonetic: "",
      example: "",
      mnemonic: "",
      category: "",
      difficulty,
      lastReviewed: now,
      reviewCount: (cardStates.get(cardId)?.reviewCount || 0) + 1,
      nextReviewDate: now + daysUntilNextReview * 24 * 60 * 60 * 1000
    };

    const updated = new Map(cardStates);
    updated.set(cardId, newState);
    setCardStates(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(updated.entries())));
  };

  const getDueCards = () => {
    const now = Date.now();
    return cards.filter(card => card.nextReviewDate <= now);
  };

  const getStats = () => {
    const totalCards = cards.length;
    const masteredCards = cards.filter(c => c.difficulty === "easy").length;
    const reviewingCards = cards.filter(c => c.difficulty === "good").length;
    const strugglingCards = cards.filter(c => c.difficulty === "hard").length;

    return {
      total: totalCards,
      mastered: masteredCards,
      reviewing: reviewingCards,
      struggling: strugglingCards,
      masteryPercentage: totalCards > 0 ? Math.round((masteredCards / totalCards) * 100) : 0
    };
  };

  return {
    cards,
    updateCardDifficulty,
    getDueCards,
    getStats
  };
};
