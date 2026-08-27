'use client';

import type { ReactNode } from 'react';
import type { EngagementPoint, ScrollDepthBand } from '@/data/mock-usability-analytics';

// ---------------------------------------------------------------------------
// StatCard
// ---------------------------------------------------------------------------
export function StatCard({
  label,
  value,
  icon,
  sub,
  accent,
}: {
  label: string;
  value: string | number;
  icon?: string;
  sub?: string;
  accent?: 'red' | 'amber' | 'blue' | 'green';
}) {
  const accentColor = {
    red: 'text-red-600',
    amber: 'text-amber-600',
    blue: 'text-blue-600',
    green: 'text-green-600',
  }[accent ?? 'blue'];

  return (
    <div className="flex flex-col rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium text-gray-500">{label}</p>
        {icon && <span className={`${icon} text-lg text-gray-300`} />}
      </div>
      <p className={`mt-2 text-2xl font-semibold ${accentColor}`}>{value}</p>
      {sub && <p className="mt-0.5 text-xs text-gray-400">{sub}</p>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// BarChartSvg  –  simple horizontal bar chart
// ---------------------------------------------------------------------------
export function BarChartSvg({
  series,
  height = 140,
}: {
  series: { label: string; clicks: number; scrolls: number }[];
  height?: number;
}) {
  const max = Math.max(...series.flatMap((d) => [d.clicks, d.scrolls]), 1);
  const W = 560;
  const PAD = { top: 8, right: 16, bottom: 28, left: 32 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = height - PAD.top - PAD.bottom;
  const barW = (chartW / series.length) * 0.35;
  const gap = (chartW / series.length) * 0.08;

  return (
    <svg viewBox={`0 0 ${W} ${height}`} className="w-full" aria-label="Engagement over time">
      <defs>
        <linearGradient id="grad-clicks" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#2563EB" />
        </linearGradient>
        <linearGradient id="grad-scrolls" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#A5B4FC" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#818CF8" />
        </linearGradient>
      </defs>

      {/* Grid */}
      {[0, 0.25, 0.5, 0.75, 1].map((f) => {
        const y = PAD.top + chartH * (1 - f);
        return (
          <line key={f} x1={PAD.left} x2={W - PAD.right} y1={y} y2={y} stroke="#F3F4F6" strokeWidth={1} />
        );
      })}

      {/* Bars */}
      {series.map((d, i) => {
        const slotW = chartW / series.length;
        const x = PAD.left + i * slotW + slotW * 0.15;
        const clickH = (d.clicks / max) * chartH;
        const scrollH = (d.scrolls / max) * chartH;

        return (
          <g key={d.label}>
            <rect
              x={x}
              y={PAD.top + chartH - clickH}
              width={barW}
              height={clickH}
              rx={2}
              fill="url(#grad-clicks)"
            />
            <rect
              x={x + barW + gap}
              y={PAD.top + chartH - scrollH}
              width={barW}
              height={scrollH}
              rx={2}
              fill="url(#grad-scrolls)"
            />
            <text x={x + barW} y={height - 6} textAnchor="middle" fontSize={10} fill="#9CA3AF">
              {d.label}
            </text>
          </g>
        );
      })}

      {/* Y-axis tick */}
      <text x={PAD.left - 4} y={PAD.top + 4} textAnchor="end" fontSize={10} fill="#9CA3AF" dominantBaseline="hanging">
        {max}
      </text>
    </svg>
  );
}

// ---------------------------------------------------------------------------
// AreaChartSvg  –  simple scroll-depth area chart
// ---------------------------------------------------------------------------
export function AreaChartSvg({
  bands,
  height = 120,
}: {
  bands: ScrollDepthBand[];
  height?: number;
}) {
  const W = 560;
  const PAD = { top: 12, right: 16, bottom: 28, left: 44 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = height - PAD.top - PAD.bottom;
  const n = bands.length;

  const pts = bands.map((b, i) => {
    const x = PAD.left + (i / (n - 1)) * chartW;
    const y = PAD.top + chartH - (b.pct / 100) * chartH;
    return `${x},${y}`;
  });

  const areaClose = `${PAD.left + chartW},${PAD.top + chartH} ${PAD.left},${PAD.top + chartH}`;
  const polyPts = [...pts, ...areaClose.split(' ')].join(' ');

  return (
    <svg viewBox={`0 0 ${W} ${height}`} className="w-full" aria-label="Scroll depth">
      <defs>
        <linearGradient id="grad-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6366F1" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#6366F1" stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {/* Grid */}
      {[0, 25, 50, 75, 100].map((v) => {
        const y = PAD.top + chartH - (v / 100) * chartH;
        return (
          <g key={v}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y} y2={y} stroke="#F3F4F6" strokeWidth={1} />
            <text x={PAD.left - 6} y={y} textAnchor="end" fontSize={10} fill="#9CA3AF" dominantBaseline="middle">
              {v}%
            </text>
          </g>
        );
      })}

      {/* Area */}
      <polygon points={polyPts} fill="url(#grad-area)" />

      {/* Line */}
      <polyline points={pts.join(' ')} fill="none" stroke="#6366F1" strokeWidth={2} strokeLinejoin="round" />

      {/* Dots + labels */}
      {bands.map((b, i) => {
        const x = PAD.left + (i / (n - 1)) * chartW;
        const y = PAD.top + chartH - (b.pct / 100) * chartH;
        return (
          <g key={b.band}>
            <circle cx={x} cy={y} r={4} fill="#6366F1" />
            <text x={x} y={height - 6} textAnchor="middle" fontSize={10} fill="#9CA3AF">
              {b.band}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// RadialRing  –  SUS score donut
// ---------------------------------------------------------------------------
export function RadialRing({
  score,
  max = 100,
  size = 120,
  label,
}: {
  score: number;
  max?: number;
  size?: number;
  label?: string;
}) {
  const r = (size - 20) / 2;
  const cx = size / 2;
  const circumference = 2 * Math.PI * r;
  const pct = Math.min(score / max, 1);
  const dasharray = `${pct * circumference} ${circumference}`;

  const color = score >= 85 ? '#22C55E' : score >= 68 ? '#3B82F6' : score >= 51 ? '#F59E0B' : '#EF4444';

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-label={`Score ${score}`}>
        <circle cx={cx} cy={cx} r={r} fill="none" stroke="#F3F4F6" strokeWidth={12} />
        <circle
          cx={cx}
          cy={cx}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={12}
          strokeDasharray={dasharray}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cx})`}
        />
        <text x={cx} y={cx - 2} textAnchor="middle" fontSize={20} fontWeight="700" fill={color} dominantBaseline="middle">
          {score}
        </text>
        {label && (
          <text x={cx} y={cx + 16} textAnchor="middle" fontSize={10} fill="#6B7280" dominantBaseline="middle">
            {label}
          </text>
        )}
      </svg>
    </div>
  );
}

// ---------------------------------------------------------------------------
// HeatmapMock – browser chrome with CSS gradient blobs
// ---------------------------------------------------------------------------
export function HeatmapMock({ title = 'Page 1' }: { title?: string }) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
      {/* Browser chrome */}
      <div className="flex items-center gap-2 border-b border-gray-200 bg-gray-100 px-3 py-2">
        <div className="flex gap-1.5">
          <span className="h-3 w-3 rounded-full bg-red-400" />
          <span className="h-3 w-3 rounded-full bg-amber-400" />
          <span className="h-3 w-3 rounded-full bg-green-400" />
        </div>
        <div className="flex-1 rounded bg-white px-2 py-1 text-xs text-gray-400">example.com/{title}</div>
      </div>
      {/* Heatmap canvas */}
      <div className="relative h-52 bg-gray-800">
        {/* page mock */}
        <div className="absolute inset-0 flex flex-col gap-2 p-4 opacity-30">
          <div className="h-8 w-full rounded bg-gray-600" />
          <div className="grid grid-cols-3 gap-2">
            <div className="h-24 rounded bg-gray-600" />
            <div className="h-24 rounded bg-gray-600" />
            <div className="h-24 rounded bg-gray-600" />
          </div>
          <div className="h-6 w-2/3 rounded bg-gray-600" />
          <div className="h-4 w-1/2 rounded bg-gray-600" />
        </div>
        {/* heat blobs */}
        <div
          className="absolute"
          style={{
            top: '28%',
            left: '25%',
            width: 120,
            height: 80,
            borderRadius: '50%',
            background: 'radial-gradient(ellipse, rgba(239,68,68,0.7) 0%, rgba(239,68,68,0) 70%)',
            filter: 'blur(8px)',
          }}
        />
        <div
          className="absolute"
          style={{
            top: '15%',
            left: '55%',
            width: 90,
            height: 60,
            borderRadius: '50%',
            background: 'radial-gradient(ellipse, rgba(234,179,8,0.6) 0%, rgba(234,179,8,0) 70%)',
            filter: 'blur(6px)',
          }}
        />
        <div
          className="absolute"
          style={{
            top: '50%',
            left: '45%',
            width: 70,
            height: 50,
            borderRadius: '50%',
            background: 'radial-gradient(ellipse, rgba(234,179,8,0.5) 0%, rgba(234,179,8,0) 70%)',
            filter: 'blur(6px)',
          }}
        />
        <div
          className="absolute"
          style={{
            top: '60%',
            left: '10%',
            width: 60,
            height: 40,
            borderRadius: '50%',
            background: 'radial-gradient(ellipse, rgba(59,130,246,0.5) 0%, rgba(59,130,246,0) 70%)',
            filter: 'blur(8px)',
          }}
        />
        {/* Legend */}
        <div className="absolute bottom-2 right-2 flex items-center gap-1.5 rounded bg-black/40 px-2 py-1 text-[10px] text-white">
          <span className="h-2 w-2 rounded-sm bg-blue-400" /> Low
          <span className="h-2 w-2 rounded-sm bg-yellow-400" /> Mid
          <span className="h-2 w-2 rounded-sm bg-red-500" /> High
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SankeyDiagram  –  SVG click-path flow
// ---------------------------------------------------------------------------
export function SankeyDiagram() {
  const stages = [
    { label: 'Landing', count: 40, x: 60, color: '#3B82F6' },
    { label: 'Search', count: 32, x: 220, color: '#6366F1' },
    { label: 'Product', count: 26, x: 380, color: '#8B5CF6' },
    { label: 'Checkout', count: 18, x: 540, color: '#22C55E' },
  ];
  const W = 620;
  const H = 160;
  const bw = 60;
  const midY = H / 2;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" aria-label="Click path diagram">
      {/* Edges */}
      {stages.slice(0, -1).map((s, i) => {
        const nx = stages[i + 1];
        const continued = stages[i + 1].count;
        const dropped = s.count - continued;
        return (
          <g key={s.label}>
            {/* Continued */}
            <path
              d={`M ${s.x + bw},${midY} C ${s.x + bw + 50},${midY} ${nx.x - 10},${midY} ${nx.x},${midY}`}
              fill="none"
              stroke="#BFDBFE"
              strokeWidth={Math.max(2, (continued / 40) * 16)}
              strokeLinecap="round"
            />
            {/* Dropped */}
            <path
              d={`M ${s.x + bw},${midY + 8} Q ${s.x + bw + 60},${midY + 40} ${s.x + bw + 30},${midY + 55}`}
              fill="none"
              stroke="#FCA5A5"
              strokeWidth={Math.max(1, (dropped / 40) * 10)}
              strokeLinecap="round"
              strokeDasharray="4 3"
            />
            <text x={s.x + bw + 18} y={midY + 52} fontSize={10} fill="#9CA3AF">{dropped} dropped</text>
          </g>
        );
      })}

      {/* Nodes */}
      {stages.map((s) => {
        const barH = Math.max(12, (s.count / 40) * 50);
        return (
          <g key={s.label}>
            <rect x={s.x} y={midY - barH / 2} width={bw} height={barH} rx={6} fill={s.color} fillOpacity={0.85} />
            <text x={s.x + bw / 2} y={midY - barH / 2 - 6} textAnchor="middle" fontSize={10} fontWeight="600" fill="#374151">
              {s.label}
            </text>
            <text x={s.x + bw / 2} y={midY} textAnchor="middle" fontSize={12} fontWeight="700" fill="white" dominantBaseline="middle">
              {s.count}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// SectionShell
// ---------------------------------------------------------------------------
export function SectionShell({
  title,
  description,
  children,
  action,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-gray-900">{title}</h2>
          {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
