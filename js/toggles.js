/* Keep the Life: toggles */
(function (K) {
  "use strict";

  var $$ = K.$$, body = K.body, load = K.load, save = K.save;

  /* ---------------------------------------------------------- toggles */

  function setToggle(btn, on) {
    var cls = btn.getAttribute("data-toggle");
    body.classList.toggle(cls, on);
    btn.setAttribute("aria-pressed", String(on));
    if (cls === "tabbed") K.applyTabs();
    if (cls === "no-toc") btn.textContent = on ? "Show contents" : "Hide contents";
    if (cls === "no-acts") btn.textContent = on ? "Show stage directions" : "Hide stage directions";
    if (cls === "no-motion") btn.textContent = on ? "Allow blinking" : "Stop blinking";
    if (cls === "pretty") btn.textContent = on ? "Pretty wrap: on" : "Pretty wrap: off";
    if (cls === "show-progress") btn.textContent = on ? "Reading progress: on" : "Reading progress: off";
    if (cls === "fit-size") btn.textContent = on ? "Sizes: fit to content" : "Sizes: fixed";
    if (cls === "open-all") {
      btn.textContent = on ? "Screens: always open" : "Screens: foldable";
      if (K.openAll) K.openAll(on);
    }
    if (cls === "notes") {
      btn.textContent = on ? "Highlights and notes: on" : "Highlights and notes: off";
      /* switching the feature on opens its panel */
      var panel = document.querySelector(".notes-panel");
      if (on && panel) panel.open = true;
    }
    K.schedulePretty();
  }

  $$(".tool[data-toggle]").forEach(function (btn) {
    var cls = btn.getAttribute("data-toggle");
    var stored = load(cls);
    var on = stored === null ? btn.getAttribute("data-default") === "1" : stored === "1";
    setToggle(btn, on);
    btn.addEventListener("click", function () {
      var on = !body.classList.contains(cls);
      setToggle(btn, on);
      save(cls, on ? "1" : "0");
    });
  });
})(window.KeepTheLife);
