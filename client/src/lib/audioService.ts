// Web Audio API service - all sounds generated locally, no external files

import { pronounce } from "./pronunciation";

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

// ── Speech (text-to-speech) ─────────────────────────────────
// Pick the most natural-sounding English voice the device offers. Quality
// varies by OS/browser, so we prefer known high-quality neural voices and fall
// back gracefully.
let preferredVoice: SpeechSynthesisVoice | null = null;
let voiceResolved = false;

const VOICE_PREFERENCES = [
  "google us english",
  "microsoft aria",
  "microsoft jenny",
  "microsoft michelle",
  "microsoft ana",
  "microsoft guy",
  "samantha",
  "karen",
  "moira",
  "tessa",
  "google uk english female",
  "microsoft zira",
  "fiona",
  "daniel",
];

function selectVoice() {
  if (!("speechSynthesis" in window)) return;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return;
  const en = voices.filter((v) => /^en[-_]?/i.test(v.lang));
  for (const pref of VOICE_PREFERENCES) {
    const match = en.find((v) => v.name.toLowerCase().includes(pref));
    if (match) {
      preferredVoice = match;
      voiceResolved = true;
      return;
    }
  }
  // Fallbacks: any local en-US, then any English, then anything.
  preferredVoice =
    en.find((v) => /en[-_]?us/i.test(v.lang) && v.localService) ||
    en.find((v) => /en[-_]?us/i.test(v.lang)) ||
    en[0] ||
    voices[0] ||
    null;
  voiceResolved = true;
}

if (typeof window !== "undefined" && "speechSynthesis" in window) {
  selectVoice();
  window.speechSynthesis.onvoiceschanged = selectVoice;
}

function speakSynth(text: string, rate: number, volume: number): Promise<void> {
  return new Promise((resolve) => {
    if (!("speechSynthesis" in window) || !text) { resolve(); return; }
    if (!voiceResolved) selectVoice();
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US";
    if (preferredVoice) u.voice = preferredVoice;
    u.rate = rate;
    u.volume = volume;
    u.pitch = 1;
    u.onend = () => resolve();
    u.onerror = () => resolve();
    window.speechSynthesis.speak(u);
  });
}

// ── Speaking a term (one consistent free voice) ─────────────
// Every term is spoken with the SAME voice: Google Translate's free TTS
// endpoint (no key, human-sounding, covers any current or future word). It is
// played via an <audio> element (no fetch), so cross-origin is fine and the
// user gesture is preserved. If the network blocks it, we fall back to the
// built-in SpeechSynthesis voice via the medical respelling engine (offline).
let currentAudio: HTMLAudioElement | null = null;
let playToken = 0;

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

function haltPlayback() {
  if (currentAudio) { try { currentAudio.pause(); } catch {} currentAudio = null; }
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
}

// Stop any in-progress speech or clip playback and supersede pending requests.
export function stopSpeech() {
  playToken++;
  haltPlayback();
}

// Clean a single name into something the TTS engine reads naturally.
function cleanName(s: string): string {
  return s
    .toLowerCase()
    .replace(/\([^)]*\)/g, " ") // drop parentheticals
    .replace(/-/g, " ")          // "-itis" -> " itis", "hyper-" -> "hyper"
    .replace(/\//g, "")          // combining form "cardi/o" -> "cardio"
    .replace(/\s+/g, " ")
    .trim();
}

// A card's term may list several names ("a-, an-", "ex-, exo-"). Read them all.
function termNames(term: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const part of term.split(",")) {
    const name = cleanName(part);
    if (name && !seen.has(name)) { seen.add(name); out.push(name); }
  }
  return out;
}

// Google Translate's free TTS endpoint for one already-cleaned name.
function googleTtsUrl(name: string): string | null {
  if (!name || name.length > 180) return null;
  return `https://translate.google.com/translate_tts?ie=UTF-8&tl=en&client=tw-ob&q=${encodeURIComponent(name)}`;
}

function playClip(url: string, volume: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const audio = new Audio(url);
    audio.volume = volume;
    currentAudio = audio;
    audio.onended = () => { if (currentAudio === audio) currentAudio = null; resolve(); };
    audio.onerror = () => { if (currentAudio === audio) currentAudio = null; reject(new Error("audio")); };
    audio.play().catch(reject);
  });
}

// Warm the Google TTS clip for the first name of a term so the next play is
// instant (e.g. the next card in a queue). Best-effort; ignores failures.
export function prefetchTerm(text: string) {
  const name = termNames(text)[0];
  const url = name ? googleTtsUrl(name) : null;
  if (!url) return;
  try { const a = new Audio(); a.preload = "auto"; a.src = url; a.load(); } catch {}
}

// Speak one name: the consistent Google voice first, offline synth as fallback.
async function speakName(name: string, rate: number, volume: number, token: number): Promise<void> {
  const url = googleTtsUrl(name);
  if (url) {
    if (token !== playToken) return;
    try { await playClip(url, volume); return; }
    catch { /* blocked/offline - fall through to the built-in voice */ }
  }
  if (token !== playToken) return;
  await speakSynth(pronounce(name), rate, volume);
}

// Speak a medical term with one consistent voice. Cards listing multiple names
// ("a-, an-") read every name in order. Resolves when playback finishes so
// callers can sequence after it; a monotonic token supersedes older requests.
export async function speakTerm(text: string, rate = 0.8, volume = 1): Promise<void> {
  if (!text) return;
  const token = ++playToken;
  haltPlayback();
  const names = termNames(text);
  for (let i = 0; i < names.length; i++) {
    if (token !== playToken) return;
    await speakName(names[i], rate, volume, token);
    if (token !== playToken) return;
    if (i < names.length - 1) await delay(250); // brief gap between names
  }
}

// Speak plain text verbatim (no medical respelling) with the chosen voice.
export async function speak(text: string, rate = 0.95, volume = 1): Promise<void> {
  ++playToken;
  haltPlayback();
  await speakSynth(text, rate, volume);
}
