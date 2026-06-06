import { useState, useEffect } from "react";
import { useUser } from "@/contexts/UserContext";
import { useFirebase } from "@/contexts/FirebaseContext";
import { accountExists, hasPassword, verifyPassword, setPassword as savePassword, hashPassword } from "@/utils/auth";
import { subscribeToUserPins, getOwnerPasswordHash, setOwnerPasswordHash, UserPinEntry } from "@/firebase/firestoreService";

type Step = "username" | "password" | "pin" | "new-account";
type LoginMode = "login" | "signup";

const IS_HOST = (u: string) => u.toLowerCase() === "anatomixowner";
const toKey = (u: string) => u.toLowerCase().replace(/\s+/g, "_");

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "14px 16px", borderRadius: "10px", fontSize: "1rem",
  backgroundColor: "rgba(255,255,255,0.08)", border: "1px solid rgba(247,244,239,0.15)",
  color: "#F7F4EF", outline: "none", boxSizing: "border-box", marginBottom: "14px",
  fontFamily: "inherit",
};

const primaryBtn = (disabled: boolean): React.CSSProperties => ({
  width: "100%", padding: "14px", borderRadius: "10px", fontSize: "1rem", fontWeight: "700",
  backgroundColor: disabled ? "rgba(255,255,255,0.08)" : "#F7F4EF",
  color: disabled ? "rgba(247,244,239,0.3)" : "#3E1015",
  border: "none", cursor: disabled ? "default" : "pointer", transition: "all 0.2s",
  fontFamily: "inherit",
});

const ghostBtn: React.CSSProperties = {
  background: "none", border: "none", color: "rgba(247,244,239,0.35)", fontSize: "0.82rem",
  cursor: "pointer", fontFamily: "inherit", padding: "6px", textDecoration: "underline",
};

export default function LoginGate() {
  const { login, recentUsers } = useUser();
  const { db } = useFirebase();
  const [step, setStep] = useState<Step>("username");
  const [loginMode, setLoginMode] = useState<LoginMode>("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [pinInput, setPinInput] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newConfirm, setNewConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [pins, setPins] = useState<Record<string, UserPinEntry>>({});

  useEffect(() => {
    if (!db) return;
    const unsub = subscribeToUserPins(db, setPins);
    return unsub;
  }, [db]);

  const reset = () => {
    setStep("username"); setUsername(""); setPassword(""); setPinInput("");
    setNewPassword(""); setNewConfirm(""); setError("");
  };

  const getPinEntry = (u: string) => pins[toKey(u)] ?? null;

  const proceedAfterPinCheck = (trimmed: string) => {
    if (hasPassword(trimmed)) {
      setStep("password"); setError("");
    } else {
      setStep("new-account"); setError("");
    }
  };

  const startHostLogin = async () => {
    if (!db) { setError("Cannot reach the server. Please check your connection and try again."); return; }
    setLoading(true); setError("");
    try {
      const ownerHash = await getOwnerPasswordHash(db);
      setLoading(false);
      setStep(ownerHash ? "password" : "new-account");
    } catch {
      setLoading(false);
      setError("Cannot verify the owner account right now. Please try again.");
    }
  };

  const handleUsernameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = username.trim();
    if (!trimmed) return;

    if (IS_HOST(trimmed)) { await startHostLogin(); return; }

    const pinEntry = getPinEntry(trimmed);
    if (pinEntry?.pin) {
      setStep("pin"); setError(""); return;
    }

    if (loginMode === "login") {
      if (hasPassword(trimmed)) {
        setStep("password"); setError("");
      } else if (accountExists(trimmed)) {
        setStep("new-account"); setError("");
      } else {
        setError("No account found with that username. Use \"Create Account\" to sign up.");
      }
    } else {
      if (hasPassword(trimmed)) {
        setError("That username already has an account. Please use Sign In instead.");
      } else {
        setStep("new-account"); setError("");
      }
    }
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pinEntry = getPinEntry(username.trim());
    if (!pinEntry) { proceedAfterPinCheck(username.trim()); return; }
    if (pinInput.trim() === pinEntry.pin) {
      setPinInput(""); proceedAfterPinCheck(username.trim());
    } else {
      setError("Incorrect PIN."); setPinInput("");
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    setLoading(true); setError("");
    const trimmed = username.trim();
    if (IS_HOST(trimmed)) {
      if (!db) { setLoading(false); setError("Cannot reach the server."); return; }
      try {
        const ownerHash = await getOwnerPasswordHash(db);
        const entered = await hashPassword(password);
        setLoading(false);
        if (ownerHash && entered === ownerHash) { login(trimmed); }
        else { setError("Incorrect password."); setPassword(""); }
      } catch {
        setLoading(false);
        setError("Cannot verify right now. Please try again.");
      }
      return;
    }
    const ok = await verifyPassword(trimmed, password);
    setLoading(false);
    if (ok) { login(trimmed); }
    else { setError("Incorrect password."); setPassword(""); }
  };

  const handleNewAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = username.trim();
    if (!trimmed) return;
    if (IS_HOST(trimmed)) {
      if (!newPassword) { setError("A password is required to secure the owner account."); return; }
      if (newPassword.length < 4) { setError("Password must be at least 4 characters."); return; }
      if (newPassword !== newConfirm) { setError("Passwords do not match."); return; }
      if (!db) { setError("Cannot reach the server."); return; }
      setLoading(true); setError("");
      try {
        const existing = await getOwnerPasswordHash(db);
        if (existing) { setLoading(false); setError("The owner account is already set up. Please sign in."); setStep("password"); return; }
        await setOwnerPasswordHash(db, await hashPassword(newPassword));
        setLoading(false);
        login(trimmed);
      } catch {
        setLoading(false);
        setError("Could not save the owner password. Please try again.");
      }
      return;
    }
    if (hasPassword(trimmed)) {
      setError("This account already has a password. Please sign in instead.");
      setStep("password");
      return;
    }
    if (!newPassword) { setError("A password is required to protect your account."); return; }
    if (newPassword.length < 4) { setError("Password must be at least 4 characters."); return; }
    if (newPassword !== newConfirm) { setError("Passwords do not match."); return; }
    setLoading(true);
    await savePassword(trimmed, newPassword);
    setLoading(false);
    login(trimmed);
  };

  const handleRecentUser = (u: string) => {
    setUsername(u);
    setLoginMode("login");
    if (IS_HOST(u)) { startHostLogin(); return; }
    const pinEntry = getPinEntry(u);
    if (pinEntry?.pin) { setStep("pin"); setError(""); return; }
    if (hasPassword(u)) { setStep("password"); setError(""); }
    else { setStep("new-account"); setError(""); }
  };

  const isHost = IS_HOST(username);
  const isExistingAccount = accountExists(username.trim());

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#3E1015", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", fontFamily: "'Inter', 'Plus Jakarta Sans', sans-serif" }}>
      <div style={{ width: "100%", maxWidth: "440px" }}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <h1 style={{ color: "#F7F4EF", fontSize: "2.5rem", fontWeight: "800", margin: "0 0 8px", letterSpacing: "-0.02em" }}>AnatomiX</h1>
          <p style={{ color: "rgba(247,244,239,0.5)", fontSize: "1rem", margin: 0 }}>Medical Terminology Study Platform</p>
        </div>

        <div style={{ backgroundColor: "rgba(255,255,255,0.05)", borderRadius: "16px", padding: "32px", border: "1px solid rgba(247,244,239,0.08)" }}>

          {step === "username" && (
            <>
              <div style={{ display: "flex", gap: "6px", marginBottom: "24px", backgroundColor: "rgba(0,0,0,0.2)", borderRadius: "10px", padding: "4px" }}>
                {(["login", "signup"] as LoginMode[]).map(m => (
                  <button
                    key={m}
                    onClick={() => { setLoginMode(m); setError(""); }}
                    style={{ flex: 1, padding: "10px", borderRadius: "7px", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: "700", fontSize: "0.88rem", backgroundColor: loginMode === m ? "#F7F4EF" : "transparent", color: loginMode === m ? "#3E1015" : "rgba(247,244,239,0.4)", transition: "all 0.15s" }}
                  >
                    {m === "login" ? "Sign In" : "Create Account"}
                  </button>
                ))}
              </div>

              {loginMode === "signup" && (
                <p style={{ color: "rgba(247,244,239,0.4)", fontSize: "0.82rem", marginBottom: "16px", textAlign: "center", lineHeight: 1.5 }}>
                  Enter your name as: <span style={{ color: "#F7F4EF", fontWeight: "700" }}>First Name. Last Initial</span><br />
                  <span style={{ fontSize: "0.75rem" }}>Example: John S.</span>
                </p>
              )}

              <form onSubmit={handleUsernameSubmit}>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder={loginMode === "signup" ? "e.g. John S." : "Username"}
                  autoFocus
                  style={inputStyle}
                />
                {error && <div style={{ color: "#e09090", fontSize: "0.85rem", marginBottom: "12px" }}>{error}</div>}
                <button type="submit" disabled={!username.trim()} style={primaryBtn(!username.trim())}>
                  {loginMode === "signup" ? "Create Account" : "Sign In"}
                </button>
              </form>

              {recentUsers.length > 0 && (
                <div style={{ marginTop: "24px" }}>
                  <p style={{ color: "rgba(247,244,239,0.35)", fontSize: "0.75rem", marginBottom: "10px", textAlign: "center", textTransform: "uppercase", letterSpacing: "0.06em" }}>Recent Profiles</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "center" }}>
                    {recentUsers.map(u => {
                      const hasPIN = !!getPinEntry(u)?.pin;
                      const hasPwd = hasPassword(u);
                      return (
                        <button key={u} onClick={() => handleRecentUser(u)} style={{ padding: "6px 14px", borderRadius: "20px", fontSize: "0.85rem", fontWeight: "600", backgroundColor: "rgba(255,255,255,0.08)", color: "#F7F4EF", border: "1px solid rgba(247,244,239,0.12)", cursor: "pointer", fontFamily: "inherit" }}>
                          {u}{hasPIN ? " #" : hasPwd ? " 🔒" : " ⚠"}
                        </button>
                      );
                    })}
                  </div>
                  <p style={{ color: "rgba(247,244,239,0.2)", fontSize: "0.7rem", textAlign: "center", marginTop: "8px" }}>🔒 password protected &nbsp; ⚠ no password set</p>
                </div>
              )}
            </>
          )}

          {step === "pin" && (
            <>
              <h2 style={{ color: "#F7F4EF", fontSize: "1.1rem", fontWeight: "600", marginBottom: "4px", textAlign: "center" }}>Enter PIN</h2>
              <p style={{ color: "rgba(247,244,239,0.45)", fontSize: "0.85rem", marginBottom: "24px", textAlign: "center" }}>{username}</p>
              <form onSubmit={handlePinSubmit}>
                <input
                  type="password"
                  inputMode="numeric"
                  value={pinInput}
                  onChange={e => { setPinInput(e.target.value); setError(""); }}
                  placeholder="PIN..."
                  autoFocus
                  style={inputStyle}
                />
                {error && <div style={{ color: "#e09090", fontSize: "0.85rem", marginBottom: "12px" }}>{error}</div>}
                <button type="submit" disabled={!pinInput.trim()} style={primaryBtn(!pinInput.trim())}>Continue</button>
              </form>
              <div style={{ textAlign: "center", marginTop: "16px" }}>
                <button onClick={reset} style={ghostBtn}>Back</button>
              </div>
            </>
          )}

          {step === "password" && (
            <>
              <h2 style={{ color: "#F7F4EF", fontSize: "1.1rem", fontWeight: "600", marginBottom: "4px", textAlign: "center" }}>Welcome back, {username}</h2>
              <p style={{ color: "rgba(247,244,239,0.45)", fontSize: "0.85rem", marginBottom: "24px", textAlign: "center" }}>Enter your password to continue.</p>
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
              <h2 style={{ color: "#F7F4EF", fontSize: "1.1rem", fontWeight: "600", marginBottom: "4px", textAlign: "center" }}>
                {isHost ? "Moderator Account Setup" : isExistingAccount ? `Set a Password for ${username}` : `Create Account: ${username}`}
              </h2>
              <p style={{ color: "rgba(247,244,239,0.45)", fontSize: "0.85rem", marginBottom: "20px", textAlign: "center" }}>
                {isHost
                  ? "Set a password to secure the moderator account."
                  : isExistingAccount
                    ? "A password is required to access your account. Set one now to continue."
                    : "Set a password to protect your profile. This is required."}
              </p>
              <form onSubmit={handleNewAccount}>
                <input type="password" value={newPassword} onChange={e => { setNewPassword(e.target.value); setError(""); }} placeholder="Choose a password..." autoFocus style={inputStyle} />
                <input type="password" value={newConfirm} onChange={e => { setNewConfirm(e.target.value); setError(""); }} placeholder="Confirm password..." style={inputStyle} />
                {error && <div style={{ color: "#e09090", fontSize: "0.85rem", marginBottom: "12px" }}>{error}</div>}
                <button type="submit" disabled={loading} style={primaryBtn(loading)}>
                  {loading ? "Saving..." : isExistingAccount ? "Save Password & Continue" : "Create Account"}
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
