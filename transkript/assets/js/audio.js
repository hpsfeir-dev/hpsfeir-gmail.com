/* Audio einlesen: Datei -> Mono-Float32 mit 16 kHz, so wie Whisper es erwartet. */

export const TARGET_SR = 16000;

/**
 * Dekodiert eine Audiodatei und gibt Mono-Samples mit 16 kHz zurück.
 * @param {File|Blob} file
 * @returns {Promise<{samples: Float32Array, duration: number}>}
 */
export async function decodeToMono16k(file) {
  const bytes = await file.arrayBuffer();
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) throw new Error('Dieser Browser kann kein Audio dekodieren (keine Web-Audio-Unterstützung).');

  // Bevorzugt: den Browser direkt auf 16 kHz dekodieren lassen — das macht
  // sauberes Resampling inklusive Tiefpass.
  let buffer = await decodeWith(AC, bytes, TARGET_SR);
  if (!buffer) buffer = await decodeWith(AC, bytes, null); // ältere Safaris mögen 16 kHz nicht
  if (!buffer) throw new Error('Format nicht lesbar. Probier es mit MP3, M4A, WAV, OGG oder FLAC.');

  let samples = downmix(buffer);
  if (Math.round(buffer.sampleRate) !== TARGET_SR) {
    samples = resampleLinear(samples, buffer.sampleRate, TARGET_SR);
  }
  return { samples, duration: samples.length / TARGET_SR };
}

async function decodeWith(AC, bytes, sampleRate) {
  let ctx;
  try {
    ctx = sampleRate ? new AC({ sampleRate }) : new AC();
    // decodeAudioData verbraucht den Puffer in manchen Browsern -> Kopie schicken.
    return await ctx.decodeAudioData(bytes.slice(0));
  } catch {
    return null;
  } finally {
    try { await ctx?.close(); } catch { /* schon geschlossen */ }
  }
}

/** Alle Kanäle zu einem mischen (Stereo wird dabei leicht angehoben). */
function downmix(buffer) {
  const n = buffer.numberOfChannels;
  if (n === 1) return buffer.getChannelData(0).slice();

  const channels = [];
  for (let c = 0; c < n; c++) channels.push(buffer.getChannelData(c));

  const gain = Math.SQRT2 / n;           // gleicht die Mittelung hörbar aus
  const out = new Float32Array(buffer.length);
  for (let i = 0; i < out.length; i++) {
    let sum = 0;
    for (let c = 0; c < n; c++) sum += channels[c][i];
    const v = sum * gain;
    out[i] = v > 1 ? 1 : v < -1 ? -1 : v;
  }
  return out;
}

/** Notnagel-Resampling, falls der Browser nicht direkt auf 16 kHz dekodiert. */
function resampleLinear(input, fromRate, toRate) {
  const ratio = fromRate / toRate;
  const length = Math.round(input.length / ratio);
  const out = new Float32Array(length);
  for (let i = 0; i < length; i++) {
    const pos = i * ratio;
    const idx = Math.floor(pos);
    const frac = pos - idx;
    const a = input[idx] ?? 0;
    const b = input[idx + 1] ?? a;
    out[i] = a + (b - a) * frac;
  }
  return out;
}
