// Tiny procedural sound effects, synthesized live with the Web Audio API.
// No external audio files are used — everything here is original, generated code,
// consistent with the rest of the prototype.

let ctx = null;

function getContext() {
  if (!ctx) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    ctx = new AudioCtx();
  }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

export function unlockAudio() {
  getContext();
}

function tone(freq, start, duration, { type = "sine", gain = 0.08, slideTo = null } = {}) {
  const audio = getContext();
  if (!audio) return;
  const osc = audio.createOscillator();
  const amp = audio.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, start + duration);
  amp.gain.setValueAtTime(0.0001, start);
  amp.gain.exponentialRampToValueAtTime(gain, start + Math.min(0.02, duration * 0.3));
  amp.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(amp).connect(audio.destination);
  osc.start(start);
  osc.stop(start + duration + 0.03);
}

export function playPlant() {
  const audio = getContext();
  if (!audio) return;
  const t = audio.currentTime;
  tone(360, t, 0.12, { type: "sine", slideTo: 200, gain: 0.065 });
}

export function playDirectHit() {
  const audio = getContext();
  if (!audio) return;
  const t = audio.currentTime;
  tone(680, t, 0.08, { type: "triangle", slideTo: 940, gain: 0.08 });
  tone(1040, t + 0.035, 0.09, { type: "sine", gain: 0.05 });
}

export function playHarvest(quality = 1) {
  const audio = getContext();
  if (!audio) return;
  const t = audio.currentTime;
  const notes = quality > 0.75
    ? [392, 523.25, 659.25, 784]
    : quality > 0.45
      ? [392, 523.25, 659.25]
      : [392, 493.88];
  notes.forEach((freq, i) => tone(freq, t + i * 0.045, 0.14, { type: "triangle", gain: 0.06 }));
}

export function playTransform() {
  const audio = getContext();
  if (!audio) return;
  const t = audio.currentTime;
  [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) =>
    tone(freq, t + i * 0.07, 0.22, { type: "sine", gain: 0.055 }));
  tone(1568, t + 0.3, 0.32, { type: "sine", gain: 0.04, slideTo: 2093 });
}

// --- Weapon firing sounds ---

export function playCornShot() {
  const audio = getContext();
  if (!audio) return;
  const t = audio.currentTime;
  // Deep boom + scattered pellets
  tone(180, t, 0.12, { type: "square", gain: 0.09, slideTo: 90 });
  tone(320, t + 0.02, 0.1, { type: "triangle", gain: 0.06 });
  tone(620, t + 0.04, 0.06, { type: "sawtooth", gain: 0.03, slideTo: 400 });
}

export function playSunflowerShot() {
  const audio = getContext();
  if (!audio) return;
  const t = audio.currentTime;
  // Sharp crack + high tail
  tone(1200, t, 0.05, { type: "sawtooth", gain: 0.08, slideTo: 400 });
  tone(800, t + 0.02, 0.07, { type: "triangle", gain: 0.05 });
  tone(1600, t + 0.04, 0.15, { type: "sine", gain: 0.02, slideTo: 2200 });
}

export function playPumpkinShot() {
  const audio = getContext();
  if (!audio) return;
  const t = audio.currentTime;
  // Heavy thump + whoosh
  tone(90, t, 0.22, { type: "sine", gain: 0.11, slideTo: 35 });
  tone(220, t + 0.05, 0.18, { type: "triangle", gain: 0.07, slideTo: 110 });
  tone(440, t + 0.1, 0.12, { type: "sawtooth", gain: 0.03, slideTo: 200 });
}

// --- Improved mechanical reload: clicks, slide, final lock ---

export function playReload() {
  const audio = getContext();
  if (!audio) return;
  const t = audio.currentTime;
  // First click (release)
  tone(200, t, 0.035, { type: "square", gain: 0.07 });
  tone(480, t + 0.04, 0.03, { type: "square", gain: 0.05 });
  // Slide / insertion sound
  tone(320, t + 0.15, 0.08, { type: "triangle", gain: 0.055, slideTo: 520 });
  // Lock click
  tone(680, t + 0.32, 0.045, { type: "square", gain: 0.07 });
  tone(920, t + 0.37, 0.04, { type: "sine", gain: 0.04 });
    }
