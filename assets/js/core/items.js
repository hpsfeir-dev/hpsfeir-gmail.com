/* Ein einheitlicher Zugriff auf alles Übbare: Wortschatz, eigene Wörter,
   Buchstaben. Alle Ansichten und der Drill arbeiten nur mit diesen Objekten. */
var Items = (function () {

  function all() {
    return DATA.vocab.concat(Store.custom);
  }

  function byId(id) {
    var hit = all().filter(function (v) { return v.id === id; })[0];
    if (hit) return hit;
    return letterItems().filter(function (v) { return v.id === id; })[0] || null;
  }

  function byDeck(deckId) {
    if (deckId === 'meine') return Store.custom.slice();
    return DATA.vocab.filter(function (v) { return v.deck === deckId; });
  }

  function ids(list) { return list.map(function (v) { return v.id; }); }

  /* Alle Decks inklusive des dynamischen Decks „Meine Wörter“. */
  function decks() {
    var d = DATA.decks.slice();
    d.push({ id: 'meine', title: 'Meine Wörter', icon: '✍️', level: 0,
             desc: 'Alles, was ihr selbst hinzugefügt habt.' });
    return d;
  }

  function deck(id) {
    return decks().filter(function (d) { return d.id === id; })[0];
  }

  /* Buchstaben als übbare Karten — für den Schrift-Drill. */
  function letterItems() {
    return DATA.letters.map(function (l) {
      return {
        id: 'L' + l.id, deck: 'schrift', letter: true,
        ar: l.ar, tr: l.tr, de: l.name + ' — ' + l.tr,
        note: l.sound, source: l
      };
    });
  }

  /* Suche über Deutsch, Arabisch und Umschrift. */
  function search(q) {
    var n = U.normLatin(q), a = U.normArabic(q);
    if (!q || (!n && !a)) return [];
    return all().filter(function (v) {
      return U.normLatin(v.de).indexOf(n) >= 0 ||
             U.normLatin(v.tr).indexOf(n) >= 0 ||
             U.normLatin(v.az || '').indexOf(n) >= 0 ||
             (a && U.normArabic(v.ar).indexOf(a) >= 0);
    }).slice(0, 40);
  }

  /* Pool für die Tageslektion: alles außer den Buchstaben. */
  function studyPool() {
    return ids(all());
  }

  /* Falsche Antwortmöglichkeiten — bevorzugt aus demselben Deck,
     damit die Auswahl fordernd bleibt. */
  function distractors(item, n, field) {
    field = field || 'de';
    // Buchstaben nur gegen Buchstaben antreten lassen, Wörter nur gegen Wörter
    var pool = item.letter ? letterItems() : all();
    var same = pool.filter(function (v) {
      return v.id !== item.id && v.deck === item.deck && v[field] && v[field] !== item[field];
    });
    var out = U.sample(same, n);
    if (out.length < n) {
      var rest = pool.filter(function (v) {
        return v.id !== item.id && v[field] && v[field] !== item[field] &&
               out.indexOf(v) < 0;
      });
      out = out.concat(U.sample(rest, n - out.length));
    }
    return out;
  }

  return {
    all: all, byId: byId, byDeck: byDeck, ids: ids,
    decks: decks, deck: deck, letterItems: letterItems,
    search: search, studyPool: studyPool, distractors: distractors
  };
})();
