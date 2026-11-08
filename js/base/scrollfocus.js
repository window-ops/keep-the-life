/* Keep the Life: scroll areas within keyboard reach. A box that scrolls
   (a device screen wider than a phone, a whiteboard seen through a camera,
   a diagram) can be moved with the arrow keys only once it has the focus.
   So a box that scrolls and holds nothing that takes the focus joins the Tab
   order, as long as it scrolls: on a wide window the same box fits and
   leaves the Tab order again. A box that joins also gets a name for screen
   readers, taken from the screen or picture it belongs to, unless it already
   has one. */
(function (K) {
  "use strict";

  var FOCUSABLE = "a[href], button, input, select, textarea, summary, [tabindex], [contenteditable=\"true\"]";
  var boxes = [];

  /* the boxes that can scroll at some width: their overflow is auto or scroll */
  Array.prototype.forEach.call(document.body.querySelectorAll("*"), function (el) {
    var cs = getComputedStyle(el);
    if (/auto|scroll/.test(cs.overflowX + cs.overflowY)) boxes.push(el);
  });
  if (!boxes.length) return;

  function text(el) { return el ? el.textContent.replace(/\s+/g, " ").trim() : ""; }
  function nameFor(box) {
    var own = box.closest("[aria-label]");
    if (own) return own.getAttribute("aria-label");
    var app = box.closest("details");
    var cap = app && app.querySelector(":scope > summary");
    if (text(cap)) return text(cap);
    var by = box.querySelector("[aria-labelledby]");
    if (by) {
      var t = document.getElementById(by.getAttribute("aria-labelledby").split(" ")[0]);
      if (text(t)) return text(t);
    }
    var inner = box.querySelector("[aria-label]");
    if (inner) return inner.getAttribute("aria-label");
    return "Scrolling area";
  }

  function scrolls(el) {
    return el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1;
  }
  function holdsFocus(el) {
    return Array.prototype.some.call(el.querySelectorAll(FOCUSABLE), function (f) {
      return !f.hasAttribute("data-scroll-focus") && f.getAttribute("tabindex") !== "-1";
    });
  }

  function update() {
    boxes.forEach(function (box) {
      var added = box.hasAttribute("data-scroll-focus");
      var own = !added && (box.matches(FOCUSABLE) || holdsFocus(box));
      var want = !own && box.offsetParent !== null && scrolls(box);
      if (want && !added) {
        box.setAttribute("data-scroll-focus", "");
        box.setAttribute("tabindex", "0");
        if (!box.hasAttribute("role")) {
          box.setAttribute("role", "group");
          box.setAttribute("data-scroll-role", "");
        }
        if (!box.hasAttribute("aria-label") && !box.hasAttribute("aria-labelledby")) {
          box.setAttribute("aria-label", nameFor(box));
          box.setAttribute("data-scroll-name", "");
        }
      } else if (!want && added) {
        box.removeAttribute("data-scroll-focus");
        box.removeAttribute("tabindex");
        if (box.hasAttribute("data-scroll-role")) box.removeAttribute("role");
        if (box.hasAttribute("data-scroll-name")) box.removeAttribute("aria-label");
        box.removeAttribute("data-scroll-role");
        box.removeAttribute("data-scroll-name");
      }
    });
  }

  var timer = null;
  function later() { clearTimeout(timer); timer = setTimeout(update, 150); }
  window.addEventListener("resize", later);
  /* screens unfold and fold, grow with a transition, fonts arrive and
     settings change sizes */
  document.addEventListener("toggle", later, true);
  document.addEventListener("transitionend", later, true);
  if (window.ResizeObserver) {
    var watch = new ResizeObserver(later);
    boxes.forEach(function (box) { watch.observe(box); });
  }
  K.body.addEventListener("click", later);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(later);
  update();
})(window.KeepTheLife);
