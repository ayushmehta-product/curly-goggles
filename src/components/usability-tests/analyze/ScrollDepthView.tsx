'use client';

import { useState, useRef, KeyboardEvent } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { PageScrollDepthData } from '@/data/mock-usability-analytics';

// ---------------------------------------------------------------------------
// Horizontal bar chart tooltip
// ---------------------------------------------------------------------------
interface DepthTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: PageScrollDepthData }>;
  label?: string;
}

function DepthTooltip({ active, payload }: DepthTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 shadow-md text-xs">
      <p className="mb-1.5 font-semibold text-gray-700">{d.label}</p>
      <div className="space-y-1">
        <div className="flex items-center justify-between gap-4">
          <span className="text-gray-500">Avg scroll depth</span>
          <span className="font-semibold text-indigo-600">{d.avgScrollDepth}%</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-gray-500">Reached 25%</span>
          <span className="font-medium">{d.reached25}%</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-gray-500">Reached 50%</span>
          <span className="font-medium">{d.reached50}%</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-gray-500">Reached 75%</span>
          <span className="font-medium">{d.reached75}%</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-gray-500">Reached 100%</span>
          <span className="font-medium">{d.reached100}%</span>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Horizontal bar chart (multi-page comparison)
// ---------------------------------------------------------------------------
function ScrollDepthBarChart({ pages }: { pages: PageScrollDepthData[] }) {
  const chartHeight = Math.max(120, pages.length * 52 + 40);

  return (
    <ResponsiveContainer width="100%" height={chartHeight}>
      <BarChart
        layout="vertical"
        data={pages}
        margin={{ top: 0, right: 48, left: 0, bottom: 0 }}
        barCategoryGap="28%"
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" horizontal={false} />
        <XAxis
          type="number"
          domain={[0, 100]}
          tickFormatter={(v) => `${v}%`}
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 11, fill: '#9CA3AF' }}
          dy={4}
        />
        <YAxis
          type="category"
          dataKey="label"
          width={110}
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fill: '#374151' }}
        />
        <Tooltip content={<DepthTooltip />} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
        <Bar dataKey="avgScrollDepth" name="Avg Scroll Depth" radius={[0, 4, 4, 0]} maxBarSize={28}>
          {pages.map((p) => (
            <Cell
              key={p.path}
              fill={
                p.avgScrollDepth >= 75
                  ? '#22C55E'
                  : p.avgScrollDepth >= 55
                  ? '#6366F1'
                  : p.avgScrollDepth >= 40
                  ? '#F59E0B'
                  : '#EF4444'
              }
            />
          ))}
          {/* Background track */}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ---------------------------------------------------------------------------
// Hotjar-style scroll depth overlay (single page)
// ---------------------------------------------------------------------------
const HOTJAR_PARTICIPANTS = [
  { id: 'Anon:626', stopPct: 82, color: '#3B82F6' },
  { id: 'Anon:412', stopPct: 34, color: '#8B5CF6' },
  { id: 'Anon:891', stopPct: 91, color: '#EC4899' },
  { id: 'Anon:247', stopPct: 61, color: '#F59E0B' },
  { id: 'Anon:119', stopPct: 48, color: '#14B8A6' },
  { id: 'Anon:334', stopPct: 27, color: '#EF4444' },
];

const PAGE_SECTIONS: Record<string, { label: string; blocks: { h: string; color: string }[] }> = {
  default: {
    label: 'Page',
    blocks: [
      { h: 'h-14', color: 'bg-gray-700' },
      { h: 'h-24', color: 'bg-gray-600' },
      { h: 'h-16', color: 'bg-gray-500' },
      { h: 'h-20', color: 'bg-gray-600' },
      { h: 'h-12', color: 'bg-gray-500' },
      { h: 'h-24', color: 'bg-gray-600' },
    ],
  },
  '/': {
    label: 'Home',
    blocks: [
      { h: 'h-16', color: 'bg-blue-900' },
      { h: 'h-28', color: 'bg-blue-800' },
      { h: 'h-16', color: 'bg-gray-700' },
      { h: 'h-20', color: 'bg-gray-600' },
      { h: 'h-14', color: 'bg-gray-700' },
    ],
  },
  '/checkout': {
    label: 'Checkout',
    blocks: [
      { h: 'h-10', color: 'bg-gray-700' },
      { h: 'h-16', color: 'bg-gray-600' },
      { h: 'h-24', color: 'bg-gray-500' },
      { h: 'h-16', color: 'bg-gray-600' },
      { h: 'h-20', color: 'bg-gray-700' },
      { h: 'h-12', color: 'bg-gray-500' },
    ],
  },
  '/product': {
    label: 'Product',
    blocks: [
      { h: 'h-20', color: 'bg-gray-700' },
      { h: 'h-28', color: 'bg-gray-600' },
      { h: 'h-12', color: 'bg-gray-500' },
      { h: 'h-16', color: 'bg-gray-600' },
      { h: 'h-20', color: 'bg-gray-700' },
    ],
  },
};

const BAND_CONFIG = [
  { label: '25%', color: 'rgba(34,197,94,0.18)', textColor: 'text-green-700', borderColor: 'border-green-300', reached: 'reached25' },
  { label: '50%', color: 'rgba(250,204,21,0.18)', textColor: 'text-yellow-700', borderColor: 'border-yellow-300', reached: 'reached50' },
  { label: '75%', color: 'rgba(249,115,22,0.18)', textColor: 'text-orange-700', borderColor: 'border-orange-300', reached: 'reached75' },
  { label: '100%', color: 'rgba(239,68,68,0.18)', textColor: 'text-red-700', borderColor: 'border-red-300', reached: 'reached100' },
] as const;

function HotjarOverlay({ page }: { page: PageScrollDepthData }) {
  const sections = PAGE_SECTIONS[page.path] ?? PAGE_SECTIONS.default;
  const pageHeight = 400;

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 shadow-md">
      {/* Browser chrome */}
      <div className="flex items-center gap-2 border-b border-gray-200 bg-gray-100 px-3 py-2">
        <div className="flex gap-1.5">
          <span className="h-3 w-3 rounded-full bg-red-400" />
          <span className="h-3 w-3 rounded-full bg-amber-400" />
          <span className="h-3 w-3 rounded-full bg-green-400" />
        </div>
        <div className="flex-1 rounded bg-white px-2 py-1 text-xs text-gray-400">
          example.com{page.path}
        </div>
      </div>

      {/* Main overlay area */}
      <div className="relative bg-gray-800" style={{ height: pageHeight }}>
        {/* Page content mock (background) */}
        <div className="absolute inset-0 flex flex-col gap-2 p-4 opacity-25">
          {sections.blocks.map((block, i) => (
            <div key={i} className={`w-full rounded ${block.h} ${block.color}`} />
          ))}
        </div>

        {/* Scroll depth bands */}
        {BAND_CONFIG.map((band, idx) => {
          const pct = page[band.reached as keyof PageScrollDepthData] as number;
          const topPct = idx * 25;
          const heightPct = 25;
          return (
            <div
              key={band.label}
              className="absolute left-0 right-0 transition-opacity"
              style={{
                top: `${topPct}%`,
                height: `${heightPct}%`,
                backgroundColor: band.color,
              }}
            >
              {/* % label on right side */}
              <div
                className={`absolute right-2 flex items-center gap-1.5 rounded px-2 py-0.5 text-xs font-semibold ${band.textColor}`}
                style={{ top: '50%', transform: 'translateY(-50%)', backgroundColor: 'rgba(255,255,255,0.85)' }}
              >
                <span className="wm-people text-xs" />
                {pct}% reached {band.label}
              </div>
            </div>
          );
        })}

        {/* Band boundary lines */}
        {[25, 50, 75].map((pct) => (
          <div
            key={pct}
            className="absolute left-0 right-0 border-t border-dashed border-white/30"
            style={{ top: `${pct}%` }}
          />
        ))}

        {/* Individual participant scroll-stop lines */}
        {HOTJAR_PARTICIPANTS.map((p) => (
          <div
            key={p.id}
            className="absolute left-0 right-0 flex items-center"
            style={{ top: `${p.stopPct}%` }}
          >
            <div
              className="h-px w-full opacity-70"
              style={{ backgroundColor: p.color }}
            />
            <div
              className="absolute left-2 rounded px-1 py-px font-mono text-[10px]"
              style={{
                backgroundColor: p.color,
                color: '#fff',
                transform: 'translateY(-50%)',
              }}
            >
              {p.id}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 border-t border-gray-200 bg-white px-4 py-2.5 text-xs text-gray-500">
        <span className="font-medium text-gray-700">Participants:</span>
        {HOTJAR_PARTICIPANTS.map((p) => (
          <span key={p.id} className="flex items-center gap-1">
            <span className="inline-block h-2 w-4 rounded-sm" style={{ backgroundColor: p.color }} />
            {p.id}
          </span>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page chip (selectable)
// ---------------------------------------------------------------------------
function PageChip({
  label,
  selected,
  onToggle,
  onRemove,
  isCustom,
}: {
  label: string;
  selected: boolean;
  onToggle: () => void;
  onRemove?: () => void;
  isCustom?: boolean;
}) {
  return (
    <span
      className={`inline-flex cursor-pointer items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition select-none ${
        selected
          ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
          : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
      }`}
      onClick={onToggle}
      role="checkbox"
      aria-checked={selected}
      tabIndex={0}
      onKeyDown={(e: KeyboardEvent) => e.key === ' ' && onToggle()}
    >
      <span className="wm-language text-xs" aria-hidden="true" />
      {label}
      {isCustom && onRemove && (
        <button
          type="button"
          aria-label={`Remove ${label}`}
          className="ml-0.5 text-gray-400 hover:text-red-500"
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
        >
          <span className="wm-close text-xs" />
        </button>
      )}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Main ScrollDepthView export
// ---------------------------------------------------------------------------
export function ScrollDepthView({ allPages }: { allPages: PageScrollDepthData[] }) {
  const [selectedPaths, setSelectedPaths] = useState<string[]>(allPages.map((p) => p.path));
  const [customPages, setCustomPages] = useState<PageScrollDepthData[]>([]);
  const [addInput, setAddInput] = useState('');
  const [viewMode, setViewMode] = useState<'chart' | 'overlay'>('chart');
  const inputRef = useRef<HTMLInputElement>(null);

  const allAvailable = [...allPages, ...customPages];
  const selectedPages = allAvailable.filter((p) => selectedPaths.includes(p.path));
  const singlePage = selectedPages.length === 1 ? selectedPages[0] : null;

  function togglePage(path: string) {
    setSelectedPaths((prev) =>
      prev.includes(path) ? prev.filter((p) => p !== path) : [...prev, path]
    );
  }

  function handleAddPage() {
    const raw = addInput.trim();
    if (!raw) return;
    const path = raw.startsWith('/') ? raw : `/${raw}`;
    if (allAvailable.some((p) => p.path === path)) {
      setSelectedPaths((prev) => (prev.includes(path) ? prev : [...prev, path]));
      setAddInput('');
      return;
    }
    const newPage: PageScrollDepthData = {
      path,
      label: path,
      avgScrollDepth: 0,
      reached25: 0,
      reached50: 0,
      reached75: 0,
      reached100: 0,
    };
    setCustomPages((prev) => [...prev, newPage]);
    setSelectedPaths((prev) => [...prev, path]);
    setAddInput('');
  }

  function handleRemoveCustom(path: string) {
    setCustomPages((prev) => prev.filter((p) => p.path !== path));
    setSelectedPaths((prev) => prev.filter((p) => p !== path));
  }

  return (
    <div className="space-y-4">
      {/* Page picker */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
          Pages / Steps to analyse
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {allAvailable.map((p) => (
            <PageChip
              key={p.path}
              label={p.label}
              selected={selectedPaths.includes(p.path)}
              onToggle={() => togglePage(p.path)}
              isCustom={customPages.some((c) => c.path === p.path)}
              onRemove={() => handleRemoveCustom(p.path)}
            />
          ))}

          {/* Add input */}
          <div className="flex items-center gap-1.5 rounded-full border border-dashed border-gray-300 bg-gray-50 pl-2.5 pr-1 py-0.5">
            <span className="wm-add text-xs text-gray-400" aria-hidden="true" />
            <input
              ref={inputRef}
              type="text"
              value={addInput}
              onChange={(e) => setAddInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddPage()}
              placeholder="Add page…"
              className="w-24 bg-transparent text-xs text-gray-600 placeholder-gray-400 outline-none"
            />
            <button
              type="button"
              onClick={handleAddPage}
              disabled={!addInput.trim()}
              className="rounded-full bg-indigo-600 px-2 py-0.5 text-xs font-medium text-white disabled:opacity-40 hover:bg-indigo-700 transition"
            >
              Add
            </button>
          </div>
        </div>
      </div>

      {/* Chart header with view toggle */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-gray-800">Scroll Depth by Page</p>
          <p className="text-xs text-gray-500">
            {selectedPages.length === 0
              ? 'Select at least one page above'
              : `Showing ${selectedPages.length} page${selectedPages.length === 1 ? '' : 's'} · Average scroll depth %`}
          </p>
        </div>

        {/* Toggle — only when one page selected */}
        {singlePage && (
          <div className="flex shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-white text-xs font-medium shadow-sm">
            <button
              type="button"
              onClick={() => setViewMode('chart')}
              className={`flex items-center gap-1.5 px-3 py-1.5 transition ${
                viewMode === 'chart'
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="wm-bar-chart text-sm" aria-hidden="true" />
              Chart
            </button>
            <button
              type="button"
              onClick={() => setViewMode('overlay')}
              className={`flex items-center gap-1.5 border-l border-gray-200 px-3 py-1.5 transition ${
                viewMode === 'overlay'
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="wm-layers text-sm" aria-hidden="true" />
              Page Overlay
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      {selectedPages.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 py-12 text-center">
          <span className="wm-layers text-3xl text-gray-300" aria-hidden="true" />
          <p className="mt-2 text-sm text-gray-400">Select pages above to visualise scroll depth</p>
        </div>
      ) : singlePage && viewMode === 'overlay' ? (
        <HotjarOverlay page={singlePage} />
      ) : (
        <>
          <ScrollDepthBarChart pages={selectedPages} />

          {/* Reach breakdown cards */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {selectedPages.length === 1 && singlePage ? (
              <>
                {([
                  { label: 'Reached 25%', val: singlePage.reached25, bg: 'bg-green-50', text: 'text-green-700' },
                  { label: 'Reached 50%', val: singlePage.reached50, bg: 'bg-yellow-50', text: 'text-yellow-700' },
                  { label: 'Reached 75%', val: singlePage.reached75, bg: 'bg-orange-50', text: 'text-orange-700' },
                  { label: 'Reached 100%', val: singlePage.reached100, bg: 'bg-red-50', text: 'text-red-700' },
                ] as const).map(({ label, val, bg, text }) => (
                  <div key={label} className={`rounded-lg border border-gray-200 ${bg} p-3 text-center`}>
                    <p className={`text-lg font-bold ${text}`}>{val}%</p>
                    <p className="text-xs text-gray-500">{label}</p>
                  </div>
                ))}
              </>
            ) : (
              selectedPages.slice(0, 4).map((p) => (
                <div key={p.path} className="rounded-lg border border-gray-200 bg-white p-3 text-center shadow-sm">
                  <p className="text-lg font-bold text-indigo-600">{p.avgScrollDepth}%</p>
                  <p className="truncate text-xs text-gray-500">{p.label}</p>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
