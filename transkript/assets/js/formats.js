/* Ausgabeformate: Fließtext, SRT, WebVTT, Markdown, JSON. */

/** Sekunden -> "MM:SS" bzw. "H:MM:SS" für die Anzeige. */
export function clock(sec) {
  if (!Number.isFinite(sec) || sec < 0) sec = 0;
  const s = Math.floor(sec % 60);
  const m = Math.floor(sec / 60) % 60;
  const h = Math.floor(sec / 3600);
  const mm = String(m).padStart(h ? 2 : 1, '0');
  const ss = String(s).padStart(2, '0');
  return h ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

/** Sekunden -> "HH:MM:SS,mmm" (SRT) oder "HH:MM:SS.mmm" (VTT). */
export function stamp(sec, sep = ',') {
  if (!Number.isFinite(sec) || sec < 0) sec = 0;
  const ms = Math.round((sec - Math.floor(sec)) * 1000);
  const t = Math.floor(sec);
  const h = String(Math.floor(t / 3600)).padStart(2, '0');
  const m = String(Math.floor(t / 60) % 60).padStart(2, '0');
  const s = String(t % 60).padStart(2, '0');
  return `${h}:${m}:${s}${sep}${String(ms).padStart(3, '0')}`;
}

/**
 * Whisper lässt den letzten Endzeitpunkt gelegentlich offen — hier füllen wir
 * Lücken auf, damit Untertitel nicht kaputtgehen.
 */
export function fillGaps(segments, duration) {
  const out = segments.map((s) => ({ start: s.start, end: s.end, text: s.text }));
  for (let i = 0; i < out.length; i++) {
    if (!Number.isFinite(out[i].start)) out[i].start = i ? out[i - 1].end ?? 0 : 0;
    if (!Number.isFinite(out[i].end)) {
      const next = out[i + 1]?.start;
      out[i].end = Number.isFinite(next) ? next
        : Number.isFinite(duration) ? Math.max(duration, out[i].start)
        : out[i].start + 2;
    }
    if (out[i].end < out[i].start) out[i].end = out[i].start;
  }
  return out;
}

export function toText(result) {
  return (result.text || '').trim() + '\n';
}

export function toSrt(result) {
  const segs = fillGaps(result.segments, result.duration);
  return segs
    .map((s, i) => `${i + 1}\n${stamp(s.start)} --> ${stamp(s.end)}\n${s.text.trim()}\n`)
    .join('\n');
}

export function toVtt(result) {
  const segs = fillGaps(result.segments, result.duration);
  const body = segs
    .map((s) => `${stamp(s.start, '.')} --> ${stamp(s.end, '.')}\n${s.text.trim()}\n`)
    .join('\n');
  return `WEBVTT\n\n${body}`;
}

export function toMarkdown(result) {
  const head = [
    `# ${result.name}`,
    '',
    `*${result.modelLabel} · ${result.langLabel} · ${clock(result.duration)}*`,
    '',
    '',
  ].join('\n');

  if (!result.segments.length) return `${head}${toText(result)}`;

  const body = fillGaps(result.segments, result.duration)
    .map((s) => `**[${clock(s.start)}]** ${s.text.trim()}`)
    .join('\n\n');
  return `${head}${body}\n`;
}

export function toJson(result) {
  return JSON.stringify(
    {
      datei: result.name,
      dauer_sekunden: Number((result.duration || 0).toFixed(2)),
      modell: result.model,
      sprache: result.language,
      aufgabe: result.task,
      erstellt: result.date,
      text: (result.text || '').trim(),
      abschnitte: fillGaps(result.segments, result.duration).map((s) => ({
        start: Number(s.start.toFixed(2)),
        ende: Number(s.end.toFixed(2)),
        text: s.text.trim(),
      })),
    },
    null,
    2,
  );
}

export const EXPORTS = {
  txt: { build: toText, mime: 'text/plain' },
  srt: { build: toSrt, mime: 'application/x-subrip' },
  vtt: { build: toVtt, mime: 'text/vtt' },
  md: { build: toMarkdown, mime: 'text/markdown' },
  json: { build: toJson, mime: 'application/json' },
};
