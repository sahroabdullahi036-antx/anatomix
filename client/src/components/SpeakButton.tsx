import { useState } from "react";
import { useSpeech } from "@/hooks/useSpeech";

interface SpeakButtonProps {
  text: string;
  style?: React.CSSProperties;
  size?: "sm" | "md";
}

export function SpeakButton({ text, style, size = "md" }: SpeakButtonProps) {
  const { speak } = useSpeech();
  const [active, setActive] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActive(true);
    speak(text);
    setTimeout(() => setActive(false), 900);
  };

  const pad = size === "sm" ? "3px 7px" : "5px 11px";
  const fs = size === "sm" ? "0.75rem" : "0.88rem";

  return (
    <button
      onClick={handleClick}
      title={`Pronounce: "${text}"`}
      style={{
        background: active ? "rgba(100,160,240,0.25)" : "rgba(255,255,255,0.08)",
        border: `1px solid ${active ? "rgba(100,160,240,0.5)" : "rgba(252,250,247,0.13)"}`,
        borderRadius: "6px",
        padding: pad,
        cursor: "pointer",
        color: active ? "#a0c8f8" : "rgba(252,250,247,0.65)",
        fontSize: fs,
        lineHeight: 1,
        transition: "all 0.18s",
        fontFamily: "inherit",
        flexShrink: 0,
        ...style,
      }}
    >
      {active ? "♪" : "▶"}
    </button>
  );
}
