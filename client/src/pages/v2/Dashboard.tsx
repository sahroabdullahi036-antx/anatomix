import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { useUser, ACHIEVEMENTS } from "@/contexts/UserContext";
import { CHAPTERS, getTermsByChapter, ALL_TERMS } from "@/data/medicalData";
import { hasPassword } from "@/utils/auth";
import AccountSettings from "./AccountSettings";

const MODULES = [
  { path: "/body-reference",     title: "Body Explorer",    color: "#374a5e", tag: "" },
  { path: "/dictionary",         title: "Dictionary",       color: "#3b4e64", tag: "" },
  { path: "/root-builder",       title: "Root Builder",     color: "#364860", tag: "" },
  { path: "/flashcards",         title: "Flashcards",       color: "#3d5068", tag: "" },
  { path: "/games",              title: "Games",            color: "#394c62", tag: "" },
  { path: "/practice-test",      title: "Practice Test",    color: "#3a4d60", tag: "" },
  { path: "/daily-challenge",    title: "Daily Challenge",  color: "#364a5e", tag: "" },
  { path: "/boss-round",         title: "Boss Round",       color: "#5a3040", tag: "hard" },
  { path: "/games/spelling-bee", title: "Spelling Bee",     color: "#3a4f5e", tag: "" },
  { path: "/multiplayer",        title: "Multiplayer",      color: "#3d4e6a", tag: "live" },
];

function seededIdx(seed: number, len: number) {
  const h = ((seed ^ 0xdeadbeef) * 0x45d9f3b) >>> 0;
  return h % len;
}

function getCSTSlot(): number {
  const fmt = new Intl.DateTimeFormat("en-US", { timeZone: "America/Chicago", hour: "numeric", hour12: false });
  const hour = parseInt(fmt.format(new Date()));
  if (hour < 8)  return 0;
  if (hour < 11) return 1;
  if (hour < 14) return 2;
  if (hour < 17) return 3;
  if (hour < 20) return 4;
  return 5;
}

function getDayOfYear(): number {
  const now = new Date();
  return Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86_400_000);
}

function getSpotlightTerm() {
  const seed = getDayOfYear() * 6 + getCSTSlot();
  return ALL_TERMS[seededIdx(seed, ALL_TERMS.length)];
}

const ONBOARDING_ITEMS = [
  { id: "studied",     label: "Study 10+ flashcards",       done: (u: any) => (u.studiedCount ?? 0) >= 10 },
  { id: "game",        label: "Play any game",               done: (u: any) => Object.keys(u.gameScores ?? {}).length > 0 },
  { id: "test",        label: "Take a Practice Test",        done: (u: any) => "practice-test" in (u.gameScores ?? {}) },
  { id: "password",    label: "Set a profile password",      done: (u: any) => hasPassword(u.username) },
  { id: "chapter",     label: "Reach 80% in one chapter",   done: (u: any) => CHAPTERS.some(ch => { const studyIds = ch.termIds.filter((id: string) => { const t = ALL_TERMS.find(x => x.id === id); return t && t.type !== "condition" && t.type !== "procedure"; }); return studyIds.length > 0 && studyIds.filter((id: string) => (u.clearedTermIds ?? []).includes(id)).length / studyIds.length >= 0.8; }) },
];

export default function Dashboard() {
  const { user, logout } = useUser();
  const [, navigate] = useLocation();
  const [showSettings, setShowSettings] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [spotlightFlipped, setSpotlightFlipped] = useState(false);

  const critCount = Object.keys(user?.criticalReview ?? {}).length;
  const cleared = useMemo(() => new Set(user?.clearedTermIds ?? []), [user?.clearedTermIds]);
  const streak = user?.studyStreak ?? 0;
  const earned = user?.earnedAchievements ?? [];

  const proficientCount = CHAPTERS.filter(ch => {
    const studyIds = ch.termIds.filter((id: string) => { const t = ALL_TERMS.find(x => x.id === id); return t && t.type !== "condition" && t.type !== "procedure"; });
    const c = studyIds.filter((id: string) => cleared.has(id)).length;
    return studyIds.length > 0 && c / studyIds.length >= 0.8;
  }).length;

  const spotlight = useMemo(() => getSpotlightTerm(), []);

  const onboardingItems = user ? ONBOARDING_ITEMS.map(item => ({ ...item, isDone: item.done(user) })) : [];
  const onboardingDone = onboardingItems.every(i => i.isDone);
  const onboardingProgress = onboardingItems.filter(i => i.isDone).length;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#252830", fontFamily: "'Inter','Plus Jakarta Sans',sans-serif" }}>
      <header style={{ backgroundColor: "rgba(0,0,0,0.3)", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(252,250,247,0.07)" }}>
        <div>
          <span style={{ color: "#fcfaf7", fontWeight: "800", fontSize: "1.2rem" }}>AnatomiX</span>
          <span style={{ color: "rgba(252,250,247,0.4)", fontSize: "0.78rem", display: "block", lineHeight: 1.2 }}>Medical Terminology</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {streak > 1 && <span style={{ color: "rgba(252,250,247,0.5)", fontSize: "0.8rem", backgroundColor: "rgba(255,255,255,0.05)", borderRadius: "6px", padding: "4px 10px", border: "1px solid rgba(252,250,247,0.08)" }}>{streak} day streak</span>}
          {earned.length > 0 && <button onClick={() => setShowAchievements(s => !s)} style={{ color: "rgba(252,250,247,0.5)", fontSize: "0.8rem", backgroundColor: "rgba(255,255,255,0.05)", borderRadius: "6px", padding: "4px 10px", border: "1px solid rgba(252,250,247,0.08)", cursor: "pointer", fontFamily: "inherit" }}>{earned.length} achievement{earned.length !== 1 ? "s" : ""}</button>}
          <span style={{ color: "rgba(252,250,247,0.7)", fontSize: "0.9rem", fontWeight: "600" }}>{user?.username}</span>
          <button onClick={() => setShowSettings(true)} style={{ color: "rgba(252,250,247,0.45)", fontSize: "0.8rem", background: "none", border: "none", cursor: "pointer", padding: "4px 8px", borderRadius: "6px", fontFamily: "inherit" }}>Account</button>
          <button onClick={logout} style={{ color: "rgba(252,250,247,0.45)", fontSize: "0.8rem", background: "none", border: "none", cursor: "pointer", padding: "4px 8px", borderRadius: "6px", fontFamily: "inherit" }}>Switch User</button>
        </div>
      </header>

      <div style={{ maxWidth: "960px", margin: "0 auto", padding: "32px 24px" }}>
        <div style={{ marginBottom: "28px" }}>
          <h1 style={{ color: "#fcfaf7", fontSize: "1.9rem", fontWeight: "800", margin: "0 0 6px", letterSpacing: "-0.02em" }}>Welcome back, {user?.username}</h1>
          <p style={{ color: "rgba(252,250,247,0.4)", fontSize: "0.95rem", margin: 0 }}>Your personalized medical terminology study hub.</p>
        </div>

        {showAchievements && (
          <div style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(252,250,247,0.07)", borderRadius: "14px", padding: "20px 24px", marginBottom: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <span style={{ color: "#fcfaf7", fontWeight: "700" }}>Achievements ({earned.length}/{Object.keys(ACHIEVEMENTS).length})</span>
              <button onClick={() => setShowAchievements(false)} style={{ background: "none", border: "none", color: "rgba(252,250,247,0.35)", cursor: "pointer", fontFamily: "inherit" }}>Close</button>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {Object.entries(ACHIEVEMENTS).map(([id, a]) => {
                const done = earned.includes(id);
                return <div key={id} style={{ padding: "6px 12px", borderRadius: "8px", backgroundColor: done ? "rgba(74,96,128,0.4)" : "rgba(255,255,255,0.04)", border: done ? "1px solid rgba(74,96,128,0.5)" : "1px solid rgba(252,250,247,0.06)" }}><div style={{ color: done ? "#fcfaf7" : "rgba(252,250,247,0.25)", fontWeight: "700", fontSize: "0.82rem" }}>{a.label}</div><div style={{ color: done ? "rgba(252,250,247,0.5)" : "rgba(252,250,247,0.15)", fontSize: "0.72rem" }}>{a.description}</div></div>;
              })}
            </div>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "28px" }}>
          {critCount > 0 && (
            <div onClick={() => navigate("/flashcards")} style={{ backgroundColor: "rgba(160,70,70,0.2)", border: "1px solid rgba(200,90,90,0.3)", borderRadius: "12px", padding: "16px 20px", cursor: "pointer", gridColumn: "1 / -1", display: "flex", alignItems: "center", gap: "14px" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#c07070", flexShrink: 0 }} />
              <div>
                <div style={{ color: "#e09090", fontWeight: "700" }}>{critCount} term{critCount !== 1 ? "s" : ""} in Critical Review</div>
                <div style={{ color: "rgba(252,250,247,0.5)", fontSize: "0.85rem" }}>Click to practice. Answer correctly to clear each term.</div>
              </div>
            </div>
          )}

          <div onClick={() => setSpotlightFlipped(s => !s)} style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(252,250,247,0.07)", borderRadius: "12px", padding: "18px 20px", cursor: "pointer" }}>
            <div style={{ color: "rgba(252,250,247,0.35)", fontSize: "0.68rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" }}>Clinical Spotlight</div>
            {!spotlightFlipped ? (
              <>
                <div style={{ color: "#fcfaf7", fontWeight: "800", fontSize: "1.2rem", fontFamily: "monospace", marginBottom: "4px" }}>{spotlight.term}</div>
                <div style={{ color: "rgba(252,250,247,0.35)", fontSize: "0.75rem" }}>{spotlight.type} - {spotlight.system}</div>
                <div style={{ color: "rgba(252,250,247,0.3)", fontSize: "0.72rem", marginTop: "8px" }}>Tap to reveal</div>
              </>
            ) : (
              <>
                <div style={{ color: "#fcfaf7", fontWeight: "700", fontSize: "0.95rem", marginBottom: "6px" }}>{spotlight.meaning}</div>
                <div style={{ color: "rgba(252,250,247,0.55)", fontSize: "0.82rem", lineHeight: 1.4 }}>{spotlight.definition}</div>
              </>
            )}
          </div>

          {!onboardingDone && (
            <div style={{ backgroundColor: "rgba(255,255,255,0.04)", border: "1px solid rgba(252,250,247,0.07)", borderRadius: "12px", padding: "18px 20px" }}>
              <div style={{ color: "rgba(252,250,247,0.35)", fontSize: "0.68rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" }}>Getting Started ({onboardingProgress}/{onboardingItems.length})</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {onboardingItems.map(item => (
                  <div key={item.id} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ width: "14px", height: "14px", borderRadius: "50%", backgroundColor: item.isDone ? "rgba(80,150,90,0.5)" : "rgba(255,255,255,0.08)", border: item.isDone ? "1px solid rgba(80,160,100,0.5)" : "1px solid rgba(252,250,247,0.1)", flexShrink: 0 }} />
                    <span style={{ color: item.isDone ? "rgba(252,250,247,0.4)" : "#fcfaf7", fontSize: "0.82rem", textDecoration: item.isDone ? "line-through" : "none" }}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {proficientCount > 0 && (
            <div style={{ backgroundColor: "rgba(60,130,80,0.08)", border: "1px solid rgba(80,160,100,0.18)", borderRadius: "12px", padding: "16px 20px" }}>
              <div style={{ color: "rgba(252,250,247,0.35)", fontSize: "0.68rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>Progress</div>
              <div style={{ color: "#7aaa7a", fontWeight: "700", fontSize: "1.1rem" }}>{proficientCount} chapter{proficientCount !== 1 ? "s" : ""} proficient</div>
              <div style={{ color: "rgba(252,250,247,0.4)", fontSize: "0.82rem", marginTop: "4px" }}>{cleared.size} terms cleared total</div>
              <div style={{ color: "rgba(252,250,247,0.3)", fontSize: "0.78rem", marginTop: "4px" }}>Summary sheets unlocked in Flashcards</div>
            </div>
          )}
        </div>

        <h2 style={{ color: "rgba(252,250,247,0.35)", fontSize: "0.72rem", fontWeight: "700", marginBottom: "14px", letterSpacing: "0.08em", textTransform: "uppercase" }}>Study Modules</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))", gap: "12px" }}>
          {MODULES.map(m => (
            <button
              key={m.path}
              onClick={() => navigate(m.path)}
              style={{ backgroundColor: m.color, borderRadius: "12px", padding: "20px 22px", border: "none", cursor: "pointer", textAlign: "left", transition: "transform 0.15s, box-shadow 0.15s", display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", fontFamily: "inherit" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 20px rgba(0,0,0,0.4)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "none"; (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}
            >
              <span style={{ color: "#fcfaf7", fontWeight: "700", fontSize: "0.95rem" }}>{m.title}</span>
              {m.tag && <span style={{ backgroundColor: m.tag === "hard" ? "rgba(200,60,60,0.4)" : "rgba(60,180,120,0.3)", color: "#fcfaf7", fontSize: "0.65rem", fontWeight: "700", padding: "2px 6px", borderRadius: "4px", textTransform: "uppercase", letterSpacing: "0.06em", flexShrink: 0 }}>{m.tag}</span>}
            </button>
          ))}
        </div>
      </div>

      {showSettings && <AccountSettings onClose={() => setShowSettings(false)} />}
    </div>
  );
}
