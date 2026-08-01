/* Grammatik als Nachschlagewerk + Konjugationstabellen. */
var GrammarView = (function () {

  function render(view, params) {
    if (params && params.lesson) return renderLesson(view, params.lesson);
    if (params && params.verb === 'verbs') return renderVerbs(view);

    view.appendChild(U.el('div', { class: 'page-head' }, [
      U.el('h2', { text: 'Grammatik' }),
      U.el('p', { class: 'muted', text: 'Zum Nachschlagen, nicht zum Auswendiglernen. Fang mit dem Kesrouan-Klang an — der bringt am meisten.' })
    ]));

    view.appendChild(U.el('div', { class: 'card row-actions' }, [
      U.el('button', { class: 'btn btn-primary', text: '📖 Verbtabellen',
        onclick: function () { location.hash = '#/grammar/verbs'; } })
    ]));

    var read = Store.progress().readGrammar || [];
    var byTag = {};
    DATA.grammar.forEach(function (g) { (byTag[g.tag] = byTag[g.tag] || []).push(g); });

    Object.keys(byTag).forEach(function (tag) {
      view.appendChild(U.el('h3', { class: 'section-title', text: tag }));
      var list = U.el('div', { class: 'gram-list' });
      byTag[tag].forEach(function (g) {
        list.appendChild(U.el('button', { class: 'gram-item', onclick: function () { location.hash = '#/grammar/' + g.id; } }, [
          U.el('div', { class: 'gi-left' }, [
            U.el('div', { class: 'gi-title', text: g.title }),
            U.el('div', { class: 'gi-intro', text: g.intro.slice(0, 95) + (g.intro.length > 95 ? '…' : '') })
          ]),
          U.el('div', { class: 'gi-right', text: read.indexOf(g.id) >= 0 ? '✓' : '›' })
        ]));
      });
      view.appendChild(list);
    });
  }

  function renderLesson(view, id) {
    var g = DATA.grammar.filter(function (x) { return x.id === id; })[0];
    if (!g) { location.hash = '#/grammar'; return; }
    var idx = DATA.grammar.indexOf(g);

    var p = Store.progress();
    if (p.readGrammar.indexOf(g.id) < 0) { p.readGrammar.push(g.id); Store.addXp(5); }

    view.appendChild(U.el('div', { class: 'page-head' }, [
      U.el('button', { class: 'btn-back', text: '← Grammatik', onclick: function () { location.hash = '#/grammar'; } }),
      U.el('h2', { text: g.title }),
      U.el('p', { class: 'lesson-intro', text: g.intro })
    ]));

    g.blocks.forEach(function (b) {
      if (b.type === 'table') view.appendChild(tableBlock(b));
      else if (b.type === 'note') view.appendChild(U.el('div', { class: 'card note-card', text: b.text }));
      else if (b.type === 'examples') view.appendChild(examplesBlock(b));
      else if (b.type === 'quiz') view.appendChild(quizBlock(b));
    });

    view.appendChild(U.el('div', { class: 'card row-actions' }, [
      idx > 0 ? U.el('button', { class: 'btn btn-ghost', text: '← Vorherige',
        onclick: function () { location.hash = '#/grammar/' + DATA.grammar[idx - 1].id; } }) : null,
      idx < DATA.grammar.length - 1 ? U.el('button', { class: 'btn btn-primary', text: 'Nächste Lektion →',
        onclick: function () { location.hash = '#/grammar/' + DATA.grammar[idx + 1].id; } }) : null
    ]));
  }

  function tableBlock(b) {
    var wrap = U.el('div', { class: 'card table-wrap' });
    var t = U.el('table', { class: 'gtable' });
    var thead = U.el('thead');
    var hr = U.el('tr');
    b.head.forEach(function (h) { hr.appendChild(U.el('th', { text: h })); });
    thead.appendChild(hr); t.appendChild(thead);
    var tb = U.el('tbody');
    b.rows.forEach(function (row) {
      var tr = U.el('tr');
      row.forEach(function (cell) {
        var td = U.el('td');
        // Arabische Anteile in der Zelle größer setzen
        if (/[؀-ۿ]/.test(cell)) {
          td.appendChild(U.el('span', { class: 'cell-mixed', lang: 'ar', text: cell }));
        } else td.textContent = cell;
        tr.appendChild(td);
      });
      tb.appendChild(tr);
    });
    t.appendChild(tb);
    wrap.appendChild(t);
    return wrap;
  }

  function examplesBlock(b) {
    var box = U.el('div', { class: 'card' });
    b.items.forEach(function (e) {
      box.appendChild(U.el('div', { class: 'ex-row' }, [
        U.el('div', { class: 'ex-ar', lang: 'ar', dir: 'rtl', text: e.ar }),
        U.el('div', { class: 'ex-tr', text: e.tr }),
        U.el('div', { class: 'ex-de muted', text: e.de }),
        TTS.button(e.ar)
      ]));
    });
    return box;
  }

  function quizBlock(b) {
    var box = U.el('div', { class: 'card quiz' }, [
      U.el('div', { class: 'quiz-q', text: '❓ ' + b.q })
    ]);
    var done = false;
    b.options.forEach(function (o, i) {
      box.appendChild(U.el('button', { class: 'option', text: o, onclick: function () {
        if (done) return; done = true;
        var ok = i === b.a;
        this.classList.add(ok ? 'is-right' : 'is-wrong');
        if (ok) Store.addXp(5);
        box.appendChild(U.el('div', { class: 'quiz-fb ' + (ok ? 'fb-ok' : 'fb-no'),
          text: ok ? '✓ Genau.' : '✗ Richtig wäre: ' + b.options[b.a] }));
      } }));
    });
    return box;
  }

  /* ---------- Verbtabellen ---------- */

  function renderVerbs(view) {
    view.appendChild(U.el('div', { class: 'page-head' }, [
      U.el('button', { class: 'btn-back', text: '← Grammatik', onclick: function () { location.hash = '#/grammar'; } }),
      U.el('h2', { text: 'Verbtabellen' }),
      U.el('p', { class: 'muted', text: 'Die 15 Verben, mit denen du den Alltag bestreitest — vollständig durchkonjugiert.' })
    ]));

    DATA.verbs.forEach(function (v) {
      var card = U.el('div', { class: 'card verb-card' });
      var head = U.el('button', { class: 'verb-head' }, [
        U.el('div', { class: 'vh-left' }, [
          U.el('div', { class: 'vh-ar', lang: 'ar', dir: 'rtl', text: v.ar }),
          U.el('div', { class: 'vh-info' }, [
            U.el('div', { class: 'vh-de', text: v.de }),
            U.el('div', { class: 'vh-tr muted', text: v.tr })
          ])
        ]),
        U.el('span', { class: 'vh-toggle', text: '▾' })
      ]);
      var body = U.el('div', { class: 'verb-body', hidden: true });

      body.appendChild(U.el('div', { class: 'note-inline', text: v.note }));
      body.appendChild(conjTable('Vergangenheit', v.past));
      body.appendChild(conjTable('Präsens (b-Form)', v.pres));
      body.appendChild(U.el('div', { class: 'imp-row' }, [
        U.el('strong', { text: 'Imperativ: ' }),
        U.el('span', { lang: 'ar', text: v.imp.join('  ·  ') })
      ]));
      body.appendChild(U.el('div', { class: 'note-inline muted', text:
        'Zukunft: raḥ + Präsens ohne b- · Verlauf: 3am + Präsens · Verneinung: ma davor.' }));

      head.addEventListener('click', function () {
        body.hidden = !body.hidden;
        head.querySelector('.vh-toggle').textContent = body.hidden ? '▾' : '▴';
      });
      card.appendChild(head); card.appendChild(body);
      view.appendChild(card);
    });
  }

  function conjTable(title, forms) {
    var wrap = U.el('div', { class: 'conj' }, [U.el('h4', { text: title })]);
    var t = U.el('table', { class: 'gtable gtable-sm' });
    var tb = U.el('tbody');
    DATA.pronouns.forEach(function (p, i) {
      tb.appendChild(U.el('tr', {}, [
        U.el('td', { class: 'conj-pron' }, [
          U.el('span', { lang: 'ar', text: p.ar }),
          U.el('span', { class: 'muted', text: ' ' + p.k })
        ]),
        U.el('td', { class: 'conj-form', lang: 'ar' }, [U.el('span', { text: forms[i] })])
      ]));
    });
    t.appendChild(tb);
    wrap.appendChild(t);
    return wrap;
  }

  return { render: render };
})();
