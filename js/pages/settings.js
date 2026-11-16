/* Keep the Life: the settings row on the pages in notes/. It holds the
   settings that apply to these pages. They share their saved values with the
   story, so a change here holds there and the other way round: the theme,
   motion and scroll speed are bound by base/theme.js and base/motion.js, the
   page width by text/width.js, the Settings button, the floating panel and
   Remember settings by reading/settings.js and the dock by reading/tocmenu.js,
   as on the story, and this script binds Pretty wrap. The row starts folded
   on these pages. */
(function (K) {
  "use strict";

  var load = K.load, save = K.save, body = K.body;

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

})(window.KeepTheLife);
