# Agent B — Three shipped variants

All three live under **Beta features → Click & scroll tracking setup** (`/beta-features/click-scroll-tracking`). One sidebar item; variants are tabs.

Shared capture engine: `src/lib/tracking/capture-engine.ts`  
Compact snippet: `public/qp-ux-track.js`  
Extension pack: `public/extensions/qp-ux-click-scroll/`  
Mock collector: `POST /qpux/collect` → 204

Capture is real: capture-phase click delegation, IntersectionObserver scroll sentinels, passive scroll fallback, selector inference, no input values.

## Variant A — Universal snippet

**Click path**

1. Open Click & scroll tracking setup.
2. Tab: Universal snippet.
3. Keep GTM recipe (default) or switch to Direct snippet.
4. Click **Install on demo site**.
5. Click **Add to cart** or scroll the Acme demo.

**Time-to-first-captured-event (demo):** seconds after step 4.  
**Still needs approval live:** one GTM publish or one `<head>` change.  
**Limitations:** new `script-src` origin unless GTM/first-party already allowed; ad blockers on GTM.

## Variant B — Edge injection

**Click path**

1. Same page, Edge injection tab.
2. Confirm origin hostname.
3. Copy CNAME / worker stub (optional for the demo).
4. Click **Simulate edge injection**.
5. Click or scroll the demo.

The before/after HTML panel is the HTMLRewriter preview. Worker stub is copy-pasteable for Cloudflare.

**Time-to-first-event (demo):** seconds after step 4.  
**Still needs approval live:** DNS/CDN route.  
**Limitations:** origin must be on a CDN QuestionPro UX can rewrite; IT still reviews the CNAME.

## Variant C — Extension + bookmarklet

**Click path**

1. Same page (this tab is the default).
2. Click **Enable capture on this tab**.
3. Click or scroll the demo.

Export panels then produce the Variant A snippet and Variant B DNS records.

Unpacked Chrome extension: load `public/extensions/qp-ux-click-scroll` in `chrome://extensions`.

**Time-to-first-event (demo):** seconds (2 user actions).  
**Still needs approval:** none for the trial.  
**Limitations:** per-machine; not unmoderated production traffic.

## Files

| Path | Role |
| --- | --- |
| `src/components/SideNav.tsx` | Beta features group |
| `src/app/(dashboard)/beta-features/click-scroll-tracking/page.tsx` | Variant switcher + status |
| `src/components/tracking-setup/*` | Setup + playground + stream |
| `src/data/mock-tracking-setup.ts` | Copy, funnel proxies, demo catalog |
