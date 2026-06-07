// Web Audio API service — all sounds generated locally, no external files

let ctx: AudioContext | null = null;
let droneNode: OscillatorNode | null = null;
let droneGain: GainNode | null = null;
let metroInterval: ReturnType<typeof setInterval> | null = null;

function getCtx(): AudioContext {
  if (!ctx) ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  return ctx;
}

function levelToGain(level: 0 | 1 | 2 | 3): number {
  return [0, 0.33, 0.66, 1.0][level];
}

export function playClickSound(level: 0 | 1 | 2 | 3 = 2) {
  if (level === 0) return;
  const ac = getCtx();
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.connect(gain);
  gain.connect(ac.destination);
  osc.type = "sine";
  osc.frequency.setValueAtTime(880, ac.currentTime);
  osc.frequency.exponentialRampToValueAtTime(440, ac.currentTime + 0.05);
  gain.gain.setValueAtTime(levelToGain(level) * 0.18, ac.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.12);
  osc.start(ac.currentTime);
  osc.stop(ac.currentTime + 0.12);
}

export function playCorrectSound(volumeLevel: 0 | 1 | 2 | 3 = 2) {
  if (volumeLevel === 0) return;
  const ac = getCtx();
  const vol = levelToGain(volumeLevel) * 0.22;
  [[523.25, 0], [659.25, 0.1], [783.99, 0.2]].forEach(([freq, delay]) => {
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, ac.currentTime + delay);
    gain.gain.setValueAtTime(vol, ac.currentTime + delay);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + delay + 0.3);
    osc.start(ac.currentTime + delay);
    osc.stop(ac.currentTime + delay + 0.35);
  });
}

export function playWrongSound(volumeLevel: 0 | 1 | 2 | 3 = 2) {
  if (volumeLevel === 0) return;
  const ac = getCtx();
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.connect(gain);
  gain.connect(ac.destination);
  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(220, ac.currentTime);
  osc.frequency.exponentialRampToValueAtTime(110, ac.currentTime + 0.25);
  gain.gain.setValueAtTime(levelToGain(volumeLevel) * 0.15, ac.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.3);
  osc.start(ac.currentTime);
  osc.stop(ac.currentTime + 0.3);
}

export function startAmbientDrone(level: 0 | 1 | 2 | 3) {
  stopAmbientDrone();
  if (level === 0) return;
  const ac = getCtx();
  droneGain = ac.createGain();
  droneGain.gain.setValueAtTime(0, ac.currentTime);
  droneGain.gain.linearRampToValueAtTime(levelToGain(level) * 0.06, ac.currentTime + 2);
  droneGain.connect(ac.destination);
  droneNode = ac.createOscillator();
  droneNode.type = "sine";
  droneNode.frequency.setValueAtTime(55, ac.currentTime);
  droneNode.connect(droneGain);
  droneNode.start();
  // Add subtle overtone
  const osc2 = ac.createOscillator();
  const g2 = ac.createGain();
  osc2.type = "sine";
  osc2.frequency.setValueAtTime(110, ac.currentTime);
  g2.gain.setValueAtTime(levelToGain(level) * 0.02, ac.currentTime);
  osc2.connect(g2);
  g2.connect(ac.destination);
  osc2.start();
}

export function stopAmbientDrone() {
  if (droneNode) { try { droneNode.stop(); } catch {} droneNode = null; }
  if (droneGain) { droneGain.disconnect(); droneGain = null; }
}

export function startMetronome(level: 0 | 1 | 2 | 3, bpm = 60) {
  stopMetronome();
  if (level === 0) return;
  const ms = (60 / bpm) * 1000;
  const tick = () => {
    const ac = getCtx();
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(1000, ac.currentTime);
    gain.gain.setValueAtTime(levelToGain(level) * 0.12, ac.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.04);
    osc.start(ac.currentTime);
    osc.stop(ac.currentTime + 0.05);
  };
  tick();
  metroInterval = setInterval(tick, ms);
}

export function stopMetronome() {
  if (metroInterval) { clearInterval(metroInterval); metroInterval = null; }
}

export function stopAll() {
  stopAmbientDrone();
  stopMetronome();
}

export function speakTerm(text: string, rate = 0.8, volume = 1) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.rate = rate;
  utter.volume = volume;
  window.speechSynthesis.speak(utter);
}
