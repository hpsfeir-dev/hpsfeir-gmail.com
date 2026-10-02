# Modell-Herkunft

`model.json` und `group1-shard1of1.bin` sind das unveränderte TensorFlow.js-Modell
aus [`@spotify/basic-pitch`](https://github.com/spotify/basic-pitch) (Version 1.0.1),
© Spotify AB, lizenziert unter der
[Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0).

Die Inferenz- und Notenerkennungs-Logik in `../js/pitch.js` ist eine Portierung
des Original-TypeScript-Codes (`inference.ts`, `toMidi.ts`) auf die globale
`tf`-Laufzeit, ohne den Umweg über ES-Module mit externen Paket-Importen, die
sich auf einer statischen Seite ohne Build-Schritt nicht sauber auflösen ließen.
Rechen- und Schwellwert-Logik sind inhaltlich identisch zum Original.
