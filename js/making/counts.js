/* Keep the Life: counts of the dialogue. countStory reads every reply in a
   document and returns, for the whole story and for each speaker, the
   replies, the spoken words and the stage directions in italics, with the
   median length of a reply next to the average. A reply continued after a
   screen counts once, and its words join the reply it continues. Spoken words leave out the speaker's
   name, the stage directions and the translations in brackets. On the story
   page the counts are saved, and sent back to the making page on a probe, so
   that page can show them when it is opened from a disk and cannot read the
   story file itself. */
(function (K) {
  "use strict";

  var INDEF = /\b(?:someone|anyone|everyone|somebody|anybody|everybody|nobody|no one)\b/gi;
  /* n't, 're, 'll, 've, 'd and 'm, and 's only after the words that take it
     as a contraction, so possessives such as Toma's are left out */
  var CONTR = /[A-Za-z]+['’](?:t|re|ll|ve|d|m)\b/g;
  var CONTR_S = /\b(?:it|that|there|here|what|who|where|how|he|she|let|everything|nothing|something)['’]s\b/gi;

  function words(text) {
    var n = 0;
    text.split(/\s+/).forEach(function (w) { if (/[0-9A-Za-zÀ-ɏ]/.test(w)) n++; });
    return n;
  }

  function matches(re, text) { var m = text.match(re); return m ? m.length : 0; }

  /* the middle value of a list, or the mean of the two middle values */
  function median(list) {
    if (!list.length) return 0;
    var a = list.slice().sort(function (x, y) { return x - y; }), m = a.length >> 1;
    return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2;
  }

  function countStory(doc) {
    var total = { replies: 0, words: 0, acts: 0, actWords: 0 };
    var bySp = {};
    var order = [];
    Array.prototype.forEach.call(doc.querySelectorAll(".ln"), function (ln) {
      var sp = ln.getAttribute("data-sp") || "?";
      var s = bySp[sp];
      if (!s) {
        var label = ln.querySelector(".sp");
        s = bySp[sp] = { sp: sp, name: label ? label.textContent.trim() : sp, replies: 0, words: 0, acts: 0, actWords: 0, contr: 0, indef: 0, perReply: [], actPerReply: [], actLens: [] };
        order.push(s);
      }
      if (!ln.classList.contains("ln-cont") || !s.perReply.length) {
        s.replies++; total.replies++;
        s.perReply.push(0); s.actPerReply.push(0);
      }
      var last = s.perReply.length - 1;
      Array.prototype.forEach.call(ln.querySelectorAll("p"), function (p) {
        Array.prototype.forEach.call(p.querySelectorAll("i.act"), function (act) {
          var w = words(act.textContent);
          s.acts++; s.actWords += w; total.acts++; total.actWords += w;
          s.actPerReply[last] += w;
          s.actLens.push(w);
        });
        var speech = p.cloneNode(true);
        Array.prototype.forEach.call(speech.querySelectorAll("i.act, .tr, .vh"), function (el) { el.parentNode.removeChild(el); });
        var text = speech.textContent;
        var w = words(text);
        s.words += w; total.words += w;
        s.perReply[last] += w;
        s.contr += matches(CONTR, text) + matches(CONTR_S, text);
        s.indef += matches(INDEF, text);
      });
    });
    /* only the medians travel with the counts, so the address sent back to
       the making page stays short */
    order.forEach(function (s) {
      s.medWords = median(s.perReply);
      /* most replies carry no stage direction, so the median per reply is
         often zero; the length of a typical direction says more, with the
         number of replies that carry one */
      s.actReplies = s.actPerReply.filter(function (w) { return w > 0; }).length;
      s.medActLen = median(s.actLens);
      delete s.perReply;
      delete s.actPerReply;
      delete s.actLens;
    });
    return { total: total, speakers: order };
  }

  K.countStory = countStory;

  /* on the story page itself, keep the counts for the making page. Opened
     as index.html?probe=making, the story also sends them back to notes/making.html
     in the address, which works from a disk without any storage */
  if (document.querySelector(".ln")) {
    var counts = countStory(document);
    if (K.save) { try { K.save("counts", JSON.stringify(counts)); } catch (e) { /* storage unavailable */ } }
    if (/[?&]probe=making(?:&|$)/.test(location.search)) {
      location.replace("notes/making.html#counts=" + encodeURIComponent(JSON.stringify(counts)));
    }
  }
})(window.KeepTheLife);
