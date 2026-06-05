import { useState, useEffect, useCallback, useMemo } from "react";
import { useLocation } from "wouter";
import { useUser } from "@/contexts/UserContext";
import { ALL_TERMS } from "@/data/medicalData";
import { GameShell, shuffle, ProgressBar } from "./shared";

const TRIAGE_TERMS = ALL_TERMS.filter(t => t.type === "condition" || t.type === "word");
const TIME_PER_Q = 12;

export default function ChartTriage() {
  const [, navigate] = useLocation();
  const { recordMiss, recordCorrect, updateScore } = useUser();
  const terms = useMemo(() => shuffle(TRIAGE_TERMS), []);
  const [idx, setIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_Q);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [active, setActive] = useState(true);

  const current = terms[idx % terms.length];
  const choices = useMemo(() => {
    if (!current) return [];
    const others = shuffle(TRIAGE_TERMS.filter(t => t.id !== current.id)).slice(0, 3);
    return shuffle([current, ...others]);
  }, [idx, current]);

  useEffect(() => {
    if (selected || !active) return;
    if (timeLeft <= 0) { handleAnswer(null); return; }
    const timer = setTimeout(() => setTimeLeft(t => t - 0.1), 100);
    return () => clearTimeout(timer);
  }, [timeLeft, selected, active]);

  const handleAnswer = useCallback((choice: typeof current | null) => {
    if (selected || !current) return;
    setSelected(choice?.id ?? "timeout");
    if (choice?.id === current.id) {
      const pts = Math.round(10 + timeLeft * 2 + streak * 3);
      setScore(s => s + pts);
      setStreak(s => s + 1);
      recordCorrect(current.id);
    } else {
      setStreak(0);
      recordMiss(current.id, current.term);
    }
  }, [selected, current, timeLeft, streak]);

  const next = () => {
    updateScore("chart-triage", score);
    setSelected(null); setTimeLeft(TIME_PER_Q);
    setIdx(i => i + 1);
  };

  if (!current || !active) return null;

  const isTimeout = selected === "timeout";

  return (
    <GameShell title="Chart Triage" emoji="⏱️" score={score} streak={streak} idx={idx} total={terms.length} onBack={() => navigate("/games")}>
      <ProgressBar value={timeLeft} max={TIME_PER_Q} color={timeLeft > 6 ? "#70b070" : timeLeft > 3 ? "#e0a040" : "#e06060"} label={`Time: ${Math.ceil(timeLeft)}s`} />

      <div style={{ backgroundColor: "rgba(0,0,0,0.2)", borderRadius: "14px", padding: "24px", marginBottom: "20px" }}>
        <div style={{ color: "rgba(252,250,247,0.5)", fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", marginBottom: "10px" }}>Patient Chart — What is the medical term?</div>
        <div style={{ color: "#fcfaf7", fontSize: "1.1rem", fontWeight: "700", marginBottom: "8px" }}>Patient presents with: <em>{current.casualMeaning}</em></div>
        <div style={{ color: "rgba(252,250,247,0.6)", fontSize: "0.85rem" }}>{current.chabnerDef}</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "16px" }}>
        {choices.map(c => {
          let bg = "rgba(252,250,247,0.08)"; let border = "1px solid rgba(252,250,247,0.12)";
          if (selected) {
            if (c.id === current.id) { bg = "rgba(80,160,80,0.35)"; border = "1px solid rgba(100,200,100,0.5)"; }
            else if (c.id === selected) { bg = "rgba(200,80,80,0.35)"; border = "1px solid rgba(220,100,100,0.5)"; }
          }
          return (
            <button key={c.id} onClick={() => handleAnswer(c)} disabled={!!selected}
              style={{ padding: "16px", borderRadius: "10px", backgroundColor: bg, border, color: "#fcfaf7", cursor: selected ? "default" : "pointer", fontFamily: "inherit", fontWeight: "700", fontSize: "0.9rem", transition: "all 0.15s" }}>
              {c.term}
            </button>
          );
        })}
      </div>

      {selected && (
        <div style={{ textAlign: "center" }}>
          <div style={{ color: isTimeout ? "#f0c060" : selected === current.id ? "#90e090" : "#e09090", fontWeight: "700", marginBottom: "10px" }}>
            {isTimeout ? "⏰ Time's up!" : selected === current.id ? `✓ Correct! +${Math.round(10 + timeLeft * 2 + (streak - 1) * 3)} pts` : "✗ Wrong"}
          </div>
          {selected !== current.id && <div style={{ color: "rgba(252,250,247,0.6)", fontSize: "0.85rem", marginBottom: "10px" }}>Answer: <strong>{current.term}</strong></div>}
          <button onClick={next} style={{ padding: "12px 28px", borderRadius: "10px", backgroundColor: "#fcfaf7", color: "#8b4f58", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: "700" }}>Next →</button>
        </div>
      )}
    </GameShell>
  );
}
