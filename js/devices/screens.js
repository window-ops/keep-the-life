/* Keep the Life: device screens. A reader or phone screen keeps the real
   part's proportions and scrolls a long page; when its page is only a little
   longer than the screen, the screen grows to fit instead, so a few lines
   never hide behind a scrollbar. */
(function (K) {
  "use strict";

  var SLACK = 0.25; /* grow when the page is at most a quarter longer than the screen */

  function fit() {
    K.$$(".coil-screen, .ph-screen").forEach(function (s) {
      s.classList.remove("cs-grow");
      s.style.minHeight = "";
      if (K.body.classList.contains("fit-size")) return;
      /* a phone scrolls its page between the status bar and the gesture bar */
      var box = s.querySelector(".ph-body") || s;
      var over = box.scrollHeight - box.clientHeight;
      if (over > 1 && over <= s.clientHeight * SLACK) {
        s.style.minHeight = s.offsetHeight + "px";
        s.classList.add("cs-grow");
      }
    });
  }

  var t = 0;
  /* measured once a drawer has finished moving, so the measuring never
     lands in the middle of an animation */
  function later() { clearTimeout(t); t = setTimeout(fit, 320); }
  window.addEventListener("resize", later);
  document.addEventListener("toggle", later, true);
  new MutationObserver(later).observe(K.body, { attributes: true, attributeFilter: ["class"] });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
  fit();

  /* the calculator's catalog scrolls while Play is pressed, the way it does
     while the arrow key is held down */
  K.$$(".calc-play").forEach(function (b) {
    b.addEventListener("click", function () {
      var on = b.getAttribute("aria-pressed") !== "true";
      b.setAttribute("aria-pressed", on ? "true" : "false");
      b.textContent = on ? "Stop" : "Play";
      b.closest(".calc").classList.toggle("playing", on);
    });
  });

  /* the calculator's keys can be hidden to leave only the display; every
     calculator follows the last choice, and the choice is kept */
  var keyBtns = K.$$(".calc-keys-toggle");
  function showKeys(on) {
    K.body.classList.toggle("calc-nokeys", !on);
    keyBtns.forEach(function (b) {
      b.setAttribute("aria-pressed", on ? "false" : "true");
      b.textContent = on ? "Hide keys" : "Show keys";
    });
  }
  if (keyBtns.length) {
    showKeys(K.load("calcKeys") !== "0");
    keyBtns.forEach(function (b) {
      b.addEventListener("click", function () {
        var on = K.body.classList.contains("calc-nokeys");
        var calc = b.closest(".calc");
        var top = calc.getBoundingClientRect().top;
        var pads = K.$$(".calc-pad");
        /* every keypad opens or shuts together, like one drawer on each
           calculator; while they move, the calculator under the pointer is
           held where it was */
        var shutH = pads.map(function (pad) { return [pad.getBoundingClientRect().height, getComputedStyle(pad).marginTop]; });
        if (!on) pads.forEach(function (pad) { pad.classList.add("k-keep"); });
        showKeys(on);
        K.save("calcKeys", on ? "1" : "0");
        var anims = pads.map(function (pad, i) {
          var h = shutH[i][0], mt = shutH[i][1];
          if (on) { h = pad.getBoundingClientRect().height; mt = getComputedStyle(pad).marginTop; }
          if (!h) { pad.classList.remove("k-keep"); return null; }
          var shut = [{ height: h + "px", marginTop: mt, overflow: "hidden" }, { height: "0px", marginTop: "0px", overflow: "hidden" }];
          var a = K.animate(pad, on ? shut.slice().reverse() : shut, 260, function () { pad.classList.remove("k-keep"); });
          if (!a) pad.classList.remove("k-keep");
          return a;
        }).filter(Boolean);
        var hold = function () {
          window.scrollBy(0, calc.getBoundingClientRect().top - top);
          if (anims.some(function (a) { return a.playState === "running"; })) requestAnimationFrame(hold);
        };
        hold();
      });
    });
  }

  /* Open all screens: every folded screen and document opens, its caption
     loses the arrow and no longer folds it. Turned off again, each one goes
     back to how it was before. */
  var apps = K.$$("details.app");
  var before = null;
  K.openAll = function (on) {
    if (on) {
      before = apps.map(function (d) { return d.open; });
      apps.forEach(function (d) { d.open = true; });
    } else if (before) {
      apps.forEach(function (d, i) { d.open = before[i]; });
      before = null;
    }
  };
  apps.forEach(function (d) {
    d.querySelector("summary").addEventListener("click", function (e) {
      if (K.body.classList.contains("open-all")) e.preventDefault();
    });
  });
})(window.KeepTheLife);
