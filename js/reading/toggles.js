/* Keep the Life: toggles */
(function (K) {
  "use strict";

  var $$ = K.$$, body = K.body, load = K.load, save = K.save;

  /* ---------------------------------------------------------- toggles */

  function setToggle(btn, on) {
    var cls = btn.getAttribute("data-toggle");
    body.classList.toggle(cls, on);
    btn.setAttribute("aria-pressed", String(on));
    if (cls === "tabbed") K.applyTabs();
    if (cls === "no-toc") btn.textContent = on ? "Show contents" : "Hide contents";
    if (cls === "no-acts") btn.textContent = on ? "Show stage directions" : "Hide stage directions";
    if (cls === "no-motion") btn.textContent = on ? "Allow blinking" : "Stop blinking";
    if (cls === "pretty") btn.textContent = on ? "Pretty wrap: on" : "Pretty wrap: off";
    if (cls === "show-progress") btn.textContent = on ? "Reading progress: on" : "Reading progress: off";
    if (cls === "keys") btn.textContent = on ? "Keys: on" : "Keys: off";
    if (cls === "fit-size") btn.textContent = on ? "Sizes: fit to content" : "Sizes: fixed";
    if (cls === "open-all") {
      btn.textContent = on ? "Screens: always open" : "Screens: foldable";
      if (K.openAll) K.openAll(on);
    }
    if (cls === "notes") {
      btn.textContent = on ? "Highlights and notes: on" : "Highlights and notes: off";
      /* switching the feature on opens its panel */
      var panel = document.querySelector(".notes-panel");
      if (on && panel) panel.open = true;
    }
    K.schedulePretty();
  }

  /* a reply made only of stage directions keeps its place while they are
     hidden: it says the reply was removed with them and offers a button that
     brings them back, since the stage directions carry the story and hiding
     them is only for comparing. The note is a div, so the counts on the
     making page, which read the paragraphs, leave it out */
  var actsBtn = document.querySelector('.tool[data-toggle="no-acts"]');
  if (actsBtn) {
    $$(".ln-act").forEach(function (ln) {
      var note = document.createElement("div");
      note.className = "act-gone";
      var msg = document.createElement("span");
      msg.textContent = "Reply removed: it contains only stage directions, which are hidden.";
      var back = document.createElement("button");
      back.type = "button";
      back.className = "tool act-restore";
      back.textContent = "Show stage directions";
      back.addEventListener("click", function () {
        /* the reply stays where it was on the screen while the text above
           it grows back */
        var top = ln.getBoundingClientRect().top;
        actsBtn.click();
        var hold = function () { window.scrollBy({ top: ln.getBoundingClientRect().top - top, behavior: "instant" }); };
        hold();
        /* pretty wrap may reflow the text a moment later; hold the reply again */
        requestAnimationFrame(function () { requestAnimationFrame(hold); });
        setTimeout(hold, 400);
        ln.setAttribute("tabindex", "-1");
        ln.focus({ preventScroll: true });
      });
      note.appendChild(msg);
      note.appendChild(back);
      var p = ln.querySelector(":scope > p");
      ln.insertBefore(note, p ? p.nextSibling : null);
    });
  }

  $$(".tool[data-toggle]").forEach(function (btn) {
    var cls = btn.getAttribute("data-toggle");
    var stored = load(cls);
    var on = stored === null ? btn.getAttribute("data-default") === "1" : stored === "1";
    setToggle(btn, on);
    btn.addEventListener("click", function () {
      var on = !body.classList.contains(cls);
      setToggle(btn, on);
      save(cls, on ? "1" : "0");
    });
  });
})(window.KeepTheLife);
