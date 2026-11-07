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

  /* pull up the settings from anywhere on the page: the o key, or a tap with
     two fingers on a touch screen. With the masthead in view, the row opens
     or closes in place. Further down, the row comes down as a bar over the
     top of the window, the page stays where it is, and the same key, the
     gesture or Escape puts the bar away again. */
  var floating = false, wasHidden = true, holder = null, barAnim = null;
  /* how far the bar has slid, as a share of its own height: 0 is in place,
     -1 is out of sight above the window */
  function barOffset() {
    var h = setPanel.getBoundingClientRect().height || 1;
    var m = getComputedStyle(setPanel).transform;
    var y = m && m !== "none" ? new DOMMatrixReadOnly(m).m42 : 0;
    return Math.max(-1, Math.min(0, y / h));
  }
  function slide(from, to, done) {
    if (barAnim) { barAnim.cancel(); barAnim = null; }
    barAnim = K.animate(setPanel, [
      { transform: "translateY(" + from * 100 + "%)" },
      { transform: "translateY(" + to * 100 + "%)" }
    ], Math.max(60, 240 * Math.abs(to - from)), function () { barAnim = null; if (done) done(); });
    if (!barAnim && done) done();
  }
  function floatBar(on) {
    var already = K.body.classList.contains("settings-float");
    /* a bar still sliding away is caught where it is and turned round */
    var at = already && barAnim ? barOffset() : (already ? 0 : -1);
    floating = on;
    if (on) {
      if (!already) {
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
        setPanel.hidden = false;
        if (row) row.dispatchEvent(new Event("scroll"));
      }
      /* the bar slides down from the top edge of the window */
      slide(at, 0);
      var first = setPanel.querySelector("button, select, input");
      if (first) first.focus({ preventScroll: true });
    } else {
      /* and goes back up the same way */
      slide(already ? at : 0, -1, function () {
        if (floating) return;
        K.body.classList.remove("settings-float");
        setPanel.hidden = wasHidden;
        if (holder) { holder.remove(); holder = null; }
      });
    }
  }
  function pullUp() {
    if (!setBtn || !setPanel) return;
    if (floating) { floatBar(false); return; }
    if (setBtn.getBoundingClientRect().bottom > 0) { setOpen(setBtn.getAttribute("aria-expanded") !== "true"); return; }
    floatBar(true);
  }
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
