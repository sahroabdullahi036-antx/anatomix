import { useMemo } from "react";
import { ALL_TERMS, getTermsByChapter, STUDY_CHAPTER_KEY } from "@/data/medicalData";

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function useGameTerms(overridePool?: typeof ALL_TERMS) {
  return useMemo(() => {
    let pool: typeof ALL_TERMS;
    if (overridePool) {
      pool = overridePool;
    } else {
      const stored = localStorage.getItem(STUDY_CHAPTER_KEY);
      const ch = stored ? parseInt(stored, 10) : 0;
      pool = ch > 0 ? getTermsByChapter(ch) : ALL_TERMS;
    }
    const isStudyable = (t: typeof ALL_TERMS[0]) =>
      t.type !== "condition" && t.type !== "procedure" && (t.type !== "prefix" || t.example);
    const filtered = pool.filter(isStudyable);
    return shuffle(filtered.length >= 4 ? filtered : ALL_TERMS.filter(isStudyable));
  }, [overridePool]);
}

export function GameShell({ title, score, streak, idx, total, onBack, children }: {
  title: string; score: number; streak: number;
  idx: number; total: number; onBack: () => void; children: React.ReactNode;
}) {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#252830", fontFamily: "'Inter','Plus Jakarta Sans',sans-serif" }}>
      <div style={{ backgroundColor: "rgba(0,0,0,0.3)", padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(252,250,247,0.07)", flexWrap: "wrap", gap: "10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button onClick={onBack} style={{ backgroundColor: "rgba(255,255,255,0.07)", color: "#fcfaf7", border: "1px solid rgba(252,250,247,0.1)", borderRadius: "8px", padding: "7px 14px", cursor: "pointer", fontFamily: "inherit", fontSize: "0.85rem" }}>← Games</button>
          <span style={{ color: "#fcfaf7", fontWeight: "700" }}>{title}</span>
        </div>
        <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
          {streak >= 2 && <span style={{ color: "#c8a84a", fontSize: "0.85rem", fontWeight: "700" }}>{streak}x streak</span>}
          <span style={{ color: "#fcfaf7", fontSize: "0.9rem", fontWeight: "700" }}>Score: {score}</span>
          <span style={{ color: "rgba(252,250,247,0.4)", fontSize: "0.82rem" }}>{idx + 1}/{total}</span>
        </div>
      </div>
      <div style={{ maxWidth: "680px", margin: "0 auto", padding: "28px 24px" }}>
        {children}
      </div>
    </div>
  );
}

export interface WrongAnswer {
  term: string;
  meaning: string;
  definition: string;
  userAnswer?: string;
}

export function WrongAnswerReview({ wrongs, onDone }: { wrongs: WrongAnswer[]; onDone: () => void }) {
  if (wrongs.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "40px 24px" }}>
        <div style={{ color: "#7aaa7a", fontWeight: "800", fontSize: "1.5rem", marginBottom: "8px" }}>Perfect Round</div>
        <div style={{ color: "rgba(252,250,247,0.5)", fontSize: "0.9rem", marginBottom: "28px" }}>No mistakes this session.</div>
        <button onClick={onDone} style={{ padding: "12px 32px", borderRadius: "10px", backgroundColor: "#fcfaf7", color: "#252830", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: "700" }}>Done</button>
      </div>
    );
  }
  return (
    <div style={{ padding: "24px" }}>
      <div style={{ color: "rgba(252,250,247,0.4)", fontSize: "0.72rem", fontWeight: "700", textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: "16px" }}>
        Missed {wrongs.length} term{wrongs.length !== 1 ? "s" : ""} - review before leaving
      </div>
      <div style={{ display: "flex", flexDirection: "column" as const, gap: "10px", marginBottom: "28px" }}>
        {wrongs.map((w, i) => (
          <div key={i} style={{ backgroundColor: "rgba(160,70,70,0.12)", borderRadius: "10px", padding: "14px 18px", border: "1px solid rgba(200,90,90,0.2)" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: "10px", marginBottom: "4px", flexWrap: "wrap" as const }}>
              <span style={{ color: "#fcfaf7", fontFamily: "monospace", fontWeight: "800", fontSize: "1rem" }}>{w.term}</span>
              {w.userAnswer && <span style={{ color: "rgba(220,100,100,0.7)", fontSize: "0.75rem" }}>you wrote: "{w.userAnswer}"</span>}
            </div>
            <div style={{ color: "rgba(252,250,247,0.85)", fontSize: "0.88rem", fontWeight: "600", marginBottom: "3px" }}>{w.meaning}</div>
            <div style={{ color: "rgba(252,250,247,0.45)", fontSize: "0.78rem", lineHeight: 1.45 }}>{w.definition}</div>
          </div>
        ))}
      </div>
      <div style={{ textAlign: "center" as const }}>
        <button onClick={onDone} style={{ padding: "12px 32px", borderRadius: "10px", backgroundColor: "#fcfaf7", color: "#252830", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: "700" }}>Done</button>
      </div>
    </div>
  );
}

export function ProgressBar({ value, max, color = "#5a7090", label }: { value: number; max: number; color?: string; label?: string }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div style={{ marginBottom: "16px" }}>
      {label && <div style={{ color: "rgba(252,250,247,0.45)", fontSize: "0.8rem", marginBottom: "6px" }}>{label}</div>}
      <div style={{ backgroundColor: "rgba(0,0,0,0.25)", borderRadius: "8px", height: "10px", overflow: "hidden" }}>
        <div style={{ backgroundColor: color, height: "100%", width: `${pct}%`, transition: "width 0.3s linear", borderRadius: "8px" }} />
      </div>
    </div>
  );
}
