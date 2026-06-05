import { useLocation } from "wouter";
import { useUser } from "@/contexts/UserContext";

const MODULES = [
  { path: "/explorer",     title: "System Explorer",   desc: "Navigate all 11 body systems and their structures",         color: "#374a5e" },
  { path: "/dictionary",   title: "Dictionary Search",  desc: "Reverse-lookup definitions and filter by word type",        color: "#3b4e64" },
  { path: "/root-builder", title: "Root Builder",       desc: "Assemble terms from prefixes, roots and suffixes",          color: "#364860" },
  { path: "/flashcards",   title: "Flashcards",         desc: "Study decks with automatic Critical Review tracking",       color: "#3d5068" },
  { path: "/games",        title: "12 Game Modes",      desc: "Interactive vocabulary challenges across 12 formats",       color: "#394c62" },
];

export default function Dashboard() {
  const { user, logout } = useUser();
  const [, navigate] = useLocation();
  const critCount = Object.keys(user?.criticalReview ?? {}).length;
  const totalGames = Object.keys(user?.gameScores ?? {}).length;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#252830", fontFamily: "'Inter','Plus Jakarta Sans',sans-serif" }}>
      <header style={{ backgroundColor: "rgba(0,0,0,0.3)", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(252,250,247,0.07)" }}>
        <div>
          <span style={{ color: "#fcfaf7", fontWeight: "800", fontSize: "1.2rem" }}>AnatomiX</span>
          <span style={{ color: "rgba(252,250,247,0.4)", fontSize: "0.78rem", display: "block", lineHeight: 1.2 }}>Medical Terminology</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
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
        <div style={{ marginBottom: "40px" }}>
          <h1 style={{ color: "#fcfaf7", fontSize: "2rem", fontWeight: "800", margin: "0 0 8px", letterSpacing: "-0.02em" }}>
            Welcome back, {user?.username}
          </h1>
          <p style={{ color: "rgba(252,250,247,0.45)", fontSize: "1rem", margin: 0 }}>
            Your personalized study hub — all progress saved locally to your profile.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "14px", marginBottom: "40px" }}>
          {[
            { label: "Critical Review Terms", value: critCount, note: critCount > 0 ? "Need 2 correct in a row to clear" : "Clean slate", color: critCount > 0 ? "#c07070" : "#7aaa7a" },
            { label: "Games Played",           value: totalGames,              note: "Unique game modes",            color: "#fcfaf7" },
            { label: "Custom Decks",           value: user?.decks.length ?? 0, note: "Personal study collections",  color: "#fcfaf7" },
          ].map(s => (
            <div key={s.label} style={{ backgroundColor: "rgba(255,255,255,0.05)", borderRadius: "12px", padding: "20px", border: "1px solid rgba(252,250,247,0.06)" }}>
              <div style={{ color: s.color, fontSize: "2rem", fontWeight: "800" }}>{s.value}</div>
              <div style={{ color: "#fcfaf7", fontSize: "0.9rem", fontWeight: "600", marginTop: "4px" }}>{s.label}</div>
              <div style={{ color: "rgba(252,250,247,0.4)", fontSize: "0.75rem", marginTop: "4px" }}>{s.note}</div>
            </div>
          ))}
        </div>

        {critCount > 0 && (
          <div
            onClick={() => navigate("/flashcards")}
            style={{ backgroundColor: "rgba(160,70,70,0.2)", border: "1px solid rgba(200,90,90,0.3)", borderRadius: "12px", padding: "16px 20px", marginBottom: "32px", cursor: "pointer", display: "flex", alignItems: "center", gap: "14px" }}
          >
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#c07070", flexShrink: 0 }} />
            <div>
              <div style={{ color: "#e09090", fontWeight: "700" }}>{critCount} term{critCount !== 1 ? "s" : ""} in Critical Review</div>
              <div style={{ color: "rgba(252,250,247,0.5)", fontSize: "0.85rem" }}>Click to practice — answer correctly twice in a row to clear each term.</div>
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
              <div style={{ color: "#fcfaf7", fontWeight: "700", fontSize: "1.05rem", marginBottom: "6px" }}>{m.title}</div>
              <div style={{ color: "rgba(252,250,247,0.6)", fontSize: "0.82rem", lineHeight: 1.5 }}>{m.desc}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
