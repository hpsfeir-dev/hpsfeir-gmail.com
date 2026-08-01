/* Fortschritt: Kennzahlen, Heatmap, Deckreife, Einstellungen, Sicherung. */
var StatsView = (function () {

  function render(view) {
    var p = Store.progress();
    var prof = Store.activeProfile();
    var ids = Items.studyPool();
    var s = SRS.stats(ids);

    view.appendChild(U.el('div', { class: 'page-head' }, [
      U.el('h2', { text: '📊 Fortschritt' }),
      U.el('p', { class: 'muted', text: 'Lernstand von ' + prof.name + '. Jedes Profil zählt für sich.' })
    ]));

    view.appendChild(U.el('div', { class: 'kpi-grid' }, [
      kpi('🔥', p.streak, 'Tage Serie'),
      kpi('⭐', p.xp, 'XP'),
      kpi('✅', s.sitzt, 'sitzen'),
      kpi('⏳', s.faellig, 'fällig'),
      kpi('🆕', s.neu, 'unberührt'),
      kpi('📚', s.total, 'Karten gesamt')
    ]));

    /* Gesamtreife */
    var pct = s.total ? Math.round((s.sitzt / s.total) * 100) : 0;
    view.appendChild(U.el('div', { class: 'card' }, [
      U.el('h3', { text: 'Gesamtreife' }),
      U.progressBar(pct, pct + '%'),
      U.el('p', { class: 'muted small', text:
        'Eine Karte gilt als „sitzt“, wenn der Wiederholungsabstand über 21 Tage liegt — dann ist sie im Langzeitgedächtnis angekommen.' })
    ]));

    /* Heatmap der letzten 12 Wochen */
    view.appendChild(U.el('div', { class: 'card' }, [
      U.el('h3', { text: 'Die letzten 12 Wochen' }),
      heatmap(p.history),
      U.el('div', { class: 'heat-legend muted' }, [
        U.el('span', { text: 'wenig' }),
        U.el('span', { class: 'heat-cell heat-1' }),
        U.el('span', { class: 'heat-cell heat-2' }),
        U.el('span', { class: 'heat-cell heat-3' }),
        U.el('span', { class: 'heat-cell heat-4' }),
        U.el('span', { text: 'viel' })
      ])
    ]));

    /* Reife je Wortfeld */
    var deckCard = U.el('div', { class: 'card' }, [U.el('h3', { text: 'Wortfelder' })]);
    Items.decks().forEach(function (d) {
      var dIds = Items.ids(Items.byDeck(d.id));
      if (!dIds.length) return;
      var ds = SRS.stats(dIds);
      var dp = Math.round((ds.sitzt / ds.total) * 100);
      deckCard.appendChild(U.el('div', { class: 'deck-stat', onclick: function () { location.hash = '#/learn/' + d.id; } }, [
        U.el('div', { class: 'dstat-head' }, [
          U.el('span', { text: d.icon + ' ' + d.title }),
          U.el('span', { class: 'muted', text: ds.sitzt + '/' + ds.total })
        ]),
        U.progressBar(dp)
      ]));
    });
    view.appendChild(deckCard);

    /* Schwachstellen */
    var weak = ids.filter(function (id) { return !SRS.isNew(id); })
      .map(function (id) { return { id: id, c: Store.progress().srs[id] }; })
      .filter(function (x) { return x.c.lapses > 0; })
      .sort(function (a, b) { return b.c.lapses - a.c.lapses; })
      .slice(0, 10);

    if (weak.length) {
      var wc = U.el('div', { class: 'card' }, [
        U.el('h3', { text: '🎯 Deine Wackelkandidaten' }),
        U.el('p', { class: 'muted small', text: 'Diese Wörter sind dir am häufigsten entfallen.' })
      ]);
      weak.forEach(function (x) {
        var it = Items.byId(x.id);
        if (!it) return;
        wc.appendChild(U.el('div', { class: 'weak-row' }, [
          U.el('span', { class: 'wr-ar', lang: 'ar', dir: 'rtl', text: it.ar }),
          U.el('span', { class: 'wr-de', text: it.de }),
          U.el('span', { class: 'wr-lapse', text: x.c.lapses + '×' })
        ]));
      });
      wc.appendChild(U.el('button', { class: 'btn btn-primary btn-block', text: '▶ Wackelkandidaten üben',
        onclick: function () {
          Drill.start({ ids: weak.map(function (x) { return x.id; }), title: 'Wackelkandidaten',
            limit: weak.length, maxNew: 0, backTo: '#/stats' });
        } }));
      view.appendChild(wc);
    }

    view.appendChild(settingsCard());
  }

  function heatmap(history) {
    var box = U.el('div', { class: 'heatmap' });
    var days = 84;
    var start = U.addDays(U.today(), -(days - 1));
    var max = 1;
    Object.keys(history).forEach(function (k) { if (history[k] > max) max = history[k]; });

    for (var w = 0; w < 12; w++) {
      var col = U.el('div', { class: 'heat-col' });
      for (var d = 0; d < 7; d++) {
        var date = U.addDays(start, w * 7 + d);
        var n = history[date] || 0;
        var lvl = n === 0 ? 0 : n >= max * 0.75 ? 4 : n >= max * 0.5 ? 3 : n >= max * 0.25 ? 2 : 1;
        col.appendChild(U.el('div', {
          class: 'heat-cell heat-' + lvl,
          title: date + ': ' + n + ' Antworten'
        }));
      }
      box.appendChild(col);
    }
    return box;
  }

  function settingsCard() {
    var c = U.el('div', { class: 'card' }, [U.el('h3', { text: '⚙️ Einstellungen' })]);

    c.appendChild(toggle('Chat-Arabisch (Arabizi) mitanzeigen', 'showArabizi'));
    c.appendChild(toggle('Sprachausgabe aktiv', 'tts'));

    /* Tagesziel */
    var gWrap = U.el('div', { class: 'field' });
    gWrap.appendChild(U.el('label', { text: 'Tagesziel: Karten pro Tag' }));
    var seg = U.el('div', { class: 'seg' });
    [10, 20, 30, 50].forEach(function (n) {
      var b = U.el('button', { class: 'seg-btn' + (Store.settings.dailyGoal === n ? ' is-on' : ''), text: String(n),
        onclick: function () {
          Store.settings.dailyGoal = n; Store.save();
          Array.prototype.forEach.call(seg.children, function (x) { x.classList.remove('is-on'); });
          b.classList.add('is-on');
        } });
      seg.appendChild(b);
    });
    gWrap.appendChild(seg);
    c.appendChild(gWrap);

    /* Sprechtempo */
    var rWrap = U.el('div', { class: 'field' });
    rWrap.appendChild(U.el('label', { text: 'Sprechtempo' }));
    var rSeg = U.el('div', { class: 'seg' });
    [[0.6, 'langsam'], [0.8, 'normal'], [1, 'zügig']].forEach(function (r) {
      var b = U.el('button', { class: 'seg-btn' + (Store.settings.ttsRate === r[0] ? ' is-on' : ''), text: r[1],
        onclick: function () {
          Store.settings.ttsRate = r[0]; Store.save();
          Array.prototype.forEach.call(rSeg.children, function (x) { x.classList.remove('is-on'); });
          b.classList.add('is-on');
          TTS.speak('مرحبا كيفك');
        } });
      rSeg.appendChild(b);
    });
    rWrap.appendChild(rSeg);
    c.appendChild(rWrap);

    if (!TTS.hasArabicVoice()) {
      c.appendChild(U.el('div', { class: 'note-card', text:
        'ℹ️ Auf diesem Gerät ist keine arabische Systemstimme installiert. Unter Windows: Einstellungen → Zeit und Sprache → Sprache → Arabisch hinzufügen. Auf iPhone/Android und Mac ist sie meist schon dabei.' }));
    }

    c.appendChild(U.el('div', { class: 'row-actions' }, [
      U.el('button', { class: 'btn btn-ghost', text: '⬇ Sicherung speichern', onclick: MyWordsView.exportFile }),
      U.el('button', { class: 'btn btn-ghost', text: '⬆ Sicherung laden', onclick: MyWordsView.importFile }),
      U.el('button', { class: 'btn btn-danger', text: 'Lernstand zurücksetzen',
        onclick: function () {
          U.modal('Lernstand zurücksetzen?', U.el('p', { text:
            'Der komplette Fortschritt von ' + Store.activeProfile().name + ' wird gelöscht: Serie, XP und alle Wiederholungsdaten. Eigene Wörter bleiben erhalten.' }), [
            { label: 'Abbrechen' },
            { label: 'Zurücksetzen', primary: true, onClick: function () {
              Store.resetProgress(); App.render(); U.toast('Zurückgesetzt.');
            } }
          ]);
        } })
    ]));
    return c;
  }

  function toggle(label, key) {
    var w = U.el('label', { class: 'switch-row' });
    var cb = U.el('input', { type: 'checkbox' });
    cb.checked = !!Store.settings[key];
    cb.addEventListener('change', function () { Store.settings[key] = cb.checked; Store.save(); });
    w.appendChild(cb);
    w.appendChild(U.el('span', { text: label }));
    return w;
  }

  function kpi(icon, val, label) {
    return U.el('div', { class: 'kpi' }, [
      U.el('div', { class: 'kpi-icon', text: icon }),
      U.el('div', { class: 'kpi-val', text: String(val) }),
      U.el('div', { class: 'kpi-lab', text: label })
    ]);
  }

  return { render: render };
})();
