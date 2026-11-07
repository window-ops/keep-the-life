/* Keep the Life: motion setting */
(function (K) {
  "use strict";

  var $$ = K.$$, root = K.root, load = K.load, save = K.save;

  /* System follows the operating system, Reduced turns motion off, Full keeps
     it on even when the operating system asks for less */
  var systemCalm = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
  var motionMode = "system";

  function applyMotion(mode) {
    motionMode = mode;
    if (mode === "system") root.removeAttribute("data-motion");
    else root.setAttribute("data-motion", mode);
    $$(".tool[data-motion-set]").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.getAttribute("data-motion-set") === mode));
    });
  }

  var stored = load("motion");
  applyMotion(stored === "reduced" || stored === "full" ? stored : "system");

  $$(".tool[data-motion-set]").forEach(function (b) {
    b.addEventListener("click", function () {
      var mode = b.getAttribute("data-motion-set");
      applyMotion(mode);
      save("motion", mode);
    });
  });

  K.reducedMotion = reducedMotion;

  /* scroll speed: how long a glide takes, relative to Normal */
  var SPEEDS = { slow: 1.7, normal: 1, fast: 0.55 };
  var speedMode = "normal";

  function applySpeed(mode) {
    speedMode = SPEEDS[mode] ? mode : "normal";
    $$(".tool[data-speed-set]").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.getAttribute("data-speed-set") === speedMode));
    });
  }

  applySpeed(load("scroll-speed") || "normal");

  $$(".tool[data-speed-set]").forEach(function (b) {
    b.addEventListener("click", function () {
      applySpeed(b.getAttribute("data-speed-set"));
      save("scroll-speed", speedMode);
    });
  });

  function reducedMotion() {
    if (motionMode === "full") return false;
    if (motionMode === "reduced") return true;
    return !!(systemCalm && systemCalm.matches);
  }

  /* Scrolling is animated here, frame by frame. Browsers drop their own
     smooth scrolling when the operating system asks for less motion,
     Firefox included, so Full would otherwise have nothing to show. */
  var running = new Map();

  /* steady speed for most of the way, then a short, even slow-down for the
     last fifth, so the page neither creeps off nor crawls in */
  var CRUISE = 0.8;
  var SPEED = 1 / (CRUISE + (1 - CRUISE) / 2);
  function ease(x) {
    if (x <= CRUISE) return SPEED * x;
    var d = x - CRUISE;
    return SPEED * (CRUISE + d - (d * d) / (2 * (1 - CRUISE)));
  }

  function current(box) { return box === window ? window.scrollY : box.scrollTop; }

  function jump(box, y) {
    if (box === window) window.scrollTo({ top: y, behavior: "instant" });
    else box.scrollTo({ top: y, behavior: "instant" });
  }

  function scrollBox(box, to) {
    var max = box === window
      ? document.documentElement.scrollHeight - window.innerHeight
      : box.scrollHeight - box.clientHeight;
    to = Math.max(0, Math.min(max, Math.round(to)));
    if (running.has(box)) { cancelAnimationFrame(running.get(box)); running.delete(box); }
    var from = current(box);
    var dist = to - from;
    if (reducedMotion() || Math.abs(dist) < 2) { jump(box, to); return; }
    var duration = Math.min(700, 250 + Math.abs(dist) / 10) * SPEEDS[speedMode];
    var start = null;
    function step(now) {
      if (start === null) start = now;
      var k = Math.min(1, (now - start) / duration);
      jump(box, from + dist * ease(k));
      if (k < 1) running.set(box, requestAnimationFrame(step));
      else { running.delete(box); if (box === window) window.dispatchEvent(new Event("scroll")); }
    }
    running.set(box, requestAnimationFrame(step));
  }

  /* a wheel or a touch from the reader stops the page's own animation */
  ["wheel", "touchstart"].forEach(function (type) {
    window.addEventListener(type, function () {
      if (running.has(window)) { cancelAnimationFrame(running.get(window)); running.delete(window); }
    }, { passive: true });
  });

  /* bring an element to the top of the window, below the scroll padding, or to its centre */
  function scrollToEl(el, block) {
    var r = el.getBoundingClientRect();
    var pad = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
    var to = block === "center"
      ? window.scrollY + r.top - (window.innerHeight - r.height) / 2
      : window.scrollY + r.top - pad;
    scrollBox(window, to);
  }

  /* a panel that follows a moving target, like the contents while the page
     scrolls: it moves toward wherever the target is now, at a steady speed or
     faster when the target is far ahead, so a new target changes its course
     without restarting it */
  var follow = new Map();

  function followBox(box, to) {
    to = Math.max(0, Math.min(box.scrollHeight - box.clientHeight, Math.round(to)));
    if (reducedMotion()) { jump(box, to); return; }
    var f = follow.get(box);
    if (f) { f.to = to; return; }
    f = { to: to, y: box.scrollTop };
    follow.set(box, f);
    (function step() {
      var d = f.to - f.y;
      /* the steady speed is the slowest it moves: when the reader scrolls
         faster, the target runs ahead and the panel speeds up with it, so the
         contents keep the reader's pace and never trail behind */
      var v = Math.max(16 / SPEEDS[speedMode], Math.abs(d) * 0.22);
      if (Math.abs(d) <= v) { jump(box, f.to); follow.delete(box); return; }
      f.y += d > 0 ? v : -v;
      jump(box, f.y);
      requestAnimationFrame(step);
    })();
  }

  K.followBox = followBox;
  K.pageAnimating = function () { return running.has(window); };
  K.scrollBox = scrollBox;
  K.scrollWindow = function (y) { scrollBox(window, y); };
  K.scrollToEl = scrollToEl;

})(window.KeepTheLife);
