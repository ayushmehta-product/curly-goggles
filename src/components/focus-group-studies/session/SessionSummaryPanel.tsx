'use client';

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';

const WuButton = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuButton })),
  { ssr: false }
);
const WuCard = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuCard })),
  { ssr: false }
);

const SUMMARY_COLLAPSE_THRESHOLD = 320;

interface SessionSummaryPanelProps {
  summary: string;
  keyTakeaways: string[];
}

export function SessionSummaryPanel({ summary, keyTakeaways }: SessionSummaryPanelProps) {
  const [summaryExpanded, setSummaryExpanded] = useState(false);

  const shouldCollapseSummary = useMemo(() => summary.length > SUMMARY_COLLAPSE_THRESHOLD, [summary]);

  return (
    <div className="mt-5 space-y-4">
      <WuCard rounded className="p-5">
        <div className="mb-3 flex items-center gap-2">
          <h2 className="text-base font-semibold text-gray-900">Summary</h2>
          <span className="rounded-full bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-700">AI</span>
        </div>
        <p
          className={`text-sm leading-7 text-gray-800 ${
            shouldCollapseSummary && !summaryExpanded ? 'line-clamp-5' : ''
          }`}
        >
          {summary}
        </p>
        {shouldCollapseSummary && (
          <WuButton
            size="sm"
            variant="link"
            className="mt-2"
            onClick={() => setSummaryExpanded((current) => !current)}
          >
            {summaryExpanded ? 'Show less' : 'Show more'}
          </WuButton>
        )}
      </WuCard>

      <WuCard rounded className="p-5">
        <h2 className="mb-3 text-base font-semibold text-gray-900">Key Takeaways</h2>
        {keyTakeaways.length === 0 ? (
          <p className="text-sm text-gray-500">Key takeaways will appear here once the session has been analyzed.</p>
        ) : (
          <div className="space-y-2">
            {keyTakeaways.map((takeaway) => (
              <div
                key={takeaway}
                className="flex gap-2.5 rounded-lg bg-gray-50 px-3 py-2.5 text-sm leading-6 text-gray-700"
              >
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                <span>{takeaway}</span>
              </div>
            ))}
          </div>
        )}
      </WuCard>
    </div>
  );
}
