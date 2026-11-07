/* Keep the Life: glossary sorting. A to Z keeps the letters; First
   appearance groups the terms by the chapter that first uses them; Subject
   groups them by field. Each order has its own row of jump links, and the
   choice is kept with the other settings. */
(function (K) {
  "use strict";

  var bar = document.querySelector(".gl-sort");
  var bodyEl = document.querySelector(".gl-body");
  if (!bar || !bodyEl) return;
  var items = K.$$(".gl-item", bodyEl);
  var original = bodyEl.innerHTML;
  var subjects = bar.getAttribute("data-subjects").split("|");
  var letters = document.querySelector(".gl-index");
  var letterLinks = letters ? letters.innerHTML : "";

  function byTerm(a, b) { return a.getAttribute("data-term").localeCompare(b.getAttribute("data-term")); }

  /* the row of jump links above the terms names the groups of the current
     order: letters, chapters or subjects */
  function links(list) {
    if (!letters) return;
    letters.textContent = "";
    list.forEach(function (l) {
      var a = document.createElement("a");
      a.href = "#" + l.id;
      a.textContent = l.text;
      if (l.title) a.title = l.title;
      letters.appendChild(a);
    });
  }

  function group(keyOf, labelOf, keys, shortOf) {
    var out = {};
    items.forEach(function (it) { var k = keyOf(it); (out[k] = out[k] || []).push(it); });
    bodyEl.textContent = "";
    var nav = [];
    keys.filter(function (k) { return out[k]; }).forEach(function (k, n) {
      var id = "gl-g" + n;
      var h = document.createElement("h2");
      h.id = id + "-h";
      h.textContent = labelOf(k, out[k][0]);
      var sec = document.createElement("section");
      sec.className = "gl-sec";
      sec.id = id;
      nav.push({ id: h.id, text: shortOf ? shortOf(k) : h.textContent, title: h.textContent });
      sec.setAttribute("aria-labelledby", h.id);
      var dl = document.createElement("dl");
      dl.className = "gl-list";
      out[k].sort(byTerm).forEach(function (it) { dl.appendChild(it); });
      sec.appendChild(dl);
      bodyEl.appendChild(h);
      bodyEl.appendChild(sec);
    });
    links(nav);
  }

  function sort(mode) {
    K.$$("button[data-sort]", bar).forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.getAttribute("data-sort") === mode));
    });
    /* subjects are words of several letters, so they get a small dot
       between them, as in a word cloud */
    if (letters) letters.classList.toggle("gl-words", mode === "subject");
    if (mode === "alpha") {
      bodyEl.innerHTML = original;
      if (letters) letters.innerHTML = letterLinks;
      items = K.$$(".gl-item", bodyEl);
    } else if (mode === "first") {
      var nums = items.map(function (it) { return +it.getAttribute("data-first"); })
        .filter(function (v, i, a) { return a.indexOf(v) === i; }).sort(function (a, b) { return a - b; });
      group(function (it) { return +it.getAttribute("data-first"); },
            function (k, it) { return "Chapter " + k + ": " + it.getAttribute("data-first-title"); }, nums,
            function (k) { return String(k); });
    } else {
      group(function (it) { return it.getAttribute("data-subject"); }, function (k) { return k; }, subjects);
    }
    if (K.schedulePretty) K.schedulePretty();
  }

  bar.addEventListener("click", function (e) {
    var b = e.target.closest("button[data-sort]");
    if (!b) return;
    var mode = b.getAttribute("data-sort");
    sort(mode);
    K.save("glossarySort", mode);
  });
  var saved = K.load("glossarySort");
  if (saved === "first" || saved === "subject") sort(saved);
})(window.KeepTheLife);
