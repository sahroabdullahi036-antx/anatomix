/**
 * Convert a medical term string into a TTS-friendly string.
 *
 * Strategy:
 * - Strip combining-form slashes (hem/o → hemo) and leading/trailing hyphens.
 * - For very short results that TTS mispronounces (≤4 chars), use the first
 *   word of the example sentence instead — e.g. "abduction" for "ab-".
 * - Longer terms (hyper, brady, hemo, …) are spoken as-is.
 */
export function termToSpeakText(
  term: string,
  _meaning?: string,
  example?: string,
): string {
  const first = term.split(",")[0].trim();

  const cleaned = first
    .replace(/\/[a-z]{0,2}$/i, "") // /o, /i, /a combining-form vowel
    .replace(/\//g, "")             // remaining slashes
    .replace(/^-+/, "")             // leading hyphens (suffix marker)
    .replace(/-+$/, "")             // trailing hyphens (prefix marker)
    .trim();

  // Short strings confuse TTS — speak the first example word instead
  if (cleaned.length <= 4 && example) {
    const firstWord = example.match(/^([a-zA-Z]+)/)?.[1];
    if (firstWord && firstWord.length > cleaned.length) {
      return firstWord;
    }
  }

  return cleaned;
}
