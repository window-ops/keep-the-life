/* Keep the Life: the story opened as a probe for the making page
   (index.html?probe=making). This script is not deferred, so it runs before
   the story is drawn. It hides the whole page behind one line in the system
   font, so the browser lays out no text in the web fonts and starts no font
   downloads that the jump back to the making page would cut off. counts.js
   then counts the replies and sends the figures back. */
(function () {
  "use strict";
  if (!/[?&]probe=making(?:&|$)/.test(location.search)) return;
  document.documentElement.classList.add("probing");
  var style = document.createElement("style");
  style.textContent =
    "html.probing body > * { display: none !important; }" +
    "html.probing body::before { content: \"Counting the story\"; display: block;" +
    " padding: 3rem 1rem; text-align: center; font: 600 1.25rem/1.3 system-ui, sans-serif; color: var(--ink); }";
  document.head.appendChild(style);
})();
