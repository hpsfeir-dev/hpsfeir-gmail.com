/* Der Übungsmotor. Baut aus einer Kartenliste eine Session mit wechselnden
   Aufgabentypen und meldet jede Antwort an die SRS-Engine. */
var Drill = (function () {

  var S = null; // aktive Session

  var TYPES = {
    'mc-ar-de':  { label: 'Erkennen',   min: 0 },
    'mc-de-ar':  { label: 'Produzieren',min: 0 },
    'listen':    { label: 'Hören',      min: 0 },
    'type-latin':{ label: 'Umschrift tippen', min: 1 },
    'type-ar':   { label: 'Arabisch schreiben', min: 2 },
    'cloze':     { label: 'Lückentext', min: 1 },
    'flash':     { label: 'Karteikarte',min: 0 }
  };

  function start(opts) {
    var queue = SRS.buildQueue(opts.ids, { limit: opts.limit || 20, maxNew: opts.maxNew });
    if (!queue.length) {
      U.toast('Keine Karten in dieser Auswahl.', 'warn');
      return;
    }
    S = {
      queue: queue,
      index: 0,
      title: opts.title || 'Übung',
      modes: opts.modes || null,   // Einschränkung auf bestimmte Aufgabentypen
      right: 0, wrong: 0,
      startXp: Store.progress().xp,
      wrongItems: [],
      backTo: opts.backTo || '#/learn'
    };
    location.hash = '#/drill';
    render();
  }

  /* Welcher Aufgabentyp passt zu dieser Karte? */
  function chooseType(item) {
    var c = Store.progress().srs[item.id];
    var reps = c ? c.reps : 0;
    var pool = [];

    if (S.modes) {
      pool = S.modes.slice();
    } else {
      pool = ['mc-ar-de', 'mc-de-ar', 'flash'];
      if (reps >= 1) pool.push('type-latin', 'mc-ar-de');
      if (reps >= 2 && item.ar) pool.push('type-ar');
      if (item.ex) pool.push('cloze');
      if (TTS.ready() && item.ar) pool.push('listen');
    }
    // Karten ohne Beispielsatz können keinen Lückentext haben
    pool = pool.filter(function (t) {
      if (t === 'cloze' && !item.ex) return false;
      if (t === 'type-ar' && !item.ar) return false;
      if (t === 'listen' && !item.ar) return false;
      return true;
    });
    return U.pick(pool.length ? pool : ['flash']);
  }

  function render() {
    var view = document.getElementById('view');
    U.clear(view);

    if (!S) { location.hash = '#/learn'; return; }
    if (S.index >= S.queue.length) return renderSummary(view);

    var item = Items.byId(S.queue[S.index]);
    if (!item) { S.index++; return render(); }

    var type = chooseType(item);
    var pct = Math.round((S.index / S.queue.length) * 100);

    var head = U.el('div', { class: 'drill-head' }, [
      U.el('button', { class: 'btn-icon', text: '✕', title: 'Session beenden',
        onclick: function () { S = null; location.hash = '#/learn'; } }),
      U.el('div', { class: 'drill-progress' }, [
        U.progressBar(pct, (S.index + 1) + ' / ' + S.queue.length)
      ]),
      U.el('span', { class: 'pill pill-type', text: TYPES[type].label })
    ]);
    view.appendChild(head);

    var card = U.el('div', { class: 'card drill-card' });
    view.appendChild(card);

    ({
      'mc-ar-de': mcArDe, 'mc-de-ar': mcDeAr, 'listen': listen,
      'type-latin': typeLatin, 'type-ar': typeAr, 'cloze': cloze, 'flash': flash
    })[type](card, item);
  }

  /* ---------- Aufgabentypen ---------- */

  function mcArDe(card, item) {
    card.appendChild(U.el('div', { class: 'q-label', text: 'Was bedeutet das?' }));
    card.appendChild(U.el('div', { class: 'q-arabic', lang: 'ar', dir: 'rtl', text: item.ar }));
    card.appendChild(U.el('div', { class: 'q-sub' }, [
      U.el('span', { text: item.tr }), TTS.button(item.ar)
    ]));
    choices(card, item, 'de', function (v) { return v.de; });
  }

  function mcDeAr(card, item) {
    card.appendChild(U.el('div', { class: 'q-label', text: 'Wie heißt das auf Libanesisch?' }));
    card.appendChild(U.el('div', { class: 'q-german', text: item.de }));
    choices(card, item, 'ar', function (v) { return v.ar; }, true);
  }

  function listen(card, item) {
    card.appendChild(U.el('div', { class: 'q-label', text: 'Hör zu — was bedeutet es?' }));
    var big = U.el('button', {
      class: 'listen-btn', title: 'Nochmal abspielen',
      onclick: function () { TTS.speak(item.ar); }
    }, ['🔊']);
    card.appendChild(big);
    if (!TTS.hasArabicVoice()) {
      card.appendChild(U.el('div', { class: 'q-sub muted',
        text: 'Keine arabische Stimme im System — hier hilft dir die Umschrift: ' + item.tr }));
    }
    TTS.speak(item.ar);
    choices(card, item, 'de', function (v) { return v.de; });
  }

  function choices(card, item, field, get, arabic) {
    var wrong = Items.distractors(item, 3, field);
    var opts = U.shuffle([item].concat(wrong));
    var box = U.el('div', { class: 'options' });
    var done = false;

    opts.forEach(function (o) {
      var b = U.el('button', {
        class: 'option' + (arabic ? ' option-ar' : ''),
        lang: arabic ? 'ar' : 'de', dir: arabic ? 'rtl' : 'ltr',
        text: get(o),
        onclick: function () {
          if (done) return;
          done = true;
          var ok = o.id === item.id;
          b.classList.add(ok ? 'is-right' : 'is-wrong');
          if (!ok) {
            Array.prototype.forEach.call(box.children, function (c) {
              if (c.textContent === get(item)) c.classList.add('is-right');
            });
          }
          answered(card, item, ok, ok ? 4 : 0);
        }
      });
      box.appendChild(b);
    });
    card.appendChild(box);
  }

  function typeLatin(card, item) {
    card.appendChild(U.el('div', { class: 'q-label', text: 'Schreib die Umschrift:' }));
    card.appendChild(U.el('div', { class: 'q-german', text: item.de }));
    card.appendChild(U.el('div', { class: 'q-hint muted',
      text: 'Sonderzeichen darfst du weglassen — „3ende“, „ende“ und „ʿende“ zählen alle.' }));

    var input = U.el('input', { class: 'input input-lg', type: 'text',
      placeholder: 'z. B. marhaba', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false' });
    card.appendChild(input);

    var check = function () {
      var ok = U.normLatin(input.value) === U.normLatin(item.tr) ||
               U.normLatin(input.value) === U.normLatin(item.az || '###');
      input.classList.add(ok ? 'is-right' : 'is-wrong');
      input.disabled = true;
      if (!ok) card.appendChild(U.el('div', { class: 'solution', text: 'Richtig: ' + item.tr }));
      answered(card, item, ok, ok ? 5 : 0);
    };
    input.addEventListener('keydown', function (e) { if (e.key === 'Enter') check(); });
    card.appendChild(U.el('button', { class: 'btn btn-primary btn-block', text: 'Prüfen', onclick: check }));
    setTimeout(function () { input.focus(); }, 50);
  }

  function typeAr(card, item) {
    card.appendChild(U.el('div', { class: 'q-label', text: 'Schreib es in arabischer Schrift:' }));
    card.appendChild(U.el('div', { class: 'q-german', text: item.de }));
    card.appendChild(U.el('div', { class: 'q-hint muted', text: 'Umschrift: ' + item.tr }));

    var input = U.el('input', { class: 'input input-lg input-ar', type: 'text',
      lang: 'ar', dir: 'rtl', placeholder: '…', autocomplete: 'off', spellcheck: 'false' });
    card.appendChild(input);
    ArKeyboard.attach(input, card);

    var check = function () {
      var ok = U.normArabic(input.value) === U.normArabic(item.ar);
      input.classList.add(ok ? 'is-right' : 'is-wrong');
      input.disabled = true;
      if (!ok) {
        card.appendChild(U.el('div', { class: 'solution', lang: 'ar', dir: 'rtl',
          text: 'Richtig: ' + item.ar }));
      }
      answered(card, item, ok, ok ? 5 : 0);
    };
    input.addEventListener('keydown', function (e) { if (e.key === 'Enter') check(); });
    card.appendChild(U.el('button', { class: 'btn btn-primary btn-block', text: 'Prüfen', onclick: check }));
  }

  function cloze(card, item) {
    var ex = item.ex;
    card.appendChild(U.el('div', { class: 'q-label', text: 'Welches Wort fehlt?' }));

    // Das Zielwort im Beispielsatz durch eine Lücke ersetzen
    var gapped = ex.ar.indexOf(item.ar) >= 0
      ? ex.ar.replace(item.ar, '____')
      : ex.ar;
    card.appendChild(U.el('div', { class: 'q-arabic', lang: 'ar', dir: 'rtl', text: gapped }));
    card.appendChild(U.el('div', { class: 'q-sub muted', text: ex.de }));

    var wrong = Items.distractors(item, 3, 'ar');
    var opts = U.shuffle([item].concat(wrong));
    var box = U.el('div', { class: 'options' });
    var done = false;
    opts.forEach(function (o) {
      var b = U.el('button', { class: 'option option-ar', lang: 'ar', dir: 'rtl', text: o.ar,
        onclick: function () {
          if (done) return;
          done = true;
          var ok = o.id === item.id;
          b.classList.add(ok ? 'is-right' : 'is-wrong');
          card.appendChild(U.el('div', { class: 'solution', lang: 'ar', dir: 'rtl', text: ex.ar }));
          card.appendChild(U.el('div', { class: 'solution-sub', text: ex.tr }));
          answered(card, item, ok, ok ? 4 : 0);
        } });
      box.appendChild(b);
    });
    card.appendChild(box);
  }

  function flash(card, item) {
    card.appendChild(U.el('div', { class: 'q-label', text: 'Weißt du es?' }));
    card.appendChild(U.el('div', { class: 'q-arabic', lang: 'ar', dir: 'rtl', text: item.ar }));

    var back = U.el('div', { class: 'flash-back', hidden: true }, [
      U.el('div', { class: 'q-sub' }, [U.el('span', { text: item.tr }), TTS.button(item.ar)]),
      Store.settings.showArabizi && item.az ? U.el('div', { class: 'q-azi muted', text: item.az }) : null,
      U.el('div', { class: 'q-german', text: item.de }),
      item.note ? U.el('div', { class: 'q-note', text: item.note }) : null
    ]);
    card.appendChild(back);

    var reveal = U.el('button', { class: 'btn btn-primary btn-block', text: 'Umdrehen',
      onclick: function () {
        back.hidden = false;
        reveal.remove();
        card.appendChild(gradeRow(item));
      } });
    card.appendChild(reveal);
  }

  function gradeRow(item) {
    var row = U.el('div', { class: 'grade-row' });
    [[0, 'Nochmal', 'g-again'], [3, 'Schwer', 'g-hard'], [4, 'Gut', 'g-good'], [5, 'Einfach', 'g-easy']]
      .forEach(function (g) {
        row.appendChild(U.el('button', { class: 'btn-grade ' + g[2], text: g[1],
          onclick: function () {
            SRS.grade(item.id, g[0]);
            if (g[0] >= 3) S.right++; else { S.wrong++; S.wrongItems.push(item.id); }
            S.index++;
            render();
          } }));
      });
    return row;
  }

  /* Nach einer bewerteten Aufgabe: Feedback zeigen und weiterschalten. */
  function answered(card, item, ok, quality) {
    SRS.grade(item.id, quality);
    if (ok) S.right++; else { S.wrong++; S.wrongItems.push(item.id); }

    var fb = U.el('div', { class: 'feedback ' + (ok ? 'fb-ok' : 'fb-no') }, [
      U.el('div', { class: 'fb-title', text: ok ? '✓ Richtig' : '✗ Leider nicht' }),
      U.el('div', { class: 'fb-word' }, [
        U.el('span', { class: 'fb-ar', lang: 'ar', dir: 'rtl', text: item.ar }),
        U.el('span', { class: 'fb-tr', text: item.tr }),
        TTS.button(item.ar)
      ]),
      U.el('div', { class: 'fb-de', text: item.de }),
      item.note ? U.el('div', { class: 'fb-note', text: item.note }) : null
    ]);
    card.appendChild(fb);

    var next = U.el('button', { class: 'btn btn-primary btn-block', text: 'Weiter →',
      onclick: function () { S.index++; render(); } });
    card.appendChild(next);
    setTimeout(function () { next.focus(); }, 60);

    // Enter schaltet weiter
    var onKey = function (e) {
      if (e.key === 'Enter') { document.removeEventListener('keydown', onKey); S.index++; render(); }
    };
    document.addEventListener('keydown', onKey);
  }

  /* ---------- Abschluss ---------- */

  function renderSummary(view) {
    var total = S.right + S.wrong;
    var pct = total ? Math.round((S.right / total) * 100) : 0;
    var gained = Store.progress().xp - S.startXp;
    var wrongIds = S.wrongItems.slice();
    var backTo = S.backTo;

    var box = U.el('div', { class: 'card summary' }, [
      U.el('div', { class: 'summary-emoji', text: pct >= 90 ? '🏆' : pct >= 70 ? '👏' : '💪' }),
      U.el('h2', { text: pct >= 90 ? '3āl el-3āl!' : pct >= 70 ? 'Mnīḥ ktīr!' : 'Shwayy shwayy!' }),
      U.el('p', { class: 'muted', text:
        pct >= 90 ? 'Bestens — das saß.' :
        pct >= 70 ? 'Sehr gut. Der Rest kommt beim nächsten Durchgang.' :
        'Langsam, langsam — genau so lernt man.' }),
      U.el('div', { class: 'summary-stats' }, [
        stat(S.right, 'richtig'), stat(S.wrong, 'falsch'),
        stat(pct + '%', 'Quote'), stat('+' + gained, 'XP')
      ])
    ]);

    var actions = U.el('div', { class: 'summary-actions' }, [
      wrongIds.length ? U.el('button', { class: 'btn btn-primary', text: 'Fehler nachholen (' + wrongIds.length + ')',
        onclick: function () { start({ ids: wrongIds, title: 'Fehler nachholen', limit: wrongIds.length, maxNew: 0, backTo: backTo }); } }) : null,
      U.el('button', { class: 'btn btn-ghost', text: 'Zurück',
        onclick: function () { S = null; location.hash = backTo; } })
    ]);
    box.appendChild(actions);
    view.appendChild(box);
    S.index = S.queue.length; // Session bleibt beendet
  }

  function stat(v, l) {
    return U.el('div', { class: 'stat' }, [
      U.el('div', { class: 'stat-val', text: String(v) }),
      U.el('div', { class: 'stat-lab', text: l })
    ]);
  }

  return { start: start, render: render, active: function () { return !!S; } };
})();
