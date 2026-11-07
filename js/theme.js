/* Keep the Life: theme */
(function (K) {
  "use strict";

  var $$ = K.$$, root = K.root, load = K.load, save = K.save;

  /* ---------------------------------------------------------- theme */

  /* dark, light, or system (follows the operating system setting) */
  var systemDark = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;
  var themeMode = "dark";

  function applyTheme(mode) {
    themeMode = mode;
    var light = mode === "light" || (mode === "system" && systemDark && !systemDark.matches);
    if (light) root.setAttribute("data-theme", "light");
    else root.removeAttribute("data-theme");
    $$(".tool[data-theme-set]").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.getAttribute("data-theme-set") === mode));
    });
  }

  var storedTheme = load("theme");
  applyTheme(storedTheme === "light" || storedTheme === "system" ? storedTheme : "dark");

  $$(".tool[data-theme-set]").forEach(function (b) {
    b.addEventListener("click", function () {
      var mode = b.getAttribute("data-theme-set");
      applyTheme(mode);
      save("theme", mode);
    });
  });

  if (systemDark) {
    var onSystem = function () { if (themeMode === "system") applyTheme("system"); };
    if (systemDark.addEventListener) systemDark.addEventListener("change", onSystem);
    else if (systemDark.addListener) systemDark.addListener(onSystem);
  }
})(window.KeepTheLife);
