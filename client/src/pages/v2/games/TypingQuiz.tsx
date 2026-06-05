import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { useUser } from "@/contexts/UserContext";
import { GameShell, shuffle, useGameTerms } from "./shared";
import { checkAnswer } from "@/lib/answerUtils";

export default function TypingQuiz() {
  const [, navigate] = useLocation();
  const { recordMiss, recordCorrect, updateScore } = useUser();
  const terms = useGameTerms();
  const [idx, setIdx] = useState(0);
  const [input, setInput] = useState("");
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [hint, setHint] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const current = terms[idx];

  const check = () => {
    if (!input.trim() || !current) return;
    const isCorrect = checkAnswer(input, current.term);

    if (isCorrect) {
      setResult("correct");
      setScore(s => s + 10 + streak * 2);
      setStreak(s => s + 1);
      recordCorrect(current.id);
    } else {
      setResult("wrong");
      setStreak(0);
      recordMiss(current.id, current.term);
    }
  };

  const next = () => {
    updateScore("typing-quiz", score);
    setResult(null); setInput(""); setHint(false);
    setIdx(i => (i + 1) % terms.length);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  if (!current) return null;

  return (
    <GameShell title="Typing Input Quiz" emoji="⌨️" score={score} streak={streak} idx={idx} total={terms.length} onBack={() => navigate("/games")}>
      <div style={{ backgroundColor: "rgba(0,0,0,0.2)", borderRadius: "14px", padding: "28px", marginBottom: "20px" }}>
        <div style={{ color: "rgba(252,250,247,0.5)", fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "10px" }}>{current.type} · {current.system}</div>
        <div style={{ color: "#fcfaf7", fontSize: "1.1rem", fontWeight: "600", lineHeight: 1.6, marginBottom: "12px" }}>{current.definition}</div>
        <div style={{ color: "rgba(252,250,247,0.5)", fontSize: "0.85rem" }}>{current.casualMeaning}</div>
        {current.example && <div style={{ color: "rgba(252,250,247,0.45)", fontSize: "0.82rem", marginTop: "6px", fontStyle: "italic" }}>e.g. {current.example}</div>}
        {hint && <div style={{ marginTop: "12px", color: "#f0c060", fontSize: "0.85rem" }}>Hint: starts with <strong style={{ fontFamily: "monospace" }}>{current.term[0].toUpperCase()}</strong> ({current.term.length} characters)</div>}
      </div>

      <div style={{ marginBottom: "16px" }}>
        <div style={{ color: "rgba(252,250,247,0.5)", fontSize: "0.8rem", marginBottom: "8px" }}>Type the medical term:</div>
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !result && check()}
          disabled={!!result}
          placeholder="medical term..."
          autoFocus
          style={{ width: "100%", padding: "14px 16px", borderRadius: "10px", backgroundColor: "rgba(252,250,247,0.1)", border: `2px solid ${result === "correct" ? "rgba(100,200,100,0.5)" : result === "wrong" ? "rgba(220,100,100,0.5)" : "rgba(252,250,247,0.2)"}`, color: "#fcfaf7", fontFamily: "inherit", fontSize: "1rem", outline: "none", boxSizing: "border-box" }}
        />
      </div>

      {!result ? (
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={check} disabled={!input.trim()} style={{ flex: 1, padding: "12px", borderRadius: "10px", backgroundColor: input.trim() ? "#fcfaf7" : "rgba(252,250,247,0.2)", color: input.trim() ? "#8b4f58" : "rgba(252,250,247,0.4)", border: "none", cursor: input.trim() ? "pointer" : "default", fontFamily: "inherit", fontWeight: "700", fontSize: "0.95rem" }}>Submit Answer</button>
          <button onClick={() => setHint(true)} style={{ padding: "12px 16px", borderRadius: "10px", backgroundColor: "rgba(252,250,247,0.08)", color: "rgba(252,250,247,0.7)", border: "1px solid rgba(252,250,247,0.15)", cursor: "pointer", fontFamily: "inherit" }}>Hint</button>
        </div>
      ) : (
        <div>
          <div style={{ padding: "16px", borderRadius: "10px", backgroundColor: result === "correct" ? "rgba(80,160,80,0.25)" : "rgba(200,80,80,0.25)", border: `1px solid ${result === "correct" ? "rgba(100,200,100,0.4)" : "rgba(220,100,100,0.4)"}`, marginBottom: "14px" }}>
            <div style={{ color: result === "correct" ? "#90e090" : "#e09090", fontWeight: "700", marginBottom: "8px" }}>{result === "correct" ? `Correct! +${10 + (streak - 1) * 2} pts` : "Incorrect"}</div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ color: "#fcfaf7", fontSize: "0.9rem" }}>
                {result === "wrong" && <>Correct answer: </>}
                <strong style={{ fontFamily: "monospace" }}>{current.term}</strong>
              </div>

            </div>
            {result === "correct" && current.wordParts && current.wordParts.length > 0 && (
              <div style={{ marginTop: "8px", color: "rgba(252,250,247,0.7)", fontSize: "0.82rem" }}>
                Word parts: {current.wordParts.map(wp => `${wp.part} (${wp.meaning})`).join(" + ")}
              </div>
            )}
          </div>
          <button onClick={next} style={{ width: "100%", padding: "12px", borderRadius: "10px", backgroundColor: "#fcfaf7", color: "#8b4f58", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: "700" }}>Next Question</button>
        </div>
      )}
    </GameShell>
  );
}
