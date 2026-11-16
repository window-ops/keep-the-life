/* Keep the Life: translations (glosses)
   Three modes, chosen with one button in the settings: the original with its
   translation (the normal mode), the original alone, or the translation alone,
   read as the text of the reply without its brackets. While a mode other than
   the normal one is on, every reply or screen that holds a translation shows a
   small button that brings back the normal mode, the way a reply hidden with
   the stage directions does. */
(function (K) {
  "use strict";

  var $$ = K.$$, body = K.body, load = K.load, save = K.save;
  var btn = document.getElementById("t-gloss");
  if (!btn) return;

  var MODES = ["both", "original", "translation"];
  var LABEL = { both: "Translations: shown", original: "Translations: hidden", translation: "Translations only" };

  /* a text node written in another language, by the lang of its element */
  function foreign(node) {
    var el = node.parentNode && node.parentNode.closest ? node.parentNode.closest("[lang]") : null;
    var lang = el ? el.getAttribute("lang") : "en";
    return lang && lang.slice(0, 2) !== "en";
  }

  /* mark what each translation translates, once: the foreign words before it
     in the same element, up to the previous translation, and its brackets */
  $$(".tr").forEach(function (tr) {
    var first = tr.firstChild, last = tr.lastChild;
    if (first && first.nodeType === 3 && first.nodeValue.charAt(0) === "(" &&
        last && last.nodeType === 3 && last.nodeValue.slice(-1) === ")") {
      var open = document.createElement("span");
      open.className = "tr-p";
      open.textContent = "(";
      first.nodeValue = first.nodeValue.slice(1);
      tr.insertBefore(open, tr.firstChild);
      var close = document.createElement("span");
      close.className = "tr-p";
      close.textContent = ")";
      last.nodeValue = last.nodeValue.slice(0, -1);
      tr.appendChild(close);
    }
    var n = tr.previousSibling;
    while (n && !(n.nodeType === 1 && n.classList.contains("tr"))) {
      var prev = n.previousSibling;
      if (n.nodeType === 1) {
        var lang = n.getAttribute("lang");
        if (lang && lang !== "en") n.classList.add("tr-orig");
      } else if (n.nodeType === 3 && n.nodeValue.trim() && (tr.classList.contains("tr-line") || foreign(n))) {
        var w = document.createElement("span");
        w.className = "tr-orig";
        n.parentNode.insertBefore(w, n);
        w.appendChild(n);
      }
      n = prev;
    }
  });

  /* the button that brings back the normal mode, once per reply or screen */
  function setMode(mode, keepEl) {
    MODES.forEach(function (m) { body.classList.toggle("gloss-" + m, m === mode && m !== "both"); });
    btn.textContent = LABEL[mode];
    /* the button in each reply names what it brings back */
    var restore = mode === "original" ? "Show translation" : "Show original";
    $$(".gloss-restore").forEach(function (b) { b.textContent = restore; });
    btn.setAttribute("data-mode", mode);
    save("gloss", mode);
    if (keepEl) {
      var top = keepEl.getBoundingClientRect().top;
      var hold = function () { window.scrollBy({ top: keepEl.getBoundingClientRect().top - top, behavior: "instant" }); };
      hold();
      requestAnimationFrame(function () { requestAnimationFrame(hold); });
      setTimeout(hold, 400);
    }
    if (K.schedulePretty) K.schedulePretty();
  }

  /* an article from a website and the employment contract (part 3) keep
     their own language switch, and the setting does not reach them */
  var hosts = [];
  $$(".tr").forEach(function (tr) {
    if (tr.closest(".lang-own")) return;
    var host = tr.closest(".ln, details.app, .scene");
    if (host && hosts.indexOf(host) < 0) hosts.push(host);
  });
  /* the button sits at the end of the reply, after its last word; on a
     screen it follows the screen */
  hosts.forEach(function (host) {
    var back = document.createElement("button");
    back.type = "button";
    back.className = "tool gloss-restore";
    back.addEventListener("click", function () { setMode("both", host); });
    if (host.matches("details.app")) {
      var wrap = document.createElement("div");
      wrap.className = "gloss-back";
      wrap.appendChild(back);
      host.appendChild(wrap);
    } else {
      var ps = host.querySelectorAll(":scope > p");
      var p = ps.length ? ps[ps.length - 1] : host;
      p.appendChild(document.createTextNode(" "));
      p.appendChild(back);
    }
  });

  /* the language switch of the Engrama article (SK, EN, SK/EN) and of the
     employment contract (RO, EN, RO/EN) selects one choice at a time, like the
     language menu of a website; the last choice shows the original with its
     translation and is the default */
  $$(".lang-own").forEach(function (page) {
    var langs = $$(".lang-sw button", page);
    langs.forEach(function (b) {
      b.addEventListener("click", function () {
        langs.forEach(function (o) { o.setAttribute("aria-pressed", String(o === b)); });
        page.setAttribute("data-lang", b.getAttribute("data-lang"));
        if (K.schedulePretty) K.schedulePretty();
      });
    });
  });

  btn.addEventListener("click", function () {
    var cur = btn.getAttribute("data-mode") || "both";
    setMode(MODES[(MODES.indexOf(cur) + 1) % MODES.length]);
  });
  var stored = load("gloss");
  setMode(MODES.indexOf(stored) >= 0 ? stored : "both");
})(window.KeepTheLife);
