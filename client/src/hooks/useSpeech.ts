import { useCallback, useRef } from "react";

export function useSpeech() {
  const voicesLoaded = useRef(false);

  const getVoice = (): SpeechSynthesisVoice | null => {
    const voices = window.speechSynthesis.getVoices();
    return (
      voices.find(v => v.lang === "en-US" && v.localService) ??
      voices.find(v => v.lang.startsWith("en-US")) ??
      voices.find(v => v.lang.startsWith("en")) ??
      null
    );
  };

  const speak = useCallback((text: string, rate = 0.82) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    const doSpeak = () => {
      const u = new SpeechSynthesisUtterance(text);
      u.rate = rate;
      u.pitch = 1.0;
      const voice = getVoice();
      if (voice) u.voice = voice;
      window.speechSynthesis.speak(u);
    };

    if (!voicesLoaded.current) {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        voicesLoaded.current = true;
        doSpeak();
      } else {
        window.speechSynthesis.onvoiceschanged = () => {
          voicesLoaded.current = true;
          doSpeak();
        };
      }
    } else {
      doSpeak();
    }
  }, []);

  return { speak };
}
