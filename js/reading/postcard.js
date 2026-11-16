/* Keep the Life: the postcard of part 3
   The postcard shows one side at a time, large enough to read, and turns
   over with its button only, so the text on the card can be selected. The
   side turned away is inert,
   so keyboards and screen readers reach only the side in view. Without the
   script both sides show, one under the other. */
(function (K) {
  "use strict";

  K.$$(".pc").forEach(function (pc) {
    var card = pc.querySelector(".pc-card");
    var front = pc.querySelector(".pc-front");
    var back = pc.querySelector(".pc-back");
    var btn = pc.querySelector(".pc-turn");
    if (!card || !front || !back || !btn) return;

    function show(side) {
      var onBack = side === "back";
      pc.setAttribute("data-side", side);
      front.inert = onBack;
      back.inert = !onBack;
      front.setAttribute("aria-hidden", String(onBack));
      back.setAttribute("aria-hidden", String(!onBack));
      btn.textContent = onBack ? "Turn to the picture side" : "Turn to the written side";
    }
    function turn() {
      show(pc.getAttribute("data-side") === "back" ? "front" : "back");
    }

    pc.classList.add("pc-js");
    btn.hidden = false;
    btn.addEventListener("click", turn);
    show("front");
  });
})(window.KeepTheLife);
