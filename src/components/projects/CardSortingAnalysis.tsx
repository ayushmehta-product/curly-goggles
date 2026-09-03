'use client';

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import type { IWuTableColumnDef } from '@npm-questionpro/wick-ui-lib';
import {
  MOCK_CARD_SORTING_ANALYSIS,
  type CardSortParticipantRow,
} from '@/data/mock-card-sorting';

const WuInput = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuInput })),
  { ssr: false }
);
const WuCard = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuCard })),
  { ssr: false }
);
const WuChip = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuChip })),
  { ssr: false }
);
const WuTable = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuTable })),
  { ssr: false }
);

interface CardSortingAnalysisProps {
  onFilter: () => void;
}

export function CardSortingAnalysis({ onFilter }: CardSortingAnalysisProps) {
  const analysis = MOCK_CARD_SORTING_ANALYSIS;
  const [search, setSearch] = useState('');
  const [selectedCard, setSelectedCard] = useState(analysis.agreement[0]?.cardId ?? '');
  const card =
    analysis.agreement.find((row) => row.cardId === selectedCard) ?? analysis.agreement[0];

  const participants = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return analysis.participants;
    return analysis.participants.filter((row) => {
      if (row.name.toLowerCase().includes(query)) return true;
      return row.groups.some(
        (group) =>
          group.category.toLowerCase().includes(query) ||
          group.cards.some((label) => label.toLowerCase().includes(query))
      );
    });
  }, [analysis.participants, search]);

  const columns: IWuTableColumnDef<CardSortParticipantRow>[] = [
    {
      accessorKey: 'name',
      header: 'Participant',
      cell: ({ row }) => <span className="font-medium text-accent">{row.original.name}</span>,
    },
    {
      accessorKey: 'groups',
      header: 'Groups',
      cell: ({ row }) => (
        <span className="text-sm text-ink">
          {row.original.groups.map((group) => `${group.category} (${group.cards.length})`).join(' · ')}
        </span>
      ),
    },
    {
      accessorKey: 'unsorted',
      header: 'Unsorted',
      cell: ({ row }) =>
        row.original.unsorted.length === 0 ? (
          <span className="text-ink-muted">None</span>
        ) : (
          row.original.unsorted.join(', ')
        ),
    },
    {
      accessorKey: 'timeSeconds',
      header: 'Time',
      cell: ({ row }) => `${row.original.timeSeconds}s`,
    },
  ];

  const labels = analysis.cards.map((item) => item.label);
  const similarityLookup = new Map<string, number>();
  for (const pair of analysis.similarity) {
    similarityLookup.set(`${pair.a}|${pair.b}`, pair.percent);
    similarityLookup.set(`${pair.b}|${pair.a}`, pair.percent);
  }

  return (
    <div className="qp-enter flex flex-col gap-8">
      <WuCard rounded className="qp-card-depth overflow-hidden">
        <div className="border-b border-line bg-surface-sunken px-4 py-3">
          <p className="text-xs font-medium text-ink-muted">
            {analysis.kind === 'open' ? 'Open' : analysis.kind === 'hybrid' ? 'Hybrid' : 'Closed'} card sort
          </p>
          <h3 className="mt-1 text-base font-semibold text-ink">{analysis.prompt}</h3>
        </div>
        <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-4">
          <Stat label="Participants" value={String(analysis.participantCount)} hint="NN/g: 30–50 for quantitative" />
          <Stat label="Avg. time" value={`${analysis.avgTimeSeconds}s`} hint="Time to finish the sort" />
          <Stat label="Unsorted" value={`${analysis.unsortedRate}%`} hint="Left aside instead of forced" />
          <Stat
            label="Categories used"
            value={String(analysis.popularCategories.length)}
            hint={analysis.kind === 'open' ? 'Created by participants' : 'Predefined groups'}
          />
        </div>
      </WuCard>

      <WuCard rounded className="qp-card-depth p-4">
        <div className="mb-1 flex items-center justify-between gap-2">
          <h4 className="text-sm font-semibold text-ink">Cards and categories</h4>
          <span className="text-xs text-ink-muted">Agreement</span>
        </div>
        <p className="mb-4 text-sm text-ink-muted">
          Each card is shown with the category it landed in most often. Select a card to see the full distribution,
          including average rank when ranking was required.
        </p>
        <div className="mb-4 flex flex-wrap gap-1">
          {analysis.agreement.map((row) => (
            <button
              key={row.cardId}
              type="button"
              className={`rounded px-2 py-1 text-sm ${
                row.cardId === card.cardId
                  ? 'bg-accent text-inverse'
                  : 'bg-surface-sunken text-ink hover:bg-[var(--qp-gray-40)]'
              }`}
              onClick={() => {
                setSelectedCard(row.cardId);
                onFilter();
              }}
            >
              {row.cardLabel}
            </button>
          ))}
        </div>
        {card && (
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-ink">{card.cardLabel}</span>
              <WuChip variant="secondary" size="sm" color="success">
                {card.agreement}% in {card.topCategory}
              </WuChip>
            </div>
            <div className="flex flex-col gap-3">
              {card.categories.map((row) => (
                <div key={row.label}>
                  <div className="mb-1 flex items-center justify-between gap-2 text-sm">
                    <span className="inline-flex items-center gap-1 text-ink">
                      {row.label === card.topCategory && (
                        <span className="wm-check-circle text-base text-accent" aria-hidden />
                      )}
                      {row.label}
                    </span>
                    <span className="shrink-0 text-ink-muted">
                      {row.percent}% · {row.count}
                      {row.avgRank != null ? ` · Rank ${row.avgRank.toFixed(1)}` : ''}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[var(--qp-gray-20)]">
                    <div
                      className={`h-full rounded-full ${row.label === card.topCategory ? 'bg-accent' : 'bg-[var(--qp-q-blue)]'}`}
                      style={{ width: `${row.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </WuCard>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <WuCard rounded className="qp-card-depth p-4">
          <h4 className="mb-1 text-sm font-semibold text-ink">Agreement matrix</h4>
          <p className="mb-3 text-sm text-ink-muted">How often each card was placed in each category.</p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[420px] border-collapse text-xs">
              <thead>
                <tr>
                  <th className="px-2 py-1 text-left font-medium text-ink-muted">Card</th>
                  {analysis.categories.map((category) => (
                    <th key={category} className="px-2 py-1 text-left font-medium text-ink-muted">
                      {category}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {analysis.agreement.map((row) => (
                  <tr key={row.cardId}>
                    <td className="px-2 py-1 text-ink">{row.cardLabel}</td>
                    {analysis.categories.map((category) => {
                      const cell = row.categories.find((item) => item.label === category);
                      const percent = cell?.percent ?? 0;
                      return (
                        <td key={category} className="px-1 py-1">
                          <span
                            className="block rounded px-1.5 py-1 text-center text-ink"
                            style={{ background: `color-mix(in srgb, #1B87E6 ${percent}%, #EEF3FB)` }}
                          >
                            {percent}%
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </WuCard>

        <WuCard rounded className="qp-card-depth p-4">
          <h4 className="mb-1 text-sm font-semibold text-ink">Similarity matrix</h4>
          <p className="mb-3 text-sm text-ink-muted">How often two cards were grouped together.</p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[420px] border-collapse text-xs">
              <thead>
                <tr>
                  <th className="px-2 py-1 text-left font-medium text-ink-muted" />
                  {labels.slice(0, 6).map((label) => (
                    <th key={label} className="px-2 py-1 text-left font-medium text-ink-muted">
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {labels.slice(0, 6).map((rowLabel) => (
                  <tr key={rowLabel}>
                    <td className="px-2 py-1 text-ink">{rowLabel}</td>
                    {labels.slice(0, 6).map((colLabel) => {
                      const percent = rowLabel === colLabel ? 100 : (similarityLookup.get(`${rowLabel}|${colLabel}`) ?? 8);
                      return (
                        <td key={colLabel} className="px-1 py-1">
                          <span
                            className="block rounded px-1.5 py-1 text-center text-ink"
                            style={{ background: `color-mix(in srgb, #1B3380 ${percent}%, #EEF3FB)` }}
                          >
                            {percent}%
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </WuCard>
      </div>

      <WuCard rounded className="qp-card-depth p-4">
        <h4 className="mb-3 text-sm font-semibold text-ink">Most used categories</h4>
        <div className="flex flex-col gap-3">
          {analysis.popularCategories.map((row) => (
            <div key={row.label}>
              <div className="mb-1 flex items-center justify-between gap-2 text-sm">
                <span className="text-ink">{row.label}</span>
                <span className="text-ink-muted">
                  {row.percent}% · {row.count} participants
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[var(--qp-gray-20)]">
                <div className="h-full rounded-full bg-accent" style={{ width: `${row.percent}%` }} />
              </div>
            </div>
          ))}
        </div>
      </WuCard>

      <WuCard rounded className="qp-card-depth p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-sm font-semibold text-ink">Participant sorts</h4>
          <WuInput
            variant="outlined"
            placeholder="Search in sorts"
            Icon={<span className="wm-search" />}
            iconPosition="left"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64"
          />
        </div>
        <WuTable
          data={participants as unknown[]}
          columns={columns as unknown as IWuTableColumnDef<unknown>[]}
          variant="striped"
          sort={{ enabled: true }}
          NoDataContent={<p className="py-6 text-center text-sm text-ink-muted">No matching participants.</p>}
        />
      </WuCard>
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-lg border border-line bg-surface-sunken px-3 py-3">
      <p className="text-xs text-ink-muted">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-ink">{value}</p>
      <p className="mt-1 text-xs text-ink-muted">{hint}</p>
    </div>
  );
}
