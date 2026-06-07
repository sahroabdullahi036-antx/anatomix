import { useMemo, useCallback } from "react";
import { ALL_TERMS, getTermsByChapter, getTermChapter, CHAPTERS, STUDY_CHAPTER_KEY } from "@/data/medicalData";
import { useUser } from "@/contexts/UserContext";
import { useParticleBurst } from "@/components/ParticleBurst";

/**
 * Answer-feedback effects shared by every quiz/game. `burst` fires a confetti
 * burst centered on the clicked element (use on correct answers). Pair with the
 * CSS classes `ax-pop` (tactile press), `ax-shake` (wrong buzz) and `ax-correct`
 * (correct pop) defined in index.css.
 */
export function useAnswerFx() {
  const { triggerBurst } = useParticleBurst();
  const burst = useCallback((el: Element | null | undefined) => {
    if (!el) return;
    const r = el.getBoundingClientRect();
    triggerBurst(r.left + r.width / 2, r.top + r.height / 2);
  }, [triggerBurst]);
  const burstEvent = useCallback((e: { currentTarget: Element }) => burst(e.currentTarget), [burst]);
  return { burst, burstEvent };
}

/**
 * Pick items with DISTINCT key values, skipping any equal to `exclude`. Used to
 * build answer distractors: many terms share an identical meaning string (e.g.
 * "inflammation", "heart"), so naive random distractors can duplicate the correct
 * answer's text and make a correct pick score as wrong. Comparison is
 * case-insensitive and trimmed.
 */
export function distinctByKey<T>(items: T[], keyOf: (t: T) => string, exclude?: string): T[] {
  const seen = new Set<string>();
  if (exclude != null) seen.add(exclude.trim().toLowerCase());
  const out: T[] = [];
  for (const it of items) {
    const k = keyOf(it).trim().toLowerCase();
    if (!k || seen.has(k)) continue;
    seen.add(k);
    out.push(it);
  }
  return out;
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Chapters the user has "begun" = at least one term cleared in them. */
export function startedChapterNums(clearedIds: Iterable<string>): number[] {
  const cleared = new Set(clearedIds);
  return CHAPTERS.filter(ch => ch.termIds.some(id => cleared.has(id))).map(ch => ch.num);
}

/** Hook: sorted list of chapter numbers the current user has unlocked (begun). */
export function useUnlockedChapters(): number[] {
  const { user } = useUser();
  return useMemo(
    () => startedChapterNums(user?.clearedTermIds ?? []).sort((a, b) => a - b),
    [user?.clearedTermIds]
  );
}

/** Union of all terms belonging to the given chapter numbers. */
export function termsForChapters(nums: number[]): typeof ALL_TERMS {
  if (!nums.length) return [];
  const set = new Set(nums);
  return ALL_TERMS.filter(t => set.has(getTermChapter(t.id)));
}

export function useGameTerms(overridePool?: typeof ALL_TERMS) {
  const unlocked = useUnlockedChapters();
  return useMemo(() => {
    let pool: typeof ALL_TERMS;
    if (overridePool) {
      pool = overridePool;
    } else {
      const stored = parseInt(localStorage.getItem(STUDY_CHAPTER_KEY) || "0", 10);
      pool = stored > 0 && unlocked.includes(stored) ? getTermsByChapter(stored) : termsForChapters(unlocked);
    }
    const isStudyable = (t: typeof ALL_TERMS[0]) =>
      t.type !== "condition" && t.type !== "procedure" && (t.type !== "prefix" || t.example);
    const filtered = pool.filter(isStudyable);
    if (filtered.length >= 4 || overridePool) return shuffle(filtered.length ? filtered : pool);
    // never fall back to locked content: widen only to the user's full unlocked set
    const all = termsForChapters(unlocked).filter(isStudyable);
    return shuffle(all.length ? all : filtered);
  }, [overridePool, unlocked]);
}

/** Full-page overlay shown when the user has not begun any chapter yet. */
export function GameLock({ onBack, onStudy }: { onBack: () => void; onStudy: () => void }) {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#252830", fontFamily: "'Inter','Plus Jakarta Sans',sans-serif", display: "flex", flexDirection: "column" }}>
      <div style={{ backgroundColor: "rgba(0,0,0,0.3)", padding: "14px 24px", display: "flex", alignItems: "center", gap: "12px", borderBottom: "1px solid rgba(252,250,247,0.07)" }}>
        <button onClick={onBack} data-testid="button-lock-back" style={{ backgroundColor: "rgba(255,255,255,0.07)", color: "#fcfaf7", border: "1px solid rgba(252,250,247,0.1)", borderRadius: "8px", padding: "8px 16px", cursor: "pointer", fontFamily: "inherit", fontSize: "0.9rem" }}>← Back</button>
        <span style={{ color: "#fcfaf7", fontWeight: "700" }}>Games Locked</span>
      </div>
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
        <div style={{ maxWidth: "440px", textAlign: "center", backgroundColor: "rgba(255,255,255,0.04)", borderRadius: "16px", padding: "40px 28px", border: "1px solid rgba(252,250,247,0.07)" }}>
          <div style={{ fontSize: "44px", marginBottom: "14px" }}>🔒</div>
          <h1 style={{ color: "#fcfaf7", fontSize: "1.4rem", fontWeight: "800", marginBottom: "10px" }}>Begin a chapter to unlock games</h1>
          <p style={{ color: "rgba(252,250,247,0.5)", fontSize: "0.92rem", lineHeight: 1.6, marginBottom: "26px" }}>
            Games only use terms from chapters you've started. Study any chapter's flashcards first - the more chapters you begin, the more terms you can play with.
          </p>
          <button onClick={onStudy} data-testid="button-lock-study" style={{ padding: "13px 34px", borderRadius: "12px", backgroundColor: "#4a6080", color: "#fcfaf7", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: "700", fontSize: "1rem" }}>Start Studying</button>
        </div>
      </div>
    </div>
  );
}

/** Shown when the user's started chapters don't contain enough terms for a game. */
export function GameEmpty({ onBack, onStudy, message }: { onBack: () => void; onStudy: () => void; message?: string }) {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#252830", fontFamily: "'Inter','Plus Jakarta Sans',sans-serif", display: "flex", flexDirection: "column" }}>
      <div style={{ backgroundColor: "rgba(0,0,0,0.3)", padding: "14px 24px", display: "flex", alignItems: "center", gap: "12px", borderBottom: "1px solid rgba(252,250,247,0.07)" }}>
        <button onClick={onBack} data-testid="button-empty-back" style={{ backgroundColor: "rgba(255,255,255,0.07)", color: "#fcfaf7", border: "1px solid rgba(252,250,247,0.1)", borderRadius: "8px", padding: "8px 16px", cursor: "pointer", fontFamily: "inherit", fontSize: "0.9rem" }}>← Games</button>
        <span style={{ color: "#fcfaf7", fontWeight: "700" }}>Not Enough Terms Yet</span>
      </div>
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
        <div style={{ maxWidth: "440px", textAlign: "center", backgroundColor: "rgba(255,255,255,0.04)", borderRadius: "16px", padding: "40px 28px", border: "1px solid rgba(252,250,247,0.07)" }}>
          <div style={{ fontSize: "44px", marginBottom: "14px" }}>📚</div>
          <h1 style={{ color: "#fcfaf7", fontSize: "1.4rem", fontWeight: "800", marginBottom: "10px" }}>This game needs more terms</h1>
          <p style={{ color: "rgba(252,250,247,0.5)", fontSize: "0.92rem", lineHeight: 1.6, marginBottom: "26px" }}>
            {message ?? "The chapters you've started don't have enough terms of the right kind for this mode yet. Study a few more chapters and come back."}
          </p>
          <button onClick={onStudy} data-testid="button-empty-study" style={{ padding: "13px 34px", borderRadius: "12px", backgroundColor: "#4a6080", color: "#fcfaf7", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: "700", fontSize: "1rem" }}>Study Chapters</button>
        </div>
      </div>
    </div>
  );
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
