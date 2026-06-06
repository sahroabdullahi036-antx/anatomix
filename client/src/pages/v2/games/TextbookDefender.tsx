import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { useUser } from "@/contexts/UserContext";
import { ALL_TERMS } from "@/data/medicalData";
import { GameShell, shuffle } from "./shared";

export default function TextbookDefender() {
  const [, navigate] = useLocation();
  const { recordMiss, recordCorrect, updateScore } = useUser();
  const terms = useMemo(() => shuffle(ALL_TERMS.filter(t => t.type === "condition" || t.type === "root")), []);
  const [idx, setIdx] = useState(0);
  const [destroyed, setDestroyed] = useState<string[]>([]);
  const [wrong, setWrong] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);

  const current = terms[idx % terms.length];
  const { correct, invaders } = useMemo(() => {
    if (!current) return { correct: "", invaders: [] };
    const others = shuffle(ALL_TERMS.filter(t => t.id !== current.id)).slice(0, 2);
    const inv = shuffle([current.casualMeaning, ...others.map(t => t.casualMeaning)]);
    return { correct: current.casualMeaning, invaders: inv };
  }, [idx, current?.id]);

  const handleTap = (def: string) => {
    if (done) return;
    if (def === correct) {
      setWrong(def);
      setStreak(0);
      recordMiss(current.id, current.term);
      setTimeout(() => setWrong(null), 700);
    } else {
      setDestroyed(d => {
        const next = [...d, def];
        if (next.length === 2) {
          setDone(true);
          setScore(s => s + 15 + streak * 3);
          setStreak(s => s + 1);
          recordCorrect(current.id);
        }
        return next;
      });
    }
  };

  const next = () => {
    updateScore("textbook-defender", score);
    setDestroyed([]); setDone(false); setWrong(null); setIdx(i => i + 1);
  };

  if (!current) return null;

  return (
    <GameShell title="Textbook Defender" score={score} streak={streak} idx={idx} total={terms.length} onBack={() => navigate("/games")}>
      <div style={{ backgroundColor: "rgba(0,0,0,0.2)", borderRadius: "14px", padding: "24px", marginBottom: "24px", textAlign: "center" }}>
        <div style={{ color: "rgba(252,250,247,0.5)", fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", marginBottom: "10px" }}>
          TAP and DESTROY the 2 INCORRECT definitions  -  protect the true one!
        </div>
        <div style={{ color: "#fcfaf7", fontSize: "1.8rem", fontWeight: "800", fontFamily: "monospace" }}>{current.term}</div>
        <div style={{ color: "rgba(252,250,247,0.5)", fontSize: "0.85rem", marginTop: "6px" }}>{current.type}  -  {current.system}</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
        {invaders.map((def, i) => {
          const isDestroyed = destroyed.includes(def);
          const isCorrect = def === correct;
          const isWrong = wrong === def;
          return (
            <button
              key={i}
              onClick={() => handleTap(def)}
              disabled={isDestroyed || done}
              style={{
                padding: "18px 20px", borderRadius: "12px", textAlign: "left" as const, fontFamily: "inherit", cursor: (isDestroyed || done) ? "default" : "pointer",
                backgroundColor: isDestroyed ? "rgba(80,160,80,0.2)" : isWrong ? "rgba(200,80,80,0.4)" : done && isCorrect ? "rgba(100,180,100,0.3)" : "rgba(252,250,247,0.08)",
                border: isDestroyed ? "1px solid rgba(100,200,100,0.4)" : isWrong ? "1px solid rgba(220,100,100,0.5)" : done && isCorrect ? "2px solid rgba(100,200,100,0.6)" : "1px solid rgba(252,250,247,0.1)",
                color: "#fcfaf7", fontSize: "0.9rem", lineHeight: 1.5, transition: "all 0.15s",
                opacity: isDestroyed ? 0.5 : 1,
                textDecoration: isDestroyed ? "line-through" : "none",
              }}>
              {isDestroyed ? "💥 DESTROYED" : def}
              {done && isCorrect && !isDestroyed && <span style={{ color: "#90e090", marginLeft: "10px", fontWeight: "700" }}>✓ Correct definition</span>}
            </button>
          );
        })}
      </div>

      {done && (
        <div style={{ textAlign: "center" }}>
          <div style={{ color: "#90e090", fontWeight: "700", marginBottom: "10px" }}>✓ Defended! +{15 + (streak - 1) * 3} pts</div>
          <div style={{ color: "rgba(252,250,247,0.65)", fontSize: "0.85rem", marginBottom: "14px" }}>{current.definition}</div>
          <button onClick={next} style={{ padding: "12px 28px", borderRadius: "10px", backgroundColor: "#fcfaf7", color: "#8b4f58", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: "700" }}>Next →</button>
        </div>
      )}
    </GameShell>
  );
}
