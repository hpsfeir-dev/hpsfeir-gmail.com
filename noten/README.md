# 🎼 Noten

**Melodie aus Audio — als Notenblatt, im Browser, auf deinem Gerät.**

Audiodatei hineinziehen, Tempo und Taktart angeben, fertig: ein Notenblatt-Entwurf
als SVG, PNG oder MusicXML (zum Weiterbearbeiten in MuseScore & Co.).

Die Tonhöhenerkennung ([`basic-pitch`](https://github.com/spotify/basic-pitch) von
Spotify, Apache License 2.0) läuft komplett im Browser, auf dem Prozessor — die
Aufnahme verlässt das Gerät nicht.

---

## Was das hier ist, und was nicht

Eine automatische Tonhöhenerkennung schätzt, welche Töne wann erklingen, und bringt
das auf ein Notenraster. **Tempo und Taktart werden nicht erkannt, sondern von dir
vorgegeben** — eine automatische Tempoerkennung ist ein eigenes, viel unsichereres
Problem, das hier bewusst nicht versucht wird.

Das Ergebnis ist ein **Entwurf zum Nachbessern**, keine fehlerfreie Transkription.
Das schafft kein automatisches System zuverlässig — auch bezahlte Dienste und
Profisoftware nicht. Am ehesten brauchbar bei einer **klaren Einzelstimme**
(Gesang, ein Instrument, keine dichte Band-Aufnahme).

## Starten

Braucht einen kleinen Webserver, genau wie [`../transkript/`](../transkript/):

```bash
# im Hauptordner des Projekts
python3 -m http.server 8000
```

… dann <http://localhost:8000/noten/> öffnen. Über GitHub Pages veröffentlicht
funktioniert es genauso.

## Bedienung

| | |
|---|---|
| **Tempo (BPM)** | Schläge pro Minute. Falsch geschätzt, verrutschen Notenwerte in den Takten — lieber hinterher per Hand grob schätzen, wenn unsicher. |
| **Taktart** | 2/4, 3/4, 4/4 oder 6/4. Nur gerade Nenner (Viertel) — kein 6/8 o. ä. |
| **Empfindlichkeit** | Wie leise ein Ton noch als Note zählt. Zu empfindlich, schleichen sich falsche Kurztöne ein; zu streng, fallen leise Töne unter den Tisch. |
| **Notenblatt** | Violin- oder Bassschlüssel wird automatisch nach der mittleren Tonhöhe gewählt. Gebundene Noten (Bindebogen) entstehen, wenn eine erkannte Note nicht sauber auf eine einzelne Notenlänge passt oder über eine Taktgrenze reicht. |

## Was es (noch) nicht kann

- **Keine Tempoerkennung** — Tempo und Taktart gibst du vor.
- **Eine Notenzeile**, keine Partitur mit mehreren Stimmen — bei Akkorden landen
  alle Töne auf derselben Zeile.
- **Kein 6/8- oder anderer zusammengesetzter Takt**, nur „x/4"-Taktarten.
- **Punktierte Noten werden vermieden** — eine Länge, die nicht genau auf einen
  Standardwert passt, wird stattdessen in mehrere gebundene Noten zerlegt.
  Rhythmisch richtig, aber nicht immer die eleganteste Schreibweise.

## Welches Ergebnis zu erwarten ist

Bei einer klaren Einzelstimme mit einigermaßen gleichmäßigem Tempo kommt ein
lesbarer Entwurf heraus, nah an dem, was tatsächlich erklingt. Bei Aufnahmen mit
freiem Timing (Rubato), mehreren Instrumenten gleichzeitig oder viel Hall braucht
das Ergebnis mehr Nacharbeit — das liegt an den Grenzen automatischer
Tonhöhenerkennung allgemein, nicht an dieser App im Speziellen.

## Aufbau

```
noten/
  index.html
  assets/
    css/app.css
    model/            basic-pitch-Modell (TensorFlow.js, ~900 KB, Apache 2.0)
    js/
      config.js        CDN-Adressen, Modellpfad
      audio.js          Datei -> Mono-Samples mit 22050 Hz (inkl. Wiedergabe-
                         Notweg für hartnäckige M4A-Dateien, wie in transkript/)
      pitch.js          Tonhöhenerkennung — Portierung von basic-pitch
                         (inference.ts + toMidi.ts) auf die globale tf-Laufzeit
      quantize.js       rohe Tonereignisse -> Takte auf einem Notenraster
      notation.js       Takte -> VexFlow-Notenbild + MusicXML-Export
      worker.js          klassischer Worker (tfjs ist ein UMD-Bundle, kein
                         ES-Modul) — lädt tfjs, Modell und pitch.js, rechnet
                         auf der CPU (kein Canvas im Worker für WebGL/GPU)
      app.js            Oberfläche, Worker-Steuerung, Export
```

Transformers.js in `transkript/` und tfjs hier sind zwei unabhängige
Bibliotheken für zwei unabhängige Aufgaben (Sprache vs. Tonhöhe) — deshalb zwei
getrennte Apps statt einer gemeinsamen.
