/* Sprachausgabe über die eingebaute Sprachsynthese des Systems.
   Arabische Stimmen sind Standard auf iOS/macOS/Android; unter Windows/Linux
   muss ggf. eine Stimme nachinstalliert werden — dann sagen wir das ehrlich. */
var TTS = (function () {
  var voice = null;
  var checked = false;

  function ready() { return typeof window.speechSynthesis !== 'undefined'; }

  function findVoice() {
    if (!ready()) return null;
    var vs = window.speechSynthesis.getVoices() || [];
    // Levantinisch bevorzugen, sonst irgendeine arabische Stimme
    var order = ['ar-LB', 'ar-SY', 'ar-JO', 'ar-PS', 'ar-EG', 'ar-SA', 'ar'];
    for (var i = 0; i < order.length; i++) {
      var hit = vs.filter(function (v) { return (v.lang || '').toLowerCase().indexOf(order[i].toLowerCase()) === 0; })[0];
      if (hit) return hit;
    }
    return null;
  }

  function refresh() { voice = findVoice(); checked = true; }

  if (ready()) {
    refresh();
    window.speechSynthesis.onvoiceschanged = refresh;
  }

  function hasArabicVoice() {
    if (!checked) refresh();
    return !!voice;
  }

  function speak(text, opts) {
    if (!ready() || !Store.settings.tts) return false;
    if (!checked) refresh();
    try {
      window.speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(text);
      if (voice) { u.voice = voice; u.lang = voice.lang; }
      else u.lang = 'ar';
      u.rate = (opts && opts.rate) || Store.settings.ttsRate || 0.8;
      window.speechSynthesis.speak(u);
      return true;
    } catch (e) {
      return false;
    }
  }

  /* Lautsprecher-Button, den alle Ansichten benutzen. */
  function button(text, cls) {
    return U.el('button', {
      class: 'btn-speak ' + (cls || ''),
      title: 'Anhören',
      'aria-label': 'Anhören',
      onclick: function (e) {
        e.stopPropagation();
        if (!hasArabicVoice() && !window._ttsWarned) {
          window._ttsWarned = true;
          U.toast('Keine arabische Stimme im System gefunden — Aussprache siehe Umschrift.', 'warn');
        }
        speak(text);
      }
    }, ['🔊']);
  }

  return { speak: speak, button: button, hasArabicVoice: hasArabicVoice, ready: ready };
})();
