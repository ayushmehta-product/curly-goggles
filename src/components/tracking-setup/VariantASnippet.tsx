'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { TRACKING_SITE_KEY, TRACKING_VARIANTS } from '@/data/mock-tracking-setup';
import { buildGtmCustomHtml, buildSnippetTag } from '@/lib/tracking/snippet';
import { SnippetBlock } from '@/components/tracking-setup/SnippetBlock';

const WuButton = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuButton })),
  { ssr: false }
);
const WuInput = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuInput })),
  { ssr: false }
);

interface VariantASnippetProps {
  siteUrl: string;
  onSiteUrlChange: (value: string) => void;
  enabled: boolean;
  onInstallDemo: () => void;
  onDisable: () => void;
}

export function VariantASnippet({
  siteUrl,
  onSiteUrlChange,
  enabled,
  onInstallDemo,
  onDisable,
}: VariantASnippetProps) {
  const [method, setMethod] = useState<'direct' | 'gtm'>('gtm');
  const meta = TRACKING_VARIANTS[0];
  const snippet = method === 'gtm' ? buildGtmCustomHtml(TRACKING_SITE_KEY) : buildSnippetTag(TRACKING_SITE_KEY);

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
        Label="Website URL"
        variant="outlined"
        placeholder="https://www.acme.com"
        value={siteUrl}
        onChange={(event) => onSiteUrlChange(event.target.value)}
      />
      <div className="flex flex-wrap gap-2">
        <WuButton variant={method === 'gtm' ? undefined : 'secondary'} onClick={() => setMethod('gtm')}>
          Google Tag Manager recipe
        </WuButton>
        <WuButton variant={method === 'direct' ? undefined : 'secondary'} onClick={() => setMethod('direct')}>
          Direct snippet
        </WuButton>
      </div>
      <SnippetBlock filename={method === 'gtm' ? 'gtm-custom-html.html' : 'snippet.html'} code={snippet} />
      <div className="flex flex-wrap gap-2">
        {enabled ? (
          <WuButton variant="secondary" onClick={onDisable}>
            Remove from demo site
          </WuButton>
        ) : (
          <WuButton onClick={onInstallDemo}>Install on demo site</WuButton>
        )}
      </div>
      <p className="text-xs text-ink-muted">
        Time to first event: {meta.timeToFirstEvent} Approval: {meta.approvalStillRequired}
      </p>
    </div>
  );
}
