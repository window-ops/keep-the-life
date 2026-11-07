/* Keep the Life: sections, tabs and contents links */
(function (K) {
  "use strict";

  var $$ = K.$$, body = K.body;

  /* ---------------------------------------------------------- sections and tabs */

  var sections = $$(".sec");
  var chapters = $$(".chapter");
  K.current = sections.length ? sections[0].id : null;

  var links = {};
  $$(".toc a[href^='#']").forEach(function (a) { links[a.getAttribute("href").slice(1)] = a; });

  var tocBox = document.querySelector(".toc");

  /* the panel's own scroll position survives a reload, like the page's, and
     while the page is still settling after load the panel is placed at once,
     so the reader never watches it scroll on arrival */
  var tocSettled = false;
  if (tocBox) {
    var savedToc = Number(K.load("toc-scroll"));
    if (savedToc > 0) tocBox.scrollTop = savedToc;
    var tocSaveTimer = null;
    tocBox.addEventListener("scroll", function () {
      clearTimeout(tocSaveTimer);
      tocSaveTimer = setTimeout(function () { K.save("toc-scroll", String(Math.round(tocBox.scrollTop))); }, 200);
    }, { passive: true });
    window.addEventListener("pagehide", function () { K.save("toc-scroll", String(Math.round(tocBox.scrollTop))); });
    window.addEventListener("load", function () { setTimeout(function () { tocSettled = true; }, 600); });
  }

  /* keep the current section's link in view inside the contents: when it
     leaves the middle of the panel, the panel scrolls to centre it */
  function followToc(link) {
    if (!tocBox || !link || tocBox.scrollHeight <= tocBox.clientHeight + 1) return;
    var box = tocBox.getBoundingClientRect();
    var r = link.getBoundingClientRect();
    var top = r.top - box.top, h = box.height;
    if (top > h * 0.2 && top + r.height < h * 0.8) return;
    var target = tocBox.scrollTop + top - (h - r.height) / 2;
    if (tocSettled) K.followBox(tocBox, target);
    else tocBox.scrollTop = Math.max(0, target);
  }

  function markToc(id) {
    Object.keys(links).forEach(function (k) { links[k].classList.toggle("on", k === id); });
    followToc(links[id]);
  }

  function isTabbed() { return body.classList.contains("tabbed"); }

  function chapterOf(sec) { return sec.closest(".chapter"); }

  /* previous and next buttons, used in tabbed view */
  sections.forEach(function (sec, i) {
    var nav = document.createElement("nav");
    nav.className = "sec-nav";
    nav.hidden = true;
    nav.setAttribute("aria-label", "Section navigation");
    var prev = document.createElement("button");
    var next = document.createElement("button");
    prev.type = next.type = "button";
    prev.textContent = i > 0 ? "Previous: " + sections[i - 1].querySelector("h3").childNodes[1].textContent : "";
    next.textContent = i < sections.length - 1 ? "Next: " + sections[i + 1].querySelector("h3").childNodes[1].textContent : "";
    prev.disabled = i === 0;
    next.disabled = i === sections.length - 1;
    prev.addEventListener("click", function () { show(sections[i - 1].id, true); });
    next.addEventListener("click", function () { show(sections[i + 1].id, true); });
    nav.appendChild(prev);
    nav.appendChild(next);
    sec.appendChild(nav);
  });

  var active = {};

  var bookTabs = document.querySelector(".book-tabs");
  var story = document.querySelector(".story");

  function activeChapter() {
    var sec = document.getElementById(K.current);
    return sec ? chapterOf(sec) : chapters[0];
  }

  function renderTabs() {
    var on = isTabbed();
    var ac = activeChapter();
    if (bookTabs) bookTabs.hidden = !on;
    $$(".ctab").forEach(function (t) {
      var sel = t.getAttribute("aria-controls") === ac.id;
      t.setAttribute("aria-selected", String(sel));
      t.tabIndex = sel ? 0 : -1;
    });
    chapters.forEach(function (c) {
      c.hidden = on && c !== ac;
      if (on) {
        c.setAttribute("role", "tabpanel");
        c.setAttribute("aria-labelledby", "tab-" + c.id);
      } else {
        c.removeAttribute("role");
        c.setAttribute("aria-labelledby", c.id + "-h");
      }
      var secs = $$(".sec", c);
      var a = active[c.id] || secs[0].id;
      secs.forEach(function (sec) {
        sec.hidden = on && sec.id !== a;
        var nav = sec.querySelector(".sec-nav");
        if (nav) nav.hidden = !on;
        if (on) {
          sec.setAttribute("role", "tabpanel");
          sec.setAttribute("aria-labelledby", "tab-" + sec.id);
        } else {
          sec.removeAttribute("role");
          sec.setAttribute("aria-labelledby", sec.id + "-h");
        }
      });
      var list = c.querySelector(".ch-tabs");
      if (list) list.hidden = !on;
      $$(".stab", c).forEach(function (t) {
        var sel = t.getAttribute("aria-controls") === a;
        t.setAttribute("aria-selected", String(sel));
        t.tabIndex = sel ? 0 : -1;
      });
    });
  }

  function applyTabs() {
    var sec = document.getElementById(K.current);
    if (sec) active[chapterOf(sec).id] = K.current;
    renderTabs();
  }

  function show(id, scroll) {
    var sec = document.getElementById(id);
    if (sec && sec.classList.contains("chapter")) {
      id = (isTabbed() && active[sec.id]) || sec.querySelector(".sec").id;
      sec = document.getElementById(id);
    }
    if (!sec || !sec.classList.contains("sec")) return;
    K.current = id;
    active[chapterOf(sec).id] = id;
    if (isTabbed()) {
      renderTabs();
      /* bring the tabs and the start of the new panel into view */
      var top = story.getBoundingClientRect().top + window.scrollY;
      if (scroll || window.scrollY > top) K.scrollWindow(top);
    } else if (scroll) {
      K.scrollToEl(sec, "start");
    }
    markToc(id);
    if (history.replaceState) history.replaceState(null, "", "#" + id);
    /* only a tab switch puts new text on the page; scrolling to a section
       changes no line breaks, so the wrap engine is left alone */
    if (isTabbed()) K.schedulePretty();
  }

  $$(".tab").forEach(function (tab) {
    tab.addEventListener("click", function () { show(tab.getAttribute("aria-controls"), false); });
    tab.addEventListener("keydown", function (e) {
      var tabs = $$(".tab", tab.parentNode);
      var i = tabs.indexOf(tab);
      var j = null;
      if (e.key === "ArrowRight") j = (i + 1) % tabs.length;
      else if (e.key === "ArrowLeft") j = (i - 1 + tabs.length) % tabs.length;
      else if (e.key === "Home") j = 0;
      else if (e.key === "End") j = tabs.length - 1;
      if (j === null) return;
      e.preventDefault();
      show(tabs[j].getAttribute("aria-controls"), false);
      tabs[j].focus();
    });
  });

  /* contents links work in both views */
  Object.keys(links).forEach(function (id) {
    links[id].addEventListener("click", function (e) {
      var el = document.getElementById(id);
      if (!el) return;
      e.preventDefault();
      show(id, true);
    });
  });

  /* fade the edges of the contents and the notes panel where there is more
     to scroll; the panel's content changes as notes are added, so it is
     watched as well */
  $$(".toc, .notes-panel").forEach(function (box) {
    function fade() {
      var more = box.scrollHeight - box.clientHeight;
      box.classList.toggle("fade-top", more > 1 && box.scrollTop > 1);
      box.classList.toggle("fade-bottom", more > 1 && box.scrollTop < more - 1);
    }
    box.addEventListener("scroll", fade, { passive: true });
    box.addEventListener("toggle", fade);
    window.addEventListener("resize", fade);
    if (window.MutationObserver) new MutationObserver(fade).observe(box, { childList: true, subtree: true, attributes: true, attributeFilter: ["hidden"] });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fade);
    fade();
  });

  K.sections = sections;
  K.show = show;
  K.applyTabs = applyTabs;
  K.isTabbed = isTabbed;
  K.markToc = markToc;
})(window.KeepTheLife);
