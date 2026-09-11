export type TrackingSource = 'snippet' | 'edge' | 'extension';
export type TrackingEventType = 'ready' | 'click' | 'scroll';

export interface TrackingEvent {
  id: string;
  type: TrackingEventType;
  ts: number;
  url: string;
  selector?: string;
  text?: string;
  x?: number;
  y?: number;
  depth?: number;
  handlerMs: number;
  source: TrackingSource;
}

export const SCROLL_THRESHOLDS = [25, 50, 75, 100] as const;

const PII_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT']);

function cssEscape(value: string): string {
  if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') {
    return CSS.escape(value);
  }
  return value.replace(/[^a-zA-Z0-9_-]/g, '\\$&');
}

export function inferSelector(el: Element, stopAt: Element | null): string {
  if (el.id) return `#${cssEscape(el.id)}`;
  const testId = el.getAttribute('data-testid') || el.getAttribute('data-track');
  if (testId) return `[data-testid="${cssEscape(testId)}"]`;

  const parts: string[] = [];
  let node: Element | null = el;
  let depth = 0;
  while (node && node !== stopAt && node !== document.body && depth < 5) {
    if (node.id) {
      parts.unshift(`#${cssEscape(node.id)}`);
      break;
    }
    const tagged = node.getAttribute('data-testid') || node.getAttribute('data-track');
    if (tagged) {
      parts.unshift(`[data-testid="${cssEscape(tagged)}"]`);
      break;
    }
    const tag = node.tagName.toLowerCase();
    const className = typeof node.className === 'string' ? node.className.trim() : '';
    const cls = className
      ? '.' + className.split(/\s+/).slice(0, 2).map(cssEscape).join('.')
      : '';
    parts.unshift(`${tag}${cls}`);
    node = node.parentElement;
    depth += 1;
  }
  return parts.join('>') || 'body';
}

function safeText(el: Element): string | undefined {
  if (PII_TAGS.has(el.tagName)) return undefined;
  const raw = (el.textContent || '').replace(/\s+/g, ' ').trim();
  if (!raw) return undefined;
  return raw.slice(0, 80);
}

function nextId(): string {
  return `evt-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export interface CaptureOptions {
  root: HTMLElement;
  source: TrackingSource;
  onEvent: (event: TrackingEvent) => void;
  url?: string;
}

/**
 * Real click + scroll capture. Attaches to a root (playground or document).
 * Click uses capture-phase delegation. Scroll depth uses IntersectionObserver
 * sentinels with a passive scroll fallback.
 */
export function startCapture(options: CaptureOptions): () => void {
  const { root, source, onEvent } = options;
  const url = options.url ?? (typeof window !== 'undefined' ? window.location.href : '');
  const seen = new Set<number>();
  const sentinels: HTMLElement[] = [];
  let io: IntersectionObserver | null = null;

  const emit = (partial: Omit<TrackingEvent, 'id' | 'ts' | 'url' | 'source'>) => {
    onEvent({
      id: nextId(),
      ts: Date.now(),
      url,
      source,
      ...partial,
    });
  };

  const clickHandler = (event: Event) => {
    const t0 = performance.now();
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (target.closest('[data-qpux-ignore]')) return;
    emit({
      type: 'click',
      selector: inferSelector(target, root),
      text: safeText(target),
      x: event instanceof MouseEvent ? event.clientX : undefined,
      y: event instanceof MouseEvent ? event.clientY : undefined,
      handlerMs: Math.round((performance.now() - t0) * 100) / 100,
    });
  };

  const reportDepth = (depth: number) => {
    if (seen.has(depth)) return;
    seen.add(depth);
    const t0 = performance.now();
    emit({
      type: 'scroll',
      depth,
      handlerMs: Math.round((performance.now() - t0) * 100) / 100,
    });
  };

  const placeSentinels = () => {
    sentinels.forEach((node) => node.remove());
    sentinels.length = 0;
    const height = Math.max(root.scrollHeight, 1);
    SCROLL_THRESHOLDS.forEach((depth) => {
      const mark = document.createElement('div');
      mark.setAttribute('data-qpux-depth', String(depth));
      mark.setAttribute('aria-hidden', 'true');
      mark.style.cssText = `position:absolute;left:0;width:1px;height:1px;pointer-events:none;top:${Math.max(0, (height * depth) / 100 - 2)}px;`;
      root.appendChild(mark);
      sentinels.push(mark);
      io?.observe(mark);
    });
  };

  io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const depth = Number(entry.target.getAttribute('data-qpux-depth'));
        if (Number.isFinite(depth)) reportDepth(depth);
      }
    },
    { root, threshold: 0 }
  );

  const onScroll = () => {
    const max = Math.max(root.scrollHeight - root.clientHeight, 1);
    const pct = Math.min(100, Math.round((root.scrollTop / max) * 100));
    for (const threshold of SCROLL_THRESHOLDS) {
      if (pct >= threshold) reportDepth(threshold);
    }
  };

  const previousPosition = root.style.position;
  if (getComputedStyle(root).position === 'static') {
    root.style.position = 'relative';
  }

  root.addEventListener('click', clickHandler, true);
  root.addEventListener('scroll', onScroll, { passive: true });
  placeSentinels();
  const ro = new ResizeObserver(placeSentinels);
  ro.observe(root);

  emit({ type: 'ready', handlerMs: 0 });

  return () => {
    root.removeEventListener('click', clickHandler, true);
    root.removeEventListener('scroll', onScroll);
    io?.disconnect();
    ro.disconnect();
    sentinels.forEach((node) => node.remove());
    if (!previousPosition) root.style.position = '';
    else root.style.position = previousPosition;
  };
}
