// One-shot generator for the four cue WAVs used by the runner audio engine.
// Run with: node scripts/generate-sounds.js
// Outputs under assets/sounds/.

const fs = require('fs');
const path = require('path');

const SR = 44100;
const dir = path.join(__dirname, '..', 'assets', 'sounds');
fs.mkdirSync(dir, { recursive: true });

function writeWav(name, samples) {
  const numSamples = samples.length;
  const byteLen = numSamples * 2;
  const buf = Buffer.alloc(44 + byteLen);
  buf.write('RIFF', 0);
  buf.writeUInt32LE(36 + byteLen, 4);
  buf.write('WAVE', 8);
  buf.write('fmt ', 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(SR, 24);
  buf.writeUInt32LE(SR * 2, 28);
  buf.writeUInt16LE(2, 32);
  buf.writeUInt16LE(16, 34);
  buf.write('data', 36);
  buf.writeUInt32LE(byteLen, 40);
  for (let i = 0; i < numSamples; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    buf.writeInt16LE(Math.round(s * 32767), 44 + i * 2);
  }
  const out = path.join(dir, name);
  fs.writeFileSync(out, buf);
  console.log(name + '  ' + buf.length + ' bytes');
}

// Linear attack / sustain / linear release envelope to avoid clicks.
function env(t, dur, attack, release) {
  if (t < attack) return t / attack;
  const relStart = dur - release;
  if (t > relStart) return Math.max(0, 1 - (t - relStart) / release);
  return 1;
}

function tone(freq, durSec, gain) {
  const n = Math.round(durSec * SR);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    out[i] = Math.sin(2 * Math.PI * freq * t) * env(t, durSec, 0.005, 0.04) * gain;
  }
  return out;
}

function arpeggio(freqs, stepDur, gain) {
  const n = Math.round(freqs.length * stepDur * SR);
  const out = new Float32Array(n);
  for (let s = 0; s < freqs.length; s++) {
    const start = Math.round(s * stepDur * SR);
    const end = Math.round((s + 1) * stepDur * SR);
    for (let i = start; i < end; i++) {
      const tLocal = (i - start) / SR;
      const e = env(tLocal, stepDur, 0.005, 0.06);
      out[i] = Math.sin(2 * Math.PI * freqs[s] * tLocal) * e * gain;
    }
  }
  return out;
}

// 1) tick — 880 Hz, 120 ms, the 3/2/1 countdown beep
writeWav('tick.wav', tone(880, 0.12, 0.6));

// 2) go — bright 1200 Hz, 250 ms, when work starts
writeWav('go.wav', tone(1200, 0.25, 0.7));

// 3) rest — mellow 600 Hz, 250 ms, when rest starts
writeWav('rest.wav', tone(600, 0.25, 0.6));

// 4) complete — ascending arpeggio at workout end
writeWav('complete.wav', arpeggio([660, 880, 1320], 0.22, 0.7));
