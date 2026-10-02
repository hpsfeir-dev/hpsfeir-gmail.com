/* Audio einlesen: Datei -> Mono-Float32 mit 16 kHz, so wie Whisper es erwartet. */

export const TARGET_SR = 16000;

/**
 * Dekodiert eine Audiodatei und gibt Mono-Samples mit 16 kHz zurück.
 *
 * @param {File|Blob} file
 * @param {Object} [opts]
 * @param {(info: {stage: string, current?: number, total?: number}) => void} [opts.onStatus]
 *   Wird während des langsamen Wiedergabe-Fallbacks mit Fortschritt aufgerufen.
 * @param {AbortSignal} [opts.signal] Bricht den (evtl. langen) Fallback sauber ab.
 * @returns {Promise<{samples: Float32Array, duration: number}>}
 */
export async function decodeToMono16k(file, { onStatus, signal } = {}) {
  const bytes = await file.arrayBuffer();
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) throw new Error('Dieser Browser kann kein Audio dekodieren (keine Web-Audio-Unterstützung).');

  // Bevorzugt: den Browser direkt auf 16 kHz dekodieren lassen — das macht
  // sauberes Resampling inklusive Tiefpass.
  let buffer = await decodeWith(AC, bytes, TARGET_SR);
  if (!buffer) buffer = await decodeWith(AC, bytes, null); // ältere Safaris mögen 16 kHz nicht

  if (buffer) {
    let samples = downmix(buffer);
    if (Math.round(buffer.sampleRate) !== TARGET_SR) {
      samples = resampleLinear(samples, buffer.sampleRate, TARGET_SR);
    }
    return { samples, duration: samples.length / TARGET_SR };
  }

  throwIfAborted(signal);

  // Manche M4A/AAC-Dateien (vor allem aus Diktiergeräte-Apps: mono, niedrige
  // Bitrate) lehnt decodeAudioData ab, obwohl der Browser sie ganz normal
  // abspielen kann — ein bekanntes Verhalten von Chrome bei bestimmten
  // AAC-Profilen. Als Notweg lesen wir die Datei dann über ein verstecktes
  // <audio>-Element in Echtzeit mit, statt sie roh zu dekodieren.
  onStatus?.({ stage: 'fallback-start' });
  const captured = await captureViaPlayback(file, { onStatus, signal });
  if (captured) return captured;

  throw new Error('Format nicht lesbar. Probier es mit MP3, M4A, WAV, OGG oder FLAC.');
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

function throwIfAborted(signal) {
  if (signal?.aborted) throw Object.assign(new Error('Abgebrochen'), { name: 'AbortError' });
}

/**
 * Notweg für Dateien, die decodeAudioData ablehnt, das Audioelement aber
 * abspielen kann: über ein verstecktes <audio> mitschneiden. Läuft in
 * Echtzeit (dauert also so lange wie die Aufnahme) — es gibt dafür keine
 * schnellere Standardmethode im Browser ohne zusätzliche Bibliotheken.
 */
async function captureViaPlayback(file, { onStatus, signal } = {}) {
  throwIfAborted(signal);

  const AC = window.AudioContext || window.webkitAudioContext;
  const url = URL.createObjectURL(file);
  const el = document.createElement('audio');
  el.src = url;
  // Absichtlich NICHT stummgeschaltet: Chrome liefert für ein stummes oder auf
  // Lautstärke 0 gestelltes Element auch über den WebAudio-Abzweig nur Nullen
  // (getestet) — echte Stille kommt unten allein vom Gain-Knoten vor destination.
  el.preload = 'auto';
  el.style.cssText = 'position:fixed;width:0;height:0;opacity:0;pointer-events:none;';
  document.body.appendChild(el);

  let ctx;
  let aborted = false;
  const onAbort = () => { aborted = true; try { el.pause(); } catch { /* egal */ } };
  signal?.addEventListener('abort', onAbort);

  // cleanup() kann bei Abbruch zweimal aufgerufen werden (einmal explizit nach
  // dem Capture-Ende, einmal im catch) -> close() ist idempotent zu halten,
  // sonst wirft ein zweiter Aufruf eine unbehandelte Promise-Ablehnung.
  const cleanup = () => {
    signal?.removeEventListener('abort', onAbort);
    try { el.pause(); } catch { /* egal */ }
    el.remove();
    URL.revokeObjectURL(url);
    if (ctx && ctx.state !== 'closed') ctx.close().catch(() => { /* egal */ });
  };

  try {
    await new Promise((resolve, reject) => {
      el.addEventListener('loadedmetadata', resolve, { once: true });
      el.addEventListener('error', () => reject(el.error || new Error('Wiedergabe nicht möglich')), { once: true });
    });
    if (aborted) throw Object.assign(new Error('Abgebrochen'), { name: 'AbortError' });

    const duration = el.duration;
    if (!Number.isFinite(duration) || duration <= 0) { cleanup(); return null; }

    ctx = new AC();
    const nativeRate = ctx.sampleRate;
    // Etwas Puffer über die gemeldete Dauer hinaus gegen Rundungsfehler.
    const out = new Float32Array(Math.ceil(duration * nativeRate) + nativeRate);
    let writePos = 0;
    let mixMode = null; // 'mono' | 'stereo' — von den ersten Samples entschieden

    const source = ctx.createMediaElementSource(el);
    const processor = ctx.createScriptProcessor(4096, 2, 2);
    const silence = ctx.createGain();
    silence.gain.value = 0; // Graph muss bis destination führen, aber lautlos bleiben

    let lastSent = 0;
    processor.onaudioprocess = (ev) => {
      if (aborted || writePos >= out.length) return;
      const inp = ev.inputBuffer;
      const L = inp.getChannelData(0);
      const R = inp.getChannelData(1);

      if (mixMode === null) {
        // WebAudio verdoppelt einen Mono-Quellkanal beim Hochmischen exakt —
        // sind beide Kanäle identisch, war die Quelle mono.
        const mid = Math.floor(L.length / 2);
        mixMode = (L[0] === R[0] && L[mid] === R[mid]) ? 'mono' : 'stereo';
      }

      const n = Math.min(L.length, out.length - writePos);
      if (mixMode === 'mono') {
        out.set(L.subarray(0, n), writePos);
      } else {
        const gain = Math.SQRT1_2;
        for (let i = 0; i < n; i++) {
          const v = (L[i] + R[i]) * gain;
          out[writePos + i] = v > 1 ? 1 : v < -1 ? -1 : v;
        }
      }
      writePos += n;

      const now = Date.now();
      if (now - lastSent >= 200) {
        lastSent = now;
        onStatus?.({ stage: 'fallback-progress', current: el.currentTime, total: duration });
      }
    };

    source.connect(processor);
    processor.connect(silence);
    silence.connect(ctx.destination);

    await el.play();
    await new Promise((resolve) => {
      let done = false;
      const finish = () => { if (done) return; done = true; clearInterval(guard); resolve(); };
      el.addEventListener('ended', finish, { once: true });
      // Manche Container feuern 'ended' nicht zuverlässig -> Sicherheitsnetz.
      const guard = setInterval(() => {
        if (aborted || el.ended || el.currentTime >= duration - 0.05) finish();
      }, 200);
    });

    processor.disconnect();
    source.disconnect();
    silence.disconnect();
    cleanup();

    if (aborted) throw Object.assign(new Error('Abgebrochen'), { name: 'AbortError' });
    if (writePos === 0) return null;

    const trimmed = out.subarray(0, writePos);
    const samples = Math.round(nativeRate) === TARGET_SR
      ? trimmed.slice()
      : resampleLinear(trimmed, nativeRate, TARGET_SR);
    return { samples, duration: samples.length / TARGET_SR };
  } catch (err) {
    cleanup();
    if (err?.name === 'AbortError') throw err;
    return null;
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
