/* Keep the Life: pretty wrap */
(function (K) {
  "use strict";

  var $$ = K.$$, body = K.body;

  /* ---------------------------------------------------------- pretty wrap */

  /* Native text-wrap-style: pretty where the browser has it, on every element.
     Elsewhere this engine visits every block that holds wrapping text, looks for
     a short last line and joins the last few words with no-break spaces so the
     line before gives some of its words away. It moves as few words as it can,
     and never so many that the line before is left short. Add ?pw=js to force
     the engine. */
  var PW_SHORT = 0.15;      /* a last line narrower than this share of the block is short */
  var PW_MAX_JOINS = 2;     /* at most this many words move down */
  var PW_KEEP = 0.75;       /* the line before must stay at least this full */
  /* Trust the browser's native pretty wrap only when it actually prevents
     short last lines.  Firefox declares support for text-wrap-style: pretty
     through CSS.supports but its implementation does not rebalance lines
     aggressively enough, so a single orphan word still appears.  The probe
     below builds a narrow block whose last line would be a lone short word,
     applies the property, and checks whether the browser widens that line. */
  var nativePretty = false;
  if (!/[?&]pw=js\b/.test(location.search) &&
      window.CSS && CSS.supports && CSS.supports("text-wrap-style", "pretty")) {
    nativePretty = (function () {
      var div = document.createElement("div");
      /* A narrow column forces "x." onto a very short last line. */
      div.style.cssText = "position:absolute;left:-9999px;top:0;width:6em;" +
        "font:16px/1.2 sans-serif;white-space:normal;text-wrap-style:auto";
      div.textContent = "aa bb cc dd ee ff gg hh ii jj x.";
      body.appendChild(div);
      /* helper: width of the very last line of a block, measured through its
         sole text node with explicit range offsets so it works on every engine */
      function lastLineW() {
        var tn = div.firstChild;
        var len = tn.nodeValue.length;
        var range = document.createRange();
        /* find the last line by scanning characters from the end until the
           vertical position changes */
        var prev = null, start = len;
        for (var i = len - 1; i >= 0; i--) {
          range.setStart(tn, i);
          range.setEnd(tn, i + 1);
          var r = range.getClientRects();
          if (!r.length) continue;
          var top = Math.round(r[0].top);
          if (prev === null) prev = top;
          if (top !== prev) break;
          start = i;
        }
        range.setStart(tn, start);
        range.setEnd(tn, len);
        var rr = range.getBoundingClientRect();
        return rr.width;
      }
      var plain = lastLineW();
      div.style.textWrapStyle = "pretty";
      void div.offsetWidth;                     /* force style/layout recalc */
      var pretty = lastLineW();
      body.removeChild(div);
      /* if the last line got wider, the browser really rebalanced */
      return pretty > plain + 1;
    })();
  }
  /* When the JS engine will run instead, disable the CSS text-wrap-style so
     the browser's weak implementation does not fight the script's joins */
  if (!nativePretty && window.CSS && CSS.supports &&
      CSS.supports("text-wrap-style", "pretty")) {
    K.root.classList.add("pw-js");
  }

  var pwOriginal = new Map();

  function pwIsInline(el) {
    var d = getComputedStyle(el).display;
    return d === "inline" || d === "contents";
  }

  /* nearest ancestor that lays out its own lines */
  function pwBlockOf(node) {
    var el = node.parentElement;
    while (el && el !== body && pwIsInline(el)) el = el.parentElement;
    return el;
  }

  function pwWraps(el) {
    var ws = getComputedStyle(el).whiteSpace;
    return ws !== "pre" && ws !== "nowrap";
  }

  function pwVisibleText(n) {
    if (!/\S/.test(n.nodeValue)) return false;
    var p = n.parentElement;
    if (!p || p.closest("script, style, svg, textarea, input, select, option")) return false;
    return p.getClientRects().length > 0;
  }

  /* every block on the page that contains wrapping text, with its own text nodes */
  function pwBlocks() {
    var map = new Map();
    var walker = document.createTreeWalker(body, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      var n = walker.currentNode;
      if (!pwVisibleText(n)) continue;
      var block = pwBlockOf(n);
      if (!block || !pwWraps(block)) continue;
      if (!map.has(block)) map.set(block, []);
      map.get(block).push(n);
    }
    return map;
  }

  function pwUndoAll() {
    pwOriginal.forEach(function (value, node) { node.nodeValue = value; });
    pwOriginal.clear();
  }

  function pwUndoNodes(nodes) {
    nodes.forEach(function (n) {
      if (pwOriginal.has(n)) {
        n.nodeValue = pwOriginal.get(n);
        pwOriginal.delete(n);
      }
    });
  }

  /* line boxes of a block's own text, as [{top, bottom, left, right}] from top to bottom */

  /* Firefox returns a single bounding rect from range.getClientRects() when
     selectNodeContents covers a multi-line text node.  Detect this once and,
     when it happens, fall back to scanning the text node word-by-word with
     explicit Range offsets, which Firefox handles correctly. */
  var needsWordScan = null;               /* null = unknown, true/false after first check */

  function pwProbe() {
    /* build a two-line block off-screen and test whether selectNodeContents
       returns more than one rect */
    var div = document.createElement("div");
    div.style.cssText = "position:absolute;left:-9999px;top:0;width:80px;font:16px/1.2 sans-serif;white-space:normal";
    div.textContent = "a b c d e f g h i j k l m n";
    body.appendChild(div);
    var tn = div.firstChild;
    var range = document.createRange();
    range.selectNodeContents(tn);
    var rects = range.getClientRects();
    needsWordScan = rects.length < 2;
    body.removeChild(div);
  }

  function pwAddRect(lines, r) {
    if (r.width <= 0) return;
    var mid = r.top + r.height / 2;
    var line = null;
    for (var i = 0; i < lines.length; i++) {
      if (mid > lines[i].top && mid < lines[i].bottom) { line = lines[i]; break; }
    }
    if (line) {
      line.left = Math.min(line.left, r.left);
      line.right = Math.max(line.right, r.right);
    } else {
      lines.push({ top: r.top, bottom: r.bottom, left: r.left, right: r.right });
    }
  }

  /* word-by-word scan: create a range for each inter-space segment and collect
     its rects.  Much cheaper than per-character and accurate on every engine.
     Breakable whitespace (space, tab, newline) separates words, but a no-break
     space keeps joined words together so their combined width is measured. */
  var pwBreakable = /[ \t\n\r\f\v]/;
  function pwWordRects(lines, n, range) {
    var text = n.nodeValue;
    var len = text.length;
    var start = 0;
    while (start < len) {
      /* skip breakable whitespace */
      while (start < len && pwBreakable.test(text[start])) start++;
      if (start >= len) break;
      var end = start + 1;
      while (end < len && !pwBreakable.test(text[end])) end++;
      range.setStart(n, start);
      range.setEnd(n, end);
      var rects = range.getClientRects();
      for (var i = 0; i < rects.length; i++) pwAddRect(lines, rects[i]);
      start = end;
    }
  }

  function pwLines(nodes) {
    if (needsWordScan === null) pwProbe();
    var lines = [];
    var range = document.createRange();
    nodes.forEach(function (n) {
      if (needsWordScan) {
        pwWordRects(lines, n, range);
      } else {
        range.selectNodeContents(n);
        var rects = range.getClientRects();
        for (var i = 0; i < rects.length; i++) pwAddRect(lines, rects[i]);
      }
    });
    lines.sort(function (a, b) { return a.top - b.top; });
    return lines;
  }

  function pwWidth(el) {
    var cs = getComputedStyle(el);
    return el.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
  }

  function pwLastWidth(lines) {
    var last = lines[lines.length - 1];
    return last.right - last.left;
  }

  /* join the last `joins` word gaps with no-break spaces, across inline boundaries */
  function pwJoin(nodes, joins) {
    var done = 0;
    var seenWord = false;
    for (var i = nodes.length - 1; i >= 0 && done < joins; i--) {
      var node = nodes[i];
      var chars = node.nodeValue.split("");
      var changed = false;
      for (var j = chars.length - 1; j >= 0 && done < joins; j--) {
        if (/\s/.test(chars[j]) && chars[j] !== " ") {
          if (!seenWord) continue;
          var end = j;
          while (j > 0 && /\s/.test(chars[j - 1]) && chars[j - 1] !== " ") j--;
          chars.splice(j, end - j + 1, " ");
          done++;
          changed = true;
          seenWord = false;
        } else {
          seenWord = true;
        }
      }
      if (changed) {
        if (!pwOriginal.has(node)) pwOriginal.set(node, node.nodeValue);
        node.nodeValue = chars.join("");
      }
    }
    return done === joins;
  }

  function pwFix(el, nodes) {
    var lines = pwLines(nodes);
    if (lines.length < 2) return;
    var width = pwWidth(el);
    if (width <= 0 || pwLastWidth(lines) / width >= PW_SHORT) return;
    var height = el.getBoundingClientRect().height;
    for (var k = 1; k <= PW_MAX_JOINS; k++) {
      if (!pwJoin(nodes, k)) { pwUndoNodes(nodes); return; }
      var after = pwLines(nodes);
      var lastW = pwLastWidth(after);
      var prev = after.length > 1 ? after[after.length - 2] : null;
      var prevW = prev ? prev.right - prev.left : width;
      if (el.getBoundingClientRect().height > height + 1 || prevW / width < PW_KEEP) { pwUndoNodes(nodes); return; }
      /* long enough, or as long as it is allowed to get: keep it, since any
         join that passed the checks above beats a lone word on the last line */
      if (lastW / width >= PW_SHORT || k === PW_MAX_JOINS) return;
      pwUndoNodes(nodes);
    }
  }

  var pwBusy = false;

  function prettyWrap() {
    pwBusy = true;
    pwUndoAll();
    if (!nativePretty && body.classList.contains("pretty")) {
      pwBlocks().forEach(function (nodes, el) { pwFix(el, nodes); });
    }
    pwBusy = false;
  }

  var pwTimer = null;
  var pwRaf = null;
  function schedulePretty() {
    clearTimeout(pwTimer);
    if (pwRaf) { cancelAnimationFrame(pwRaf); pwRaf = null; }
    pwTimer = setTimeout(function run() {
      /* measuring every block mid-glide or while a drawer, the settings or a
         keypad is still moving would stall the animation, so the run waits
         until everything on the page has stopped */
      if (K.pageAnimating && K.pageAnimating()) { pwTimer = setTimeout(run, 150); return; }
      if (document.getAnimations) {
        var anims = document.getAnimations();
        for (var i = 0; i < anims.length; i++) {
          /* endless loops such as the blinking cursors never finish, so
             waiting for them would stop the engine from ever running */
          var t = anims[i].effect && anims[i].effect.getComputedTiming();
          if (t && t.iterations === Infinity) continue;
          if (anims[i].playState === "running") { pwTimer = setTimeout(run, 100); return; }
        }
      }
      /* run inside rAF so measurements happen at the start of a frame, not
         between frames where they force an extra layout pass */
      pwRaf = requestAnimationFrame(function () { pwRaf = null; prettyWrap(); });
    }, 150);
  }

  /* rerun on resize only when the content width changes by more than a scrollbar,
     so a scrollbar that appears after a run cannot start a loop */
  var pwLastViewport = document.documentElement.clientWidth;
  window.addEventListener("resize", function () {
    var w = document.documentElement.clientWidth;
    if (Math.abs(w - pwLastViewport) <= 24) return;
    pwLastViewport = w;
    schedulePretty();
  });
  $$("details").forEach(function (d) { d.addEventListener("toggle", schedulePretty); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(schedulePretty);


  K.schedulePretty = schedulePretty;
})(window.KeepTheLife);
