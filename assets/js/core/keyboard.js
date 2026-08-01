/* Arabische Bildschirmtastatur — damit man auch ohne arabisches Systemlayout
   tippen kann. Layout in der üblichen Reihenfolge des arabischen Keyboards. */
var ArKeyboard = (function () {

  var rows = [
    ['ض','ص','ث','ق','ف','غ','ع','ه','خ','ح','ج','د'],
    ['ش','س','ي','ب','ل','ا','ت','ن','م','ك','ط'],
    ['ئ','ء','ؤ','ر','لا','ى','ة','و','ز','ظ'],
    ['أ','إ','آ','ذ','ـ','٠','١','٢','٣']
  ];

  function attach(input, container) {
    var kb = U.el('div', { class: 'kb' });

    rows.forEach(function (row) {
      var r = U.el('div', { class: 'kb-row' });
      row.forEach(function (ch) {
        r.appendChild(U.el('button', {
          class: 'kb-key', type: 'button', text: ch,
          onclick: function (e) { e.preventDefault(); insert(input, ch); }
        }));
      });
      kb.appendChild(r);
    });

    var ctrl = U.el('div', { class: 'kb-row' }, [
      U.el('button', { class: 'kb-key kb-wide', type: 'button', text: 'Leer',
        onclick: function (e) { e.preventDefault(); insert(input, ' '); } }),
      U.el('button', { class: 'kb-key kb-wide', type: 'button', text: '⌫',
        onclick: function (e) { e.preventDefault(); backspace(input); } }),
      U.el('button', { class: 'kb-key kb-wide', type: 'button', text: 'Leeren',
        onclick: function (e) { e.preventDefault(); input.value = ''; input.focus(); fire(input); } })
    ]);
    kb.appendChild(ctrl);

    container.appendChild(kb);
    return kb;
  }

  function insert(input, ch) {
    var s = input.selectionStart == null ? input.value.length : input.selectionStart;
    var e = input.selectionEnd == null ? s : input.selectionEnd;
    input.value = input.value.slice(0, s) + ch + input.value.slice(e);
    var pos = s + ch.length;
    input.focus();
    try { input.setSelectionRange(pos, pos); } catch (err) { /* manche Browser mögen das nicht */ }
    fire(input);
  }

  function backspace(input) {
    var s = input.selectionStart == null ? input.value.length : input.selectionStart;
    var e = input.selectionEnd == null ? s : input.selectionEnd;
    if (s === e && s > 0) {
      input.value = input.value.slice(0, s - 1) + input.value.slice(e);
      s -= 1;
    } else {
      input.value = input.value.slice(0, s) + input.value.slice(e);
    }
    input.focus();
    try { input.setSelectionRange(s, s); } catch (err) { /* siehe oben */ }
    fire(input);
  }

  function fire(input) {
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }

  /* Ein-/ausklappbare Variante für Formulare. */
  function toggleable(input, container, label) {
    var wrap = U.el('div', { class: 'kb-wrap' });
    var kbBox = U.el('div', { class: 'kb-box', hidden: true });
    var btn = U.el('button', {
      class: 'btn btn-ghost btn-sm', type: 'button',
      text: label || '⌨️ Arabische Tastatur',
      onclick: function () { kbBox.hidden = !kbBox.hidden; }
    });
    attach(input, kbBox);
    wrap.appendChild(btn);
    wrap.appendChild(kbBox);
    container.appendChild(wrap);
    return wrap;
  }

  return { attach: attach, toggleable: toggleable };
})();
