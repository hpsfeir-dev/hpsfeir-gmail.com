/* Kleine Helfer — bewusst ohne Framework, damit die App per Doppelklick läuft. */
var U = (function () {

  function el(tag, attrs, children) {
    var n = document.createElement(tag);
    attrs = attrs || {};
    Object.keys(attrs).forEach(function (k) {
      if (k === 'class') n.className = attrs[k];
      else if (k === 'html') n.innerHTML = attrs[k];
      else if (k === 'text') n.textContent = attrs[k];
      else if (k.slice(0, 2) === 'on') n.addEventListener(k.slice(2).toLowerCase(), attrs[k]);
      else if (attrs[k] === true) n.setAttribute(k, '');
      else if (attrs[k] !== false && attrs[k] != null) n.setAttribute(k, attrs[k]);
    });
    (children || []).forEach(function (c) {
      if (c == null) return;
      n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    });
    return n;
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function sample(arr, n) { return shuffle(arr).slice(0, n); }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  function today() {
    var d = new Date();
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }
  function pad(n) { return n < 10 ? '0' + n : '' + n; }

  function dayDiff(a, b) {
    return Math.round((new Date(b) - new Date(a)) / 86400000);
  }

  function addDays(dateStr, n) {
    var d = new Date(dateStr);
    d.setDate(d.getDate() + n);
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }

  /* Vergleich von Nutzereingaben: Groß/Klein, diakritische Zeichen und
     Umschrift-Varianten (3/ʾ/7 …) werden großzügig behandelt. */
  function normLatin(s) {
    return String(s || '')
      .toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')  // ḥ → h, ē → e
      .replace(/[ʾʿ'`´]/g, '2')
      .replace(/3/g, '2').replace(/7/g, 'h').replace(/9/g, 's')
      .replace(/5/g, 'kh').replace(/8/g, 'gh').replace(/6/g, 't')
      .replace(/[^a-z0-9]/g, '');
  }

  /* Arabisch: Vokalzeichen und Tatweel weg, Alif-Varianten vereinheitlichen. */
  function normArabic(s) {
    return String(s || '')
      .replace(/[ً-ْـ]/g, '')
      .replace(/[أإآ]/g, 'ا')
      .replace(/ى/g, 'ي')
      .replace(/ة/g, 'ه')
      .replace(/\s+/g, '');
  }

  function toast(msg, kind) {
    var t = document.getElementById('toast');
    t.textContent = msg;
    t.className = 'toast' + (kind ? ' toast-' + kind : '');
    t.hidden = false;
    clearTimeout(t._timer);
    t._timer = setTimeout(function () { t.hidden = true; }, 2600);
  }

  function modal(title, bodyNode, actions) {
    var back = document.getElementById('modalBackdrop');
    var box = document.getElementById('modal');
    box.innerHTML = '';
    box.appendChild(el('h3', { text: title }));
    box.appendChild(bodyNode);
    var row = el('div', { class: 'modal-actions' });
    (actions || [{ label: 'Schließen' }]).forEach(function (a) {
      row.appendChild(el('button', {
        class: 'btn ' + (a.primary ? 'btn-primary' : 'btn-ghost'),
        text: a.label,
        onclick: function () { if (!a.onClick || a.onClick() !== false) closeModal(); }
      }));
    });
    box.appendChild(row);
    back.hidden = false;
    back.onclick = function (e) { if (e.target === back) closeModal(); };
  }

  function closeModal() { document.getElementById('modalBackdrop').hidden = true; }

  function clear(node) { while (node.firstChild) node.removeChild(node.firstChild); }

  function progressBar(pct, label) {
    return el('div', { class: 'bar' }, [
      el('div', { class: 'bar-fill', style: 'width:' + Math.max(0, Math.min(100, pct)) + '%' }),
      label ? el('span', { class: 'bar-label', text: label }) : null
    ]);
  }

  return {
    el: el, esc: esc, shuffle: shuffle, sample: sample, pick: pick,
    today: today, dayDiff: dayDiff, addDays: addDays,
    normLatin: normLatin, normArabic: normArabic,
    toast: toast, modal: modal, closeModal: closeModal,
    clear: clear, progressBar: progressBar
  };
})();
