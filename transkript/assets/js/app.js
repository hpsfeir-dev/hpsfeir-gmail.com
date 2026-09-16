/* Transkript — Oberfläche: Datei annehmen, Worker steuern, Ergebnis zeigen. */

import { MODELS, LANGUAGES, modelById, languageLabel, defaultModelFor } from './config.js';
import { decodeToMono16k } from './audio.js';
import { clock, EXPORTS } from './formats.js';

const $ = (id) => document.getElementById(id);

const el = {
  warn: $('fileProtoWarn'),
  badge: $('deviceBadge'),
  drop: $('drop'),
  input: $('fileInput'),
  fileBar: $('fileBar'),
  fileName: $('fileName'),
  fileMeta: $('fileMeta'),
  fileClear: $('fileClear'),
  player: $('player'),
  optModel: $('optModel'),
  optLang: $('optLang'),
  langQuick: $('langQuick'),
  langMoreToggle: $('langMoreToggle'),
  optTask: $('optTask'),
  optStamps: $('optStamps'),
  modelHint: $('modelHint'),
  btnRun: $('btnRun'),
  btnCancel: $('btnCancel'),
  progressCard: $('progressCard'),
  progressTitle: $('progressTitle'),
  progressBar: $('progressBar'),
  progressText: $('progressText'),
  stream: $('stream'),
  resultCard: $('resultCard'),
  resultMeta: $('resultMeta'),
  segments: $('segments'),
  plainText: $('plainText'),
  btnCopy: $('btnCopy'),
  historyCard: $('historyCard'),
  historyList: $('historyList'),
  historyClear: $('historyClear'),
  toast: $('toast'),
};

const SETTINGS_KEY = 'transkript.settings.v1';
const HISTORY_KEY = 'transkript.history.v1';
const HISTORY_MAX = 15;

const state = {
  file: null,
  fileUrl: null,
  duration: 0,
  worker: null,
  busy: false,
  device: 'wasm',
  result: null,   // { name, text, segments, duration, model, language, task, date, ... }
  view: 'segments',
  activeSegment: -1,
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
    return true;
  } catch {
    return false;
  }
}

/* ---------- Start ---------- */

async function init() {
  if (location.protocol === 'file:') {
    el.warn.hidden = false;
    el.drop.setAttribute('aria-disabled', 'true');
  }

  state.device = (await hasWebGPU()) ? 'webgpu' : 'wasm';
  el.badge.textContent = state.device === 'webgpu' ? 'GPU (WebGPU)' : 'CPU';
  el.badge.classList.toggle('gpu', state.device === 'webgpu');
  el.badge.title = state.device === 'webgpu'
    ? 'Rechnet auf der Grafikkarte — deutlich schneller.'
    : 'Rechnet auf dem Prozessor. Ein Browser mit WebGPU wäre schneller.';

  buildOptions();
  restoreSettings();
  renderHistory();
  wireEvents();
}

async function hasWebGPU() {
  try {
    if (!navigator.gpu) return false;
    const adapter = await navigator.gpu.requestAdapter();
    return !!adapter;
  } catch {
    return false;
  }
}

function buildOptions() {
  const preset = defaultModelFor(state.device);
  el.optModel.replaceChildren(
    ...MODELS.filter((m) => !m.webgpuOnly || state.device === 'webgpu').map((m) => {
      const o = document.createElement('option');
      o.value = m.id;
      o.textContent = m.label;
      if (m.id === preset) o.selected = true;
      return o;
    }),
  );

  el.optLang.replaceChildren(
    ...LANGUAGES.map(([code, label]) => {
      const o = document.createElement('option');
      o.value = code;
      o.textContent = label;
      if (code === 'de') o.selected = true;
      return o;
    }),
  );
  setLanguage('de');

  updateModelHint();
}

/** Die drei Quick-Sprachen sind die üblichen Verdächtigen — DE/EN/FR. */
const QUICK_LANGS = ['auto', 'de', 'en', 'fr'];

/** Hebt den passenden Schnellbutton hervor (keinen, falls eine andere Sprache aktiv ist). */
function syncLangQuickButtons() {
  const code = el.optLang.value;
  for (const btn of el.langQuick.querySelectorAll('.seg-btn')) {
    btn.classList.toggle('is-on', btn.dataset.lang === code);
  }
}

/**
 * Sprache über eine der vier Schnelltasten setzen: Wert übernehmen, Highlight
 * setzen und zur schmalen Ansicht zurückklappen.
 */
function setLanguage(code) {
  el.optLang.value = code;
  syncLangQuickButtons();
  el.optLang.hidden = true;
  el.langMoreToggle.textContent = 'andere Sprache …';
}

function updateModelHint() {
  el.modelHint.textContent = modelById(el.optModel.value).hint;
}

function currentSettings() {
  return {
    model: el.optModel.value,
    language: el.optLang.value,
    task: el.optTask.value,
    stamps: el.optStamps.value,
  };
}

function restoreSettings() {
  const s = load(SETTINGS_KEY, null);
  if (!s) return;
  if (s.model && [...el.optModel.options].some((o) => o.value === s.model)) el.optModel.value = s.model;
  if (s.language && [...el.optLang.options].some((o) => o.value === s.language)) {
    el.optLang.value = s.language;
    syncLangQuickButtons();
    const isQuick = QUICK_LANGS.includes(s.language);
    el.optLang.hidden = isQuick;
    el.langMoreToggle.textContent = isQuick ? 'andere Sprache …' : 'Schnellauswahl';
  }
  if (s.task) el.optTask.value = s.task;
  if (s.stamps) el.optStamps.value = s.stamps;
  updateModelHint();
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
  // Ein Fehlwurf neben das Feld soll die Seite nicht durch die Datei ersetzen.
  window.addEventListener('dragover', (e) => e.preventDefault());
  window.addEventListener('drop', (e) => e.preventDefault());

  el.fileClear.addEventListener('click', clearFile);

  el.optModel.addEventListener('change', () => { updateModelHint(); save(SETTINGS_KEY, currentSettings()); });
  for (const sel of [el.optLang, el.optTask, el.optStamps]) {
    sel.addEventListener('change', () => save(SETTINGS_KEY, currentSettings()));
  }

  for (const btn of el.langQuick.querySelectorAll('.seg-btn')) {
    btn.addEventListener('click', () => { setLanguage(btn.dataset.lang); save(SETTINGS_KEY, currentSettings()); });
  }
  el.langMoreToggle.addEventListener('click', () => {
    const showList = el.optLang.hidden;
    el.optLang.hidden = !showList;
    el.langMoreToggle.textContent = showList ? 'Schnellauswahl' : 'andere Sprache …';
    if (showList) el.optLang.focus();
  });
  // Aus der vollen Liste ausgewählt -> Schnellbuttons synchron halten (ohne
  // die Auswahl selbst zu verändern, falls es keine der vier Schnellsprachen ist).
  el.optLang.addEventListener('change', syncLangQuickButtons);

  el.btnRun.addEventListener('click', start);
  el.btnCancel.addEventListener('click', cancel);

  for (const btn of document.querySelectorAll('#resultCard .seg-btn')) {
    btn.addEventListener('click', () => setView(btn.dataset.view));
  }

  el.btnCopy.addEventListener('click', copyResult);
  for (const btn of document.querySelectorAll('[data-dl]')) {
    btn.addEventListener('click', () => download(btn.dataset.dl));
  }

  el.historyClear.addEventListener('click', () => {
    if (!confirm('Den ganzen Verlauf löschen?')) return;
    save(HISTORY_KEY, []);
    renderHistory();
  });

  el.player.addEventListener('timeupdate', highlightActive);
  el.player.addEventListener('seeked', highlightActive);
  el.plainText.addEventListener('input', () => {
    if (state.result) state.result.text = el.plainText.value;
  });
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
      state.duration = el.player.duration;
      el.fileMeta.textContent = `${fmtBytes(file.size)} · ${clock(el.player.duration)}`;
    }
  }, { once: true });
}

function clearFile() {
  if (state.fileUrl) URL.revokeObjectURL(state.fileUrl);
  state.file = null;
  state.fileUrl = null;
  state.duration = 0;
  el.player.removeAttribute('src');
  el.player.load();
  el.player.hidden = true;
  el.fileBar.hidden = true;
  el.btnRun.disabled = true;
}

/* ---------- Durchlauf ---------- */

function ensureWorker() {
  if (state.worker) return state.worker;
  state.worker = new Worker(new URL('./worker.js', import.meta.url), { type: 'module' });
  state.worker.addEventListener('message', onWorkerMessage);
  state.worker.addEventListener('error', (e) => {
    fail(e.message || 'Der Hintergrundprozess ist ausgestiegen.');
  });
  return state.worker;
}

async function start() {
  if (!state.file || state.busy) return;

  const settings = currentSettings();
  save(SETTINGS_KEY, settings);

  setBusy(true);
  showProgress('Audio wird eingelesen …', 0, '');
  el.stream.hidden = true;
  el.stream.textContent = '';
  el.resultCard.hidden = true;

  let audio;
  try {
    const decoded = await decodeToMono16k(state.file);
    audio = decoded.samples;
    state.duration = decoded.duration;
  } catch (err) {
    fail(err?.message || 'Die Datei konnte nicht gelesen werden.');
    return;
  }

  if (!audio.length) { fail('Die Datei enthält keine hörbaren Daten.'); return; }

  state.pending = {
    name: state.file.name,
    duration: state.duration,
    ...settings,
    date: new Date().toISOString(),
  };

  showProgress('Modell wird vorbereitet …', 0, '');
  ensureWorker().postMessage(
    {
      type: 'run',
      audio,
      duration: state.duration,
      model: settings.model,
      device: state.device,
      language: settings.language,
      task: settings.task,
      wordTimestamps: settings.stamps === 'word',
    },
    [audio.buffer],
  );
}

function cancel() {
  state.worker?.terminate();
  state.worker = null;
  setBusy(false);
  el.progressCard.hidden = true;
  toast('Abgebrochen.');
}

function onWorkerMessage(event) {
  const msg = event.data;

  switch (msg.type) {
    case 'load-start':
      showProgress('Modell wird geladen …', 0, 'Beim ersten Mal wird es heruntergeladen, danach kommt es aus dem Browserspeicher.');
      break;

    case 'load-files':
      if (!el.progressBar.style.width || el.progressBar.style.width === '0%') {
        el.progressText.textContent = `Datei ${Math.max(msg.finished + 1, 1)} von ${Math.max(msg.started, 1)} …`;
      }
      break;

    case 'load-progress':
      el.progressBar.style.width = `${Math.min(100, msg.progress)}%`;
      el.progressText.textContent = msg.total
        ? `${fmtBytes(msg.loaded)} von ${fmtBytes(msg.total)}`
        : 'Modell wird geladen …';
      break;

    case 'load-done':
      showProgress('Modell bereit — los geht’s …', 0, '');
      break;

    case 'run-start':
      showProgress('Wird transkribiert …', 0, 'Dauert ungefähr so lange wie die Aufnahme selbst, mit GPU deutlich kürzer. Bildschirm anlassen — im Hintergrund pausiert der Browser.');
      el.stream.hidden = false;
      break;

    case 'stream':
      el.progressBar.style.width = `${msg.progress}%`;
      el.stream.textContent = msg.text;
      el.stream.scrollTop = el.stream.scrollHeight;
      break;

    case 'done':
      finish(msg);
      break;

    case 'error':
      fail(msg.message);
      break;
  }
}

function finish(msg) {
  const p = state.pending || {};
  state.result = {
    name: p.name || 'Aufnahme',
    text: msg.text,
    segments: msg.segments || [],
    duration: p.duration || state.duration || 0,
    model: p.model,
    modelLabel: modelById(p.model).label,
    language: p.language,
    langLabel: languageLabel(p.language),
    task: p.task,
    stamps: msg.wordTimestamps ? 'word' : (p.stamps === 'word' ? 'segment' : p.stamps),
    date: p.date || new Date().toISOString(),
    hasAudio: true,
  };

  state.activeSegment = -1;
  setBusy(false);
  el.progressCard.hidden = true;
  renderResult();
  addToHistory(state.result);
  if (msg.note) toast(msg.note, true);
  else toast('Fertig.');
}

function fail(message) {
  setBusy(false);
  el.progressCard.hidden = true;
  toast(message, true);
}

function setBusy(busy) {
  state.busy = busy;
  el.btnRun.disabled = busy || !state.file;
  el.btnRun.textContent = busy ? 'Läuft …' : 'Transkribieren';
  el.btnCancel.hidden = !busy;
  el.fileClear.disabled = busy;
  for (const sel of [el.optModel, el.optLang, el.optTask, el.optStamps]) sel.disabled = busy;
  el.langMoreToggle.disabled = busy;
  for (const btn of el.langQuick.querySelectorAll('.seg-btn')) btn.disabled = busy;
}

function showProgress(title, percent, text) {
  el.progressCard.hidden = false;
  el.progressTitle.textContent = title;
  el.progressBar.style.width = `${percent}%`;
  el.progressText.textContent = text;
}

/* ---------- Ergebnis ---------- */

function renderResult() {
  const r = state.result;
  if (!r) return;

  el.resultCard.hidden = false;
  const bits = [
    r.modelLabel,
    r.task === 'translate' ? 'ins Englische übersetzt' : r.langLabel,
    clock(r.duration),
    `${r.segments.length} Abschnitte`,
  ].filter(Boolean);
  el.resultMeta.textContent = bits.join(' · ');

  el.segments.classList.toggle('no-time', r.stamps === 'off' || !r.segments.length);
  el.segments.replaceChildren(
    ...(r.segments.length ? r.segments : [{ start: 0, end: null, text: r.text }]).map((seg, i) => {
      const row = document.createElement('button');
      row.type = 'button';
      row.className = 'segment';
      row.dataset.index = String(i);

      const time = document.createElement('span');
      time.className = 'segment-time';
      time.textContent = Number.isFinite(seg.start) ? clock(seg.start) : '–';

      const text = document.createElement('span');
      text.className = 'segment-text';
      text.textContent = seg.text.trim();

      row.append(time, text);
      row.addEventListener('click', () => seekTo(seg.start));
      return row;
    }),
  );

  el.plainText.value = r.text;
  setView(state.view);
}

function setView(view) {
  state.view = view;
  for (const btn of document.querySelectorAll('.seg-btn')) {
    btn.classList.toggle('is-on', btn.dataset.view === view);
  }
  el.segments.hidden = view !== 'segments';
  el.plainText.hidden = view !== 'text';
}

function seekTo(seconds) {
  if (!state.result?.hasAudio || !state.fileUrl || !Number.isFinite(seconds)) return;
  el.player.currentTime = Math.max(0, seconds);
  highlightActive();   // sofort markieren, auch wenn die Wiedergabe blockiert wird
  el.player.play().catch(() => { /* Autoplay darf der Browser verweigern */ });
}

function highlightActive() {
  const r = state.result;
  if (!r?.segments.length || el.segments.hidden) return;

  const t = el.player.currentTime;
  let index = -1;
  for (let i = 0; i < r.segments.length; i++) {
    if ((r.segments[i].start ?? 0) <= t) index = i; else break;
  }
  if (index === state.activeSegment) return;

  el.segments.querySelector('.segment.is-active')?.classList.remove('is-active');
  state.activeSegment = index;
  const row = el.segments.querySelector(`.segment[data-index="${index}"]`);
  if (row) {
    row.classList.add('is-active');
    row.scrollIntoView({ block: 'nearest' });
  }
}

async function copyResult() {
  const text = state.view === 'text' ? el.plainText.value : textForCopy();
  try {
    await navigator.clipboard.writeText(text);
    toast('In die Zwischenablage kopiert.');
  } catch {
    el.plainText.hidden = false;
    el.plainText.select();
    toast('Kopieren nicht erlaubt — der Text ist markiert, bitte selbst kopieren.', true);
  }
}

function textForCopy() {
  const r = state.result;
  if (!r) return '';
  if (r.stamps === 'off' || !r.segments.length) return r.text;
  return r.segments.map((s) => `[${clock(s.start)}] ${s.text.trim()}`).join('\n');
}

function download(kind) {
  const r = state.result;
  if (!r) return;
  const spec = EXPORTS[kind];
  if (!spec) return;

  const blob = new Blob([spec.build(r)], { type: `${spec.mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${r.name.replace(/\.[^.]+$/, '') || 'transkript'}.${kind}`;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/* ---------- Verlauf ---------- */

function addToHistory(result) {
  const entry = { ...result, id: `${Date.now()}`, hasAudio: false };
  const list = [entry, ...load(HISTORY_KEY, [])].slice(0, HISTORY_MAX);

  // Platz im Browserspeicher ist endlich — notfalls die ältesten Einträge opfern.
  while (list.length && !save(HISTORY_KEY, list)) list.pop();
  renderHistory();
}

function renderHistory() {
  const list = load(HISTORY_KEY, []);
  el.historyCard.hidden = !list.length;
  if (!list.length) return;

  el.historyList.replaceChildren(
    ...list.map((entry) => {
      const item = document.createElement('div');
      item.className = 'history-item';

      const open = document.createElement('button');
      open.type = 'button';
      open.className = 'history-open';

      const name = document.createElement('div');
      name.className = 'history-name';
      name.textContent = entry.name;

      const sub = document.createElement('div');
      sub.className = 'history-sub';
      sub.textContent = [
        new Date(entry.date).toLocaleString('de-DE', { dateStyle: 'short', timeStyle: 'short' }),
        clock(entry.duration || 0),
        entry.modelLabel,
      ].filter(Boolean).join(' · ');

      open.append(name, sub);
      open.addEventListener('click', () => {
        state.result = { ...entry, hasAudio: false };
        state.activeSegment = -1;
        renderResult();
        el.resultCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });

      const del = document.createElement('button');
      del.type = 'button';
      del.className = 'history-del';
      del.title = 'Löschen';
      del.textContent = '×';
      del.addEventListener('click', () => {
        save(HISTORY_KEY, load(HISTORY_KEY, []).filter((e) => e.id !== entry.id));
        renderHistory();
      });

      item.append(open, del);
      return item;
    }),
  );
}

init();
