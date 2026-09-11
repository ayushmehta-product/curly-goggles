"use strict";
(function () {
  if (window.__QPUX_EXT) return;
  window.__QPUX_EXT = true;
  var DEPTHS = [25, 50, 75, 100];
  var seen = {};
  function emit(type, extra) {
    var ev = { t: type, ts: Date.now(), u: location.href, src: "extension" };
    for (var k in extra) ev[k] = extra[k];
    (window.__QPUX = window.__QPUX || []).push(ev);
    window.dispatchEvent(new CustomEvent("qpux:event", { detail: ev }));
  }
  document.addEventListener(
    "click",
    function (e) {
      var t = e.target;
      if (!t || !t.tagName || t.tagName === "INPUT" || t.tagName === "TEXTAREA") return;
      var label = (t.innerText || "").replace(/\s+/g, " ").trim().slice(0, 80);
      emit("click", { s: t.id ? "#" + t.id : t.tagName.toLowerCase(), txt: label });
    },
    true
  );
  window.addEventListener(
    "scroll",
    function () {
      var sh = Math.max(document.documentElement.scrollHeight, 1);
      var dp = Math.min(100, Math.round(((window.scrollY + window.innerHeight) / sh) * 100));
      DEPTHS.forEach(function (th) {
        if (dp >= th && !seen[th]) {
          seen[th] = 1;
          emit("scroll", { d: th });
        }
      });
    },
    { passive: true }
  );
  emit("ready", { v: 1 });
})();
