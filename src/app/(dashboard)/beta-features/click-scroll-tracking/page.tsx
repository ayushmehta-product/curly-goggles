'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import type { IWuTabItem } from '@npm-questionpro/wick-ui-lib';
import { useWuShowToast } from '@npm-questionpro/wick-ui-lib';
import { PageHeader } from '@/components/ui/PageHeader';
import { WuTabPlaceholder } from '@/components/ui/WuTabPlaceholder';
import { EventStream } from '@/components/tracking-setup/EventStream';
import { TrackingPlayground } from '@/components/tracking-setup/TrackingPlayground';
import { VariantASnippet } from '@/components/tracking-setup/VariantASnippet';
import { VariantBEdge } from '@/components/tracking-setup/VariantBEdge';
import { VariantCExtension } from '@/components/tracking-setup/VariantCExtension';
import { MOCK_TRACKING_FUNNEL, TRACKING_VARIANTS, type TrackingVariantId } from '@/data/mock-tracking-setup';
import type { TrackingEvent, TrackingSource } from '@/lib/tracking/capture-engine';

const WuTab = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuTab })),
  { ssr: false }
);
const WuButton = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuButton })),
  { ssr: false }
);

const SOURCE_BY_VARIANT: Record<TrackingVariantId, TrackingSource> = {
  snippet: 'snippet',
  edge: 'edge',
  extension: 'extension',
};

const INJECT_LABEL: Record<TrackingSource, string> = {
  snippet: 'Snippet live',
  edge: 'Edge injected',
  extension: 'Extension live',
};

export default function ClickScrollTrackingSetupPage() {
  const { showToast } = useWuShowToast();
  const [variant, setVariant] = useState<TrackingVariantId>('extension');
  const [siteUrl, setSiteUrl] = useState('https://www.acme.com');
  const [enabledSource, setEnabledSource] = useState<TrackingSource | null>(null);
  const [events, setEvents] = useState<TrackingEvent[]>([]);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [firstEventAt, setFirstEventAt] = useState<number | null>(null);
  const startedAtRef = useRef<number | null>(null);
  const firstEventAtRef = useRef<number | null>(null);
  const [snippetGzipKb] = useState(1.26);

  const source = SOURCE_BY_VARIANT[variant];
  const enabled = enabledSource === source;

  const handleEvent = useCallback(
    (event: TrackingEvent) => {
      setEvents((prev) => [event, ...prev].slice(0, 80));
      if (event.type !== 'click' && event.type !== 'scroll') return;
      if (firstEventAtRef.current) return;
      firstEventAtRef.current = event.ts;
      setFirstEventAt(event.ts);
      const started = startedAtRef.current ?? Date.now();
      const seconds = Math.max(0, (event.ts - started) / 1000);
      showToast({
        variant: 'success',
        message: `First ${event.type} event captured in ${seconds.toFixed(1)}s. Tracking is live.`,
      });
    },
    [showToast]
  );

  const enable = useCallback((next: TrackingSource) => {
    const now = Date.now();
    startedAtRef.current = now;
    firstEventAtRef.current = null;
    setStartedAt(now);
    setEnabledSource(next);
    setEvents([]);
    setFirstEventAt(null);
    showToast({ variant: 'success', message: 'Instrumentation is on. Click or scroll the demo site.' });
  }, [showToast]);

  const disable = useCallback(() => {
    setEnabledSource(null);
    showToast({ variant: 'success', message: 'Capture stopped on the demo site.' });
  }, [showToast]);

  const firstEventSeconds =
    firstEventAt && startedAt ? Math.max(0, (firstEventAt - startedAt) / 1000) : null;
  const lastHandler = events[0]?.handlerMs;
  const funnel = MOCK_TRACKING_FUNNEL[variant];

  const tabItems: IWuTabItem[] = useMemo(
    () =>
      TRACKING_VARIANTS.map((item) => ({
        value: item.id,
        Trigger: item.label,
        Content:
          variant === item.id ? (
            <div className="pt-4">
              {item.id === 'snippet' && (
                <VariantASnippet
                  siteUrl={siteUrl}
                  onSiteUrlChange={setSiteUrl}
                  enabled={enabled}
                  onInstallDemo={() => enable('snippet')}
                  onDisable={disable}
                />
              )}
              {item.id === 'edge' && (
                <VariantBEdge
                  siteUrl={siteUrl}
                  onSiteUrlChange={setSiteUrl}
                  enabled={enabled}
                  onInject={() => enable('edge')}
                  onDisable={disable}
                />
              )}
              {item.id === 'extension' && (
                <VariantCExtension
                  enabled={enabled}
                  onEnable={() => enable('extension')}
                  onDisable={disable}
                  siteUrl={siteUrl}
                />
              )}
            </div>
          ) : (
            <WuTabPlaceholder label={item.label} />
          ),
      })),
    [disable, enable, enabled, siteUrl, variant]
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <PageHeader
        title="Click & scroll tracking setup"
        description="Beta: instrument click and scroll capture without filing an engineering ticket for every study. All three variants share this page."
        action={
          <WuButton
            variant="secondary"
            onClick={() => {
              setEvents([]);
              setEnabledSource(null);
              setFirstEventAt(null);
              setStartedAt(null);
              startedAtRef.current = null;
              firstEventAtRef.current = null;
              showToast({ variant: 'success', message: 'Demo reset.' });
            }}
          >
            Reset demo
          </WuButton>
        }
      />

      <div className="mb-4 grid gap-3 md:grid-cols-4">
        <StatusCard
          label="System status"
          value={enabled ? 'Tracking live' : 'Waiting'}
          tone={enabled ? 'ok' : 'idle'}
        />
        <StatusCard
          label="Time to first event"
          value={firstEventSeconds === null ? '—' : `${firstEventSeconds.toFixed(1)}s`}
        />
        <StatusCard
          label="Last handler"
          value={lastHandler === undefined ? '—' : `${lastHandler} ms`}
        />
        <StatusCard label="Snippet budget" value={`${snippetGzipKb.toFixed(1)} KB gzip`} />
      </div>

      <div className="grid items-start gap-4 xl:grid-cols-2">
        <div className="min-w-0">
          <WuTab items={tabItems} value={variant} onValueChange={(value) => setVariant(value as TrackingVariantId)} />
        </div>
        <div className="min-w-0 space-y-4 xl:sticky xl:top-4">
          <TrackingPlayground
            enabled={enabled}
            source={source}
            injectedLabel={INJECT_LABEL[source]}
            onEvent={handleEvent}
          />
          <EventStream events={events} onClear={() => setEvents([])} />
        </div>
      </div>

      <p className="mt-4 text-xs text-ink-muted">
        Setup-start to first-event proxy for this variant (mock): {funnel.firstEvent} of {funnel.started} (
        {Math.round(funnel.conversion * 100)}%). Extension is the self-serve trial path; snippet or edge is the
        permanent install.
      </p>
    </div>
  );
}

function StatusCard({
  label,
  value,
  tone = 'idle',
}: {
  label: string;
  value: string;
  tone?: 'ok' | 'idle';
}) {
  return (
    <div className="rounded-lg border border-[#D8D8D8] bg-white p-3">
      <p className="text-xs text-ink-muted">{label}</p>
      <p className={`text-sm font-medium ${tone === 'ok' ? 'text-[#2D5A00]' : 'text-ink'}`}>{value}</p>
    </div>
  );
}
