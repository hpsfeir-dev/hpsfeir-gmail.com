/* Der Worker macht die eigentliche Arbeit: Modell laden, Audio erkennen.
   Er läuft in einem eigenen Thread, damit die Oberfläche flüssig bleibt. */

import { CDN_URLS, dtypeFor, CHUNK_LENGTH_S, STRIDE_LENGTH_S } from './config.js';

let lib = null;          // die geladene Bibliothek
let current = null;      // { key, transcriber }

/** Transformers.js nachladen — erst jsDelivr, sonst unpkg. */
async function loadLib() {
  if (lib) return lib;
  let lastError;
  for (const url of CDN_URLS) {
    try {
      lib = await import(url);
      lib.env.allowLocalModels = false;   // alles kommt vom Hugging-Face-Hub
      lib.env.useBrowserCache = true;     // …und bleibt danach im Browser liegen
      mirrorWasmPaths(lib, url);
      return lib;
    } catch (err) {
      lastError = err;
    }
  }
  throw new Error(
    'Die Spracherkennung konnte nicht geladen werden. Besteht eine Internetverbindung? ' +
    `(${lastError?.message || lastError})`,
  );
}

/**
 * Die Rechenkerne (WebAssembly) holt onnxruntime-web sonst immer von jsDelivr.
 * Sind wir auf den Ersatz-CDN ausgewichen, ziehen wir sie von dort nach.
 */
function mirrorWasmPaths(mod, usedUrl) {
  try {
    const paths = mod.env?.backends?.onnx?.wasm?.wasmPaths;
    if (!paths || typeof paths !== 'object') return;
    const host = new URL(usedUrl, self.location.href).origin + '/';
    if (host === 'https://cdn.jsdelivr.net/') return;
    for (const key of Object.keys(paths)) {
      paths[key] = String(paths[key]).replace('https://cdn.jsdelivr.net/npm/', host);
    }
  } catch {
    // Dann bleibt es beim Standardpfad — kein Grund, hier auszusteigen.
  }
}

/** Pipeline holen; nur neu bauen, wenn sich Modell oder Rechenweg ändern. */
async function getTranscriber(model, device) {
  const key = `${model}::${device}`;
  if (current?.key === key) return current.transcriber;

  const { pipeline } = await loadLib();
  try { await current?.transcriber?.dispose?.(); } catch { /* egal */ }
  current = null;

  post({ type: 'load-start', model, device });

  let started = 0;
  let finished = 0;

  const transcriber = await pipeline('automatic-speech-recognition', model, {
    device,
    dtype: dtypeFor(model, device),
    progress_callback: (info) => {
      if (info.status === 'initiate') {
        started++;
        post({ type: 'load-files', started, finished });
      } else if (info.status === 'done') {
        finished++;
        post({ type: 'load-files', started, finished });
      } else if (info.status === 'progress_total') {
        post({
          type: 'load-progress',
          progress: info.progress ?? 0,
          loaded: info.loaded ?? 0,
          total: info.total ?? 0,
        });
      }
    },
  });

  current = { key, transcriber };
  post({ type: 'load-done' });
  return transcriber;
}

/**
 * Live-Vorschau: Whisper gibt zwischen den Wörtern Zeitmarken aus — daran
 * hängen wir den Text auf und schätzen daraus den Fortschritt.
 */
function makeStreamer(WhisperTextStreamer, tokenizer, time_precision, duration) {
  const state = { chunkCount: 0, live: [], lastSent: 0 };

  const flush = (force) => {
    const now = Date.now();
    if (!force && now - state.lastSent < 120) return;
    state.lastSent = now;
    const seen = state.live.length ? state.live[state.live.length - 1].start : 0;
    post({
      type: 'stream',
      text: state.live.map((c) => c.text).join('').trim(),
      progress: duration > 0 ? Math.min(99, (seen / duration) * 100) : 0,
    });
  };

  return new WhisperTextStreamer(tokenizer, {
    time_precision,
    on_chunk_start: (t) => {
      const offset = (CHUNK_LENGTH_S - STRIDE_LENGTH_S) * state.chunkCount;
      state.live.push({ start: offset + t, text: '' });
      flush(false);
    },
    callback_function: (text) => {
      if (!state.live.length) state.live.push({ start: 0, text: '' });
      state.live[state.live.length - 1].text += text;
      flush(false);
    },
    on_chunk_end: () => flush(false),
    on_finalize: () => { state.chunkCount++; flush(true); },
  });
}

/** Ein Durchlauf über eine Datei. */
async function run(msg) {
  const { audio, duration, model, device, language, task, wordTimestamps } = msg;
  const transcriber = await getTranscriber(model, device);
  const { WhisperTextStreamer } = await loadLib();

  post({ type: 'run-start' });

  const feature = transcriber.processor.feature_extractor.config;
  const time_precision = feature.chunk_length / transcriber.model.config.max_source_positions;

  const options = {
    chunk_length_s: CHUNK_LENGTH_S,
    stride_length_s: STRIDE_LENGTH_S,
    return_timestamps: wordTimestamps ? 'word' : true,
    task,
  };
  if (language && language !== 'auto') options.language = language;

  const newStreamer = () =>
    makeStreamer(WhisperTextStreamer, transcriber.tokenizer, time_precision, duration);

  let output;
  let note = '';
  try {
    output = await transcriber(audio, { ...options, streamer: newStreamer() });
  } catch (err) {
    // Zeitstempel pro Wort brauchen Ausrichtungsdaten, die nicht jedes Modell mitbringt.
    if (wordTimestamps && /alignment_heads/i.test(String(err?.message))) {
      note = 'Dieses Modell kann keine Zeitstempel pro Wort — es wurde pro Abschnitt transkribiert.';
      output = await transcriber(audio, {
        ...options,
        return_timestamps: true,
        streamer: newStreamer(),
      });
    } else {
      throw err;
    }
  }

  const segments = (output.chunks || [])
    .map((c) => ({
      start: c.timestamp?.[0] ?? null,
      end: c.timestamp?.[1] ?? null,
      text: c.text ?? '',
    }))
    .filter((s) => s.text.trim().length);

  post({
    type: 'done',
    text: (output.text || '').trim(),
    segments,
    wordTimestamps: wordTimestamps && !note,
    note,
  });
}

function post(msg) {
  self.postMessage(msg);
}

self.addEventListener('message', async (event) => {
  const msg = event.data;
  try {
    if (msg.type === 'prepare') {
      await getTranscriber(msg.model, msg.device);
      post({ type: 'prepared' });
    } else if (msg.type === 'run') {
      await run(msg);
    }
  } catch (err) {
    post({ type: 'error', message: err?.message || String(err) });
  }
});
