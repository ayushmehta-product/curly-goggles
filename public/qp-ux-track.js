"use strict";
(function (w, d) {
  var KEY = (d.currentScript && d.currentScript.getAttribute("data-qpux-key")) || "demo";
  var DEPTHS = [25, 50, 75, 100];
  var seen = {};
  function esc(s) {
    return (w.CSS && CSS.escape) ? CSS.escape(s) : s.replace(/[^a-zA-Z0-9_-]/g, "\\$&");
  }
  function sel(el) {
    if (!el || el === d.body) return "body";
    if (el.id) return "#" + esc(el.id);
    var test = el.getAttribute("data-testid") || el.getAttribute("data-track");
    if (test) return '[data-testid="' + esc(test) + '"]';
    var p = [], n = el, i = 0;
    while (n && n !== d.body && i < 5) {
      if (n.id) { p.unshift("#" + esc(n.id)); break; }
      var t = n.tagName.toLowerCase();
      var c = typeof n.className === "string" ? n.className.trim().split(/\s+/).slice(0, 2).join(".") : "";
      p.unshift(c ? t + "." + c : t);
      n = n.parentElement; i++;
    }
    return p.join(">") || "body";
  }
  function emit(type, extra) {
    var ev = { t: type, k: KEY, ts: Date.now(), u: location.href };
    for (var k in extra) ev[k] = extra[k];
    (w.__QPUX = w.__QPUX || []).push(ev);
    w.dispatchEvent(new CustomEvent("qpux:event", { detail: ev }));
    if (navigator.sendBeacon) navigator.sendBeacon("/qpux/collect", JSON.stringify(ev));
  }
  d.addEventListener("click", function (e) {
    var t0 = performance.now();
    var t = e.target;
    if (!t || !t.tagName || t.tagName === "INPUT" || t.tagName === "TEXTAREA") return;
    emit("click", { s: sel(t), x: e.clientX, y: e.clientY, ms: +(performance.now() - t0).toFixed(2) });
  }, true);
  function depth() {
    var el = d.documentElement, b = d.body;
    var sh = Math.max(el.scrollHeight, b ? b.scrollHeight : 0, 1);
    var y = w.scrollY || el.scrollTop || 0;
    return Math.min(100, Math.round(((y + w.innerHeight) / sh) * 100));
  }
  w.addEventListener("scroll", function () {
    var t0 = performance.now();
    var dp = depth();
    for (var i = 0; i < DEPTHS.length; i++) {
      var th = DEPTHS[i];
      if (dp >= th && !seen[th]) {
        seen[th] = 1;
        emit("scroll", { d: th, ms: +(performance.now() - t0).toFixed(2) });
      }
    }
  }, { passive: true });
  if (w.IntersectionObserver) {
    DEPTHS.forEach(function (th) {
      var m = d.createElement("div");
      m.setAttribute("data-qpux-d", String(th));
      m.style.cssText = "position:absolute;left:0;width:1px;height:1px;top:" + (th - 1) + "%;pointer-events:none";
      (d.body || d.documentElement).appendChild(m);
      new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting && !seen[th]) {
            seen[th] = 1;
            emit("scroll", { d: th, ms: 0 });
          }
        });
      }).observe(m);
    });
  }
  emit("ready", { v: 1 });
})(window, document);
