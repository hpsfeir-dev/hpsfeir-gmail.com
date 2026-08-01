/* Router und Rahmen. Hash-basiert, damit die App auch per Doppelklick
   auf index.html läuft — ohne Server, ohne Build. */
var App = (function () {

  var routes = {
    'home':      function (v) { HomeView.render(v); },
    'learn':     function (v, rest) { LearnView.render(v, { deck: rest[0] }); },
    'drill':     function () { Drill.render(); },
    'alphabet':  function (v, rest) { AlphabetView.render(v, { letter: rest[0] }); },
    'grammar':   function (v, rest) { GrammarView.render(v, rest[0] === 'verbs' ? { verb: 'verbs' } : { lesson: rest[0] }); },
    'dialogues': function (v, rest) { DialogueView.render(v, { id: rest[0] }); },
    'mywords':   function (v) { MyWordsView.render(v); },
    'duel':      function (v) { DuelView.render(v); },
    'stats':     function (v) { StatsView.render(v); }
  };

  function parse() {
    var h = (location.hash || '#/home').replace(/^#\/?/, '');
    var parts = h.split('/').filter(Boolean);
    return { name: parts[0] || 'home', rest: parts.slice(1) };
  }

  function render() {
    var r = parse();
    var view = document.getElementById('view');

    // Der Drill zeichnet sich selbst, damit die laufende Session erhalten bleibt
    if (r.name === 'drill') {
      if (!Drill.active()) { location.hash = '#/learn'; return; }
      Drill.render();
      paintChrome(r.name);
      return;
    }

    U.clear(view);
    window.scrollTo(0, 0);
    (routes[r.name] || routes.home)(view, r.rest);
    paintChrome(r.name);
  }

  function paintChrome(active) {
    var prof = Store.activeProfile();
    var p = Store.progress();

    var chip = document.getElementById('profileChip');
    chip.textContent = prof.avatar + ' ' + prof.name;

    var streak = document.getElementById('topStreak');
    streak.textContent = p.streak > 0 ? '🔥 ' + p.streak : '';

    Array.prototype.forEach.call(document.querySelectorAll('#tabbar button'), function (b) {
      var target = (b.getAttribute('data-nav') || '').replace('#/', '');
      b.classList.toggle('is-active', target === active);
    });
  }

  /* Profilwechsel und -umbenennung */
  function profileMenu() {
    var box = U.el('div', { class: 'profile-menu' });

    Store.state.profiles.forEach(function (pr) {
      var isActive = pr.id === Store.state.active;
      var prog = Store.state.progress[pr.id];
      var row = U.el('div', { class: 'pm-row' + (isActive ? ' is-active' : '') }, [
        U.el('button', { class: 'pm-pick', onclick: function () {
          Store.setActive(pr.id);
          U.closeModal();
          render();
          U.toast('Profil: ' + pr.name);
        } }, [
          U.el('span', { class: 'pm-avatar', text: pr.avatar }),
          U.el('span', { class: 'pm-name', text: pr.name }),
          U.el('span', { class: 'pm-meta muted', text: prog ? (prog.xp + ' XP · 🔥' + prog.streak) : 'noch nichts gelernt' }),
          isActive ? U.el('span', { class: 'pm-check', text: '✓' }) : null
        ]),
        U.el('button', { class: 'btn-icon', text: '✏️', title: 'Umbenennen',
          onclick: function () { renameDialog(pr); } })
      ]);
      box.appendChild(row);
    });

    box.appendChild(U.el('p', { class: 'muted small', text:
      'Beide Profile teilen sich die eigenen Wörter, haben aber jeweils einen eigenen Lernstand.' }));

    U.modal('Profil', box, [{ label: 'Schließen' }]);
  }

  function renameDialog(pr) {
    var wrap = U.el('div');
    var nameIn = U.el('input', { class: 'input', type: 'text', value: pr.name, placeholder: 'Name' });
    wrap.appendChild(U.el('label', { text: 'Name' }));
    wrap.appendChild(nameIn);

    wrap.appendChild(U.el('label', { text: 'Symbol' }));
    var avaRow = U.el('div', { class: 'ava-row' });
    var chosen = pr.avatar;
    ['🧔', '👩', '🧑', '👨', '👵', '🧓', '🌲', '⭐', '🦁', '☕'].forEach(function (a) {
      var b = U.el('button', { class: 'ava' + (a === chosen ? ' is-on' : ''), text: a,
        onclick: function () {
          chosen = a;
          Array.prototype.forEach.call(avaRow.children, function (x) { x.classList.remove('is-on'); });
          b.classList.add('is-on');
        } });
      avaRow.appendChild(b);
    });
    wrap.appendChild(avaRow);

    U.modal('Profil bearbeiten', wrap, [
      { label: 'Abbrechen' },
      { label: 'Speichern', primary: true, onClick: function () {
        Store.renameProfile(pr.id, nameIn.value.trim() || pr.name, chosen);
        render();
        U.toast('Gespeichert.');
      } }
    ]);
  }

  function boot() {
    document.getElementById('profileChip').addEventListener('click', profileMenu);

    Array.prototype.forEach.call(document.querySelectorAll('[data-nav]'), function (b) {
      b.addEventListener('click', function () { location.hash = b.getAttribute('data-nav'); });
    });

    window.addEventListener('hashchange', render);

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') U.closeModal();
    });

    if (!location.hash) location.hash = '#/home';
    render();
  }

  return { render: render, boot: boot, profileMenu: profileMenu };
})();

document.addEventListener('DOMContentLoaded', App.boot);
