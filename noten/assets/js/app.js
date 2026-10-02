/* Noten — Oberfläche: Datei annehmen, Worker steuern, Notenblatt zeigen. */

import { TFJS_URLS, VEXFLOW_URLS, MODEL_URL } from './config.js';
import { decodeAudio } from './audio.js';
import { quantize } from './quantize.js';
import { renderScore, toMusicXml } from './notation.js';

const $ = (id) => document.getElementById(id);

const el = {
  warn: $('fileProtoWarn'),
  drop: $('drop'),
  input: $('fileInput'),
  fileBar: $('fileBar'),
  fileName: $('fileName'),
  fileMeta: $('fileMeta'),
  fileClear: $('fileClear'),
  player: $('player'),
  optBpm: $('optBpm'),
  optBeats: $('optBeats'),
  optSensitivity: $('optSensitivity'),
  btnRun: $('btnRun'),
  btnCancel: $('btnCancel'),
  progressCard: $('progressCard'),
  progressTitle: $('progressTitle'),
  progressBar: $('progressBar'),
  progressText: $('progressText'),
  resultCard: $('resultCard'),
  resultMeta: $('resultMeta'),
  score: $('score'),
  btnDlSvg: $('btnDlSvg'),
  btnDlPng: $('btnDlPng'),
  btnDlXml: $('btnDlXml'),
  toast: $('toast'),
};

const SETTINGS_KEY = 'noten.settings.v1';

const state = {
  file: null,
  fileUrl: null,
  worker: null,
  busy: false,
  decodeAbort: null,
  lastScore: null,   // { measures, clef } — für den Export
  lastSettings: null,
  vexflowModule: null,
};

/* ---------- Kleinkram ---------- */

let toastTimer;
function toast(message, isError = false) {
  el.toast.textContent = message;
  el.toast.classList.toggle('err', isError);
  el.toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.toast.hidden = true; }, isError ? 6000 : 2600);
}

function fmtBytes(n) {
  if (!n) return '';
  const mb = n / 1024 / 1024;
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.round(n / 1024)} KB`;
}

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch { /* egal, dann wird's beim nächsten Mal halt nicht gemerkt */ }
}

/* ---------- Start ---------- */

function init() {
  if (location.protocol === 'file:') {
    el.warn.hidden = false;
    el.drop.setAttribute('aria-disabled', 'true');
  }
  restoreSettings();
  wireEvents();
}

function currentSettings() {
  return {
    bpm: clampInt(el.optBpm.value, 30, 300, 100),
    beatsPerMeasure: Number(el.optBeats.value),
    minAmplitude: Number(el.optSensitivity.value),
  };
}

function clampInt(v, min, max, fallback) {
  const n = Math.round(Number(v));
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
}

function restoreSettings() {
  const s = load(SETTINGS_KEY, null);
  if (!s) return;
  if (s.bpm) el.optBpm.value = s.bpm;
  if (s.beatsPerMeasure) el.optBeats.value = String(s.beatsPerMeasure);
  if (s.minAmplitude !== undefined && [...el.optSensitivity.options].some((o) => Number(o.value) === s.minAmplitude)) {
    el.optSensitivity.value = String(s.minAmplitude);
  }
}

/* ---------- Datei ---------- */

function wireEvents() {
  el.drop.addEventListener('click', () => el.input.click());
  el.drop.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); el.input.click(); }
  });
  el.input.addEventListener('change', () => {
    if (el.input.files?.[0]) acceptFile(el.input.files[0]);
    el.input.value = '';
  });

  for (const type of ['dragenter', 'dragover']) {
    el.drop.addEventListener(type, (e) => { e.preventDefault(); el.drop.classList.add('is-over'); });
  }
  for (const type of ['dragleave', 'dragend', 'drop']) {
    el.drop.addEventListener(type, () => el.drop.classList.remove('is-over'));
  }
  el.drop.addEventListener('drop', (e) => {
    e.preventDefault();
    const file = e.dataTransfer?.files?.[0];
    if (file) acceptFile(file);
  });
  window.addEventListener('dragover', (e) => e.preventDefault());
  window.addEventListener('drop', (e) => e.preventDefault());

  el.fileClear.addEventListener('click', clearFile);

  for (const sel of [el.optBpm, el.optBeats, el.optSensitivity]) {
    sel.addEventListener('change', () => save(SETTINGS_KEY, currentSettings()));
  }

  el.btnRun.addEventListener('click', start);
  el.btnCancel.addEventListener('click', cancel);

  el.btnDlSvg.addEventListener('click', () => downloadSvg(false));
  el.btnDlPng.addEventListener('click', () => downloadSvg(true));
  el.btnDlXml.addEventListener('click', downloadXml);
}

function acceptFile(file) {
  if (state.busy) { toast('Erst den laufenden Durchgang abwarten oder abbrechen.', true); return; }

  const looksAudio = file.type.startsWith('audio/') || file.type.startsWith('video/')
    || /\.(mp3|m4a|wav|ogg|oga|flac|webm|mp4|aac|opus)$/i.test(file.name);
  if (!looksAudio) { toast('Das sieht nicht nach einer Audiodatei aus.', true); return; }

  clearFile();
  state.file = file;
  state.fileUrl = URL.createObjectURL(file);

  el.fileName.textContent = file.name;
  el.fileMeta.textContent = fmtBytes(file.size);
  el.fileBar.hidden = false;
  el.player.src = state.fileUrl;
  el.player.hidden = false;
  el.btnRun.disabled = location.protocol === 'file:';

  el.player.addEventListener('loadedmetadata', () => {
    if (Number.isFinite(el.player.duration)) {
      el.fileMeta.textContent = `${fmtBytes(file.size)} · ${clock(el.player.duration)}`;
    }
  }, { once: true });
}

function clearFile() {
  if (state.fileUrl) URL.revokeObjectURL(state.fileUrl);
  state.file = null;
  state.fileUrl = null;
  el.player.removeAttribute('src');
  el.player.load();
  el.player.hidden = true;
  el.fileBar.hidden = true;
  el.btnRun.disabled = true;
}

function clock(sec) {
  if (!Number.isFinite(sec) || sec < 0) sec = 0;
  const s = Math.floor(sec % 60);
  const m = Math.floor(sec / 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

/* ---------- Durchlauf ---------- */

function ensureWorker() {
  if (state.worker) return state.worker;
  // Klassischer Worker (nicht type:module) — tfjs ist ein UMD-Bundle, das
  // per importScripts() geladen wird, siehe worker.js.
  state.worker = new Worker(new URL('./worker.js', import.meta.url));
  state.worker.addEventListener('message', onWorkerMessage);
  state.worker.addEventListener('error', (e) => fail(e.message || 'Der Hintergrundprozess ist ausgestiegen.'));
  return state.worker;
}

async function start() {
  if (!state.file || state.busy) return;

  const settings = currentSettings();
  save(SETTINGS_KEY, settings);
  state.lastSettings = settings;

  setBusy(true);
  showProgress('Audio wird eingelesen …', 0, '');
  el.resultCard.hidden = true;

  state.decodeAbort = new AbortController();
  let audio;
  try {
    const decoded = await decodeAudio(state.file, {
      onStatus: handleDecodeStatus,
      signal: state.decodeAbort.signal,
    });
    audio = decoded.samples;
  } catch (err) {
    if (err?.name !== 'AbortError') fail(err?.message || 'Die Datei konnte nicht gelesen werden.');
    return;
  }

  if (!audio.length) { fail('Die Datei enthält keine hörbaren Daten.'); return; }

  showProgress('Modell wird vorbereitet …', 0, 'Beim ersten Mal lädt es herunter (~1 MB), danach kommt es aus dem Speicher.');
  ensureWorker().postMessage(
    { type: 'run', audio, tfjsUrls: TFJS_URLS, modelUrl: MODEL_URL },
    [audio.buffer],
  );
}

function cancel() {
  state.decodeAbort?.abort();
  state.worker?.terminate();
  state.worker = null;
  setBusy(false);
  el.progressCard.hidden = true;
  toast('Abgebrochen.');
}

function handleDecodeStatus(info) {
  if (info.stage === 'fallback-start') {
    showProgress(
      'Datei wird über die Wiedergabe gelesen …',
      0,
      'Dieses Format lehnt den schnellen Weg ab — der Umweg dauert etwa so lange wie die Aufnahme selbst. Bildschirm anlassen.',
    );
  } else if (info.stage === 'fallback-progress') {
    const pct = info.total > 0 ? Math.min(99, (info.current / info.total) * 100) : 0;
    el.progressBar.style.width = `${pct}%`;
    el.progressText.textContent = `${clock(info.current)} von ${clock(info.total)} gelesen`;
  }
}

async function onWorkerMessage(event) {
  const msg = event.data;
  if (msg.type === 'prepared') return;

  if (msg.type === 'progress') {
    showProgress('Töne werden erkannt …', Math.round(msg.percent * 100), 'Läuft auf dem Prozessor — das braucht bei längeren Aufnahmen Geduld.');
    return;
  }

  if (msg.type === 'error') {
    fail(msg.message);
    return;
  }

  if (msg.type === 'done') {
    try {
      await finish(msg.notes);
    } catch (err) {
      fail(err?.message || 'Das Notenblatt konnte nicht gezeichnet werden.');
    }
  }
}

async function finish(notes) {
  const settings = state.lastSettings;
  const score = quantize(notes, settings);
  state.lastScore = score;

  const VF = await loadVexFlow();

  setBusy(false);
  el.progressCard.hidden = true;
  el.resultCard.hidden = false;

  const title = state.file ? state.file.name.replace(/\.[^.]+$/, '') : '';
  renderScore(VF, el.score, score, { beatsPerMeasure: settings.beatsPerMeasure, title });

  const noteCount = score.measures.reduce((n, m) => n + m.filter((s) => !s.rest).length, 0);
  el.resultMeta.textContent = `${score.measures.length} Takte · ${noteCount} Noten/Akkorde · ${score.clef === 'treble' ? 'Violinschlüssel' : 'Bassschlüssel'} · ${settings.bpm} BPM`;

  for (const btn of [el.btnDlSvg, el.btnDlPng, el.btnDlXml]) btn.hidden = noteCount === 0;

  toast(noteCount ? 'Fertig — Entwurf steht, am besten gegenprüfen.' : 'Fertig, aber keine klaren Töne erkannt.');
}

async function loadVexFlow() {
  if (state.vexflowModule) return state.vexflowModule;
  let lastError;
  for (const url of VEXFLOW_URLS) {
    try {
      state.vexflowModule = await import(url);
      return state.vexflowModule;
    } catch (err) {
      lastError = err;
    }
  }
  throw new Error(`Der Notensatz (VexFlow) konnte nicht geladen werden. (${lastError?.message || lastError})`);
}

function fail(message) {
  setBusy(false);
  el.progressCard.hidden = true;
  toast(message, true);
}

function setBusy(busy) {
  state.busy = busy;
  el.btnRun.disabled = busy || !state.file;
  el.btnRun.textContent = busy ? 'Läuft …' : 'In Noten umwandeln';
  el.btnCancel.hidden = !busy;
  el.fileClear.disabled = busy;
  for (const sel of [el.optBpm, el.optBeats, el.optSensitivity]) sel.disabled = busy;
}

function showProgress(title, percent, text) {
  el.progressCard.hidden = false;
  el.progressTitle.textContent = title;
  el.progressBar.style.width = `${percent}%`;
  el.progressText.textContent = text;
}

/* ---------- Export ---------- */

function baseName() {
  return (state.file?.name || 'noten').replace(/\.[^.]+$/, '') || 'noten';
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function downloadSvg(asPng) {
  const svg = el.score.querySelector('svg');
  if (!svg) return;
  const svgText = new XMLSerializer().serializeToString(svg);

  if (!asPng) {
    downloadBlob(new Blob([svgText], { type: 'image/svg+xml' }), `${baseName()}.svg`);
    return;
  }

  const width = Number(svg.getAttribute('width')) || svg.viewBox?.baseVal?.width || 800;
  const height = Number(svg.getAttribute('height')) || svg.viewBox?.baseVal?.height || 300;
  const scale = 2; // für einen scharfen Ausdruck
  const img = new Image();
  const svgBlob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });
  const svgUrl = URL.createObjectURL(svgBlob);

  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = width * scale;
    canvas.height = height * scale;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.scale(scale, scale);
    ctx.drawImage(img, 0, 0);
    URL.revokeObjectURL(svgUrl);
    canvas.toBlob((blob) => {
      if (blob) downloadBlob(blob, `${baseName()}.png`);
      else toast('PNG-Export fehlgeschlagen.', true);
    }, 'image/png');
  };
  img.onerror = () => { URL.revokeObjectURL(svgUrl); toast('PNG-Export fehlgeschlagen.', true); };
  img.src = svgUrl;
}

function downloadXml() {
  if (!state.lastScore) return;
  const title = baseName();
  const xml = toMusicXml(state.lastScore, { beatsPerMeasure: state.lastSettings.beatsPerMeasure, title });
  downloadBlob(new Blob([xml], { type: 'application/vnd.recordare.musicxml+xml' }), `${title}.musicxml`);
}

init();
