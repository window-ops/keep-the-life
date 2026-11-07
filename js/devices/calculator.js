/* Keep the Life: the chemistry lab's graphing calculator. The story writes
   each screen as plain text inside a div.calc, and this script draws it:

     <div class="calc" data-mode="DEG">       the mode, top right
       <p class="calc-in">1 RAD&gt;DEG</p>     a line from the left
       <p class="calc-out">57.29577951</p>    a line from the right
     </div>

   A graph adds data-graph="xmin xmax ymin ymax" and, for a polar graph,
   data-polar="sin(4θ)" with data-tmin, data-tmax and data-tstep; its
   p.calc-desc says in words what the graph shows. The catalog is an
   ol.calc-catalog with one li per entry. The display is 216 by 144 dots,
   21 characters across and 7 lines down, set in the font of calc-font.js.
   The case, the screen keys and the keypad are the same on every
   calculator and are added here. Without scripts the text itself stands
   on a plain display. */
(function (K) {
  "use strict";

  var W = 216, H = 144, CW = 10, LH = 20, LINES = 7;
  var SVG = "http://www.w3.org/2000/svg";
  var VISIBLE = LINES - 1; /* catalog rows under the header */
  var STEP_S = 0.16; /* seconds per catalog row while Play is on */

  /* ------------------------------------------------------------ dots */

  function Dots() { this.on = {}; }
  Dots.prototype.set = function (x, y) {
    if (x < 0 || y < 0 || x >= W || y >= this.h) return;
    this.on[y * 4096 + x] = true;
  };

  function newDots(h) { var d = new Dots(); d.h = h || H; return d; }

  /* every lit dot as a path: one run of dots per row, as 1 by 1 cells */
  function toPath(d) {
    var rows = {};
    Object.keys(d.on).forEach(function (k) {
      var y = Math.floor(k / 4096), x = k % 4096;
      (rows[y] = rows[y] || []).push(x);
    });
    var out = [];
    Object.keys(rows).map(Number).sort(function (a, b) { return a - b; }).forEach(function (y) {
      var xs = rows[y].sort(function (a, b) { return a - b; });
      for (var i = 0; i < xs.length; ) {
        var j = i;
        while (j + 1 < xs.length && xs[j + 1] === xs[j] + 1) j++;
        var w = xs[j] - xs[i] + 1;
        out.push("M" + xs[i] + " " + y + "h" + w + "v1h-" + w + "z");
        i = j + 1;
      }
    });
    return out.join("");
  }

  /* ------------------------------------------------------------ text */

  function glyph(ch) {
    var hex = K.calcFont[ch] || K.calcFont["?"];
    var rows = [];
    for (var r = 0; r < LH; r++) rows.push(parseInt(hex.substr(r * 3, 3), 16));
    return rows;
  }

  /* characters, not UTF-16 units, so θ and ∫ take one cell each */
  function chars(s) { return Array.from ? Array.from(s) : s.split(""); }

  function text(d, s, x, y) {
    chars(s).forEach(function (ch, i) {
      glyph(ch).forEach(function (bits, r) {
        for (var c = 0; c < CW; c++) if (bits & (1 << (CW - 1 - c))) d.set(x + i * CW + c, y + r);
      });
    });
  }
  function left(d, s, line) { text(d, s, 0, line * LH); }
  function right(d, s, line) { text(d, s, W - chars(s).length * CW, line * LH); }

  /* ------------------------------------------------------------ graphs */

  function windowOf(calc) {
    var v = (calc.getAttribute("data-graph") || "-2 2 -1.333333 1.333333").trim().split(/\s+/).map(Number);
    return { xmin: v[0], xmax: v[1], ymin: v[2], ymax: v[3] };
  }
  function px(win, x) { return Math.round((x - win.xmin) / (win.xmax - win.xmin) * W); }
  function py(win, y) { return Math.round((win.ymax - y) / (win.ymax - win.ymin) * H); }

  /* the two axes across the whole display, with a short tick at each whole
     unit inside the window */
  /* the axes are two dots wide, like the pen that draws the graphs, so they
     stay visible at any size; each tick is two dots wide and stands two dots
     out on either side */
  function axes(d, win) {
    var ox = px(win, 0), oy = py(win, 0), i, k, x, y;
    for (i = 0; i < W; i++) { d.set(i, oy); d.set(i, oy + 1); }
    for (i = 0; i < H; i++) { d.set(ox, i); d.set(ox + 1, i); }
    for (i = Math.floor(win.xmin) + 1; i < win.xmax; i++) if (i) {
      x = px(win, i);
      for (k = 0; k < 2; k++) { d.set(x + k, oy - 2); d.set(x + k, oy - 1); d.set(x + k, oy + 2); d.set(x + k, oy + 3); }
    }
    for (i = Math.floor(win.ymin) + 1; i < win.ymax; i++) if (i) {
      y = py(win, i);
      for (k = 0; k < 2; k++) { d.set(ox - 2, y + k); d.set(ox - 1, y + k); d.set(ox + 2, y + k); d.set(ox + 3, y + k); }
    }
  }

  /* a line between two dots, drawn with a pen two dots wide */
  function line(d, x0, y0, x1, y1) {
    var dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1, e = dx + dy;
    for (;;) {
      d.set(x0, y0); d.set(x0 + 1, y0); d.set(x0, y0 + 1); d.set(x0 + 1, y0 + 1);
      if (x0 === x1 && y0 === y1) return;
      var e2 = 2 * e;
      if (e2 >= dy) { e += dy; x0 += sx; }
      if (e2 <= dx) { e += dx; y0 += sy; }
    }
  }

  /* a small reader for the formula of a polar graph: numbers, θ, + - * / ^,
     brackets, implied products such as 4θ, and sin, cos, tan, sqrt, ln, abs */
  function formula(src) {
    var s = src.replace(/\s+/g, ""), i = 0;
    var FN = { sin: Math.sin, cos: Math.cos, tan: Math.tan, sqrt: Math.sqrt, ln: Math.log, abs: Math.abs };
    function peek() { return s.charAt(i); }
    function sum() {
      var f = product();
      while (peek() === "+" || peek() === "-") {
        var op = s.charAt(i++), a = f, b = product();
        f = op === "+" ? (function (a, b) { return function (t) { return a(t) + b(t); }; })(a, b) : (function (a, b) { return function (t) { return a(t) - b(t); }; })(a, b);
      }
      return f;
    }
    function product() {
      var f = power();
      for (;;) {
        var c = peek();
        if (c === "*" || c === "/") {
          i++;
          var a = f, b = power();
          f = c === "*" ? (function (a, b) { return function (t) { return a(t) * b(t); }; })(a, b) : (function (a, b) { return function (t) { return a(t) / b(t); }; })(a, b);
        } else if (c && /[0-9.(θa-z]/.test(c)) {
          var p = f, q = power();
          f = (function (a, b) { return function (t) { return a(t) * b(t); }; })(p, q);
        } else return f;
      }
    }
    function power() {
      var f = unit();
      if (peek() === "^") { i++; var a = f, b = power(); return function (t) { return Math.pow(a(t), b(t)); }; }
      return f;
    }
    function unit() {
      var c = peek(), m;
      if (c === "-") { i++; var u = unit(); return function (t) { return -u(t); }; }
      if (c === "(") { i++; var e = sum(); i++; return e; }
      if (c === "θ") { i++; return function (t) { return t; }; }
      if ((m = /^[0-9.]+/.exec(s.slice(i)))) { i += m[0].length; var v = parseFloat(m[0]); return function () { return v; }; }
      if ((m = /^[a-z]+/.exec(s.slice(i))) && FN[m[0]]) {
        i += m[0].length;
        var g = FN[m[0]], arg = unit();
        return function (t) { return g(arg(t)); };
      }
      throw new Error("calculator: cannot read " + src);
    }
    return sum();
  }

  function polar(d, calc, win) {
    var r = formula(calc.getAttribute("data-polar"));
    var t0 = Number(calc.getAttribute("data-tmin") || 0);
    var t1 = Number(calc.getAttribute("data-tmax") || 2 * Math.PI);
    var dt = Number(calc.getAttribute("data-tstep") || 0.05);
    var last = null;
    for (var k = 0; t0 + k * dt <= t1 + 1e-9; k++) {
      var t = t0 + k * dt, rr = r(t);
      var p = [px(win, rr * Math.cos(t)), py(win, rr * Math.sin(t))];
      if (last) line(d, last[0], last[1], p[0], p[1]);
      last = p;
    }
  }

  /* ------------------------------------------------------------ the screen */

  var uid = 0;

  function el(tag, cls, txt) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (txt) e.textContent = txt;
    return e;
  }
  function svgEl(tag, attrs) {
    var e = document.createElementNS(SVG, tag);
    Object.keys(attrs || {}).forEach(function (k) { e.setAttribute(k, attrs[k]); });
    return e;
  }
  function dotPattern(id) {
    var p = svgEl("pattern", { id: id, width: "1", height: "1", patternUnits: "userSpaceOnUse" });
    p.appendChild(svgEl("rect", { "class": "px-dot", x: ".04", y: ".04", width: ".92", height: ".92" }));
    return p;
  }

  function screen(calc) {
    var n = ++uid, dotId = "calc-dot-" + n;
    var mode = calc.getAttribute("data-mode") || "";
    var svg = svgEl("svg", { "class": "calc-px", viewBox: "0 0 " + W + " " + H, role: "img" });
    var defs = svgEl("defs");
    defs.appendChild(dotPattern(dotId));
    svg.appendChild(defs);
    var txt = newDots(), solid = newDots(), label = [];
    var list = calc.querySelector(".calc-catalog");

    if (list) {
      var items = Array.prototype.map.call(list.querySelectorAll("li"), function (li) { return li.textContent.trim(); });
      left(txt, items.length + " items", 0);
      right(txt, mode || "CATALOG", 0);
      left(txt, ">", 1);
      var strip = newDots(items.length * LH);
      items.forEach(function (s, k) { text(strip, " " + s, 0, k * LH); });
      var clipId = "calc-win-" + n;
      var clip = svgEl("clipPath", { id: clipId });
      clip.appendChild(svgEl("rect", { x: "0", y: String(LH), width: String(W), height: String(VISIBLE * LH) }));
      defs.appendChild(clip);
      var g = svgEl("g", { "clip-path": "url(#" + clipId + ")" });
      var roll = svgEl("g", { "class": "calc-roll", transform: "translate(0 " + LH + ")" });
      roll.appendChild(svgEl("path", { fill: "url(#" + dotId + ")", d: toPath(strip) }));
      g.appendChild(roll);
      svg.style.setProperty("--calc-steps", String(Math.max(items.length - VISIBLE, 0)));
      svg.style.setProperty("--calc-row", LH + "px");
      svg.appendChild(svgEl("path", { fill: "url(#" + dotId + ")", d: toPath(txt) }));
      svg.appendChild(g);
      label.push("The catalog, " + items.length + " items, starting at " + items.slice(0, 3).join(", "));
    } else {
      var lines = calc.querySelectorAll(".calc-in, .calc-out");
      Array.prototype.forEach.call(lines, function (p, k) {
        var s = p.textContent.trim();
        if (p.classList.contains("calc-out")) right(txt, s, k); else left(txt, s, k);
        label.push(s);
      });
      if (mode) right(txt, mode, 0);
      if (calc.hasAttribute("data-graph")) {
        var win = windowOf(calc);
        axes(solid, win);
        if (calc.hasAttribute("data-polar")) polar(solid, calc, win);
        svg.appendChild(svgEl("path", { "class": "px-on", d: toPath(solid) }));
      }
      svg.appendChild(svgEl("path", { fill: "url(#" + dotId + ")", d: toPath(txt) }));
      var desc = calc.querySelector(".calc-desc");
      if (desc) label = [desc.textContent.trim()];
      if (mode) label.push("Mode " + mode);
    }
    var name = calc.getAttribute("aria-label");
    svg.setAttribute("aria-label", (name && !desc && !list ? name + ". " : "") + label.join(", ").replace(/, Mode/, ". Mode"));
    return svg;
  }

  /* ------------------------------------------------------------ the case */

  var SCREEN_KEYS = ["Y=", "WINDOW", "ZOOM", "TRACE", "GRAPH"];
  /* each key: [class, second function, label] */
  var PAD = [
    ["k-2nd", "", "2nd"], ["k-fn", "QUIT", "MODE"], ["k-fn", "INS", "DEL"], "arrows",
    ["k-alpha", "A-LOCK", "ALPHA"], ["k-fn", "LINK", "X,T,θ,n"], ["k-fn", "LIST", "STAT"],
    ["k-fn", "TEST", "MATH"], ["k-fn", "ANGLE", "MENU"], ["k-fn", "DRAW", "PRGM"], ["k-fn", "DISTR", "VARS"], ["k-fn", "", "CLEAR"],
    ["k-fn", "MATRIX", "x⁻¹"], ["k-fn", "SIN⁻¹", "SIN"], ["k-fn", "COS⁻¹", "COS"], ["k-fn", "TAN⁻¹", "TAN"], ["k-op", "π", "^"],
    ["k-fn", "√", "x²"], ["k-fn", "EE", ","], ["k-fn", "{", "("], ["k-fn", "}", ")"], ["k-op", "e", "÷"],
    ["k-fn", "10^x", "LOG"], ["k-num", "u", "7"], ["k-num", "v", "8"], ["k-num", "w", "9"], ["k-op", "[", "×"],
    ["k-fn", "e^x", "LN"], ["k-num", "L4", "4"], ["k-num", "L5", "5"], ["k-num", "L6", "6"], ["k-op", "]", "-"],
    ["k-fn", "RCL", "STO>"], ["k-num", "L1", "1"], ["k-num", "L2", "2"], ["k-num", "L3", "3"], ["k-op", "MEM", "+"],
    ["k-fn", "OFF", "ON"], ["k-num", "CATALOG", "0"], ["k-num", "i", "."], ["k-num", "ANS", "(-)"], ["k-op", "ENTRY", "ENTER"]
  ];

  function keypad() {
    var pad = el("div", "calc-pad");
    pad.setAttribute("aria-hidden", "true");
    PAD.forEach(function (k) {
      if (k === "arrows") {
        var ar = el("span", "k-arrows");
        [["k-up", "▲"], ["k-left", "◀"], ["k-right", "▶"], ["k-down", "▼"]].forEach(function (a) { ar.appendChild(el("span", "k-ar " + a[0], a[1])); });
        pad.appendChild(ar);
        return;
      }
      var key = el("span", "k " + k[0]);
      key.appendChild(el("span", "k-sec", k[1]));
      key.appendChild(el("span", "k-cap", k[2]));
      pad.appendChild(key);
    });
    return pad;
  }

  function build(calc) {
    var bar = el("div", "calc-bar");
    var brand = el("span", "calc-brand", "Qalculator");
    brand.setAttribute("aria-hidden", "true");
    var hide = el("button", "calc-keys-toggle", "Hide keys");
    hide.type = "button";
    hide.setAttribute("aria-pressed", "false");
    bar.appendChild(brand);
    bar.appendChild(hide);
    var lcd = el("div", "calc-lcd");
    lcd.appendChild(screen(calc));
    var keys = el("div", "calc-keys");
    SCREEN_KEYS.forEach(function (k) {
      var s = el("span", "calc-key", k);
      s.setAttribute("aria-hidden", "true");
      keys.appendChild(s);
    });
    if (calc.querySelector(".calc-catalog")) {
      var play = el("button", "calc-play", "Play");
      play.type = "button";
      play.setAttribute("aria-pressed", "false");
      keys.appendChild(play);
    }
    /* the text the story wrote stays in the page for the record, hidden
       once the display shows it */
    Array.prototype.forEach.call(calc.children, function (c) { c.classList.add("calc-src"); });
    calc.insertBefore(keypad(), calc.firstChild);
    calc.insertBefore(keys, calc.firstChild);
    calc.insertBefore(lcd, calc.firstChild);
    calc.insertBefore(bar, calc.firstChild);
    calc.classList.add("calc-on");
  }

  K.calcDraw = { newDots: newDots, text: text, left: left, right: right, axes: axes, polar: polar, toPath: toPath, formula: formula };
  if (typeof document !== "undefined" && K.calcFont) K.$$(".calc").forEach(build);
})(window.KeepTheLife);
