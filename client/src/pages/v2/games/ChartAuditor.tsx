import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { useUser } from "@/contexts/UserContext";
import { ALL_TERMS } from "@/data/medicalData";
import { GameShell, shuffle } from "./shared";

const AUDITS = [
  {
    id: "a1",
    paragraph: "The patient presented with a rapid heart rate (tachycardia) and was found to have thickening of the arteries, a condition known as atherosclerosis. Her liver appeared enlarged  -  a finding called hepatomegaly. Lab results confirmed low red blood cells (iron-deficiency weakness).",
    errors: ["thickening of the arteries", "iron-deficiency weakness"],
    fixes: ["atherosclerosis", "anemia"],
    explanation: "Thickening → atherosclerosis (fatty plaque deposits). Iron-deficiency weakness → anemia (deficiency of red blood cells or hemoglobin).",
  },
  {
    id: "a2",
    paragraph: "Post-op note: The surgeon performed a colon camera examination (colonoscopy). Biopsies showed intestinal swelling disease consistent with Crohn's. The patient also has a spleen that's too big (splenomegaly) and requires a spleen cut-out (splenectomy) if it worsens.",
    errors: ["intestinal swelling disease", "spleen cut-out"],
    fixes: ["inflammatory bowel disease", "splenectomy"],
    explanation: "Intestinal swelling disease → inflammatory bowel disease (IBD). The term 'splenectomy' was actually correct and should not be changed.",
  },
  {
    id: "a3",
    paragraph: "The patient's brain scan showed brain swelling (encephalitis) following viral infection. She also presented with speech loss (aphasia) and right-side body shutdown (hemiplegia). MRI confirmed fluid around the brain wrapping (meningitis).",
    errors: ["brain swelling", "body shutdown", "brain wrapping"],
    fixes: ["encephalitis", "hemiplegia", "meningitis"],
    explanation: "Brain swelling → encephalitis. Body shutdown → hemiplegia (paralysis of one side). Brain wrapping → meningitis (inflammation of meninges).",
  },
  {
    id: "a4",
    paragraph: "Cardiology consult: Patient has a slow heart rate (bradycardia) and shows signs of heart muscle disease (cardiomyopathy). Echo revealed fluid sac around the heart (pericarditis). ECG confirms abnormal heartbeat pattern (arrhythmia).",
    errors: ["fluid sac around the heart", "abnormal heartbeat pattern"],
    fixes: ["pericarditis (inflammation)", "arrhythmia"],
    explanation: "The pericardium is the sac  -  pericarditis means inflammation of it, not 'fluid sac'. Arrhythmia is correct (any abnormal heart rhythm).",
  },
];

export default function ChartAuditor() {
  const [, navigate] = useLocation();
  const { updateScore } = useUser();
  const audits = useMemo(() => shuffle(AUDITS), []);
  const [idx, setIdx] = useState(0);
  const [found, setFound] = useState<string[]>([]);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);

  const current = audits[idx % audits.length];

  const handleClick = (error: string) => {
    if (found.includes(error) || revealed) return;
    setFound(f => { const next = [...f, error]; if (next.length === current.errors.length) setRevealed(true); return next; });
    setScore(s => s + 10);
  };

  const next = () => {
    updateScore("chart-auditor", score);
    setFound([]); setRevealed(false); setIdx(i => i + 1);
  };

  const highlightText = (text: string) => {
    let parts = [text];
    for (const err of current.errors) {
      parts = parts.flatMap(part => {
        if (typeof part !== "string") return [part];
        const idx2 = part.indexOf(err);
        if (idx2 === -1) return [part];
        const isFound2 = found.includes(err);
        return [
          part.slice(0, idx2),
          <span key={err} onClick={() => handleClick(err)}
            style={{ backgroundColor: isFound2 ? "rgba(80,160,80,0.4)" : "rgba(220,150,50,0.2)", border: `1px solid ${isFound2 ? "rgba(100,200,100,0.4)" : "rgba(220,150,50,0.3)"}`, borderRadius: "4px", padding: "1px 4px", cursor: isFound2 ? "default" : "pointer", textDecoration: isFound2 ? "line-through" : "underline", textDecorationStyle: "wavy", textDecorationColor: "#f0c060", color: "#fcfaf7" }}>
            {err}
          </span>,
          part.slice(idx2 + err.length),
        ];
      });
    }
    return parts;
  };

  return (
    <GameShell title="Chart Auditor" emoji="📝" score={score} streak={found.length} idx={idx} total={audits.length} onBack={() => navigate("/games")}>
      <div style={{ backgroundColor: "rgba(0,0,0,0.2)", borderRadius: "14px", padding: "24px", marginBottom: "20px" }}>
        <div style={{ color: "rgba(252,250,247,0.5)", fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", marginBottom: "12px" }}>
          Find and tap the {current.errors.length} incorrect/imprecise terms in this clinical note:
        </div>
        <div style={{ color: "#fcfaf7", fontSize: "0.95rem", lineHeight: 1.8 }}>
          {highlightText(current.paragraph)}
        </div>
        <div style={{ marginTop: "14px", color: "rgba(252,250,247,0.4)", fontSize: "0.8rem" }}>
          {found.length} / {current.errors.length} found  -  tap the underlined terms to flag them
        </div>
      </div>

      {revealed && (
        <div>
          <div style={{ backgroundColor: "rgba(80,160,80,0.2)", border: "1px solid rgba(100,200,100,0.3)", borderRadius: "12px", padding: "16px 20px", marginBottom: "14px" }}>
            <div style={{ color: "#90e090", fontWeight: "700", marginBottom: "8px" }}>✓ All errors flagged!</div>
            <div style={{ color: "rgba(252,250,247,0.8)", fontSize: "0.85rem", lineHeight: 1.6 }}>{current.explanation}</div>
          </div>
          <button onClick={next} style={{ width: "100%", padding: "12px", borderRadius: "10px", backgroundColor: "#fcfaf7", color: "#8b4f58", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: "700" }}>Next Chart →</button>
        </div>
      )}
    </GameShell>
  );
}
