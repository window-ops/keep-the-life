/* Keep the Life: the settings row on the pages in notes/. It holds the
   settings that apply to these pages. They share their saved values with the
   story, so a change here holds there and the other way round: the theme,
   motion and scroll speed are bound by base/theme.js and base/motion.js, the
   page width by text/width.js, and this script binds the Settings button,
   Pretty wrap and Remember settings. The row starts folded on these pages. */
(function (K) {
  "use strict";

  var load = K.load, save = K.save, body = K.body;

  var setBtn = document.querySelector(".set-btn");
  var setPanel = document.getElementById("settings");
  function showSettings(open) {
    setPanel.hidden = !open;
    setBtn.setAttribute("aria-expanded", String(open));
  }
  if (setBtn && setPanel) {
    showSettings(load("notes-settings-open") === "1");
    setBtn.addEventListener("click", function () {
      var open = setBtn.getAttribute("aria-expanded") !== "true";
      showSettings(open);
      save("notes-settings-open", open ? "1" : "0");
      if (open && K.schedulePretty) K.schedulePretty();
    });
  }

  var prettyBtn = document.querySelector('.tool[data-toggle="pretty"]');
  function showPretty(on) {
    body.classList.toggle("pretty", on);
    prettyBtn.setAttribute("aria-pressed", String(on));
    prettyBtn.textContent = on ? "Pretty wrap: on" : "Pretty wrap: off";
  }
  if (prettyBtn) {
    showPretty(load("pretty") !== "0");
    prettyBtn.addEventListener("click", function () {
      var on = !body.classList.contains("pretty");
      showPretty(on);
      save("pretty", on ? "1" : "0");
      if (K.schedulePretty) K.schedulePretty();
    });
  }

  var storeBtn = document.getElementById("t-store");
  function showRemember() {
    var on = K.rememberAlways();
    storeBtn.setAttribute("aria-pressed", String(on));
    storeBtn.textContent = on ? "Remember settings: always" : "Remember settings: this tab";
  }
  if (storeBtn) {
    showRemember();
    storeBtn.addEventListener("click", function () {
      K.setRemember(!K.rememberAlways());
      showRemember();
    });
  }
})(window.KeepTheLife);
