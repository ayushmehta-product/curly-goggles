'use client';

import type { ReactNode } from 'react';
import dynamic from 'next/dynamic';

const WuCard = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuCard })),
  { ssr: false }
);

export interface StudyStat {
  label: string;
  value: ReactNode;
  helper?: string;
  icon: string;
}

interface StudyStatsProps {
  stats: StudyStat[];
}

export function StudyStats({ stats }: StudyStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 mb-5">
      {stats.map((stat) => (
        <WuCard key={stat.label} rounded className="border border-gray-200 bg-white p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-gray-500">{stat.label}</p>
              <div className="mt-1 text-2xl font-semibold text-gray-900">{stat.value}</div>
              {stat.helper && <p className="mt-1 text-xs text-gray-500">{stat.helper}</p>}
            </div>
            <span className={`${stat.icon} text-xl text-gray-400 mt-0.5`} />
          </div>
        </WuCard>
      ))}
    </div>
  );
}
