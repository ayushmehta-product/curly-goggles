# Agent J — Stop-logic memo (end of loop)

**Round cap:** 4. **Rounds run:** 2. **Stop reason:** Variant C cleared every threshold in round 1. Round 2 was a layout-only Builder fix (demo playground moved beside setup so first events are visible without scrolling). Scores did not change. Loop stops.

Threshold sources:

- Time-to-value: self-serve B2B SaaS first-value in **under 5 minutes** ([Pixxen 2026 onboarding guide](https://pixxen.com/blog/time-to-value-saas-onboarding/), [Cadence: 2–5 minutes self-serve](https://cadence.withremote.ai/blog/b2b-saas-customer-onboarding)).
- Setup actions: ceiling of **5** from start to first captured click/scroll.
- Nielsen: visibility of system status; error prevention.
- Script budget: **~10 KB gzipped** so third-party JS does not move LCP/INP ([Valerie widget performance](https://talktovalerie.com/guides/widget-performance); INP ≤ 200 ms, [Lucky Orange CWV](https://www.luckyorange.com/blog/posts/core-web-vitals)).
- Main-thread: low-single-digit ms per interaction (RUM vendors batch and keep handlers short; Datadog RUM documents batching rather than per-click network).
- Security: fewer new CSP origins; **zero new required origins** is the top score.
- Product: setup-start → first-event conversion; fully self-serve (no SE call).

## Round 1 scoreboard

Scale: 1–5 (5 = clears the bar with margin). **Pass** if score ≥ 4 on that lens.

| Threshold | A Snippet | B Edge | C Extension |
| --- | --- | --- | --- |
| TTV first click/scroll ≤ 5 min (demo) | 5 pass | 5 pass | **5 pass** |
| Setup actions ≤ 5 | 4 pass (4 actions) | 4 pass (4) | **5 pass (2)** |
| Visibility of system status | 4 pass | 4 pass | **5 pass** |
| Error prevention (PII, off-state warning) | 4 pass | 4 pass | **4 pass** |
| Snippet ≤ 10 KB gzip (`qp-ux-track.js` = **1.26 KB**) | 5 pass | 5 pass | **5 pass** |
| Handler cost low-single-digit ms | 5 pass | 5 pass | **5 pass** |
| Zero new third-party origins | 2 fail (`track.questionpro.com`) | 4 pass (first-party CNAME) | **5 pass** |
| Self-serve (no SE/IT call) | 3 fail for first live install | 2 fail (DNS/IT) | **5 pass** |
| Funnel proxy (mock first-event / start) | 3 (45%) | 3 (41%) | **5 (86%)** |
| **Clears every threshold?** | No | No | **Yes** |

### Directed gaps (not acted on — loop stopped)

- **A:** Serve the snippet first-party (same CNAME as B) so CSP adds zero third-party hosts. Keep GTM as a recipe, not the default origin.
- **B:** Pair with C so a requester sees events before filing the DNS ticket; add a “check CNAME” probe so IT is not a scheduled call.

## Recommendation

**Ship Variant C as the beta default. Generate Variant A (GTM/direct) and Variant B (edge CNAME) from the same screen as the permanent install.**

C is the only path that turns “I need eng/security” into “I clicked twice and saw a click event.” That is the job to be done for this beta. A and B remain on the same page because unmoderated production traffic cannot run on a PM’s laptop.

## Unmet after beta (do not block this beta)

1. Real Cloudflare/Fastly worker in a QuestionPro-managed account (B is simulated injection + copy-paste stub).
2. Chrome Web Store listing (unpacked pack is in `public/extensions/qp-ux-click-scroll`).
3. First-party snippet hosting so A inherits C’s origin score.
4. Live funnel analytics replacing `MOCK_TRACKING_FUNNEL`.
5. Shadow DOM / canvas click FN (documented, not in this beta).

## Why this cuts setup time (paste into a launch doc)

Today, click and scroll tracking waits on an application PR plus a CSP review — days to weeks. The QuestionPro UX beta puts a **browser extension / bookmarklet** on the requester’s own tab so the first click and scroll-depth events appear in seconds, with no new script origin and no ticket. When the team is ready for always-on capture, the same screen exports a **one-time snippet or GTM recipe** and a **DNS-only edge injection**, so engineering is asked once, for a stable tag, instead of once per study.
