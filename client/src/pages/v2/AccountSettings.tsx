import { useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { hasPassword, verifyPassword, setPassword, removePassword } from "@/utils/auth";
import { usePalette, PALETTES, PaletteName, ColorMode } from "@/contexts/ThemeContext";

interface Props {
  onClose: () => void;
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "12px 14px", borderRadius: "8px", fontSize: "0.9rem",
  backgroundColor: "rgba(255,255,255,0.07)", border: "1px solid rgba(252,250,247,0.12)",
  color: "#fcfaf7", outline: "none", boxSizing: "border-box", marginBottom: "10px",
  fontFamily: "inherit",
};

export default function AccountSettings({ onClose }: Props) {
  const { user } = useUser();
  const { palette, setPalette, colorMode, setColorMode, swatchFilter } = usePalette();
  const username = user?.username ?? "";
  const pwSet = hasPassword(username);

  const [mode, setMode] = useState<"menu" | "set" | "change" | "remove">("menu");
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const clear = () => { setCurrent(""); setNext(""); setConfirm(""); setError(""); setSuccess(""); };

  const handleSet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (next.length < 4) { setError("Password must be at least 4 characters."); return; }
    if (next !== confirm) { setError("Passwords do not match."); return; }
    setLoading(true);
    await setPassword(username, next);
    setLoading(false);
    setSuccess("Password set. Your profile is now protected.");
    clear();
    setMode("menu");
  };

  const handleChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const ok = await verifyPassword(username, current);
    if (!ok) { setLoading(false); setError("Current password is incorrect."); return; }
    if (next.length < 4) { setLoading(false); setError("New password must be at least 4 characters."); return; }
    if (next !== confirm) { setLoading(false); setError("Passwords do not match."); return; }
    await setPassword(username, next);
    setLoading(false);
    setSuccess("Password updated.");
    clear();
    setMode("menu");
  };

  const handleRemove = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const ok = await verifyPassword(username, current);
    if (!ok) { setLoading(false); setError("Incorrect password."); return; }
    await removePassword(username);
    setLoading(false);
    setSuccess("Password removed. Profile is no longer protected.");
    clear();
    setMode("menu");
  };

  const btnStyle = (color = "#4a6080"): React.CSSProperties => ({
    padding: "10px 16px", borderRadius: "8px", backgroundColor: color, color: "#fcfaf7",
    border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: "700", fontSize: "0.88rem",
  });

  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "24px" }}
    >
      <div style={{ backgroundColor: "#2e3240", borderRadius: "16px", padding: "28px", width: "100%", maxWidth: "400px", border: "1px solid rgba(252,250,247,0.1)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2 style={{ color: "#fcfaf7", fontWeight: "800", fontSize: "1rem", margin: 0 }}>Account Settings</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "rgba(252,250,247,0.45)", cursor: "pointer", fontSize: "1.2rem", fontFamily: "inherit", padding: "4px 8px" }}>x</button>
        </div>

        <div style={{ color: "rgba(252,250,247,0.55)", fontSize: "0.85rem", marginBottom: "20px" }}>
          Profile: <span style={{ color: "#fcfaf7", fontWeight: "700" }}>{username}</span>
          <span style={{ marginLeft: "10px", fontSize: "0.78rem", color: pwSet ? "#7aaa7a" : "rgba(252,250,247,0.3)" }}>
            {pwSet ? "Password protected" : "No password"}
          </span>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <div style={{ color: "rgba(252,250,247,0.45)", fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "10px" }}>Appearance</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
            {(["dark", "light"] as ColorMode[]).map(m => {
              const active = colorMode === m;
              const isDark = m === "dark";
              return (
                <button
                  key={m}
                  onClick={() => setColorMode(m)}
                  style={{
                    padding: "0", border: active ? "2px solid #fcfaf7" : "2px solid transparent",
                    borderRadius: "10px", cursor: "pointer", overflow: "hidden",
                    outline: "none", transition: "border-color 0.15s",
                    boxShadow: active ? "0 0 0 1px rgba(252,250,247,0.3)" : "none",
                  }}
                >
                  <div style={{ backgroundColor: isDark ? "#252830" : "#dad7cf", padding: "10px 6px 8px", display: "flex", flexDirection: "column", gap: "4px", alignItems: "center" }}>
                    <div style={{ width: "100%", height: "6px", borderRadius: "3px", backgroundColor: isDark ? "#4a6080" : "#3a5570" }} />
                    <div style={{ width: "70%", height: "4px", borderRadius: "2px", backgroundColor: isDark ? "rgba(252,250,247,0.25)" : "rgba(0,0,0,0.18)" }} />
                    <div style={{ width: "85%", height: "4px", borderRadius: "2px", backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)" }} />
                  </div>
                  <div style={{ backgroundColor: active ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.05)", padding: "5px 0", fontSize: "0.72rem", fontWeight: "600", color: active ? "#fcfaf7" : "rgba(252,250,247,0.55)", fontFamily: "inherit", textAlign: "center" }}>
                    {isDark ? "Dark" : "Light"}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ marginBottom: "24px" }}>
          <div style={{ color: "rgba(252,250,247,0.45)", fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "12px" }}>Color Palette</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
            {(Object.keys(PALETTES) as PaletteName[]).map(name => {
              const active = palette === name;
              return (
                <button
                  key={name}
                  onClick={() => setPalette(name)}
                  style={{
                    padding: "0", border: active ? "2px solid #fcfaf7" : "2px solid transparent",
                    borderRadius: "10px", cursor: "pointer", overflow: "hidden",
                    outline: "none", transition: "border-color 0.15s",
                    boxShadow: active ? "0 0 0 1px rgba(252,250,247,0.3)" : "none",
                  }}
                >
                  <div style={{ filter: swatchFilter(name) }}>
                    <div style={{ backgroundColor: "#252830", padding: "10px 6px 8px", display: "flex", flexDirection: "column", gap: "4px", alignItems: "center" }}>
                      <div style={{ width: "100%", height: "6px", borderRadius: "3px", backgroundColor: "#4a6080" }} />
                      <div style={{ width: "70%", height: "4px", borderRadius: "2px", backgroundColor: "rgba(252,250,247,0.25)" }} />
                      <div style={{ width: "85%", height: "4px", borderRadius: "2px", backgroundColor: "rgba(255,255,255,0.1)" }} />
                    </div>
                  </div>
                  <div style={{ backgroundColor: active ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.05)", padding: "5px 0", fontSize: "0.72rem", fontWeight: "600", color: active ? "#fcfaf7" : "rgba(252,250,247,0.55)", fontFamily: "inherit", textAlign: "center" }}>
                    {PALETTES[name].label}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ borderTop: "1px solid rgba(252,250,247,0.07)", paddingTop: "20px", marginBottom: "20px" }}>
          <div style={{ color: "rgba(252,250,247,0.45)", fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "14px" }}>Security</div>

        {success && (
          <div style={{ backgroundColor: "rgba(60,130,80,0.2)", border: "1px solid rgba(80,160,100,0.3)", borderRadius: "8px", padding: "10px 14px", marginBottom: "16px", color: "#7aaa7a", fontSize: "0.85rem" }}>
            {success}
          </div>
        )}

        {mode === "menu" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {!pwSet && (
              <button onClick={() => { setMode("set"); setError(""); }} style={btnStyle("#4a6080")}>
                Set a Password
              </button>
            )}
            {pwSet && (
              <button onClick={() => { setMode("change"); setError(""); }} style={btnStyle("#4a6080")}>
                Change Password
              </button>
            )}
          </div>
        )}

        {mode === "set" && (
          <form onSubmit={handleSet}>
            <input type="password" value={next} onChange={e => { setNext(e.target.value); setError(""); }} placeholder="New password..." autoFocus style={inputStyle} />
            <input type="password" value={confirm} onChange={e => { setConfirm(e.target.value); setError(""); }} placeholder="Confirm password..." style={inputStyle} />
            {error && <div style={{ color: "#e09090", fontSize: "0.82rem", marginBottom: "10px" }}>{error}</div>}
            <div style={{ display: "flex", gap: "10px" }}>
              <button type="button" onClick={() => { setMode("menu"); clear(); }} style={{ ...btnStyle("rgba(255,255,255,0.07)"), flex: 1 }}>Cancel</button>
              <button type="submit" disabled={loading} style={{ ...btnStyle(), flex: 2 }}>{loading ? "Saving..." : "Set Password"}</button>
            </div>
          </form>
        )}

        {mode === "change" && (
          <form onSubmit={handleChange}>
            <input type="password" value={current} onChange={e => { setCurrent(e.target.value); setError(""); }} placeholder="Current password..." autoFocus style={inputStyle} />
            <input type="password" value={next} onChange={e => { setNext(e.target.value); setError(""); }} placeholder="New password..." style={inputStyle} />
            <input type="password" value={confirm} onChange={e => { setConfirm(e.target.value); setError(""); }} placeholder="Confirm new password..." style={inputStyle} />
            {error && <div style={{ color: "#e09090", fontSize: "0.82rem", marginBottom: "10px" }}>{error}</div>}
            <div style={{ display: "flex", gap: "10px" }}>
              <button type="button" onClick={() => { setMode("menu"); clear(); }} style={{ ...btnStyle("rgba(255,255,255,0.07)"), flex: 1 }}>Cancel</button>
              <button type="submit" disabled={loading} style={{ ...btnStyle(), flex: 2 }}>{loading ? "Saving..." : "Update Password"}</button>
            </div>
          </form>
        )}

        {mode === "remove" && (
          <form onSubmit={handleRemove}>
            <div style={{ color: "rgba(252,250,247,0.55)", fontSize: "0.85rem", marginBottom: "14px" }}>
              Confirm your current password to remove protection.
            </div>
            <input type="password" value={current} onChange={e => { setCurrent(e.target.value); setError(""); }} placeholder="Current password..." autoFocus style={inputStyle} />
            {error && <div style={{ color: "#e09090", fontSize: "0.82rem", marginBottom: "10px" }}>{error}</div>}
            <div style={{ display: "flex", gap: "10px" }}>
              <button type="button" onClick={() => { setMode("menu"); clear(); }} style={{ ...btnStyle("rgba(255,255,255,0.07)"), flex: 1 }}>Cancel</button>
              <button type="submit" disabled={loading} style={{ ...btnStyle("rgba(160,70,70,0.5)"), flex: 2 }}>{loading ? "Removing..." : "Remove Password"}</button>
            </div>
          </form>
        )}
        </div>
      </div>
    </div>
  );
}
