# Agent T — Theoretical solution space (first principles)

Ignore vendors. A click is a DOM event. Scroll depth is a viewport ∩ document-height ratio (or an intersection with a sentinel). Observation can happen anywhere the request/render pipeline still has a handle on user input or on HTML.

## Pipeline map

```
User input
  ├─ OS / a11y APIs (UIA, AX)
  ├─ Browser chrome (extension isolated world / MAIN world)
  ├─ Page JS (bubble/capture, wrappers, observers)
  ├─ Service worker (fetch, not DOM)
  ├─ HTTP response (HTML/JS injection at edge or MITM)
  ├─ DNS / CDN config (where that injection is attached)
  └─ Server logs (status, timing, bytes — not clicks)
```

## Option tree

Each node: **complexity 1–5** (5 = hardest), **security blast radius**, **fidelity** (actual click/scroll vs approximate), **zero-code purity** (nothing in the customer’s application repo), **beta-now vs research**.

### A. Page DOM

| Node | CS mechanism | Cx | Blast radius | Fidelity | Zero-code | Beta? |
| --- | --- | --- | --- | --- | --- | --- |
| A1 Event delegation on `document` in capture phase | Bubbling/capture; one listener | 1 | Script origin + data exfil | Actual clicks | No (needs script) | **Now** |
| A2 `IntersectionObserver` sentinels at 25/50/75/100 | Observer + layout | 2 | Same | Actual scroll depth | No | **Now** |
| A3 `MutationObserver` for SPA DOM churn | Tree diff of mutations | 3 | Higher CPU; more PII in nodes | Clicks on late DOM: yes | No | Now if needed |
| A4 Wrap `addEventListener` / `onclick` via `Proxy` | Reflection | 4 | Breaks pages; fingerprinting | Misses delegated host handlers if wrapped late | No | Research |
| A5 CSS selector inference (id → testid → class path) | Simple heuristic, not ML | 2 | Selector may encode copy | Good enough for heatmaps | No | **Now** |
| A6 ML element classification (button vs chrome) | Embeddings on subtree | 5 | Model download, privacy | Variable FP/FN | No | Research |
| A7 WASM sandbox for the tracker | Isolate from host JS | 4 | WASM CSP `script-src` | Same as A1 if DOM still exposed | No | Post-beta |
| A8 CRDT/diff of DOM snapshots | Operational transform | 5 | Full DOM = PII magnet | Clicks inferred from diffs — FN-prone | No | Research (that's replay) |

### B. Browser-privileged

| Node | CS mechanism | Cx | Blast radius | Fidelity | Zero-code | Beta? |
| --- | --- | --- | --- | --- | --- | --- |
| B1 MV3 content script (`activeTab`) | Isolated world DOM access | 2 | Host permission prompt | Actual | **Yes** (no app repo) | **Now** |
| B2 MAIN-world inject at `document_start` | Same heap as page | 3 | Can monkey-patch anything | Highest | Yes | Now for QA |
| B3 Bookmarklet IIFE | `javascript:` URL | 1 | Inline script / CSP | Actual where allowed | Yes | **Now** |
| B4 Extension `webRequest` | Network, not DOM | 3 | Broad host perms | Clicks: no | Yes | Not for this job |
| B5 DevTools Protocol / remote debug | Out-of-process | 5 | Full browser control | Actual | Yes | Research |

### C. Network / edge

| Node | CS mechanism | Cx | Blast radius | Fidelity | Zero-code | Beta? |
| --- | --- | --- | --- | --- | --- | --- |
| C1 HTMLRewriter on HTML responses | Streaming parse, append `<script>` | 3 | All HTML through the proxy | Actual once script runs | **Config-only** | **Now** (simulate + ship worker stub) |
| C2 Inject into JS bundles | AST rewrite | 5 | Breaks integrity hashes | Actual | Config-only | Research |
| C3 MITM TLS proxy | Terminate TLS | 5 | Trust-anchor / legal | Actual | Config-only | Out of bounds |
| C4 DNS CNAME to first-party tracker host | DNS + TLS cert | 2 | Subdomain takeover if dangling | N/A (delivery) | Config-only | **Now** (docs + records) |

### D. No client script

| Node | CS mechanism | Cx | Blast radius | Fidelity | Zero-code | Beta? |
| --- | --- | --- | --- | --- | --- | --- |
| D1 Server-log scroll heuristic | Byte ranges, dwell, pagination | 3 | Log retention | **Approximate scroll, no clicks** | Yes | Research-only — mark, do not ship |
| D2 Click IDs in access logs | Instrumented links only | 2 | Query strings | Only `<a>` with params | Needs link changes | No |
| D3 OS a11y tree listen | UIA events | 5 | Entire desktop | Actual on that OS | Yes | Research, consent nightmare |

## False-positive / false-negative notes

- Capture-phase delegation (A1) has near-zero FN for real pointer clicks; synthetic `element.click()` is captured too (FP if tests fire).
- Shadow DOM and `<canvas>` are FN without extra walkers (Hotjar documents this).
- Scroll without JS (D1) cannot distinguish “read to 75%” from a prefetch of a long HTML file.
- Selector inference FP: CSS modules hash classes; prefer `id` / `data-testid` / `data-track`.

## Zero-code purity ranking

1. B1/B3 extension + bookmarklet — literally nothing in the product repo.
2. C1+C4 edge + CNAME — nothing in the app repo; DNS/CDN config only.
3. GTM/CDP config — nothing in the app repo **after** the stub/CDP exists.
4. A1+A2 snippet — one script tag, never again.

## Handoff shortlist for Agent B (buildable this beta)

1. **A1 + A2 + A5** packaged as a config-driven snippet (and a GTM Custom HTML recipe).
2. **C1 + C4** first-party edge injection, with an in-product HTML before/after preview.
3. **B1 + B3** extension + bookmarklet that proves capture immediately, then exports (1) or (2) for permanence.

Leave D1, A6, A8, C3, D3 on the research shelf. They are elegant and wrong for a testable beta.
