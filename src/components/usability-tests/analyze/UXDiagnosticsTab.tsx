'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import type { IWuTabItem } from '@npm-questionpro/wick-ui-lib';
import { RadialRing, SectionShell } from './charts';
import type { UsabilityAnalytics } from '@/data/mock-usability-analytics';

const WuTab = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuTab })),
  { ssr: false }
);

type DiagSubTab = 'sus' | 'nps' | 'task-usability' | 'task-completion' | 'task-duration' | 'emotions';

const DIAG_TABS: { value: DiagSubTab; label: string }[] = [
  { value: 'sus', label: 'SUS' },
  { value: 'nps', label: 'NPS' },
  { value: 'task-usability', label: 'Task Usability' },
  { value: 'task-completion', label: 'Task Completion' },
  { value: 'task-duration', label: 'Task Duration' },
  { value: 'emotions', label: 'Emotions' },
];

function SUSPanel({ data }: { data: UsabilityAnalytics }) {
  const { susScore, susScores } = data.diagnostics;

  const grade =
    susScore >= 85 ? { label: 'Excellent', color: 'text-green-700', bg: 'bg-green-50' }
    : susScore >= 68 ? { label: 'Good', color: 'text-blue-700', bg: 'bg-blue-50' }
    : susScore >= 51 ? { label: 'OK', color: 'text-amber-700', bg: 'bg-amber-50' }
    : { label: 'Poor', color: 'text-red-700', bg: 'bg-red-50' };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-6">
        <RadialRing score={susScore} size={130} label="/100" />
        <div className="space-y-2">
          <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${grade.bg} ${grade.color}`}>
            {grade.label}
          </span>
          <p className="text-sm text-gray-700">
            A SUS score of <strong>{susScore}</strong> falls in the <strong>&ldquo;{grade.label}&rdquo;</strong> range.
            Scores above 68 are generally considered acceptable. The industry average for software is 68.
          </p>
          <p className="text-xs text-gray-500">Based on {susScores.length} completed sessions.</p>
        </div>
      </div>

      <SectionShell title="Per-Participant Deviation">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {['Participant', 'SUS Score', 'Deviation from mean'].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left text-xs font-medium text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {susScores.map((row) => (
                <tr key={row.anonymousId} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-gray-700">{row.anonymousId}</td>
                  <td className="px-4 py-3 font-semibold text-gray-900">{row.score}</td>
                  <td className={`px-4 py-3 font-medium ${row.deviation.startsWith('+') ? 'text-green-700' : 'text-red-600'}`}>
                    {row.deviation}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionShell>
    </div>
  );
}

function SimpleStatPanel({
  value,
  label,
  description,
  interpretation,
  icon,
}: {
  value: string | number;
  label: string;
  description: string;
  interpretation: string;
  icon: string;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-5">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-blue-50">
          <span className={`${icon} text-3xl text-blue-600`} />
        </div>
        <div>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          <p className="mt-0.5 text-sm text-gray-500">{label}</p>
        </div>
      </div>
      <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-700">
        <p className="font-medium text-gray-900">{description}</p>
        <p className="mt-1 text-gray-600">{interpretation}</p>
      </div>
    </div>
  );
}

const EMOTION_DATA = [
  { label: 'Confident', pct: 38, color: '#22C55E' },
  { label: 'Neutral', pct: 30, color: '#9CA3AF' },
  { label: 'Confused', pct: 20, color: '#F59E0B' },
  { label: 'Frustrated', pct: 12, color: '#EF4444' },
];

function EmotionsPanel({ data }: { data: UsabilityAnalytics }) {
  const { positiveSentimentPct } = data.diagnostics;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <p className="text-2xl font-bold text-green-600">{positiveSentimentPct}</p>
        <p className="text-sm text-gray-600">positive sentiment across all sessions</p>
      </div>
      <div className="space-y-3">
        {EMOTION_DATA.map((e) => (
          <div key={e.label} className="flex items-center gap-3">
            <span className="w-24 shrink-0 text-sm text-gray-700">{e.label}</span>
            <div className="flex-1 overflow-hidden rounded-full bg-gray-100" style={{ height: 10 }}>
              <div className="h-full rounded-full transition-all" style={{ width: `${e.pct}%`, backgroundColor: e.color }} />
            </div>
            <span className="w-10 text-right text-xs font-medium text-gray-500">{e.pct}%</span>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-500">
        Emotion data is inferred from response tone in post-session surveys. Ranges are indicative and should be combined with qualitative findings.
      </p>
    </div>
  );
}

export function UXDiagnosticsTab({ data }: { data: UsabilityAnalytics }) {
  const [subTab, setSubTab] = useState<DiagSubTab>('sus');
  const d = data.diagnostics;

  const subTabItems: IWuTabItem[] = DIAG_TABS.map((tab) => ({
    value: tab.value,
    Trigger: tab.label,
    Content: <span className="sr-only">{tab.label} selected</span>,
  }));

  return (
    <div className="space-y-4">
      <WuTab
        items={subTabItems}
        value={subTab}
        onValueChange={(v) => setSubTab(v as DiagSubTab)}
      />

      <div className="rounded-xl border border-gray-200 bg-white p-5">
        {subTab === 'sus' && <SUSPanel data={data} />}
        {subTab === 'nps' && (
          <SimpleStatPanel
            value={d.nps}
            label="Net Promoter Score"
            description="NPS measures participant willingness to recommend the tested experience."
            interpretation={`A score of ${d.nps} is considered ${d.nps >= 50 ? 'excellent' : d.nps >= 30 ? 'good' : d.nps >= 0 ? 'acceptable' : 'needs improvement'}. Detractors in post-session comments cited confusion in the checkout area.`}
            icon="wm-thumb-up"
          />
        )}
        {subTab === 'task-usability' && (
          <SimpleStatPanel
            value={d.taskUsabilityRating}
            label="Task Usability Rating"
            description="Average self-reported ease of completing the task (1–5 Likert scale)."
            interpretation="Participants found the task moderately easy. Scores below 4 suggest the task flow needs simplification; focus on the Checkout screen where rage clicks are highest."
            icon="wm-star"
          />
        )}
        {subTab === 'task-completion' && (
          <SimpleStatPanel
            value={d.taskCompletionRate}
            label="Task Completion Rate"
            description="Percentage of participants who fully completed the assigned task."
            interpretation={`${d.taskCompletionRate} of participants reached the success state. Incomplete sessions most commonly dropped off at the Checkout screen — investigate in Click Paths.`}
            icon="wm-check-circle"
          />
        )}
        {subTab === 'task-duration' && (
          <SimpleStatPanel
            value={d.taskDurationMedian}
            label="Median Task Duration"
            description="Median time for participants who completed the task."
            interpretation="The median completion time suggests the flow is roughly meeting the 3-minute target. Outlier sessions over 4 minutes typically encountered rage clicks on the Checkout screen."
            icon="wm-timer"
          />
        )}
        {subTab === 'emotions' && <EmotionsPanel data={data} />}
      </div>
    </div>
  );
}
