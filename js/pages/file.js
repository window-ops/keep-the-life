/* Keep the Life: file page. The header switches between the traditional
   Item # and Object Class lines and the Anomaly Classification System bar;
   the choice is kept with the other settings. Without scripts the
   traditional header stays and the switch is hidden. */
(function (K) {
  "use strict";
  var classic = document.querySelector(".fl-classic");
  var acs = document.querySelector(".acs");
  var btns = Array.prototype.slice.call(document.querySelectorAll("[data-format]"));
  if (!classic || !acs || !btns.length) return;

  function set(format) {
    classic.hidden = format === "acs";
    acs.hidden = format !== "acs";
    btns.forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-format") === format)); });
  }

  set(K.load && K.load("file-header") === "acs" ? "acs" : "classic");
  btns.forEach(function (b) {
    b.addEventListener("click", function () {
      var format = b.getAttribute("data-format");
      set(format);
      if (K.save) K.save("file-header", format);
    });
  });
})(window.KeepTheLife);
