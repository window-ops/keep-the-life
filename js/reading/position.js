/* Keep the Life: reading progress, position, section links and keys */
(function (K) {
  "use strict";

  var $$ = K.$$, body = K.body;

  /* ---------------------------------------------------------- progress and position */

  var bar = document.querySelector(".progress span");

  function onScroll() {
    if (bar) {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (max > 0 ? Math.min(1, window.scrollY / max) * 100 : 0).toFixed(2) + "%";
    }
    /* while the page glides to a section that is already marked, the
       sections it passes on the way are left unmarked */
    if (K.isTabbed() || K.pageAnimating()) return;
    var line = window.innerHeight * 0.3;
    var found = K.sections[0];
    for (var i = 0; i < K.sections.length; i++) {
      if (K.sections[i].getBoundingClientRect().top <= line) found = K.sections[i];
      else break;
    }
    if (found && found.id !== K.current) { K.current = found.id; K.markToc(K.current); }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);

  var start = location.hash.slice(1);
  if (start && document.getElementById(start) && document.getElementById(start).classList.contains("sec")) {
    K.current = start;
    if (K.isTabbed()) K.show(start, true);
  }
  K.markToc(K.current);
  onScroll();

  /* ---------------------------------------------------------- section links */

  $$(".plink").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var id = btn.getAttribute("data-target");
      var url = location.href.split("#")[0] + "#" + id;
      if (history.replaceState) history.replaceState(null, "", "#" + id);
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(function () { K.say("Link copied"); }, function () { K.say("Link in the address bar"); });
      } else {
        K.say("Link in the address bar");
      }
    });
  });

  /* the key list in the contents is folded away until asked for */
  var keysBtn = document.querySelector(".toc-keys-btn");
  var keysList = document.getElementById("toc-keys");
  if (keysBtn && keysList) {
    keysBtn.addEventListener("click", function () {
      var show = keysList.hidden;
      keysList.hidden = !show;
      keysBtn.setAttribute("aria-expanded", String(show));
      keysBtn.querySelector(".tk-label").textContent = show ? "Hide keys" : "Show keys";
    });
  }

  /* keyboard: n next section, p previous, b bookmark, s top of the page,
     e bottom of the page; the Keys setting switches them off */
  document.addEventListener("keydown", function (e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (!body.classList.contains("keys")) return;
    var t = e.target;
    if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || t.closest(".ghidra"))) return;
    if (e.key === "s" || e.key === "S") { e.preventDefault(); K.scrollWindow(0); return; }
    if (e.key === "e" || e.key === "E") { e.preventDefault(); K.scrollWindow(document.documentElement.scrollHeight); return; }
    if ((e.key === "b" || e.key === "B") && body.classList.contains("notes")) { e.preventDefault(); K.goBookmark(); return; }
    if (e.key !== "n" && e.key !== "p") return;
    var idx = K.sections.findIndex(function (s) { return s.id === K.current; });
    var next = e.key === "n" ? Math.min(K.sections.length - 1, idx + 1) : Math.max(0, idx - 1);
    if (K.sections[next]) K.show(K.sections[next].id, true);
  });
})(window.KeepTheLife);
