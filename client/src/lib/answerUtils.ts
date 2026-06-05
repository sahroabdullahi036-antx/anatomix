/**
 * Normalize answer by lowercasing, trimming whitespace, and removing hyphens/slashes
 */
export const normalizeAnswer = (answer: string): string => {
  return answer
    .toLowerCase()
    .trim()
    .replace(/[\/-\s]/g, "");
};

/**
 * Enhanced answer checking that handles:
 * - Case insensitivity
 * - Whitespace trimming
 * - Flexible a/an prefix matching
 * - Hyphen and slash variations
 */
export const checkAnswer = (userAnswer: string, correctAnswer: string): boolean => {
  const normalized = normalizeAnswer(userAnswer);
  const correctNormalized = normalizeAnswer(correctAnswer);

  // Exact match after normalization
  if (normalized === correctNormalized) {
    return true;
  }

  // Handle a/an prefix variations
  // If correct answer is "a" or "an", accept any of: a, A, an, An
  if (
    (correctNormalized === "a" || correctNormalized === "an") &&
    (normalized === "a" || normalized === "an")
  ) {
    return true;
  }

  return false;
};

/**
 * Validate user input for fill-in-the-blank questions
 */
export const validateFillBlank = (userInput: string, correctTerm: string): boolean => {
  return checkAnswer(userInput, correctTerm);
};
