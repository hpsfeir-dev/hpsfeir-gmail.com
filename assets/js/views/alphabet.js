/* Lesen und Schreiben: Alphabet, Verbindungsformen, Handschrift-Trainer,
   Vokalzeichen und Arabizi. */
var AlphabetView = (function () {

  function render(view, params) {
    if (params && params.letter) return renderLetter(view, params.letter);

    view.appendChild(U.el('div', { class: 'page-head' }, [
      U.el('h2', { text: 'Lesen & Schreiben' }),
      U.el('p', { class: 'muted', text: '28 Buchstaben, vier Formen je nach Position. Tippe auf einen Buchstaben für Details und den Schreibtrainer.' })
    ]));

    view.appendChild(U.el('div', { class: 'card row-actions' }, [
      U.el('button', { class: 'btn btn-primary', text: '▶ Buchstaben abfragen',
        onclick: function () {
          var ids = Items.letterItems().map(function (l) { return l.id; });
          window._letterCache = Items.letterItems();
          Drill.start({ ids: ids, title: 'Buchstaben', limit: 15, maxNew: 8,
            modes: ['mc-ar-de', 'flash'], backTo: '#/alphabet' });
        } }),
      U.el('button', { class: 'btn btn-ghost', text: '✍️ Schreibtrainer',
        onclick: function () { openWriter(U.pick(DATA.letters)); } })
    ]));

    /* Buchstabengitter */
    view.appendChild(U.el('h3', { class: 'section-title', text: 'Die 28 Buchstaben' }));
    var grid = U.el('div', { class: 'letter-grid' });
    DATA.letters.forEach(function (l) {
      grid.appendChild(U.el('button', { class: 'letter-cell', onclick: function () { location.hash = '#/alphabet/' + l.id; } }, [
        U.el('div', { class: 'lc-ar', lang: 'ar', dir: 'rtl', text: l.ar }),
        U.el('div', { class: 'lc-name', text: l.name }),
        U.el('div', { class: 'lc-tr', text: l.tr })
      ]));
    });
    view.appendChild(grid);

    /* Sonderzeichen */
    view.appendChild(U.el('h3', { class: 'section-title', text: 'Wichtige Sonderfälle' }));
    var sp = U.el('div', { class: 'card' });
    DATA.specials.forEach(function (s) {
      sp.appendChild(U.el('div', { class: 'special-row' }, [
        U.el('div', { class: 'sp-ar', lang: 'ar', dir: 'rtl', text: s.ar }),
        U.el('div', { class: 'sp-body' }, [
          U.el('div', { class: 'sp-name', text: s.name + ' · ' + s.tr }),
          U.el('div', { class: 'sp-info muted', text: s.info })
        ])
      ]));
    });
    view.appendChild(sp);

    /* Vokalzeichen */
    view.appendChild(U.el('h3', { class: 'section-title', text: 'Vokalzeichen (Harakat)' }));
    var hk = U.el('div', { class: 'card' });
    DATA.harakat.forEach(function (h) {
      hk.appendChild(U.el('div', { class: 'special-row' }, [
        U.el('div', { class: 'sp-ar', lang: 'ar', dir: 'rtl', text: h.ar }),
        U.el('div', { class: 'sp-body' }, [
          U.el('div', { class: 'sp-name', text: h.name + ' · ' + h.tr }),
          U.el('div', { class: 'sp-info muted', text: h.info })
        ])
      ]));
    });
    view.appendChild(hk);

    /* Arabizi */
    view.appendChild(U.el('h3', { class: 'section-title', text: 'Chat-Arabisch (Arabizi)' }));
    var az = U.el('div', { class: 'card' }, [
      U.el('p', { class: 'muted', text: 'So schreibt die Familie auf WhatsApp: lateinische Buchstaben plus Zahlen für die Laute, die es nicht gibt.' })
    ]);
    var azGrid = U.el('div', { class: 'azi-grid' });
    DATA.arabizi.forEach(function (a) {
      azGrid.appendChild(U.el('div', { class: 'azi-cell' }, [
        U.el('div', { class: 'azi-n', text: a.n }),
        U.el('div', { class: 'azi-ar', lang: 'ar', dir: 'rtl', text: a.ar }),
        U.el('div', { class: 'azi-info muted', text: a.info })
      ]));
    });
    az.appendChild(azGrid);
    view.appendChild(az);
  }

  function renderLetter(view, id) {
    var l = DATA.letters.filter(function (x) { return x.id === id; })[0];
    if (!l) { location.hash = '#/alphabet'; return; }
    var idx = DATA.letters.indexOf(l);

    view.appendChild(U.el('div', { class: 'page-head' }, [
      U.el('button', { class: 'btn-back', text: '← Alphabet', onclick: function () { location.hash = '#/alphabet'; } })
    ]));

    view.appendChild(U.el('div', { class: 'card letter-hero' }, [
      U.el('div', { class: 'lh-ar', lang: 'ar', dir: 'rtl', text: l.ar }),
      U.el('h2', { text: l.name }),
      U.el('div', { class: 'lh-tr', text: 'Umschrift: ' + l.tr }),
      U.el('div', { class: 'lh-sound', text: l.sound }),
      U.el('div', { class: 'lh-de', text: '🇩🇪 ' + l.de })
    ]));

    /* Die vier Formen */
    view.appendChild(U.el('h3', { class: 'section-title', text: 'Die vier Formen' }));
    view.appendChild(U.el('div', { class: 'forms-grid' }, [
      form('Allein', l.iso), form('Anfang', l.ini), form('Mitte', l.med), form('Ende', l.fin)
    ]));

    if (!l.connects) {
      view.appendChild(U.el('div', { class: 'card note-card', text:
        '⚠️ ' + l.name + ' verbindet NICHT nach links. Der nächste Buchstabe fängt wieder von vorne an. Sechs Buchstaben machen das: ا د ذ ر ز و' }));
    }

    /* Beispielwort */
    view.appendChild(U.el('div', { class: 'card' }, [
      U.el('h3', { text: 'Beispielwort' }),
      U.el('div', { class: 'ex-big' }, [
        U.el('div', { class: 'ex-big-ar', lang: 'ar', dir: 'rtl', text: l.ex.ar }),
        U.el('div', { class: 'ex-big-tr', text: l.ex.tr }),
        U.el('div', { class: 'ex-big-de muted', text: l.ex.de }),
        TTS.button(l.ex.ar)
      ])
    ]));

    view.appendChild(U.el('div', { class: 'card row-actions' }, [
      U.el('button', { class: 'btn btn-primary', text: '✍️ Schreiben üben', onclick: function () { openWriter(l); } }),
      idx > 0 ? U.el('button', { class: 'btn btn-ghost', text: '← ' + DATA.letters[idx - 1].name,
        onclick: function () { location.hash = '#/alphabet/' + DATA.letters[idx - 1].id; } }) : null,
      idx < DATA.letters.length - 1 ? U.el('button', { class: 'btn btn-ghost', text: DATA.letters[idx + 1].name + ' →',
        onclick: function () { location.hash = '#/alphabet/' + DATA.letters[idx + 1].id; } }) : null
    ]));
  }

  function form(label, glyph) {
    return U.el('div', { class: 'form-cell' }, [
      U.el('div', { class: 'fc-label', text: label }),
      U.el('div', { class: 'fc-ar', lang: 'ar', dir: 'rtl', text: glyph })
    ]);
  }

  /* ---------- Handschrift-Trainer ---------- */

  function openWriter(letter) {
    var wrap = U.el('div', { class: 'writer' });
    wrap.appendChild(U.el('p', { class: 'muted', text:
      'Fahre mit Finger oder Maus über die graue Vorlage. Arabisch wird von rechts nach links geschrieben.' }));

    var canvas = U.el('canvas', { class: 'writer-canvas', width: 320, height: 320 });
    wrap.appendChild(canvas);

    var current = letter;
    var ctx = canvas.getContext('2d');

    function drawGuide() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // Hilfslinie
      ctx.strokeStyle = 'rgba(127,160,140,0.35)';
      ctx.lineWidth = 1;
      ctx.setLineDash([6, 6]);
      ctx.beginPath(); ctx.moveTo(0, 220); ctx.lineTo(canvas.width, 220); ctx.stroke();
      ctx.setLineDash([]);
      // Vorlage
      ctx.fillStyle = 'rgba(140,170,150,0.30)';
      ctx.font = '200px "Noto Naskh Arabic", "Amiri", "Times New Roman", serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(current.ar, canvas.width / 2, 220);
    }
    drawGuide();

    var drawing = false;
    function pos(e) {
      var r = canvas.getBoundingClientRect();
      var p = e.touches ? e.touches[0] : e;
      return {
        x: (p.clientX - r.left) * (canvas.width / r.width),
        y: (p.clientY - r.top) * (canvas.height / r.height)
      };
    }
    function begin(e) {
      e.preventDefault(); drawing = true;
      var p = pos(e);
      ctx.strokeStyle = '#e8c37a';
      ctx.lineWidth = 8; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.beginPath(); ctx.moveTo(p.x, p.y);
    }
    function move(e) {
      if (!drawing) return;
      e.preventDefault();
      var p = pos(e);
      ctx.lineTo(p.x, p.y); ctx.stroke();
    }
    function end() { drawing = false; }

    canvas.addEventListener('mousedown', begin);
    canvas.addEventListener('mousemove', move);
    window.addEventListener('mouseup', end);
    canvas.addEventListener('touchstart', begin, { passive: false });
    canvas.addEventListener('touchmove', move, { passive: false });
    canvas.addEventListener('touchend', end);

    var label = U.el('div', { class: 'writer-label', text: current.name + ' · ' + current.tr });
    wrap.appendChild(label);

    var controls = U.el('div', { class: 'writer-controls' }, [
      U.el('button', { class: 'btn btn-ghost btn-sm', text: '🧽 Löschen', onclick: drawGuide }),
      U.el('button', { class: 'btn btn-ghost btn-sm', text: '🎲 Anderer Buchstabe',
        onclick: function () {
          current = U.pick(DATA.letters);
          label.textContent = current.name + ' · ' + current.tr;
          drawGuide();
        } }),
      U.el('button', { class: 'btn btn-ghost btn-sm', text: '🔤 Anfangsform',
        onclick: function () {
          current = { ar: current.ini, name: current.name + ' (Anfang)', tr: current.tr, ini: current.ini };
          label.textContent = current.name;
          drawGuide();
        } })
    ]);
    wrap.appendChild(controls);

    U.modal('✍️ Schreibtrainer', wrap, [{ label: 'Fertig', primary: true }]);
  }

  return { render: render, openWriter: openWriter };
})();
