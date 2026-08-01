/* Persistenz: zwei Profile, getrennter Lernstand, gemeinsame eigene Wörter. */
var Store = (function () {
  var KEY = 'lubnene.v1';
  var state;

  function fresh() {
    return {
      profiles: [
        { id: 'p1', name: 'Ich', avatar: '🧔' },
        { id: 'p2', name: 'Meine Frau', avatar: '👩' }
      ],
      active: 'p1',
      custom: [],            // eigene Wörter — für beide sichtbar
      progress: {},          // profileId -> Lernstand
      settings: { showArabizi: true, tts: true, dailyGoal: 20, ttsRate: 0.8 }
    };
  }

  function freshProgress() {
    return {
      srs: {},               // itemId -> { ef, interval, due, reps, lapses, seen, correct }
      xp: 0,
      streak: 0,
      lastDay: null,
      history: {},           // 'YYYY-MM-DD' -> Anzahl Antworten
      readGrammar: [],
      doneDialogues: []
    };
  }

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return fresh();
      var s = JSON.parse(raw);
      var base = fresh();
      // fehlende Felder auffüllen, damit ältere Stände weiterlaufen
      Object.keys(base).forEach(function (k) { if (s[k] == null) s[k] = base[k]; });
      Object.keys(base.settings).forEach(function (k) {
        if (s.settings[k] == null) s.settings[k] = base.settings[k];
      });
      return s;
    } catch (e) {
      return fresh();
    }
  }

  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch (e) {
      U.toast('Speicher voll — Fortschritt konnte nicht gesichert werden.', 'bad');
    }
  }

  function progress() {
    if (!state.progress[state.active]) state.progress[state.active] = freshProgress();
    var p = state.progress[state.active];
    var base = freshProgress();
    Object.keys(base).forEach(function (k) { if (p[k] == null) p[k] = base[k]; });
    return p;
  }

  function activeProfile() {
    return state.profiles.filter(function (p) { return p.id === state.active; })[0] || state.profiles[0];
  }

  function setActive(id) { state.active = id; save(); }

  function renameProfile(id, name, avatar) {
    state.profiles.forEach(function (p) {
      if (p.id === id) { p.name = name || p.name; if (avatar) p.avatar = avatar; }
    });
    save();
  }

  /* Tagesserie fortschreiben — wird bei jeder beantworteten Karte aufgerufen. */
  function touchDay() {
    var p = progress();
    var t = U.today();
    if (p.lastDay !== t) {
      if (p.lastDay && U.dayDiff(p.lastDay, t) === 1) p.streak += 1;
      else p.streak = 1;
      p.lastDay = t;
    }
    p.history[t] = (p.history[t] || 0) + 1;
    save();
  }

  function addXp(n) { progress().xp += n; save(); }

  /* --- eigene Wörter --- */
  function addCustom(word) {
    word.id = 'c' + Date.now() + Math.floor(Math.random() * 1000);
    word.deck = 'meine';
    word.custom = true;
    state.custom.push(word);
    save();
    return word;
  }

  function updateCustom(id, patch) {
    state.custom.forEach(function (w) {
      if (w.id === id) Object.keys(patch).forEach(function (k) { w[k] = patch[k]; });
    });
    save();
  }

  function removeCustom(id) {
    state.custom = state.custom.filter(function (w) { return w.id !== id; });
    Object.keys(state.progress).forEach(function (pid) {
      if (state.progress[pid].srs) delete state.progress[pid].srs[id];
    });
    save();
  }

  function exportAll() {
    return JSON.stringify({ app: 'lubnene', version: 1, exported: new Date().toISOString(), data: state }, null, 2);
  }

  function importAll(json) {
    var parsed = JSON.parse(json);
    var incoming = parsed && parsed.data ? parsed.data : parsed;
    if (!incoming || !incoming.profiles) throw new Error('Datei passt nicht zu dieser App.');
    state = incoming;
    save();
  }

  function resetProgress() {
    state.progress[state.active] = freshProgress();
    save();
  }

  state = load();

  return {
    get state() { return state; },
    get settings() { return state.settings; },
    get custom() { return state.custom; },
    progress: progress,
    activeProfile: activeProfile,
    setActive: setActive,
    renameProfile: renameProfile,
    touchDay: touchDay,
    addXp: addXp,
    addCustom: addCustom,
    updateCustom: updateCustom,
    removeCustom: removeCustom,
    exportAll: exportAll,
    importAll: importAll,
    resetProgress: resetProgress,
    save: save
  };
})();
