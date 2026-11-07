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

// Browsers block audio until a user gesture; call this from the first click.
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

// A seed lands without hitting a farmer and starts growing into a crop.
export function playPlant() {
  const audio = getContext();
  if (!audio) return;
  const t = audio.currentTime;
  tone(360, t, 0.12, { type: "sine", slideTo: 200, gain: 0.065 });
}

// A thrown seed hits a farmer directly: no plant, just instant pollen.
export function playDirectHit() {
  const audio = getContext();
  if (!audio) return;
  const t = audio.currentTime;
  tone(680, t, 0.08, { type: "triangle", slideTo: 940, gain: 0.08 });
  tone(1040, t + 0.035, 0.09, { type: "sine", gain: 0.05 });
}

// A grown crop is harvested; richer chime the more it had matured (0..1 quality).
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

// A farmer's pollen bar fills completely and they become an animal helper.
export function playTransform() {
  const audio = getContext();
  if (!audio) return;
  const t = audio.currentTime;
  [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) =>
    tone(freq, t + i * 0.07, 0.22, { type: "sine", gain: 0.055 }));
  tone(1568, t + 0.3, 0.32, { type: "sine", gain: 0.04, slideTo: 2093 });
}
