/* Keep the Life: Ghidra */
(function (K) {
  "use strict";

  var $$ = K.$$;

  /* ---------------------------------------------------------- Ghidra */

  $$(".ghidra").forEach(function (g) {
    var lcode = g.querySelector(".g-lcode");
    var rows = $$(".gl-ins", g);
    var sAddr = g.querySelector(".g-s-addr");
    var sFn = g.querySelector(".g-s-fn");
    var sIns = g.querySelector(".g-s-ins");
    var panes = $$(".g-pane[data-pane]", g);
    var side = g.querySelector(".g-side");
    var decs = g.querySelector(".g-decs");

    function select(row, reveal) {
      rows.forEach(function (r) {
        var on = r === row;
        r.classList.toggle("sel", on);
        r.setAttribute("aria-selected", String(on));
      });
      if (lcode) lcode.setAttribute("aria-activedescendant", row.id);
      sAddr.textContent = row.getAttribute("data-addr");
      sFn.textContent = row.getAttribute("data-fnof");
      sIns.textContent = row.getAttribute("data-ins");
      $$(".g-sym", g).forEach(function (b) {
        var on = b.getAttribute("data-fn") === row.getAttribute("data-fnof");
        b.classList.toggle("on", on);
        b.setAttribute("aria-pressed", String(on));
      });
      if (reveal && lcode) {
        var top = row.offsetTop - lcode.offsetTop;
        if (top < lcode.scrollTop || top > lcode.scrollTop + lcode.clientHeight - row.offsetHeight) {
          lcode.scrollTop = top - lcode.clientHeight / 3;
        }
      }
    }

    rows.forEach(function (r, i) {
      r.id = r.id || (g.closest("details").id || "g") + "-r" + Math.random().toString(36).slice(2, 8) + i;
      r.addEventListener("click", function () { select(r, false); if (lcode) lcode.focus({ preventScroll: true }); });
    });

    if (lcode) {
      lcode.addEventListener("keydown", function (e) {
        var i = rows.findIndex(function (r) { return r.classList.contains("sel"); });
        var j = null;
        if (e.key === "ArrowDown") j = Math.min(rows.length - 1, i + 1);
        else if (e.key === "ArrowUp") j = Math.max(0, i - 1);
        else if (e.key === "Home") j = 0;
        else if (e.key === "End") j = rows.length - 1;
        if (j === null) return;
        e.preventDefault();
        select(rows[j], true);
      });
    }

    /* symbol tree navigates the listing */
    $$(".g-sym", g).forEach(function (b) {
      b.addEventListener("click", function () {
        var fn = b.getAttribute("data-fn");
        var first = rows.filter(function (r) { return r.getAttribute("data-fnof") === fn; })[0];
        if (first) {
          select(first, true);
        } else {
          $$(".g-sym", g).forEach(function (x) { x.classList.toggle("on", x === b); x.setAttribute("aria-pressed", String(x === b)); });
          sFn.textContent = fn + " (not in this view)";
        }
      });
    });

    /* bookmark jumps to its address */
    $$(".g-goto", g).forEach(function (b) {
      b.addEventListener("click", function () {
        var r = rows.filter(function (x) { return x.getAttribute("data-addr") === b.getAttribute("data-goto"); })[0];
        if (r) { select(r, true); if (lcode) lcode.focus({ preventScroll: true }); }
      });
    });

    /* decompiler line cursor */
    $$(".g-dcode", g).forEach(function (code) {
      $$(".gd", code).forEach(function (line) {
        line.addEventListener("click", function () {
          $$(".gd", g).forEach(function (x) { x.classList.toggle("sel", x === line); });
        });
      });
    });

    /* closing and reopening panes */
    var menuBtn = g.querySelector(".g-mbtn");
    var drop = g.querySelector(".g-drop");

    function layout() {
      if (side) side.hidden = $$(".g-pane", side).every(function (p) { return p.hidden; });
      if (decs) decs.hidden = $$(".g-pane", decs).every(function (p) { return p.hidden; });
      $$("input", drop).forEach(function (inp) {
        inp.checked = !g.querySelector('[data-pane="' + inp.value + '"]').hidden;
      });
    }

    panes.forEach(function (p) {
      var label = document.createElement("label");
      var inp = document.createElement("input");
      inp.type = "checkbox";
      inp.value = p.getAttribute("data-pane");
      inp.checked = true;
      inp.addEventListener("change", function () { p.hidden = !inp.checked; layout(); });
      label.appendChild(inp);
      label.appendChild(document.createTextNode(p.getAttribute("data-title")));
      drop.appendChild(label);
    });

    $$(".g-x", g).forEach(function (x) {
      x.addEventListener("click", function () {
        var p = g.querySelector('[data-pane="' + x.getAttribute("data-close") + '"]');
        p.hidden = true;
        layout();
        if (menuBtn) menuBtn.focus();
      });
    });

    function closeMenu() { drop.hidden = true; menuBtn.setAttribute("aria-expanded", "false"); }

    if (menuBtn) {
      menuBtn.addEventListener("click", function () {
        var open = drop.hidden;
        drop.hidden = !open;
        menuBtn.setAttribute("aria-expanded", String(open));
        if (open) { var f = drop.querySelector("input"); if (f) f.focus(); }
      });
      drop.addEventListener("keydown", function (e) { if (e.key === "Escape") { closeMenu(); menuBtn.focus(); } });
      document.addEventListener("click", function (e) { if (!drop.hidden && !e.target.closest(".g-wm")) closeMenu(); });
    }

    var start = g.querySelector(".gl-ins.sel");
    if (start) select(start, true);
  });
})(window.KeepTheLife);
