import { useMemo } from "react";
import { ALL_TERMS } from "@/data/medicalData";

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function useGameTerms(systemId?: string) {
  return useMemo(() => {
    const pool = systemId
      ? ALL_TERMS.filter(t => t.system.toLowerCase() === systemId.toLowerCase() || t.system === "General")
      : ALL_TERMS;
    return shuffle(pool.filter(t => t.type !== "prefix" || t.example));
  }, [systemId]);
}

export function GameShell({ title, emoji, score, streak, idx, total, onBack, children }: {
  title: string; emoji: string; score: number; streak: number;
  idx: number; total: number; onBack: () => void; children: React.ReactNode;
}) {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#8b4f58", fontFamily: "'Inter','Plus Jakarta Sans',sans-serif" }}>
      <div style={{ backgroundColor: "rgba(0,0,0,0.2)", padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(252,250,247,0.1)", flexWrap: "wrap", gap: "10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button onClick={onBack} style={{ backgroundColor: "rgba(252,250,247,0.12)", color: "#fcfaf7", border: "1px solid rgba(252,250,247,0.2)", borderRadius: "8px", padding: "7px 14px", cursor: "pointer", fontFamily: "inherit", fontSize: "0.85rem" }}>← Games</button>
          <span style={{ color: "#fcfaf7", fontWeight: "700" }}>{emoji} {title}</span>
        </div>
        <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
          {streak >= 2 && <span style={{ color: "#f0c060", fontSize: "0.85rem", fontWeight: "700" }}>🔥 {streak}x streak</span>}
          <span style={{ color: "#fcfaf7", fontSize: "0.9rem", fontWeight: "700" }}>Score: {score}</span>
          <span style={{ color: "rgba(252,250,247,0.5)", fontSize: "0.82rem" }}>{idx + 1}/{total}</span>
        </div>
      </div>
      <div style={{ maxWidth: "680px", margin: "0 auto", padding: "28px 24px" }}>
        {children}
      </div>
    </div>
  );
}

export function ProgressBar({ value, max, color = "#e07070", label }: { value: number; max: number; color?: string; label?: string }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div style={{ marginBottom: "16px" }}>
      {label && <div style={{ color: "rgba(252,250,247,0.6)", fontSize: "0.8rem", marginBottom: "6px" }}>{label}</div>}
      <div style={{ backgroundColor: "rgba(0,0,0,0.2)", borderRadius: "8px", height: "10px", overflow: "hidden" }}>
        <div style={{ backgroundColor: color, height: "100%", width: `${pct}%`, transition: "width 0.3s linear", borderRadius: "8px" }} />
      </div>
    </div>
  );
}
