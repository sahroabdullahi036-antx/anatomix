import { useState, useEffect, useMemo, useCallback } from "react";
import { useLocation } from "wouter";
import { useUser } from "@/contexts/UserContext";
import { shuffle, distinctByKey, useAnswerFx, ProgressBar, useUnlockedChapters, termsForChapters, GameLock, GameEmpty } from "./shared";

export default function IschemicCountdown() {
  const [, navigate] = useLocation();
  const { recordMiss, recordCorrect, updateScore } = useUser();
  const { burst } = useAnswerFx();
  const unlocked = useUnlockedChapters();
  const terms = useMemo(() => shuffle(termsForChapters(unlocked)), [unlocked]);
  const [idx, setIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [speed, setSpeed] = useState(1);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [choices, setChoices] = useState<string[]>([]);

  const current = terms[idx % terms.length];

  const newChoices = useCallback(() => {
    if (!terms[idx % terms.length]) return;
    const t = terms[idx % terms.length];
    const others = distinctByKey(shuffle(termsForChapters(unlocked).filter(x => x.id !== t.id)), x => x.meaning, t.meaning).slice(0, 3).map(x => x.meaning);
    setChoices(shuffle([t.meaning, ...others]));
  }, [idx, terms]);

  useEffect(() => { newChoices(); }, [idx]);

  useEffect(() => {
    if (gameOver || selected) return;
    if (timeLeft <= 0) { setGameOver(true); updateScore("ischemic-countdown", score); return; }
    const timer = setTimeout(() => setTimeLeft(t => t - 0.1 * speed), 100);
    return () => clearTimeout(timer);
  }, [timeLeft, gameOver, selected, speed, score]);

  const handleAnswer = (choice: string, el?: Element) => {
    if (selected || gameOver) return;
    setSelected(choice);
    if (choice === current.meaning) {
      setScore(s => s + Math.ceil(timeLeft) + streak * 2);
      setStreak(s => s + 1);
      setTimeLeft(t => Math.min(t + 5, 25));
      setSpeed(sp => Math.max(0.8, sp - 0.05));
      recordCorrect(current.id);
      burst(el);
    } else {
      setStreak(0);
      setSpeed(sp => sp + 0.15);
      setTimeLeft(t => Math.max(0, t - 3));
      recordMiss(current.id, current.term);
    }
    setTimeout(() => { setSelected(null); setIdx(i => i + 1); }, 800);
  };

  if (unlocked.length === 0) return <GameLock onBack={() => navigate("/games")} onStudy={() => navigate("/flashcards")} />;

  if (gameOver) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#8b4f58", fontFamily: "'Inter','Plus Jakarta Sans',sans-serif", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", maxWidth: "400px", padding: "40px" }}>
          <div style={{ fontSize: "64px", marginBottom: "16px" }}>💀</div>
          <h1 style={{ color: "#fcfaf7", fontSize: "2rem", fontWeight: "800", marginBottom: "8px" }}>Ischemic Event!</h1>
          <p style={{ color: "rgba(252,250,247,0.6)", marginBottom: "24px" }}>Your clinical knowledge ran out of oxygen.</p>
          <div style={{ color: "#fcfaf7", fontSize: "2.5rem", fontWeight: "800", marginBottom: "24px" }}>Score: {score}</div>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
            <button onClick={() => { setGameOver(false); setIdx(0); setTimeLeft(20); setSpeed(1); setScore(0); setStreak(0); }} style={{ padding: "12px 24px", borderRadius: "10px", backgroundColor: "#fcfaf7", color: "#8b4f58", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: "700" }}>Try Again</button>
            <button onClick={() => navigate("/games")} style={{ padding: "12px 24px", borderRadius: "10px", backgroundColor: "rgba(252,250,247,0.15)", color: "#fcfaf7", border: "1px solid rgba(252,250,247,0.2)", cursor: "pointer", fontFamily: "inherit" }}>← Games</button>
          </div>
        </div>
      </div>
    );
  }

  if (!current) return <GameEmpty onBack={() => navigate("/games")} onStudy={() => navigate("/flashcards")} />;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#8b4f58", fontFamily: "'Inter','Plus Jakarta Sans',sans-serif" }}>
      <div style={{ backgroundColor: "rgba(0,0,0,0.2)", padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(252,250,247,0.1)" }}>
        <button onClick={() => navigate("/games")} style={{ backgroundColor: "rgba(252,250,247,0.12)", color: "#fcfaf7", border: "1px solid rgba(252,250,247,0.2)", borderRadius: "8px", padding: "7px 14px", cursor: "pointer", fontFamily: "inherit", fontSize: "0.85rem" }}>← Games</button>
        <span style={{ color: "#fcfaf7", fontWeight: "700" }}>💥 Ischemic Countdown</span>
        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          {streak >= 2 && <span style={{ color: "#f0c060", fontSize: "0.85rem", fontWeight: "700" }}>🔥 {streak}x</span>}
          <span style={{ color: "#fcfaf7", fontWeight: "700" }}>Score: {score}</span>
        </div>
      </div>

      <div style={{ maxWidth: "680px", margin: "0 auto", padding: "20px 24px" }}>
        <div style={{ marginBottom: "8px" }}>
          <div style={{ color: "rgba(252,250,247,0.6)", fontSize: "0.8rem", marginBottom: "4px", display: "flex", justifyContent: "space-between" }}>
            <span>Time: {Math.ceil(timeLeft)}s</span>
            <span style={{ color: speed > 1.3 ? "#e06060" : "rgba(252,250,247,0.5)" }}>Speed: {speed.toFixed(1)}x</span>
          </div>
          <ProgressBar value={timeLeft} max={25} color={timeLeft > 12 ? "#70b070" : timeLeft > 6 ? "#e0a040" : "#e06060"} />
        </div>

        <div style={{ backgroundColor: "rgba(0,0,0,0.22)", borderRadius: "14px", padding: "24px", marginBottom: "16px", textAlign: "center" }}>
          <div style={{ color: "rgba(252,250,247,0.5)", fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", marginBottom: "10px" }}>{current.type} · {current.system}</div>
          <div style={{ color: "#fcfaf7", fontSize: "1.8rem", fontWeight: "800", fontFamily: "monospace" }}>{current.term}</div>
          <div style={{ color: "rgba(252,250,247,0.4)", fontSize: "0.82rem", marginTop: "8px" }}>Pick the correct meaning</div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
          {choices.map((c, i) => {
            let bg = "rgba(252,250,247,0.08)";
            if (selected === c) bg = c === current.meaning ? "rgba(80,160,80,0.4)" : "rgba(200,80,80,0.4)";
            if (selected && c === current.meaning) bg = "rgba(80,160,80,0.4)";
            const fx = selected ? (c === current.meaning ? " ax-correct" : c === selected ? " ax-shake" : "") : "";
            return (
              <button key={i} onClick={(e) => handleAnswer(c, e.currentTarget)} disabled={!!selected} className={`ax-pop${fx}`}
                style={{ padding: "14px", borderRadius: "10px", backgroundColor: bg, border: "1px solid rgba(252,250,247,0.1)", color: "#fcfaf7", cursor: selected ? "default" : "pointer", fontFamily: "inherit", fontSize: "0.88rem", transition: "background 0.15s" }}>
                {c}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
