import { useState, useEffect, useLayoutEffect, useCallback } from "react";

export interface Step {
  title: string;
  desc: string;
  targetId?: string;
}

export const DEFAULT_STEPS: Step[] = [
  {
    title: "Welcome to AnatomiX",
    desc: "Your complete medical terminology study platform. Here is a quick look around so you know where everything is.",
  },
  {
    title: "Navigation bar",
    desc: "At the top you will find the Guide, Chat with classmates, your Account settings, and Switch User to sign out.",
    targetId: "tour-header",
  },
  {
    title: "Clinical Spotlight",
    desc: "A different medical term is featured here every few hours. Tap the card to flip it and see the definition.",
    targetId: "tour-spotlight",
  },
  {
    title: "Study modules",
    desc: "These tiles are your main tools: Flashcards, Games, Practice Test, Body Explorer, Multiplayer, and more. Tap any tile to jump straight in.",
    targetId: "tour-modules",
  },
  {
    title: "Getting started checklist",
    desc: "Five quick milestones to get your profile fully set up. Complete them to unlock everything and track your early progress.",
    targetId: "tour-checklist",
  },
];

const PAD = 10;
const CARD_W = 340;
const CARD_H = 180;

interface Rect { top: number; left: number; width: number; height: number; }

function getRect(id: string): Rect | null {
  const el = document.getElementById(id);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { top: r.top, left: r.left, width: r.width, height: r.height };
}

function cardStyle(rect: Rect | null): React.CSSProperties {
  if (!rect) {
    return {
      position: "fixed",
      top: "50%", left: "50%",
      transform: "translate(-50%, -50%)",
      width: CARD_W,
    };
  }
  const vh = window.innerHeight;
  const vw = window.innerWidth;
  const spaceBelow = vh - (rect.top + rect.height + PAD);
  const spaceAbove = rect.top - PAD;
  const useBelow = spaceBelow >= CARD_H || spaceBelow >= spaceAbove;
  const top = useBelow
    ? rect.top + rect.height + PAD + 10
    : rect.top - PAD - CARD_H - 10;
  const left = Math.min(
    Math.max(rect.left, PAD),
    vw - CARD_W - PAD
  );
  return { position: "fixed", top, left, width: CARD_W };
}

export default function OnboardingTour({ onDone, steps = DEFAULT_STEPS }: { onDone: () => void; steps?: Step[] }) {
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);

  const current = steps[step];
  const isLast = step === steps.length - 1;

  const updateRect = useCallback(() => {
    if (!current?.targetId) { setRect(null); return; }
    const el = document.getElementById(current.targetId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => setRect(getRect(current.targetId!)), 350);
    } else {
      setRect(null);
    }
  }, [current?.targetId]);

  useLayoutEffect(() => { updateRect(); }, [updateRect]);

  useEffect(() => {
    const handler = () => updateRect();
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, [updateRect]);

  const next = () => {
    if (isLast) { onDone(); } else { setStep(s => s + 1); }
  };
  const back = () => setStep(s => s - 1);

  if (!current) return null;

  const spotlightStyle: React.CSSProperties | null = rect ? {
    position: "fixed",
    top: rect.top - PAD,
    left: rect.left - PAD,
    width: rect.width + PAD * 2,
    height: rect.height + PAD * 2,
    borderRadius: "12px",
    boxShadow: "0 0 0 9999px rgba(0,0,0,0.78)",
    border: "2px solid rgba(122,159,200,0.7)",
    zIndex: 9990,
    pointerEvents: "none",
    transition: "top 0.35s ease, left 0.35s ease, width 0.35s ease, height 0.35s ease",
  } : null;

  return (
    <>
      {!rect && (
        <div style={{
          position: "fixed", inset: 0,
          backgroundColor: "rgba(0,0,0,0.78)",
          zIndex: 9989,
        }} />
      )}
      {spotlightStyle && <div style={spotlightStyle} />}

      <div style={{
        ...cardStyle(rect),
        zIndex: 9999,
        backgroundColor: "#2a2f3b",
        border: "1px solid rgba(122,159,200,0.35)",
        borderRadius: "16px",
        padding: "24px 26px 20px",
        boxShadow: "0 12px 40px rgba(0,0,0,0.6)",
        fontFamily: "'Inter','Plus Jakarta Sans',sans-serif",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
          <span style={{ color: "#7a9fc8", fontSize: "0.72rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em" }}>
            {step + 1} of {steps.length}
          </span>
          <button
            onClick={onDone}
            style={{ background: "none", border: "none", color: "rgba(252,250,247,0.3)", cursor: "pointer", fontSize: "0.78rem", fontFamily: "inherit", padding: 0 }}
          >
            Skip
          </button>
        </div>

        <div style={{ color: "#fcfaf7", fontWeight: 800, fontSize: "1.05rem", marginBottom: "8px" }}>
          {current.title}
        </div>
        <div style={{ color: "rgba(252,250,247,0.55)", fontSize: "0.875rem", lineHeight: 1.65, marginBottom: "20px" }}>
          {current.desc}
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: "5px" }}>
            {steps.map((_, i) => (
              <div key={i} style={{
                width: i === step ? "18px" : "6px", height: "6px", borderRadius: "3px",
                backgroundColor: i === step ? "#7a9fc8" : "rgba(252,250,247,0.18)",
                transition: "width 0.2s ease",
              }} />
            ))}
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            {step > 0 && (
              <button onClick={back} style={{
                background: "none", border: "1px solid rgba(252,250,247,0.15)",
                color: "rgba(252,250,247,0.5)", cursor: "pointer", borderRadius: "8px",
                padding: "7px 16px", fontFamily: "inherit", fontSize: "0.85rem",
              }}>
                Back
              </button>
            )}
            <button onClick={next} style={{
              backgroundColor: isLast ? "#4a6080" : "#7a9fc8",
              border: "none", color: "#fcfaf7", cursor: "pointer", borderRadius: "8px",
              padding: "7px 20px", fontFamily: "inherit", fontSize: "0.85rem", fontWeight: 700,
            }}>
              {isLast ? "Get Started" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
