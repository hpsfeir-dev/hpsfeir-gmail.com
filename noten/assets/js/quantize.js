/* Rohe Tonhöhen-Ereignisse (beliebige Start-/Endzeiten in Sekunden) auf ein
   starres Notenraster bringen — Takt für Takt, mit Pausen in den Lücken.
   Automatische Notentranskription ist ihrer Natur nach ungenau: Tempo und
   Takt werden hier NICHT erkannt, sondern vom Nutzer vorgegeben. */

const GRID = 0.25; // kleinste Einheit: Sechzehntel (1/4 Schlag)

/** Standard-Notendauern in Schlägen, absteigend — für die Zerlegung. */
const DURATION_TOKENS = [
  { beats: 4, vex: 'w' },
  { beats: 2, vex: 'h' },
  { beats: 1, vex: 'q' },
  { beats: 0.5, vex: '8' },
  { beats: 0.25, vex: '16' },
];

const NOTE_NAMES = ['c', 'c#', 'd', 'd#', 'e', 'f', 'f#', 'g', 'g#', 'a', 'a#', 'b'];

/** MIDI-Tonhöhe -> VexFlow-Notenname ("c#/4") + ob ein Kreuz-Vorzeichen nötig ist. */
export function midiToKey(midi) {
  const name = NOTE_NAMES[((midi % 12) + 12) % 12];
  const octave = Math.floor(midi / 12) - 1;
  return { key: `${name}/${octave}`, sharp: name.includes('#') };
}

/**
 * NoteEventTime[] (von pitch.js) -> Takte aus Noten-/Pausen-"Slots".
 * Jeder Slot ist entweder { rest: true, beats } oder
 * { beats, notes: [{ midi, sharp }, ...] } (mehrere = Akkord, gleicher Einsatz).
 *
 * @param {{pitchMidi:number, amplitude:number, startTimeSeconds:number, durationSeconds:number}[]} events
 * @param {{bpm:number, beatsPerMeasure:number, minAmplitude:number}} opts
 */
export function quantize(events, { bpm, beatsPerMeasure, minAmplitude = 0.08 }) {
  const beatsPerSecond = bpm / 60;

  // Leise/kurze Fehlerkennungen raus, bevor überhaupt quantisiert wird.
  const filtered = events.filter((e) => e.amplitude >= minAmplitude && e.durationSeconds > 0);

  // In Schläge umrechnen und aufs Sechzehntel-Raster runden.
  const notes = filtered
    .map((e) => {
      const startBeat = round(e.startTimeSeconds * beatsPerSecond);
      let endBeat = round((e.startTimeSeconds + e.durationSeconds) * beatsPerSecond);
      if (endBeat <= startBeat) endBeat = startBeat + GRID;
      return { startBeat, endBeat, midi: Math.round(e.pitchMidi) };
    })
    .sort((a, b) => a.startBeat - b.startBeat);

  if (!notes.length) return { measures: [], clef: 'treble' };

  // Gleichzeitig einsetzende Töne (selbes Raster-Feld) zu Akkorden bündeln.
  const groups = [];
  for (const n of notes) {
    const last = groups[groups.length - 1];
    if (last && last.startBeat === n.startBeat) {
      last.endBeat = Math.max(last.endBeat, n.endBeat);
      last.midis.push(n.midi);
    } else {
      groups.push({ startBeat: n.startBeat, endBeat: n.endBeat, midis: [n.midi] });
    }
  }

  // Überlappungen auflösen: Jede Gruppe endet spätestens dort, wo die
  // nächste beginnt — eine einstimmige Notenzeile kann sich nicht
  // überlappen. Sehr kurze Reste danach werden verworfen.
  for (let i = 0; i < groups.length - 1; i++) {
    groups[i].endBeat = Math.min(groups[i].endBeat, groups[i + 1].startBeat);
  }

  // Lücken zwischen Gruppen (und vor der ersten) mit Pausen auffüllen und
  // in eine flache Slot-Liste bringen.
  const slots = [];
  let cursor = 0;
  for (const g of groups) {
    if (g.startBeat > cursor) slots.push({ rest: true, beats: round(g.startBeat - cursor) });
    const dur = round(g.endBeat - g.startBeat);
    if (dur > 0) {
      slots.push({ beats: dur, notes: [...new Set(g.midis)].map((midi) => ({ midi, ...midiToKey(midi) })) });
      cursor = g.endBeat;
    } else {
      cursor = g.startBeat;
    }
  }

  // Letzten Takt mit einer Pause auffüllen, damit VexFlow am Ende nicht
  // über einen unvollständigen Takt stolpert.
  const totalBeats = slots.reduce((s, x) => s + x.beats, 0);
  const remainder = beatsPerMeasure - (totalBeats % beatsPerMeasure);
  if (remainder > 0 && remainder < beatsPerMeasure) slots.push({ rest: true, beats: remainder });

  // In Takte zu je `beatsPerMeasure` Schlägen aufteilen; ein Slot, der über
  // eine Taktgrenze reicht, wird an der Grenze zerschnitten (zwei Slots,
  // selber Ton/selbe Pause).
  // `tie: true` markiert ein Stück, das denselben Ton fortsetzt wie das
  // unmittelbar davor (Taktgrenze mitten in der Note) — damit lässt sich
  // später ein Bindebogen zeichnen, statt dass es wie eine neue Note aussieht.
  const measures = [[]];
  let beatInMeasure = 0;
  for (const slot of slots) {
    let remaining = slot.beats;
    let firstPiece = true;
    while (remaining > 0) {
      const spaceLeft = round(beatsPerMeasure - beatInMeasure);
      const take = Math.min(remaining, spaceLeft);
      const tie = !firstPiece && !slot.rest;
      measures[measures.length - 1].push(slot.rest ? { rest: true, beats: take } : { ...slot, beats: take, tie });
      firstPiece = false;
      beatInMeasure = round(beatInMeasure + take);
      remaining = round(remaining - take);
      if (beatInMeasure >= beatsPerMeasure) {
        measures.push([]);
        beatInMeasure = 0;
      }
    }
  }
  if (!measures[measures.length - 1].length) measures.pop();

  // Jeden Slot in VexFlow-Notendauern zerlegen (eine Dauer, die keinem
  // Standardwert entspricht, wird in mehrere Noten/Pausen gleicher Tonhöhe
  // aufgeteilt statt punktierte Noten zu riskieren — auch hier bindet ein
  // Bogen die Stücke zusammen).
  const vexMeasures = measures.map((measure) =>
    measure.flatMap((slot) =>
      decomposeDuration(slot.beats).map((vex, idx) => ({
        ...slot,
        vex,
        tie: idx === 0 ? slot.tie || false : !slot.rest,
      })),
    ),
  );

  return { measures: vexMeasures, clef: pickClef(filtered) };
}

function pickClef(events) {
  const pitches = events.map((e) => e.pitchMidi).sort((a, b) => a - b);
  const median = pitches[Math.floor(pitches.length / 2)];
  return median >= 60 ? 'treble' : 'bass'; // 60 = c4, mittleres C
}

/** Beats (Vielfaches von 0.25) gierig in Standard-Notenwerte zerlegen. */
function decomposeDuration(beats) {
  let left = round(beats);
  const out = [];
  for (const { beats: b, vex } of DURATION_TOKENS) {
    while (left >= b - 1e-9) {
      out.push(vex);
      left = round(left - b);
    }
  }
  return out.length ? out : ['16'];
}

function round(x) {
  return Math.round(x / GRID) * GRID;
}
