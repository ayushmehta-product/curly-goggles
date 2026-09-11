'use client';

import type { ReactNode } from 'react';
import dynamic from 'next/dynamic';

const WuCard = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuCard })),
  { ssr: false }
);

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

  const color = score >= 85 ? '#1B3380' : score >= 68 ? '#1B87E6' : score >= 51 ? '#F5A300' : '#C45656';

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-label={`Score ${score}`}>
        <circle cx={cx} cy={cx} r={r} fill="none" stroke="#EEEEEE" strokeWidth={12} />
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
          <text x={cx} y={cx + 16} textAnchor="middle" fontSize={10} fill="#9B9B9B" dominantBaseline="middle">
            {label}
          </text>
        )}
      </svg>
    </div>
  );
}

export function HeatmapMock({ path = '/', label = 'Home' }: { path?: string; label?: string }) {
  const href = path === '/' ? 'example.com' : `example.com${path}`;

  return (
    <WuCard rounded className="overflow-hidden p-0 wu-shadow-sm">
      <div className="flex items-center gap-2 border-b border-line bg-[var(--qp-gray-20)] px-3 py-2">
        <div className="flex gap-1.5">
          <span className="h-3 w-3 rounded-full bg-[#FFBABA]" />
          <span className="h-3 w-3 rounded-full bg-[#FEEFB3]" />
          <span className="h-3 w-3 rounded-full bg-[#DFF2BF]" />
        </div>
        <div className="flex-1 rounded bg-surface px-2 py-1 text-xs text-ink-muted">{href}</div>
        <span className="text-xs text-ink-muted">{label}</span>
      </div>
      <div className="relative h-52 bg-ink">
        <div className="absolute inset-0 flex flex-col gap-2 p-4 opacity-30">
          <div className="h-8 w-full rounded bg-white" />
          <div className="grid grid-cols-3 gap-2">
            <div className="h-24 rounded bg-white" />
            <div className="h-24 rounded bg-white" />
            <div className="h-24 rounded bg-white" />
          </div>
          <div className="h-6 w-2/3 rounded bg-white" />
          <div className="h-4 w-1/2 rounded bg-white" />
        </div>
        <div
          className="absolute"
          style={{
            top: '28%',
            left: '25%',
            width: 120,
            height: 80,
            borderRadius: '50%',
            background: 'radial-gradient(ellipse, rgba(196,86,86,0.75) 0%, rgba(196,86,86,0) 70%)',
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
            background: 'radial-gradient(ellipse, rgba(245,163,0,0.65) 0%, rgba(245,163,0,0) 70%)',
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
            background: 'radial-gradient(ellipse, rgba(245,163,0,0.5) 0%, rgba(245,163,0,0) 70%)',
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
            background: 'radial-gradient(ellipse, rgba(27,135,230,0.55) 0%, rgba(27,135,230,0) 70%)',
            filter: 'blur(8px)',
          }}
        />
        <div className="absolute bottom-2 right-2 flex items-center gap-1.5 rounded bg-black/40 px-2 py-1 text-[10px] text-white">
          <span className="h-2 w-2 rounded-sm bg-accent" /> Low
          <span className="h-2 w-2 rounded-sm bg-[#F5A300]" /> Mid
          <span className="h-2 w-2 rounded-sm bg-[#C45656]" /> High
        </div>
      </div>
    </WuCard>
  );
}

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
    <section className="rounded-xl border border-line bg-surface p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-ink">{title}</h2>
          {description && <p className="mt-1 text-sm text-ink-muted">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
