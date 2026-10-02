/* Klassischer (nicht Modul-)Worker: tfjs kommt als UMD-Bundle, dafür ist
   importScripts() der richtige Weg — kein ES-Modul-Import nötig und auch
   kein Problem mit dem npm-Paket-Import, den tfjs selbst nicht braucht.
   Läuft bewusst auf der CPU-Backend (nicht WebGL/WebGPU): Worker haben ohne
   Weiteres keinen Canvas/GPU-Kontext, die CPU-Variante funktioniert überall
   garantiert, auch wenn sie langsamer ist. */

let ready = null; // Promise, das auflöst, sobald tfjs + Modell geladen sind
let basicPitch = null;

function loadScripts(urls) {
  let lastError;
  for (const url of urls) {
    try {
      importScripts(url);
      return;
    } catch (err) {
      lastError = err;
    }
  }
  throw new Error(`Konnte nicht geladen werden (${urls[0]}): ${lastError?.message || lastError}`);
}

async function ensureReady(msg) {
  if (ready) return ready;
  ready = (async () => {
    loadScripts(msg.tfjsUrls);
    // pitch.js liegt neben worker.js im selben Ordner.
    importScripts(new URL('./pitch.js', self.location.href).href);
    await tf.setBackend('cpu');
    basicPitch = new self.BasicPitch.BasicPitch(msg.modelUrl);
    await basicPitch.model; // Fehler beim Laden hier schon auffangen, nicht erst beim ersten Lauf
  })();
  return ready;
}

async function run(msg) {
  await ensureReady(msg);

  const { outputToNotesPoly, noteFramesToTime } = self.BasicPitch;
  const allFrames = [];
  const allOnsets = [];

  await basicPitch.evaluateModel(
    msg.audio,
    (frames, onsets) => {
      for (const row of frames) allFrames.push(row);
      for (const row of onsets) allOnsets.push(row);
    },
    (percent) => post({ type: 'progress', percent }),
  );

  const notes = outputToNotesPoly(allFrames, allOnsets);
  const timed = noteFramesToTime(notes);
  post({ type: 'done', notes: timed });
}

function post(msg) {
  self.postMessage(msg);
}

self.addEventListener('message', async (event) => {
  const msg = event.data;
  try {
    if (msg.type === 'prepare') {
      await ensureReady(msg);
      post({ type: 'prepared' });
    } else if (msg.type === 'run') {
      await run(msg);
    }
  } catch (err) {
    post({ type: 'error', message: err?.message || String(err) });
  }
});
