'use client';

import dynamic from 'next/dynamic';
import { TRACKING_SITE_KEY, TRACKING_VARIANTS } from '@/data/mock-tracking-setup';
import { buildCnameRecords, buildEdgeWorkerStub, buildSnippetTag, FIRST_PARTY_EDGE_HOST } from '@/lib/tracking/snippet';
import { SnippetBlock } from '@/components/tracking-setup/SnippetBlock';

const WuButton = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuButton })),
  { ssr: false }
);
const WuInput = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuInput })),
  { ssr: false }
);

interface VariantBEdgeProps {
  siteUrl: string;
  onSiteUrlChange: (value: string) => void;
  enabled: boolean;
  onInject: () => void;
  onDisable: () => void;
}

export function VariantBEdge({
  siteUrl,
  onSiteUrlChange,
  enabled,
  onInject,
  onDisable,
}: VariantBEdgeProps) {
  const meta = TRACKING_VARIANTS[1];
  const beforeHtml = `<head>\n  <title>Acme checkout</title>\n</head>`;
  const afterHtml = `<head>\n  <title>Acme checkout</title>\n  ${buildSnippetTag(TRACKING_SITE_KEY, `https://${FIRST_PARTY_EDGE_HOST}/ux.js`).replace(/\n/g, '\n  ')}\n</head>`;

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
      <WuInput
        Label="Origin hostname"
        variant="outlined"
        placeholder="www.acme.com"
        value={siteUrl}
        onChange={(event) => onSiteUrlChange(event.target.value)}
      />
      <SnippetBlock filename="dns.txt" code={buildCnameRecords(siteUrl || 'www.acme.com')} />
      <SnippetBlock filename="html-rewriter.js" code={buildEdgeWorkerStub(TRACKING_SITE_KEY)} />
      <div className="grid gap-3 md:grid-cols-2">
        <SnippetBlock filename="origin.html" code={beforeHtml} />
        <SnippetBlock filename="after-edge.html" code={afterHtml} />
      </div>
      <div className="flex flex-wrap gap-2">
        {enabled ? (
          <WuButton variant="secondary" onClick={onDisable}>
            Remove injection
          </WuButton>
        ) : (
          <WuButton onClick={onInject}>Simulate edge injection</WuButton>
        )}
      </div>
      <p className="text-xs text-ink-muted">
        Time to first event: {meta.timeToFirstEvent} Approval: {meta.approvalStillRequired}
      </p>
    </div>
  );
}
