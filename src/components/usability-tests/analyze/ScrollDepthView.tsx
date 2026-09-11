'use client';

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import type { IWuSwitcherOptions } from '@npm-questionpro/wick-ui-lib';
import type { PageScrollDepthData } from '@/data/mock-usability-analytics';

const WuCard = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuCard })),
  { ssr: false }
);
const WuSelect = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuSelect })),
  { ssr: false }
);
const WuSwitcher = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuSwitcher })),
  { ssr: false }
);
const WuTooltip = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuTooltip })),
  { ssr: false }
);

type ScrollView = 'overlay' | 'compare';
type PageOption = { value: string; label: string };

const VIEW_OPTIONS: IWuSwitcherOptions<ScrollView> = [
  { value: 'overlay', label: 'On this page' },
  { value: 'compare', label: 'Compare pages' },
];

const SCROLL_STOPS = [
  { id: 'Anon:626', stopPct: 82, color: '#1B87E6' },
  { id: 'Anon:412', stopPct: 34, color: '#1B3380' },
  { id: 'Anon:891', stopPct: 91, color: '#545E6B' },
  { id: 'Anon:247', stopPct: 61, color: '#F5A300' },
  { id: 'Anon:119', stopPct: 48, color: '#9B9B9B' },
  { id: 'Anon:334', stopPct: 27, color: '#C45656' },
];

const PAGE_SECTIONS: Record<string, { blocks: { h: string; color: string }[] }> = {
  default: {
    blocks: [
      { h: 'h-14', color: 'bg-[var(--qp-q-blue)]' },
      { h: 'h-24', color: 'bg-ink' },
      { h: 'h-16', color: 'bg-ink-muted' },
      { h: 'h-20', color: 'bg-ink' },
      { h: 'h-12', color: 'bg-ink-muted' },
      { h: 'h-24', color: 'bg-ink' },
    ],
  },
  '/': {
    blocks: [
      { h: 'h-16', color: 'bg-[var(--qp-q-blue)]' },
      { h: 'h-28', color: 'bg-accent' },
      { h: 'h-16', color: 'bg-ink' },
      { h: 'h-20', color: 'bg-ink-muted' },
      { h: 'h-14', color: 'bg-ink' },
    ],
  },
  '/checkout': {
    blocks: [
      { h: 'h-10', color: 'bg-ink' },
      { h: 'h-16', color: 'bg-ink-muted' },
      { h: 'h-24', color: 'bg-[var(--qp-gray-100)]' },
      { h: 'h-16', color: 'bg-ink-muted' },
      { h: 'h-20', color: 'bg-ink' },
      { h: 'h-12', color: 'bg-[var(--qp-gray-100)]' },
    ],
  },
  '/product': {
    blocks: [
      { h: 'h-20', color: 'bg-ink' },
      { h: 'h-28', color: 'bg-ink-muted' },
      { h: 'h-12', color: 'bg-[var(--qp-gray-100)]' },
      { h: 'h-16', color: 'bg-ink-muted' },
      { h: 'h-20', color: 'bg-ink' },
    ],
  },
};

const BAND_CONFIG = [
  { label: '25%', color: 'rgba(223,242,191,0.55)', reached: 'reached25' as const },
  { label: '50%', color: 'rgba(254,239,179,0.55)', reached: 'reached50' as const },
  { label: '75%', color: 'rgba(245,163,0,0.22)', reached: 'reached75' as const },
  { label: '100%', color: 'rgba(255,186,186,0.55)', reached: 'reached100' as const },
];

function barFill(pct: number): string {
  if (pct >= 75) return '#1B3380';
  if (pct >= 55) return '#1B87E6';
  if (pct >= 40) return '#F5A300';
  return '#C45656';
}

function ScrollDepthOverlay({ page }: { page: PageScrollDepthData }) {
  const sections = PAGE_SECTIONS[page.path] ?? PAGE_SECTIONS.default;

  return (
    <WuCard rounded className="overflow-hidden p-0 wu-shadow-sm">
      <div className="flex items-center gap-2 border-b border-line bg-[var(--qp-gray-20)] px-3 py-2">
        <div className="flex gap-1.5">
          <span className="h-3 w-3 rounded-full bg-[#FFBABA]" />
          <span className="h-3 w-3 rounded-full bg-[#FEEFB3]" />
          <span className="h-3 w-3 rounded-full bg-[#DFF2BF]" />
        </div>
        <div className="flex-1 rounded bg-surface px-2 py-1 text-xs text-ink-muted">
          example.com{page.path === '/' ? '' : page.path}
        </div>
      </div>

      <div className="relative bg-ink" style={{ height: 400 }}>
        <div className="absolute inset-0 flex flex-col gap-2 p-4 opacity-25">
          {sections.blocks.map((block, i) => (
            <div key={i} className={`w-full rounded ${block.h} ${block.color}`} />
          ))}
        </div>

        {BAND_CONFIG.map((band, idx) => {
          const pct = page[band.reached];
          return (
            <div
              key={band.label}
              className="absolute left-0 right-0"
              style={{
                top: `${idx * 25}%`,
                height: '25%',
                backgroundColor: band.color,
              }}
            >
              <div
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded bg-surface px-2 py-0.5 text-xs font-semibold text-ink"
              >
                {pct}% reached {band.label}
              </div>
            </div>
          );
        })}

        {[25, 50, 75].map((pct) => (
          <div
            key={pct}
            className="absolute left-0 right-0 border-t border-dashed border-white/30"
            style={{ top: `${pct}%` }}
          />
        ))}

        {SCROLL_STOPS.map((p) => (
          <div
            key={p.id}
            className="absolute left-0 right-0 flex items-center"
            style={{ top: `${p.stopPct}%` }}
          >
            <div className="h-px w-full opacity-70" style={{ backgroundColor: p.color }} />
            <div
              className="absolute left-2 rounded px-1 py-px font-mono text-[10px] text-white"
              style={{ backgroundColor: p.color, transform: 'translateY(-50%)' }}
            >
              {p.id}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-line bg-surface px-4 py-2.5 text-xs text-ink-muted">
        <span className="font-medium text-ink">Where people stopped</span>
        {SCROLL_STOPS.map((p) => (
          <span key={p.id} className="flex items-center gap-1">
            <span className="inline-block h-2 w-4 rounded-sm" style={{ backgroundColor: p.color }} />
            {p.id}
          </span>
        ))}
      </div>
    </WuCard>
  );
}

function ComparePagesChart({ pages }: { pages: PageScrollDepthData[] }) {
  return (
    <WuCard rounded className="p-4 wu-shadow-sm">
      <p className="text-sm font-semibold text-ink">How far people reached</p>
      <p className="mb-4 text-xs text-ink-muted">
        Average depth is a weak signal on its own. Compare the start page with the success page.
      </p>
      <div className="flex flex-col gap-3">
        {pages.map((page) => (
          <WuTooltip
            key={page.path}
            content={`25% ${page.reached25}% · 50% ${page.reached50}% · 75% ${page.reached75}% · end ${page.reached100}%`}
          >
            <div className="flex items-center gap-3">
              <p className="w-28 shrink-0 truncate text-sm text-ink">
                {page.label}
                {page.isStart ? ' (start)' : page.isSuccess ? ' (success)' : ''}
              </p>
              <div className="h-6 min-w-0 flex-1 rounded bg-[var(--qp-gray-20)]">
                <div
                  className="h-full rounded"
                  style={{ width: `${page.avgScrollDepth}%`, backgroundColor: barFill(page.avgScrollDepth) }}
                />
              </div>
              <p className="w-10 shrink-0 text-right text-sm font-medium text-ink">{page.avgScrollDepth}%</p>
            </div>
          </WuTooltip>
        ))}
      </div>
    </WuCard>
  );
}

export function ScrollDepthView({ allPages }: { allPages: PageScrollDepthData[] }) {
  const pageOptions = useMemo<PageOption[]>(
    () =>
      allPages.map((page) => ({
        value: page.path,
        label: page.isStart ? `${page.label} (start)` : page.isSuccess ? `${page.label} (success)` : page.label,
      })),
    [allPages]
  );
  const [view, setView] = useState<ScrollView>('overlay');
  const defaultPath = allPages.find((page) => page.isSuccess)?.path ?? allPages[0]?.path ?? '/';
  const [selectedPath, setSelectedPath] = useState(defaultPath);
  const selectedPage = allPages.find((page) => page.path === selectedPath) ?? allPages[0];
  const selectedOption = pageOptions.find((option) => option.value === selectedPath) ?? pageOptions[0];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        {view === 'overlay' ? (
          <div className="w-56">
            <WuSelect
              data={pageOptions}
              accessorKey={{ value: 'value', label: 'label' }}
              value={selectedOption}
              Label="Page"
              variant="outlined"
              onSelect={(value) => setSelectedPath((value as PageOption).value)}
            />
          </div>
        ) : (
          <p className="text-sm text-ink-muted">All pages in this task — start and success are labelled</p>
        )}
        <WuSwitcher
          options={VIEW_OPTIONS}
          value={view}
          onChange={(value) => setView(value as ScrollView)}
          type="tab"
          size="md"
        />
      </div>

      {view === 'overlay' && selectedPage ? (
        <>
          <ScrollDepthOverlay page={selectedPage} />
          <p className="text-xs text-ink-muted">
            {selectedPage.isSuccess
              ? 'This is the success page. If success is a section further down, people who never reached it could not complete the task.'
              : selectedPage.isStart
                ? 'This is the start page. Depth here shows whether people moved on — not whether they succeeded.'
                : 'Share of people who reached each depth. Depth is not success unless you defined success as a section on this page.'}
          </p>
        </>
      ) : (
        <ComparePagesChart pages={allPages} />
      )}
    </div>
  );
}
