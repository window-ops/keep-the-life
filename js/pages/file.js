/* Keep the Life: file page. Two switches, each kept with the other
   settings. File shows the Euclid revision of December 2029, the Explained
   revision of May 2030 or the archived revision of December 2030. Header
   switches each revision between the traditional Item # and Object Class
   lines and the Anomaly Classification System bar, and the header switches
   move together. Without scripts all three revisions show one after the
   other, each under its own label, with the traditional header, and the
   switches are hidden. */
(function (K) {
  "use strict";
  var $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };

  var classics = $$(".fl-classic");
  var acses = $$(".acs");
  var formatBtns = $$("[data-format]");
  if (classics.length && acses.length && formatBtns.length) {
    var setFormat = function (format) {
      classics.forEach(function (e) { e.hidden = format === "acs"; });
      acses.forEach(function (e) { e.hidden = format !== "acs"; });
      formatBtns.forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-format") === format)); });
    };
    setFormat(K.load && K.load("file-header") === "acs" ? "acs" : "classic");
    formatBtns.forEach(function (b) {
      b.addEventListener("click", function () {
        var format = b.getAttribute("data-format");
        setFormat(format);
        if (K.save) K.save("file-header", format);
      });
    });
  }

  var versions = $$(".fl-version");
  var versionBtns = $$("button[data-version]");
  if (versions.length && versionBtns.length) {
    var setVersion = function (v) {
      versions.forEach(function (e) { e.hidden = e.getAttribute("data-version") !== v; });
      versionBtns.forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-version") === v)); });
      if (K.schedulePretty) K.schedulePretty();
    };
    var saved = K.load && K.load("file-version");
    setVersion(saved === "explained" || saved === "archived" ? saved : "euclid");
    versionBtns.forEach(function (b) {
      b.addEventListener("click", function () {
        var v = b.getAttribute("data-version");
        setVersion(v);
        if (K.save) K.save("file-version", v);
      });
    });
  }
})(window.KeepTheLife);
