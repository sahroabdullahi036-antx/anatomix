/**
 * Strip slashes, hyphens, commas, spaces and lowercase for comparison.
 * e.g. "hem/o, hemat/o" → "hemohemat o" is NOT what we want —
 * we split on commas first, then normalize each token individually.
 */
const normToken = (s: string): string =>
  s.toLowerCase().trim().replace(/[\/\-\s]+/g, "");

/**
 * Split a term that may list multiple forms separated by commas.
 * "hem/o, hemat/o"   → ["hem/o", "hemat/o"]
 * "a-, an-"          → ["a-", "an-"]
 * "ven/o, phleb/o"   → ["ven/o", "phleb/o"]
 */
export const splitTermForms = (term: string): string[] =>
  term.split(/,\s*/).map(f => f.trim()).filter(Boolean);

/**
 * Normalize a single answer token for comparison.
 * Removes hyphens, slashes, spaces; lowercases.
 */
export const normalizeAnswer = (answer: string): string => normToken(answer);

/**
 * Check whether userAnswer matches correctAnswer.
 *
 * Handles:
 * - Case insensitivity
 * - Leading/trailing whitespace
 * - Hyphen and slash variants  (hemo === hem/o, brady === brady-)
 * - Multi-form terms separated by commas  (accepts ANY listed form)
 * - 1-character typo tolerance on words >= 7 chars
 */
export const checkAnswer = (userAnswer: string, correctAnswer: string): boolean => {
  const userNorm = normToken(userAnswer);
  if (!userNorm) return false;

  const forms = splitTermForms(correctAnswer);

  for (const form of forms) {
    const formNorm = normToken(form);
    if (userNorm === formNorm) return true;

    // 1-char typo tolerance for longer words
    if (
      formNorm.length >= 7 &&
      Math.abs(userNorm.length - formNorm.length) <= 1 &&
      (formNorm.startsWith(userNorm.slice(0, formNorm.length - 1)) ||
        userNorm.startsWith(formNorm.slice(0, formNorm.length - 1)))
    ) {
      return true;
    }
  }

  return false;
};

/**
 * Validate user input for fill-in-the-blank questions.
 */
export const validateFillBlank = (userInput: string, correctTerm: string): boolean =>
  checkAnswer(userInput, correctTerm);
