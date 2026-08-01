# لبنيني · Lubnēne

**Libanesisch-Arabisch lernen — so wie man es in Jounieh und Rayfoun spricht.**

Eine interaktive Lern-App für den Dialekt des Kesrouan (Mount Lebanon), gebaut
für zwei Menschen, die gemeinsam lernen: Sprechen verbessern, lesen und
schreiben lernen, und den Klang vom Berg treffen.

---

## Starten

**Ohne alles:** `index.html` doppelklicken. Fertig. Kein Server, keine
Installation, kein Internet nötig.

**Auf dem Handy:** Ordner aufs Gerät kopieren und `index.html` öffnen — oder das
Repository über GitHub Pages veröffentlichen und die Seite zum Startbildschirm
hinzufügen.

**Lokaler Server** (falls gewünscht):

```bash
python3 -m http.server 8000
# dann http://localhost:8000 öffnen
```

## Was drin ist

| | |
|---|---|
| **371 Wörter & Wendungen** | 18 Wortfelder, jeweils mit arabischer Schrift, Umschrift, Chat-Arabisch, deutscher Bedeutung und Aussprachenotiz |
| **28 Buchstaben** | alle vier Positionsformen, Vokalzeichen, Sonnen-/Mondbuchstaben, Handschrift-Trainer |
| **12 Dialoge** | Bäcker, Service-Taxi, Nachbarn, Familienessen, Arzt, Markt, Harissa, Faraya |
| **20 Grammatiklektionen** | vom Kesrouan-Klang bis zum Satzbau, mit Kurzquiz |
| **15 Verben** | vollständig konjugiert: Vergangenheit, b-Präsens, Imperativ |
| **Eigene Wörter** | selbst anlegen — landen sofort im normalen Übungspool |

## Die Besonderheiten

**Der Kesrouan-Klang.** Kein Hocharabisch, kein Ägyptisch. ق wird zum Knacklaut
(`ʾahwe`), ā wird zu ē (`bēb`, `Lubnēn`, `kēn`), die Femininendung wird `-e`
(`madrase`) — und `bonjour` und `merci ktīr` gehören selbstverständlich dazu.

**Sieben Aufgabentypen**, die mit der Karte mitwachsen: erkennen, produzieren,
hören, Umschrift tippen, arabisch schreiben, Lückentext, Karteikarte.

**Spaced Repetition (SM-2).** Jede Karte kommt genau dann wieder, wenn du sie
gerade zu vergessen beginnst. Verlauf bei „gut": 1 → 3 → 8 → 20 → 50 Tage.

**Zwei Profile.** Getrennter Lernstand, gemeinsame eigene Wörter — und ein
Duell-Modus, bei dem beide abwechselnd an einem Gerät spielen. Jede Antwort
zählt trotzdem für den eigenen Fortschritt.

**Arabische Bildschirmtastatur.** Zum Schreibenüben und Wörter-Anlegen, ohne
arabisches Systemlayout.

## Bedienung

| Bereich | Was du da tust |
|---|---|
| **Start** | Tageslektion, Wort des Tages, Wörter nachschlagen |
| **Üben** | Wortfelder einzeln, alles Fällige, Zufallsmix, reines Hörtraining |
| **Schrift** | Alphabet, Buchstabendetails, Handschrift-Trainer, Arabizi |
| **Grammatik** | 20 Lektionen + Verbtabellen |
| **Dialoge** | mitlesen, anhören, Übersetzung ausblenden, eigene Rolle üben |
| **Meine Wörter** | anlegen, bearbeiten, üben, sichern |
| **Duell** | zu zweit an einem Gerät |
| **Fortschritt** | Kennzahlen, Heatmap, Wackelkandidaten, Einstellungen |

Profil wechseln und umbenennen: oben rechts auf den Namen tippen.

## Sichern & übertragen

Der Lernstand liegt lokal im Browserspeicher dieses Geräts. Unter **Fortschritt →
Einstellungen** (oder in **Meine Wörter**) kannst du alles als JSON-Datei sichern
und auf einem anderen Gerät wieder laden — Profile, Fortschritt und eigene
Wörter inklusive.

> Löscht du die Browserdaten für diese Seite, ist der Lernstand weg. Also ab und
> zu sichern.

## Sprachausgabe

Die App nutzt die Sprachstimmen deines Systems. Auf iPhone, Mac und den meisten
Android-Geräten ist eine arabische Stimme dabei. Fehlt sie, sagt die App das und
du gehst nach der Umschrift — unter Windows lässt sie sich über *Einstellungen →
Zeit und Sprache → Sprache* nachinstallieren.

## Umschrift lesen

| Zeichen | Aussprache |
|---|---|
| `sh` | deutsch **sch** |
| `y` | deutsch **j** (wie in „ja") |
| `j` | französisch **j** (wie in „Journal") |
| `ʾ` | Knacklaut — auch für ق |
| `3` | ع, Kehlpressen |
| `ḥ` | scharfes Hauch-H |
| `kh` | **ch** wie in „Bach" |
| `gh` | das deutsche Rachen-**r** |
| `ē ā ī ū ō` | lange Vokale |

## Aufbau

```
index.html
assets/css/app.css
assets/js/
  data/      alphabet · vocab-core · vocab-plus · grammar · dialogues · verbs
  core/      util · store · srs · tts · keyboard · items
  views/     home · learn · drill · alphabet · grammar · dialogues · mywords · duel · stats
  app.js     Router
```

Eigene Wörter direkt im Code ergänzen? In `assets/js/data/vocab-plus.js` einem
Deck folgen — jeder Eintrag braucht `id`, `deck`, `ar`, `tr`, `de`, optional
`az`, `note` und `ex`.

---

Das ausführliche Konzept dahinter steht in [KONZEPT.md](KONZEPT.md).

*Yalla — shwayy shwayy betṣīr.* 🌲
