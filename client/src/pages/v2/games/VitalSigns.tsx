import { useState, useMemo, useCallback, useEffect } from "react";
import { useLocation } from "wouter";
import { useUser } from "@/contexts/UserContext";
import { ALL_TERMS, getTermsByChapter, CHAPTERS, STUDY_CHAPTER_KEY } from "@/data/medicalData";
import { shuffle, WrongAnswer, WrongAnswerReview, GameLock, useUnlockedChapters, termsForChapters } from "./shared";
import { maskTermInText } from "@/lib/answerUtils";

const MAX_WRONG = 6;
const ALPHA = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export default function VitalSigns() {
  const [, navigate] = useLocation();
  const { recordMiss, recordCorrect } = useUser();
  const unlocked = useUnlockedChapters();
  const [chapterFilter, setChapterFilter] = useState(0);
  const [started, setStarted] = useState(false);
  const [termIdx, setTermIdx] = useState(0);
  const [guessed, setGuessed] = useState<Set<string>>(new Set());
  const [finished, setFinished] = useState(false);
  const [sessionResults, setSessionResults] = useState<Array<{ term: string; won: boolean }>>([]);

  useEffect(() => {
    const s = localStorage.getItem(STUDY_CHAPTER_KEY);
    const n = s ? parseInt(s, 10) : 0;
    if (n > 0 && unlocked.includes(n)) setChapterFilter(n);
  }, [unlocked]);

  const pool = useMemo(() => {
    const base = chapterFilter > 0 ? getTermsByChapter(chapterFilter) : termsForChapters(unlocked);
    return base.length >= 5 ? base : termsForChapters(unlocked);
  }, [chapterFilter, unlocked]);

  const terms = useMemo(() => shuffle(pool).slice(0, 10), [pool]);
  const current = terms[termIdx];
  const termUpper = current?.term.toUpperCase() ?? "";
  const termChars = termUpper.replace(/[^A-Z]/g, "");

  const wrongGuesses = Array.from(guessed).filter(l => !termUpper.includes(l));
  const wrongCount = wrongGuesses.length;
  const won = termChars.split("").every(c => guessed.has(c));
  const lost = wrongCount >= MAX_WRONG;
  const roundOver = won || lost;

  const start = () => {
    setStarted(true); setTermIdx(0); setGuessed(new Set()); setSessionResults([]); setFinished(false);
  };

  const guess = useCallback((letter: string) => {
    if (guessed.has(letter) || roundOver) return;
    setGuessed(g => new Set([...g, letter]));
  }, [guessed, roundOver]);

  const next = () => {
    if (won) recordCorrect(current.id);
    else recordMiss(current.id, current.term);
    setSessionResults(r => [...r, { term: current.term, won }]);
    if (termIdx + 1 >= terms.length) { setFinished(true); return; }
    setTermIdx(i => i + 1);
    setGuessed(new Set());
  };

  const score = sessionResults.filter(r => r.won).length;
  const hdr: React.CSSProperties = { backgroundColor: "rgba(0,0,0,0.3)", padding: "14px 24px", display: "flex", alignItems: "center", gap: "12px", borderBottom: "1px solid rgba(252,250,247,0.07)" };
  const backBtn: React.CSSProperties = { backgroundColor: "rgba(255,255,255,0.07)", color: "#fcfaf7", border: "1px solid rgba(252,250,247,0.1)", borderRadius: "8px", padding: "8px 16px", cursor: "pointer", fontFamily: "inherit", fontSize: "0.9rem" };

  if (unlocked.length === 0) return <GameLock onBack={() => navigate("/")} onStudy={() => navigate("/flashcards")} />;

  if (!started) return (
    <div style={{ minHeight: "100vh", backgroundColor: "#252830", fontFamily: "'Inter','Plus Jakarta Sans',sans-serif" }}>
      <div style={hdr}><button onClick={() => navigate("/")} style={backBtn}>← Dashboard</button><span style={{ color: "#fcfaf7", fontWeight: "700" }}>Vital Signs</span></div>
      <div style={{ maxWidth: "560px", margin: "0 auto", padding: "60px 24px", textAlign: "center" }}>
        <h1 style={{ color: "#fcfaf7", fontSize: "1.8rem", fontWeight: "800", marginBottom: "8px" }}>Vital Signs</h1>
        <p style={{ color: "rgba(252,250,247,0.45)", marginBottom: "32px" }}>Reveal the medical term one letter at a time. The definition is your only clue - keep the patient's vitals up. {MAX_WRONG} wrong guesses and you flatline.</p>
        <div style={{ marginBottom: "28px" }}>
          <select value={chapterFilter} onChange={e => setChapterFilter(+e.target.value)} data-testid="select-chapter" style={{ width: "100%", padding: "12px 16px", borderRadius: "10px", backgroundColor: "rgba(255,255,255,0.07)", color: "#fcfaf7", border: "1px solid rgba(252,250,247,0.1)", fontFamily: "inherit", fontSize: "1rem" }}>
            <option value={0}>All My Chapters</option>
            {CHAPTERS.filter(ch => unlocked.includes(ch.num)).map(ch => <option key={ch.num} value={ch.num}>{ch.title}: {ch.subtitle}</option>)}
          </select>
        </div>
        <button onClick={start} data-testid="button-start" style={{ padding: "14px 40px", borderRadius: "12px", backgroundColor: "#4a6080", color: "#fcfaf7", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: "700", fontSize: "1rem" }}>Start</button>
      </div>
    </div>
  );

  if (finished) {
    const wrongAnswers: WrongAnswer[] = sessionResults
      .filter(r => !r.won)
      .map(r => {
        const td = ALL_TERMS.find(t => t.term === r.term);
        return { term: r.term, meaning: td?.meaning ?? "", definition: td?.definition ?? "" };
      });
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#252830", fontFamily: "'Inter','Plus Jakarta Sans',sans-serif" }}>
        <div style={hdr}><button onClick={() => { setStarted(false); setFinished(false); }} style={backBtn}>New Game</button><button onClick={() => navigate("/")} style={{ ...backBtn, marginLeft: "auto" }}>Dashboard</button></div>
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
          <div style={{ padding: "48px 24px 16px", textAlign: "center" }}>
            <div style={{ fontSize: "3rem", fontWeight: "800", color: score >= 7 ? "#7aaa7a" : "#c07070" }}>{score}/{sessionResults.length}</div>
            <div style={{ color: "#fcfaf7", fontWeight: "700", marginBottom: "16px" }}>{score === sessionResults.length ? "Flawless!" : score >= 7 ? "Well done" : "Keep at it"}</div>
            <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
              {sessionResults.map((r, i) => <div key={i} style={{ width: "28px", height: "28px", borderRadius: "6px", backgroundColor: r.won ? "rgba(80,150,90,0.5)" : "rgba(160,70,70,0.4)", display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ color: "#fcfaf7", fontSize: "0.7rem", fontWeight: "700" }}>{r.won ? "+" : "-"}</span></div>)}
            </div>
          </div>
          <WrongAnswerReview wrongs={wrongAnswers} onDone={() => navigate("/")} />
        </div>
      </div>
    );
  }

  const healthPct = Math.max(0, (MAX_WRONG - wrongCount) / MAX_WRONG);
  const healthColor = wrongCount < 2 ? "#7aaa7a" : wrongCount < 4 ? "#d4a843" : "#c07070";

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#252830", fontFamily: "'Inter','Plus Jakarta Sans',sans-serif" }}>
      <div style={{ ...hdr, justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}><button onClick={() => setStarted(false)} style={backBtn}>Exit</button><span style={{ color: "#fcfaf7", fontWeight: "700" }}>Vital Signs</span></div>
        <span style={{ color: "rgba(252,250,247,0.4)", fontSize: "0.82rem" }}>{termIdx + 1} / {terms.length}</span>
      </div>
      <div style={{ maxWidth: "640px", margin: "0 auto", padding: "32px 24px" }}>
        <div style={{ backgroundColor: "rgba(255,255,255,0.04)", borderRadius: "12px", padding: "20px 24px", marginBottom: "20px", border: "1px solid rgba(252,250,247,0.06)" }}>
          <div style={{ color: "rgba(252,250,247,0.35)", fontSize: "0.7rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px" }}>{current.type} - {current.system}</div>
          <div style={{ color: "rgba(252,250,247,0.85)", fontSize: "0.9rem", lineHeight: 1.5 }}>{maskTermInText(current.definition, current.term)}</div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
          <div style={{ color: "rgba(252,250,247,0.4)", fontSize: "0.75rem" }}>Vitals</div>
          <div style={{ flex: 1, height: "8px", borderRadius: "4px", backgroundColor: "rgba(0,0,0,0.3)", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${healthPct * 100}%`, backgroundColor: healthColor, borderRadius: "4px", transition: "width 0.3s, background-color 0.3s" }} />
          </div>
          <div style={{ color: healthColor, fontSize: "0.82rem", fontWeight: "700" }}>{MAX_WRONG - wrongCount}/{MAX_WRONG}</div>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "center", marginBottom: "28px" }}>
          {termUpper.split("").map((ch, i) => {
            const isLetter = /[A-Z]/.test(ch);
            const revealed = !isLetter || guessed.has(ch) || roundOver;
            return <div key={i} style={{ width: isLetter ? "36px" : "14px", height: "44px", borderBottom: isLetter ? "2px solid rgba(252,250,247,0.3)" : "none", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: isLetter && !guessed.has(ch) && !roundOver ? "transparent" : ch === " " ? "transparent" : lost && !guessed.has(ch) ? "#c07070" : "#fcfaf7", fontFamily: "monospace", fontWeight: "800", fontSize: "1.2rem" }}>{isLetter ? ch : ch}</span>
            </div>;
          })}
        </div>

        {wrongGuesses.length > 0 && <div style={{ marginBottom: "20px", textAlign: "center" }}>
          <div style={{ color: "rgba(252,250,247,0.3)", fontSize: "0.72rem", marginBottom: "6px" }}>WRONG GUESSES</div>
          <div style={{ display: "flex", gap: "6px", justifyContent: "center", flexWrap: "wrap" }}>
            {wrongGuesses.map(l => <span key={l} style={{ backgroundColor: "rgba(160,70,70,0.3)", color: "#c07070", borderRadius: "4px", padding: "2px 8px", fontFamily: "monospace", fontWeight: "700" }}>{l}</span>)}
          </div>
        </div>}

        {roundOver ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ color: won ? "#7aaa7a" : "#c07070", fontWeight: "700", marginBottom: "6px" }}>{won ? "Correct!" : `The term was: ${current.term}`}</div>
            <button onClick={next} data-testid="button-next" style={{ padding: "12px 32px", borderRadius: "10px", backgroundColor: "#4a6080", color: "#fcfaf7", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: "700" }}>{termIdx + 1 >= terms.length ? "See Results" : "Next"}</button>
          </div>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", justifyContent: "center" }}>
            {ALPHA.map(l => (
              <button key={l} onClick={() => guess(l)} disabled={guessed.has(l)} data-testid={`button-letter-${l}`} style={{ width: "38px", height: "38px", borderRadius: "6px", backgroundColor: guessed.has(l) ? (wrongGuesses.includes(l) ? "rgba(160,70,70,0.2)" : "rgba(60,130,80,0.2)") : "rgba(255,255,255,0.08)", color: guessed.has(l) ? (wrongGuesses.includes(l) ? "#c07070" : "#7aaa7a") : "#fcfaf7", border: "1px solid rgba(252,250,247,0.1)", cursor: guessed.has(l) ? "default" : "pointer", fontFamily: "monospace", fontWeight: "700", fontSize: "0.85rem" }}>{l}</button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
