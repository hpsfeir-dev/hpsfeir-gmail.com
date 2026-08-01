/* Duell: zwei Profile, ein Gerät, abwechselnd. Jede Antwort zählt für den
   Lernstand des jeweiligen Profils — es ist also Spiel und Übung zugleich. */
var DuelView = (function () {

  var G = null;

  function render(view) {
    if (G && !G.finished) return renderRound(view);
    if (G && G.finished) return renderResult(view);
    return renderSetup(view);
  }

  function renderSetup(view) {
    var profs = Store.state.profiles;

    view.appendChild(U.el('div', { class: 'page-head' }, [
      U.el('h2', { text: '⚔️ Duell' }),
      U.el('p', { class: 'muted', text: 'Ihr beide an einem Gerät, abwechselnd. Jede Antwort zählt gleichzeitig für den eigenen Lernstand — kein verlorenes Üben.' })
    ]));

    var rounds = 12;
    var deckId = 'alle';

    var card = U.el('div', { class: 'card' });
    card.appendChild(U.el('h3', { text: 'Spieler' }));
    card.appendChild(U.el('div', { class: 'duel-players' }, [
      U.el('div', { class: 'duel-player' }, [
        U.el('div', { class: 'dp-avatar', text: profs[0].avatar }),
        U.el('div', { class: 'dp-name', text: profs[0].name })
      ]),
      U.el('div', { class: 'duel-vs', text: 'VS' }),
      U.el('div', { class: 'duel-player' }, [
        U.el('div', { class: 'dp-avatar', text: profs[1].avatar }),
        U.el('div', { class: 'dp-name', text: profs[1].name })
      ])
    ]));
    card.appendChild(U.el('p', { class: 'muted small', text: 'Namen ändern: oben rechts auf das Profil tippen.' }));

    card.appendChild(U.el('h3', { text: 'Wortfeld' }));
    var sel = U.el('select', { class: 'input' });
    sel.appendChild(U.el('option', { value: 'alle', text: 'Alles gemischt' }));
    Items.decks().forEach(function (d) {
      if (d.id === 'meine' && !Store.custom.length) return;
      sel.appendChild(U.el('option', { value: d.id, text: d.icon + ' ' + d.title }));
    });
    sel.addEventListener('change', function () { deckId = sel.value; });
    card.appendChild(sel);

    card.appendChild(U.el('h3', { text: 'Runden' }));
    var rowR = U.el('div', { class: 'seg' });
    [8, 12, 20].forEach(function (n) {
      var b = U.el('button', { class: 'seg-btn' + (n === rounds ? ' is-on' : ''), text: n + ' Fragen',
        onclick: function () {
          rounds = n;
          Array.prototype.forEach.call(rowR.children, function (c) { c.classList.remove('is-on'); });
          b.classList.add('is-on');
        } });
      rowR.appendChild(b);
    });
    card.appendChild(rowR);

    card.appendChild(U.el('button', { class: 'btn btn-primary btn-block', text: 'Yalla, los!',
      onclick: function () { startGame(deckId, rounds); } }));
    view.appendChild(card);
  }

  function startGame(deckId, rounds) {
    var pool = deckId === 'alle' ? Items.all() : Items.byDeck(deckId);
    if (pool.length < 6) return U.toast('Zu wenig Wörter in diesem Wortfeld.', 'warn');

    var profs = Store.state.profiles;
    G = {
      players: [
        { id: profs[0].id, name: profs[0].name, avatar: profs[0].avatar, score: 0, streak: 0 },
        { id: profs[1].id, name: profs[1].name, avatar: profs[1].avatar, score: 0, streak: 0 }
      ],
      questions: U.sample(pool, rounds),
      turn: 0,
      index: 0,
      finished: false,
      savedActive: Store.state.active
    };
    App.render();
  }

  function renderRound(view) {
    var q = G.questions[G.index];
    var p = G.players[G.turn];

    view.appendChild(U.el('div', { class: 'duel-bar' }, [
      score(G.players[0], G.turn === 0),
      U.el('div', { class: 'duel-round', text: (G.index + 1) + ' / ' + G.questions.length }),
      score(G.players[1], G.turn === 1)
    ]));

    var card = U.el('div', { class: 'card drill-card duel-card' });
    card.appendChild(U.el('div', { class: 'duel-turn', text: p.avatar + '  ' + p.name + ' ist dran' }));

    // Richtung zufällig: mal Arabisch→Deutsch, mal umgekehrt
    var arToDe = Math.random() < 0.6;
    if (arToDe) {
      card.appendChild(U.el('div', { class: 'q-label', text: 'Was bedeutet das?' }));
      card.appendChild(U.el('div', { class: 'q-arabic', lang: 'ar', dir: 'rtl', text: q.ar }));
      card.appendChild(U.el('div', { class: 'q-sub' }, [U.el('span', { text: q.tr }), TTS.button(q.ar)]));
    } else {
      card.appendChild(U.el('div', { class: 'q-label', text: 'Wie heißt das auf Libanesisch?' }));
      card.appendChild(U.el('div', { class: 'q-german', text: q.de }));
    }

    var field = arToDe ? 'de' : 'ar';
    var opts = U.shuffle([q].concat(Items.distractors(q, 3, field)));
    var box = U.el('div', { class: 'options' });
    var done = false;

    opts.forEach(function (o) {
      var b = U.el('button', {
        class: 'option' + (arToDe ? '' : ' option-ar'),
        lang: arToDe ? 'de' : 'ar', dir: arToDe ? 'ltr' : 'rtl',
        text: o[field],
        onclick: function () {
          if (done) return;
          done = true;
          var ok = o.id === q.id;
          b.classList.add(ok ? 'is-right' : 'is-wrong');
          if (!ok) {
            Array.prototype.forEach.call(box.children, function (c) {
              if (c.textContent === q[field]) c.classList.add('is-right');
            });
          }
          // Punkte: Serie belohnen
          if (ok) { p.streak += 1; p.score += 10 + (p.streak >= 3 ? 5 : 0); }
          else p.streak = 0;

          // Lernstand des jeweiligen Spielers pflegen
          gradeFor(p.id, q.id, ok ? 4 : 0);

          card.appendChild(U.el('div', { class: 'feedback ' + (ok ? 'fb-ok' : 'fb-no') }, [
            U.el('div', { class: 'fb-title', text: ok ? '✓ ' + p.name + ' punktet!' : '✗ Daneben' }),
            U.el('div', { class: 'fb-word' }, [
              U.el('span', { class: 'fb-ar', lang: 'ar', dir: 'rtl', text: q.ar }),
              U.el('span', { class: 'fb-tr', text: q.tr })
            ]),
            U.el('div', { class: 'fb-de', text: q.de })
          ]));

          card.appendChild(U.el('button', { class: 'btn btn-primary btn-block', text: 'Weiter →',
            onclick: function () {
              G.index += 1;
              G.turn = 1 - G.turn;
              if (G.index >= G.questions.length) G.finished = true;
              App.render();
            } }));
        }
      });
      box.appendChild(b);
    });
    card.appendChild(box);
    view.appendChild(card);

    view.appendChild(U.el('div', { class: 'row-actions' }, [
      U.el('button', { class: 'btn btn-ghost btn-sm', text: 'Duell abbrechen',
        onclick: function () { G = null; App.render(); } })
    ]));
  }

  /* Bewertet eine Antwort im Lernstand des angegebenen Profils. */
  function gradeFor(profileId, itemId, quality) {
    var prev = Store.state.active;
    Store.state.active = profileId;
    SRS.grade(itemId, quality);
    Store.state.active = prev;
    Store.save();
  }

  function score(p, active) {
    return U.el('div', { class: 'duel-score' + (active ? ' is-turn' : '') }, [
      U.el('div', { class: 'ds-avatar', text: p.avatar }),
      U.el('div', { class: 'ds-name', text: p.name }),
      U.el('div', { class: 'ds-pts', text: String(p.score) })
    ]);
  }

  function renderResult(view) {
    var a = G.players[0], b = G.players[1];
    var winner = a.score === b.score ? null : (a.score > b.score ? a : b);

    view.appendChild(U.el('div', { class: 'card summary' }, [
      U.el('div', { class: 'summary-emoji', text: winner ? '🏆' : '🤝' }),
      U.el('h2', { text: winner ? winner.name + ' gewinnt!' : 'Unentschieden!' }),
      U.el('p', { class: 'muted', text: winner ? 'mabrūk — مبروك' : 'Beide gleich stark. Revanche?' }),
      U.el('div', { class: 'duel-final' }, [
        U.el('div', { class: 'df-side' }, [
          U.el('div', { class: 'df-avatar', text: a.avatar }),
          U.el('div', { class: 'df-name', text: a.name }),
          U.el('div', { class: 'df-score', text: String(a.score) })
        ]),
        U.el('div', { class: 'df-vs', text: '–' }),
        U.el('div', { class: 'df-side' }, [
          U.el('div', { class: 'df-avatar', text: b.avatar }),
          U.el('div', { class: 'df-name', text: b.name }),
          U.el('div', { class: 'df-score', text: String(b.score) })
        ])
      ]),
      U.el('p', { class: 'muted small', text: 'Alle Antworten sind in euren jeweiligen Lernstand eingeflossen.' }),
      U.el('div', { class: 'summary-actions' }, [
        U.el('button', { class: 'btn btn-primary', text: 'Revanche',
          onclick: function () { G = null; App.render(); } }),
        U.el('button', { class: 'btn btn-ghost', text: 'Zur Startseite',
          onclick: function () { G = null; location.hash = '#/home'; } })
      ])
    ]));
  }

  return { render: render };
})();
