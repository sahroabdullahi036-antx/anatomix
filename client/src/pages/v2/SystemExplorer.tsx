import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { SYSTEMS, type Structure } from "@/data/medicalData";

const SYSTEM_COLORS: Record<string, string> = {
  digestive: "#3d5a47", cardiovascular: "#394d62", respiratory: "#5a4a3e",
  nervous: "#4a3d62", musculoskeletal: "#424242", urinary: "#2e4e58",
  endocrine: "#2e4e58", integumentary: "#3a4a5c", lymphatic: "#3a4a5c",
  reproductive: "#52394a", blood: "#394d62",
};

type PathEntry = { label: string; systemId?: string };

export default function SystemExplorer() {
  const [, navigate] = useLocation();
  const [path, setPath] = useState<PathEntry[]>([]);
  const [selected, setSelected] = useState<Structure | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("anatomix_explorer_path");
      if (saved) {
        const p = JSON.parse(saved) as PathEntry[];
        setPath(p);
        if (p.length > 0) {
          const sys = SYSTEMS.find(s => s.id === p[0].systemId);
          if (sys && p.length > 1) {
            const struct = sys.structures.find(st => st.id === p[1].label);
            if (struct) setSelected(struct);
          }
        }
      }
    } catch {}
  }, []);

  const savePath = (p: PathEntry[]) => {
    setPath(p);
    localStorage.setItem("anatomix_explorer_path", JSON.stringify(p));
  };

  const currentSystem = path.length > 0 ? SYSTEMS.find(s => s.id === path[0].systemId) : null;
  const currentColor = currentSystem ? SYSTEM_COLORS[currentSystem.id] : "#394d62";

  const goBack = () => {
    if (path.length === 0) { navigate("/"); return; }
    if (path.length === 1) { savePath([]); setSelected(null); return; }
    if (path.length === 2) { savePath(path.slice(0, 1)); setSelected(null); return; }
    const newPath = path.slice(0, -1);
    savePath(newPath);
    const sys = SYSTEMS.find(s => s.id === newPath[0].systemId);
    if (sys && newPath.length > 1) {
      const struct = sys.structures.find(st => st.id === newPath[1].label);
      setSelected(struct ?? null);
    } else {
      setSelected(null);
    }
  };

  const selectSystem = (sys: typeof SYSTEMS[0]) => {
    savePath([{ label: sys.casualName, systemId: sys.id }]);
    setSelected(null);
  };

  const selectStructure = (struct: Structure) => {
    if (!currentSystem) return;
    const newPath = [...path.slice(0, 1), { label: struct.id, systemId: currentSystem.id }];
    savePath(newPath);
    setSelected(struct);
  };

  const selectChild = (child: Structure) => {
    setSelected(child);
    if (!currentSystem) return;
    const newPath = [...path, { label: child.id, systemId: currentSystem.id }];
    savePath(newPath);
  };

  const styles = {
    page: { minHeight: "100vh", backgroundColor: "#252830", fontFamily: "'Inter','Plus Jakarta Sans',sans-serif" } as React.CSSProperties,
    header: { backgroundColor: "rgba(0,0,0,0.3)", padding: "14px 24px", display: "flex", alignItems: "center", gap: "12px", borderBottom: "1px solid rgba(252,250,247,0.07)" } as React.CSSProperties,
    body: { maxWidth: "820px", margin: "0 auto", padding: "32px 24px" } as React.CSSProperties,
    card: { backgroundColor: "rgba(255,255,255,0.05)", borderRadius: "14px", padding: "24px", marginBottom: "20px", border: "1px solid rgba(252,250,247,0.07)" } as React.CSSProperties,
    btn: (color: string) => ({ backgroundColor: color, color: "#fcfaf7", border: "none", borderRadius: "10px", padding: "16px 20px", cursor: "pointer", textAlign: "left" as const, fontFamily: "inherit", fontWeight: "600" as const, fontSize: "0.95rem", transition: "opacity 0.15s" }),
    back: { backgroundColor: "rgba(255,255,255,0.07)", color: "#fcfaf7", border: "1px solid rgba(252,250,247,0.1)", borderRadius: "8px", padding: "8px 16px", cursor: "pointer", fontFamily: "inherit", fontSize: "0.9rem" } as React.CSSProperties,
    label: { color: "rgba(252,250,247,0.4)", fontSize: "0.72rem", fontWeight: "700" as const, textTransform: "uppercase" as const, letterSpacing: "0.06em", marginBottom: "6px" },
    value: { color: "#fcfaf7", fontSize: "1rem", fontWeight: "600" as const, marginBottom: "14px" },
    def: { color: "rgba(252,250,247,0.75)", fontSize: "0.9rem", lineHeight: 1.6 },
  };

  if (path.length === 0) {
    return (
      <div style={styles.page}>
        <div style={styles.header}>
          <button onClick={() => navigate("/")} style={styles.back}>← Dashboard</button>
          <span style={{ color: "#fcfaf7", fontWeight: "700" }}>System Explorer</span>
        </div>
        <div style={styles.body}>
          <h1 style={{ color: "#fcfaf7", fontSize: "1.8rem", fontWeight: "800", marginBottom: "8px" }}>Body System Explorer</h1>
          <p style={{ color: "rgba(252,250,247,0.4)", marginBottom: "32px" }}>Select a system to explore its structures, combining forms, and definitions.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: "14px" }}>
            {SYSTEMS.map(sys => (
              <button key={sys.id} onClick={() => selectSystem(sys)} style={styles.btn(SYSTEM_COLORS[sys.id])}>
                <div style={{ fontSize: "1rem", fontWeight: "700" }}>{sys.casualName}</div>
                <div style={{ fontSize: "0.75rem", opacity: 0.6, marginTop: "4px" }}>{sys.officialName}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (currentSystem && !selected) {
    return (
      <div style={styles.page}>
        <div style={styles.header}>
          <button onClick={goBack} style={styles.back}>← Back</button>
          <span style={{ color: "#fcfaf7", fontWeight: "700" }}>{currentSystem.casualName}</span>
        </div>
        <div style={styles.body}>
          <div style={styles.card}>
            <div style={styles.label}>Official Medical Term</div>
            <div style={{ color: "#fcfaf7", fontSize: "1.4rem", fontWeight: "800", marginBottom: "12px" }}>{currentSystem.officialName}</div>
            <div style={styles.label}>Common Name</div>
            <div style={styles.value}>{currentSystem.casualName}</div>
            <div style={styles.label}>Overview</div>
            <div style={styles.def}>Select a structure below to explore its definition and combining forms.</div>
          </div>
          <h2 style={{ color: "rgba(252,250,247,0.4)", fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "12px" }}>Structures & Organs</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: "12px" }}>
            {currentSystem.structures.map(s => (
              <button key={s.id} onClick={() => selectStructure(s)} style={styles.btn(currentColor)}>
                <div style={{ fontWeight: "700" }}>{s.casualName}</div>
                <div style={{ fontSize: "0.75rem", opacity: 0.6, marginTop: "4px" }}>{s.officialName}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <button onClick={goBack} style={styles.back}>← Back</button>
        <span style={{ color: "#fcfaf7", fontWeight: "700" }}>{selected?.casualName}</span>
      </div>
      {selected && (
        <div style={styles.body}>
          <div style={styles.card}>
            <div style={styles.label}>Official Medical Term</div>
            <div style={{ color: "#fcfaf7", fontSize: "1.5rem", fontWeight: "800", marginBottom: "12px" }}>{selected.officialName}</div>
            <div style={styles.label}>Common Name</div>
            <div style={styles.value}>{selected.casualName}</div>
            <div style={styles.label}>Combining Form(s)</div>
            <div style={{ color: "#fcfaf7", fontWeight: "700", fontSize: "1rem", fontFamily: "monospace", marginBottom: "14px", backgroundColor: "rgba(255,255,255,0.08)", display: "inline-block", padding: "4px 10px", borderRadius: "6px" }}>{selected.combiningForm}</div>
            <div style={{ clear: "both" }} />
            <div style={styles.label}>Definition</div>
            <div style={styles.def}>{selected.definition}</div>
          </div>

          {selected.children && selected.children.length > 0 && (
            <>
              <h2 style={{ color: "rgba(252,250,247,0.4)", fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "12px" }}>Sub-Structures</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: "12px" }}>
                {selected.children.map(child => (
                  <button key={child.id} onClick={() => selectChild(child)} style={styles.btn(currentColor)}>
                    <div style={{ fontWeight: "700" }}>{child.casualName}</div>
                    <div style={{ fontSize: "0.75rem", opacity: 0.6, marginTop: "4px" }}>{child.officialName}</div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
