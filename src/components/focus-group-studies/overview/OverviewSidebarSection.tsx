'use client';

import type { ReactNode } from 'react';
import dynamic from 'next/dynamic';

const WuCard = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuCard })),
  { ssr: false }
);
const WuCardHeader = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuCardHeader })),
  { ssr: false }
);
const WuSubtext = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuSubtext })),
  { ssr: false }
);

interface OverviewSidebarSectionProps {
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function OverviewSidebarSection({ title, children, footer }: OverviewSidebarSectionProps) {
  return (
    <WuCard rounded className="overflow-hidden border border-gray-200 bg-white p-0 shadow-sm">
      <WuCardHeader className="border-b border-gray-100 px-4 py-3">
        <WuSubtext size="sm" className="font-semibold text-gray-900">
          {title}
        </WuSubtext>
      </WuCardHeader>
      <div className="px-4 py-3">{children}</div>
      {footer && <div className="border-t border-gray-100 px-4 py-3">{footer}</div>}
    </WuCard>
  );
}

interface SidebarDetailRowProps {
  label: string;
  value: ReactNode;
  action?: ReactNode;
}

export function SidebarDetailRow({ label, value, action }: SidebarDetailRowProps) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-1.5">
      <span className="shrink-0 text-sm text-gray-500">{label}</span>
      <span className="flex items-center gap-2 text-right text-sm font-medium text-gray-900">
        {value}
        {action}
      </span>
    </div>
  );
}

export function ProgressBar({ ratio, tone = 'blue' }: { ratio: number; tone?: 'blue' | 'green' }) {
  const toneStyles = { blue: 'bg-blue-500', green: 'bg-green-500' };
  const percent = Math.min(100, Math.max(0, Math.round(ratio * 100)));

  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
      <div className={`h-full rounded-full ${toneStyles[tone]} transition-all`} style={{ width: `${percent}%` }} />
    </div>
  );
}
