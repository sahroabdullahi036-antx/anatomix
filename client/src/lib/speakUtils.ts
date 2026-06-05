/**
 * Convert a medical term string into the best TTS-pronounceable form.
 *
 * For multi-form terms like "a-, an-" or "hem/o, hemat/o", takes the
 * longest cleaned form — "an" and "hemat" respectively — because longer
 * strings are less likely to be read as single letters or abbreviations.
 * Never uses example sentences or meaning text.
 */
export function termToSpeakText(term: string): string {
  const forms = term
    .split(",")
    .map(f =>
      f.trim()
        .replace(/\/[a-z]{0,2}$/i, "") // strip combining-form vowel: /o, /i, /a
        .replace(/\//g, "")            // any remaining slashes
        .replace(/^-+/, "")            // leading hyphen (suffix marker)
        .replace(/-+$/, "")            // trailing hyphen (prefix marker)
        .trim()
    )
    .filter(f => f.length > 0);

  if (forms.length === 0) return term;

  // Pick the longest form — more syllables = better TTS pronunciation
  return forms.reduce((best, curr) => (curr.length > best.length ? curr : best));
}
