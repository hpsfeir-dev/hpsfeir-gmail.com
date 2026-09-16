/* Gemeinsame Konfiguration von Oberfläche und Worker. */

export const TRANSFORMERS_VERSION = '4.3.0';

export const CDN_URLS = [
  `https://cdn.jsdelivr.net/npm/@huggingface/transformers@${TRANSFORMERS_VERSION}/dist/transformers.min.js`,
  `https://unpkg.com/@huggingface/transformers@${TRANSFORMERS_VERSION}/dist/transformers.min.js`,
];

/* Whisper-Modelle. Größer heißt genauer und langsamer. */
export const MODELS = [
  {
    id: 'onnx-community/whisper-tiny',
    label: 'Klein — sehr schnell',
    hint: 'Rund 45 MB. Für einen groben Überblick oder klare Aufnahmen.',
  },
  {
    id: 'onnx-community/whisper-base',
    label: 'Mittel — ausgewogen',
    hint: 'Rund 85 MB. Guter Ausgangspunkt für die meisten Aufnahmen.',
    default: true,
  },
  {
    id: 'onnx-community/whisper-small',
    label: 'Groß — genauer',
    hint: 'Rund 250 MB. Merklich besser bei Dialekt, Nebengeräuschen und Namen.',
  },
  {
    id: 'onnx-community/whisper-large-v3-turbo',
    label: 'Sehr groß — beste Qualität',
    hint: 'Rund 800 MB und nur mit WebGPU. Bestes Ergebnis, längster erster Start.',
    webgpuOnly: true,
  },
];

export function modelById(id) {
  return MODELS.find((m) => m.id === id) || MODELS.find((m) => m.default) || MODELS[0];
}

/**
 * Voreinstellung nach Leistung: ohne WebGPU rechnet der Prozessor, und auf
 * einem Handy ist dann alles über „Klein" quälend langsam.
 */
export function defaultModelFor(device) {
  return device === 'webgpu' ? 'onnx-community/whisper-base' : 'onnx-community/whisper-tiny';
}

/**
 * Zahlenformat der Gewichte. Auf der GPU bleibt der Encoder hochauflösend,
 * der Decoder wird quantisiert; auf der CPU ist alles q8.
 */
export function dtypeFor(modelId, device) {
  if (device !== 'webgpu') return 'q8';
  return {
    encoder_model: modelId.includes('large') ? 'fp16' : 'fp32',
    decoder_model_merged: 'q4',
  };
}

/* Sprachen, die Whisper gut beherrscht — der Rest läuft über „Automatisch". */
export const LANGUAGES = [
  ['auto', 'Automatisch erkennen'],
  ['de', 'Deutsch'],
  ['en', 'Englisch'],
  ['fr', 'Französisch'],
  ['es', 'Spanisch'],
  ['it', 'Italienisch'],
  ['nl', 'Niederländisch'],
  ['pt', 'Portugiesisch'],
  ['pl', 'Polnisch'],
  ['tr', 'Türkisch'],
  ['ru', 'Russisch'],
  ['ar', 'Arabisch'],
  ['uk', 'Ukrainisch'],
  ['ro', 'Rumänisch'],
  ['el', 'Griechisch'],
  ['cs', 'Tschechisch'],
  ['hu', 'Ungarisch'],
  ['sv', 'Schwedisch'],
  ['da', 'Dänisch'],
  ['no', 'Norwegisch'],
  ['fi', 'Finnisch'],
  ['he', 'Hebräisch'],
  ['hi', 'Hindi'],
  ['ja', 'Japanisch'],
  ['ko', 'Koreanisch'],
  ['zh', 'Chinesisch'],
];

export function languageLabel(code) {
  return (LANGUAGES.find(([c]) => c === code) || [, code])[1];
}

/* Whisper hört immer 30-Sekunden-Fenster; der Überlappungsrand glättet die Nähte. */
export const CHUNK_LENGTH_S = 30;
export const STRIDE_LENGTH_S = 5;
