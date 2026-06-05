import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { useUser } from "@/contexts/UserContext";
import { ALL_TERMS, STUDY_CHAPTER_KEY, getTermsByChapter } from "@/data/medicalData";

function seededShuffle<T>(arr: T[], seed: number): T[] {
  const a = [...arr];
  let s = seed;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    const j = Math.abs(s) % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function dateSeed(): number {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

export default function DailyChallenge() {
  const [, navigate] = useLocation();
  const { user, recordCorrect, recordMiss } = useUser();
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [done, setDone] = useState<Record<number, "correct" | "miss">>({});

  const terms = useMemo(() => {
    const stored = localStorage.getItem(STUDY_CHAPTER_KEY);
    const ch = stored ? parseInt(stored, 10) : 0;
    const pool = ch > 0 ? getTermsByChapter(ch) : ALL_TERMS;
    return seededShuffle(pool, dateSeed()).slice(0, 10);
  }, []);

  const current = terms[idx];
  const finished = Object.keys(done).length === terms.length;

  const handleCorrect = () => {
    if (done[idx]) return;
    recordCorrect(current.id);
    setDone(d => ({ ...d, [idx]: "correct" }));
    setTimeout(() => { setFlipped(false); if (idx + 1 < terms.length) setIdx(i => i + 1); }, 400);
  };

  const handleMiss = () => {
    if (done[idx]) return;
    recordMiss(current.id, current.term);
    setDone(d => ({ ...d, [idx]: "miss" }));
    setTimeout(() => { setFlipped(false); if (idx + 1 < terms.length) setIdx(i => i + 1); }, 400);
  };

  const correct = Object.values(done).filter(v => v === "correct").length;

  const headerStyle = { backgroundColor: "rgba(0,0,0,0.3)", padding: "14px 24px", display: "flex", alignItems: "center", gap: "12px", borderBottom: "1px solid rgba(252,250,247,0.07)" };
  const backBtn = { backgroundColor: "rgba(255,255,255,0.07)", color: "#fcfaf7", border: "1px solid rgba(252,250,247,0.1)", borderRadius: "8px", padding: "8px 16px", cursor: "pointer", fontFamily: "inherit", fontSize: "0.9rem" };

  const typeColors: Record<string, string> = {
    prefix: "#5a4a3e", suffix: "#394d62", root: "#3d5a47",
    condition: "#4a3d62", procedure: "#424242", word: "#2e4e58",
  };

  if (finished) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#252830", fontFamily: "'Inter','Plus Jakarta Sans',sans-serif" }}>
        <div style={headerStyle}>
          <button onClick={() => navigate("/")} style={backBtn}>← Dashboard</button>
          <span style={{ color: "#fcfaf7", fontWeight: "700" }}>Daily Challenge</span>
        </div>
        <div style={{ maxWidth: "520px", margin: "0 auto", padding: "80px 24px", textAlign: "center" }}>
          <div style={{ fontSize: "3rem", fontWeight: "800", color: correct >= 8 ? "#7aaa7a" : "#fcfaf7", marginBottom: "8px" }}>{correct}/10</div>
          <div style={{ color: "#fcfaf7", fontWeight: "700", fontSize: "1.3rem", marginBottom: "6px" }}>
            {correct === 10 ? "Perfect" : correct >= 7 ? "Well done" : "Keep practicing"}
          </div>
          <div style={{ color: "rgba(252,250,247,0.4)", marginBottom: "32px" }}>Come back tomorrow for a new set.</div>
          <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
            {terms.map((_, i) => (
              <div key={i} style={{ width: "28px", height: "28px", borderRadius: "6px", backgroundColor: done[i] === "correct" ? "rgba(80,150,90,0.5)" : "rgba(160,70,70,0.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: "#fcfaf7", fontSize: "0.7rem", fontWeight: "700" }}>{done[i] === "correct" ? "+" : "-"}</span>
              </div>
            ))}
          </div>
          <button onClick={() => navigate("/")} style={{ marginTop: "32px", padding: "12px 28px", borderRadius: "10px", backgroundColor: "#4a6080", color: "#fcfaf7", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: "700" }}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#252830", fontFamily: "'Inter','Plus Jakarta Sans',sans-serif" }}>
      <div style={{ ...headerStyle, justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button onClick={() => navigate("/")} style={backBtn}>← Dashboard</button>
          <span style={{ color: "#fcfaf7", fontWeight: "700" }}>Daily Challenge</span>
        </div>
        <span style={{ color: "rgba(252,250,247,0.4)", fontSize: "0.82rem" }}>{idx + 1} / 10</span>
      </div>

      <div style={{ maxWidth: "600px", margin: "0 auto", padding: "32px 24px" }}>
        <div style={{ display: "flex", gap: "6px", marginBottom: "28px" }}>
          {terms.map((_, i) => (
            <div key={i} style={{ flex: 1, height: "4px", borderRadius: "2px", backgroundColor: done[i] === "correct" ? "rgba(80,150,90,0.6)" : done[i] === "miss" ? "rgba(160,70,70,0.5)" : i === idx ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.08)" }} />
          ))}
        </div>

        <div
          onClick={() => !done[idx] && setFlipped(f => !f)}
          style={{ backgroundColor: typeColors[current.type] ?? "#394d62", borderRadius: "16px", padding: "40px 32px", minHeight: "220px", cursor: done[idx] ? "default" : "pointer", textAlign: "center", marginBottom: "20px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", userSelect: "none", boxShadow: "0 4px 24px rgba(0,0,0,0.4)" }}
        >
          {!flipped ? (
            <>
              <div style={{ fontSize: "0.72rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.06em", color: "rgba(252,250,247,0.45)", marginBottom: "12px" }}>{current.type} · {current.system}</div>
              <div style={{ color: "#fcfaf7", fontSize: "1.8rem", fontWeight: "800", fontFamily: "monospace" }}>{current.term}</div>
              <div style={{ color: "rgba(252,250,247,0.35)", fontSize: "0.85rem", marginTop: "16px" }}>Tap to reveal</div>
            </>
          ) : (
            <>
              <div style={{ fontSize: "0.72rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.06em", color: "rgba(252,250,247,0.45)", marginBottom: "12px" }}>{current.term}</div>
              <div style={{ color: "#fcfaf7", fontSize: "1.1rem", fontWeight: "700", marginBottom: "8px" }}>{current.meaning}</div>
              <div style={{ color: "rgba(252,250,247,0.6)", fontSize: "0.85rem", lineHeight: 1.5, maxWidth: "380px" }}>{current.definition}</div>
            </>
          )}
        </div>

        {flipped && !done[idx] && (
          <div style={{ display: "flex", gap: "12px" }}>
            <button onClick={handleMiss} style={{ flex: 1, padding: "14px", borderRadius: "10px", backgroundColor: "rgba(160,70,70,0.35)", color: "#fcfaf7", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: "700" }}>Missed</button>
            <button onClick={handleCorrect} style={{ flex: 1, padding: "14px", borderRadius: "10px", backgroundColor: "rgba(60,130,80,0.35)", color: "#fcfaf7", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: "700" }}>Got It</button>
          </div>
        )}
      </div>
    </div>
  );
}
