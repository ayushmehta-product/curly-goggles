export type TrackingVariantId = 'snippet' | 'edge' | 'extension';

export interface TrackingVariantMeta {
  id: TrackingVariantId;
  label: string;
  shortLabel: string;
  summary: string;
  timeToFirstEvent: string;
  approvalStillRequired: string;
  limitations: string[];
  setupActions: string[];
}

export const TRACKING_SITE_KEY = 'qpux_live_7f3a';

export const TRACKING_VARIANTS: TrackingVariantMeta[] = [
  {
    id: 'snippet',
    label: 'Universal snippet',
    shortLabel: 'Snippet',
    summary:
      'One-time script tag or existing tag-manager recipe. Auto-instruments every click and scroll-depth threshold. Rules stay in QuestionPro UX, so the snippet never needs another PR.',
    timeToFirstEvent: 'Under 1 minute on the demo site; minutes to hours on a live site if GTM is already approved.',
    approvalStillRequired:
      'Direct install needs one HTML/GTM publish. If GTM is already live, this is a container publish only — no application PR.',
    limitations: [
      'First install still needs whoever owns the container or <head>.',
      'Ad blockers can drop googletagmanager.com-hosted tags.',
      'CSP must allow the script origin unless you serve it first-party.',
    ],
    setupActions: [
      'Enter the site you want to instrument',
      'Choose direct snippet or Google Tag Manager recipe',
      'Install on the demo site (or copy the tag)',
      'Click or scroll the demo to capture the first event',
    ],
  },
  {
    id: 'edge',
    label: 'Edge injection',
    shortLabel: 'Edge',
    summary:
      'Point a hostname or route through a QuestionPro UX HTMLRewriter. The tracking script is injected on the response — zero application source change.',
    timeToFirstEvent: 'Under 1 minute for the simulated injection; DNS/CDN change is the live-site gate.',
    approvalStillRequired:
      'DNS or CDN route change (CNAME / worker route). Usually a different, faster queue than an application PR.',
    limitations: [
      'Cannot rewrite HTML the CDN never sees (some locked enterprise origins).',
      'SPA shells still need the injected script to run in the browser.',
      'IT still reviews the CNAME target even though no repo changes.',
    ],
    setupActions: [
      'Enter the origin hostname',
      'Copy the CNAME / worker route',
      'Simulate edge injection on the demo site',
      'Click or scroll the demo to capture the first event',
    ],
  },
  {
    id: 'extension',
    label: 'Browser extension',
    shortLabel: 'Extension',
    summary:
      'A Chrome extension (or bookmarklet) turns on click and scroll capture on a live page with no eng ticket. Use it to prove value, then export the snippet or edge config for a permanent install.',
    timeToFirstEvent: 'Seconds — enable capture, then click the demo.',
    approvalStillRequired: 'None for the trial. Permanent coverage still needs snippet or edge later.',
    limitations: [
      'Only captures on machines where the extension is installed.',
      'Not a production panel or unmoderated-study collector.',
      'Enterprise browsers may block unpacked extensions; the bookmarklet is the fallback.',
    ],
    setupActions: [
      'Enable the extension on the demo site',
      'Click or scroll to capture the first event',
      'Export the snippet or edge config for a permanent install',
    ],
  },
];

export const MOCK_TRACKING_FUNNEL = {
  snippet: { started: 40, firstEvent: 18, conversion: 0.45 },
  edge: { started: 22, firstEvent: 9, conversion: 0.41 },
  extension: { started: 36, firstEvent: 31, conversion: 0.86 },
};

export const PLAYGROUND_PRODUCTS = [
  {
    id: 'prod-tote',
    name: 'Canvas weekender',
    price: '$128',
    blurb: 'One-bag travel with a laptop sleeve and a spare-shoes pocket.',
  },
  {
    id: 'prod-bottle',
    name: 'Insulated bottle',
    price: '$36',
    blurb: 'Keeps water cold through a full research session.',
  },
  {
    id: 'prod-stand',
    name: 'Laptop riser',
    price: '$54',
    blurb: 'Angles the camera for moderated interviews without a stack of books.',
  },
];

export const PLAYGROUND_FAQ = [
  {
    q: 'When will this ship?',
    a: 'This beta captures click and scroll events in the browser. The collector in this prototype stores them locally so you can watch the stream without a backend.',
  },
  {
    q: 'Do you store what I type?',
    a: 'No. Inputs, textareas, and selects are skipped. Button labels are truncated. Email-looking strings are not copied from the DOM.',
  },
  {
    q: 'Why are there four scroll events?',
    a: 'Depth is reported at 25%, 50%, 75%, and 100% using IntersectionObserver sentinels, with a passive scroll fallback.',
  },
  {
    q: 'Can I use this on a real customer site today?',
    a: 'The extension and bookmarklet can run on a page you control for QA. Permanent coverage uses the snippet or the edge worker once security signs off.',
  },
];
