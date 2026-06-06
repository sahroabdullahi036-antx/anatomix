import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { useUser } from "@/contexts/UserContext";
import { ALL_TERMS } from "@/data/medicalData";
import { GameShell, shuffle } from "./shared";

const SUFFIXES = ALL_TERMS.filter(t => t.type === "suffix");

const SCENARIOS = [
  { scenario: "The surgeon is performing a visual examination of the stomach.", root: "gastr/o", correct: "-scopy", clue: "visual exam" },
  { scenario: "The patient's stomach is being surgically removed.", root: "gastr/o", correct: "-ectomy", clue: "surgical removal" },
  { scenario: "The pathology report shows inflammation of the stomach lining.", root: "gastr/o", correct: "-itis", clue: "inflammation" },
  { scenario: "The cardiologist is studying the electrical activity of the heart.", root: "cardi/o", correct: "-gram", clue: "recording/image" },
  { scenario: "A tumor has been found in the liver tissue.", root: "hepat/o", correct: "-oma", clue: "tumor or mass" },
  { scenario: "The MRI shows the kidney is growing too large.", root: "nephr/o", correct: "-megaly", clue: "enlargement" },
  { scenario: "The patient is experiencing pain in the joints.", root: "arthr/o", correct: "-algia", clue: "pain" },
  { scenario: "A bone biopsy shows abnormal softening of the bone tissue.", root: "oste/o", correct: "-malacia", clue: "softening" },
  { scenario: "The patient has inflammation in the brain tissue.", root: "encephal/o", correct: "-itis", clue: "inflammation" },
  { scenario: "The surgeon is creating a new mouth-like opening in the colon.", root: "col/o", correct: "-stomy", clue: "surgical opening" },
  { scenario: "The white blood cell count in the bloodstream is dangerously low.", root: "leuk/o", correct: "-penia", clue: "deficiency" },
  { scenario: "The nerve disease is causing loss of sensation.", root: "neur/o", correct: "-pathy", clue: "disease" },
  { scenario: "An incision is being made into the trachea.", root: "trache/o", correct: "-tomy", clue: "surgical incision" },
  { scenario: "The spleen is being surgically enlarged (treated for dilation).", root: "splen/o", correct: "-ectomy", clue: "surgical removal" },
  { scenario: "Platelets in the blood are dangerously deficient.", root: "thrombocyt/o", correct: "-penia", clue: "deficiency" },
];

export default function RootSwap() {
  const [, navigate] = useLocation();
  const { recordMiss, recordCorrect, updateScore } = useUser();
  const scenarios = useMemo(() => shuffle(SCENARIOS), []);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);

  const current = scenarios[idx % scenarios.length];
  const choices = useMemo(() => {
    const others = shuffle(SUFFIXES.filter(s => s.term !== current.correct)).slice(0, 3).map(s => s.term);
    return shuffle([current.correct, ...others]);
  }, [idx, current.correct]);

  const handleSelect = (suf: string) => {
    if (selected) return;
    setSelected(suf);
    if (suf === current.correct) {
      setScore(s => s + 12 + streak * 2);
      setStreak(s => s + 1);
    } else {
      setStreak(0);
    }
  };

  const next = () => {
    updateScore("root-swap", score);
    setSelected(null); setIdx(i => i + 1);
  };

  const isCorrect = selected === current.correct;

  return (
    <GameShell title="Root Swap" score={score} streak={streak} idx={idx} total={scenarios.length} onBack={() => navigate("/games")}>
      <div style={{ backgroundColor: "rgba(0,0,0,0.2)", borderRadius: "14px", padding: "24px", marginBottom: "20px" }}>
        <div style={{ color: "rgba(252,250,247,0.5)", fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", marginBottom: "10px" }}>Clinical Scenario  -  select the correct suffix:</div>
        <div style={{ color: "#fcfaf7", fontSize: "1rem", fontWeight: "600", lineHeight: 1.6, marginBottom: "16px" }}>{current.scenario}</div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ color: "#fcfaf7", fontSize: "1.3rem", fontFamily: "monospace", fontWeight: "800" }}>{current.root}</span>
          <span style={{ color: "rgba(252,250,247,0.3)", fontSize: "1.2rem" }}>+</span>
          <div style={{ minWidth: "100px", padding: "8px 16px", borderRadius: "8px", backgroundColor: selected ? (isCorrect ? "rgba(80,160,80,0.4)" : "rgba(200,80,80,0.4)") : "rgba(252,250,247,0.1)", border: "1px dashed rgba(252,250,247,0.3)", color: "#fcfaf7", fontFamily: "monospace", fontWeight: "700", fontSize: "1.1rem", textAlign: "center" }}>
            {selected ?? "?"}
          </div>
        </div>
        <div style={{ color: "rgba(252,250,247,0.4)", fontSize: "0.8rem", marginTop: "10px" }}>Clue: {current.clue}</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "16px" }}>
        {choices.map(c => {
          let bg = "rgba(252,250,247,0.08)";
          if (selected) {
            if (c === current.correct) bg = "rgba(80,160,80,0.35)";
            else if (c === selected) bg = "rgba(200,80,80,0.35)";
          }
          return (
            <button key={c} onClick={() => handleSelect(c)} disabled={!!selected}
              style={{ padding: "14px", borderRadius: "10px", backgroundColor: bg, border: "1px solid rgba(252,250,247,0.1)", color: "#fcfaf7", cursor: selected ? "default" : "pointer", fontFamily: "monospace", fontWeight: "700", fontSize: "1rem", transition: "all 0.15s" }}>
              {c}
            </button>
          );
        })}
      </div>

      {selected && (
        <div>
          <div style={{ padding: "14px", borderRadius: "10px", backgroundColor: isCorrect ? "rgba(80,160,80,0.2)" : "rgba(200,80,80,0.2)", border: `1px solid ${isCorrect ? "rgba(100,200,100,0.4)" : "rgba(220,100,100,0.4)"}`, marginBottom: "14px" }}>
            <div style={{ color: isCorrect ? "#90e090" : "#e09090", fontWeight: "700", marginBottom: "4px" }}>{isCorrect ? `✓ Correct! ${current.root}${current.correct}` : `✗ Incorrect. Answer: ${current.root}${current.correct}`}</div>
            <div style={{ color: "rgba(252,250,247,0.6)", fontSize: "0.85rem" }}>{SUFFIXES.find(s => s.term === current.correct)?.meaning}</div>
          </div>
          <button onClick={next} style={{ width: "100%", padding: "12px", borderRadius: "10px", backgroundColor: "#fcfaf7", color: "#8b4f58", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: "700" }}>Next Scenario →</button>
        </div>
      )}
    </GameShell>
  );
}
