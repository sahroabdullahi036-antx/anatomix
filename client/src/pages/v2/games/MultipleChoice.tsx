import { useState, useCallback, useMemo } from "react";
import { useLocation } from "wouter";
import { useUser } from "@/contexts/UserContext";
import { ALL_TERMS } from "@/data/medicalData";
import { GameShell, shuffle, useGameTerms } from "./shared";

export default function MultipleChoice() {
  const [, navigate] = useLocation();
  const { recordMiss, recordCorrect, updateScore } = useUser();
  const terms = useGameTerms();
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);

  const current = terms[idx];

  const choices = useMemo(() => {
    if (!current) return [];
    const others = ALL_TERMS.filter(t => t.id !== current.id && t.type === current.type);
    const distractors = shuffle(others).slice(0, 3).map(t => t.meaning);
    return shuffle([current.meaning, ...distractors]);
  }, [current]);

  const handleSelect = (choice: string) => {
    if (selected) return;
    setSelected(choice);
    if (choice === current.meaning) {
      setScore(s => s + 10 + streak * 2);
      setStreak(s => s + 1);
      recordCorrect(current.id);
    } else {
      setStreak(0);
      recordMiss(current.id, current.term);
    }
  };

  const next = () => {
    updateScore("multiple-choice", score);
    setSelected(null);
    setIdx(i => (i + 1) % terms.length);
  };

  if (!current) return null;
  const correct = selected === current.meaning;

  return (
    <GameShell title="Multiple Choice Quiz" emoji="🎯" score={score} streak={streak} idx={idx} total={terms.length} onBack={() => navigate("/games")}>
      <div style={{ backgroundColor: "rgba(0,0,0,0.2)", borderRadius: "14px", padding: "28px", marginBottom: "20px" }}>
        <div style={{ color: "rgba(252,250,247,0.5)", fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "10px" }}>
          {current.type} · {current.system}
        </div>
        <div style={{ color: "#fcfaf7", fontSize: "2rem", fontWeight: "800", fontFamily: "monospace", marginBottom: "10px" }}>{current.term}</div>
        <div style={{ color: "rgba(252,250,247,0.6)", fontSize: "0.9rem" }}>💬 {current.casualMeaning}</div>
        {current.homonymWarning && selected && (
          <div style={{ marginTop: "14px", backgroundColor: "rgba(220,150,50,0.2)", border: "1px solid rgba(220,150,50,0.4)", borderRadius: "8px", padding: "10px 14px" }}>
            <span style={{ color: "#f0c060", fontWeight: "700", fontSize: "0.8rem" }}>⚠️ DUAL MEANING ALERT: </span>
            <span style={{ color: "rgba(252,250,247,0.75)", fontSize: "0.82rem" }}>{current.homonymWarning}</span>
          </div>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
        {choices.map((choice, i) => {
          let bg = "rgba(252,250,247,0.08)";
          let border = "1px solid rgba(252,250,247,0.12)";
          if (selected) {
            if (choice === current.meaning) { bg = "rgba(80,160,80,0.35)"; border = "1px solid rgba(100,200,100,0.5)"; }
            else if (choice === selected) { bg = "rgba(200,80,80,0.35)"; border = "1px solid rgba(220,100,100,0.5)"; }
          }
          return (
            <button key={i} onClick={() => handleSelect(choice)} disabled={!!selected}
              style={{ padding: "14px 18px", borderRadius: "10px", backgroundColor: bg, border, color: "#fcfaf7", cursor: selected ? "default" : "pointer", fontFamily: "inherit", textAlign: "left", fontSize: "0.9rem", transition: "all 0.15s" }}>
              <span style={{ color: "rgba(252,250,247,0.4)", marginRight: "10px", fontWeight: "700" }}>{String.fromCharCode(65 + i)}.</span>
              {choice}
            </button>
          );
        })}
      </div>

      {selected && (
        <div style={{ textAlign: "center" }}>
          <div style={{ color: correct ? "#90e090" : "#e09090", fontWeight: "700", fontSize: "1.1rem", marginBottom: "8px" }}>
            {correct ? `✓ Correct! +${10 + (streak - 1) * 2} pts` : "✗ Incorrect"}
          </div>
          {!correct && <div style={{ color: "rgba(252,250,247,0.6)", fontSize: "0.85rem", marginBottom: "14px" }}>Correct: <strong>{current.meaning}</strong></div>}
          <div style={{ color: "rgba(252,250,247,0.6)", fontSize: "0.82rem", marginBottom: "16px" }}>{current.definition}</div>
          <button onClick={next} style={{ padding: "12px 28px", borderRadius: "10px", backgroundColor: "#fcfaf7", color: "#8b4f58", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: "700" }}>Next Question →</button>
        </div>
      )}
    </GameShell>
  );
}
