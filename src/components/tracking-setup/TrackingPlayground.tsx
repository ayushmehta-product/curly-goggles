'use client';

import { useEffect, useRef } from 'react';
import { PLAYGROUND_FAQ, PLAYGROUND_PRODUCTS } from '@/data/mock-tracking-setup';
import { startCapture, type TrackingEvent, type TrackingSource } from '@/lib/tracking/capture-engine';

interface TrackingPlaygroundProps {
  enabled: boolean;
  source: TrackingSource;
  injectedLabel: string;
  onEvent: (event: TrackingEvent) => void;
}

export function TrackingPlayground({ enabled, source, injectedLabel, onEvent }: TrackingPlaygroundProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  useEffect(() => {
    const root = rootRef.current;
    if (!enabled || !root) return;
    return startCapture({
      root,
      source,
      onEvent: (event) => onEventRef.current(event),
      url: 'https://shop.acme-demo.test/checkout',
    });
  }, [enabled, source]);

  return (
    <div className="flex min-h-[420px] flex-col overflow-hidden rounded-lg border border-[#D8D8D8] bg-white">
      <div className="flex items-center justify-between border-b border-[#EEF3FB] px-3 py-2">
        <div>
          <p className="text-sm font-medium text-ink">Demo site · Acme checkout</p>
          <p className="text-xs text-ink-muted">shop.acme-demo.test — scroll and click here</p>
        </div>
        <span
          className={`rounded px-2 py-0.5 text-xs font-medium ${
            enabled ? 'bg-[#DFF2BF] text-[#2D5A00]' : 'bg-[#EEEEEE] text-ink-muted'
          }`}
        >
          {enabled ? injectedLabel : 'Not instrumented'}
        </span>
      </div>
      <div ref={rootRef} className="relative min-h-0 flex-1 overflow-y-auto bg-[#FAFBFD] p-4">
        {!enabled && (
          <div className="mb-3 rounded border border-[#FEEFB3] bg-[#FFFBEB] px-3 py-2 text-xs text-[#7A5B00]">
            Capture is off. Finish the setup step on the left, then interact with this page.
          </div>
        )}
        <header className="mb-4 flex items-center justify-between">
          <p className="text-base font-semibold text-ink" data-testid="acme-logo">
            Acme
          </p>
          <button
            type="button"
            data-testid="header-cart"
            className="rounded bg-white px-2 py-1 text-xs text-ink shadow-sm"
          >
            Cart (0)
          </button>
        </header>
        <p className="mb-3 text-sm text-ink">Pick a research-day essential, then scroll for shipping notes.</p>
        <div className="grid gap-3">
          {PLAYGROUND_PRODUCTS.map((product) => (
            <article key={product.id} className="rounded-lg border border-[#D8D8D8] bg-white p-3" data-testid={product.id}>
              <div className="mb-2 flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-sm font-medium text-ink">{product.name}</h3>
                  <p className="text-xs text-ink-muted">{product.blurb}</p>
                </div>
                <p className="text-sm text-ink">{product.price}</p>
              </div>
              <button
                type="button"
                data-testid={`add-${product.id}`}
                className="rounded bg-[#1B87E6] px-3 py-1.5 text-xs text-white"
              >
                Add to cart
              </button>
            </article>
          ))}
        </div>
        <form className="mt-4 rounded-lg border border-[#D8D8D8] bg-white p-3" data-testid="newsletter">
          <label className="mb-1 block text-xs text-ink" htmlFor="qpux-demo-email">
            Email for shipping updates
          </label>
          <input
            id="qpux-demo-email"
            type="email"
            placeholder="you@company.com"
            className="mb-2 w-full rounded border border-[#D8D8D8] px-2 py-1.5 text-sm"
          />
          <p className="mb-2 text-xs text-ink-muted">Typed values are not captured.</p>
          <button type="button" data-testid="subscribe" className="rounded border border-[#D8D8D8] px-3 py-1.5 text-xs text-ink">
            Subscribe
          </button>
        </form>
        <section className="mt-6 space-y-4 pb-8">
          {PLAYGROUND_FAQ.map((item) => (
            <div key={item.q}>
              <h4 className="text-sm font-medium text-ink">{item.q}</h4>
              <p className="text-sm text-ink-muted">{item.a}</p>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
