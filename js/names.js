/* Keep the Life: speaker column */
(function (K) {
  "use strict";

  var $$ = K.$$, root = K.root, body = K.body;

  /* ---------------------------------------------------------- speaker column */

  /* the name column is as wide as the longest speaker name on the page,
     times a minimum coefficient so the names have room to breathe */
  var NAME_COEFFICIENT = 1.05;
  var NAME_MAX_REM = 5.4;
  function sizeNames() {
    var names = {};
    $$(".ln .sp").forEach(function (sp) { names[sp.textContent] = true; });
    var probe = document.createElement("b");
    probe.className = "sp sp-probe";
    probe.setAttribute("aria-hidden", "true");
    (document.querySelector(".story") || body).appendChild(probe);
    var widest = 0;
    Object.keys(names).forEach(function (n) {
      probe.textContent = n;
      widest = Math.max(widest, probe.getBoundingClientRect().width);
    });
    /* a long name wraps: the column stops at NAME_MAX_REM, but never gets
       narrower than the longest single word, so a word is never split */
    var longestWord = 0;
    Object.keys(names).forEach(function (n) {
      n.split(/\s+/).forEach(function (w) {
        probe.textContent = w;
        longestWord = Math.max(longestWord, probe.getBoundingClientRect().width);
      });
    });
    probe.remove();
    var cap = NAME_MAX_REM * parseFloat(getComputedStyle(root).fontSize);
    var w = Math.max(longestWord, Math.min(widest * NAME_COEFFICIENT, cap));
    if (widest > 0) root.style.setProperty("--sp-w", Math.ceil(w) + "px");
  }

  /* her label switches between her number and her name. Every label on the
     page follows the last choice, and the choice is kept */
  var switches = $$(".sp-switch, .sp-cont[data-names]");
  function showName(i) {
    switches.forEach(function (b) {
      var names = b.getAttribute("data-names").split("|");
      if (!b.hasAttribute("data-first")) b.setAttribute("data-first", b.textContent);
      b.textContent = i === null ? b.getAttribute("data-first") : names[i];
    });
  }
  var saved = K.load("herName");
  if (saved === "0" || saved === "1") showName(+saved);
  function flip(b) {
    if (!b.classList.contains("sp-switch")) return;
    var names = b.getAttribute("data-names").split("|");
    var i = names.indexOf(b.textContent) === 0 ? 1 : 0;
    showName(i);
    K.save("herName", String(i));
    sizeNames();
  }
  switches.filter(function (b) { return b.classList.contains("sp-switch"); }).forEach(function (b) {
    b.addEventListener("click", function () { flip(b); });
    b.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); flip(b); }
    });
  });

  sizeNames();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(sizeNames);
})(window.KeepTheLife);
