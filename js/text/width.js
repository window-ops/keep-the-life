/* Keep the Life: page width */
(function (K) {
  "use strict";

  var $$ = K.$$, root = K.root, load = K.load, save = K.save;

  /* ---------------------------------------------------------- page width */

  var WIDTH_MIN = 40;
  var WIDTH_MAX = 120;
  var WIDTH_DEFAULT = 76;
  var widthOut = document.getElementById("t-width-out");
  var pageWidth = WIDTH_DEFAULT;

  function applyWidth(v) {
    pageWidth = v;
    root.style.setProperty("--page-max", v === "full" ? "100%" : v + "rem");
    root.classList.toggle("width-full", v === "full");
    if (widthOut) widthOut.textContent = v === "full" ? "Full" : v + " rem";
    $$(".tool[data-width]").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.getAttribute("data-width") === String(v)));
    });
    $$(".tool[data-step]").forEach(function (b) {
      var step = Number(b.getAttribute("data-step"));
      b.disabled = (step < 0 && v !== "full" && v <= WIDTH_MIN) || (step > 0 && v === "full");
    });
  }

  function setWidth(v) {
    applyWidth(v);
    save("page-width", String(v));
    K.schedulePretty();
  }

  (function () {
    var stored = load("page-width");
    if (stored === "full") applyWidth("full");
    else if (Number(stored) >= WIDTH_MIN && Number(stored) <= WIDTH_MAX) applyWidth(Number(stored));
    else applyWidth(WIDTH_DEFAULT);
  })();

  $$(".tool[data-width]").forEach(function (b) {
    b.addEventListener("click", function () {
      var v = b.getAttribute("data-width");
      setWidth(v === "full" ? "full" : Number(v));
    });
  });

  $$(".tool[data-step]").forEach(function (b) {
    b.addEventListener("click", function () {
      var step = Number(b.getAttribute("data-step"));
      var v = pageWidth === "full" ? WIDTH_MAX + 4 : pageWidth;
      v += step;
      if (v > WIDTH_MAX) setWidth("full");
      else setWidth(Math.max(WIDTH_MIN, v));
    });
  });
})(window.KeepTheLife);
