/* Keep the Life: highlights, notes, quotes and the bookmark */
(function (K) {
  "use strict";

  var $$ = K.$$, body = K.body, load = K.load, save = K.save;

  /* ---------------------------------------------------------- highlights, notes and quotes */

  var HL_COLORS = ["speaker", "yellow", "orange", "green", "blue", "pink"];
  var ICON = {
    hl: '<path d="M9.5 2.5l4 4-6 6H3.5v-4z"/><path d="M2.5 14h11"/>',
    note: '<path d="M3 2.5h7l3 3v8H3z"/><path d="M5.5 7.5h5M5.5 10h3.5"/>',
    quote: '<path d="M3 9.5c0-3 1.5-5 4-5.5M3 9.5h3.5V13H3zM9.5 9.5c0-3 1.5-5 4-5.5M9.5 9.5H13V13H9.5z"/>',
    bookmark: '<path d="M4.5 2.5h7v11L8 10.5l-3.5 3z"/>',
    none: '<path d="M4 4l8 8M12 4l-8 8"/>'
  };

  function svg(name) {
    return '<svg class="ico" viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">' + ICON[name] + "</svg>";
  }

  var clearBtn = document.querySelector(".notes-clear");
  var marks = {};
  var quotes = [];
  try { marks = JSON.parse(load("marks") || "{}") || {}; } catch (e) { marks = {}; }
  try { quotes = JSON.parse(load("quotes") || "[]") || []; } catch (e) { quotes = []; }
  /* highlights saved before colours existed become orange */
  Object.keys(marks).forEach(function (id) { if (marks[id].hl === true) marks[id].hl = "orange"; });

  function saveMarks() { save("marks", JSON.stringify(marks)); }
  function saveQuotes() { save("quotes", JSON.stringify(quotes)); }

  var notesBox = document.querySelector(".notes-panel");
  var notesCount = notesBox && notesBox.querySelector(".notes-count");
  var notesEmpty = notesBox && notesBox.querySelector(".notes-empty");
  function panelSec(kind) { return notesBox && notesBox.querySelector('.panel-sec[data-kind="' + kind + '"]'); }
  var hlBox = panelSec("hl"), noteBox = panelSec("note"), quotesBox = panelSec("quote");
  var hlList = hlBox && hlBox.querySelector("ol");
  var noteList = noteBox && noteBox.querySelector("ol");
  var quotesList = quotesBox && quotesBox.querySelector("ol");

  function plain(t) { return t.replace(/ /g, " ").replace(/\s+/g, " ").trim(); }

  function lineLabel(ln) {
    var sec = ln.closest(".sec");
    var n = sec ? sec.querySelector(".sec-n").textContent : "";
    var who = ln.querySelector(".sp").textContent;
    var text = plain(ln.querySelector("p").textContent);
    return { n: n, who: who, text: text.length > 60 ? text.slice(0, 60) + "..." : text };
  }

  function byPosition(a, b) {
    var pa = document.getElementById(a), pb = document.getElementById(b);
    return pa.compareDocumentPosition(pb) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
  }

  function jumpTo(ln) {
    var sec = ln.closest(".sec");
    if (sec) K.show(sec.id, false);
    K.scrollToEl(ln, "center");
  }

  function entry(ln, text, color) {
    var a = document.createElement("a");
    a.href = "#" + ln.id;
    if (color) { a.className = "has-hl"; a.setAttribute("data-hl", color); a.setAttribute("data-sp", ln.getAttribute("data-sp")); }
    var num = document.createElement("span");
    num.className = "toc-n";
    num.textContent = lineLabel(ln).n;
    a.appendChild(num);
    var t = document.createElement("span");
    t.textContent = text;
    a.appendChild(t);
    a.addEventListener("click", function (e) { e.preventDefault(); jumpTo(ln); });
    return a;
  }

  function renderNotes() {
    if (!notesBox) return;
    var ids = Object.keys(marks).filter(function (id) { return document.getElementById(id); }).sort(byPosition);
    var hlIds = ids.filter(function (id) { return marks[id].hl; });
    var noteIds = ids.filter(function (id) { return marks[id].note; });

    hlList.textContent = "";
    hlIds.forEach(function (id) {
      var ln = document.getElementById(id);
      var l = lineLabel(ln);
      var li = document.createElement("li");
      li.appendChild(entry(ln, l.who + ": " + l.text, marks[id].hl));
      hlList.appendChild(li);
    });
    hlBox.hidden = hlIds.length === 0;

    noteList.textContent = "";
    noteIds.forEach(function (id) {
      var ln = document.getElementById(id);
      var li = document.createElement("li");
      li.appendChild(entry(ln, marks[id].note, ""));
      noteList.appendChild(li);
    });
    noteBox.hidden = noteIds.length === 0;

    var qs = quotes.filter(function (q) { return document.getElementById(q.id); });
    if (quotesList) {
      quotesList.textContent = "";
      qs.forEach(function (q) {
        var ln = document.getElementById(q.id);
        var li = document.createElement("li");
        var a = entry(ln, "", "");
        a.lastChild.textContent = "";
        var blk = document.createElement("q");
        blk.textContent = q.text;
        var who = document.createElement("span");
        who.className = "q-who";
        who.textContent = ln.querySelector(".sp").textContent;
        a.lastChild.appendChild(blk);
        a.lastChild.appendChild(who);
        li.appendChild(a);
        var del = document.createElement("button");
        del.type = "button";
        del.className = "q-del";
        del.setAttribute("aria-label", "Remove this quote");
        del.innerHTML = svg("none");
        del.addEventListener("click", function () {
          quotes.splice(quotes.indexOf(q), 1);
          saveQuotes();
          renderNotes();
        });
        li.appendChild(del);
        quotesList.appendChild(li);
      });
    }
    if (quotesBox) quotesBox.hidden = qs.length === 0;

    var total = hlIds.length + noteIds.length + qs.length;
    if (notesCount) notesCount.textContent = total ? String(total) : "";
    if (notesEmpty) notesEmpty.hidden = total > 0;
    if (clearBtn) clearBtn.hidden = total === 0;
  }

  function setMark(id, patch) {
    var m = marks[id] || {};
    Object.keys(patch).forEach(function (k) { m[k] = patch[k]; });
    if (!m.hl && !m.note) delete marks[id];
    else marks[id] = m;
    saveMarks();
    renderNotes();
  }

  function sizeNote(ta) { ta.style.height = "auto"; ta.style.height = ta.scrollHeight + 2 + "px"; }

  function openNote(ln, focus) {
    var box = ln.querySelector(".ln-note");
    if (!box) {
      box = document.createElement("div");
      box.className = "ln-note";
      var ta = document.createElement("textarea");
      ta.rows = 1;
      ta.placeholder = "Your note on this line";
      ta.setAttribute("aria-label", "Note on this line");
      ta.value = (marks[ln.id] && marks[ln.id].note) || "";
      var timer = null;
      ta.addEventListener("input", function () {
        sizeNote(ta);
        clearTimeout(timer);
        timer = setTimeout(function () { setMark(ln.id, { note: ta.value.trim() }); }, 300);
      });
      ta.addEventListener("blur", function () {
        setMark(ln.id, { note: ta.value.trim() });
        if (!ta.value.trim()) { box.remove(); ln.classList.remove("has-note"); }
      });
      box.appendChild(ta);
      ln.appendChild(box);
      sizeNote(ta);
    }
    ln.classList.add("has-note");
    if (focus) box.querySelector("textarea").focus();
  }

  function paintHighlight(ln, color) {
    ln.classList.toggle("is-hl", !!color);
    if (color) ln.setAttribute("data-hl", color);
    else ln.removeAttribute("data-hl");
    var hl = ln.querySelector(".ln-hl");
    if (hl) hl.setAttribute("aria-pressed", String(!!color));
    $$(".ln-sw", ln).forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.getAttribute("data-color") === color));
    });
  }

  /* the words selected inside a reply, if any */
  function selectionIn(ln) {
    var sel = window.getSelection && window.getSelection();
    if (!sel || sel.isCollapsed || !sel.rangeCount) return "";
    var range = sel.getRangeAt(0);
    var p = ln.querySelector("p");
    if (!p.contains(range.commonAncestorContainer) && range.commonAncestorContainer !== p) return "";
    return plain(sel.toString());
  }

  function saveQuote(ln, text) {
    if (!text) return;
    quotes.push({ id: ln.id, text: text });
    saveQuotes();
    renderNotes();
    if (window.getSelection) window.getSelection().removeAllRanges();
    if (notesBox) notesBox.open = true;
    K.say("Quote saved");
  }

  function button(cls, label, icon) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "ln-btn " + cls;
    b.setAttribute("aria-label", label);
    if (icon) b.innerHTML = svg(icon);
    /* keep a text selection alive when a toolbar button is pressed */
    b.addEventListener("mousedown", function (e) { e.preventDefault(); });
    return b;
  }

  /* one bookmark, "this is where I left", kept with the other settings */
  var bookmark = load("bookmark");
  var bmGo = document.getElementById("t-bm");
  if (bookmark && !document.getElementById(bookmark)) bookmark = null;

  function setBookmark(id) {
    var old = bookmark && document.getElementById(bookmark);
    if (old) {
      old.classList.remove("is-bm");
      old.querySelector(".ln-bm").setAttribute("aria-pressed", "false");
    }
    bookmark = id;
    var ln = id && document.getElementById(id);
    if (ln) {
      ln.classList.add("is-bm");
      ln.querySelector(".ln-bm").setAttribute("aria-pressed", "true");
      save("bookmark", id);
    } else {
      K.remove("bookmark");
    }
    if (bmGo) bmGo.disabled = !ln;
  }

  function goBookmark() {
    var ln = bookmark && document.getElementById(bookmark);
    if (!ln) { K.say("No bookmark yet"); return; }
    K.show(ln.closest(".sec").id, false);
    K.scrollToEl(ln, "center");
  }

  if (bmGo) bmGo.addEventListener("click", goBookmark);

  $$(".ln[id]").forEach(function (ln) {
    var tools = document.createElement("span");
    tools.className = "ln-tools";
    /* a floating toolbar anchored to the reply's top right corner, sitting on
       the divider above it, so it takes no space in the layout */
    tools.setAttribute("role", "toolbar");
    tools.setAttribute("aria-label", "Reply tools");

    var hl = button("ln-hl", "Highlight this line, or remove its highlight", "hl");
    hl.setAttribute("aria-pressed", "false");
    hl.setAttribute("aria-expanded", "false");
    var swatches = document.createElement("span");
    swatches.className = "ln-swatches";
    swatches.hidden = true;
    HL_COLORS.forEach(function (c) {
      var sw = button("ln-sw", c === "speaker" ? "Highlight in the speaker's color" : "Highlight " + c, "");
      sw.setAttribute("data-color", c);
      sw.setAttribute("aria-pressed", "false");
      sw.addEventListener("click", function () {
        /* the colour already in use removes the highlight */
        var next = ln.getAttribute("data-hl") === c ? "" : c;
        paintHighlight(ln, next);
        setMark(ln.id, { hl: next });
        swatches.hidden = true;
        hl.setAttribute("aria-expanded", "false");
      });
      swatches.appendChild(sw);
    });


    var nt = button("ln-nt", "Add a note to this line", "note");
    var bm = button("ln-bm", "Bookmark this line as where I left", "bookmark");
    bm.setAttribute("aria-pressed", "false");
    bm.addEventListener("click", function () {
      /* the bookmarked reply's button removes the bookmark */
      if (bookmark === ln.id) { setBookmark(null); K.say("Bookmark removed"); }
      else { setBookmark(ln.id); K.say("Bookmark set"); }
    });

    tools.appendChild(swatches);
    tools.appendChild(hl);
    tools.appendChild(nt);
    tools.appendChild(bm);
    ln.appendChild(tools);

    var m = marks[ln.id];
    if (m && m.hl) paintHighlight(ln, m.hl);
    if (m && m.note) openNote(ln, false);

    hl.addEventListener("click", function () {
      /* on a highlighted reply the highlighter removes the highlight */
      if (ln.classList.contains("is-hl")) {
        paintHighlight(ln, "");
        setMark(ln.id, { hl: "" });
        swatches.hidden = true;
        hl.setAttribute("aria-expanded", "false");
        return;
      }
      /* highlight at once in the speaker's color, and offer the other colors */
      paintHighlight(ln, "speaker");
      setMark(ln.id, { hl: "speaker" });
      swatches.hidden = false;
      hl.setAttribute("aria-expanded", "true");
    });
    nt.addEventListener("click", function () { openNote(ln, true); });
    ln.addEventListener("mouseleave", function () {
      swatches.hidden = true;
      hl.setAttribute("aria-expanded", "false");
    });
  });

  /* selecting words inside a reply offers a quote button just above them */
  var selBtn = document.createElement("button");
  selBtn.type = "button";
  selBtn.className = "sel-quote";
  selBtn.hidden = true;
  selBtn.innerHTML = svg("quote") + "<span>Quote</span>";
  selBtn.addEventListener("mousedown", function (e) { e.preventDefault(); });
  body.appendChild(selBtn);
  var selLine = null;

  function placeSelBtn() {
    selBtn.hidden = true;
    selLine = null;
    if (!body.classList.contains("notes")) return;
    var sel = window.getSelection && window.getSelection();
    if (!sel || sel.isCollapsed || !sel.rangeCount) return;
    var range = sel.getRangeAt(0);
    var node = range.commonAncestorContainer;
    var el = node.nodeType === 1 ? node : node.parentElement;
    var p = el && el.closest(".ln[id] p");
    if (!p || !plain(sel.toString())) return;
    var rect = range.getBoundingClientRect();
    selLine = p.closest(".ln");
    selBtn.hidden = false;
    var w = selBtn.offsetWidth, h = selBtn.offsetHeight;
    var left = Math.max(8, Math.min(document.documentElement.clientWidth - w - 8, rect.left + rect.width / 2 - w / 2));
    var top = rect.top - h - 8;
    if (top < 8) top = rect.bottom + 8;
    selBtn.style.left = left + window.scrollX + "px";
    selBtn.style.top = top + window.scrollY + "px";
  }

  var selTimer = null;
  document.addEventListener("selectionchange", function () {
    clearTimeout(selTimer);
    selTimer = setTimeout(placeSelBtn, 120);
  });
  window.addEventListener("resize", function () { if (!selBtn.hidden) placeSelBtn(); });
  selBtn.addEventListener("click", function () {
    if (!selLine) return;
    saveQuote(selLine, selectionIn(selLine));
    selBtn.hidden = true;
  });

  if (clearBtn) {
    clearBtn.addEventListener("click", function () {
      if (!window.confirm("Remove every highlight, note and quote?")) return;
      marks = {};
      quotes = [];
      saveMarks();
      saveQuotes();
      $$(".ln.is-hl").forEach(function (ln) { paintHighlight(ln, ""); });
      $$(".ln-note").forEach(function (b) { b.closest(".ln").classList.remove("has-note"); b.remove(); });
      renderNotes();
    });
  }

  /* on touch screens there is no hover, so a tap on a reply shows its buttons */
  if (window.matchMedia && window.matchMedia("(hover: none)").matches) {
    document.addEventListener("click", function (e) {
      var ln = e.target.closest(".ln[id]");
      if (e.target.closest(".ln-tools, .ln-note, a, button")) return;
      $$(".ln.tools-open").forEach(function (x) { if (x !== ln) x.classList.remove("tools-open"); });
      if (ln) ln.classList.toggle("tools-open");
    });
  }

  renderNotes();
  setBookmark(bookmark);

  K.goBookmark = goBookmark;
})(window.KeepTheLife);
