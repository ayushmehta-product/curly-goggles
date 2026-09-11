# Agent R — Technical landscape: tracking without a code PR

QuestionPro UX needs click and scroll capture on a customer site without a days-to-weeks engineering/security ticket for every study. Maze is cited only as a competitor benchmark, not as the product we are shipping.

## How the market actually does this

### 1. Tag manager pattern (Google Tag Manager, Adobe Launch)

**Mechanism.** A stub container snippet is installed once. Every later tag, trigger, and variable is published remotely. Google documents CSP deployment with a per-response nonce on `script-src-elem`, plus allowlists for `https://www.googletagmanager.com` if a nonce is not used ([Tag Manager CSP](https://developers.google.com/tag-platform/security/guides/csp)). Server-side GTM can move vendor beacons to a first-party origin, shrinking the browser allowlist ([server-side send data](https://developers.google.com/tag-platform/tag-manager/server-side/send-data)).

**Why it cuts re-approval.** Security reviews the container once. Product can add a QuestionPro UX Custom HTML tag and publish the container without an application PR. Combined with remote config (for example Firebase Remote Config parameters consumed by GTM), even copy and selectors can change without a GTM republish.

**Friction that remains.** First stub still needs whoever owns `<head>`. Custom JS variables need `unsafe-eval`. Ad blockers commonly strip `googletagmanager.com`. Maze’s own docs warn that GTM-hosted snippets fail for testers with ad blockers ([Maze snippet install](https://help.maze.co/articles/1170376655-installing-the-maze-snippet-on-your-website)).

### 2. CDP piggyback (Segment, RudderStack, mParticle)

**Mechanism.** If Analytics.js (or equivalent) is already on the page, QuestionPro UX registers as a **destination**. Segment device-mode destinations load the partner SDK from the existing snippet; no second pixel ([Segment Facebook Pixel destination](https://segment-docs.netlify.app/docs/connections/destinations/catalog/facebook-pixel), [LinkedIn Insight Tag](https://segment-docs.netlify.app/docs/connections/destinations/catalog/linkedin-insight-tag)). Cloud-mode destinations consume the event stream server-side with zero extra browser script.

**Why it helps.** The customer already paid the CSP and privacy cost of the CDP. Enabling a catalog destination is a workspace setting, not a deploy.

**Friction.** Requires the CDP to already exist. Device-mode still injects a partner origin unless the destination is cloud-mode. Duplicate pixels if the native snippet is not removed.

### 3. Reverse proxy / edge injection (Cloudflare Workers, Fastly Compute, hosted CNAME)

**Mechanism.** A Worker sits on a proxied hostname, fetches origin HTML, and uses `HTMLRewriter` to append a script in `<head>` ([Cloudflare HTMLRewriter](https://developers.cloudflare.com/workers/runtime-apis/html-rewriter/), [inject analytics with Workers](https://dev.to/irrelevantspace/one-worker-to-track-them-all-injecting-analytics-scripts-into-multiple-websites-with-cloudflare-workers-1j5b)). Approval path is DNS/CDN (CNAME or route), not an application repo.

**Why it helps.** Zero source-repo change. Script can be served first-party via `ux-edge.customer.com` CNAME, which is the argument security teams want.

**Friction.** The CDN must see HTML. Locked enterprise origins, signed cookies, and some SPA shells still need the injected JS to run. IT reviews the CNAME target.

### 4. Browser extension / bookmarklet (setup and QA)

**Mechanism.** Manifest V3 `chrome.scripting.executeScript` with `activeTab` injects a content script. `world: "MAIN"` at `document_start` can observe the same DOM as the page ([Chrome content scripts](https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts)). Extensions can proxy collector requests around page CSP (see Grafana Faro companion-style injectors). Bookmarklets run an IIFE in page context where CSP allows `javascript:` / inline.

**Why it helps.** A PM or designer validates click/scroll on the live site in seconds. No eng, no DNS.

**Friction.** Per-machine, not a production panel. Enterprises may block unpacked extensions. Bookmarklets fail under strict CSP. Not a substitute for unmoderated study collection.

### 5. Service worker interception

**Mechanism.** A scoped service worker can observe `fetch` and, if allowed to control the page, import a module that binds DOM listeners. Server-side GTM even uses `frame-src` + a worker for some transports.

**Why it is weak for this job.** Installing a SW still requires a first-party script or header. SWs cannot magically attach to a page they do not control. They are excellent for beacon reliability, poor as the *first* install vector.

### 6. RUM / session-replay auto-instrumentation (Datadog RUM, Sentry, FullStory, Hotjar)

**Mechanism.** One snippet; the SDK wraps history APIs, delegates clicks, and uses MutationObserver / IntersectionObserver. Hotjar loads from `static.hotjar.com` and auto-detects SPA `pushState` ([Hotjar implementation](https://opsblu.com/documentation/analytics-platforms/hotjar/)). Sentry Session Replay is ~50 KB gzipped and needs `worker-src 'self' blob:` ([Sentry replay troubleshooting](https://docs.sentry.io/platforms/javascript/session-replay/troubleshooting/)). Datadog RUM batches every 30s / 50 events / 16 KB and documents CSP allowlists for CDN + intake ([Datadog browser troubleshooting](https://docs.datadoghq.com/real_user_monitoring/application_monitoring/browser/troubleshooting/)).

**Approval friction in practice.** Security asks: origins, cookies, PII, session replay of authenticated apps, and Core Web Vitals. “One snippet, auto-instrument everything” still waits on the same first-snippet ticket unless GTM/CDP/edge is already present.

### 7. Maze benchmark (inspiration only)

Maze offers **snippet** (heatmaps, expected paths, quantitative data) and **snippet-less** (URL paste + recordings, no heatmaps) ([Website tests](https://help.maze.co/articles/2471284614-website-test-run-usability-tests-on-your-live-websites)). Install is a unique team snippet in `<head>` on every participant page, then Verify ([Install snippet](https://help.maze.co/articles/1170376655-installing-the-maze-snippet-on-your-website)). Remaining friction: eng access to every domain, CSP allowlists, GTM/ad-blocker failures, SPA URL changes, and heatmap coverage that is click-centric rather than scroll ([results](https://help.maze.co/articles/4467546573-understanding-your-live-website-test-results)). QuestionPro UX should beat Maze on **time-to-first-event for a requester who cannot ship HTML**, which Maze’s snippet-less mode only partially does (no click/scroll quantitative data).

## CSP and security questions every reviewer will ask

| Question | What they want |
| --- | --- |
| Allowed origins | Exact `script-src` / `connect-src` hosts, preferably first-party |
| SRI / nonce | Subresource integrity or CSP nonce, not `unsafe-inline` forever |
| Data collected | Selectors, scroll depth, no input values, no email/password |
| PII scrubbing | Default-on redaction, documented retention |
| Cookies | First-party only, no cross-site tracker |
| Replay | Off in v1 — click/scroll events only, which shrinks the review |

That last row is a product choice: shipping events without session replay is the fastest security path.

## Comparison table

| Mechanism | Code change required? | Install point | Approval path bypassed | Perf overhead | Security review surface | Time-to-first-event |
| --- | --- | --- | --- | --- | --- | --- |
| Tag manager (GTM / Launch) | Config-only after stub | Existing container | Application PR (not first stub) | Low if tag is async ~1–3 KB; GTM itself is heavier | GTM origins + custom HTML + maybe `unsafe-eval` | Minutes if container exists; days if not |
| CDP destination (Segment et al.) | N if CDP live (cloud-mode); config-only | Workspace destination | App PR and often CSP (cloud-mode) | Near-zero extra JS in cloud-mode | Destination ToS, data sharing, existing CDP cookies | Minutes in catalog; weeks if no CDP |
| Edge / reverse proxy | Config-only (DNS/CDN) | CNAME or worker route | Application PR | HTMLRewriter is streaming; script same as snippet | CNAME target, injected origin, HTML mutation | Hours–days for DNS; seconds once routed |
| Browser extension | N for QA | Browser profile | Eng, DNS, and CSP for trial | Content-script only on opted-in tabs | Extension store / admin policy, host permissions | Seconds |
| Bookmarklet | N | Bookmarks bar | Eng and DNS; not CSP | Tiny IIFE | Inline script / `javascript:` URLs | Seconds where CSP allows |
| Service worker | Y or header | SW scope | Rarely — still needs install | Beacon batching can help | `worker-src`, scope, cache | Same as snippet |
| RUM SDK one-liner | Y (one snippet) | `<head>` or npm | Repeat PRs after first install | Datadog-class batching; Sentry replay ~50 KB gz | Vendor CDN + intake + cookies + PII | Hours–weeks for first snippet |
| Maze snippet (benchmark) | Y | `<head>` every page | None on first domain | Comparable to other UX snippets | Maze origins, PII in heatmaps | After Verify; blocked without eng |
| Maze snippet-less (benchmark) | N | URL paste | Eng entirely | Recording-only | Less quantitative data | Minutes, but **no** click heatmap / scroll metrics |

## Handoff to Agent T / Builder

Buildable now inside this frontend prototype:

1. **Universal auto-tracking snippet** with GTM recipe (Variant A) — matches how Hotjar/Datadog/Maze get permanent coverage.
2. **Edge HTMLRewriter + first-party CNAME** (Variant B) — matches Cloudflare injection, zero app-repo change.
3. **Extension + bookmarklet trial** (Variant C) — matches the only path with true seconds-to-first-event and zero new page origins.

Do not beta-build: OS accessibility APIs, MITM proxies, or pure server-log scroll inference (see Agent T).
