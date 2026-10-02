/* Quantisierte Takte (aus quantize.js) als Notenblatt zeichnen (VexFlow,
   SVG) und als MusicXML exportieren. */

const MEASURES_PER_LINE = 4;
const MEASURE_WIDTH = 220;
const LINE_HEIGHT = 110;
const LEFT_MARGIN = 12;

/**
 * Zeichnet das Notenblatt als SVG in `container` (wird vorher geleert).
 * @param {typeof import('vexflow')} VF Das geladene VexFlow-Modul.
 * @param {HTMLElement} container
 * @param {{measures: object[][], clef: 'treble'|'bass'}} score
 * @param {{beatsPerMeasure: number, title?: string}} opts
 * @returns {{width:number, height:number}}
 */
export function renderScore(VF, container, { measures, clef }, { beatsPerMeasure, title }) {
  const { Renderer, Stave, StaveNote, Voice, Formatter, Accidental, Beam, StaveTie } = VF;
  container.replaceChildren();

  if (!measures.length) {
    const p = document.createElement('p');
    p.textContent = 'Keine Töne erkannt — probier eine andere Aufnahme oder ein anderes Modell.';
    container.append(p);
    return { width: 0, height: 0 };
  }

  const perLine = Math.max(1, MEASURES_PER_LINE);
  const cols = Math.min(perLine, measures.length);
  const lines = Math.ceil(measures.length / perLine);
  const topMargin = title ? 54 : 24;
  const width = LEFT_MARGIN * 2 + MEASURE_WIDTH * cols;
  const height = topMargin + lines * LINE_HEIGHT + 24;

  const renderer = new Renderer(container, Renderer.Backends.SVG);
  renderer.resize(Math.max(width, 320), height);
  const ctx = renderer.getContext();

  if (title) {
    ctx.save();
    ctx.setFont('Georgia, serif', 17, 'bold');
    ctx.fillText(title, LEFT_MARGIN, 26);
    ctx.restore();
  }

  // Für Bindebögen wird die unmittelbar vorangehende Note gebraucht — auch
  // über eine Taktgrenze hinweg. Deshalb einmal flach durchlaufen und dabei
  // sammeln, statt pro Takt isoliert zu zeichnen.
  let prevNote = null;
  const ties = [];

  measures.forEach((measure, i) => {
    const col = i % perLine;
    const row = Math.floor(i / perLine);
    const x = LEFT_MARGIN + col * MEASURE_WIDTH;
    const y = topMargin + row * LINE_HEIGHT;

    const stave = new Stave(x, y, MEASURE_WIDTH);
    if (col === 0) {
      stave.addClef(clef);
      if (i === 0) stave.addTimeSignature(`${beatsPerMeasure}/4`);
    }
    if (i === measures.length - 1) stave.setEndBarType(VF.Barline?.type?.END ?? 6);
    stave.setContext(ctx).draw();

    const vexNotes = measure.map((slot) => {
      let note;
      if (slot.rest) {
        note = new StaveNote({ keys: [clef === 'bass' ? 'd/3' : 'b/4'], duration: `${slot.vex}r`, clef });
      } else {
        note = new StaveNote({ keys: slot.notes.map((n) => n.key), duration: slot.vex, clef });
        slot.notes.forEach((n, idx) => {
          if (n.sharp) note.addModifier(new Accidental('#'), idx);
        });
      }
      if (slot.tie && prevNote) ties.push({ firstNote: prevNote, lastNote: note });
      prevNote = slot.rest ? null : note;
      return note;
    });

    const voice = new Voice({ num_beats: beatsPerMeasure, beat_value: 4 });
    voice.setStrict(false); // Rundung aufs 16tel-Raster darf nicht hart abbrechen
    voice.addTickables(vexNotes);

    new Formatter().joinVoices([voice]).format([voice], MEASURE_WIDTH - 36);
    voice.draw(ctx, stave);

    Beam.generateBeams(vexNotes.filter((n) => !n.isRest())).forEach((b) => b.setContext(ctx).draw());
  });

  // Bindebögen erst zum Schluss zeichnen — die Noten brauchen dafür schon
  // ihre endgültige Position aus dem Voice/Formatter-Layout oben.
  ties.forEach(({ firstNote, lastNote }) => {
    new StaveTie({ firstNote, lastNote }).setContext(ctx).draw();
  });

  return { width, height };
}

const VEX_TO_XML_DURATION = { w: 'whole', h: 'half', q: 'quarter', 8: 'eighth', 16: '16th' };
const VEX_TO_DIVISIONS = { w: 16, h: 8, q: 4, 8: 2, 16: 1 }; // Teile pro Viertel = 4

const XML_STEP = { c: 'C', d: 'D', e: 'E', f: 'F', g: 'G', a: 'A', b: 'B' };

/** Quantisierte Takte -> MusicXML (zum Weiterbearbeiten in MuseScore o. ä.). */
export function toMusicXml({ measures, clef }, { beatsPerMeasure, title }) {
  const divisions = 4; // Teile pro Viertelnote
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const clefXml =
    clef === 'bass' ? '<clef><sign>F</sign><line>4</line></clef>' : '<clef><sign>G</sign><line>2</line></clef>';

  // Flach durchnummerieren, um je Slot zu wissen, ob ein Bindebogen davor
  // (tie-Flag dieses Slots) und/oder danach (tie-Flag des nächsten Slots)
  // beginnt/endet — Takt- und Dauer-Zerlegung spielt dafür keine Rolle mehr.
  const flat = measures.flat();
  const tieInto = flat.map((s) => !!s.tie);
  const tieOutOf = flat.map((_, i) => !!flat[i + 1]?.tie);
  let flatIdx = -1;

  const measuresXml = measures
    .map((measure, i) => {
      const attrs =
        i === 0
          ? `<attributes><divisions>${divisions}</divisions>` +
            `<time><beats>${beatsPerMeasure}</beats><beat-type>4</beat-type></time>${clefXml}</attributes>`
          : '';

      const notesXml = measure
        .map((slot) => {
          flatIdx += 1;
          const duration = VEX_TO_DIVISIONS[slot.vex] * (4 / 4); // Teile dieser Note (bei 4 Teilen/Viertel)
          const type = VEX_TO_XML_DURATION[slot.vex];
          if (slot.rest) {
            return `<note><rest/><duration>${duration}</duration><type>${type}</type></note>`;
          }

          const tieStart = tieOutOf[flatIdx];
          const tieStop = tieInto[flatIdx];
          const tieTags = (tieStop ? '<tie type="stop"/>' : '') + (tieStart ? '<tie type="start"/>' : '');
          const tiedNotations =
            tieStop || tieStart
              ? `<notations>${tieStop ? '<tied type="stop"/>' : ''}${tieStart ? '<tied type="start"/>' : ''}</notations>`
              : '';

          return slot.notes
            .map((n, idx) => {
              const letter = n.key[0];
              const octave = n.key.split('/')[1];
              const alter = n.sharp ? '<alter>1</alter>' : '';
              const chordTag = idx > 0 ? '<chord/>' : '';
              return (
                `<note>${chordTag}<pitch><step>${XML_STEP[letter]}</step>${alter}<octave>${octave}</octave></pitch>` +
                `<duration>${duration}</duration>${tieTags}<type>${type}</type>${tiedNotations}</note>`
              );
            })
            .join('');
        })
        .join('');

      return `<measure number="${i + 1}">${attrs}${notesXml}</measure>`;
    })
    .join('');

  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 4.0 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">\n` +
    `<score-partwise version="4.0"><work><work-title>${esc(title || 'Transkription')}</work-title></work>` +
    `<part-list><score-part id="P1"><part-name>Melodie</part-name></score-part></part-list>` +
    `<part id="P1">${measuresXml}</part></score-partwise>`
  );
}
