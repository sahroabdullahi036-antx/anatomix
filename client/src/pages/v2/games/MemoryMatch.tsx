import { useState, useMemo, useEffect } from "react";
import { useLocation } from "wouter";
import { useUser } from "@/contexts/UserContext";
import { ALL_TERMS, getTermsByChapter, CHAPTERS, STUDY_CHAPTER_KEY } from "@/data/medicalData";
import { shuffle, useAnswerFx, useUnlockedChapters, termsForChapters, GameLock } from "./shared";

const PAIR_COUNT = 8;

interface Card { id: string; content: string; termId: string; side: "term" | "def"; }

export default function MemoryMatch() {
  const [, navigate] = useLocation();
  const { recordCorrect, recordMiss } = useUser();
  const { burst } = useAnswerFx();
  const unlocked = useUnlockedChapters();
  const [chapterFilter, setChapterFilter] = useState(0);
  const [pairCount, setPairCount] = useState(PAIR_COUNT);
  const [started, setStarted] = useState(false);
  const [cards, setCards] = useState<Card[]>([]);
  const [flipped, setFlipped] = useState<string[]>([]);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [moves, setMoves] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [finished, setFinished] = useState(false);
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    const s = localStorage.getItem(STUDY_CHAPTER_KEY);
    const n = s ? parseInt(s, 10) : 0;
    if (n > 0 && unlocked.includes(n)) setChapterFilter(n);
  }, [unlocked]);

  useEffect(() => {
    if (!started || finished) return;
    const t = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(t);
  }, [started, finished]);

  const pool = useMemo(() => {
    const base = chapterFilter > 0 ? getTermsByChapter(chapterFilter) : termsForChapters(unlocked);
    return base.length >= PAIR_COUNT ? base : termsForChapters(unlocked);
  }, [chapterFilter, unlocked]);

  const start = () => {
    const terms = shuffle(pool).slice(0, PAIR_COUNT);
    setPairCount(terms.length);
    const deck: Card[] = [];
    terms.forEach(t => {
      deck.push({ id: `${t.id}-term`, content: t.term, termId: t.id, side: "term" });
      deck.push({ id: `${t.id}-def`, content: t.meaning, termId: t.id, side: "def" });
    });
    setCards(shuffle(deck));
    setFlipped([]); setMatched(new Set()); setMoves(0); setElapsed(0); setFinished(false); setLocked(false);
    setStarted(true);
  };

  const handleFlip = (cardId: string) => {
    if (locked || flipped.includes(cardId) || matched.has(cards.find(c => c.id === cardId)?.termId ?? "")) return;
    const newFlipped = [...flipped, cardId];
    setFlipped(newFlipped);
    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      setLocked(true);
      const [a, b] = newFlipped.map(id => cards.find(c => c.id === id)!);
      if (a.termId === b.termId) {
        setMatched(m => new Set([...m, a.termId]));
        recordCorrect(a.termId);
        burst(document.querySelector(`[data-card="${cardId}"]`));
        setFlipped([]);
        setLocked(false);
        if (matched.size + 1 >= pairCount) setFinished(true);
      } else {
        recordMiss(a.termId, cards.find(c => c.termId === a.termId && c.side === "term")?.content ?? "");
        setTimeout(() => { setFlipped([]); setLocked(false); }, 900);
      }
    }
  };

  const isFlipped = (c: Card) => flipped.includes(c.id) || matched.has(c.termId);
  const isMatched = (c: Card) => matched.has(c.termId);

  const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const ss = String(elapsed % 60).padStart(2, "0");
  const hdr: React.CSSProperties = { backgroundColor: "rgba(0,0,0,0.3)", padding: "14px 24px", display: "flex", alignItems: "center", gap: "12px", borderBottom: "1px solid rgba(252,250,247,0.07)" };
  const backBtn: React.CSSProperties = { backgroundColor: "rgba(255,255,255,0.07)", color: "#fcfaf7", border: "1px solid rgba(252,250,247,0.1)", borderRadius: "8px", padding: "8px 16px", cursor: "pointer", fontFamily: "inherit", fontSize: "0.9rem" };

  if (unlocked.length === 0) return <GameLock onBack={() => navigate("/games")} onStudy={() => navigate("/flashcards")} />;

  if (!started) return (
    <div style={{ minHeight: "100vh", backgroundColor: "#252830", fontFamily: "'Inter','Plus Jakarta Sans',sans-serif" }}>
      <div style={hdr}><button onClick={() => navigate("/")} style={backBtn}>← Dashboard</button><span style={{ color: "#fcfaf7", fontWeight: "700" }}>Memory Match</span></div>
      <div style={{ maxWidth: "520px", margin: "0 auto", padding: "60px 24px", textAlign: "center" }}>
        <h1 style={{ color: "#fcfaf7", fontSize: "1.8rem", fontWeight: "800", marginBottom: "8px" }}>Memory Match</h1>
        <p style={{ color: "rgba(252,250,247,0.45)", marginBottom: "32px" }}>Flip cards to match {PAIR_COUNT} terms with their definitions. Fewest moves, fastest time wins.</p>
        <div style={{ marginBottom: "28px" }}>
          <select value={chapterFilter} onChange={e => setChapterFilter(+e.target.value)} style={{ width: "100%", padding: "12px 16px", borderRadius: "10px", backgroundColor: "rgba(255,255,255,0.07)", color: "#fcfaf7", border: "1px solid rgba(252,250,247,0.1)", fontFamily: "inherit", fontSize: "1rem" }}>
            <option value={0}>All My Chapters</option>
            {CHAPTERS.filter(ch => unlocked.includes(ch.num)).map(ch => <option key={ch.num} value={ch.num}>{ch.title}: {ch.subtitle}</option>)}
          </select>
        </div>
        <button onClick={start} style={{ padding: "14px 40px", borderRadius: "12px", backgroundColor: "#4a6080", color: "#fcfaf7", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: "700", fontSize: "1rem" }}>Start</button>
      </div>
    </div>
  );

  if (finished) return (
    <div style={{ minHeight: "100vh", backgroundColor: "#252830", fontFamily: "'Inter','Plus Jakarta Sans',sans-serif" }}>
      <div style={hdr}><button onClick={start} style={backBtn}>Play Again</button><button onClick={() => navigate("/")} style={{ ...backBtn, marginLeft: "auto" }}>Dashboard</button></div>
      <div style={{ maxWidth: "400px", margin: "0 auto", padding: "80px 24px", textAlign: "center" }}>
        <div style={{ fontSize: "3rem", fontWeight: "800", color: "#7aaa7a", marginBottom: "8px" }}>Complete!</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginTop: "24px" }}>
          <div style={{ backgroundColor: "rgba(255,255,255,0.05)", borderRadius: "12px", padding: "20px", border: "1px solid rgba(252,250,247,0.06)" }}>
            <div style={{ color: "#fcfaf7", fontSize: "1.8rem", fontWeight: "800" }}>{moves}</div>
            <div style={{ color: "rgba(252,250,247,0.4)", fontSize: "0.82rem" }}>Moves</div>
          </div>
          <div style={{ backgroundColor: "rgba(255,255,255,0.05)", borderRadius: "12px", padding: "20px", border: "1px solid rgba(252,250,247,0.06)" }}>
            <div style={{ color: "#fcfaf7", fontSize: "1.8rem", fontWeight: "800" }}>{mm}:{ss}</div>
            <div style={{ color: "rgba(252,250,247,0.4)", fontSize: "0.82rem" }}>Time</div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#252830", fontFamily: "'Inter','Plus Jakarta Sans',sans-serif" }}>
      <div style={{ ...hdr, justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}><button onClick={() => setStarted(false)} style={backBtn}>Exit</button><span style={{ color: "#fcfaf7", fontWeight: "700" }}>Memory Match</span></div>
        <div style={{ display: "flex", gap: "20px" }}>
          <span style={{ color: "rgba(252,250,247,0.5)", fontSize: "0.85rem" }}>{moves} moves</span>
          <span style={{ color: "rgba(252,250,247,0.5)", fontSize: "0.85rem", fontFamily: "monospace" }}>{mm}:{ss}</span>
          <span style={{ color: "rgba(252,250,247,0.4)", fontSize: "0.82rem" }}>{matched.size}/{pairCount} matched</span>
        </div>
      </div>
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "28px 16px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px" }}>
          {cards.map(c => {
            const show = isFlipped(c);
            const match = isMatched(c);
            return (
              <div key={c.id} data-card={c.id} onClick={() => handleFlip(c.id)} style={{ height: "90px", borderRadius: "10px", cursor: show ? "default" : "pointer", backgroundColor: match ? "rgba(60,130,80,0.25)" : show ? (c.side === "term" ? "#364860" : "#3d5a47") : "rgba(255,255,255,0.06)", border: match ? "1px solid rgba(80,160,100,0.4)" : show ? "1px solid rgba(252,250,247,0.12)" : "1px solid rgba(252,250,247,0.07)", display: "flex", alignItems: "center", justifyContent: "center", padding: "10px", textAlign: "center", transition: "all 0.2s", userSelect: "none" }}>
                {show ? (
                  <span style={{ color: "#fcfaf7", fontSize: c.side === "term" ? "0.8rem" : "0.72rem", fontWeight: c.side === "term" ? "800" : "600", fontFamily: c.side === "term" ? "monospace" : "inherit", lineHeight: 1.3 }}>{c.content}</span>
                ) : (
                  <span style={{ color: "rgba(252,250,247,0.2)", fontSize: "1.4rem" }}>?</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
