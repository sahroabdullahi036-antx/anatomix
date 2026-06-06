import { ALL_TERMS, type MedicalTerm } from './medicalData';

export interface TermLookupResult {
  meaning: string;
  type: MedicalTerm['type'];
  casualMeaning: string;
  system: string;
  example: string;
  definition: string;
  matched: 'exact' | 'composed' | 'none';
}

type PartKind = 'prefix' | 'root' | 'suffix';

interface PartEntry {
  key: string;
  source: MedicalTerm;
  kind: PartKind;
}

function normalize(value: string): string {
  return value.toLowerCase().trim().replace(/\s+/g, '');
}

// Split a stored term string like "hem/o, hemat/o" or "a-, an-" into variants.
function splitVariants(term: string): string[] {
  return term.split(',').map(v => v.trim()).filter(Boolean);
}

// Generate the matchable keys for a single variant based on the term type.
function variantKeys(variant: string, type: MedicalTerm['type']): { key: string; kind: PartKind }[] {
  const out: { key: string; kind: PartKind }[] = [];
  const lower = variant.toLowerCase();

  if (type === 'prefix') {
    out.push({ key: lower.replace(/-+$/g, ''), kind: 'prefix' });
    return out;
  }
  if (type === 'suffix') {
    out.push({ key: lower.replace(/^-+/g, ''), kind: 'suffix' });
    return out;
  }
  if (type === 'root') {
    // Combining forms like "cardi/o" -> "cardi" (base), "cardio" (with vowel),
    // and "card" (vowel-dropped form used before a vowel-initial suffix, e.g. carditis).
    if (lower.includes('/')) {
      const [base, vowel] = lower.split('/');
      if (base) out.push({ key: base, kind: 'root' });
      if (base && vowel) out.push({ key: base + vowel, kind: 'root' });
      if (base && /[aeiou]$/.test(base) && base.length > 2) {
        out.push({ key: base.slice(0, -1), kind: 'root' });
      }
    } else {
      const bare = lower.replace(/-/g, '');
      out.push({ key: bare, kind: 'root' });
      if (/[aeiou]$/.test(bare) && bare.length > 2) out.push({ key: bare.slice(0, -1), kind: 'root' });
    }
    return out;
  }
  // word / condition / procedure -> match the whole word.
  out.push({ key: lower.replace(/[-/]/g, ''), kind: 'root' });
  return out;
}

// Build the indexes once at module load.
const prefixMap = new Map<string, PartEntry>();
const suffixMap = new Map<string, PartEntry>();
const rootMap = new Map<string, PartEntry>();
const exactMap = new Map<string, MedicalTerm>();

for (const entry of ALL_TERMS) {
  for (const variant of splitVariants(entry.term)) {
    // Exact-match index: normalized full variant (e.g. "cardi/o", "-itis", "hyper-").
    exactMap.set(normalize(variant), entry);
    exactMap.set(normalize(variant.replace(/[-/]/g, '')), entry);

    for (const { key, kind } of variantKeys(variant, entry.type)) {
      if (!key) continue;
      const target = kind === 'prefix' ? prefixMap : kind === 'suffix' ? suffixMap : rootMap;
      if (!target.has(key)) target.set(key, { key, source: entry, kind });
    }
  }
}

const prefixKeys = [...prefixMap.keys()].sort((a, b) => b.length - a.length);
const suffixKeys = [...suffixMap.keys()].sort((a, b) => b.length - a.length);
const rootKeys = [...rootMap.keys()].sort((a, b) => b.length - a.length);

// Strict left-to-right tokenizer: the whole segment must resolve to known roots
// (optionally separated/trailed by a single connecting vowel). Returns null if it
// cannot be fully consumed, so we never compose meaning from garbage input.
function tokenizeRoots(segment: string): PartEntry[] | null {
  if (segment.length === 0) return [];
  const found: PartEntry[] = [];
  let rest = segment;
  let guard = 0;
  while (rest.length > 0 && guard < 8) {
    guard++;
    const match = rootKeys.find(k => rest.startsWith(k));
    if (!match) {
      // Allow a single trailing connecting vowel (e.g. leftover "o").
      if (rest.length === 1 && 'oia'.includes(rest)) return found;
      return null;
    }
    found.push(rootMap.get(match)!);
    rest = rest.slice(match.length);
    // Consume one connecting vowel between roots.
    if (rest.length > 0 && 'oia'.includes(rest[0])) rest = rest.slice(1);
  }
  return rest.length === 0 ? found : null;
}

function classifyType(suffix: PartEntry | null, roots: PartEntry[]): MedicalTerm['type'] {
  if (suffix) {
    const s = suffix.source.meaning.toLowerCase();
    if (/(removal|incision|repair|puncture|fixation|suture|excision|surgical|examination|viewing|creating)/.test(s)) {
      return 'procedure';
    }
    if (/(inflammation|condition|disease|pain|abnormal|tumor|enlargement|hardening|softening|deficiency|narrowing|drooping|bursting|breakdown|destruction|swelling)/.test(s)) {
      return 'condition';
    }
  }
  if (roots.length) return 'word';
  return 'word';
}

// Decompose an unknown medical word into known parts and synthesize a result.
export function lookupLocalTerm(raw: string): TermLookupResult {
  const norm = normalize(raw);
  const empty: TermLookupResult = {
    meaning: '', type: 'word', casualMeaning: '', system: 'General', example: '', definition: '', matched: 'none',
  };
  if (!norm) return empty;

  // 1. Exact match against a known term or word part.
  const exact = exactMap.get(norm);
  if (exact) {
    return {
      meaning: exact.meaning,
      type: exact.type,
      casualMeaning: exact.casualMeaning,
      system: exact.system,
      example: exact.example,
      definition: exact.definition,
      matched: 'exact',
    };
  }

  // 2. Decompose: optional prefix, one or more roots, optional suffix.
  let stem = norm;
  let prefix: PartEntry | null = null;
  let suffix: PartEntry | null = null;

  const pfx = prefixKeys.find(k => stem.startsWith(k) && stem.length > k.length);
  if (pfx) { prefix = prefixMap.get(pfx)!; stem = stem.slice(pfx.length); }

  const sfx = suffixKeys.find(k => stem.endsWith(k) && stem.length > k.length);
  if (sfx) { suffix = suffixMap.get(sfx)!; stem = stem.slice(0, stem.length - sfx.length); }

  const roots = tokenizeRoots(stem);
  // The middle must resolve fully to known roots; otherwise it isn't a real decomposition.
  if (roots === null) return empty;

  const usedParts: PartEntry[] = [
    ...(prefix ? [prefix] : []),
    ...roots,
    ...(suffix ? [suffix] : []),
  ];

  // Require a genuine combination: at least two parts (e.g. root+suffix or prefix+suffix).
  // Single canonical parts are already handled by the exact-match path above.
  if (usedParts.length < 2) return empty;

  const meaningPieces = usedParts.map(p => p.source.meaning).filter(Boolean);
  const casualPieces = usedParts.map(p => p.source.casualMeaning).filter(Boolean);

  // Pick the system from a root first, otherwise from any part that names one.
  const systemSource =
    roots.find(r => r.source.system && r.source.system !== 'General')?.source.system ??
    usedParts.find(p => p.source.system && p.source.system !== 'General')?.source.system ??
    'General';

  const partLabels = usedParts
    .map(p => `${p.source.term.split(',')[0].trim()} (${p.source.meaning})`)
    .join(' + ');

  return {
    meaning: meaningPieces.join(', '),
    type: classifyType(suffix, roots),
    casualMeaning: casualPieces.join('; '),
    system: systemSource,
    example: norm,
    definition: `Built from word parts: ${partLabels}.`,
    matched: 'composed',
  };
}
