'use client';

import dynamic from 'next/dynamic';
import { AiLabel } from '@/components/ui/AiLabel';
import type { ThemeRow } from '@/data/mock-study-analytics';

const WuCard = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuCard })),
  { ssr: false }
);
const WuButton = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuButton })),
  { ssr: false }
);

const SENTIMENT = {
  positive: { label: 'Positive', color: 'var(--qp-sentiment-positive)' },
  neutral: { label: 'Neutral', color: 'var(--qp-sentiment-neutral)' },
  negative: { label: 'Negative', color: 'var(--qp-sentiment-negative)' },
} as const;

interface ThematicAnalysisCardProps {
  themes: ThemeRow[];
  onRerun: () => void;
}

export function ThematicAnalysisCard({ themes, onRerun }: ThematicAnalysisCardProps) {
  return (
    <WuCard rounded className="qp-card-depth qp-enter p-4">
      <div className="mb-3 flex items-start justify-between gap-2">
        <h3 className="text-base font-semibold text-ink">Thematic analysis</h3>
        <WuButton variant="secondary" size="sm" onClick={onRerun}>
          <AiLabel>AI analysis</AiLabel>
        </WuButton>
      </div>
      <div className="mb-4 flex flex-wrap items-center gap-4 text-sm text-ink">
        {Object.values(SENTIMENT).map((item) => (
          <span key={item.label} className="inline-flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: item.color }} />
            {item.label}
          </span>
        ))}
      </div>
      {themes.length === 0 ? (
        <p className="py-8 text-center text-sm text-ink-muted">No themes for the selected filters.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {themes.map((theme) => (
            <ThemeRowCard key={theme.id} theme={theme} />
          ))}
        </div>
      )}
    </WuCard>
  );
}

function ThemeRowCard({ theme }: { theme: ThemeRow }) {
  const segments = [
    { key: 'positive', value: theme.positive, color: SENTIMENT.positive.color },
    { key: 'neutral', value: theme.neutral, color: SENTIMENT.neutral.color },
    { key: 'negative', value: theme.negative, color: SENTIMENT.negative.color },
  ].filter((segment) => segment.value > 0);

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-[var(--qp-gray-40)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 sm:max-w-[40%]">
        <p className="font-medium text-ink">
          #{theme.rank}: {theme.name}
        </p>
        <p className="text-sm text-ink-muted">
          {theme.responseCount} responses ({theme.percent}%)
        </p>
      </div>
      <div className="min-w-0 flex-1 sm:max-w-[58%]">
        <div className="flex h-3 overflow-hidden rounded-full bg-[var(--qp-gray-20)]">
          {segments.map((segment) => (
            <span
              key={segment.key}
              className="h-full"
              style={{ width: `${segment.value}%`, background: segment.color }}
            />
          ))}
        </div>
        <div className="mt-1 flex">
          {segments.map((segment) => (
            <span
              key={segment.key}
              className="text-center text-xs text-ink-muted"
              style={{ width: `${segment.value}%` }}
            >
              {segment.value}%
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
