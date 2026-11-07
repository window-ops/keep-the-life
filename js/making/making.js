/* Keep the Life: the Numbers section of the making page. Served over the
   web, it reads ../index.html and counts it each time the page opens. Opened
   from a disk, where the browser does not let it read another file, it takes
   the counts the story sends back in the address after a probe
   (../index.html?probe=making), then the counts the story saved in this tab,
   and otherwise shows a notice with a button that runs the probe. */
(function (K) {
  "use strict";

  var out = document.getElementById("mk-counts");
  if (!out || !K.countStory) return;

  var TOP = 6;

  function n(x) { return Math.round(x).toLocaleString("en-US"); }
  function d1(x) { return (Math.round(x * 10) / 10).toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 }); }
  function per(a, b) { return b ? a / b : 0; }
  /* a median is a whole number or ends in .5, so it is shown as it is */
  function med(x) { return x % 1 ? d1(x) : n(x); }

  function el(tag, text, cls) {
    var e = document.createElement(tag);
    if (text) e.textContent = text;
    if (cls) e.className = cls;
    return e;
  }

  function find(list, sp) {
    for (var i = 0; i < list.length; i++) if (list[i].sp === sp) return list[i];
    return null;
  }

  var SOURCE = {
    live: "Counted from the story file when this page opened.",
    probe: "Counted by the story page just now.",
    stored: "Counted when the story was last opened in this browser tab."
  };

  /* two menus of every speaker, most replies first, and a line comparing
     the two chosen: contractions and indefinite pronouns such as "someone",
     as a count and per thousand spoken words. It starts on Toma and
     Kellerman, and the choice is kept with the other settings */
  function compare(speakers, first, second) {
    var all = speakers.slice().sort(function (a, b) { return b.replies - a.replies; });
    var box = el("div", null, "mk-compare");
    var row = el("p", null, "mk-compare-pick");
    var line = el("p", null, "mk-compare-out");
    line.setAttribute("aria-live", "polite");
    function menu(label, start, key) {
      var lab = el("label");
      lab.appendChild(document.createTextNode(label + " "));
      var sel = el("select");
      all.forEach(function (s) {
        var o = el("option", s.name + " (" + n(s.words) + " words)");
        o.value = s.sp;
        sel.appendChild(o);
      });
      var kept = K.load ? K.load(key) : null;
      sel.value = kept && find(all, kept) ? kept : (start ? start.sp : all[0].sp);
      sel.addEventListener("change", function () {
        if (K.save) K.save(key, sel.value);
        show();
      });
      lab.appendChild(sel);
      row.appendChild(lab);
      return sel;
    }
    var a = menu("Compare", first || all[0], "cmpA");
    row.appendChild(document.createTextNode(" "));
    var b = menu("with", second || all[1] || all[0], "cmpB");
    function part(s) {
      return s.name + " " + n(s.contr) + " contractions (" + d1(per(s.contr, s.words) * 1000) + " per thousand spoken words) and " +
        n(s.indef) + " indefinite pronouns (" + d1(per(s.indef, s.words) * 1000) + " per thousand)";
    }
    function show() {
      var x = find(all, a.value), y = find(all, b.value);
      line.textContent = x === y ? part(x) + "." : part(x) + "; " + part(y) + ".";
    }
    show();
    box.appendChild(row);
    box.appendChild(line);
    box.appendChild(el("p", "Indefinite pronouns are words such as \"someone\", \"anyone\" and \"no one\". For a speaker with few words, a rate per thousand rests on very few cases.", "mk-compare-note"));
    return box;
  }

  function render(c, how) {
    var t = c.total;
    out.textContent = "";
    out.appendChild(el("p", "The dialogue contains " + n(t.replies) + " replies with " + n(t.words) +
      " spoken words, and " + n(t.acts) + " stage directions in italics with " + n(t.actWords) + " words."));

    var list = c.speakers.slice().sort(function (a, b) { return b.replies - a.replies; }).slice(0, TOP);
    var ul = el("ul", null, "cx-conv");
    list.forEach(function (s) {
      ul.appendChild(el("li", s.name + ": " + n(s.replies) + " replies, " + n(s.words) + " spoken words, " +
        d1(per(s.words, s.replies)) + " per reply on average and " + med(s.medWords || 0) + " at the median; " +
        n(s.acts) + " stage directions in " + n(s.actReplies || 0) + " replies, " + n(s.actWords) +
        " words, " + d1(per(s.actWords, s.acts)) + " per direction on average and " + med(s.medActLen || 0) + " at the median."));
    });
    out.appendChild(ul);

    var toma = find(c.speakers, "t");
    var kel = find(c.speakers, "k");
    /* the reply count named in Who wrote what follows the story too */
    if (toma) K.$$("[data-mk=\"t-replies\"]").forEach(function (e) { e.textContent = n(toma.replies); });
    out.appendChild(compare(c.speakers, toma, kel));

    out.appendChild(el("p", SOURCE[how] || ""));
  }

  function fallback() {
    var saved = K.load ? K.load("counts") : null;
    if (saved) {
      try { render(JSON.parse(saved), "stored"); return; } catch (e) { /* stored counts unreadable */ }
    }
    /* opened from a disk with no saved counts: a notice set apart from the
       text, with a link that opens the story in this same tab */
    out.textContent = "";
    var box = el("div", null, "mk-notice");
    box.setAttribute("role", "note");
    box.appendChild(el("p", "Count the story to see the figures", "mk-notice-head"));
    box.appendChild(el("p", "Opened from a disk, this page cannot read the story file by itself. The button opens the story, which counts its own replies and brings you straight back here with the figures."));
    var go = el("a", "Count the story", "mk-go");
    go.href = "../index.html?probe=making";
    /* the probe replaces this page in the history, and the story replaces
       itself again on the way back, so Back still leads where it led before */
    go.addEventListener("click", function (e) { e.preventDefault(); location.replace(go.href); });
    var line = el("p");
    line.appendChild(go);
    box.appendChild(line);
    out.appendChild(box);
  }

  /* counts sent back by the story in the address, as #counts=<JSON> */
  function fromHash() {
    var m = /[#&]counts=([^&]*)/.exec(location.hash);
    if (!m) return null;
    try {
      var c = JSON.parse(decodeURIComponent(m[1]));
      return c && c.total && c.speakers && c.speakers.length ? c : null;
    } catch (e) { return null; }
  }

  /* after a probe the reader lands on the figures: once the fonts are in and
     the text has settled, the page moves to the Numbers heading, smoothly
     unless motion is reduced */
  function toNumbers() {
    var head = document.getElementById("mk-numbers");
    if (!head) return;
    var go = function () {
      var calm = K.reducedMotion ? K.reducedMotion() : false;
      head.scrollIntoView({ behavior: calm ? "auto" : "smooth", block: "start" });
    };
    var settle = function () { requestAnimationFrame(function () { requestAnimationFrame(go); }); };
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(settle, settle);
    else settle();
  }

  function run() {
    var sent = fromHash();
    if (sent) {
      render(sent, "probe");
      /* the counts leave the address once shown, so a reload counts again */
      try { history.replaceState(null, "", location.pathname + location.search); } catch (e) { /* address kept */ }
      toNumbers();
      return;
    }
    if (!window.fetch || !window.DOMParser || location.protocol === "file:") { fallback(); return; }
    fetch("../index.html").then(function (r) {
      if (!r.ok) throw new Error(String(r.status));
      return r.text();
    }).then(function (html) {
      render(K.countStory(new DOMParser().parseFromString(html, "text/html")), "live");
    }).catch(fallback);
  }

  run();
  /* coming back with the Back button can restore the page as it was left,
     notice included, so it looks again for the counts the story just saved */
  window.addEventListener("pageshow", function (e) { if (e.persisted) run(); });
})(window.KeepTheLife);
