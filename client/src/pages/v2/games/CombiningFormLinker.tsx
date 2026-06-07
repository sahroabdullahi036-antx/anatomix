import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { useUser } from "@/contexts/UserContext";
import { ALL_TERMS } from "@/data/medicalData";
import { GameShell, shuffle, useUnlockedChapters, termsForChapters, GameLock } from "./shared";

// Derive the actual ROOT morphemes of a term: from structured wordParts (roots
// only - never prefixes/suffixes/meaning text) and, for combining-form terms,
// from the term's own slash/comma forms. Meaning text is deliberately ignored so
// shared English words ("blood", "pertaining") can't create false links.
function rootMorphemes(t: typeof ALL_TERMS[0]): Set<string> {
  const out = new Set<string>();
  if (!t) return out;
  const add = (raw: string) => {
    const x = raw.toLowerCase().replace(/[^a-z]/g, "");
    if (x.length < 2 || /^[aeiou]+$/.test(x)) return; // drop bare combining vowels
    out.add(x);
    if (x.length > 3 && x.endsWith("o")) out.add(x.slice(0, -1)); // combining-vowel variant
  };
  (t.wordParts ?? []).forEach(p => { if (p.type === "root") add(p.part); });
  if (out.size === 0) t.term.split(",").forEach(f => f.split("/").forEach(add));
  return out;
}

function sharesRoot(a: typeof ALL_TERMS[0], b: typeof ALL_TERMS[0]): boolean {
  if (!a || !b) return false;
  const A = rootMorphemes(a), B = rootMorphemes(b);
  for (const x of A) for (const y of B) {
    if (x === y) return true;
    if (x.length >= 4 && y.startsWith(x)) return true;
    if (y.length >= 4 && x.startsWith(y)) return true;
  }
  return false;
}

export default function CombiningFormLinker() {
  const [, navigate] = useLocation();
  const { updateScore } = useUser();
  const unlocked = useUnlockedChapters();
  const pool = useMemo(() => shuffle(termsForChapters(unlocked).filter(t => t.type === "root" || t.type === "condition")), [unlocked]);
  const [chain, setChain] = useState<typeof ALL_TERMS>([pool[0]]);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [wrong, setWrong] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);

  const last = chain[chain.length - 1];
  const options = useMemo(() => {
    const used = new Set(chain.map(t => t.id));
    const avail = pool.filter(t => !used.has(t.id));
    const matches = avail.filter(t => sharesRoot(last, t));
    const nonMatches = avail.filter(t => !sharesRoot(last, t));
    const picks: typeof ALL_TERMS = [];
    if (matches.length) picks.push(...shuffle(matches).slice(0, 2));
    picks.push(...shuffle(nonMatches).slice(0, 6 - picks.length));
    return shuffle(picks);
  }, [chain, pool, last]);

  // No remaining card genuinely links to the current one -> the chain ends here.
  const stuck = !completed && !options.some(t => sharesRoot(last, t));
  const done = completed || stuck;

  const handleSelect = (term: typeof ALL_TERMS[0]) => {
    if (done) return;
    if (sharesRoot(last, term)) {
      setChain(c => [...c, term]);
      setScore(s => s + 10 + streak * 2);
      setStreak(s => s + 1);
      setWrong(null);
      if (chain.length + 1 >= 8) setCompleted(true);
    } else {
      setWrong(term.id);
      setStreak(0);
      setTimeout(() => setWrong(null), 600);
    }
  };

  const reset = () => { updateScore("combining-linker", score); setChain([shuffle(pool)[0]]); setScore(0); setStreak(0); setCompleted(false); };

  if (unlocked.length === 0) return <GameLock onBack={() => navigate("/games")} onStudy={() => navigate("/flashcards")} />;
  if (!last) return (
    <GameShell title="Combining Form Linker" score={0} streak={0} idx={0} total={8} onBack={() => navigate("/games")}>
      <div style={{ color: "rgba(252,250,247,0.6)", textAlign: "center", padding: "40px 20px" }}>Not enough root/condition terms in your started chapters yet. Study more chapters to unlock this chain.</div>
    </GameShell>
  );

  return (
    <GameShell title="Combining Form Linker" score={score} streak={streak} idx={chain.length - 1} total={8} onBack={() => navigate("/games")}>
      <div style={{ backgroundColor: "rgba(0,0,0,0.2)", borderRadius: "14px", padding: "20px", marginBottom: "20px" }}>
        <div style={{ color: "rgba(252,250,247,0.5)", fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", marginBottom: "12px" }}>
          Build a chain of 8  -  each card must share a root or word-part with the previous one:
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
          {chain.map((t, i) => (
            <div key={t.id} style={{ padding: "8px 12px", borderRadius: "8px", backgroundColor: i === chain.length - 1 ? "rgba(74,90,106,0.8)" : "rgba(74,90,106,0.4)", border: i === chain.length - 1 ? "2px solid rgba(252,250,247,0.4)" : "1px solid rgba(252,250,247,0.1)", fontSize: "0.82rem", fontWeight: "700", color: "#fcfaf7", fontFamily: "monospace" }}>
              {t.term}
            </div>
          ))}
        </div>
        <div style={{ color: "rgba(252,250,247,0.4)", fontSize: "0.78rem", marginTop: "10px" }}>{chain.length}/8 linked</div>
      </div>

      {done ? (
        <div style={{ textAlign: "center", padding: "24px" }}>
          <div style={{ fontSize: "48px", marginBottom: "12px" }}>🔗</div>
          <div style={{ color: "#90e090", fontWeight: "800", fontSize: "1.3rem", marginBottom: "8px" }}>{completed ? "Chain Complete!" : "Chain Ended"}</div>
          <div style={{ color: "rgba(252,250,247,0.6)", marginBottom: "20px" }}>{stuck && !completed ? "No more cards share a word-part. " : ""}Final score: {score}</div>
          <button onClick={reset} style={{ padding: "12px 28px", borderRadius: "10px", backgroundColor: "#fcfaf7", color: "#8b4f58", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: "700" }}>New Chain →</button>
        </div>
      ) : (
        <>
          <div style={{ color: "rgba(252,250,247,0.5)", fontSize: "0.8rem", marginBottom: "10px" }}>Select the next card that shares a root or word-part with <strong style={{ color: "#fcfaf7" }}>{last.term}</strong> <span style={{ color: "rgba(252,250,247,0.4)" }}>({last.meaning})</span>:</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
            {options.map(t => (
              <button key={t.id} onClick={() => handleSelect(t)}
                style={{ padding: "12px", borderRadius: "10px", backgroundColor: wrong === t.id ? "rgba(200,80,80,0.3)" : "rgba(252,250,247,0.08)", border: wrong === t.id ? "1px solid rgba(220,100,100,0.4)" : "1px solid rgba(252,250,247,0.1)", color: "#fcfaf7", cursor: "pointer", fontFamily: "monospace", fontWeight: "700", fontSize: "0.82rem", transition: "all 0.15s", textAlign: "center" as const }}>
                {t.term}
                <div style={{ fontSize: "0.68rem", color: "rgba(252,250,247,0.5)", marginTop: "4px", fontFamily: "inherit" }}>{t.meaning}</div>
              </button>
            ))}
          </div>
        </>
      )}
    </GameShell>
  );
}
