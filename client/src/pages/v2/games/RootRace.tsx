import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { useUser } from "@/contexts/UserContext";
import { ALL_TERMS } from "@/data/medicalData";
import { GameShell, shuffle } from "./shared";

const ROOTS = ALL_TERMS.filter(t => t.type === "root" && t.validSuffixes && t.validSuffixes.length > 0);
const SUFFIXES = ALL_TERMS.filter(t => t.type === "suffix");

const AUTO_VALID: Record<string, string[]> = {
  "cardi/o": ["-logy", "-itis", "-megaly", "-pathy", "-gram", "-ectomy", "-plasty", "-stomy", "-rrhexis"],
  "gastr/o": ["-itis", "-scopy", "-ectomy", "-algia", "-plasty", "-rrhea", "-stomy"],
  "hepat/o": ["-itis", "-megaly", "-ectomy", "-logy", "-pathy"],
  "nephr/o": ["-itis", "-logy", "-ectomy", "-osis", "-pathy", "-megaly"],
  "arthr/o": ["-itis", "-scopy", "-plasty", "-desis", "-tomy"],
  "oste/o": ["-itis", "-logy", "-malacia", "-porosis", "-ectomy", "-genesis"],
  "col/o": ["-itis", "-scopy", "-ectomy", "-stomy"],
  "bronch/o": ["-itis", "-scopy", "-spasm"],
  "neur/o": ["-itis", "-logy", "-pathy", "-oma", "-genesis"],
  "derm/o": ["-itis", "-logy", "-plasty", "-ectomy"],
  "splen/o": ["-ectomy", "-megaly", "-itis"],
  "hem/o": ["-stasis", "-lysis", "-rrhage", "-philia"],
  "thromb/o": ["-osis", "-lysis", "-ectomy"],
  "leuk/o": ["-emia", "-penia", "-cyte"],
};

export default function RootRace() {
  const [, navigate] = useLocation();
  const { updateScore } = useUser();
  const allRoots = useMemo(() => Object.keys(AUTO_VALID), []);
  const [rootIdx, setRootIdx] = useState(0);
  const [found, setFound] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [wrong, setWrong] = useState<string | null>(null);

  const currentRoot = allRoots[rootIdx % allRoots.length];
  const validSuffixes = AUTO_VALID[currentRoot] ?? [];

  const handleSuffix = (suf: string) => {
    if (found.includes(suf)) return;
    if (validSuffixes.includes(suf)) {
      setFound(f => [...f, suf]);
      setScore(s => s + 8);
      setWrong(null);
    } else {
      setWrong(suf);
      setTimeout(() => setWrong(null), 600);
    }
  };

  const nextRoot = () => {
    updateScore("root-race", score);
    setFound([]); setRootIdx(i => i + 1);
  };

  const allFound = found.length === validSuffixes.length;

  return (
    <GameShell title="Root Race" emoji="🏁" score={score} streak={found.length} idx={rootIdx} total={allRoots.length} onBack={() => navigate("/games")}>
      <div style={{ backgroundColor: "rgba(0,0,0,0.2)", borderRadius: "14px", padding: "24px", marginBottom: "20px", textAlign: "center" }}>
        <div style={{ color: "rgba(252,250,247,0.5)", fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", marginBottom: "10px" }}>
          Link every valid suffix to this combining form:
        </div>
        <div style={{ color: "#fcfaf7", fontSize: "2.5rem", fontWeight: "800", fontFamily: "monospace" }}>{currentRoot}</div>
        <div style={{ color: "rgba(252,250,247,0.5)", fontSize: "0.85rem", marginTop: "8px" }}>
          {found.length} / {validSuffixes.length} found
        </div>
        {allFound && (
          <div style={{ color: "#90e090", fontWeight: "700", marginTop: "10px" }}>🏁 Complete! All suffixes found.</div>
        )}
      </div>

      {found.length > 0 && (
        <div style={{ marginBottom: "16px" }}>
          <div style={{ color: "rgba(252,250,247,0.5)", fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", marginBottom: "8px" }}>Found:</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {found.map(s => <span key={s} style={{ backgroundColor: "rgba(80,160,80,0.3)", border: "1px solid rgba(100,200,100,0.4)", color: "#90e090", padding: "6px 12px", borderRadius: "20px", fontSize: "0.85rem", fontFamily: "monospace", fontWeight: "700" }}>{currentRoot.replace("/o", "")}{s}</span>)}
          </div>
        </div>
      )}

      <div style={{ marginBottom: "20px" }}>
        <div style={{ color: "rgba(252,250,247,0.5)", fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", marginBottom: "10px" }}>Tap valid suffixes:</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {shuffle(SUFFIXES.slice(0, 18)).map(s => {
            const isFound = found.includes(s.term);
            const isWrong = wrong === s.term;
            return (
              <button key={s.id} onClick={() => handleSuffix(s.term)} disabled={isFound}
                style={{
                  padding: "10px 14px", borderRadius: "8px", fontFamily: "monospace", fontWeight: "700", cursor: isFound ? "default" : "pointer",
                  backgroundColor: isFound ? "rgba(80,160,80,0.3)" : isWrong ? "rgba(200,80,80,0.3)" : "rgba(252,250,247,0.08)",
                  color: isFound ? "#90e090" : isWrong ? "#e09090" : "#fcfaf7",
                  border: isFound ? "1px solid rgba(100,200,100,0.4)" : isWrong ? "1px solid rgba(220,100,100,0.4)" : "1px solid rgba(252,250,247,0.12)",
                  transition: "all 0.15s", fontSize: "0.9rem",
                }}>
                {s.term}
              </button>
            );
          })}
        </div>
      </div>

      {allFound && (
        <button onClick={nextRoot} style={{ width: "100%", padding: "12px", borderRadius: "10px", backgroundColor: "#fcfaf7", color: "#8b4f58", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: "700" }}>Next Root →</button>
      )}
    </GameShell>
  );
}
