/**
 * Convert a medical term string into a TTS-friendly string.
 * Very short cleaned results (e.g. "ab", "a", "bi") get the meaning appended
 * so the speech synthesizer has real words to pronounce instead of reading
 * the characters as initials or weird letter combos.
 */
export function termToSpeakText(term: string, meaning?: string): string {
  const first = term.split(",")[0].trim();

  // Strip combining-form slash notation (hem/o → hemo), leading/trailing hyphens
  const cleaned = first
    .replace(/\/[a-z]{0,2}$/i, "")  // /o, /i, /a at end of combining form
    .replace(/\//g, "")             // any remaining slashes
    .replace(/^-+/, "")             // leading hyphens (suffix marker)
    .replace(/-+$/, "")             // trailing hyphens (prefix marker)
    .trim();

  // If the result is very short, append meaning so TTS has context
  if (cleaned.length <= 4 && meaning) {
    return `${cleaned} — ${meaning}`;
  }

  return cleaned;
}
