/* Keep the Life: settings row and remember settings */
(function (K) {
  "use strict";

  var load = K.load, save = K.save, root = K.root;

  /* ---------------------------------------------------------- settings */

  var setBtn = document.querySelector(".set-btn");
  var setPanel = document.getElementById("settings");

  function showSettings(open) {
    setPanel.hidden = !open;
    setBtn.setAttribute("aria-expanded", String(open));
  }

  /* opening slides the row down from under the masthead title, closing folds
     it back up; the page below moves with it. Both run at an even, linear
     pace, so the page never jumps at the start or the end */
  var rowAnim = null;
  function setOpen(open) {
    /* a click in the middle of a slide carries on from the height the row has
       reached, so quick clicks never make it snap to full size first */
    var from = setPanel.hidden ? 0 : setPanel.getBoundingClientRect().height;
    if (rowAnim) { rowAnim.cancel(); rowAnim = null; }
    save("settings-open", open ? "1" : "0");
    setBtn.setAttribute("aria-expanded", String(open));
    setPanel.hidden = false;
    var full = setPanel.getBoundingClientRect().height;
    var to = open ? full : 0;
    if (open && row) row.dispatchEvent(new Event("scroll"));
    var done = function () {
      rowAnim = null;
      root.style.overflowAnchor = "";
      if (!open) setPanel.hidden = true;
    };
    if (Math.abs(to - from) < 1 || !full) { done(); return; }
    /* the browser's scroll anchoring would push the page down to make up for
       the row changing size above it, so it is off while the row moves */
    root.style.overflowAnchor = "none";
    rowAnim = K.animate(setPanel, [
      { height: from + "px", overflow: "hidden" },
      { height: to + "px", overflow: "hidden" }
    ], Math.max(60, 240 * Math.abs(to - from) / full), done, "linear");
    if (!rowAnim) done();
  }

  if (setBtn && setPanel) {
    showSettings(load("settings-open") !== "0");
    setBtn.addEventListener("click", function () { setOpen(setBtn.getAttribute("aria-expanded") !== "true"); });
  }

  /* pull up the settings from anywhere on the page: the o key, a tap with
     two fingers on a touch screen, or the Settings button beside the
     floating contents. How they come depends on the width of the window:
     - wide: with the masthead in view the row opens or closes in place;
       further down it comes down as a bar over the top of the window;
     - tablet (600 to 1199 px): a popover above the Settings button in the
       bottom corner, opening upward like the contents menu;
     - phone (below 600 px): a sheet up from the bottom edge.
     The page stays where it is. The same key, the gesture, Escape, the Close
     button, or on phones and tablets a tap outside puts them away again. */
  var floating = false, wasHidden = true, holder = null, anim = null;
  var phone = window.matchMedia("(max-width: 599px)");
  var tablet = window.matchMedia("(min-width: 600px) and (max-width: 1199px)");
  var mode = "top";
  function currentMode() { return phone.matches ? "bottom" : tablet.matches ? "pop" : "top"; }
  /* where the panel sits: 0 is in place, and the far end is out of sight:
     -1 above the window, 1 below it, or for the popover 1 fully clipped */
  var pos = 1;
  function hiddenAt() { return mode === "top" ? -1 : 1; }
  function frame(v) {
    return mode === "pop"
      ? { clipPath: "inset(" + v * 100 + "% 0 0 0)" }
      : { transform: "translateY(" + v * 100 + "%)" };
  }
  function move(to, done) {
    var from = pos;
    if (anim) {
      /* a panel still moving is caught where it is and turned round */
      var pr = anim.effect && anim.effect.getComputedTiming().progress;
      if (typeof pr === "number") from = anim._from + (anim._to - anim._from) * pr;
      anim.cancel(); anim = null;
    }
    pos = to;
    anim = K.animate(setPanel, [frame(from), frame(to)], Math.max(60, (mode === "pop" ? 200 : 240) * Math.abs(to - from)),
      function () { anim = null; if (done) done(); });
    if (anim) { anim._from = from; anim._to = to; } else if (done) done();
  }
  var closeBtn = setPanel ? setPanel.querySelector(".set-close") : null;
  /* Close ends the first line of settings, at the right. Which settings fit
     on that line depends on the width, so the Close part goes first, the
     line is measured, and the part moves after the last setting on it; the
     line keeps the same settings, so it wraps the same way */
  function placeClose() {
    var part = closeBtn && closeBtn.parentNode;
    var list = part && part.parentNode;
    if (!list || !part.offsetWidth) return;
    list.insertBefore(part, list.firstChild);
    var top = part.getBoundingClientRect().top, last = null;
    Array.prototype.forEach.call(list.children, function (el) {
      if (el === part || !el.offsetWidth) return;
      if (Math.abs(el.getBoundingClientRect().top - top) < 2) last = el;
    });
    if (last) list.insertBefore(part, last.nextSibling);
  }
  window.addEventListener("resize", function () { if (floating) placeClose(); });
  /* the Settings button beside the contents is lit while the settings
     float, the way the Contents button is while its menu is open */
  var dockBtn = document.querySelector(".toc-set");
  /* on phones and tablets, settings opened with the o key or the gesture
     bring out a tucked dock too, so the lit Settings button shows, and tuck
     it away again on closing, unless the reader moved the tab meanwhile */
  var untucked = false, tuckMark = 0;
  function dockOut(on) {
    if (!K.setTocTucked) return;
    if (on) {
      if (mode === "top" || !K.body.classList.contains("toc-tucked")) return;
      K.setTocTucked(false);
      untucked = true;
      tuckMark = K.tuckChanges || 0;
    } else if (untucked) {
      untucked = false;
      if ((K.tuckChanges || 0) === tuckMark) K.setTocTucked(true);
    }
  }
  function floatBar(on) {
    var already = K.body.classList.contains("settings-float");
    floating = on;
    if (dockBtn) dockBtn.setAttribute("aria-expanded", on ? "true" : "false");
    if (on) {
      if (!already) {
        mode = currentMode();
        pos = hiddenAt();
        wasHidden = setPanel.hidden;
        /* an open row leaves the masthead to become the bar: a placeholder of
           the same size keeps its place, so nothing on the page moves */
        if (!wasHidden) {
          holder = document.createElement("div");
          holder.className = "settings-holder";
          holder.setAttribute("aria-hidden", "true");
          holder.style.height = setPanel.getBoundingClientRect().height + "px";
          setPanel.parentNode.insertBefore(holder, setPanel);
        }
        K.body.classList.add("settings-float");
        K.body.classList.toggle("settings-pop", mode === "pop");
        K.body.classList.toggle("settings-sheet", mode === "bottom");
        setPanel.hidden = false;
        dockOut(true);
        placeClose();
        if (row) row.dispatchEvent(new Event("scroll"));
      }
      move(0);
      /* the focus goes to the panel itself, so the next Tab reaches the first
         setting and no button is marked as chosen when the panel opens */
      setPanel.setAttribute("tabindex", "-1");
      setPanel.focus({ preventScroll: true });
    } else {
      /* and goes back the same way */
      if (!already) return;
      dockOut(false);
      move(hiddenAt(), function () {
        if (floating) return;
        K.body.classList.remove("settings-float", "settings-pop", "settings-sheet");
        setPanel.hidden = wasHidden;
        if (holder) { holder.remove(); holder = null; }
      });
    }
  }
  function pullUp() {
    if (!setBtn || !setPanel) return;
    if (floating) { floatBar(false); return; }
    /* phones and tablets always use their floating panel, since the thumb is
       down by the Settings button in the corner */
    if (currentMode() === "top" && setBtn.getBoundingClientRect().bottom > 0) { setOpen(setBtn.getAttribute("aria-expanded") !== "true"); return; }
    floatBar(true);
  }
  if (closeBtn) closeBtn.addEventListener("click", function () {
    floatBar(false);
    var back = document.querySelector(".toc-set");
    if (back && back.offsetParent) back.focus({ preventScroll: true });
  });
  /* on phones and tablets a tap on the page outside the panel puts it away */
  document.addEventListener("click", function (e) {
    if (!floating || mode === "top") return;
    if (setPanel.contains(e.target) || e.target.closest(".toc-set")) return;
    floatBar(false);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && floating) floatBar(false);
  });
  K.pullUpSettings = pullUp;

  document.addEventListener("keydown", function (e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key !== "o" && e.key !== "O") return;
    /* a held key repeats; only the first press counts */
    if (e.repeat) return;
    var t = e.target;
    if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || t.closest(".ghidra"))) return;
    e.preventDefault();
    pullUp();
  });

  /* two fingers down together and lifted together within a short time,
     without moving, so a pinch or a two-finger scroll never counts */
  var tap = null;
  function point(t) { return { x: t.clientX, y: t.clientY, id: t.identifier }; }
  document.addEventListener("touchstart", function (e) {
    if (e.touches.length === 2) tap = { t: Date.now(), pts: [point(e.touches[0]), point(e.touches[1])], moved: false };
    else if (e.touches.length > 2) tap = null;
  }, { passive: true });
  document.addEventListener("touchmove", function (e) {
    if (!tap) return;
    for (var i = 0; i < e.touches.length; i++) {
      var c = e.touches[i];
      tap.pts.forEach(function (p) {
        if (p.id === c.identifier && Math.abs(p.x - c.clientX) + Math.abs(p.y - c.clientY) > 16) tap.moved = true;
      });
    }
  }, { passive: true });
  document.addEventListener("touchend", function (e) {
    if (!tap || e.touches.length > 0) return;
    var ok = !tap.moved && Date.now() - tap.t < 400;
    tap = null;
    if (ok) pullUp();
  }, { passive: true });
  document.addEventListener("touchcancel", function () { tap = null; }, { passive: true });

  /* the row scrolls sideways with no scrollbar in Firefox, so a plain mouse
     wheel moves it sideways while it has room to go that way */
  var row = setPanel && setPanel.querySelector(".mast-tools");
  if (row) {
    row.addEventListener("wheel", function (e) {
      if (e.ctrlKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      var room = row.scrollWidth - row.clientWidth;
      if (room <= 0) return;
      var step = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? row.clientWidth : 1);
      var left = row.scrollLeft;
      if ((step < 0 && left <= 0) || (step > 0 && left >= room - 1)) return;
      e.preventDefault();
      row.scrollLeft = left + step;
    }, { passive: false });

    /* fade the left or right edge while there is more of the row that way;
       the fades end above the scrollbar, whose height can change on hover */
    var fade = function () {
      var room = row.scrollWidth - row.clientWidth;
      setPanel.style.setProperty("--sb", (row.offsetHeight - row.clientHeight) + "px");
      setPanel.classList.toggle("fade-left", room > 1 && row.scrollLeft > 1);
      setPanel.classList.toggle("fade-right", room > 1 && row.scrollLeft < room - 1);
    };
    row.addEventListener("scroll", fade, { passive: true });
    row.addEventListener("mouseenter", fade);
    row.addEventListener("mouseleave", fade);
    window.addEventListener("resize", fade);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fade);
    fade();
  }

  /* ---------------------------------------------------------- remember settings */

  var storeBtn = document.getElementById("t-store");

  function showRemember() {
    if (!storeBtn) return;
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
