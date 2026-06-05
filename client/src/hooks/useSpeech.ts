import { useCallback } from "react";

// Singleton voice cache so all SpeakButtons share the same loaded state
let _voices: SpeechSynthesisVoice[] = [];
let _voicesReady = false;

function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise(resolve => {
    if (!("speechSynthesis" in window)) { resolve([]); return; }
    const v = window.speechSynthesis.getVoices();
    if (v.length > 0) { _voices = v; _voicesReady = true; resolve(v); return; }
    const handler = () => {
      _voices = window.speechSynthesis.getVoices();
      _voicesReady = true;
      window.speechSynthesis.removeEventListener("voiceschanged", handler);
      resolve(_voices);
    };
    window.speechSynthesis.addEventListener("voiceschanged", handler);
    // Fallback: if event never fires, speak anyway after 400ms
    setTimeout(() => { if (!_voicesReady) { _voicesReady = true; resolve([]); } }, 400);
  });
}

export function useSpeech() {
  const speak = useCallback(async (text: string, rate = 0.84) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();

    const voices = _voicesReady ? _voices : await loadVoices();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = rate;
    u.pitch = 1.0;
    u.lang = "en-US";

    const preferred =
      voices.find(v => v.lang === "en-US" && v.localService) ??
      voices.find(v => v.lang.startsWith("en-US")) ??
      voices.find(v => v.lang.startsWith("en")) ??
      null;
    if (preferred) u.voice = preferred;

    window.speechSynthesis.speak(u);
  }, []);

  return { speak };
}
