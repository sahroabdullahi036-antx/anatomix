import { useState, useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import { useUser } from "@/contexts/UserContext";
import { ALL_TERMS, CHAPTERS, getTermsByChapter, STUDY_CHAPTER_KEY } from "@/data/medicalData";
import { shuffle } from "./games/shared";

const Q_COUNT = 20;
const TIME_LIMIT = 600;

function buildQuestion(term: typeof ALL_TERMS[0], pool: typeof ALL_TERMS) {
  const wrong = shuffle(pool.filter(t => t.id !== term.id)).slice(0, 3);
  const choices = shuffle([term, ...wrong]);
  return { term, choices, correct: term.id };
}

export default function PracticeTest() {
  const [, navigate] = useLocation();
  const { user, recordMiss, recordCorrect } = useUser();
  const [chapterFilter, setChapterFilter] = useState<number>(0);
  const [started, setStarted] = useState(false);
  const [questions, setQuestions] = useState<ReturnType<typeof buildQuestion>[]>([]);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STUDY_CHAPTER_KEY);
    if (stored) setChapterFilter(parseInt(stored, 10));
  }, []);

  useEffect(() => {
    if (!started || finished) return;
    const t = setInterval(() => {
      setTimeLeft(s => {
        if (s <= 1) { clearInterval(t); setFinished(true); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [started, finished]);

  const pool = useMemo(() => {
    const base = chapterFilter > 0 ? getTermsByChapter(chapterFilter) : ALL_TERMS;
    return base.length >= 8 ? base : ALL_TERMS;
  }, [chapterFilter]);

  const start = () => {
    const terms = shuffle(pool).slice(0, Math.min(Q_COUNT, pool.length));
    setQuestions(terms.map(t => buildQuestion(t, pool)));
    setIdx(0);
    setAnswers({});
    setSelected(null);
    setRevealed(false);
    setTimeLeft(TIME_LIMIT);
    setFinished(false);
    setStarted(true);
  };

  const choose = (id: string) => {
    if (revealed) return;
    setSelected(id);
    setRevealed(true);
    setAnswers(a => ({ ...a, [idx]: id }));
    const q = questions[idx];
    if (id === q.correct) recordCorrect(q.term.id);
    else recordMiss(q.term.id, q.term.term);
  };

  const next = () => {
    if (idx + 1 >= questions.length) { setFinished(true); return; }
    setIdx(i => i + 1);
    setSelected(null);
    setRevealed(false);
  };

  const score = Object.entries(answers).filter(([i, a]) => questions[+i]?.correct === a).length;
  const total = questions.length;
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;
  const passed = pct >= 70;

  const mm = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const ss = String(timeLeft % 60).padStart(2, "0");
  const activeChapter = CHAPTERS.find(c => c.num === chapterFilter);

  const headerStyle = { backgroundColor: "rgba(0,0,0,0.3)", padding: "14px 24px", display: "flex", alignItems: "center", gap: "12px", borderBottom: "1px solid rgba(252,250,247,0.07)" };
  const backBtn = { backgroundColor: "rgba(255,255,255,0.07)", color: "#fcfaf7", border: "1px solid rgba(252,250,247,0.1)", borderRadius: "8px", padding: "8px 16px", cursor: "pointer", fontFamily: "inherit", fontSize: "0.9rem" };

  if (!started) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#252830", fontFamily: "'Inter','Plus Jakarta Sans',sans-serif" }}>
        <div style={headerStyle}>
          <button onClick={() => navigate("/")} style={backBtn}>← Dashboard</button>
          <span style={{ color: "#fcfaf7", fontWeight: "700" }}>Practice Test</span>
        </div>
        <div style={{ maxWidth: "600px", margin: "0 auto", padding: "60px 24px", textAlign: "center" }}>
          <h1 style={{ color: "#fcfaf7", fontSize: "1.8rem", fontWeight: "800", marginBottom: "8px" }}>Practice Test</h1>
          <p style={{ color: "rgba(252,250,247,0.45)", marginBottom: "40px" }}>
            {Q_COUNT} multiple choice questions, 10 minutes. Pass threshold: 70%.
          </p>
          <div style={{ marginBottom: "32px" }}>
            <div style={{ color: "rgba(252,250,247,0.35)", fontSize: "0.72rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "10px" }}>Chapter</div>
            <select
              value={chapterFilter}
              onChange={e => setChapterFilter(+e.target.value)}
              style={{ width: "100%", padding: "12px 16px", borderRadius: "10px", backgroundColor: "rgba(255,255,255,0.07)", color: "#fcfaf7", border: "1px solid rgba(252,250,247,0.1)", fontFamily: "inherit", fontSize: "1rem" }}
            >
              <option value={0}>All Chapters ({ALL_TERMS.length} terms)</option>
              {CHAPTERS.map(ch => (
                <option key={ch.num} value={ch.num}>{ch.title}: {ch.subtitle} ({ch.termIds.length} terms)</option>
              ))}
            </select>
            <div style={{ color: "rgba(252,250,247,0.3)", fontSize: "0.8rem", marginTop: "8px" }}>
              {pool.length} terms available, test will use {Math.min(Q_COUNT, pool.length)} questions
            </div>
          </div>
          <button
            onClick={start}
            style={{ padding: "14px 40px", borderRadius: "12px", backgroundColor: "#4a6080", color: "#fcfaf7", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: "700", fontSize: "1rem" }}
          >
            Start Test
          </button>
        </div>
      </div>
    );
  }

  if (finished) {
    const missed = questions.filter((q, i) => answers[i] !== q.correct);
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#252830", fontFamily: "'Inter','Plus Jakarta Sans',sans-serif" }}>
        <div style={headerStyle}>
          <button onClick={() => { setStarted(false); setFinished(false); }} style={backBtn}>New Test</button>
          <button onClick={() => navigate("/")} style={{ ...backBtn, marginLeft: "auto" }}>Dashboard</button>
        </div>
        <div style={{ maxWidth: "600px", margin: "0 auto", padding: "48px 24px" }}>
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <div style={{ fontSize: "3.5rem", fontWeight: "800", color: passed ? "#7aaa7a" : "#c07070", marginBottom: "8px" }}>{pct}%</div>
            <div style={{ color: "#fcfaf7", fontWeight: "700", fontSize: "1.3rem", marginBottom: "6px" }}>{passed ? "Passed" : "Not yet"}</div>
            <div style={{ color: "rgba(252,250,247,0.45)", fontSize: "0.9rem" }}>{score} of {total} correct</div>
            {activeChapter && <div style={{ color: "rgba(252,250,247,0.35)", fontSize: "0.82rem", marginTop: "4px" }}>{activeChapter.title}</div>}
          </div>
          {missed.length > 0 && (
            <div>
              <div style={{ color: "rgba(252,250,247,0.35)", fontSize: "0.72rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "12px" }}>Added to Critical Review ({missed.length})</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {missed.map(q => (
                  <div key={q.term.id} style={{ backgroundColor: "rgba(255,255,255,0.05)", borderRadius: "10px", padding: "12px 16px", border: "1px solid rgba(252,250,247,0.06)" }}>
                    <div style={{ color: "#fcfaf7", fontWeight: "700", fontFamily: "monospace" }}>{q.term.term}</div>
                    <div style={{ color: "rgba(252,250,247,0.5)", fontSize: "0.82rem", marginTop: "2px" }}>{q.term.meaning}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  const q = questions[idx];
  const isCorrect = selected === q.correct;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#252830", fontFamily: "'Inter','Plus Jakarta Sans',sans-serif" }}>
      <div style={{ ...headerStyle, justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button onClick={() => setStarted(false)} style={backBtn}>Exit</button>
          <span style={{ color: "#fcfaf7", fontWeight: "700" }}>Practice Test</span>
        </div>
        <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
          <span style={{ color: timeLeft < 60 ? "#c07070" : "rgba(252,250,247,0.5)", fontSize: "0.9rem", fontWeight: "700", fontFamily: "monospace" }}>{mm}:{ss}</span>
          <span style={{ color: "rgba(252,250,247,0.4)", fontSize: "0.82rem" }}>{idx + 1} / {total}</span>
        </div>
      </div>
      <div style={{ maxWidth: "640px", margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ backgroundColor: "rgba(255,255,255,0.04)", borderRadius: "16px", padding: "32px", marginBottom: "20px", border: "1px solid rgba(252,250,247,0.06)" }}>
          <div style={{ color: "rgba(252,250,247,0.35)", fontSize: "0.72rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "12px" }}>
            {q.term.type} · {q.term.system}
          </div>
          <div style={{ color: "#fcfaf7", fontSize: "1.6rem", fontWeight: "800", fontFamily: "monospace", marginBottom: "8px" }}>{q.term.term}</div>
          <div style={{ color: "rgba(252,250,247,0.5)", fontSize: "0.9rem" }}>Select the correct meaning</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {q.choices.map(choice => {
            let bg = "rgba(255,255,255,0.05)";
            let border = "1px solid rgba(252,250,247,0.07)";
            if (revealed) {
              if (choice.id === q.correct) { bg = "rgba(60,130,80,0.35)"; border = "1px solid rgba(80,160,100,0.5)"; }
              else if (choice.id === selected) { bg = "rgba(160,60,60,0.35)"; border = "1px solid rgba(180,80,80,0.5)"; }
            }
            return (
              <button
                key={choice.id}
                onClick={() => choose(choice.id)}
                style={{ backgroundColor: bg, border, borderRadius: "10px", padding: "14px 18px", cursor: revealed ? "default" : "pointer", fontFamily: "inherit", textAlign: "left", color: "#fcfaf7", transition: "all 0.15s" }}
              >
                <div style={{ fontWeight: "600", fontSize: "0.92rem" }}>{choice.meaning}</div>
              </button>
            );
          })}
        </div>
        {revealed && (
          <div style={{ marginTop: "20px", textAlign: "center" }}>
            <div style={{ color: isCorrect ? "#7aaa7a" : "#c07070", fontWeight: "700", marginBottom: "12px" }}>
              {isCorrect ? "Correct" : `Correct answer: ${q.term.meaning}`}
            </div>
            <button onClick={next} style={{ padding: "12px 32px", borderRadius: "10px", backgroundColor: "#4a6080", color: "#fcfaf7", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: "700" }}>
              {idx + 1 >= total ? "View Results" : "Next"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
