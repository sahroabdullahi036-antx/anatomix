// Medical pronunciation engine.
//
// Browser text-to-speech mangles raw medical spelling ("cholecystectomy",
// "dyspnea", "-phasia"), so instead of speaking the literal term we speak a
// TTS-friendly phonetic respelling. Syllables are separated by spaces (the most
// reliable way to force a speech engine to sound out chunks correctly) and
// silent letters / Greek digraphs are resolved.
//
// PRONUNCIATIONS covers the entire spoken deck for guaranteed accuracy.
// respell() is an algorithmic fallback for any term not in the map (e.g. custom
// terms added later by moderators).

// Build-time data baked from authoritative sources (dictionaryapi.dev /
// Wiktionary): real human audio clip URLs (`a`) and IPA transcriptions (`i`),
// keyed by normalizeKey(). Used to ground pronunciation in real data where it
// exists; the rule-based engine guarantees coverage for everything else.
import generatedRaw from "@/data/pronunciations.generated.json";

type BakedEntry = { a?: string; i?: string };
const BAKED = generatedRaw as Record<string, BakedEntry>;

// Keyed by normalizeKey() output: lowercase, parentheticals removed, first
// alternative only, slashes/hyphens stripped.
const PRONUNCIATIONS: Record<string, string> = {
  // ── Prefixes ──────────────────────────────────────────────
  "a": "ay",
  "ab": "ab",
  "ad": "ad",
  "auto": "aw toh",
  "anti": "an tee",
  "bi": "by",
  "brady": "bray dee",
  "dys": "dis",
  "endo": "en doh",
  "epi": "ep ee",
  "eu": "yoo",
  "ex": "eks",
  "hemi": "heh mee",
  "hyper": "hy per",
  "hypo": "hy poh",
  "inter": "in ter",
  "intra": "in truh",
  "macro": "mak roh",
  "micro": "my kroh",
  "neo": "nee oh",
  "oligo": "ah li goh",
  "para": "pa ruh",
  "peri": "peh ree",
  "poly": "pah lee",
  "post": "pohst",
  "pre": "pree",
  "pro": "proh",
  "retro": "reh troh",
  "sub": "sub",
  "supra": "soo pruh",
  "syn": "sin",
  "tachy": "tak ee",
  "trans": "tranz",
  "tri": "try",
  "ultra": "ul truh",
  "uni": "yoo nee",

  // ── Suffixes ──────────────────────────────────────────────
  "algia": "al jee uh",
  "centesis": "sen tee sis",
  "cyte": "site",
  "desis": "dee sis",
  "dynia": "dih nee uh",
  "ectasis": "ek tuh sis",
  "ectomy": "ek tuh mee",
  "emia": "ee mee uh",
  "genesis": "jen uh sis",
  "gram": "gram",
  "graph": "graf",
  "ia": "ee uh",
  "itis": "eye tis",
  "logy": "luh jee",
  "lysis": "lih sis",
  "malacia": "muh lay shuh",
  "megaly": "meg uh lee",
  "oid": "oyd",
  "oma": "oh muh",
  "opia": "oh pee uh",
  "osis": "oh sis",
  "pathy": "puh thee",
  "penia": "pee nee uh",
  "phasia": "fay zhuh",
  "phobia": "foh bee uh",
  "plasty": "plas tee",
  "plegia": "plee juh",
  "pnea": "nee uh",
  "ptosis": "toh sis",
  "rrhage": "rij",
  "rrhaphy": "ruh fee",
  "rrhea": "ree uh",
  "rrhexis": "rek sis",
  "scope": "skohp",
  "scopy": "skuh pee",
  "stasis": "stay sis",
  "stenosis": "stuh noh sis",
  "stomy": "stuh mee",
  "therapy": "thair uh pee",
  "tomy": "tuh mee",
  "trophy": "troh fee",
  "uria": "yoor ee uh",
  "sclerosis": "skluh roh sis",

  // ── Roots / combining forms ───────────────────────────────
  "cardio": "kar dee oh",
  "arterio": "ar teer ee oh",
  "veno": "vee noh",
  "angio": "an jee oh",
  "aorto": "ay or toh",
  "atrio": "ay tree oh",
  "ventriculo": "ven trik yoo loh",
  "thrombo": "throm boh",
  "hemo": "hee moh",
  "sphygmo": "sfig moh",
  "pulmono": "pul muh noh",
  "pneumo": "noo moh",
  "broncho": "brong koh",
  "alveolo": "al vee uh loh",
  "laryngo": "luh ring goh",
  "pharyngo": "fuh ring goh",
  "tracheo": "tray kee oh",
  "pleuro": "ploor oh",
  "thoraco": "thor uh koh",
  "spiro": "spy roh",
  "naso": "nay zoh",
  "oxo": "ok soh",
  "gastro": "gas troh",
  "esophago": "ee sof uh goh",
  "entero": "en ter oh",
  "colo": "koh loh",
  "hepato": "heh pa toh",
  "cholecysto": "koh lee sis toh",
  "chole": "koh lee",
  "recto": "rek toh",
  "oro": "or oh",
  "glosso": "glos oh",
  "neuro": "noor oh",
  "encephalo": "en sef uh loh",
  "cerebro": "ser uh broh",
  "myelo": "my uh loh",
  "meningo": "muh ning goh",
  "cerebello": "seh ruh bel oh",
  "osteo": "os tee oh",
  "arthro": "ar throh",
  "myo": "my oh",
  "tendino": "ten dih noh",
  "chondro": "kon droh",
  "cranio": "kray nee oh",
  "vertebro": "ver tuh broh",
  "costo": "kos toh",
  "nephro": "nef roh",
  "cysto": "sis toh",
  "pyelo": "py uh loh",
  "uretero": "yoo ree ter oh",
  "urethro": "yoo ree throh",
  "uro": "yoor oh",
  "thyro": "thy roh",
  "adreno": "uh dree noh",
  "pancreato": "pan kree uh toh",
  "gluco": "gloo koh",
  "dermo": "der moh",
  "cutaneo": "kyoo tay nee oh",
  "onycho": "oh nik oh",
  "tricho": "trik oh",
  "lympho": "lim foh",
  "lymphadeno": "lim fad uh noh",
  "spleno": "splee noh",
  "thymo": "thy moh",
  "hystero": "his ter oh",
  "oophoro": "oh of uh roh",
  "mammo": "mam oh",
  "orcho": "or koh",
  "prostato": "pros tuh toh",
  "colpo": "kol poh",
  "erythro": "eh rith roh",
  "leuko": "loo koh",
  "thrombocyto": "throm boh sy toh",
  "hemoglobino": "hee moh gloh bih noh",
  "oculo": "ok yoo loh",
  "blepharo": "blef uh roh",
  "kerato": "ker uh toh",
  "irido": "ir ih doh",
  "retino": "reh tih noh",
  "conjunctivo": "kun junk tih voh",
  "auro": "aw roh",
  "tympano": "tim puh noh",
  "cochleo": "kok lee oh",
  "olfacto": "ol fak toh",
  "neutro": "noo troh",
  "eosino": "ee oh sih noh",
  "baso": "bay soh",
  "coagulo": "koh ag yoo loh",
  "fibrino": "fy brih noh",
  "plasmo": "plaz moh",
  "sero": "seer oh",

  // ── Conditions ────────────────────────────────────────────
  "myocardial infarction": "my oh kar dee ul in fark shun",
  "atherosclerosis": "ath uh roh skluh roh sis",
  "arteriosclerosis": "ar teer ee oh skluh roh sis",
  "hypertension": "hy per ten shun",
  "angina pectoris": "an jy nuh pek tuh ris",
  "arrhythmia": "uh rith mee uh",
  "bradycardia": "bray dee kar dee uh",
  "tachycardia": "tak ih kar dee uh",
  "thrombosis": "throm boh sis",
  "embolism": "em buh lih zum",
  "congestive heart failure": "kun jes tiv hart fayl yer",
  "aneurysm": "an yuh rih zum",
  "dyspnea": "disp nee uh",
  "apnea": "ap nee uh",
  "pneumonia": "noo mohn yuh",
  "pneumothorax": "noo moh thor aks",
  "atelectasis": "at uh lek tuh sis",
  "hemoptysis": "hee mop tih sis",
  "pleuritis": "ploo ry tis",
  "bronchitis": "brong ky tis",
  "dysphagia": "dis fay juh",
  "gastroesophageal reflux disease": "gas troh ee sof uh jee ul ree fluks dih zeez",
  "cirrhosis": "sih roh sis",
  "hepatitis": "hep uh ty tis",
  "appendicitis": "uh pen dih sy tis",
  "cholecystitis": "koh lee sis ty tis",
  "cholelithiasis": "koh lee lih thy uh sis",
  "meningitis": "men in jy tis",
  "cerebrovascular accident": "ser uh broh vas kyoo ler ak sih dent",
  "aphasia": "uh fay zhuh",
  "hemiplegia": "heh mee plee juh",
  "paraplegia": "pa ruh plee juh",
  "encephalitis": "en sef uh ly tis",
  "osteoporosis": "os tee oh puh roh sis",
  "arthritis": "ar thry tis",
  "osteomyelitis": "os tee oh my uh ly tis",
  "nephrolithiasis": "nef roh lih thy uh sis",
  "pyelonephritis": "py uh loh neh fry tis",
  "hematuria": "hee muh tyoor ee uh",
  "cystitis": "sis ty tis",
  "oliguria": "ol ig yoor ee uh",
  "diabetes mellitus": "dy uh bee teez muh ly tus",
  "hypothyroidism": "hy poh thy roy dih zum",
  "hyperthyroidism": "hy per thy roy dih zum",
  "anemia": "uh nee mee uh",
  "leukemia": "loo kee mee uh",
  "thrombocytopenia": "throm boh sy toh pee nee uh",

  // ── Procedures ────────────────────────────────────────────
  "electrocardiogram": "ee lek troh kar dee oh gram",
  "echocardiography": "ek oh kar dee og ruh fee",
  "coronary angiography": "kor uh ner ee an jee og ruh fee",
  "appendectomy": "uh pen dek tuh mee",
  "colonoscopy": "koh luh nos kuh pee",
  "cholecystectomy": "koh lee sis tek tuh mee",
  "thoracentesis": "thor uh sen tee sis",
  "bronchoscopy": "brong kos kuh pee",
  "nephrectomy": "neh frek tuh mee",
  "cystoscopy": "sis tos kuh pee",
  "arthroscopy": "ar thros kuh pee",
  "electroencephalography": "ee lek troh en sef uh log ruh fee",
  "lumbar puncture": "lum bar punk cher",
};

// Suffix respellings reused by the algorithmic fallback.
const SUFFIX_RESPELL: [string, string][] = [
  ["sclerosis", " skluh roh sis"],
  ["stenosis", " stuh noh sis"],
  ["ectomy", " ek tuh mee"],
  ["ostomy", " os tuh mee"],
  ["otomy", " ot uh mee"],
  ["centesis", " sen tee sis"],
  ["megaly", " meg uh lee"],
  ["malacia", " muh lay shuh"],
  ["genesis", " jen uh sis"],
  ["rrhaphy", " ruh fee"],
  ["rrhage", " rij"],
  ["rrhea", " ree uh"],
  ["plegia", " plee juh"],
  ["phagia", " fay juh"],
  ["phasia", " fay zhuh"],
  ["plasty", " plas tee"],
  ["penia", " pee nee uh"],
  ["pathy", " puh thee"],
  ["phobia", " foh bee uh"],
  ["scopy", " skuh pee"],
  ["scope", " skohp"],
  ["stomy", " stuh mee"],
  ["trophy", " troh fee"],
  ["lysis", " lih sis"],
  ["dynia", " dih nee uh"],
  ["algia", " al jee uh"],
  ["emia", " ee mee uh"],
  ["uria", " yoor ee uh"],
  ["itis", " eye tis"],
  ["osis", " oh sis"],
  ["logy", " luh jee"],
  ["oma", " oh muh"],
  ["pnea", " nee uh"],
  ["tomy", " tuh mee"],
  ["cyte", " site"],
  ["cele", " seel"],
  ["gram", " gram"],
];

export function normalizeKey(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/\([^)]*\)/g, " ")   // drop parentheticals e.g. (CHF)
    .split(",")[0]                 // first alternative only
    .replace(/\//g, "")            // combining slash: cardi/o -> cardio
    .replace(/^[-\s]+|[-\s]+$/g, "") // strip leading/trailing hyphens/space
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Best-effort respelling for words not in the curated map.
function respell(word: string): string {
  let w = word;

  // Silent / shifted word-initial clusters.
  w = w.replace(/^pn/, "n").replace(/^ps/, "s").replace(/^pt/, "t");
  w = w.replace(/^gn/, "n").replace(/^kn/, "n").replace(/^mn/, "n");
  w = w.replace(/^x/, "z");

  // Greek roots where ch = /k/.
  w = w
    .replace(/chol/g, "kol")
    .replace(/chondr/g, "kondr")
    .replace(/chrom/g, "krom")
    .replace(/chron/g, "kron")
    .replace(/brach/g, "brak")
    .replace(/trache/g, "trake")
    .replace(/schis/g, "skis");

  // Digraphs.
  w = w.replace(/ph/g, "f").replace(/rrh/g, "r").replace(/rh/g, "r");
  w = w.replace(/pneu/g, "noo").replace(/eu/g, "oo");
  w = w.replace(/ae/g, "ee").replace(/oe/g, "ee");

  // Suffix respelling (first match wins; list is ordered most-specific first).
  for (const [suf, rep] of SUFFIX_RESPELL) {
    if (w.endsWith(suf)) {
      w = w.slice(0, w.length - suf.length) + rep;
      break;
    }
  }

  return w.trim();
}

// ── Authoritative IPA → speech-friendly respelling ────────────
// For terms we have a real dictionary IPA transcription for but no curated
// entry (mainly terms added later). Approximate, but grounded in the
// authoritative phonetic transcription rather than guesswork. Symbols are
// matched longest-first per position.
const IPA_MAP: [string, string][] = [
  // diphthongs / long vowels / affricates (multi-codepoint first)
  ["a\u026a", "ahy"], ["e\u026a", "ay"], ["\u0254\u026a", "oy"],
  ["a\u028a", "ow"], ["o\u028a", "oh"], ["\u0259\u028a", "oh"],
  ["\u026a\u0259", "eer"], ["e\u0259", "air"], ["\u028a\u0259", "oor"],
  ["t\u0283", "ch"], ["d\u0292", "j"],
  ["i\u02d0", "ee"], ["\u0251\u02d0", "ah"], ["\u0254\u02d0", "aw"],
  ["u\u02d0", "oo"], ["\u025c\u02d0", "ur"],
  // single vowels
  ["\u025c", "ur"], ["\u025d", "ur"],
  ["i", "ee"], ["\u026a", "ih"], ["\u025b", "eh"], ["e", "eh"],
  ["\u00e6", "a"], ["\u0251", "ah"], ["\u0252", "ah"], ["\u028c", "uh"],
  ["\u0259", "uh"], ["\u0254", "aw"], ["u", "oo"], ["\u028a", "uu"],
  ["o", "oh"], ["y", "ee"],
  // consonants
  ["\u0283", "sh"], ["\u0292", "zh"], ["\u03b8", "th"], ["\u00f0", "th"],
  ["\u014b", "ng"], ["\u0279", "r"], ["r", "r"], ["j", "y"],
  ["\u0261", "g"], ["g", "g"], ["x", "k"], ["\u00e7", "h"], ["\u0294", ""],
  ["p", "p"], ["b", "b"], ["t", "t"], ["d", "d"], ["k", "k"], ["m", "m"],
  ["n", "n"], ["f", "f"], ["v", "v"], ["s", "s"], ["z", "z"], ["l", "l"],
  ["h", "h"], ["w", "w"],
];

function ipaToRespell(ipa: string): string {
  let s = ipa.replace(/[/\[\]()]/g, "");        // strip delimiters & optional-sound parens
  s = s.replace(/[\u0300-\u036f]/g, "");          // drop combining diacritics
  const syllables = s.split(/[\u02c8\u02cc.\u00b7\s]+/).filter(Boolean);
  const out = syllables
    .map((syl) => {
      let i = 0;
      let res = "";
      while (i < syl.length) {
        let matched = false;
        for (const [sym, eng] of IPA_MAP) {
          if (syl.startsWith(sym, i)) { res += eng; i += sym.length; matched = true; break; }
        }
        if (!matched) i++; // skip unknown symbol (length marks, ties, etc.)
      }
      return res;
    })
    .filter(Boolean);
  return out.join(" ").trim();
}

/** Real human audio clip URL baked at build time, if one exists for this term. */
export function bakedAudio(input: string): string | null {
  if (!input) return null;
  const key = normalizeKey(input);
  return (BAKED[key]?.a as string) ?? null;
}

/**
 * Convert a medical term (or any text) into a speech-engine-friendly string.
 * Priority: curated map (hand-tuned for the deck) > authoritative dictionary
 * IPA (great for terms added later) > algorithmic medical respelling. Every
 * path resolves to a value so coverage is guaranteed for current and future terms.
 */
export function pronounce(input: string): string {
  if (!input) return "";
  const key = normalizeKey(input);
  if (!key) return "";
  if (PRONUNCIATIONS[key]) return PRONUNCIATIONS[key];
  const ipa = BAKED[key]?.i;
  if (ipa) {
    const r = ipaToRespell(ipa);
    if (r) return r;
  }
  return key.split(" ").map(respell).join(" ");
}
