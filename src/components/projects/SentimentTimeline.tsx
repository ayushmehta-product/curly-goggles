'use client';

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { Sentiment, SentimentResponse } from '@/data/mock-study-analytics';
import { buildSentimentTimeline } from '@/data/mock-study-analytics';

const WuCard = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuCard })),
  { ssr: false }
);
const WuChip = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuChip })),
  { ssr: false }
);
const WuModal = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuModal })),
  { ssr: false }
);
const WuModalHeader = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuModalHeader })),
  { ssr: false }
);
const WuModalContent = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuModalContent })),
  { ssr: false }
);
const WuModalFooter = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuModalFooter })),
  { ssr: false }
);
const WuModalClose = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuModalClose })),
  { ssr: false }
);

const CHIP_COLOR: Record<Sentiment, 'success' | 'warning' | 'danger'> = {
  positive: 'success',
  neutral: 'warning',
  negative: 'danger',
};

interface SentimentTimelineProps {
  responses: SentimentResponse[];
}

export function SentimentTimeline({ responses }: SentimentTimelineProps) {
  const data = useMemo(() => buildSentimentTimeline(responses), [responses]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const dayResponses = responses.filter((row) => row.dateLabel === selectedDate);

  return (
    <>
      <WuCard rounded className="qp-card-depth qp-enter p-4">
        <h3 className="mb-3 text-base font-semibold text-ink">Sentiment timeline</h3>
        <div className="mb-4 flex flex-wrap items-center gap-4 text-sm text-ink">
          <LegendDot color="var(--qp-sentiment-positive)" label="Positive" />
          <LegendDot color="var(--qp-sentiment-neutral)" label="Neutral" />
          <LegendDot color="var(--qp-sentiment-negative)" label="Negative" />
        </div>
        <p className="mb-3 text-xs text-ink-muted">Select a point to read the responses behind it.</p>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              onClick={(state) => {
                const label = (state as { activeLabel?: string } | null)?.activeLabel;
                if (label) setSelectedDate(label);
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--qp-gray-40)" />
              <XAxis dataKey="date" tick={{ fill: '#9B9B9B', fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fill: '#9B9B9B', fontSize: 12 }} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="positive"
                name="Positive"
                stroke="var(--qp-sentiment-positive)"
                strokeWidth={2}
                dot={{ r: 5, cursor: 'pointer' }}
                activeDot={{ r: 7 }}
              />
              <Line
                type="monotone"
                dataKey="neutral"
                name="Neutral"
                stroke="var(--qp-sentiment-neutral)"
                strokeWidth={2}
                dot={{ r: 5, cursor: 'pointer' }}
                activeDot={{ r: 7 }}
              />
              <Line
                type="monotone"
                dataKey="negative"
                name="Negative"
                stroke="var(--qp-sentiment-negative)"
                strokeWidth={2}
                dot={{ r: 5, cursor: 'pointer' }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </WuCard>

      <WuModal open={selectedDate !== null} onOpenChange={(open) => !open && setSelectedDate(null)} size="md">
        <WuModalHeader>Responses · {selectedDate}</WuModalHeader>
        <WuModalContent>
          {dayResponses.length === 0 ? (
            <p className="text-sm text-ink-muted">No responses on this day for the selected filters.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {dayResponses.map((row) => (
                <WuCard key={row.id} rounded className="border border-[var(--qp-gray-40)] p-3">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <WuChip variant="secondary" size="sm" color={CHIP_COLOR[row.sentiment]}>
                      {row.sentiment === 'positive' ? 'Positive' : row.sentiment === 'neutral' ? 'Neutral' : 'Negative'}
                    </WuChip>
                    <span className="text-sm font-medium text-ink">{row.participantName}</span>
                    <span className="text-xs text-ink-muted">
                      {row.source} · {row.taskLabel}
                    </span>
                  </div>
                  <p className="text-sm text-ink">{row.text}</p>
                </WuCard>
              ))}
            </div>
          )}
        </WuModalContent>
        <WuModalFooter>
          <WuModalClose variant="secondary">Close</WuModalClose>
        </WuModalFooter>
      </WuModal>
    </>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}
