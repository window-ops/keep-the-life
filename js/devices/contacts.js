/* Keep the Life: the letter index of the contacts app.
   A tap on the star, a letter or # scrolls the list to that heading, or to
   the next one that has contacts, and the letter of the row at the top of the
   list is marked while it scrolls. When the screens are set to fit their
   content the list does not scroll inside the phone, so the page scrolls. */
(function () {
  "use strict";
  Array.prototype.forEach.call(document.querySelectorAll(".ph-az"), function (az) {
    var screen = az.closest(".ph-screen");
    var list = screen && screen.querySelector(".ph-body");
    if (!list) return;
    var heads = Array.prototype.slice.call(list.querySelectorAll(".ph-ct-h"));
    var keys = Array.prototype.map.call(az.children, function (li) { return li.getAttribute("data-k"); });

    function scrolls() { return list.scrollHeight > list.clientHeight + 1 && getComputedStyle(list).overflowY !== "visible"; }
    function mark(k) {
      Array.prototype.forEach.call(az.children, function (li) { li.classList.toggle("on", li.getAttribute("data-k") === k); });
    }
    function target(k) {
      for (var i = keys.indexOf(k); i < keys.length; i++) {
        for (var j = 0; j < heads.length; j++) if (heads[j].getAttribute("data-k") === keys[i]) return heads[j];
      }
      return heads[heads.length - 1];
    }
    az.addEventListener("click", function (ev) {
      var li = ev.target.closest("li");
      if (!li) return;
      var h = target(li.getAttribute("data-k"));
      if (!h) return;
      if (scrolls()) { hold = Date.now(); list.scrollTop = h.offsetTop - list.offsetTop; }
      else h.scrollIntoView({ block: "start" });
      mark(h.getAttribute("data-k"));
    });
    var hold = 0;
    list.addEventListener("scroll", function () {
      /* right after a tap the tapped letter stays marked, even when the list ends before it can reach the top */
      if (Date.now() - hold < 400) return;
      var top = list.scrollTop + list.offsetTop + 2, cur = heads[0];
      heads.forEach(function (h) { if (h.offsetTop <= top) cur = h; });
      if (cur) mark(cur.getAttribute("data-k"));
    }, { passive: true });
  });
})();
