/* Gemeinsame Konfiguration von Oberfläche und Worker. */

export const TFJS_VERSION = '3.21.0';
export const VEXFLOW_VERSION = '5.0.0';

// tfjs ist ein UMD-Bundle -> klassischer Worker mit importScripts(), kein
// ES-Modul-Import nötig (anders als bei transformers.js in transkript/).
export const TFJS_URLS = [
  `https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@${TFJS_VERSION}/dist/tf.min.js`,
  `https://unpkg.com/@tensorflow/tfjs@${TFJS_VERSION}/dist/tf.min.js`,
];

// VexFlow bringt nur relative Importe mit (kein externes Paket) -> normaler
// ESM-Import direkt von der CDN funktioniert ohne Bundler-Umweg.
export const VEXFLOW_URLS = [
  `https://cdn.jsdelivr.net/npm/vexflow@${VEXFLOW_VERSION}/build/esm/entry/vexflow.js`,
  `https://unpkg.com/vexflow@${VEXFLOW_VERSION}/build/esm/entry/vexflow.js`,
];

// Das Modell liegt im eigenen Repository (siehe assets/model/NOTICE.md).
export const MODEL_URL = new URL('../model/model.json', import.meta.url).href;

export const TIME_SIGNATURES = [2, 3, 4, 6];

export function defaultSettings() {
  return { bpm: 100, beatsPerMeasure: 4, minAmplitude: 0.08 };
}
