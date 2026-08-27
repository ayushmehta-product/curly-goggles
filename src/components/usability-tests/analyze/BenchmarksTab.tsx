'use client';

import { RadialRing, SectionShell } from './charts';
import type { UsabilityAnalytics } from '@/data/mock-usability-analytics';

export function BenchmarksTab({ data }: { data: UsabilityAnalytics }) {
  const { yourSusScore, industryAverage, percentile, industryLabel } = data.benchmark;

  const diff = yourSusScore - industryAverage;
  const isAbove = diff >= 0;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex flex-col items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 p-5">
          <RadialRing score={yourSusScore} size={110} label="/100" />
          <p className="text-sm font-semibold text-blue-900">Your SUS Score</p>
          <p className="text-xs text-blue-700">{industryLabel}</p>
        </div>
        <div className="flex flex-col items-center gap-2 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <RadialRing score={industryAverage} size={110} label="/100" />
          <p className="text-sm font-semibold text-gray-800">Industry Average</p>
          <p className="text-xs text-gray-500">{industryLabel}</p>
        </div>
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Percentile</p>
          <p className="text-5xl font-bold text-gray-900">{percentile}th</p>
          <p className="text-center text-xs text-gray-500">
            Your test ranks higher than <strong>{percentile}%</strong> of similar tests in {industryLabel}.
          </p>
        </div>
      </div>

      <SectionShell title="Score Comparison">
        <div className="flex items-center gap-3">
          <div className="flex-1 rounded-full bg-gray-100" style={{ height: 16 }}>
            <div
              className="h-full rounded-full bg-blue-600 transition-all"
              style={{ width: `${yourSusScore}%` }}
            />
          </div>
          <span className="w-16 text-right text-sm font-semibold text-gray-900">{yourSusScore} you</span>
        </div>
        <div className="mt-3 flex items-center gap-3">
          <div className="flex-1 rounded-full bg-gray-100" style={{ height: 16 }}>
            <div
              className="h-full rounded-full bg-gray-400 transition-all"
              style={{ width: `${industryAverage}%` }}
            />
          </div>
          <span className="w-16 text-right text-sm font-semibold text-gray-500">{industryAverage} avg</span>
        </div>
        <p className={`mt-4 text-sm font-medium ${isAbove ? 'text-green-700' : 'text-amber-700'}`}>
          {isAbove
            ? `Your score is ${diff.toFixed(1)} points above the ${industryLabel} average.`
            : `Your score is ${Math.abs(diff).toFixed(1)} points below the ${industryLabel} average.`}
        </p>
      </SectionShell>

      <SectionShell title="Benchmark Interpretation">
        <div className="grid gap-3 md:grid-cols-2">
          {[
            { range: '85–100', label: 'Excellent', desc: 'Exceeds expectations. Users find the experience highly intuitive.', color: 'border-green-200 bg-green-50' },
            { range: '68–84', label: 'Good', desc: 'Above average. Minor friction points are worth investigating.', color: 'border-blue-200 bg-blue-50' },
            { range: '51–67', label: 'OK', desc: 'Below average. Usability improvements should be prioritised.', color: 'border-amber-200 bg-amber-50' },
            { range: '0–50', label: 'Poor', desc: 'Significant usability issues. Major redesign is recommended.', color: 'border-red-200 bg-red-50' },
          ].map((b) => (
            <div
              key={b.range}
              className={`rounded-lg border p-3 ${b.color} ${yourSusScore >= parseInt(b.range) ? 'ring-2 ring-blue-400 ring-offset-1' : ''}`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-gray-900">{b.label}</span>
                <span className="text-xs text-gray-500">{b.range}</span>
              </div>
              <p className="mt-1 text-xs text-gray-600">{b.desc}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-gray-400">
          SUS ranges and industry data sourced from the Nielsen Norman Group SUS research database. Benchmark scores represent the 50th percentile for each vertical.
        </p>
      </SectionShell>
    </div>
  );
}
