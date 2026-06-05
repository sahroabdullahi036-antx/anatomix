import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { useUser } from "@/contexts/UserContext";
import { ALL_TERMS } from "@/data/medicalData";
import { GameShell, shuffle } from "./shared";

function alterDef(original: string): string {
  const swaps: [RegExp, string][] = [
    [/inflammation/gi, "infection"], [/infection/gi, "inflammation"],
    [/increase/gi, "decrease"], [/decrease/gi, "increase"],
    [/above/gi, "below"], [/below/gi, "above"],
    [/upper/gi, "lower"], [/lower/gi, "upper"],
    [/excess/gi, "deficiency"], [/deficiency/gi, "excess"],
    [/dilation/gi, "constriction"], [/constriction/gi, "dilation"],
    [/hardening/gi, "softening"], [/softening/gi, "hardening"],
    [/right/gi, "left"], [/removal/gi, "insertion"],
    [/slow/gi, "rapid"], [/rapid/gi, "slow"],
  ];
  const swap = swaps[Math.floor(Math.random() * swaps.length)];
  const result = original.replace(swap[0], swap[1]);
  return result !== original ? result : original + " (but only on the opposite side)";
}

export default function TextbookTrap() {
  const [, navigate] = useLocation();
  const { recordMiss, recordCorrect, updateScore } = useUser();
  const terms = useMemo(() => shuffle(ALL_TERMS.filter(t => t.definition.length > 30)), []);
  const [idx, setIdx] = useState(0);
  const [answered, setAnswered] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);

  const current = terms[idx % terms.length];
  const { isTrapped, displayDef } = useMemo(() => {
    const trap = Math.random() > 0.5;
    return { isTrapped: trap, displayDef: trap ? alterDef(current?.definition ?? "") : (current?.definition ?? "") };
  }, [idx, current?.id]);

  const guess = (userSaysTrue: boolean) => {
    if (answered !== null) return;
    const correct = userSaysTrue !== isTrapped;
    setAnswered(correct);
    if (correct) { setScore(s => s + 12 + streak * 2); setStreak(s => s + 1); recordCorrect(current.id); }
    else { setStreak(0); recordMiss(current.id, current.term); }
  };

  const next = () => {
    updateScore("textbook-trap", score);
    setAnswered(null); setIdx(i => i + 1);
  };

  if (!current) return null;

  return (
    <GameShell title="Textbook Trap" emoji="🪤" score={score} streak={streak} idx={idx} total={terms.length} onBack={() => navigate("/games")}>
      <div style={{ backgroundColor: "rgba(0,0,0,0.2)", borderRadius: "14px", padding: "24px", marginBottom: "20px" }}>
        <div style={{ color: "rgba(252,250,247,0.5)", fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", marginBottom: "10px" }}>
          Is this definition CORRECT or does it contain a hidden error?
        </div>
        <div style={{ color: "#fcfaf7", fontSize: "1.2rem", fontWeight: "800", fontFamily: "monospace", marginBottom: "16px" }}>{current.term}</div>
        <div style={{ color: "#fcfaf7", fontSize: "0.95rem", lineHeight: 1.7, padding: "16px", backgroundColor: "rgba(252,250,247,0.06)", borderRadius: "10px" }}>
          "{displayDef}"
        </div>
      </div>

      {answered === null ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
          <button onClick={() => guess(true)} style={{ padding: "20px", borderRadius: "12px", backgroundColor: "rgba(80,160,80,0.3)", border: "1px solid rgba(100,200,100,0.4)", color: "#fcfaf7", cursor: "pointer", fontFamily: "inherit", fontWeight: "700", fontSize: "1rem" }}>
            ✓ CORRECT Definition
          </button>
          <button onClick={() => guess(false)} style={{ padding: "20px", borderRadius: "12px", backgroundColor: "rgba(200,80,80,0.3)", border: "1px solid rgba(220,100,100,0.4)", color: "#fcfaf7", cursor: "pointer", fontFamily: "inherit", fontWeight: "700", fontSize: "1rem" }}>
            ✗ CONTAINS ERROR
          </button>
        </div>
      ) : (
        <div>
          <div style={{ padding: "16px", borderRadius: "10px", backgroundColor: answered ? "rgba(80,160,80,0.25)" : "rgba(200,80,80,0.25)", border: `1px solid ${answered ? "rgba(100,200,100,0.4)" : "rgba(220,100,100,0.4)"}`, marginBottom: "14px" }}>
            <div style={{ color: answered ? "#90e090" : "#e09090", fontWeight: "700", marginBottom: "8px" }}>{answered ? `✓ Correct! +${12 + (streak - 1) * 2} pts` : "✗ Wrong"}</div>
            {isTrapped && <div style={{ color: "rgba(252,250,247,0.75)", fontSize: "0.85rem", marginBottom: "6px" }}>⚠️ This definition WAS altered. The correct definition is:</div>}
            <div style={{ color: "#fcfaf7", fontSize: "0.88rem", lineHeight: 1.6 }}>{current.definition}</div>
          </div>
          <button onClick={next} style={{ width: "100%", padding: "12px", borderRadius: "10px", backgroundColor: "#fcfaf7", color: "#8b4f58", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: "700" }}>Next →</button>
        </div>
      )}
    </GameShell>
  );
}
