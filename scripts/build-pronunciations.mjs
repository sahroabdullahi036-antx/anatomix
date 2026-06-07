// Build-time pronunciation data generator.
//
// For every term in the deck this bakes, from FREE no-key sources:
//   - a real human-recorded audio clip URL (gold standard) sourced primarily
//     from Wiktionary / Wikimedia Commons (huge medical coverage, real people),
//     falling back to the Free Dictionary API (dictionaryapi.dev).
//   - an IPA phonetic transcription (authoritative respelling source) from the
//     Free Dictionary API.
//
// Output: client/src/data/pronunciations.generated.json keyed by normalizeKey()
// so the runtime can look terms up instantly. Re-run whenever terms change:
//   node scripts/build-pronunciations.mjs

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const DATA_FILE = resolve(ROOT, "client/src/data/medicalData.ts");
const OUT_FILE = resolve(ROOT, "client/src/data/pronunciations.generated.json");

const UA = "AnatomiX-pronunciation-builder/1.0 (educational medical terminology app)";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ── Mirror of normalizeKey() from client/src/lib/pronunciation.ts ──
function normalizeKey(raw) {
  return raw
    .toLowerCase()
    .replace(/\([^)]*\)/g, " ")
    .split(",")[0]
    .replace(/\//g, "")
    .replace(/^[-\s]+|[-\s]+$/g, "")
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Extract all term strings from ALL_TERMS in medicalData.ts.
function extractTerms() {
  const src = readFileSync(DATA_FILE, "utf8");
  const start = src.indexOf("ALL_TERMS");
  const body = start >= 0 ? src.slice(start) : src;
  const terms = [];
  const re = /\bterm:\s*'((?:[^'\\]|\\.)*)'/g;
  let m;
  while ((m = re.exec(body))) {
    const t = m[1].trim();
    if (t && t !== "string") terms.push(t);
  }
  return terms;
}

async function fetchJson(url, { retries = 2, timeout = 8000 } = {}) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeout); // never hang on a stalled socket
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": UA, "Api-User-Agent": UA },
        signal: ctrl.signal,
      });
      clearTimeout(timer);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error(`status ${res.status}`);
      return await res.json();
    } catch (e) {
      clearTimeout(timer);
      if (attempt === retries) return null;
      await sleep(500 * Math.pow(2, attempt));
    }
  }
  return null;
}

// Score an English audio file title; higher = more preferred. <=0 means reject
// (non-English speaker). US accents preferred for clinical pronunciation.
function scoreEnglishAudio(title) {
  const t = title.toLowerCase();
  if (!/\.(ogg|wav|mp3|oga|opus)$/.test(t)) return 0;
  if (/en[-_ ]?us/.test(t)) return 5;
  if (/\(eng\)/.test(t)) return 3;            // Lingua Libre generic English
  if (/en[-_ ]?(uk|gb)/.test(t)) return 2;
  if (/en[-_ ]?(au|ca|nz|ie)/.test(t)) return 1;
  // Reject anything tagged as another language (e.g. (spa), (fra), (cat)).
  if (/\(([a-z]{3})\)/.test(t)) return 0;
  if (/\b[a-z]{2}-[a-z]{2}\b/.test(t)) return 0; // some other ll-CC tag
  return 0;
}

// Resolve a "File:..." title to a direct, query-stripped upload URL.
async function resolveFileUrl(title) {
  const api =
    "https://en.wiktionary.org/w/api.php?action=query&format=json&prop=imageinfo&iiprop=url|mime&titles=" +
    encodeURIComponent(title);
  const j = await fetchJson(api);
  const pages = j?.query?.pages;
  if (!pages) return null;
  const page = Object.values(pages)[0];
  const info = page?.imageinfo?.[0];
  if (!info?.url) return null;
  return info.url.split("?")[0]; // drop utm tracking params
}

// Find the best English human recording for a single word via Wiktionary.
async function wiktionaryAudio(word) {
  const j = await fetchJson(
    `https://en.wiktionary.org/api/rest_v1/page/media-list/${encodeURIComponent(word)}`
  );
  const items = (j?.items ?? []).filter((i) => i.type === "audio" && i.title);
  let best = null;
  let bestScore = 0;
  for (const it of items) {
    const s = scoreEnglishAudio(it.title);
    if (s > bestScore) { bestScore = s; best = it.title; }
  }
  if (!best) return null;
  return await resolveFileUrl(best);
}

// IPA (and audio fallback) from the Free Dictionary API.
async function freeDictionary(word) {
  // Best-effort only: this API is flaky/slow, so never let it stall the run.
  // It is used purely for the optional IPA fallback; audio comes from Wiktionary.
  const data = await fetchJson(
    `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`,
    { retries: 0, timeout: 5000 }
  );
  const out = { audio: null, ipa: null };
  if (Array.isArray(data)) {
    for (const entry of data) {
      for (const ph of entry?.phonetics ?? []) {
        if (!out.audio && ph?.audio && /^https?:\/\//.test(ph.audio)) out.audio = ph.audio;
        if (!out.ipa && ph?.text && ph.text.trim()) out.ipa = ph.text.trim();
      }
      if (!out.ipa && entry?.phonetic?.trim()) out.ipa = entry.phonetic.trim();
    }
  }
  return out;
}

const wordCache = new Map();
async function lookupWord(word) {
  if (wordCache.has(word)) return wordCache.get(word);
  // Real human recording first (Wiktionary), then dictionary for IPA + audio.
  const [wikt, dict] = [await wiktionaryAudio(word), await freeDictionary(word)];
  await sleep(120);
  const result = { audio: wikt || dict.audio || null, ipa: dict.ipa || null };
  wordCache.set(word, result);
  return result;
}

async function resolveKey(key) {
  const words = key.split(" ").filter(Boolean);
  if (words.length === 1) {
    const r = await lookupWord(words[0]);
    const out = {};
    if (r.audio) out.a = r.audio;
    if (r.ipa) out.i = r.ipa;
    return out;
  }
  // Multi-word phrase: audio can't be concatenated. Only bake IPA if every word
  // resolves, so we never produce a partial transcription.
  const parts = [];
  for (const w of words) {
    const r = await lookupWord(w);
    if (!r.ipa) return {};
    parts.push(r.ipa.replace(/^\/|\/$/g, "").replace(/^\[|\]$/g, ""));
  }
  return { i: "/" + parts.join(" ") + "/" };
}

function loadExisting() {
  try { return JSON.parse(readFileSync(OUT_FILE, "utf8")); } catch { return {}; }
}

function save(result) {
  writeFileSync(OUT_FILE, JSON.stringify(result, null, 0) + "\n");
}

process.on("unhandledRejection", (e) => console.error("unhandledRejection:", e?.message || e));
process.on("uncaughtException", (e) => console.error("uncaughtException:", e?.message || e));

async function run() {
  const terms = extractTerms();
  const keys = [...new Set(terms.map(normalizeKey).filter(Boolean))];
  console.log(`Extracted ${terms.length} terms -> ${keys.length} unique keys`);

  // Resumable + incremental: keep prior results, only fetch keys still missing
  // audio, and persist to disk every few items so a crash never loses progress.
  const result = loadExisting();
  for (let i = 0; i < keys.length; i++) {
    const k = keys[i];
    // Skip anything already attempted: a human recording (a) or a no-audio
    // marker (n). This guarantees forward progress across re-launches even if
    // the process is killed mid-run. To force a re-check later, delete the .n
    // markers from the generated JSON.
    if (result[k]?.a || result[k]?.n) continue;
    try {
      const data = await resolveKey(k);
      result[k] = { ...result[k], ...data };
      if (!data.a) result[k].n = 1; // attempted, no human recording found
    } catch (e) {
      console.error(`  ! error on "${k}": ${e?.message || e}`);
    }
    if ((i + 1) % 5 === 0) save(result);
    if ((i + 1) % 10 === 0) {
      const a = keys.slice(0, i + 1).filter((x) => result[x]?.a).length;
      console.log(`  ${i + 1}/${keys.length} (audio so far: ${a})`);
    }
    await sleep(120);
  }
  save(result);

  const withAudio = keys.filter((k) => result[k]?.a);
  const withIpa = keys.filter((k) => result[k]?.i);
  const noAudio = keys.filter((k) => !result[k]?.a);

  console.log(`\nCoverage report`);
  console.log(`  total keys:        ${keys.length}`);
  console.log(`  real human audio:  ${withAudio.length}`);
  console.log(`  IPA phonetics:     ${withIpa.length}`);
  console.log(`\nNo human recording (will use Google TTS / respelling):`);
  console.log("  " + noAudio.join(", "));
  console.log(`\nWrote ${OUT_FILE}`);
}

run();
