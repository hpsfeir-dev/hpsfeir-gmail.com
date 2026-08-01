/* Spaced Repetition nach SM-2, leicht abgewandelt für kurze Alltagssessions.
   Vier Bewertungen: 0 = nochmal, 3 = schwer, 4 = gut, 5 = einfach. */
var SRS = (function () {

  function card(id) {
    var srs = Store.progress().srs;
    if (!srs[id]) {
      srs[id] = { ef: 2.5, interval: 0, due: U.today(), reps: 0, lapses: 0, seen: 0, correct: 0 };
    }
    return srs[id];
  }

  function grade(id, q) {
    var c = card(id);
    c.seen += 1;
    if (q >= 3) c.correct += 1;

    if (q < 3) {
      // Rückschlag: morgen erneut, Leichtigkeit sinkt leicht
      c.reps = 0;
      c.lapses += 1;
      c.interval = 0;
      c.ef = Math.max(1.3, c.ef - 0.2);
      c.due = U.today();
    } else {
      c.reps += 1;
      if (c.reps === 1) c.interval = 1;
      else if (c.reps === 2) c.interval = 3;
      else c.interval = Math.round(c.interval * c.ef);
      // SM-2 Leichtigkeitsformel
      c.ef = Math.max(1.3, c.ef + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)));
      if (q === 5) c.interval = Math.max(c.interval, Math.round(c.interval * 1.3));
      c.due = U.addDays(U.today(), Math.max(1, c.interval));
    }
    Store.touchDay();
    Store.addXp(q >= 3 ? 10 : 3);
    Store.save();
    return c;
  }

  function isDue(id) {
    var srs = Store.progress().srs;
    var c = srs[id];
    if (!c) return false;
    return U.dayDiff(c.due, U.today()) >= 0;
  }

  function isNew(id) { return !Store.progress().srs[id]; }

  /* Reifegrad einer Karte für die Fortschrittsanzeige. */
  function stage(id) {
    var c = Store.progress().srs[id];
    if (!c) return 'neu';
    if (c.interval >= 21) return 'sitzt';
    if (c.interval >= 7) return 'stabil';
    if (c.reps > 0) return 'am lernen';
    return 'wackelig';
  }

  function stats(ids) {
    var out = { total: ids.length, neu: 0, faellig: 0, lernen: 0, sitzt: 0 };
    ids.forEach(function (id) {
      if (isNew(id)) { out.neu++; return; }
      var st = stage(id);
      if (st === 'sitzt') out.sitzt++; else out.lernen++;
      if (isDue(id)) out.faellig++;
    });
    return out;
  }

  /* Stellt eine Session zusammen: erst Fälliges, dann Neues. */
  function buildQueue(ids, opts) {
    opts = opts || {};
    var maxNew = opts.maxNew == null ? 8 : opts.maxNew;
    var limit = opts.limit || 20;

    var due = ids.filter(function (id) { return !isNew(id) && isDue(id); });
    var fresh = ids.filter(isNew);

    due.sort(function (a, b) {
      var ca = Store.progress().srs[a], cb = Store.progress().srs[b];
      return U.dayDiff(ca.due, cb.due);
    });

    fresh = U.shuffle(fresh);

    var queue = due.slice(0, Math.max(0, limit - Math.min(maxNew, fresh.length)));
    queue = queue.concat(fresh.slice(0, maxNew));

    // Zu wenig zusammengekommen? Erst die schwächsten bekannten Karten nachlegen …
    if (queue.length < limit) {
      var rest = ids.filter(function (id) { return queue.indexOf(id) < 0 && !isNew(id); });
      rest.sort(function (a, b) {
        return Store.progress().srs[a].ef - Store.progress().srs[b].ef;
      });
      queue = queue.concat(rest.slice(0, limit - queue.length));
    }

    // … und wenn immer noch Platz ist (typisch am Anfang, wo alles neu ist),
    // mit weiteren neuen Karten auffüllen statt eine 6-Karten-Session zu liefern.
    if (queue.length < limit) {
      queue = queue.concat(fresh.slice(maxNew, maxNew + (limit - queue.length)));
    }

    return U.shuffle(queue).slice(0, limit);
  }

  return {
    card: card, grade: grade, isDue: isDue, isNew: isNew,
    stage: stage, stats: stats, buildQueue: buildQueue
  };
})();
