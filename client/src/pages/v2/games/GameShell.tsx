import { SYSTEMS } from "@/data/medicalData";

interface GameShellProps {
  title: string;
  emoji: string;
  num: number;
  onBack: () => void;
  systemFilter: string;
  onSystemChange: (v: string) => void;
  onStart: () => void;
  children: React.ReactNode;
}

export default function GameShell({ title, emoji, num, onBack, systemFilter, onSystemChange, onStart, children }: GameShellProps) {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#8b4f58", fontFamily: "'Inter','Plus Jakarta Sans',sans-serif" }}>
      <div style={{ backgroundColor: "rgba(0,0,0,0.2)", padding: "14px 24px", display: "flex", alignItems: "center", gap: "12px", borderBottom: "1px solid rgba(252,250,247,0.1)" }}>
        <button onClick={onBack} style={{ backgroundColor: "rgba(252,250,247,0.12)", color: "#fcfaf7", border: "1px solid rgba(252,250,247,0.2)", borderRadius: "8px", padding: "8px 16px", cursor: "pointer", fontFamily: "inherit", fontSize: "0.9rem" }}>← Games</button>
        <span style={{ color: "rgba(252,250,247,0.5)", fontSize: "0.8rem" }}>Game {num}</span>
        <span style={{ color: "#fcfaf7", fontWeight: "700" }}>{title}</span>
      </div>
      <div style={{ maxWidth: "620px", margin: "0 auto", padding: "48px 24px", textAlign: "center" }}>
        <div style={{ fontSize: "64px", marginBottom: "16px" }}>{emoji}</div>
        <h1 style={{ color: "#fcfaf7", fontSize: "2rem", fontWeight: "800", marginBottom: "16px" }}>{title}</h1>
        <div style={{ backgroundColor: "rgba(0,0,0,0.2)", borderRadius: "12px", padding: "20px", marginBottom: "24px", textAlign: "left" }}>
          {children}
        </div>
        <div style={{ marginBottom: "24px" }}>
          <label style={{ color: "rgba(252,250,247,0.6)", fontSize: "0.85rem", display: "block", marginBottom: "8px" }}>Filter by Body System:</label>
          <select value={systemFilter} onChange={e => onSystemChange(e.target.value)} style={{ padding: "10px 14px", borderRadius: "8px", backgroundColor: "rgba(252,250,247,0.12)", color: "#fcfaf7", border: "1px solid rgba(252,250,247,0.2)", fontFamily: "inherit", fontSize: "0.9rem", width: "100%" }}>
            <option value="all">All Systems</option>
            {SYSTEMS.map(s => <option key={s.id} value={s.id}>{s.officialName}</option>)}
          </select>
        </div>
        <button onClick={onStart} style={{ backgroundColor: "#fcfaf7", color: "#8b4f58", border: "none", borderRadius: "12px", padding: "16px 40px", fontSize: "1.1rem", fontWeight: "800", cursor: "pointer", fontFamily: "inherit" }}>
          Start Game →
        </button>
      </div>
    </div>
  );
}
