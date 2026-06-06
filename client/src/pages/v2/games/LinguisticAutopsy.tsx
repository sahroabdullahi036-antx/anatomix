import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { useUser } from "@/contexts/UserContext";
import { ALL_TERMS } from "@/data/medicalData";
import { GameShell, shuffle, useGameTerms } from "./shared";

const WORD_PART_TERMS = ALL_TERMS.filter(t => t.wordParts && t.wordParts.length >= 2);

export default function LinguisticAutopsy() {
  const [, navigate] = useLocation();
  const { recordMiss, recordCorrect, updateScore } = useUser();
  const terms = useMemo(() => shuffle(WORD_PART_TERMS), []);
  const [idx, setIdx] = useState(0);
  const [assembled, setAssembled] = useState<string[]>([]);
  const [scrambled, setScrambled] = useState<string[]>([]);
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);

  const current = terms[idx % terms.length];
  const parts = current?.wordParts ?? [];

  useMemo(() => {
    if (current) setScrambled(shuffle(parts.map(p => p.part)));
  }, [idx, current?.id]);

  const addPart = (part: string, si: number) => {
    if (result) return;
    setAssembled(a => [...a, part]);
    setScrambled(s => s.filter((_, i) => i !== si));
  };

  const removePart = (ai: number) => {
    if (result) return;
    setAssembled(a => { const p = a[ai]; setScrambled(s => [...s, p]); return a.filter((_, i) => i !== ai); });
  };

  const check = () => {
    if (!current || assembled.length !== parts.length) return;
    const correct = parts.map(p => p.part).join(",") === assembled.join(",");
    setResult(correct ? "correct" : "wrong");
    if (correct) { setScore(s => s + 15 + streak * 3); setStreak(s => s + 1); recordCorrect(current.id); }
    else { setStreak(0); recordMiss(current.id, current.term); }
  };

  const next = () => {
    updateScore("linguistic-autopsy", score);
    setResult(null); setAssembled([]); setIdx(i => i + 1);
  };

  if (!current) return <GameShell title="Linguistic Autopsy" score={score} streak={streak} idx={idx} total={terms.length} onBack={() => navigate("/games")}><div style={{ color: "#fcfaf7" }}>No terms with word parts available.</div></GameShell>;

  return (
    <GameShell title="Linguistic Autopsy" score={score} streak={streak} idx={idx} total={terms.length} onBack={() => navigate("/games")}>
      <div style={{ backgroundColor: "rgba(0,0,0,0.2)", borderRadius: "14px", padding: "24px", marginBottom: "20px" }}>
        <div style={{ color: "rgba(252,250,247,0.5)", fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", marginBottom: "10px" }}>Assemble the word parts in physiological order:</div>
        <div style={{ color: "#fcfaf7", fontSize: "1.2rem", fontWeight: "700", marginBottom: "8px" }}>💬 {current.casualMeaning}</div>
        <div style={{ color: "rgba(252,250,247,0.6)", fontSize: "0.88rem" }}>{current.definition}</div>
      </div>

      <div style={{ marginBottom: "16px" }}>
        <div style={{ color: "rgba(252,250,247,0.5)", fontSize: "0.8rem", marginBottom: "8px" }}>Your assembly (tap to remove):</div>
        <div style={{ minHeight: "52px", display: "flex", flexWrap: "wrap", gap: "8px", backgroundColor: "rgba(0,0,0,0.15)", borderRadius: "10px", padding: "12px", border: "1px dashed rgba(252,250,247,0.15)" }}>
          {assembled.map((p, i) => (
            <button key={i} onClick={() => removePart(i)} style={{ padding: "8px 14px", borderRadius: "6px", backgroundColor: "rgba(252,250,247,0.2)", color: "#fcfaf7", border: "none", cursor: "pointer", fontFamily: "monospace", fontWeight: "700" }}>{p}</button>
          ))}
          {assembled.length === 0 && <span style={{ color: "rgba(252,250,247,0.3)", fontSize: "0.85rem" }}>Tap parts below to add them...</span>}
        </div>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <div style={{ color: "rgba(252,250,247,0.5)", fontSize: "0.8rem", marginBottom: "8px" }}>Available parts (tap to select):</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {scrambled.map((p, i) => (
            <button key={i} onClick={() => addPart(p, i)} style={{ padding: "10px 16px", borderRadius: "8px", backgroundColor: "rgba(89,110,96,0.4)", color: "#fcfaf7", border: "1px solid rgba(89,110,96,0.6)", cursor: "pointer", fontFamily: "monospace", fontWeight: "700" }}>{p}</button>
          ))}
        </div>
      </div>

      {!result ? (
        <button onClick={check} disabled={assembled.length !== parts.length} style={{ width: "100%", padding: "12px", borderRadius: "10px", backgroundColor: assembled.length === parts.length ? "#fcfaf7" : "rgba(252,250,247,0.2)", color: assembled.length === parts.length ? "#8b4f58" : "rgba(252,250,247,0.4)", border: "none", cursor: assembled.length === parts.length ? "pointer" : "default", fontFamily: "inherit", fontWeight: "700" }}>
          Check Assembly
        </button>
      ) : (
        <div>
          <div style={{ padding: "16px", borderRadius: "10px", backgroundColor: result === "correct" ? "rgba(80,160,80,0.25)" : "rgba(200,80,80,0.25)", border: `1px solid ${result === "correct" ? "rgba(100,200,100,0.4)" : "rgba(220,100,100,0.4)"}`, marginBottom: "14px" }}>
            <div style={{ color: result === "correct" ? "#90e090" : "#e09090", fontWeight: "700", marginBottom: "6px" }}>{result === "correct" ? "✓ Correct sequence!" : "✗ Wrong order"}</div>
            <div style={{ color: "#fcfaf7", fontSize: "0.9rem" }}>Correct: {parts.map(p => p.part).join(" + ")} = <strong>{current.term}</strong></div>
            <div style={{ color: "rgba(252,250,247,0.6)", fontSize: "0.82rem", marginTop: "6px" }}>{parts.map(p => `${p.part} = ${p.meaning}`).join(", ")}</div>
          </div>
          <button onClick={next} style={{ width: "100%", padding: "12px", borderRadius: "10px", backgroundColor: "#fcfaf7", color: "#8b4f58", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: "700" }}>Next →</button>
        </div>
      )}
    </GameShell>
  );
}
