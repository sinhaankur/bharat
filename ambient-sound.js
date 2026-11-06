/* ambient-sound.js — an optional, muted-by-default atmosphere for the whole site.
   A synthesised low tonal drone (bronze "singing bowl" pad) — no audio file shipped,
   so zero network cost and nothing to host. The hero has its own inline version; this
   is the site-wide one, wired to a small toggle that site-nav.js places in the header.

   Contract:
     - Never plays until the user clicks the toggle (autoplay-policy safe).
     - Remembers the choice in localStorage so it persists across pages.
     - A page that wants the toggle calls nothing — site-nav.js injects the button and
       this script finds it by id (#ambient-toggle). Safe if the button is absent.
     - Respects reduce-motion as "prefers calm": we still allow it, but never auto-resume. */
(function () {
  "use strict";
  var KEY = "bharat.ambient";
  var ctx = null, master = null, built = false, on = false;

  function build() {
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = 0; master.connect(ctx.destination);
    // A1 drone + a few quiet overtones, each with a slow LFO shimmer — warm, non-melodic.
    [55, 110, 164.81, 220].forEach(function (f, i) {
      var o = ctx.createOscillator(); o.type = "sine"; o.frequency.value = f;
      var g = ctx.createGain(); g.gain.value = (i === 0 ? 0.5 : 0.14) / 4;
      var lfo = ctx.createOscillator(); lfo.frequency.value = 0.04 + i * 0.025;
      var lg = ctx.createGain(); lg.gain.value = 0.4;
      lfo.connect(lg); lg.connect(g.gain);
      o.connect(g); g.connect(master); o.start(); lfo.start();
    });
    built = true;
    return true;
  }

  function fade(to, secs) {
    if (!master) return;
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
    master.gain.linearRampToValueAtTime(to, ctx.currentTime + (secs || 1.2));
  }

  function setOn(next, btn) {
    if (next && !built) { if (!build()) return; }
    if (ctx && ctx.state === "suspended") ctx.resume();
    on = next;
    fade(on ? 0.2 : 0, on ? 1.4 : 0.8);
    try { localStorage.setItem(KEY, on ? "1" : "0"); } catch (e) {}
    if (btn) {
      btn.setAttribute("aria-pressed", String(on));
      btn.classList.toggle("on", on);
      var lbl = btn.querySelector(".amb-label");
      if (lbl) lbl.textContent = on ? "Sound on" : "Sound";
    }
  }

  function wire() {
    var btn = document.getElementById("ambient-toggle");
    if (!btn || btn._wired) return;
    btn._wired = true;
    btn.addEventListener("click", function () { setOn(!on, btn); });
    // If the user had it on before, reflect the label — but do NOT auto-play
    // (browsers block audio until a gesture; we wait for their first click).
    try {
      if (localStorage.getItem(KEY) === "1") {
        btn.classList.add("armed");
        var lbl = btn.querySelector(".amb-label"); if (lbl) lbl.textContent = "Sound";
      }
    } catch (e) {}
  }

  // site-nav.js renders the header asynchronously; wire on both DOM ready and the
  // custom event it fires when the nav is in the DOM.
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", wire);
  else wire();
  window.addEventListener("SiteNavReady", wire);
  window.Ambient = { toggle: function () { setOn(!on, document.getElementById("ambient-toggle")); } };
})();
