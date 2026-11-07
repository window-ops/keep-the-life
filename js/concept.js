/* Keep the Life: concept page. It follows the pretty wrap setting chosen in
   the story, on by default, and runs the engine once the fonts are in. */
(function (K) {
  "use strict";
  if (K.load && K.load("pretty") === "0") K.body.classList.remove("pretty");
  if (K.schedulePretty) K.schedulePretty();
})(window.KeepTheLife);
