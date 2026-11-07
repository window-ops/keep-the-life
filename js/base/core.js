/* Keep the Life: shared helpers, storage and the toast. Loads first; the
   other scripts read what it puts on window.KeepTheLife */
(function () {
  "use strict";

  var K = window.KeepTheLife = {};
  var root = document.documentElement;
  /* settings and reading tools need this script, so they stay hidden without it */
  root.classList.remove("no-js");
  var body = document.body;
  var KEY = "keep-the-life:";
  var $$ = function (sel, el) { return Array.prototype.slice.call((el || document).querySelectorAll(sel)); };

  /* Settings, highlights and notes live in sessionStorage by default, so they
     end with the tab. "Remember settings" moves them to localStorage and back. */
  var MODE_KEY = KEY + "storage";

  function rememberAlways() {
    try { return window.localStorage.getItem(MODE_KEY) === "local"; } catch (e) { return false; }
  }

  function area() {
    try { return rememberAlways() ? window.localStorage : window.sessionStorage; } catch (e) { return null; }
  }

  function load(k) { try { var a = area(); return a ? a.getItem(KEY + k) : null; } catch (e) { return null; } }
  function save(k, v) { try { var a = area(); if (a) a.setItem(KEY + k, v); } catch (e) { /* storage unavailable */ } }

  function ownKeys(store) {
    var keys = [];
    for (var i = 0; i < store.length; i++) {
      var k = store.key(i);
      if (k && k.indexOf(KEY) === 0 && k !== MODE_KEY) keys.push(k);
    }
    return keys;
  }

  function setRemember(always) {
    try {
      var from = always ? window.sessionStorage : window.localStorage;
      var to = always ? window.localStorage : window.sessionStorage;
      ownKeys(from).forEach(function (k) { to.setItem(k, from.getItem(k)); from.removeItem(k); });
      if (always) window.localStorage.setItem(MODE_KEY, "local");
      else window.localStorage.removeItem(MODE_KEY);
    } catch (e) { /* storage unavailable */ }
  }

  /* settings saved permanently by older versions of this page are cleared
     unless the reader has chosen to remember settings */
  try { if (!rememberAlways()) ownKeys(window.localStorage).forEach(function (k) { window.localStorage.removeItem(k); }); } catch (e) { /* storage unavailable */ }

  /* removes one saved value */
  function remove(k) { try { var a = area(); if (a) a.removeItem(KEY + k); } catch (e) { /* storage unavailable */ } }

  /* ---------------------------------------------------------- toast */

  var toast = document.querySelector(".toast");
  var toastTimer = null;

  function say(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add("on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove("on"); }, 1600);
  }

  K.root = root;
  K.body = body;
  K.$$ = $$;

  /* a short animation through the Web Animations API, skipped when motion is
     reduced; done runs once it ends, or at once when nothing plays. Motion
     starts fast and settles, unless an easing is given */
  K.animate = function (el, frames, ms, done, easing) {
    var calm = K.reducedMotion ? K.reducedMotion() : false;
    if (calm || !el.animate) { if (done) done(); return null; }
    var a = el.animate(frames, { duration: ms || 220, easing: easing || "cubic-bezier(0.3, 0, 0.2, 1)" });
    if (done) a.onfinish = done;
    return a;
  };
  K.load = load;
  K.save = save;
  K.remove = remove;
  K.rememberAlways = rememberAlways;
  K.setRemember = setRemember;
  K.say = say;
})();
