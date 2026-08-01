/* Themenübersicht: alle Wortfelder mit Fortschritt, Wortliste und Übungsstart. */
var LearnView = (function () {

  function render(view, params) {
    if (params && params.deck) return renderDeck(view, params.deck);

    view.appendChild(U.el('div', { class: 'page-head' }, [
      U.el('h2', { text: 'Nach Themen üben' }),
      U.el('p', { class: 'muted', text: 'Jedes Wortfeld ist eine eigene Sammlung. Der Balken zeigt, wie viel davon schon sitzt.' })
    ]));

    /* Sammelaktionen */
    var allIds = Items.studyPool();
    var st = SRS.stats(allIds);
    view.appendChild(U.el('div', { class: 'card row-actions' }, [
      U.el('button', { class: 'btn btn-primary', text: '🔁 Alles Fällige (' + st.faellig + ')',
        onclick: function () {
          var due = allIds.filter(function (id) { return !SRS.isNew(id) && SRS.isDue(id); });
          if (!due.length) return U.toast('Nichts fällig — gönn dir eine Pause.', 'ok');
          Drill.start({ ids: due, title: 'Wiederholung', limit: Math.min(30, due.length), maxNew: 0, backTo: '#/learn' });
        } }),
      U.el('button', { class: 'btn btn-ghost', text: '🎲 Zufallsmix',
        onclick: function () { Drill.start({ ids: allIds, title: 'Zufallsmix', limit: 20, maxNew: 8, backTo: '#/learn' }); } }),
      U.el('button', { class: 'btn btn-ghost', text: '👂 Nur Hören',
        onclick: function () { Drill.start({ ids: allIds, title: 'Hörtraining', limit: 15, maxNew: 4, modes: ['listen'], backTo: '#/learn' }); } })
    ]));

    /* Decks nach Stufe gruppiert */
    var levels = { 0: 'Eigene Sammlung', 1: 'Stufe 1 — Fundament', 2: 'Stufe 2 — Alltag', 3: 'Stufe 3 — Vertiefung', 4: 'Stufe 4 — Feinschliff' };
    var byLevel = {};
    Items.decks().forEach(function (d) { (byLevel[d.level] = byLevel[d.level] || []).push(d); });

    Object.keys(byLevel).sort().forEach(function (lvl) {
      view.appendChild(U.el('h3', { class: 'section-title', text: levels[lvl] || ('Stufe ' + lvl) }));
      var grid = U.el('div', { class: 'deck-grid' });
      byLevel[lvl].forEach(function (d) {
        var ids = Items.ids(Items.byDeck(d.id));
        var s = SRS.stats(ids);
        var pct = s.total ? Math.round((s.sitzt / s.total) * 100) : 0;
        grid.appendChild(U.el('button', { class: 'deck', onclick: function () { location.hash = '#/learn/' + d.id; } }, [
          U.el('div', { class: 'deck-icon', text: d.icon }),
          U.el('div', { class: 'deck-body' }, [
            U.el('div', { class: 'deck-title', text: d.title }),
            U.el('div', { class: 'deck-sub', text: d.desc }),
            U.progressBar(pct),
            U.el('div', { class: 'deck-meta muted', text:
              s.total + ' Wörter · ' + s.sitzt + ' sitzen' + (s.faellig ? ' · ' + s.faellig + ' fällig' : '') })
          ])
        ]));
      });
      view.appendChild(grid);
    });
  }

  function renderDeck(view, deckId) {
    var d = Items.deck(deckId);
    if (!d) { location.hash = '#/learn'; return; }
    var list = Items.byDeck(deckId);
    var ids = Items.ids(list);
    var s = SRS.stats(ids);

    view.appendChild(U.el('div', { class: 'page-head' }, [
      U.el('button', { class: 'btn-back', text: '← Themen', onclick: function () { location.hash = '#/learn'; } }),
      U.el('h2', { text: d.icon + ' ' + d.title }),
      U.el('p', { class: 'muted', text: d.desc })
    ]));

    if (!list.length) {
      view.appendChild(U.el('div', { class: 'card empty' }, [
        U.el('p', { text: 'Hier ist noch nichts. Leg deine ersten eigenen Wörter an.' }),
        U.el('button', { class: 'btn btn-primary', text: 'Wort hinzufügen',
          onclick: function () { location.hash = '#/mywords'; } })
      ]));
      return;
    }

    view.appendChild(U.el('div', { class: 'card row-actions' }, [
      U.el('button', { class: 'btn btn-primary', text: '▶ Üben',
        onclick: function () { Drill.start({ ids: ids, title: d.title, limit: Math.min(20, ids.length), maxNew: 8, backTo: '#/learn/' + deckId }); } }),
      U.el('button', { class: 'btn btn-ghost', text: '🃏 Karteikarten',
        onclick: function () { Drill.start({ ids: ids, title: d.title, limit: Math.min(20, ids.length), maxNew: 20, modes: ['flash'], backTo: '#/learn/' + deckId }); } }),
      U.el('button', { class: 'btn btn-ghost', text: '⌨️ Schreiben',
        onclick: function () { Drill.start({ ids: ids, title: d.title, limit: Math.min(12, ids.length), maxNew: 6, modes: ['type-ar'], backTo: '#/learn/' + deckId }); } })
    ]));

    view.appendChild(U.el('div', { class: 'chip-row' }, [
      chip(s.total + ' Wörter'), chip(s.neu + ' neu'), chip(s.faellig + ' fällig'), chip(s.sitzt + ' sitzen')
    ]));

    var listBox = U.el('div', { class: 'card word-list' });
    list.forEach(function (w) { listBox.appendChild(wordEntry(w)); });
    view.appendChild(listBox);
  }

  function wordEntry(w) {
    var stage = SRS.stage(w.id);
    var row = U.el('div', { class: 'we' }, [
      U.el('div', { class: 'we-main' }, [
        U.el('div', { class: 'we-ar', lang: 'ar', dir: 'rtl', text: w.ar }),
        U.el('div', { class: 'we-info' }, [
          U.el('div', { class: 'we-tr' }, [
            U.el('span', { text: w.tr }),
            Store.settings.showArabizi && w.az ? U.el('span', { class: 'we-az', text: ' · ' + w.az }) : null
          ]),
          U.el('div', { class: 'we-de', text: w.de })
        ]),
        U.el('div', { class: 'we-right' }, [
          U.el('span', { class: 'tag tag-' + stage.replace(' ', '-'), text: stage }),
          TTS.button(w.ar)
        ])
      ])
    ]);

    if (w.note || w.ex) {
      var det = U.el('div', { class: 'we-det', hidden: true }, [
        w.note ? U.el('div', { class: 'we-note', text: w.note }) : null,
        w.ex ? U.el('div', { class: 'we-ex' }, [
          U.el('div', { class: 'ex-ar', lang: 'ar', dir: 'rtl', text: w.ex.ar }),
          U.el('div', { class: 'ex-tr', text: w.ex.tr }),
          U.el('div', { class: 'ex-de muted', text: w.ex.de }),
          TTS.button(w.ex.ar)
        ]) : null
      ]);
      row.appendChild(det);
      row.querySelector('.we-main').style.cursor = 'pointer';
      row.querySelector('.we-main').addEventListener('click', function (e) {
        if (e.target.closest('.btn-speak')) return;
        det.hidden = !det.hidden;
      });
    }
    return row;
  }

  function chip(t) { return U.el('span', { class: 'chip', text: t }); }

  return { render: render, wordEntry: wordEntry };
})();
