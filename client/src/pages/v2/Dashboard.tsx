import { useLocation } from "wouter";
import { useUser } from "@/contexts/UserContext";

const MODULES = [
  { path: "/explorer", emoji: "🗂️", title: "System Explorer", desc: "Navigate all 11 body systems by casual name", color: "#596e60" },
  { path: "/dictionary", emoji: "🔍", title: "Dictionary Search", desc: "Reverse-lookup definitions & filter by word type", color: "#4a5a6a" },
  { path: "/root-builder", emoji: "🔬", title: "Root Builder", desc: "Assemble terms from prefixes, roots & suffixes", color: "#9c6f5e" },
  { path: "/flashcards", emoji: "📇", title: "Flashcards", desc: "Study decks + automatic Critical Review tracker", color: "#5c4a6a" },
  { path: "/games", emoji: "🎮", title: "12 Game Modes", desc: "Interactive, text-driven vocabulary challenges", color: "#4f4f4f" },
];

const SYS_COLORS: Record<string, string> = {
  digestive: "#596e60", cardiovascular: "#4a5a6a", respiratory: "#9c6f5e",
  nervous: "#5c4a6a", musculoskeletal: "#4f4f4f", urinary: "#3b5e66",
  endocrine: "#3b5e66", integumentary: "#3b5e66", lymphatic: "#4a5a6e",
  reproductive: "#6a4a5e", blood: "#4a5a6a",
};

export default function Dashboard() {
  const { user, logout } = useUser();
  const [, navigate] = useLocation();
  const critCount = Object.keys(user?.criticalReview ?? {}).length;
  const totalGames = Object.keys(user?.gameScores ?? {}).length;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#8b4f58", fontFamily: "'Inter','Plus Jakarta Sans',sans-serif", padding: "0" }}>
      <header style={{ backgroundColor: "rgba(0,0,0,0.2)", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(252,250,247,0.1)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "28px" }}>🫀</span>
          <div>
            <span style={{ color: "#fcfaf7", fontWeight: "800", fontSize: "1.2rem" }}>AnatomiX</span>
            <span style={{ color: "rgba(252,250,247,0.5)", fontSize: "0.8rem", display: "block", lineHeight: 1 }}>Language of Medicine</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span style={{ color: "#fcfaf7", fontSize: "0.9rem", fontWeight: "600" }}>👤 {user?.username}</span>
          <button
            onClick={logout}
            style={{ color: "rgba(252,250,247,0.6)", fontSize: "0.8rem", background: "none", border: "none", cursor: "pointer", padding: "4px 8px", borderRadius: "6px" }}
          >
            Switch User / Sign Out
          </button>
        </div>
      </header>

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ marginBottom: "40px" }}>
          <h1 style={{ color: "#fcfaf7", fontSize: "2rem", fontWeight: "800", margin: "0 0 8px", letterSpacing: "-0.02em" }}>
            Welcome back, {user?.username} 👋
          </h1>
          <p style={{ color: "rgba(252,250,247,0.6)", fontSize: "1rem", margin: 0 }}>
            Your personalized Chabner study hub — all progress saved locally to your profile.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "16px", marginBottom: "40px" }}>
          {[
            { label: "Critical Review Terms", value: critCount, note: critCount > 0 ? "Need 2 correct in a row to clear" : "Clean slate!", color: critCount > 0 ? "#e07070" : "#70b070" },
            { label: "Games Played", value: totalGames, note: "Unique game modes", color: "#fcfaf7" },
            { label: "Custom Decks", value: user?.decks.length ?? 0, note: "Personal study collections", color: "#fcfaf7" },
          ].map(s => (
            <div key={s.label} style={{ backgroundColor: "rgba(0,0,0,0.2)", borderRadius: "12px", padding: "20px", border: "1px solid rgba(252,250,247,0.08)" }}>
              <div style={{ color: s.color, fontSize: "2rem", fontWeight: "800" }}>{s.value}</div>
              <div style={{ color: "#fcfaf7", fontSize: "0.9rem", fontWeight: "600", marginTop: "4px" }}>{s.label}</div>
              <div style={{ color: "rgba(252,250,247,0.5)", fontSize: "0.75rem", marginTop: "4px" }}>{s.note}</div>
            </div>
          ))}
        </div>

        {critCount > 0 && (
          <div
            onClick={() => navigate("/flashcards")}
            style={{ backgroundColor: "rgba(180,80,80,0.25)", border: "1px solid rgba(220,100,100,0.4)", borderRadius: "12px", padding: "16px 20px", marginBottom: "32px", cursor: "pointer", display: "flex", alignItems: "center", gap: "12px" }}
          >
            <span style={{ fontSize: "24px" }}>⚠️</span>
            <div>
              <div style={{ color: "#f5a0a0", fontWeight: "700" }}>{critCount} term{critCount !== 1 ? "s" : ""} in Critical Review</div>
              <div style={{ color: "rgba(252,250,247,0.6)", fontSize: "0.85rem" }}>Click to practice — answer correctly twice in a row to clear each term.</div>
            </div>
          </div>
        )}

        <h2 style={{ color: "#fcfaf7", fontSize: "1.1rem", fontWeight: "700", marginBottom: "16px", letterSpacing: "0.05em", textTransform: "uppercase", opacity: 0.7 }}>Study Modules</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          {MODULES.map(m => (
            <button
              key={m.path}
              onClick={() => navigate(m.path)}
              style={{
                backgroundColor: m.color, borderRadius: "14px", padding: "24px", border: "none", cursor: "pointer",
                textAlign: "left", transition: "transform 0.15s, box-shadow 0.15s", display: "block", width: "100%",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 24px rgba(0,0,0,0.3)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "none"; (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}
            >
              <div style={{ fontSize: "32px", marginBottom: "10px" }}>{m.emoji}</div>
              <div style={{ color: "#fcfaf7", fontWeight: "700", fontSize: "1.05rem", marginBottom: "6px" }}>{m.title}</div>
              <div style={{ color: "rgba(252,250,247,0.65)", fontSize: "0.82rem", lineHeight: 1.4 }}>{m.desc}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
