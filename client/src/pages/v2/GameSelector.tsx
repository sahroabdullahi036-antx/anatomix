import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useUser } from "@/contexts/UserContext";
import { CHAPTERS, getTermsByChapter, ALL_TERMS, STUDY_CHAPTER_KEY } from "@/data/medicalData";

const GAMES = [
  { path: "/games/multiple-choice", emoji: "🎯", num: 1, title: "Multiple Choice Quiz", desc: "4 choices with sound-alike distractors to simulate real exam traps", color: "#4a5a6a" },
  { path: "/games/typing-quiz", emoji: "⌨️", num: 2, title: "Typing Input Quiz", desc: "Type the medical term - input normalized for typos & plural forms", color: "#596e60" },
  { path: "/games/linguistic-autopsy", emoji: "🧩", num: 3, title: "Linguistic Autopsy", desc: "Tap scrambled word-parts in correct physiological sequence", color: "#9c6f5e" },
  { path: "/games/chart-triage", emoji: "⏱️", num: 4, title: "Chart Triage", desc: "Match patient complaint to textbook term before countdown hits zero", color: "#5c4a6a" },
  { path: "/games/textbook-trap", emoji: "🪤", num: 5, title: "Textbook Trap", desc: "True/False - spot intentionally altered definitions with hidden errors", color: "#4f4f4f" },
  { path: "/games/root-race", emoji: "🏁", num: 6, title: "Root Race", desc: "Link every legal suffix to one combining form root as fast as possible", color: "#3b5e66" },
  { path: "/games/root-swap", emoji: "🔄", num: 7, title: "Root Swap", desc: "Swap suffixes dynamically as a clinical scenario changes in real-time", color: "#4a5a6e" },
  { path: "/games/structural-hole", emoji: "🕳️", num: 8, title: "Fill the Structural Hole", desc: "Repair a chain of anatomy folders with one link blanked out", color: "#6a4a5e" },
  { path: "/games/textbook-defender", emoji: "🛡️", num: 9, title: "Textbook Defender", desc: "Destroy the 2 incorrect casual definitions before they overwhelm you", color: "#4a5a6a" },
  { path: "/games/combining-linker", emoji: "🔗", num: 10, title: "Combining Form Linker", desc: "Domino chain - each card must share one overlapping root or suffix", color: "#596e60" },
  { path: "/games/chart-auditor", emoji: "📝", num: 11, title: "Chart Auditor", desc: "Find and replace lazy/incorrect terms in clinical paragraphs", color: "#9c6f5e" },
  { path: "/games/ischemic-countdown", emoji: "💥", num: 12, title: "Ischemic Countdown", desc: "Survival mode - correct answers gain time, wrong answers speed up the countdown", color: "#5c4a6a" },
];

export default function GameSelector() {
  const [, navigate] = useLocation();
  const { user } = useUser();
  const [chapterFilter, setChapterFilter] = useState<number>(0);
  const [showChapterPicker, setShowChapterPicker] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STUDY_CHAPTER_KEY);
    if (stored) setChapterFilter(parseInt(stored, 10));
  }, []);

  const changeChapter = (val: number) => {
    setChapterFilter(val);
    setShowChapterPicker(false);
    if (val > 0) localStorage.setItem(STUDY_CHAPTER_KEY, String(val));
    else localStorage.removeItem(STUDY_CHAPTER_KEY);
  };

  const activeChapter = CHAPTERS.find(c => c.num === chapterFilter);
  const termCount = chapterFilter > 0 ? getTermsByChapter(chapterFilter).length : ALL_TERMS.length;
  const critCount = Object.keys(user?.criticalReview ?? {}).length;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#8b4f58", fontFamily: "'Inter','Plus Jakarta Sans',sans-serif" }}>
      <div style={{ backgroundColor: "rgba(0,0,0,0.2)", padding: "14px 24px", display: "flex", alignItems: "center", gap: "12px", borderBottom: "1px solid rgba(252,250,247,0.1)" }}>
        <button onClick={() => navigate("/")} style={{ backgroundColor: "rgba(252,250,247,0.12)", color: "#fcfaf7", border: "1px solid rgba(252,250,247,0.2)", borderRadius: "8px", padding: "8px 16px", cursor: "pointer", fontFamily: "inherit", fontSize: "0.9rem" }}>← Dashboard</button>
        <span style={{ color: "#fcfaf7", fontWeight: "700" }}>12 Game Modes</span>
      </div>

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "28px 24px" }}>
        <h1 style={{ color: "#fcfaf7", fontSize: "1.6rem", fontWeight: "800", marginBottom: "6px" }}>🎮 Interactive Game Modes</h1>
        <p style={{ color: "rgba(252,250,247,0.6)", marginBottom: "16px" }}>All games automatically track missed terms into your Critical Review deck.</p>

        {critCount > 0 && (
          <div style={{ color: "#f5a0a0", fontSize: "0.85rem", marginBottom: "16px" }}>
            ⚠️ You have {critCount} term{critCount !== 1 ? "s" : ""} in Critical Review - they'll appear more frequently!
          </div>
        )}

        <div style={{ marginBottom: "28px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: showChapterPicker ? "14px" : "0" }}>
            <div style={{ color: "rgba(252,250,247,0.5)", fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em" }}>Study Focus:</div>
            <button
              onClick={() => setShowChapterPicker(p => !p)}
              style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 14px", borderRadius: "10px", backgroundColor: activeChapter ? activeChapter.color : "rgba(252,250,247,0.12)", border: "1px solid rgba(252,250,247,0.25)", color: "#fcfaf7", cursor: "pointer", fontFamily: "inherit", fontWeight: "700", fontSize: "0.88rem" }}
            >
              <span>{activeChapter ? `${activeChapter.title}: ${activeChapter.subtitle}` : "All Chapters"}</span>
              <span style={{ opacity: 0.6 }}>{termCount} terms</span>
              <span style={{ opacity: 0.5, fontSize: "0.75rem" }}>{showChapterPicker ? "▲" : "▼"}</span>
            </button>
            {chapterFilter > 0 && (
              <button onClick={() => changeChapter(0)} style={{ padding: "6px 12px", borderRadius: "8px", backgroundColor: "rgba(252,250,247,0.08)", border: "1px solid rgba(252,250,247,0.15)", color: "rgba(252,250,247,0.6)", cursor: "pointer", fontFamily: "inherit", fontSize: "0.8rem" }}>
                Clear
              </button>
            )}
          </div>

          {showChapterPicker && (
            <div style={{ backgroundColor: "rgba(0,0,0,0.3)", borderRadius: "14px", padding: "16px", border: "1px solid rgba(252,250,247,0.1)" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))", gap: "8px" }}>
                <button
                  onClick={() => changeChapter(0)}
                  style={{ padding: "10px 14px", borderRadius: "10px", border: chapterFilter === 0 ? "2px solid #fcfaf7" : "1px solid rgba(252,250,247,0.15)", backgroundColor: chapterFilter === 0 ? "rgba(252,250,247,0.2)" : "rgba(252,250,247,0.05)", color: "#fcfaf7", cursor: "pointer", fontFamily: "inherit", textAlign: "left" as const }}
                >
                  <div style={{ fontWeight: "700", fontSize: "0.85rem" }}>All Chapters</div>
                  <div style={{ color: "rgba(252,250,247,0.5)", fontSize: "0.72rem", marginTop: "2px" }}>{ALL_TERMS.length} terms</div>
                </button>
                {CHAPTERS.map(ch => (
                  <button
                    key={ch.num}
                    onClick={() => changeChapter(ch.num)}
                    style={{ padding: "10px 14px", borderRadius: "10px", border: chapterFilter === ch.num ? "2px solid #fcfaf7" : "1px solid rgba(252,250,247,0.15)", backgroundColor: chapterFilter === ch.num ? ch.color : "rgba(252,250,247,0.05)", color: "#fcfaf7", cursor: "pointer", fontFamily: "inherit", textAlign: "left" as const }}
                  >
                    <div style={{ fontWeight: "700", fontSize: "0.82rem" }}>{ch.title}</div>
                    <div style={{ color: "rgba(252,250,247,0.7)", fontSize: "0.7rem", marginTop: "2px", lineHeight: 1.3 }}>{ch.subtitle}</div>
                    <div style={{ color: "rgba(252,250,247,0.4)", fontSize: "0.7rem", marginTop: "3px" }}>{ch.termIds.length} terms</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: "14px" }}>
          {GAMES.map(g => {
            const scoreKey = g.path.split("/").pop()!;
            const best = user?.gameScores[scoreKey];
            return (
              <button
                key={g.path}
                onClick={() => navigate(g.path)}
                style={{ backgroundColor: g.color, borderRadius: "14px", padding: "20px", border: "none", cursor: "pointer", textAlign: "left", fontFamily: "inherit", transition: "transform 0.15s, box-shadow 0.15s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 24px rgba(0,0,0,0.35)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "none"; (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                  <span style={{ fontSize: "28px" }}>{g.emoji}</span>
                  <span style={{ color: "rgba(252,250,247,0.4)", fontSize: "0.75rem", fontWeight: "700" }}>#{g.num}</span>
                </div>
                <div style={{ color: "#fcfaf7", fontWeight: "700", fontSize: "0.95rem", marginBottom: "6px" }}>{g.title}</div>
                <div style={{ color: "rgba(252,250,247,0.6)", fontSize: "0.78rem", lineHeight: 1.4, marginBottom: "10px" }}>{g.desc}</div>
                {best !== undefined && (
                  <div style={{ color: "rgba(252,250,247,0.5)", fontSize: "0.75rem" }}>Best: {best} pts</div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
