/* Dialoge: mitlesen, anhören, Übersetzung verbergen, Rolle übernehmen. */
var DialogueView = (function () {

  function render(view, params) {
    if (params && params.id) return renderOne(view, params.id);

    view.appendChild(U.el('div', { class: 'page-head' }, [
      U.el('h2', { text: 'Dialoge' }),
      U.el('p', { class: 'muted', text: 'Alltagsszenen aus Jounieh, Rayfoun, Harissa und Faraya. Erst mitlesen, dann eine Rolle übernehmen.' })
    ]));

    var done = Store.progress().doneDialogues || [];
    var grid = U.el('div', { class: 'dlg-grid' });
    DATA.dialogues.forEach(function (d) {
      grid.appendChild(U.el('button', { class: 'dlg-card', onclick: function () { location.hash = '#/dialogues/' + d.id; } }, [
        U.el('div', { class: 'dlg-icon', text: d.icon }),
        U.el('div', { class: 'dlg-body' }, [
          U.el('div', { class: 'dlg-title', text: d.title }),
          U.el('div', { class: 'dlg-scene', text: d.scene }),
          U.el('div', { class: 'dlg-meta muted', text: d.lines.length + ' Sätze · Stufe ' + d.level })
        ]),
        done.indexOf(d.id) >= 0 ? U.el('span', { class: 'dlg-done', text: '✓' }) : null
      ]));
    });
    view.appendChild(grid);
  }

  function renderOne(view, id) {
    var d = DATA.dialogues.filter(function (x) { return x.id === id; })[0];
    if (!d) { location.hash = '#/dialogues'; return; }

    view.appendChild(U.el('div', { class: 'page-head' }, [
      U.el('button', { class: 'btn-back', text: '← Dialoge', onclick: function () { location.hash = '#/dialogues'; } }),
      U.el('h2', { text: d.icon + ' ' + d.title }),
      U.el('p', { class: 'muted', text: d.scene })
    ]));

    var state = { showDe: true, showTr: true, hideRole: null };

    var controls = U.el('div', { class: 'card row-actions' });
    var lineBox = U.el('div', { class: 'card dlg-lines' });

    function paint() {
      U.clear(lineBox);
      d.lines.forEach(function (l) {
        var hidden = state.hideRole && l.s === state.hideRole;
        var row = U.el('div', { class: 'dl ' + (l.s === 'B' ? 'dl-me' : 'dl-them') });
        row.appendChild(U.el('div', { class: 'dl-who', text: l.who }));

        var bubble = U.el('div', { class: 'dl-bubble' });
        if (hidden) {
          var reveal = U.el('button', { class: 'dl-hidden', text: '👁 Deine Zeile — erst selbst sagen, dann aufdecken' });
          reveal.addEventListener('click', function () {
            reveal.replaceWith(content(l));
          });
          bubble.appendChild(reveal);
        } else {
          bubble.appendChild(content(l));
        }
        row.appendChild(bubble);
        lineBox.appendChild(row);
      });
    }

    function content(l) {
      return U.el('div', {}, [
        U.el('div', { class: 'dl-ar', lang: 'ar', dir: 'rtl' }, [
          U.el('span', { text: l.ar }), TTS.button(l.ar)
        ]),
        state.showTr ? U.el('div', { class: 'dl-tr', text: l.tr }) : null,
        state.showDe ? U.el('div', { class: 'dl-de muted', text: l.de }) : null
      ]);
    }

    function btn(label, fn, primary) {
      return U.el('button', { class: 'btn btn-sm ' + (primary ? 'btn-primary' : 'btn-ghost'), text: label, onclick: fn });
    }

    controls.appendChild(btn('▶ Ganzen Dialog anhören', function () {
      if (!TTS.hasArabicVoice()) return U.toast('Keine arabische Stimme im System gefunden.', 'warn');
      playAll(d.lines, 0);
    }, true));
    controls.appendChild(btn('🇩🇪 Übersetzung', function () { state.showDe = !state.showDe; paint(); }));
    controls.appendChild(btn('abc Umschrift', function () { state.showTr = !state.showTr; paint(); }));
    controls.appendChild(btn('🎭 Meine Rolle üben', function () {
      state.hideRole = state.hideRole ? null : 'B';
      U.toast(state.hideRole ? 'Deine Zeilen sind verdeckt — sprich sie selbst.' : 'Alle Zeilen sichtbar.');
      paint();
    }));

    view.appendChild(controls);
    paint();
    view.appendChild(lineBox);

    /* Vokabeln aus dem Dialog */
    if (d.focus && d.focus.length) {
      var words = d.focus.map(Items.byId).filter(Boolean);
      if (words.length) {
        view.appendChild(U.el('h3', { class: 'section-title', text: 'Wörter aus diesem Dialog' }));
        var wl = U.el('div', { class: 'card word-list' });
        words.forEach(function (w) { wl.appendChild(LearnView.wordEntry(w)); });
        view.appendChild(wl);

        view.appendChild(U.el('div', { class: 'card row-actions' }, [
          U.el('button', { class: 'btn btn-primary', text: '▶ Diese Wörter üben',
            onclick: function () {
              var p = Store.progress();
              if (p.doneDialogues.indexOf(d.id) < 0) { p.doneDialogues.push(d.id); Store.addXp(10); }
              Drill.start({ ids: Items.ids(words), title: d.title, limit: words.length,
                maxNew: words.length, backTo: '#/dialogues/' + d.id });
            } })
        ]));
      }
    }
  }

  /* Zeilen nacheinander vorlesen. */
  function playAll(lines, i) {
    if (i >= lines.length) return;
    TTS.speak(lines[i].ar);
    // Pause grob nach Satzlänge bemessen
    var wait = 1200 + lines[i].ar.length * 90;
    setTimeout(function () { playAll(lines, i + 1); }, wait);
  }

  return { render: render };
})();
