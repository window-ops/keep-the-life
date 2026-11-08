/* Keep the Life: redactions. Each span.redact holds its black bars, hidden
   from screen readers, and a word for screen readers only. The Redactions
   setting chooses that word: "redacted", or "static" as in the SCP
   Orientation recordings, where every redaction is a burst of static. With
   static on, a redaction plays its burst when it is activated: a click, a
   tap, or Enter on it in a screen reader's reading mode. The burst is made
   here with the Web Audio API, so the page needs no sound file and works
   from a local file; its length follows the length of the bars. */
(function (K) {
  "use strict";

  var $$ = K.$$, body = K.body, load = K.load, save = K.save;
  var bars = $$(".redact");
  var btns = $$("[data-redact-set]");
  if (!bars.length && !btns.length) return;

  var ctx = null;
  function burst(len) {
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    if (!ctx) ctx = new AC();
    if (ctx.state === "suspended") ctx.resume();
    var secs = Math.min(0.25 + len * 0.08, 0.9);
    var rate = ctx.sampleRate, n = Math.floor(secs * rate);
    var buf = ctx.createBuffer(1, n, rate), d = buf.getChannelData(0);
    /* white noise that crackles: its loudness jumps every few milliseconds */
    var amp = 1;
    for (var i = 0; i < n; i++) {
      if (i % 160 === 0) amp = 0.35 + Math.random() * 0.65;
      d[i] = (Math.random() * 2 - 1) * amp;
    }
    var src = ctx.createBufferSource();
    src.buffer = buf;
    var band = ctx.createBiquadFilter();
    band.type = "bandpass";
    band.frequency.value = 2400;
    band.Q.value = 0.6;
    var gain = ctx.createGain();
    var t = ctx.currentTime;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.22, t + 0.015);
    gain.gain.setValueAtTime(0.22, t + secs - 0.05);
    gain.gain.linearRampToValueAtTime(0, t + secs);
    src.connect(band);
    band.connect(gain);
    gain.connect(ctx.destination);
    src.start(t);
    src.stop(t + secs);
  }

  function play(e) {
    if (!body.classList.contains("redact-static")) return;
    var bar = e.currentTarget;
    burst((bar.querySelector("[aria-hidden]") || bar).textContent.length);
  }

  function set(mode) {
    var on = mode === "static";
    body.classList.toggle("redact-static", on);
    btns.forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-redact-set") === mode)); });
    bars.forEach(function (bar) {
      var word = bar.querySelector(".vh");
      if (word) word.textContent = on ? "static" : "redacted";
      /* a listener of its own on each bar, so a screen reader reports the
         bar as clickable while static is on, and only then */
      if (on) bar.addEventListener("click", play);
      else bar.removeEventListener("click", play);
    });
  }

  set(load("redact") === "static" ? "static" : "redacted");
  btns.forEach(function (b) {
    b.addEventListener("click", function () {
      var mode = b.getAttribute("data-redact-set");
      set(mode);
      save("redact", mode);
    });
  });
})(window.KeepTheLife);
