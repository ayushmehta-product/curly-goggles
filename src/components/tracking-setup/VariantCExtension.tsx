'use client';

import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import { TRACKING_SITE_KEY, TRACKING_VARIANTS } from '@/data/mock-tracking-setup';
import { buildBookmarklet, buildSnippetTag, buildCnameRecords } from '@/lib/tracking/snippet';
import { SnippetBlock } from '@/components/tracking-setup/SnippetBlock';

const WuButton = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuButton })),
  { ssr: false }
);

interface VariantCExtensionProps {
  enabled: boolean;
  onEnable: () => void;
  onDisable: () => void;
  siteUrl: string;
}

export function VariantCExtension({ enabled, onEnable, onDisable, siteUrl }: VariantCExtensionProps) {
  const meta = TRACKING_VARIANTS[2];
  const bookmarklet = useMemo(() => buildBookmarklet(TRACKING_SITE_KEY), []);

  return (
    <div className="space-y-4">
      <p className="text-sm text-ink">{meta.summary}</p>
      <ol className="space-y-1 text-sm text-ink">
        {meta.setupActions.map((step, index) => (
          <li key={step}>
            {index + 1}. {step}
          </li>
        ))}
      </ol>
      <div className="rounded-lg border border-[#D8D8D8] bg-white p-3">
        <p className="mb-2 text-sm font-medium text-ink">Extension popup</p>
        <p className="mb-3 text-xs text-ink-muted">
          This in-product popup mirrors the unpacked Chrome extension in{' '}
          <code>/extensions/qp-ux-click-scroll</code>. Enable it on the demo tab — no engineering ticket.
        </p>
        {enabled ? (
          <WuButton variant="secondary" onClick={onDisable}>
            Stop capture on this tab
          </WuButton>
        ) : (
          <WuButton onClick={onEnable}>Enable capture on this tab</WuButton>
        )}
      </div>
      <div>
        <p className="mb-2 text-sm font-medium text-ink">Bookmarklet fallback</p>
        <p className="mb-2 text-xs text-ink-muted">
          Drag the link to your bookmarks bar, or run it on the demo site from here.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={bookmarklet}
            className="rounded border border-[#D8D8D8] bg-white px-3 py-1.5 text-sm text-ink"
            onClick={(event) => {
              event.preventDefault();
              onEnable();
            }}
          >
            Capture clicks &amp; scroll
          </a>
          <WuButton variant="secondary" onClick={onEnable}>
            Run bookmarklet on demo
          </WuButton>
        </div>
      </div>
      <p className="text-sm font-medium text-ink">Export a permanent install</p>
      <SnippetBlock filename="snippet.html" code={buildSnippetTag(TRACKING_SITE_KEY)} />
      <SnippetBlock filename="dns.txt" code={buildCnameRecords(siteUrl || 'www.acme.com')} />
      <p className="text-xs text-ink-muted">
        Time to first event: {meta.timeToFirstEvent} Approval: {meta.approvalStillRequired}
      </p>
    </div>
  );
}
