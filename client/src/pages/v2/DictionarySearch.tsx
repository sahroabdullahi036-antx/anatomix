import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { ALL_TERMS, SYSTEMS, type MedicalTerm } from "@/data/medicalData";

type FilterType = 'all' | 'prefix' | 'suffix' | 'root' | 'condition' | 'procedure';
const FILTERS: { key: FilterType; label: string }[] = [
  { key: "all", label: "All" },
  { key: "prefix", label: "Prefixes" },
  { key: "root", label: "Combining Forms" },
  { key: "suffix", label: "Suffixes" },
  { key: "condition", label: "Pathology & Conditions" },
  { key: "procedure", label: "Surgical Procedures" },
];

const SYSTEM_COLORS: Record<string, string> = {
  digestive: "#596e60", cardiovascular: "#4a5a6a", respiratory: "#9c6f5e",
  nervous: "#5c4a6a", musculoskeletal: "#4f4f4f", urinary: "#3b5e66",
  endocrine: "#3b5e66", integumentary: "#3b5e66", lymphatic: "#4a5a6e",
  reproductive: "#6a4a5e", blood: "#4a5a6a", general: "#6a5a50",
};

export default function DictionarySearch() {
  const [, navigate] = useLocation();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  const results = useMemo(() => {
    let pool = ALL_TERMS;
    if (filter !== "all") pool = pool.filter(t => t.type === filter);
    if (!query.trim()) return pool.slice(0, 60);
    const q = query.toLowerCase();
    return pool.filter(t =>
      t.term.toLowerCase().includes(q) ||
      t.meaning.toLowerCase().includes(q) ||
      t.casualMeaning.toLowerCase().includes(q) ||
      t.chabnerDef.toLowerCase().includes(q) ||
      t.example.toLowerCase().includes(q) ||
      (t.system && t.system.toLowerCase().includes(q))
    );
  }, [query, filter]);

  const typeColors: Record<string, string> = {
    prefix: "#9c6f5e", suffix: "#4a5a6a", root: "#596e60",
    condition: "#5c4a6a", procedure: "#4f4f4f", word: "#3b5e66",
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#8b4f58", fontFamily: "'Inter','Plus Jakarta Sans',sans-serif" }}>
      <div style={{ backgroundColor: "rgba(0,0,0,0.2)", padding: "14px 24px", display: "flex", alignItems: "center", gap: "12px", borderBottom: "1px solid rgba(252,250,247,0.1)", flexWrap: "wrap", gap: "12px" as any }}>
        <button onClick={() => navigate("/")} style={{ backgroundColor: "rgba(252,250,247,0.12)", color: "#fcfaf7", border: "1px solid rgba(252,250,247,0.2)", borderRadius: "8px", padding: "8px 16px", cursor: "pointer", fontFamily: "inherit", fontSize: "0.9rem" }}>← Dashboard</button>
        <span style={{ color: "#fcfaf7", fontWeight: "700" }}>Dictionary Search</span>
      </div>

      <div style={{ maxWidth: "820px", margin: "0 auto", padding: "28px 24px" }}>
        <h1 style={{ color: "#fcfaf7", fontSize: "1.6rem", fontWeight: "800", marginBottom: "6px" }}>🔍 Reverse Lookup Dictionary</h1>
        <p style={{ color: "rgba(252,250,247,0.6)", fontSize: "0.9rem", marginBottom: "20px" }}>Type a word, symptom, or definition fragment to find matching medical terms.</p>

        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder='Try "kidney", "inflammation", "rapid", "swallowing"...'
          style={{ width: "100%", padding: "14px 16px", borderRadius: "10px", fontSize: "1rem", backgroundColor: "rgba(252,250,247,0.12)", border: "2px solid rgba(252,250,247,0.2)", color: "#fcfaf7", outline: "none", boxSizing: "border-box", marginBottom: "14px", fontFamily: "inherit" }}
        />

        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "24px" }}>
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              style={{ padding: "6px 14px", borderRadius: "20px", fontSize: "0.82rem", fontWeight: "600", cursor: "pointer", fontFamily: "inherit", backgroundColor: filter === f.key ? "#fcfaf7" : "rgba(252,250,247,0.12)", color: filter === f.key ? "#8b4f58" : "#fcfaf7", border: filter === f.key ? "none" : "1px solid rgba(252,250,247,0.2)", transition: "all 0.15s" }}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div style={{ color: "rgba(252,250,247,0.5)", fontSize: "0.8rem", marginBottom: "16px" }}>{results.length} result{results.length !== 1 ? "s" : ""}{query ? ` for "${query}"` : ""}</div>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {results.map(term => {
            const color = typeColors[term.type] ?? "#596e60";
            const isOpen = expanded === term.id;
            return (
              <div
                key={term.id}
                onClick={() => setExpanded(isOpen ? null : term.id)}
                style={{ backgroundColor: "rgba(0,0,0,0.22)", borderRadius: "12px", padding: "16px 20px", cursor: "pointer", border: `1px solid ${isOpen ? "rgba(252,250,247,0.2)" : "rgba(252,250,247,0.06)"}`, transition: "border-color 0.15s" }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "4px" }}>
                      <span style={{ color: "#fcfaf7", fontWeight: "700", fontSize: "1rem", fontFamily: "monospace" }}>{term.term}</span>
                      <span style={{ backgroundColor: color, color: "#fcfaf7", fontSize: "0.68rem", fontWeight: "700", padding: "2px 8px", borderRadius: "10px", textTransform: "uppercase", letterSpacing: "0.04em" }}>{term.type}</span>
                      {term.system && term.system !== "General" && (
                        <span style={{ color: "rgba(252,250,247,0.4)", fontSize: "0.75rem" }}>{term.system}</span>
                      )}
                    </div>
                    <div style={{ color: "rgba(252,250,247,0.85)", fontSize: "0.9rem" }}>{term.meaning}</div>
                    <div style={{ color: "rgba(252,250,247,0.5)", fontSize: "0.82rem", marginTop: "3px" }}>💬 {term.casualMeaning}</div>
                  </div>
                  <span style={{ color: "rgba(252,250,247,0.4)", fontSize: "1.2rem" }}>{isOpen ? "▲" : "▼"}</span>
                </div>

                {isOpen && (
                  <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid rgba(252,250,247,0.1)" }}>
                    {term.homonymWarning && (
                      <div style={{ backgroundColor: "rgba(220,150,50,0.2)", border: "1px solid rgba(220,150,50,0.4)", borderRadius: "8px", padding: "10px 14px", marginBottom: "14px" }}>
                        <div style={{ color: "#f0c060", fontWeight: "700", fontSize: "0.82rem", marginBottom: "4px" }}>⚠️ DUAL-MEANING ROOT WARNING</div>
                        <div style={{ color: "rgba(252,250,247,0.8)", fontSize: "0.85rem" }}>{term.homonymWarning}</div>
                      </div>
                    )}
                    <div style={{ color: "rgba(252,250,247,0.5)", fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>Chabner Definition</div>
                    <div style={{ color: "rgba(252,250,247,0.85)", fontSize: "0.88rem", lineHeight: 1.6, marginBottom: "12px" }}>{term.chabnerDef}</div>
                    {term.example && (
                      <>
                        <div style={{ color: "rgba(252,250,247,0.5)", fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>Clinical Example</div>
                        <div style={{ color: "rgba(252,250,247,0.7)", fontSize: "0.85rem", fontStyle: "italic" }}>{term.example}</div>
                      </>
                    )}
                    {term.wordParts && term.wordParts.length > 0 && (
                      <div style={{ marginTop: "12px" }}>
                        <div style={{ color: "rgba(252,250,247,0.5)", fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>Word Part Breakdown</div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                          {term.wordParts.map((wp, i) => (
                            <div key={i} style={{ backgroundColor: "rgba(252,250,247,0.1)", borderRadius: "6px", padding: "6px 10px", fontSize: "0.82rem" }}>
                              <span style={{ color: "#fcfaf7", fontFamily: "monospace", fontWeight: "700" }}>{wp.part}</span>
                              <span style={{ color: "rgba(252,250,247,0.5)", margin: "0 4px" }}>→</span>
                              <span style={{ color: "rgba(252,250,247,0.75)" }}>{wp.meaning}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {results.length === 0 && (
            <div style={{ textAlign: "center", padding: "48px", color: "rgba(252,250,247,0.4)" }}>
              <div style={{ fontSize: "48px", marginBottom: "12px" }}>🔍</div>
              <div>No terms match your search. Try different keywords.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
