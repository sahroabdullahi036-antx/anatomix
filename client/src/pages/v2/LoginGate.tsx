import { useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { accountExists, hasPassword, verifyPassword, setPassword } from "@/utils/auth";

type Step = "username" | "password" | "new-account";

const IS_HOST = (u: string) => u.toLowerCase() === "gameshowhost";

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "14px 16px", borderRadius: "10px", fontSize: "1rem",
  backgroundColor: "rgba(255,255,255,0.08)", border: "1px solid rgba(252,250,247,0.15)",
  color: "#fcfaf7", outline: "none", boxSizing: "border-box", marginBottom: "14px",
  fontFamily: "inherit",
};

const primaryBtn = (disabled: boolean): React.CSSProperties => ({
  width: "100%", padding: "14px", borderRadius: "10px", fontSize: "1rem", fontWeight: "700",
  backgroundColor: disabled ? "rgba(255,255,255,0.08)" : "#4a6080",
  color: disabled ? "rgba(252,250,247,0.3)" : "#fcfaf7",
  border: "none", cursor: disabled ? "default" : "pointer", transition: "all 0.2s",
  fontFamily: "inherit",
});

const ghostBtn: React.CSSProperties = {
  background: "none", border: "none", color: "rgba(252,250,247,0.35)", fontSize: "0.82rem",
  cursor: "pointer", fontFamily: "inherit", padding: "6px", textDecoration: "underline",
};

export default function LoginGate() {
  const { login, recentUsers } = useUser();
  const [step, setStep] = useState<Step>("username");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newConfirm, setNewConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setStep("username"); setUsername(""); setPassword("");
    setNewPassword(""); setNewConfirm(""); setError("");
  };

  const handleUsernameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = username.trim();
    if (!trimmed) return;
    const isHost = IS_HOST(trimmed);
    const exists = accountExists(trimmed);
    if (exists && hasPassword(trimmed)) {
      setStep("password"); setError("");
    } else if (!exists || (isHost && !hasPassword(trimmed))) {
      setStep("new-account"); setError("");
    } else {
      login(trimmed);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    setLoading(true); setError("");
    const ok = await verifyPassword(username.trim(), password);
    setLoading(false);
    if (ok) { login(username.trim()); }
    else { setError("Incorrect password."); setPassword(""); }
  };

  const handleNewAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = username.trim();
    if (!trimmed) return;
    const isHost = IS_HOST(trimmed);
    if (isHost && !newPassword) { setError("A password is required for this account."); return; }
    if (newPassword) {
      if (newPassword.length < 4) { setError("Password must be at least 4 characters."); return; }
      if (newPassword !== newConfirm) { setError("Passwords do not match."); return; }
      setLoading(true);
      await setPassword(trimmed, newPassword);
      setLoading(false);
    }
    login(trimmed);
  };

  const handleRecentUser = (u: string) => {
    if (hasPassword(u)) { setUsername(u); setStep("password"); setError(""); }
    else { login(u); }
  };

  const isHost = IS_HOST(username);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#252830", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", fontFamily: "'Inter', 'Plus Jakarta Sans', sans-serif" }}>
      <div style={{ width: "100%", maxWidth: "440px" }}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <h1 style={{ color: "#fcfaf7", fontSize: "2.5rem", fontWeight: "800", margin: "0 0 8px", letterSpacing: "-0.02em" }}>AnatomiX</h1>
          <p style={{ color: "rgba(252,250,247,0.5)", fontSize: "1rem", margin: 0 }}>Medical Terminology Study Platform</p>
        </div>

        <div style={{ backgroundColor: "rgba(255,255,255,0.05)", borderRadius: "16px", padding: "32px", border: "1px solid rgba(252,250,247,0.08)" }}>

          {step === "username" && (
            <>
              <h2 style={{ color: "#fcfaf7", fontSize: "1.1rem", fontWeight: "600", marginBottom: "8px", textAlign: "center" }}>Welcome</h2>
              <p style={{ color: "rgba(252,250,247,0.45)", fontSize: "0.85rem", marginBottom: "24px", textAlign: "center" }}>Each profile keeps completely separate progress and decks.</p>
              <form onSubmit={handleUsernameSubmit}>
                <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Your name or nickname..." autoFocus style={inputStyle} />
                <button type="submit" disabled={!username.trim()} style={primaryBtn(!username.trim())}>Continue</button>
              </form>
              {recentUsers.length > 0 && (
                <div style={{ marginTop: "24px" }}>
                  <p style={{ color: "rgba(252,250,247,0.35)", fontSize: "0.75rem", marginBottom: "10px", textAlign: "center", textTransform: "uppercase", letterSpacing: "0.06em" }}>Recent Profiles</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "center" }}>
                    {recentUsers.map(u => (
                      <button key={u} onClick={() => handleRecentUser(u)} style={{ padding: "6px 14px", borderRadius: "20px", fontSize: "0.85rem", fontWeight: "600", backgroundColor: "rgba(255,255,255,0.08)", color: "#fcfaf7", border: "1px solid rgba(252,250,247,0.12)", cursor: "pointer", fontFamily: "inherit" }}>
                        {u}{hasPassword(u) ? " *" : ""}
                      </button>
                    ))}
                  </div>
                  <p style={{ color: "rgba(252,250,247,0.2)", fontSize: "0.7rem", textAlign: "center", marginTop: "8px" }}>* password protected</p>
                </div>
              )}
            </>
          )}

          {step === "password" && (
            <>
              <h2 style={{ color: "#fcfaf7", fontSize: "1.1rem", fontWeight: "600", marginBottom: "4px", textAlign: "center" }}>Welcome back, {username}</h2>
              <p style={{ color: "rgba(252,250,247,0.45)", fontSize: "0.85rem", marginBottom: "24px", textAlign: "center" }}>This profile is password protected.</p>
              <form onSubmit={handlePasswordSubmit}>
                <input type="password" value={password} onChange={e => { setPassword(e.target.value); setError(""); }} placeholder="Password..." autoFocus style={inputStyle} />
                {error && <div style={{ color: "#e09090", fontSize: "0.85rem", marginBottom: "12px" }}>{error}</div>}
                <button type="submit" disabled={!password || loading} style={primaryBtn(!password || loading)}>{loading ? "Checking..." : "Open My Study Space"}</button>
              </form>
              <div style={{ textAlign: "center", marginTop: "16px" }}>
                <button onClick={reset} style={ghostBtn}>Back</button>
              </div>
            </>
          )}

          {step === "new-account" && (
            <>
              <h2 style={{ color: "#fcfaf7", fontSize: "1.1rem", fontWeight: "600", marginBottom: "4px", textAlign: "center" }}>
                {isHost ? "Moderator Account Setup" : `Create Profile: ${username}`}
              </h2>
              <p style={{ color: "rgba(252,250,247,0.45)", fontSize: "0.85rem", marginBottom: "20px", textAlign: "center" }}>
                {isHost ? "Set a password to secure the moderator account." : "Set a password to protect your profile, or skip to continue without one."}
              </p>
              <form onSubmit={handleNewAccount}>
                <input type="password" value={newPassword} onChange={e => { setNewPassword(e.target.value); setError(""); }} placeholder={isHost ? "Set a password..." : "Choose a password (optional)..."} autoFocus style={inputStyle} />
                {(newPassword || isHost) && (
                  <input type="password" value={newConfirm} onChange={e => { setNewConfirm(e.target.value); setError(""); }} placeholder="Confirm password..." style={inputStyle} />
                )}
                {error && <div style={{ color: "#e09090", fontSize: "0.85rem", marginBottom: "12px" }}>{error}</div>}
                <button type="submit" disabled={loading || (isHost && !newPassword)} style={primaryBtn(loading || (isHost && !newPassword))}>
                  {loading ? "Creating..." : isHost ? "Secure Moderator Account" : newPassword ? "Create Protected Profile" : "Create Profile"}
                </button>
              </form>
              <div style={{ textAlign: "center", marginTop: "16px" }}>
                <button onClick={reset} style={ghostBtn}>Back</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
