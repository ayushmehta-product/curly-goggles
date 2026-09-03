'use client';

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { Sentiment, SentimentResponse, SentimentTimelineQuest } from '@/data/mock-study-analytics';
import { buildCollectiveSentimentTimeline } from '@/data/mock-study-analytics';

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

function scoreColor(score: number): string {
  if (score > 20) return 'var(--qp-sentiment-positive)';
  if (score < -20) return 'var(--qp-sentiment-negative)';
  return 'var(--qp-sentiment-neutral)';
}

interface SentimentTimelineProps {
  responses: SentimentResponse[];
  quests: SentimentTimelineQuest[];
  selectedQuestIds: string[];
  selectedTaskIds: string[];
}

export function SentimentTimeline({
  responses,
  quests,
  selectedQuestIds,
  selectedTaskIds,
}: SentimentTimelineProps) {
  const { mode, points } = useMemo(
    () => buildCollectiveSentimentTimeline(responses, quests, selectedQuestIds, selectedTaskIds),
    [responses, quests, selectedQuestIds, selectedTaskIds]
  );
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const selectedPoint = points.find((point) => point.key === selectedKey) ?? null;
  const pointResponses = selectedPoint
    ? responses.filter((row) => (mode === 'quest' ? row.questId === selectedPoint.key : row.taskId === selectedPoint.key))
    : [];

  const axisHint =
    mode === 'quest'
      ? 'Each point is collective sentiment across that quest.'
      : 'Each point is collective sentiment across a task in the selected quest.';

  return (
    <>
      <WuCard rounded className="qp-card-depth qp-enter p-4">
        <h3 className="mb-1 text-base font-semibold text-ink">Sentiment timeline</h3>
        <p className="mb-4 text-sm text-ink-muted">
          One timeline of collective sentiment. {axisHint} Select a point to read the responses behind it.
        </p>
        {points.length < 2 ? (
          <p className="py-8 text-center text-sm text-ink-muted">
            Select more than one quest, or one quest with multiple tasks, to plot a timeline.
          </p>
        ) : (
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={points}
                onClick={(state) => {
                  const label = (state as { activeLabel?: string } | null)?.activeLabel;
                  const match = points.find((point) => point.label === label);
                  if (match) setSelectedKey(match.key);
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--qp-gray-40)" />
                <XAxis
                  dataKey="label"
                  interval={0}
                  tick={{ fill: '#9B9B9B', fontSize: 11 }}
                  tickFormatter={(value: string) =>
                    value.length > 18 ? `${value.slice(0, 16)}…` : value
                  }
                />
                <YAxis
                  domain={[-100, 100]}
                  tick={{ fill: '#9B9B9B', fontSize: 12 }}
                  tickFormatter={(value: number) => `${value}`}
                />
                <ReferenceLine y={0} stroke="var(--qp-gray-100)" />
                <Tooltip
                  formatter={(value) => [`${value}`, 'Collective sentiment']}
                  labelFormatter={(label) => label}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  name="Collective sentiment"
                  stroke="#1B87E6"
                  strokeWidth={2}
                  dot={(props) => {
                    const { cx, cy, payload, index } = props as {
                      cx?: number;
                      cy?: number;
                      index?: number;
                      payload?: { score?: number };
                    };
                    return (
                      <circle
                        key={index}
                        cx={cx}
                        cy={cy}
                        r={5}
                        fill={scoreColor(payload?.score ?? 0)}
                        stroke="#fff"
                        strokeWidth={1}
                        cursor="pointer"
                      />
                    );
                  }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
        <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-ink">
          <LegendDot color="var(--qp-sentiment-positive)" label="Leaning positive" />
          <LegendDot color="var(--qp-sentiment-neutral)" label="Mixed / neutral" />
          <LegendDot color="var(--qp-sentiment-negative)" label="Leaning negative" />
        </div>
      </WuCard>

      <WuModal open={selectedKey !== null} onOpenChange={(open) => !open && setSelectedKey(null)} size="md">
        <WuModalHeader>Responses · {selectedPoint?.label}</WuModalHeader>
        <WuModalContent>
          {pointResponses.length === 0 ? (
            <p className="text-sm text-ink-muted">No responses for this point with the selected filters.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {pointResponses.map((row) => (
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
