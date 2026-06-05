import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { ALL_TERMS, SYSTEMS, type MedicalTerm } from "@/data/medicalData";

type FilterType = 'all' | 'prefix' | 'suffix' | 'root' | 'condition' | 'procedure';
const FILTERS: { key: FilterType; label: string }[] = [
  { key: "all",       label: "All" },
  { key: "prefix",    label: "Prefixes" },
  { key: "root",      label: "Combining Forms" },
  { key: "suffix",    label: "Suffixes" },
  { key: "condition", label: "Pathology & Conditions" },
  { key: "procedure", label: "Surgical Procedures" },
];

const TYPE_COLORS: Record<string, string> = {
  prefix: "#5a4a3e", suffix: "#394d62", root: "#3d5a47",
  condition: "#4a3d62", procedure: "#424242", word: "#2e4e58",
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
      t.definition.toLowerCase().includes(q) ||
      t.example.toLowerCase().includes(q) ||
      (t.system && t.system.toLowerCase().includes(q))
    );
  }, [query, filter]);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#252830", fontFamily: "'Inter','Plus Jakarta Sans',sans-serif" }}>
      <div style={{ backgroundColor: "rgba(0,0,0,0.3)", padding: "14px 24px", display: "flex", alignItems: "center", gap: "12px", borderBottom: "1px solid rgba(252,250,247,0.07)" }}>
        <button onClick={() => navigate("/")} style={{ backgroundColor: "rgba(255,255,255,0.07)", color: "#fcfaf7", border: "1px solid rgba(252,250,247,0.1)", borderRadius: "8px", padding: "8px 16px", cursor: "pointer", fontFamily: "inherit", fontSize: "0.9rem" }}>← Dashboard</button>
        <span style={{ color: "#fcfaf7", fontWeight: "700" }}>Dictionary Search</span>
      </div>

      <div style={{ maxWidth: "820px", margin: "0 auto", padding: "28px 24px" }}>
        <h1 style={{ color: "#fcfaf7", fontSize: "1.6rem", fontWeight: "800", marginBottom: "6px" }}>Reverse Lookup Dictionary</h1>
        <p style={{ color: "rgba(252,250,247,0.4)", fontSize: "0.9rem", marginBottom: "20px" }}>Type a word, symptom, or definition fragment to find matching medical terms.</p>

        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search terms, meanings, examples..."
          style={{ width: "100%", padding: "14px 16px", borderRadius: "10px", fontSize: "1rem", backgroundColor: "rgba(255,255,255,0.07)", border: "1px solid rgba(252,250,247,0.1)", color: "#fcfaf7", outline: "none", boxSizing: "border-box", marginBottom: "16px", fontFamily: "inherit" }}
        />

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "24px" }}>
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              style={{ padding: "8px 16px", borderRadius: "8px", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: "600", fontSize: "0.82rem", backgroundColor: filter === f.key ? "#4a6080" : "rgba(255,255,255,0.07)", color: "#fcfaf7", transition: "all 0.15s" }}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div style={{ color: "rgba(252,250,247,0.35)", fontSize: "0.8rem", marginBottom: "14px" }}>
          {results.length} result{results.length !== 1 ? "s" : ""}{!query.trim() ? " — start typing to filter" : ""}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {results.map(term => (
            <DictCard key={term.id} term={term} expanded={expanded === term.id} onToggle={() => setExpanded(expanded === term.id ? null : term.id)} typeColors={TYPE_COLORS} />
          ))}
        </div>
      </div>
    </div>
  );
}

function DictCard({ term, expanded, onToggle, typeColors }: { term: MedicalTerm; expanded: boolean; onToggle: () => void; typeColors: Record<string, string> }) {
  const color = typeColors[term.type] ?? "#394d62";
  return (
    <div
      onClick={onToggle}
      style={{ backgroundColor: "rgba(255,255,255,0.05)", borderRadius: "12px", padding: "16px 20px", cursor: "pointer", border: `1px solid ${expanded ? "rgba(255,255,255,0.12)" : "rgba(252,250,247,0.05)"}`, transition: "border-color 0.15s" }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px", flexWrap: "wrap" }}>
            <span style={{ color: "#fcfaf7", fontWeight: "700", fontSize: "1rem", fontFamily: "monospace" }}>{term.term}</span>
            <span style={{ backgroundColor: color, color: "#fcfaf7", fontSize: "0.68rem", fontWeight: "700", padding: "2px 7px", borderRadius: "4px", textTransform: "uppercase" }}>{term.type}</span>
            {term.system && term.system !== "General" && <span style={{ color: "rgba(252,250,247,0.4)", fontSize: "0.75rem" }}>{term.system}</span>}
          </div>
          <div style={{ color: "rgba(252,250,247,0.75)", fontSize: "0.88rem" }}>{term.meaning}</div>
        </div>
        <span style={{ color: "rgba(252,250,247,0.35)", fontSize: "0.8rem", flexShrink: 0 }}>{expanded ? "▲" : "▼"}</span>
      </div>
      {expanded && (
        <div style={{ marginTop: "14px", paddingTop: "14px", borderTop: "1px solid rgba(252,250,247,0.08)" }}>
          <div style={{ color: "rgba(252,250,247,0.5)", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>Definition</div>
          <div style={{ color: "rgba(252,250,247,0.8)", fontSize: "0.88rem", lineHeight: 1.6, marginBottom: "12px" }}>{term.definition}</div>
          {term.casualMeaning && (
            <>
              <div style={{ color: "rgba(252,250,247,0.5)", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>In plain terms</div>
              <div style={{ color: "rgba(252,250,247,0.65)", fontSize: "0.85rem", marginBottom: "12px" }}>{term.casualMeaning}</div>
            </>
          )}
          {term.example && (
            <>
              <div style={{ color: "rgba(252,250,247,0.5)", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>Example</div>
              <div style={{ color: "rgba(252,250,247,0.6)", fontSize: "0.82rem", fontStyle: "italic" }}>{term.example}</div>
            </>
          )}
          {term.wordParts && term.wordParts.length > 0 && (
            <div style={{ marginTop: "12px", display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {term.wordParts.map((wp, i) => (
                <span key={i} style={{ backgroundColor: "rgba(255,255,255,0.08)", borderRadius: "6px", padding: "3px 8px", fontSize: "0.78rem", color: "rgba(252,250,247,0.7)", fontFamily: "monospace" }}>
                  {wp.part} ({wp.meaning})
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
