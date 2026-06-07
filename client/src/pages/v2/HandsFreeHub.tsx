import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import { useUser } from "@/contexts/UserContext";
import { ALL_TERMS } from "@/data/medicalData";
import { speakTerm } from "@/lib/audioService";
import { startMetronome, stopMetronome } from "@/lib/audioService";

const BG = "#252830";
const CARD = "rgba(255,255,255,0.05)";
const BORDER = "rgba(252,250,247,0.08)";
const TEXT = "#fcfaf7";
const MUTED = "rgba(252,250,247,0.45)";
const ACCENT = "#4a6080";

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const SpeechRecognitionAPI = typeof window !== "undefined"
  ? (window.SpeechRecognition || window.webkitSpeechRecognition)
  : null;

const btn = (bg = ACCENT, disabled = false): React.CSSProperties => ({
  padding: "14px 28px", borderRadius: "12px", backgroundColor: disabled ? "rgba(255,255,255,0.06)" : bg,
  color: disabled ? MUTED : TEXT, border: "none", cursor: disabled ? "default" : "pointer",
  fontFamily: "inherit", fontWeight: "700", fontSize: "1rem", transition: "all 0.15s",
});

type Phase = "idle" | "speaking" | "countdown" | "listening" | "feedback";

export default function HandsFreeHub() {
  const [, navigate] = useLocation();
  const { user, recordCorrect } = useUser();
  const [queueTerms, setQueueTerms] = useState(() => {
    const cleared = new Set(user?.clearedTermIds ?? []);
    const due = ALL_TERMS.filter(t => !cleared.has(t.id)).slice(0, 40);
    return due.length > 0 ? due : ALL_TERMS.slice(0, 40);
  });
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>("idle");
  const [countdown, setCountdown] = useState(2);
  const [feedback, setFeedback] = useState("");
  const [feedbackType, setFeedbackType] = useState<"ok" | "close" | "skip">("ok");
  const [micEnabled, setMicEnabled] = useState(false);
  const [micAvail] = useState(!!SpeechRecognitionAPI);
  const [heard, setHeard] = useState("");
  const recogRef = useRef<any>(null);
  const countRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const term = queueTerms[idx] ?? queueTerms[0];

  useEffect(() => () => { stopMetronome(); }, []);

  const speak = useCallback(() => {
    if (!term) return;
    setPhase("speaking");
    setFeedback("");
    setHeard("");
    speakTerm(term.term, 0.75, 1);
    const dur = Math.max(1200, term.term.length * 120);
    countRef.current = setTimeout(() => {
      setPhase("countdown");
      setCountdown(2);
      startMetronome(1, 60);
      let c = 2;
      const tick = setInterval(() => {
        c -= 1;
        setCountdown(c);
        if (c <= 0) {
          clearInterval(tick);
          stopMetronome();
          setPhase("listening");
          if (micEnabled && SpeechRecognitionAPI) startListening();
        }
      }, 1000);
    }, dur);
  }, [term, micEnabled]);

  const startListening = () => {
    const rec = new SpeechRecognitionAPI();
    recogRef.current = rec;
    rec.lang = "en-US";
    rec.interimResults = false;
    rec.maxAlternatives = 3;
    rec.onresult = (e: any) => {
      const results: string[] = [];
      for (let i = 0; i < e.results[0].length; i++) {
        results.push(e.results[0][i].transcript.trim().toLowerCase());
      }
      setHeard(results[0] ?? "");
      evaluateResponse(results);
    };
    rec.onerror = () => { setPhase("feedback"); setFeedback("Microphone error. Tap to continue."); setFeedbackType("skip"); };
    rec.onend = () => { if (phase === "listening") { setPhase("feedback"); setFeedback("Nothing heard. Continue manually."); setFeedbackType("skip"); } };
    rec.start();
  };

  const evaluateResponse = (results: string[]) => {
    if (!term) return;
    const target = term.term.toLowerCase().replace(/[^a-z0-9]/g, "");
    const close = results.some(r => {
      const clean = r.replace(/[^a-z0-9]/g, "");
      if (clean === target) return true;
      // Levenshtein-lite: allow 2-char difference
      let diff = 0;
      const a = clean, b = target;
      const maxLen = Math.max(a.length, b.length);
      for (let i = 0; i < maxLen; i++) { if (a[i] !== b[i]) diff++; }
      return diff <= 2 && Math.abs(a.length - b.length) <= 2;
    });
    const exact = results.some(r => r.replace(/[^a-z0-9]/g, "") === target);

    setPhase("feedback");
    if (exact) {
      setFeedback("Correct.");
      setFeedbackType("ok");
    } else if (close) {
      setFeedback(`Close. The accurate term is: ${term.term}. Notice the full pronunciation.`);
      setFeedbackType("close");
      speakTerm(term.term, 0.7, 0.9);
    } else {
      setFeedback(`The term is: ${term.term}`);
      setFeedbackType("skip");
      speakTerm(term.term, 0.7, 0.9);
    }
  };

  const next = () => {
    if (feedbackType === "ok" && term) recordCorrect(term.id);
    setIdx(i => (i + 1) % queueTerms.length);
    setPhase("idle");
    setFeedback("");
    setHeard("");
  };

  const tapManual = () => {
    if (phase !== "listening") return;
    if (recogRef.current) { try { recogRef.current.stop(); } catch {} }
    setPhase("feedback");
    setFeedback(`The term is: ${term?.term}. How did you do?`);
    setFeedbackType("skip");
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: BG, fontFamily: "'Inter','Plus Jakarta Sans',sans-serif", padding: "0" }}>
      <header style={{ backgroundColor: "rgba(0,0,0,0.3)", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${BORDER}` }}>
        <button onClick={() => navigate("/")} style={{ background: "none", border: "none", color: MUTED, cursor: "pointer", fontFamily: "inherit", fontSize: "0.9rem" }}>Back to Dashboard</button>
        <span style={{ color: TEXT, fontWeight: "800", fontSize: "1.1rem" }}>Hands-Free Vocabulary Hub</span>
        <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
          <span style={{ color: MUTED, fontSize: "0.82rem" }}>Mic</span>
          <div
            onClick={() => setMicEnabled(v => !v)}
            style={{ width: "38px", height: "22px", borderRadius: "11px", backgroundColor: micEnabled && micAvail ? ACCENT : "rgba(255,255,255,0.12)", transition: "background 0.2s", cursor: micAvail ? "pointer" : "default", position: "relative" }}
          >
            <div style={{ position: "absolute", top: "3px", left: micEnabled && micAvail ? "19px" : "3px", width: "16px", height: "16px", borderRadius: "50%", backgroundColor: TEXT, transition: "left 0.2s" }} />
          </div>
          {!micAvail && <span style={{ color: "rgba(252,250,247,0.3)", fontSize: "0.72rem" }}>unavailable</span>}
        </label>
      </header>

      <div style={{ maxWidth: "600px", margin: "0 auto", padding: "48px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: "28px" }}>
        <div style={{ color: MUTED, fontSize: "0.78rem", fontWeight: "700", letterSpacing: "0.08em", textTransform: "uppercase" }}>
          Term {idx + 1} of {queueTerms.length}
        </div>

        {/* Main card */}
        <div style={{ width: "100%", backgroundColor: CARD, border: `1px solid ${BORDER}`, borderRadius: "20px", padding: "40px 36px", textAlign: "center" }}>
          <div style={{ color: MUTED, fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "14px" }}>
            {term?.type} - {term?.system}
          </div>
          <div style={{ color: TEXT, fontSize: "2.2rem", fontWeight: "800", fontFamily: "monospace", marginBottom: "10px", letterSpacing: "0.02em" }}>
            {term?.term}
          </div>
          <div style={{ color: "rgba(252,250,247,0.55)", fontSize: "1rem", marginBottom: "6px" }}>{term?.meaning}</div>
          {phase === "feedback" && (
            <div style={{ marginTop: "18px", padding: "14px", borderRadius: "10px", backgroundColor: feedbackType === "ok" ? "rgba(60,130,80,0.15)" : feedbackType === "close" ? "rgba(200,150,50,0.15)" : "rgba(100,100,130,0.15)", border: `1px solid ${feedbackType === "ok" ? "rgba(80,160,100,0.3)" : feedbackType === "close" ? "rgba(200,150,50,0.3)" : "rgba(100,100,160,0.3)"}` }}>
              <div style={{ color: feedbackType === "ok" ? "#7aaa7a" : feedbackType === "close" ? "#d4aa60" : MUTED, fontSize: "0.9rem", lineHeight: 1.5 }}>{feedback}</div>
              {heard && <div style={{ color: "rgba(252,250,247,0.3)", fontSize: "0.78rem", marginTop: "6px" }}>You said: "{heard}"</div>}
            </div>
          )}
        </div>

        {/* 3-step loop display */}
        <div style={{ display: "flex", gap: "12px", width: "100%" }}>
          {[
            { label: "1. Listen", active: phase === "speaking" },
            { label: "2. Pause", active: phase === "countdown" },
            { label: "3. Repeat", active: phase === "listening" },
          ].map(s => (
            <div key={s.label} style={{ flex: 1, padding: "10px", borderRadius: "10px", border: `1px solid ${s.active ? "rgba(74,96,128,0.6)" : BORDER}`, backgroundColor: s.active ? "rgba(74,96,128,0.15)" : "transparent", textAlign: "center", transition: "all 0.2s" }}>
              <div style={{ color: s.active ? TEXT : MUTED, fontSize: "0.8rem", fontWeight: "700" }}>{s.label}</div>
              {s.label === "2. Pause" && phase === "countdown" && (
                <div style={{ color: ACCENT, fontWeight: "800", fontSize: "1.4rem", marginTop: "4px" }}>{countdown}</div>
              )}
            </div>
          ))}
        </div>

        {/* Controls */}
        <div style={{ display: "flex", gap: "12px", width: "100%", justifyContent: "center" }}>
          {phase === "idle" && (
            <button onClick={speak} style={btn(ACCENT)}>Play Term</button>
          )}
          {phase === "listening" && (
            <button onClick={tapManual} style={btn("rgba(255,255,255,0.08)")}>Tap to Self-Assess</button>
          )}
          {phase === "feedback" && (
            <>
              {feedbackType !== "ok" && (
                <button onClick={() => { setIdx(i => (i + 1) % queueTerms.length); setPhase("idle"); setFeedback(""); }} style={btn("rgba(255,255,255,0.08)")}>Skip</button>
              )}
              <button onClick={next} style={btn(ACCENT)}>{feedbackType === "ok" ? "Next Term" : "Got It"}</button>
            </>
          )}
          {(phase === "speaking" || phase === "countdown") && (
            <div style={{ color: MUTED, fontSize: "0.9rem", padding: "14px" }}>
              {phase === "speaking" ? "Listening..." : `Repeat in ${countdown}...`}
            </div>
          )}
        </div>

        <div style={{ color: "rgba(252,250,247,0.2)", fontSize: "0.78rem", textAlign: "center", lineHeight: 1.5 }}>
          The app speaks each term aloud, pauses 2 seconds, then listens for your response.
          {!micAvail && " Enable microphone in your browser for voice detection."}
        </div>
      </div>
    </div>
  );
}
