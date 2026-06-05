import { useState, useMemo, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { useUser } from "@/contexts/UserContext";
import { ALL_TERMS, getTermsByChapter, CHAPTERS, STUDY_CHAPTER_KEY } from "@/data/medicalData";
import { shuffle, WrongAnswer, WrongAnswerReview } from "./shared";
import { checkAnswer } from "@/lib/answerUtils";

export default function SpellingBee() {
  const [, navigate] = useLocation();
  const { recordMiss, recordCorrect } = useUser();
  const [chapterFilter, setChapterFilter] = useState(0);
  const [started, setStarted] = useState(false);
  const [idx, setIdx] = useState(0);
  const [typed, setTyped] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [results, setResults] = useState<Array<{ correct: boolean; term: string; typed: string }>>([]);
  const [finished, setFinished] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const s = localStorage.getItem(STUDY_CHAPTER_KEY);
    if (s) setChapterFilter(parseInt(s, 10));
  }, []);

  const pool = useMemo(() => {
    const base = chapterFilter > 0 ? getTermsByChapter(chapterFilter) : ALL_TERMS;
    return base.length >= 5 ? base : ALL_TERMS;
  }, [chapterFilter]);

  const terms = useMemo(() => shuffle(pool).slice(0, 10), [pool]);

  const start = () => { setStarted(true); setIdx(0); setTyped(""); setRevealed(false); setResults([]); setFinished(false); setTimeout(() => inputRef.current?.focus(), 100); };

  const submit = () => {
    if (!typed.trim()) return;
    const term = terms[idx];
    const correct = checkAnswer(typed, term.term);
    if (correct) recordCorrect(term.id);
    else recordMiss(term.id, term.term);
    setResults(r => [...r, { correct, term: term.term, typed }]);
    setRevealed(true);
  };

  const next = () => {
    if (idx + 1 >= terms.length) { setFinished(true); return; }
    setIdx(i => i + 1);
    setTyped(""); setRevealed(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const score = results.filter(r => r.correct).length;
  const hdr: React.CSSProperties = { backgroundColor: "rgba(0,0,0,0.3)", padding: "14px 24px", display: "flex", alignItems: "center", gap: "12px", borderBottom: "1px solid rgba(252,250,247,0.07)" };
  const backBtn: React.CSSProperties = { backgroundColor: "rgba(255,255,255,0.07)", color: "#fcfaf7", border: "1px solid rgba(252,250,247,0.1)", borderRadius: "8px", padding: "8px 16px", cursor: "pointer", fontFamily: "inherit", fontSize: "0.9rem" };

  if (!started) return (
    <div style={{ minHeight: "100vh", backgroundColor: "#252830", fontFamily: "'Inter','Plus Jakarta Sans',sans-serif" }}>
      <div style={hdr}><button onClick={() => navigate("/")} style={backBtn}>Back</button><span style={{ color: "#fcfaf7", fontWeight: "700" }}>Spelling Bee</span></div>
      <div style={{ maxWidth: "560px", margin: "0 auto", padding: "60px 24px", textAlign: "center" }}>
        <h1 style={{ color: "#fcfaf7", fontSize: "1.8rem", fontWeight: "800", marginBottom: "8px" }}>Spelling Bee</h1>
        <p style={{ color: "rgba(252,250,247,0.45)", marginBottom: "32px" }}>Read the definition. Type the correct medical term. 10 terms per session. Any accepted form of a multi-form term counts.</p>
        <div style={{ marginBottom: "28px" }}>
          <div style={{ color: "rgba(252,250,247,0.35)", fontSize: "0.72rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "10px" }}>Chapter</div>
          <select value={chapterFilter} onChange={e => setChapterFilter(+e.target.value)} style={{ width: "100%", padding: "12px 16px", borderRadius: "10px", backgroundColor: "rgba(255,255,255,0.07)", color: "#fcfaf7", border: "1px solid rgba(252,250,247,0.1)", fontFamily: "inherit", fontSize: "1rem" }}>
            <option value={0}>All Chapters</option>
            {CHAPTERS.map(ch => <option key={ch.num} value={ch.num}>{ch.title}: {ch.subtitle}</option>)}
          </select>
        </div>
        <button onClick={start} style={{ padding: "14px 40px", borderRadius: "12px", backgroundColor: "#4a6080", color: "#fcfaf7", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: "700", fontSize: "1rem" }}>Start</button>
      </div>
    </div>
  );

  if (finished) {
    const wrongAnswers: WrongAnswer[] = results
      .filter(r => !r.correct)
      .map(r => {
        const td = ALL_TERMS.find(t => t.term === r.term);
        return { term: r.term, meaning: td?.meaning ?? "", definition: td?.definition ?? "", userAnswer: r.typed };
      });
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#252830", fontFamily: "'Inter','Plus Jakarta Sans',sans-serif" }}>
        <div style={hdr}><button onClick={() => { setStarted(false); setFinished(false); }} style={backBtn}>New Game</button><button onClick={() => navigate("/")} style={{ ...backBtn, marginLeft: "auto" }}>Dashboard</button></div>
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
          <div style={{ padding: "40px 24px 12px", textAlign: "center" }}>
            <div style={{ fontSize: "3rem", fontWeight: "800", color: score >= 8 ? "#7aaa7a" : "#c07070" }}>{score}/10</div>
            <div style={{ color: "#fcfaf7", fontWeight: "700", marginBottom: "4px" }}>{score === 10 ? "Perfect Spelling!" : score >= 7 ? "Well done" : "Keep practicing"}</div>
            <div style={{ display: "flex", gap: "5px", justifyContent: "center", marginTop: "16px", marginBottom: "8px" }}>
              {results.map((r, i) => <div key={i} style={{ width: "22px", height: "22px", borderRadius: "5px", backgroundColor: r.correct ? "rgba(80,150,90,0.5)" : "rgba(160,70,70,0.4)", display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ color: "#fcfaf7", fontSize: "0.65rem", fontWeight: "700" }}>{r.correct ? "+" : "-"}</span></div>)}
            </div>
          </div>
          <WrongAnswerReview wrongs={wrongAnswers} onDone={() => navigate("/")} />
        </div>
      </div>
    );
  }

  const current = terms[idx];
  const isCorrect = checkAnswer(typed, current.term);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#252830", fontFamily: "'Inter','Plus Jakarta Sans',sans-serif" }}>
      <div style={{ ...hdr, justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}><button onClick={() => setStarted(false)} style={backBtn}>Exit</button><span style={{ color: "#fcfaf7", fontWeight: "700" }}>Spelling Bee</span></div>
        <span style={{ color: "rgba(252,250,247,0.4)", fontSize: "0.82rem" }}>{idx + 1} / {terms.length}</span>
      </div>
      <div style={{ maxWidth: "640px", margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ display: "flex", gap: "6px", marginBottom: "28px" }}>
          {results.map((r, i) => <div key={i} style={{ flex: 1, height: "4px", borderRadius: "2px", backgroundColor: r.correct ? "rgba(80,150,90,0.6)" : "rgba(160,70,70,0.5)" }} />)}
          {Array.from({ length: 10 - results.length }).map((_, i) => <div key={i} style={{ flex: 1, height: "4px", borderRadius: "2px", backgroundColor: "rgba(255,255,255,0.08)" }} />)}
        </div>
        <div style={{ backgroundColor: "rgba(255,255,255,0.04)", borderRadius: "16px", padding: "32px", marginBottom: "24px", border: "1px solid rgba(252,250,247,0.06)" }}>
          <div style={{ color: "rgba(252,250,247,0.35)", fontSize: "0.72rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "12px" }}>{current.type} - {current.system}</div>
          <div style={{ color: "#fcfaf7", fontSize: "1.1rem", fontWeight: "700", marginBottom: "8px" }}>{current.meaning}</div>
          <div style={{ color: "rgba(252,250,247,0.55)", fontSize: "0.9rem", lineHeight: 1.5 }}>{current.definition}</div>
        </div>
        {revealed ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ backgroundColor: isCorrect ? "rgba(60,130,80,0.2)" : "rgba(160,60,60,0.2)", borderRadius: "12px", padding: "20px", marginBottom: "16px", border: `1px solid ${isCorrect ? "rgba(80,160,100,0.3)" : "rgba(180,80,80,0.3)"}` }}>
              <div style={{ color: isCorrect ? "#7aaa7a" : "#c07070", fontWeight: "700", marginBottom: "10px" }}>{isCorrect ? "Correct!" : "Incorrect"}</div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                <div style={{ color: "#fcfaf7", fontFamily: "monospace", fontSize: "1.2rem", fontWeight: "800" }}>{current.term}</div>

              </div>
              {!isCorrect && <div style={{ color: "rgba(252,250,247,0.5)", fontSize: "0.85rem", marginTop: "6px" }}>You typed: {typed}</div>}
            </div>
            <button onClick={next} style={{ padding: "12px 32px", borderRadius: "10px", backgroundColor: "#4a6080", color: "#fcfaf7", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: "700" }}>{idx + 1 >= terms.length ? "See Results" : "Next"}</button>
          </div>
        ) : (
          <form onSubmit={e => { e.preventDefault(); submit(); }}>
            <input ref={inputRef} value={typed} onChange={e => setTyped(e.target.value)} placeholder="Type the medical term..." style={{ width: "100%", padding: "16px", borderRadius: "12px", backgroundColor: "rgba(255,255,255,0.07)", color: "#fcfaf7", border: "1px solid rgba(252,250,247,0.12)", fontFamily: "monospace", fontSize: "1.1rem", outline: "none", boxSizing: "border-box", marginBottom: "14px" }} />
            <button type="submit" disabled={!typed.trim()} style={{ width: "100%", padding: "14px", borderRadius: "10px", backgroundColor: typed.trim() ? "#4a6080" : "rgba(255,255,255,0.06)", color: "#fcfaf7", border: "none", cursor: typed.trim() ? "pointer" : "default", fontFamily: "inherit", fontWeight: "700", fontSize: "1rem" }}>Submit</button>
          </form>
        )}
      </div>
    </div>
  );
}
