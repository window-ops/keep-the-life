/* Keep the Life: contents as a floating menu. Below the wide layout the
   contents leave the page and open from a button at the bottom corner; a
   chosen section, Escape or a tap outside closes the menu again. A Settings
   button beside it pulls up the settings from anywhere on the page. On a
   phone the two start tucked to a tab at the screen edge. */
(function (K) {
  "use strict";

  var btn = document.querySelector(".toc-fab");
  var toc = document.getElementById("toc");
  if (!btn || !toc) return;

  /* the menu pulls out upward from the button like a drawer, and slides
     back down into it */
  var closing = null;
  function open(on) {
    var isOpen = K.body.classList.contains("toc-open");
    btn.setAttribute("aria-expanded", on ? "true" : "false");
    if (!on) {
      if (!isOpen || closing) return;
      closing = K.animate(toc, [
        { clipPath: "inset(0 0 0 0)" },
        { clipPath: "inset(100% 0 0 0)" }
      ], 160, function () { closing = null; K.body.classList.remove("toc-open"); });
      if (!closing) K.body.classList.remove("toc-open");
      return;
    }
    if (closing) { closing.cancel(); closing = null; }
    K.body.classList.add("toc-open");
    if (!isOpen) K.animate(toc, [
      { clipPath: "inset(100% 0 0 0)" },
      { clipPath: "inset(0 0 0 0)" }
    ], 200);
    /* open at the section being read, with it in the middle of the menu */
    var cur = toc.querySelector("a.on") || toc.querySelector("a");
    if (!cur) return;
    var top = cur.getBoundingClientRect().top - toc.getBoundingClientRect().top + toc.scrollTop;
    toc.scrollTop = Math.max(0, top - toc.clientHeight / 2);
    cur.focus({ preventScroll: true });
  }

  /* the button can be tucked to a tab at the screen edge, and the choice is
     kept with the other preferences */
  var tuck = document.querySelector(".toc-tuck");
  function tucked(on) {
    K.body.classList.toggle("toc-tucked", on);
    if (on) open(false);
    tuck.setAttribute("aria-pressed", on ? "true" : "false");
    var label = on ? "Show the contents and settings buttons" : "Hide the contents and settings buttons";
    tuck.setAttribute("aria-label", label);
    tuck.title = label;
  }
  if (tuck) {
    /* the reader's own choice wins; without one, phones start tucked, so the
       buttons leave the whole screen to the text */
    var kept = K.load("tocTucked");
    tucked(kept === null ? window.matchMedia("(max-width: 599px)").matches : kept === "1");
    tuck.addEventListener("click", function () {
      var on = !K.body.classList.contains("toc-tucked");
      tucked(on);
      K.save("tocTucked", on ? "1" : "0");
      K.tuckChanges = (K.tuckChanges || 0) + 1;
    });
    /* the settings can bring the dock out for a while without changing the
       reader's saved choice */
    K.setTocTucked = tucked;
  }

  btn.addEventListener("click", function () { open(!K.body.classList.contains("toc-open")); });
  var setBtn = document.querySelector(".toc-set");
  if (setBtn) setBtn.addEventListener("click", function () {
    open(false);
    if (K.pullUpSettings) K.pullUpSettings();
  });
  toc.addEventListener("click", function (e) { if (e.target.closest("a")) open(false); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && K.body.classList.contains("toc-open")) { open(false); btn.focus(); }
  });
  document.addEventListener("click", function (e) {
    if (K.body.classList.contains("toc-open") && !toc.contains(e.target) && !btn.contains(e.target) && !(tuck && tuck.contains(e.target))) open(false);
  });
})(window.KeepTheLife);
