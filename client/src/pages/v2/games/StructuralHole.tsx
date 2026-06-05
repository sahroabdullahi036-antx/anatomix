import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { useUser } from "@/contexts/UserContext";
import { SYSTEMS } from "@/data/medicalData";
import { GameShell, shuffle } from "./shared";

const CHAINS = SYSTEMS.flatMap(sys =>
  sys.structures.filter(s => s.children && s.children.length > 0).map(parent => ({
    systemName: sys.casualName,
    chain: [
      { label: sys.casualName, id: sys.id },
      { label: parent.casualName, id: parent.id },
      ...(parent.children ?? []).slice(0, 2).map(c => ({ label: c.casualName, id: c.id })),
    ],
  }))
).filter(c => c.chain.length >= 3);

export default function StructuralHole() {
  const [, navigate] = useLocation();
  const { updateScore } = useUser();
  const puzzles = useMemo(() => shuffle(CHAINS), []);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);

  const puzzle = puzzles[idx % puzzles.length];
  const { chain, holeIndex } = useMemo(() => {
    const hi = Math.floor(Math.random() * puzzle.chain.length);
    return { chain: puzzle.chain, holeIndex: hi };
  }, [idx, puzzle]);

  const correct = chain[holeIndex].label;
  const options = useMemo(() => {
    const others = SYSTEMS.flatMap(s => s.structures.map(st => st.casualName)).filter(n => n !== correct);
    return shuffle([correct, ...shuffle(others).slice(0, 3)]);
  }, [idx, correct]);

  const handleSelect = (opt: string) => {
    if (selected) return;
    setSelected(opt);
    if (opt === correct) { setScore(s => s + 15 + streak * 3); setStreak(s => s + 1); }
    else setStreak(0);
  };

  const next = () => { updateScore("structural-hole", score); setSelected(null); setIdx(i => i + 1); };

  const isCorrect = selected === correct;

  return (
    <GameShell title="Fill the Structural Hole" emoji="🕳️" score={score} streak={streak} idx={idx} total={puzzles.length} onBack={() => navigate("/games")}>
      <div style={{ backgroundColor: "rgba(0,0,0,0.2)", borderRadius: "14px", padding: "24px", marginBottom: "20px" }}>
        <div style={{ color: "rgba(252,250,247,0.5)", fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", marginBottom: "16px" }}>Repair the anatomy chain — fill in the missing link:</div>
        <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
          {chain.map((link, i) => (
            <>
              <div key={link.id} style={{ padding: "10px 16px", borderRadius: "8px", backgroundColor: i === holeIndex ? (selected ? (isCorrect ? "rgba(80,160,80,0.4)" : "rgba(200,80,80,0.4)") : "rgba(252,250,247,0.1)") : "rgba(74,90,106,0.5)", border: i === holeIndex ? `2px dashed ${selected ? (isCorrect ? "rgba(100,200,100,0.6)" : "rgba(220,100,100,0.6)") : "rgba(252,250,247,0.4)"}` : "1px solid rgba(252,250,247,0.1)", color: "#fcfaf7", fontWeight: "700", fontSize: "0.9rem" }}>
                {i === holeIndex ? (selected ?? "???") : link.label}
              </div>
              {i < chain.length - 1 && <span style={{ color: "rgba(252,250,247,0.3)", fontSize: "1.2rem" }}>→</span>}
            </>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "16px" }}>
        {options.map(opt => {
          let bg = "rgba(252,250,247,0.08)";
          if (selected) {
            if (opt === correct) bg = "rgba(80,160,80,0.35)";
            else if (opt === selected) bg = "rgba(200,80,80,0.35)";
          }
          return (
            <button key={opt} onClick={() => handleSelect(opt)} disabled={!!selected}
              style={{ padding: "14px", borderRadius: "10px", backgroundColor: bg, border: "1px solid rgba(252,250,247,0.1)", color: "#fcfaf7", cursor: selected ? "default" : "pointer", fontFamily: "inherit", fontWeight: "600", fontSize: "0.9rem", transition: "all 0.15s" }}>
              {opt}
            </button>
          );
        })}
      </div>

      {selected && (
        <div style={{ textAlign: "center" }}>
          <div style={{ color: isCorrect ? "#90e090" : "#e09090", fontWeight: "700", marginBottom: "10px" }}>{isCorrect ? `✓ Correct! +${15 + (streak - 1) * 3} pts` : `✗ Answer: ${correct}`}</div>
          <button onClick={next} style={{ padding: "12px 28px", borderRadius: "10px", backgroundColor: "#fcfaf7", color: "#8b4f58", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: "700" }}>Next Chain →</button>
        </div>
      )}
    </GameShell>
  );
}
