/* Keep the Life: counts of the dialogue. countStory reads every reply in a
   document and returns, for the whole story and for each speaker, the
   replies, the spoken words and the stage directions in italics, with the
   median length of a reply next to the average. A reply continued after a
   screen counts once, and its words join the reply it continues. Spoken words leave out the speaker's
   name, the stage directions and the translations in brackets. The story is
   in two pages, one per part (body data-part), so countRaw keeps the length
   of every reply, mergeRaw joins the two parts and finish works out the
   medians. On a story page the raw counts of that part are saved, with the
   finished counts of both parts, and on a probe part 1 hands its raw counts
   to part 2, which sends the finished counts back to the making page, so
   that page can show them when it is opened from a disk and cannot read the
   story files itself. */
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

  function countRaw(doc) {
    var total = { replies: 0, words: 0, acts: 0, actWords: 0 };
    var bySp = {};
    var order = [];
    Array.prototype.forEach.call(doc.querySelectorAll(".ln"), function (ln) {
      var sp = ln.getAttribute("data-sp") || "?";
      var s = bySp[sp];
      if (!s) {
        var label = ln.querySelector(".sp");
        s = bySp[sp] = { sp: sp, name: ln.getAttribute("data-group") || (label ? label.textContent.trim() : sp), replies: 0, words: 0, acts: 0, actWords: 0, contr: 0, indef: 0, perReply: [], actPerReply: [], actLens: [] };
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
        Array.prototype.forEach.call(speech.querySelectorAll("i.act, .tr, .vh, .gloss-restore"), function (el) { el.parentNode.removeChild(el); });
        var text = speech.textContent;
        var w = words(text);
        s.words += w; total.words += w;
        s.perReply[last] += w;
        s.contr += matches(CONTR, text) + matches(CONTR_S, text);
        s.indef += matches(INDEF, text);
      });
    });
    return { total: total, speakers: order };
  }

  /* the raw counts of two parts as one story: sums add up, the lengths of
     the replies join, and a speaker new in the second part comes after the
     speakers of the first */
  function mergeRaw(a, b) {
    if (!a) return b;
    if (!b) return a;
    var out = { total: {}, speakers: [] }, bySp = {};
    ["replies", "words", "acts", "actWords"].forEach(function (k) { out.total[k] = (a.total[k] || 0) + (b.total[k] || 0); });
    a.speakers.concat(b.speakers).forEach(function (s) {
      var m = bySp[s.sp];
      if (!m) {
        m = bySp[s.sp] = { sp: s.sp, name: s.name, replies: 0, words: 0, acts: 0, actWords: 0, contr: 0, indef: 0, perReply: [], actPerReply: [], actLens: [] };
        out.speakers.push(m);
      }
      ["replies", "words", "acts", "actWords", "contr", "indef"].forEach(function (k) { m[k] += s[k] || 0; });
      m.perReply = m.perReply.concat(s.perReply || []);
      m.actPerReply = m.actPerReply.concat(s.actPerReply || []);
      m.actLens = m.actLens.concat(s.actLens || []);
    });
    return out;
  }

  /* only the medians travel with the finished counts, so the address sent
     back to the making page stays short */
  function finish(raw) {
    var c = JSON.parse(JSON.stringify(raw));
    c.speakers.forEach(function (s) {
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
    return c;
  }

  function countStory(doc) { return finish(countRaw(doc)); }

  K.countStory = countStory;
  K.countRaw = countRaw;
  K.mergeRaw = mergeRaw;
  K.finishCounts = finish;

  function loadRaw(part) {
    try { return JSON.parse((K.load && K.load("counts-raw-" + part)) || "null"); } catch (e) { return null; }
  }

  /* on a story page, keep the counts for the making page. Opened as
     index.html?probe=making, part 1 hands its raw counts to part 2 in the
     address (part2.html?probe=making#raw=), and part 2 sends the finished
     counts of both parts back to notes/making.html (#counts=), which works
     from a disk without any storage */
  if (document.querySelector(".ln")) {
    var part = document.body.getAttribute("data-part") || "1";
    var raw = countRaw(document);
    var probing = /[?&]probe=making(?:&|$)/.test(location.search);
    if (K.save) { try { K.save("counts-raw-" + part, JSON.stringify(raw)); } catch (e) { /* storage unavailable */ } }
    if (part === "1") {
      var both = mergeRaw(raw, loadRaw("2"));
      if (K.save) { try { K.save("counts", JSON.stringify(finish(both))); } catch (e) { /* storage unavailable */ } }
      if (probing) location.replace("part2.html?probe=making#raw=" + encodeURIComponent(JSON.stringify(raw)));
    } else {
      var first = null;
      var m = /[#&]raw=([^&]*)/.exec(location.hash);
      if (m) { try { first = JSON.parse(decodeURIComponent(m[1])); } catch (e) { first = null; } }
      if (!first) first = loadRaw("1");
      var all = finish(mergeRaw(first, raw));
      if (K.save) { try { K.save("counts", JSON.stringify(all)); } catch (e) { /* storage unavailable */ } }
      if (probing) location.replace("notes/making.html#counts=" + encodeURIComponent(JSON.stringify(all)));
    }
  }
})(window.KeepTheLife);
