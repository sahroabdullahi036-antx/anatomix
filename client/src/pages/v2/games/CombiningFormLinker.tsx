import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { useUser } from "@/contexts/UserContext";
import { ALL_TERMS } from "@/data/medicalData";
import { GameShell, shuffle } from "./shared";

function sharesRoot(a: typeof ALL_TERMS[0], b: typeof ALL_TERMS[0]): boolean {
  const getTokens = (s: string) => s.toLowerCase().replace(/[^a-z/]/g, "").split("/").filter(t => t.length > 2);
  const aTokens = [...getTokens(a.term), ...getTokens(a.meaning)];
  const bTokens = [...getTokens(b.term), ...getTokens(b.meaning)];
  return aTokens.some(t => bTokens.includes(t)) || a.system === b.system;
}

export default function CombiningFormLinker() {
  const [, navigate] = useLocation();
  const { updateScore } = useUser();
  const pool = useMemo(() => shuffle(ALL_TERMS.filter(t => t.type === "root" || t.type === "condition")), []);
  const [chain, setChain] = useState<typeof ALL_TERMS>([pool[0]]);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [wrong, setWrong] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);

  const last = chain[chain.length - 1];
  const options = useMemo(() => {
    const used = new Set(chain.map(t => t.id));
    return shuffle(pool.filter(t => !used.has(t.id))).slice(0, 6);
  }, [chain, pool]);

  const handleSelect = (term: typeof ALL_TERMS[0]) => {
    if (completed) return;
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

  return (
    <GameShell title="Combining Form Linker" score={score} streak={streak} idx={chain.length - 1} total={8} onBack={() => navigate("/games")}>
      <div style={{ backgroundColor: "rgba(0,0,0,0.2)", borderRadius: "14px", padding: "20px", marginBottom: "20px" }}>
        <div style={{ color: "rgba(252,250,247,0.5)", fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", marginBottom: "12px" }}>
          Build a chain of 8  -  each card must share a root or suffix with the previous one:
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

      {completed ? (
        <div style={{ textAlign: "center", padding: "24px" }}>
          <div style={{ fontSize: "48px", marginBottom: "12px" }}>🔗</div>
          <div style={{ color: "#90e090", fontWeight: "800", fontSize: "1.3rem", marginBottom: "8px" }}>Chain Complete!</div>
          <div style={{ color: "rgba(252,250,247,0.6)", marginBottom: "20px" }}>Final score: {score}</div>
          <button onClick={reset} style={{ padding: "12px 28px", borderRadius: "10px", backgroundColor: "#fcfaf7", color: "#8b4f58", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: "700" }}>New Chain →</button>
        </div>
      ) : (
        <>
          <div style={{ color: "rgba(252,250,247,0.5)", fontSize: "0.8rem", marginBottom: "10px" }}>Select the next card that shares a root or suffix with <strong style={{ color: "#fcfaf7" }}>{last.term}</strong>:</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
            {options.map(t => (
              <button key={t.id} onClick={() => handleSelect(t)}
                style={{ padding: "12px", borderRadius: "10px", backgroundColor: wrong === t.id ? "rgba(200,80,80,0.3)" : "rgba(252,250,247,0.08)", border: wrong === t.id ? "1px solid rgba(220,100,100,0.4)" : "1px solid rgba(252,250,247,0.1)", color: "#fcfaf7", cursor: "pointer", fontFamily: "monospace", fontWeight: "700", fontSize: "0.82rem", transition: "all 0.15s", textAlign: "center" as const }}>
                {t.term}
                <div style={{ fontSize: "0.68rem", color: "rgba(252,250,247,0.5)", marginTop: "4px", fontFamily: "inherit" }}>{t.system}</div>
              </button>
            ))}
          </div>
        </>
      )}
    </GameShell>
  );
}
