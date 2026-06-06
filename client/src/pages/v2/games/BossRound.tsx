import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { useUser } from "@/contexts/UserContext";
import { ALL_TERMS } from "@/data/medicalData";
import { shuffle, WrongAnswer, WrongAnswerReview } from "./shared";

const BOSS_COUNT = 15;

function buildQ(term: typeof ALL_TERMS[0], pool: typeof ALL_TERMS) {
  const wrong = shuffle(pool.filter(t => t.id !== term.id)).slice(0, 3);
  const choices = shuffle([term, ...wrong]);
  return { term, choices };
}

export default function BossRound() {
  const [, navigate] = useLocation();
  const { recordMiss, recordCorrect } = useUser();
  const [started, setStarted] = useState(false);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [results, setResults] = useState<boolean[]>([]);
  const [finished, setFinished] = useState(false);

  const bossterms = useMemo(() => {
    const hard = ALL_TERMS.filter(t => t.type === "condition" || t.type === "procedure");
    const rest = ALL_TERMS.filter(t => t.type !== "condition" && t.type !== "procedure");
    const pool = [...shuffle(hard), ...shuffle(rest)];
    return pool.slice(0, BOSS_COUNT);
  }, []);

  const questions = useMemo(() => bossterms.map(t => buildQ(t, ALL_TERMS)), [bossterms]);

  const start = () => { setStarted(true); setIdx(0); setResults([]); setSelected(null); setRevealed(false); setFinished(false); };

  const choose = (id: string) => {
    if (revealed) return;
    const q = questions[idx];
    const correct = id === q.term.id;
    setSelected(id);
    setRevealed(true);
    if (correct) recordCorrect(q.term.id);
    else recordMiss(q.term.id, q.term.term);
    setResults(r => [...r, correct]);
  };

  const next = () => {
    if (idx + 1 >= questions.length) { setFinished(true); return; }
    setIdx(i => i + 1);
    setSelected(null);
    setRevealed(false);
  };

  const score = results.filter(Boolean).length;
  const allCorrect = score === BOSS_COUNT;

  const hdr = { backgroundColor: "rgba(0,0,0,0.3)", padding: "14px 24px", display: "flex", alignItems: "center", gap: "12px", borderBottom: "1px solid rgba(252,250,247,0.07)" };
  const backBtn: React.CSSProperties = { backgroundColor: "rgba(255,255,255,0.07)", color: "#fcfaf7", border: "1px solid rgba(252,250,247,0.1)", borderRadius: "8px", padding: "8px 16px", cursor: "pointer", fontFamily: "inherit", fontSize: "0.9rem" };

  if (!started) return (
    <div style={{ minHeight: "100vh", backgroundColor: "#252830", fontFamily: "'Inter','Plus Jakarta Sans',sans-serif" }}>
      <div style={hdr}><button onClick={() => navigate("/")} style={backBtn}>← Dashboard</button><span style={{ color: "#fcfaf7", fontWeight: "700" }}>Boss Round</span></div>
      <div style={{ maxWidth: "560px", margin: "0 auto", padding: "80px 24px", textAlign: "center" }}>
        <div style={{ color: "rgba(252,250,247,0.2)", fontSize: "3rem", marginBottom: "16px" }}>[ BOSS ]</div>
        <h1 style={{ color: "#fcfaf7", fontSize: "1.8rem", fontWeight: "800", marginBottom: "8px" }}>Boss Round</h1>
        <p style={{ color: "rgba(252,250,247,0.45)", marginBottom: "12px" }}>The {BOSS_COUNT} hardest clinical terms. No skipping. No second chances on scoring.</p>
        <p style={{ color: "rgba(252,250,247,0.3)", fontSize: "0.85rem", marginBottom: "40px" }}>Conditions and procedures from across all 13 chapters. Every miss goes to Critical Review.</p>
        <button onClick={start} style={{ padding: "14px 40px", borderRadius: "12px", backgroundColor: "#6a3040", color: "#fcfaf7", border: "1px solid rgba(200,90,90,0.3)", cursor: "pointer", fontFamily: "inherit", fontWeight: "700", fontSize: "1rem" }}>
          Begin Boss Round
        </button>
      </div>
    </div>
  );

  if (finished) {
    const wrongAnswers: WrongAnswer[] = bossterms
      .filter((_, i) => !results[i])
      .map(t => ({ term: t.term, meaning: t.meaning, definition: t.definition }));
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#252830", fontFamily: "'Inter','Plus Jakarta Sans',sans-serif" }}>
        <div style={hdr}><button onClick={() => navigate("/")} style={backBtn}>← Dashboard</button><button onClick={start} style={{ ...backBtn, marginLeft: "auto" }}>Try Again</button></div>
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
          <div style={{ padding: "48px 24px 16px", textAlign: "center" }}>
            <div style={{ fontSize: "3rem", fontWeight: "800", color: allCorrect ? "#7aaa7a" : "#c07070", marginBottom: "8px" }}>{score}/{BOSS_COUNT}</div>
            <div style={{ color: "#fcfaf7", fontWeight: "700", fontSize: "1.3rem", marginBottom: "8px" }}>{allCorrect ? "Boss Defeated" : "Not yet"}</div>
            <div style={{ color: "rgba(252,250,247,0.4)", marginBottom: "20px" }}>{allCorrect ? "All terms mastered. Achievement unlocked." : `${BOSS_COUNT - score} term${BOSS_COUNT - score !== 1 ? "s" : ""} added to Critical Review.`}</div>
            <div style={{ display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap" as const, marginBottom: "16px" }}>
              {results.map((r, i) => <div key={i} style={{ width: "28px", height: "28px", borderRadius: "6px", backgroundColor: r ? "rgba(80,150,90,0.5)" : "rgba(160,70,70,0.4)", display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ color: "#fcfaf7", fontSize: "0.7rem", fontWeight: "700" }}>{r ? "+" : "-"}</span></div>)}
            </div>
          </div>
          <WrongAnswerReview wrongs={wrongAnswers} onDone={() => navigate("/")} />
        </div>
      </div>
    );
  }

  const q = questions[idx];
  const isCorrect = selected === q.term.id;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#252830", fontFamily: "'Inter','Plus Jakarta Sans',sans-serif" }}>
      <div style={{ ...hdr, justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}><button onClick={() => setStarted(false)} style={backBtn}>Exit</button><span style={{ color: "#fcfaf7", fontWeight: "700" }}>Boss Round</span></div>
        <span style={{ color: "rgba(252,250,247,0.4)", fontSize: "0.82rem" }}>{idx + 1} / {BOSS_COUNT}</span>
      </div>
      <div style={{ maxWidth: "640px", margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ display: "flex", gap: "5px", marginBottom: "24px" }}>
          {results.map((r, i) => <div key={i} style={{ flex: 1, height: "4px", borderRadius: "2px", backgroundColor: r ? "rgba(80,150,90,0.6)" : "rgba(160,70,70,0.5)" }} />)}
          {Array.from({ length: BOSS_COUNT - results.length }).map((_, i) => <div key={i} style={{ flex: 1, height: "4px", borderRadius: "2px", backgroundColor: "rgba(255,255,255,0.08)" }} />)}
        </div>
        <div style={{ backgroundColor: "rgba(200,60,60,0.12)", borderRadius: "16px", padding: "32px", marginBottom: "20px", border: "1px solid rgba(200,60,60,0.2)" }}>
          <div style={{ color: "rgba(252,250,247,0.35)", fontSize: "0.72rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "12px" }}>{q.term.type} - {q.term.system}</div>
          <div style={{ color: "#fcfaf7", fontSize: "1.6rem", fontWeight: "800", fontFamily: "monospace", marginBottom: "8px" }}>{q.term.term}</div>
          <div style={{ color: "rgba(252,250,247,0.45)", fontSize: "0.9rem" }}>Select the correct meaning</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {q.choices.map(c => {
            let bg = "rgba(255,255,255,0.05)", border = "1px solid rgba(252,250,247,0.07)";
            if (revealed) { if (c.id === q.term.id) { bg = "rgba(60,130,80,0.35)"; border = "1px solid rgba(80,160,100,0.5)"; } else if (c.id === selected) { bg = "rgba(160,60,60,0.35)"; border = "1px solid rgba(180,80,80,0.5)"; } }
            return <button key={c.id} onClick={() => choose(c.id)} style={{ backgroundColor: bg, border, borderRadius: "10px", padding: "14px 18px", cursor: revealed ? "default" : "pointer", fontFamily: "inherit", textAlign: "left", color: "#fcfaf7", transition: "all 0.15s" }}><div style={{ fontWeight: "600", fontSize: "0.92rem" }}>{c.meaning}</div></button>;
          })}
        </div>
        {revealed && <div style={{ marginTop: "20px", textAlign: "center" }}>
          <div style={{ color: isCorrect ? "#7aaa7a" : "#c07070", fontWeight: "700", marginBottom: "12px" }}>{isCorrect ? "Correct" : `Answer: ${q.term.meaning}`}</div>
          <button onClick={next} style={{ padding: "12px 32px", borderRadius: "10px", backgroundColor: "#6a3040", color: "#fcfaf7", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: "700" }}>{idx + 1 >= BOSS_COUNT ? "See Results" : "Next"}</button>
        </div>}
      </div>
    </div>
  );
}
