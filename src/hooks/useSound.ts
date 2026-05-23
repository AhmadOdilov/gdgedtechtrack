import { useCallback } from "react";

export type SoundName = "click" | "scan" | "success" | "reward" | "error" | "pop";

let ctx: AudioContext | null = null;
function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AC = window.AudioContext || (window as any).webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  return ctx;
}

function tone(ac: AudioContext, freq: number, start: number, dur: number, type: OscillatorType, gain = 0.07) {
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ac.currentTime + start);
  g.gain.setValueAtTime(0.0001, ac.currentTime + start);
  g.gain.exponentialRampToValueAtTime(gain, ac.currentTime + start + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + start + dur);
  osc.connect(g).connect(ac.destination);
  osc.start(ac.currentTime + start);
  osc.stop(ac.currentTime + start + dur + 0.02);
}

const RECIPES: Record<SoundName, (ac: AudioContext) => void> = {
  click: (ac) => tone(ac, 420, 0, 0.08, "triangle", 0.05),
  pop: (ac) => tone(ac, 660, 0, 0.1, "sine", 0.06),
  scan: (ac) => {
    tone(ac, 300, 0, 0.5, "sawtooth", 0.03);
    tone(ac, 900, 0, 0.5, "sine", 0.02);
  },
  error: (ac) => {
    tone(ac, 200, 0, 0.18, "square", 0.05);
    tone(ac, 150, 0.12, 0.2, "square", 0.05);
  },
  success: (ac) => {
    [523, 659, 784].forEach((f, i) => tone(ac, f, i * 0.1, 0.18, "triangle", 0.06));
  },
  reward: (ac) => {
    [523, 659, 784, 1046].forEach((f, i) => tone(ac, f, i * 0.11, 0.22, "sine", 0.07));
  },
};

/** Returns a memoised play() that synthesises short UI sounds on demand. */
export function useSound() {
  const play = useCallback((name: SoundName) => {
    try {
      const ac = audio();
      if (ac) RECIPES[name](ac);
    } catch {
      /* audio not available — ignore */
    }
  }, []);
  return play;
}
