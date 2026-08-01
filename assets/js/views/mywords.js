/* Eigene Wörter: anlegen, bearbeiten, löschen, üben, sichern.
   Die Liste ist für beide Profile gemeinsam — der Lernstand bleibt getrennt. */
var MyWordsView = (function () {

  function render(view) {
    view.appendChild(U.el('div', { class: 'page-head' }, [
      U.el('h2', { text: '✍️ Meine Wörter' }),
      U.el('p', { class: 'muted', text: 'Alles, was ihr im Alltag aufschnappt. Neue Wörter landen sofort im normalen Übungspool — mit demselben Wiederholungsrhythmus wie der Rest.' })
    ]));

    view.appendChild(form(null));

    var words = Store.custom.slice().reverse();
    view.appendChild(U.el('div', { class: 'card row-actions' }, [
      U.el('button', { class: 'btn btn-primary', text: '▶ Eigene Wörter üben (' + words.length + ')',
        onclick: function () {
          if (!words.length) return U.toast('Erst ein Wort anlegen.', 'warn');
          Drill.start({ ids: Items.ids(words), title: 'Meine Wörter',
            limit: Math.min(20, words.length), maxNew: 10, backTo: '#/mywords' });
        } }),
      U.el('button', { class: 'btn btn-ghost', text: '⬇ Als Datei sichern', onclick: exportFile }),
      U.el('button', { class: 'btn btn-ghost', text: '⬆ Datei laden', onclick: importFile })
    ]));

    if (!words.length) {
      view.appendChild(U.el('div', { class: 'card empty' }, [
        U.el('p', { text: 'Noch keine eigenen Wörter.' }),
        U.el('p', { class: 'muted', text: 'Tipp: Notiere, was deine Frau oder ihre Familie sagt und du nicht kennst — genau diese Wörter bleiben am besten hängen.' })
      ]));
      return;
    }

    view.appendChild(U.el('h3', { class: 'section-title', text: words.length + ' eigene Wörter' }));
    var list = U.el('div', { class: 'card word-list' });
    words.forEach(function (w) {
      var row = U.el('div', { class: 'we we-custom' }, [
        U.el('div', { class: 'we-main' }, [
          U.el('div', { class: 'we-ar', lang: 'ar', dir: 'rtl', text: w.ar || '—' }),
          U.el('div', { class: 'we-info' }, [
            U.el('div', { class: 'we-tr', text: w.tr }),
            U.el('div', { class: 'we-de', text: w.de }),
            w.note ? U.el('div', { class: 'we-note', text: w.note }) : null
          ]),
          U.el('div', { class: 'we-right' }, [
            U.el('span', { class: 'tag tag-' + SRS.stage(w.id).replace(' ', '-'), text: SRS.stage(w.id) }),
            w.ar ? TTS.button(w.ar) : null,
            U.el('button', { class: 'btn-icon', text: '✏️', title: 'Bearbeiten',
              onclick: function () { editModal(w); } }),
            U.el('button', { class: 'btn-icon', text: '🗑', title: 'Löschen',
              onclick: function () {
                U.modal('Wort löschen?', U.el('p', { text: '„' + w.de + '“ wird endgültig entfernt — auch der Lernstand dazu.' }), [
                  { label: 'Abbrechen' },
                  { label: 'Löschen', primary: true, onClick: function () {
                    Store.removeCustom(w.id); App.render(); U.toast('Gelöscht.');
                  } }
                ]);
              } })
          ])
        ])
      ]);
      list.appendChild(row);
    });
    view.appendChild(list);
  }

  /* Formular zum Anlegen — auch als Modal für die Bearbeitung nutzbar. */
  function form(existing) {
    var card = U.el('div', { class: 'card' });
    card.appendChild(U.el('h3', { text: existing ? 'Wort bearbeiten' : '＋ Neues Wort' }));

    var fDe = field(card, 'Deutsch *', 'z. B. Leiter', existing && existing.de);
    var fTr = field(card, 'Umschrift *', 'z. B. sellom', existing && existing.tr);

    var arWrap = U.el('div', { class: 'field' });
    arWrap.appendChild(U.el('label', { text: 'Arabische Schrift' }));
    var fAr = U.el('input', { class: 'input input-ar', type: 'text', lang: 'ar', dir: 'rtl',
      placeholder: 'سلّم', value: (existing && existing.ar) || '' });
    arWrap.appendChild(fAr);
    ArKeyboard.toggleable(fAr, arWrap);
    card.appendChild(arWrap);

    var fAz = field(card, 'Chat-Arabisch (optional)', 'z. B. sellom', existing && existing.az);
    var fNote = field(card, 'Notiz (optional)', 'Wer sagt das? Wann?', existing && existing.note);

    var exWrap = U.el('div', { class: 'field' });
    exWrap.appendChild(U.el('label', { text: 'Beispielsatz (optional)' }));
    var exAr = U.el('input', { class: 'input input-ar', type: 'text', lang: 'ar', dir: 'rtl',
      placeholder: 'Arabisch', value: (existing && existing.ex && existing.ex.ar) || '' });
    var exTr = U.el('input', { class: 'input', type: 'text', placeholder: 'Umschrift',
      value: (existing && existing.ex && existing.ex.tr) || '' });
    var exDe = U.el('input', { class: 'input', type: 'text', placeholder: 'Deutsch',
      value: (existing && existing.ex && existing.ex.de) || '' });
    exWrap.appendChild(exAr); exWrap.appendChild(exTr); exWrap.appendChild(exDe);
    card.appendChild(exWrap);

    var submit = U.el('button', { class: 'btn btn-primary btn-block',
      text: existing ? 'Änderungen speichern' : 'Wort hinzufügen',
      onclick: function () {
        var de = fDe.value.trim(), tr = fTr.value.trim();
        if (!de || !tr) return U.toast('Deutsch und Umschrift werden gebraucht.', 'warn');
        var data = {
          de: de, tr: tr, ar: fAr.value.trim(), az: fAz.value.trim(), note: fNote.value.trim()
        };
        if (exAr.value.trim() || exDe.value.trim()) {
          data.ex = { ar: exAr.value.trim(), tr: exTr.value.trim(), de: exDe.value.trim() };
        }
        if (existing) {
          Store.updateCustom(existing.id, data);
          U.closeModal();
          U.toast('Gespeichert.');
        } else {
          Store.addCustom(data);
          U.toast('„' + de + '“ ist jetzt im Übungspool.', 'ok');
        }
        App.render();
      } });
    card.appendChild(submit);
    return card;
  }

  function field(parent, label, placeholder, value) {
    var w = U.el('div', { class: 'field' });
    w.appendChild(U.el('label', { text: label }));
    var i = U.el('input', { class: 'input', type: 'text', placeholder: placeholder, value: value || '' });
    w.appendChild(i);
    parent.appendChild(w);
    return i;
  }

  function editModal(w) {
    U.modal('Bearbeiten', form(w), [{ label: 'Abbrechen' }]);
  }

  /* --- Sichern & Laden --- */

  function exportFile() {
    var blob = new Blob([Store.exportAll()], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = U.el('a', { href: url, download: 'lubnene-sicherung-' + U.today() + '.json' });
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    U.toast('Sicherung heruntergeladen.', 'ok');
  }

  function importFile() {
    var inp = U.el('input', { type: 'file', accept: '.json,application/json' });
    inp.addEventListener('change', function () {
      var f = inp.files[0];
      if (!f) return;
      var r = new FileReader();
      r.onload = function () {
        U.modal('Sicherung laden?', U.el('p', { text:
          'Der aktuelle Stand auf diesem Gerät wird durch die Datei ersetzt — Profile, Fortschritt und eigene Wörter. Fortfahren?' }), [
          { label: 'Abbrechen' },
          { label: 'Laden', primary: true, onClick: function () {
            try {
              Store.importAll(r.result);
              U.toast('Geladen.', 'ok');
              App.render();
            } catch (e) {
              U.toast('Datei konnte nicht gelesen werden.', 'bad');
            }
          } }
        ]);
      };
      r.readAsText(f);
    });
    inp.click();
  }

  return { render: render, exportFile: exportFile, importFile: importFile };
})();
