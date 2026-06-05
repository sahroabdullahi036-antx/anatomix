import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useUser } from "@/contexts/UserContext";
import { CHAPTERS, getTermsByChapter, ALL_TERMS, STUDY_CHAPTER_KEY } from "@/data/medicalData";

const GAME_TONES = [
  "#374a5e","#3a4d62","#364860","#3d5168","#394c64",
  "#364960","#3b4e65","#384b62","#3c4f68","#374b60",
  "#3a4d64","#364960",
];

const GAMES = [
  { path: "/games/multiple-choice",    num: 1,  title: "Multiple Choice Quiz",       desc: "4 choices with sound-alike distractors",            tag: "" },
  { path: "/games/typing-quiz",        num: 2,  title: "Typing Input Quiz",          desc: "Type the medical term, typos normalized",            tag: "" },
  { path: "/games/linguistic-autopsy", num: 3,  title: "Linguistic Autopsy",         desc: "Arrange scrambled word-parts in correct order",      tag: "" },
  { path: "/games/chart-triage",       num: 4,  title: "Chart Triage",               desc: "Match patient complaint to term before time runs out", tag: "" },
  { path: "/games/textbook-trap",      num: 5,  title: "Textbook Trap",              desc: "True/False: spot intentionally altered definitions",  tag: "" },
  { path: "/games/root-race",          num: 6,  title: "Root Race",                  desc: "Link every valid suffix to a combining form root",   tag: "" },
  { path: "/games/root-swap",          num: 7,  title: "Root Swap",                  desc: "Swap suffixes as clinical scenarios change",          tag: "" },
  { path: "/games/structural-hole",    num: 8,  title: "Fill the Structural Hole",   desc: "Repair an anatomy chain with one link missing",      tag: "" },
  { path: "/games/textbook-defender",  num: 9,  title: "Textbook Defender",          desc: "Destroy incorrect definitions before they reach you", tag: "" },
  { path: "/games/combining-linker",   num: 10, title: "Combining Form Linker",      desc: "Domino chain: each card must share a root or suffix", tag: "" },
  { path: "/games/chart-auditor",      num: 11, title: "Chart Auditor",              desc: "Find and replace incorrect terms in clinical text",   tag: "" },
  { path: "/games/ischemic-countdown", num: 12, title: "Ischemic Countdown",         desc: "Survival mode: right gains time, wrong speeds it up", tag: "" },
  { path: "/boss-round",               num: 13, title: "Boss Round",                 desc: "15 hardest clinical and procedure terms back-to-back", tag: "hard" },
  { path: "/games/spelling-bee",       num: 14, title: "Spelling Bee",               desc: "Type the exact spelling from the definition alone",   tag: "" },
  { path: "/games/hangman",            num: 15, title: "Hangman",                    desc: "Guess the medical term letter by letter, 6 lives",    tag: "" },
  { path: "/games/memory-match",       num: 16, title: "Memory Match",               desc: "Flip card pairs linking terms to definitions",        tag: "" },
];

const CHAPTER_TONES = [
  "#374a5e","#3a4d62","#364860","#3d5168","#394c64",
  "#364960","#3b4e65","#384b62","#3c4f68","#374b60",
  "#3a4d64","#364960","#3b4f66",
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
    <div style={{ minHeight: "100vh", backgroundColor: "#252830", fontFamily: "'Inter','Plus Jakarta Sans',sans-serif" }}>
      <div style={{ backgroundColor: "rgba(0,0,0,0.3)", padding: "14px 24px", display: "flex", alignItems: "center", gap: "12px", borderBottom: "1px solid rgba(252,250,247,0.07)" }}>
        <button onClick={() => navigate("/")} style={{ backgroundColor: "rgba(255,255,255,0.07)", color: "#fcfaf7", border: "1px solid rgba(252,250,247,0.1)", borderRadius: "8px", padding: "8px 16px", cursor: "pointer", fontFamily: "inherit", fontSize: "0.9rem" }}>← Dashboard</button>
        <span style={{ color: "#fcfaf7", fontWeight: "700" }}>16 Game Modes</span>
      </div>

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "28px 24px" }}>
        <h1 style={{ color: "#fcfaf7", fontSize: "1.6rem", fontWeight: "800", marginBottom: "6px" }}>Interactive Game Modes</h1>
        <p style={{ color: "rgba(252,250,247,0.4)", marginBottom: "16px" }}>All games automatically track missed terms into your Critical Review deck.</p>

        {critCount > 0 && (
          <div style={{ color: "#e09090", fontSize: "0.85rem", marginBottom: "16px" }}>
            {critCount} term{critCount !== 1 ? "s" : ""} in Critical Review. They will appear more frequently.
          </div>
        )}

        <div style={{ marginBottom: "28px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: showChapterPicker ? "14px" : "0" }}>
            <div style={{ color: "rgba(252,250,247,0.35)", fontSize: "0.72rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.06em" }}>Study Focus</div>
            <button
              onClick={() => setShowChapterPicker(p => !p)}
              style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 14px", borderRadius: "10px", backgroundColor: activeChapter ? CHAPTER_TONES[(activeChapter.num - 1) % CHAPTER_TONES.length] : "rgba(255,255,255,0.07)", border: "1px solid rgba(252,250,247,0.1)", color: "#fcfaf7", cursor: "pointer", fontFamily: "inherit", fontWeight: "700", fontSize: "0.88rem" }}
            >
              <span>{activeChapter ? `${activeChapter.title}: ${activeChapter.subtitle}` : "All Chapters"}</span>
              <span style={{ opacity: 0.45, fontSize: "0.78rem" }}>{termCount} terms</span>
              <span style={{ opacity: 0.4, fontSize: "0.72rem" }}>{showChapterPicker ? "▲" : "▼"}</span>
            </button>
            {chapterFilter > 0 && (
              <button onClick={() => changeChapter(0)} style={{ padding: "6px 12px", borderRadius: "8px", backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(252,250,247,0.08)", color: "rgba(252,250,247,0.5)", cursor: "pointer", fontFamily: "inherit", fontSize: "0.8rem" }}>
                Clear
              </button>
            )}
          </div>

          {showChapterPicker && (
            <div style={{ backgroundColor: "rgba(0,0,0,0.25)", borderRadius: "14px", padding: "14px", border: "1px solid rgba(252,250,247,0.07)" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(185px, 1fr))", gap: "8px" }}>
                <button
                  onClick={() => changeChapter(0)}
                  style={{ padding: "10px 14px", borderRadius: "10px", border: chapterFilter === 0 ? "2px solid rgba(255,255,255,0.25)" : "1px solid rgba(255,255,255,0.07)", backgroundColor: chapterFilter === 0 ? "#4a6080" : "rgba(255,255,255,0.04)", color: "#fcfaf7", cursor: "pointer", fontFamily: "inherit", textAlign: "left" as const }}
                >
                  <div style={{ fontWeight: "700", fontSize: "0.85rem" }}>All Chapters</div>
                  <div style={{ color: "rgba(252,250,247,0.4)", fontSize: "0.72rem", marginTop: "2px" }}>{ALL_TERMS.length} terms</div>
                </button>
                {CHAPTERS.map((ch, i) => (
                  <button
                    key={ch.num}
                    onClick={() => changeChapter(ch.num)}
                    style={{ padding: "10px 14px", borderRadius: "10px", border: chapterFilter === ch.num ? "2px solid rgba(255,255,255,0.25)" : "1px solid rgba(255,255,255,0.07)", backgroundColor: chapterFilter === ch.num ? CHAPTER_TONES[i % CHAPTER_TONES.length] : "rgba(255,255,255,0.04)", color: "#fcfaf7", cursor: "pointer", fontFamily: "inherit", textAlign: "left" as const }}
                  >
                    <div style={{ fontWeight: "700", fontSize: "0.82rem" }}>{ch.title}</div>
                    <div style={{ color: "rgba(252,250,247,0.55)", fontSize: "0.7rem", marginTop: "2px", lineHeight: 1.3 }}>{ch.subtitle}</div>
                    <div style={{ color: "rgba(252,250,247,0.3)", fontSize: "0.7rem", marginTop: "3px" }}>{ch.termIds.length} terms</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: "12px" }}>
          {GAMES.map((g, i) => {
            const scoreKey = g.path.split("/").pop()!;
            const best = user?.gameScores[scoreKey];
            const tone = GAME_TONES[i % GAME_TONES.length];
            return (
              <button
                key={g.path}
                onClick={() => navigate(g.path)}
                style={{ backgroundColor: tone, borderRadius: "14px", padding: "20px", border: "none", cursor: "pointer", textAlign: "left", fontFamily: "inherit", transition: "transform 0.15s, box-shadow 0.15s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 24px rgba(0,0,0,0.4)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "none"; (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ color: "rgba(252,250,247,0.4)", fontSize: "0.75rem", fontWeight: "700" }}>#{g.num}</span>
                    {g.tag === "hard" && <span style={{ backgroundColor: "rgba(200,60,60,0.4)", color: "#fcfaf7", fontSize: "0.62rem", fontWeight: "700", padding: "1px 5px", borderRadius: "4px", textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>hard</span>}
                  </div>
                  {best !== undefined && <span style={{ color: "rgba(252,250,247,0.35)", fontSize: "0.72rem" }}>Best: {best}</span>}
                </div>
                <div style={{ color: "#fcfaf7", fontWeight: "700", fontSize: "0.95rem", marginBottom: "6px" }}>{g.title}</div>
                <div style={{ color: "rgba(252,250,247,0.5)", fontSize: "0.78rem", lineHeight: 1.4 }}>{g.desc}</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
