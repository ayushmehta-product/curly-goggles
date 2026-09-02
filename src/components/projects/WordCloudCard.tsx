'use client';

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import type { IWuTableColumnDef } from '@npm-questionpro/wick-ui-lib';
import { ordinal, type WordFrequencyRow } from '@/data/mock-study-analytics';

const WuCard = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuCard })),
  { ssr: false }
);
const WuButton = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuButton })),
  { ssr: false }
);
const WuMenu = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuMenu })),
  { ssr: false }
);
const WuMenuItem = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuMenuItem })),
  { ssr: false }
);
const WuTable = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuTable })),
  { ssr: false }
);

type WordView = 'cloud' | 'frequency';

interface WordCloudCardProps {
  words: WordFrequencyRow[];
  showKeywords: boolean;
}

interface RankedWord extends WordFrequencyRow {
  place: number;
}

export function WordCloudCard({ words, showKeywords }: WordCloudCardProps) {
  const [view, setView] = useState<WordView>('cloud');
  const ranked = useMemo<RankedWord[]>(() => {
    const sorted = [...words].sort((a, b) => b.count - a.count || a.word.localeCompare(b.word));
    return sorted.map((row, index) => ({ ...row, place: index + 1 }));
  }, [words]);

  const max = ranked[0]?.count ?? 1;
  const columns: IWuTableColumnDef<RankedWord>[] = [
    {
      accessorKey: 'place',
      header: 'Place',
      cell: ({ row }) => ordinal(row.original.place),
    },
    {
      accessorKey: 'word',
      header: 'Word',
    },
    {
      accessorKey: 'count',
      header: 'Frequency',
    },
  ];

  return (
    <WuCard rounded className="qp-card-depth p-4">
      <div className="mb-3 flex items-center justify-between gap-2 border-b border-[var(--qp-gray-40)] pb-3">
        <h3 className="text-base font-semibold text-ink">
          {view === 'cloud' ? 'Word cloud' : 'Word frequency'}
        </h3>
        <WuMenu
          Trigger={
            <WuButton variant="outline" size="sm">
              {view === 'cloud' ? 'Word cloud' : 'Word frequency'}
              <span className="wm-arrow-drop-down" />
            </WuButton>
          }
          align="end"
        >
          <WuMenuItem onSelect={() => setView('cloud')}>Word cloud</WuMenuItem>
          <WuMenuItem onSelect={() => setView('frequency')}>Word frequency</WuMenuItem>
        </WuMenu>
      </div>
      {ranked.length === 0 ? (
        <p className="py-10 text-center text-sm text-ink-muted">No words for the selected filters.</p>
      ) : view === 'cloud' ? (
        <div className="flex min-h-56 flex-wrap items-center justify-center gap-x-4 gap-y-2 px-4 py-8">
          {ranked.map((row) => {
            const weight = row.count / max;
            const size = 12 + weight * 28;
            const color = `color-mix(in srgb, var(--qp-p-blue) ${Math.round(40 + weight * 60)}%, #c5e4ff)`;
            return (
              <span
                key={row.word}
                className="leading-none"
                style={{ fontSize: size, color, fontWeight: weight > 0.6 ? 600 : 400 }}
                title={showKeywords ? `${row.word}: ${row.count}` : row.word}
              >
                {row.word}
              </span>
            );
          })}
        </div>
      ) : (
        <div className="max-h-80 overflow-auto">
          <WuTable
            data={ranked as unknown[]}
            columns={columns as unknown as IWuTableColumnDef<unknown>[]}
            variant="striped"
            sort={{ enabled: true }}
            NoDataContent={<p className="py-6 text-center text-sm text-ink-muted">No words found.</p>}
          />
        </div>
      )}
    </WuCard>
  );
}
