# 🎙️ Transkript

**Text aus MP3 — im Browser, auf deinem Gerät.**

Audiodatei hineinziehen, Sprache wählen, fertig: Transkript mit Zeitstempeln,
zum Kopieren oder als `.txt`, `.srt`, `.vtt`, `.md` oder `.json`.

Die Aufnahme wird nirgendwo hochgeladen. Die Spracherkennung
([Whisper](https://openai.com/research/whisper), über
[Transformers.js](https://huggingface.co/docs/transformers.js)) läuft komplett im
Browser — mit WebGPU auf der Grafikkarte, sonst auf dem Prozessor.

---

## Starten

Diese App braucht einen kleinen Webserver — ein Doppelklick auf `index.html`
genügt nicht, weil der Browser die Spracherkennung dann nicht laden darf.

```bash
# im Hauptordner des Projekts
python3 -m http.server 8000
```

… dann <http://localhost:8000/transkript/> öffnen. Über GitHub Pages
veröffentlicht funktioniert sie genauso.

Beim ersten Durchlauf lädt das Sprachmodell herunter (je nach Auswahl 45 MB bis
800 MB) — dafür braucht es einmalig Internet. Danach liegt es im Browserspeicher
und die App arbeitet offline.

## Am Handy

Über GitHub Pages veröffentlicht läuft die App auch auf dem Telefon. Im
Repository einmalig **Settings → Pages → Source: Deploy from a branch** wählen,
als Branch den Zweig mit dieser App nehmen und speichern. Nach ein bis zwei
Minuten liegt sie unter

```
https://hpsfeir-dev.github.io/hpsfeir-gmail.com/transkript/
```

Über *Teilen → Zum Home-Bildschirm* wird ein Symbol daraus.

Zwei Dinge am Telefon:

- Ohne WebGPU ist **Klein** voreingestellt, weil alles darüber auf einem
  Handy-Prozessor sehr lange braucht. Neuere iPhones und Android-Geräte
  bringen WebGPU mit — dann steht oben rechts „GPU" und Mittel oder Groß
  sind gut machbar.
- **Bildschirm anlassen.** Wechselst du die App oder sperrst das Telefon,
  pausiert der Browser die Erkennung.

## Was sie kann

| | |
|---|---|
| **Formate** | MP3, M4A, WAV, OGG, FLAC, WEBM, MP4 — alles, was der Browser abspielen kann |
| **Länge** | beliebig; die Aufnahme wird in überlappende 30-Sekunden-Fenster zerlegt |
| **Sprachen** | 25 zur Auswahl, plus automatische Erkennung — Deutsch ist voreingestellt |
| **Übersetzen** | statt zu transkribieren direkt ins Englische übersetzen |
| **Zeitstempel** | pro Abschnitt, pro Wort oder gar nicht |
| **Mitlesen** | Abschnitt antippen springt im Player an die Stelle, der laufende ist hervorgehoben |
| **Live** | der Text erscheint schon während der Erkennung |
| **Ausgeben** | Kopieren, `.txt`, `.srt`, `.vtt`, `.md`, `.json` |
| **Verlauf** | die letzten 15 Transkripte bleiben im Browser |

## Welches Modell?

| Modell | Größe | wofür |
|---|---|---|
| Klein | ≈ 45 MB | schneller Überblick, klare Aufnahmen |
| **Mittel** | ≈ 85 MB | Voreinstellung, guter Kompromiss |
| Groß | ≈ 250 MB | Dialekt, Nebengeräusche, Namen |
| Sehr groß | ≈ 800 MB | beste Qualität, nur mit WebGPU |

Auf dem Prozessor dauert die Erkennung ungefähr so lange wie die Aufnahme
selbst, mit WebGPU ein Vielfaches weniger. Ein Browser mit WebGPU (aktuelles
Chrome, Edge oder Safari 26) lohnt sich also. Oben rechts steht, welcher Weg
gerade genutzt wird.

## Wenn etwas klemmt

**„Die Spracherkennung konnte nicht geladen werden"** — beim ersten Start
braucht die App Internet, um Modell und Programmbibliothek zu holen. Auch
Werbeblocker und strenge Firmennetze blockieren gelegentlich `cdn.jsdelivr.net`
oder `huggingface.co`.

**„Format nicht lesbar"** — der Browser kann die Datei nicht dekodieren. MP3,
M4A, WAV, OGG und FLAC gehen überall.

**Der erste Durchlauf ist zäh, der zweite schnell** — so soll es sein: das
Modell wird nur einmal geladen.

**Zeitstempel pro Wort fehlen** — nicht jedes Modell bringt die nötigen
Ausrichtungsdaten mit; die App weicht dann auf Abschnitte aus und sagt es.

## Aufbau

```
transkript/
  index.html
  assets/css/app.css
  assets/js/
    config.js    Modelle, Sprachen, CDN-Adressen
    audio.js     Datei -> Mono-Samples mit 16 kHz
    formats.js   Zeitformate, TXT/SRT/VTT/MD/JSON
    worker.js    Whisper im eigenen Thread
    app.js       Oberfläche, Player, Verlauf
```

Alles ist statisch — kein Build, keine Abhängigkeiten im Repository.
Transformers.js kommt zur Laufzeit von jsDelivr (Ersatz: unpkg), die Version
steht in `config.js`.
