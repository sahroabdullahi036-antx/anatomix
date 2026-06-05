import { useLocation } from "wouter";
import { useUser } from "@/contexts/UserContext";
import { CHAPTERS, getTermsByChapter } from "@/data/medicalData";

const MODULES = [
  { path: "/explorer",         title: "System Explorer",  color: "#374a5e" },
  { path: "/dictionary",       title: "Dictionary",       color: "#3b4e64" },
  { path: "/root-builder",     title: "Root Builder",     color: "#364860" },
  { path: "/flashcards",       title: "Flashcards",       color: "#3d5068" },
  { path: "/games",            title: "Games",            color: "#394c62" },
  { path: "/practice-test",    title: "Practice Test",    color: "#3a4d60" },
  { path: "/daily-challenge",  title: "Daily Challenge",  color: "#364a5e" },
];

export default function Dashboard() {
  const { user, logout } = useUser();
  const [, navigate] = useLocation();
  const critCount = Object.keys(user?.criticalReview ?? {}).length;
  const cleared = new Set(user?.clearedTermIds ?? []);
  const streak = user?.studyStreak ?? 0;

  const proficientCount = CHAPTERS.filter(ch => {
    const terms = getTermsByChapter(ch.num);
    const clearedInChapter = ch.termIds.filter(id => cleared.has(id)).length;
    return terms.length > 0 && clearedInChapter / terms.length >= 0.8;
  }).length;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#252830", fontFamily: "'Inter','Plus Jakarta Sans',sans-serif" }}>
      <header style={{ backgroundColor: "rgba(0,0,0,0.3)", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(252,250,247,0.07)" }}>
        <div>
          <span style={{ color: "#fcfaf7", fontWeight: "800", fontSize: "1.2rem" }}>AnatomiX</span>
          <span style={{ color: "rgba(252,250,247,0.4)", fontSize: "0.78rem", display: "block", lineHeight: 1.2 }}>Medical Terminology</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {streak > 1 && (
            <span style={{ color: "rgba(252,250,247,0.5)", fontSize: "0.8rem", backgroundColor: "rgba(255,255,255,0.05)", borderRadius: "6px", padding: "4px 10px", border: "1px solid rgba(252,250,247,0.08)" }}>
              {streak} day streak
            </span>
          )}
          <span style={{ color: "rgba(252,250,247,0.7)", fontSize: "0.9rem", fontWeight: "600" }}>{user?.username}</span>
          <button
            onClick={logout}
            style={{ color: "rgba(252,250,247,0.45)", fontSize: "0.8rem", background: "none", border: "none", cursor: "pointer", padding: "4px 8px", borderRadius: "6px", fontFamily: "inherit" }}
          >
            Switch User
          </button>
        </div>
      </header>

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ marginBottom: "36px" }}>
          <h1 style={{ color: "#fcfaf7", fontSize: "2rem", fontWeight: "800", margin: "0 0 8px", letterSpacing: "-0.02em" }}>
            Welcome back, {user?.username}
          </h1>
          <p style={{ color: "rgba(252,250,247,0.45)", fontSize: "1rem", margin: 0 }}>
            Your personalized study hub. All progress saved locally to your profile.
          </p>
        </div>

        {critCount > 0 && (
          <div
            onClick={() => navigate("/flashcards")}
            style={{ backgroundColor: "rgba(160,70,70,0.2)", border: "1px solid rgba(200,90,90,0.3)", borderRadius: "12px", padding: "16px 20px", marginBottom: "32px", cursor: "pointer", display: "flex", alignItems: "center", gap: "14px" }}
          >
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#c07070", flexShrink: 0 }} />
            <div>
              <div style={{ color: "#e09090", fontWeight: "700" }}>{critCount} term{critCount !== 1 ? "s" : ""} in Critical Review</div>
              <div style={{ color: "rgba(252,250,247,0.5)", fontSize: "0.85rem" }}>Click to practice. Answer correctly twice in a row to clear each term.</div>
            </div>
          </div>
        )}

        {proficientCount > 0 && (
          <div style={{ backgroundColor: "rgba(60,130,80,0.1)", border: "1px solid rgba(80,160,100,0.2)", borderRadius: "12px", padding: "14px 20px", marginBottom: "32px", display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#7aaa7a", flexShrink: 0 }} />
            <div style={{ color: "rgba(252,250,247,0.6)", fontSize: "0.85rem" }}>
              <span style={{ color: "#7aaa7a", fontWeight: "700" }}>{proficientCount} chapter{proficientCount !== 1 ? "s" : ""} proficient</span> - summary sheets unlocked in Flashcards
            </div>
          </div>
        )}

        <h2 style={{ color: "rgba(252,250,247,0.45)", fontSize: "0.75rem", fontWeight: "700", marginBottom: "14px", letterSpacing: "0.08em", textTransform: "uppercase" }}>Study Modules</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
          {MODULES.map(m => (
            <button
              key={m.path}
              onClick={() => navigate(m.path)}
              style={{
                backgroundColor: m.color, borderRadius: "14px", padding: "24px", border: "none", cursor: "pointer",
                textAlign: "left", transition: "transform 0.15s, box-shadow 0.15s", display: "block", width: "100%",
                fontFamily: "inherit",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 24px rgba(0,0,0,0.4)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "none"; (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}
            >
              <div style={{ color: "#fcfaf7", fontWeight: "700", fontSize: "1.05rem" }}>{m.title}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
