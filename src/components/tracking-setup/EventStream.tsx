'use client';

import dynamic from 'next/dynamic';
import type { TrackingEvent } from '@/lib/tracking/capture-engine';

const WuButton = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuButton })),
  { ssr: false }
);

const TYPE_STYLES: Record<TrackingEvent['type'], string> = {
  ready: 'bg-[#EEF3FB] text-[#1B3380]',
  click: 'bg-[#DFF2BF] text-[#2D5A00]',
  scroll: 'bg-[#FEEFB3] text-[#7A5B00]',
};

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export function EventStream({
  events,
  onClear,
}: {
  events: TrackingEvent[];
  onClear: () => void;
}) {
  return (
    <div className="flex h-full min-h-[240px] flex-col rounded-lg border border-[#D8D8D8] bg-white">
      <div className="flex items-center justify-between border-b border-[#EEF3FB] px-3 py-2">
        <p className="text-sm font-medium text-ink">Event stream</p>
        <WuButton variant="secondary" onClick={onClear} disabled={events.length === 0}>
          Clear
        </WuButton>
      </div>
      {events.length === 0 ? (
        <p className="px-3 py-6 text-sm text-ink-muted">
          Waiting for the first event. Enable capture, then click or scroll the demo site.
        </p>
      ) : (
        <ol className="min-h-0 flex-1 space-y-2 overflow-auto p-3">
          {events.map((event) => (
            <li key={event.id} className="rounded border border-[#EEEEEE] px-2 py-2 text-xs text-ink">
              <div className="mb-1 flex items-center gap-1">
                <span className={`rounded px-1.5 py-0.5 font-medium ${TYPE_STYLES[event.type]}`}>{event.type}</span>
                <span className="text-ink-muted">{formatTime(event.ts)}</span>
                <span className="ml-auto text-ink-muted">{event.source}</span>
              </div>
              {event.type === 'click' && (
                <p>
                  <span className="text-ink-muted">selector </span>
                  <code className="break-all">{event.selector}</code>
                  {event.text ? <span className="text-ink-muted"> · {event.text}</span> : null}
                </p>
              )}
              {event.type === 'scroll' && <p>scroll depth {event.depth}%</p>}
              {event.type === 'ready' && <p>instrumentation live</p>}
              <p className="text-ink-muted">handler {event.handlerMs} ms</p>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
