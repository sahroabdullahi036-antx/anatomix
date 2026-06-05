import { useState } from "react";
import { useUser } from "@/contexts/UserContext";

export default function LoginGate() {
  const { login, recentUsers } = useUser();
  const [username, setUsername] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) login(username.trim());
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#8b4f58", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", fontFamily: "'Inter', 'Plus Jakarta Sans', sans-serif" }}>
      <div style={{ width: "100%", maxWidth: "440px" }}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{ fontSize: "64px", marginBottom: "12px" }}>🫀</div>
          <h1 style={{ color: "#fcfaf7", fontSize: "2.5rem", fontWeight: "800", margin: "0 0 8px", letterSpacing: "-0.02em" }}>AnatomiX</h1>
          <p style={{ color: "rgba(252,250,247,0.7)", fontSize: "1rem", margin: 0 }}>Medical Terminology Study Platform</p>
        </div>

        <div style={{ backgroundColor: "rgba(0,0,0,0.25)", borderRadius: "16px", padding: "32px", backdropFilter: "blur(10px)", border: "1px solid rgba(252,250,247,0.1)" }}>
          <h2 style={{ color: "#fcfaf7", fontSize: "1.1rem", fontWeight: "600", marginBottom: "8px", textAlign: "center" }}>Enter Your Username to Load Your Textbook Progress</h2>
          <p style={{ color: "rgba(252,250,247,0.6)", fontSize: "0.85rem", marginBottom: "24px", textAlign: "center" }}>Each user keeps completely separate decks, scores, and reviews.</p>

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Your name or nickname..."
              autoFocus
              style={{
                width: "100%", padding: "14px 16px", borderRadius: "10px", fontSize: "1rem",
                backgroundColor: "rgba(252,250,247,0.12)", border: "2px solid rgba(252,250,247,0.2)",
                color: "#fcfaf7", outline: "none", boxSizing: "border-box", marginBottom: "14px",
              }}
            />
            <button
              type="submit"
              disabled={!username.trim()}
              style={{
                width: "100%", padding: "14px", borderRadius: "10px", fontSize: "1rem", fontWeight: "700",
                backgroundColor: username.trim() ? "#fcfaf7" : "rgba(252,250,247,0.3)",
                color: username.trim() ? "#8b4f58" : "rgba(252,250,247,0.5)",
                border: "none", cursor: username.trim() ? "pointer" : "default", transition: "all 0.2s",
              }}
            >
              Open My Study Space →
            </button>
          </form>

          {recentUsers.length > 0 && (
            <div style={{ marginTop: "24px" }}>
              <p style={{ color: "rgba(252,250,247,0.5)", fontSize: "0.8rem", marginBottom: "10px", textAlign: "center" }}>RECENT USERS</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "center" }}>
                {recentUsers.map(u => (
                  <button
                    key={u}
                    onClick={() => login(u)}
                    style={{
                      padding: "6px 14px", borderRadius: "20px", fontSize: "0.85rem", fontWeight: "600",
                      backgroundColor: "rgba(252,250,247,0.15)", color: "#fcfaf7",
                      border: "1px solid rgba(252,250,247,0.2)", cursor: "pointer",
                    }}
                  >
                    {u}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
