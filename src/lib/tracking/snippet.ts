export const SNIPPET_SRC = 'https://track.questionpro.com/ux.js';
export const FIRST_PARTY_EDGE_HOST = 'ux-edge.example.com';
export const QP_EDGE_TARGET = 'edge.questionpro.com';

export function buildSnippetTag(siteKey: string, src = SNIPPET_SRC): string {
  return [
    '<script',
    `  src="${src}"`,
    `  data-qpux-key="${siteKey}"`,
    '  data-qpux-events="click,scroll"',
    '  async',
    '></script>',
  ].join('\n');
}

export function buildGtmCustomHtml(siteKey: string): string {
  return `<!-- QuestionPro UX click & scroll — paste as a GTM Custom HTML tag, All Pages -->
${buildSnippetTag(siteKey)}`;
}

export function buildEdgeWorkerStub(siteKey: string): string {
  return `export default {
  async fetch(request, env) {
    const response = await fetch(request);
    const type = response.headers.get("content-type") || "";
    if (!type.includes("text/html")) return response;
    const tag = ${JSON.stringify(buildSnippetTag(siteKey, `https://${FIRST_PARTY_EDGE_HOST}/ux.js`))};
    return new HTMLRewriter()
      .on("head", { element(el) { el.append(tag, { html: true }); } })
      .transform(response);
  }
};`;
}

export function buildCnameRecords(customerHost: string): string {
  const host = customerHost.replace(/^https?:\/\//, '').replace(/\/.*$/, '') || 'www.acme.com';
  return `${FIRST_PARTY_EDGE_HOST.replace('example.com', host.split('.').slice(-2).join('.'))}  CNAME  ${QP_EDGE_TARGET}
; or route ${host}/* through the QuestionPro UX HTMLRewriter worker`;
}

export function buildBookmarklet(siteKey: string): string {
  const body = `(function(){if(window.__QPUX_BM)return;window.__QPUX_BM=1;document.dispatchEvent(new CustomEvent('qpux:bookmarklet',{detail:{key:${JSON.stringify(siteKey)}}}));alert('QuestionPro UX capture is on. Click and scroll to send events.');})();`;
  return `javascript:${encodeURIComponent(body)}`;
}

/** Compact production snippet shipped at /qp-ux-track.js — keep under ~10KB gzipped. */
export const COMPACT_TRACKER_SOURCE = `"use strict";
(function (w, d) {
  var KEY = (d.currentScript && d.currentScript.getAttribute("data-qpux-key")) || "demo";
  var DEPTHS = [25, 50, 75, 100];
  var seen = {};
  function esc(s) {
    return (w.CSS && CSS.escape) ? CSS.escape(s) : s.replace(/[^a-zA-Z0-9_-]/g, "\\\\$&");
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
      var c = typeof n.className === "string" ? n.className.trim().split(/\\s+/).slice(0, 2).join(".") : "";
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
`;
