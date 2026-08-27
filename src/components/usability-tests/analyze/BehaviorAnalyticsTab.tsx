'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import type { IWuTabItem } from '@npm-questionpro/wick-ui-lib';
import { StatCard, HeatmapMock, SankeyDiagram, SectionShell } from './charts';
import type { UsabilityAnalytics } from '@/data/mock-usability-analytics';

const SessionActivityChart = dynamic(
  () => import('./SessionActivityChart').then((m) => ({ default: m.SessionActivityChart })),
  { ssr: false }
);
const ScrollDepthView = dynamic(
  () => import('./ScrollDepthView').then((m) => ({ default: m.ScrollDepthView })),
  { ssr: false }
);

const WuChip = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuChip })),
  { ssr: false }
);
const WuTab = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuTab })),
  { ssr: false }
);

type SubTab = 'overview' | 'heatmaps' | 'scroll-depth' | 'session-replays' | 'click-paths' | 'rage-misclicks';

const SUB_TABS: { value: SubTab; label: string }[] = [
  { value: 'overview', label: 'Overview' },
  { value: 'heatmaps', label: 'Heatmaps' },
  { value: 'scroll-depth', label: 'Scroll Depth' },
  { value: 'session-replays', label: 'Session Replays' },
  { value: 'click-paths', label: 'Click Paths' },
  { value: 'rage-misclicks', label: 'Rage & Misclicks' },
];

const PAGE_OPTIONS = [
  { value: '/', label: '/ (Home)' },
  { value: '/checkout', label: '/checkout' },
  { value: '/product', label: '/product' },
];

function OverviewSub({ data }: { data: UsabilityAnalytics }) {
  const b = data.behavior;
  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
        <strong>Behaviour tracking is active.</strong> Data below is aggregated from {b.participantsTracked} participants across all sessions.
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Participants tracked" value={b.participantsTracked} icon="wm-people" accent="blue" />
        <StatCard label="Avg time on task" value={b.avgTimeOnTask} icon="wm-timer" accent="blue" />
        <StatCard label="Task success rate" value={b.taskSuccessRate} icon="wm-check-circle" accent="green" />
        <StatCard label="Avg scroll depth" value={b.avgScrollDepth} icon="wm-swap-vert" accent="blue" />
        <StatCard label="Rage click events" value={b.rageClickEvents} icon="wm-touch-app" accent={b.rageClickEvents > 5 ? 'red' : 'amber'} />
        <StatCard label="Misclick rate" value={b.misclickRate} icon="wm-warning" accent="amber" />
      </div>

      <SectionShell title="Session Activity" description="Clicks and scrolls per time segment across all sessions.">
        <SessionActivityChart data={data.engagementSeries} />
      </SectionShell>
    </div>
  );
}

function HeatmapsSub() {
  const [selectedPage, setSelectedPage] = useState(PAGE_OPTIONS[0]);
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <p className="text-sm font-medium text-gray-700">Page</p>
        <div className="flex flex-wrap gap-2">
          {PAGE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setSelectedPage(opt)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                selectedPage.value === opt.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
      <HeatmapMock title={selectedPage.value.replace('/', '') || 'home'} />
      <p className="text-xs text-gray-500">
        Heatmap aggregated from 24 sessions. Red/yellow zones indicate high-click density; blue zones are low-engagement areas.
      </p>
    </div>
  );
}

function ScrollDepthSub({ data }: { data: UsabilityAnalytics }) {
  return <ScrollDepthView allPages={data.pageScrollDepth} />;
}

function SessionReplaysSub({ data }: { data: UsabilityAnalytics }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {data.replays.map((r) => (
        <div key={r.id} className="group relative rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          {/* Thumbnail mock */}
          <div className="relative h-32 bg-gradient-to-br from-gray-700 to-gray-900">
            <div className="absolute inset-0 flex flex-col gap-2 p-4 opacity-20">
              <div className="h-4 w-full rounded bg-gray-400" />
              <div className="h-12 w-full rounded bg-gray-500" />
              <div className="h-4 w-2/3 rounded bg-gray-400" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-gray-800 shadow-md transition hover:scale-105"
                aria-label={`Play session for ${r.anonymousId}`}
              >
                <span className="wm-play-arrow text-xl" />
              </button>
            </div>
            {/* Progress bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
              <div className="h-full bg-blue-400" style={{ width: `${r.progressPct}%` }} />
            </div>
          </div>
          <div className="p-3">
            <div className="flex items-start justify-between gap-2">
              <p className="font-mono text-sm font-medium text-gray-800">{r.anonymousId}</p>
              <span className="shrink-0 rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs text-gray-500">{r.device}</span>
            </div>
            <p className="mt-1 text-xs text-gray-500">{r.duration}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {r.misclicks > 0 && (
                <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${r.misclicks > 2 ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}>
                  {r.misclicks} misclick{r.misclicks === 1 ? '' : 's'}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ClickPathsSub() {
  return (
    <div className="space-y-4">
      <SankeyDiagram />
      <div className="flex gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-blue-200" /> Continued
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-red-200" /> Dropped
        </span>
      </div>
      <p className="text-xs text-gray-500">
        Each node shows how many participants reached that screen. Dashed drop-off edges indicate exits before completing the task.
      </p>
    </div>
  );
}

function RageMisclicksSub({ data }: { data: UsabilityAnalytics }) {
  const severityChip = (severity: string) => {
    if (severity === 'High') return <span className="inline-flex rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700">High</span>;
    if (severity === 'Medium') return <span className="inline-flex rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">Medium</span>;
    return <WuChip variant="secondary" size="sm">Low</WuChip>;
  };

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-2.5 text-sm text-red-800">
        Screens with high rage-click counts are strong signals of user frustration. Investigate these pages first.
      </div>
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              {['Screen', 'Rage clicks', 'Misclick rate', 'Dead clicks', 'Severity'].map((h) => (
                <th key={h} className="px-4 py-2.5 text-left text-xs font-medium text-gray-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {data.rageMisclicks.map((row) => (
              <tr key={row.screen} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-800">{row.screen}</td>
                <td className={`px-4 py-3 font-semibold ${row.rageClicks > 3 ? 'text-red-600' : 'text-gray-700'}`}>
                  {row.rageClicks}
                </td>
                <td className="px-4 py-3 text-gray-700">{row.misclickRate}</td>
                <td className="px-4 py-3 text-gray-700">{row.deadClicks}</td>
                <td className="px-4 py-3">{severityChip(row.severity)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function BehaviorAnalyticsTab({ data }: { data: UsabilityAnalytics }) {
  const [subTab, setSubTab] = useState<SubTab>('overview');

  const subTabItems: IWuTabItem[] = SUB_TABS.map((tab) => ({
    value: tab.value,
    Trigger: tab.label,
    Content: <span className="sr-only">{tab.label} selected</span>,
  }));

  return (
    <div className="space-y-4">
      <WuTab
        items={subTabItems}
        value={subTab}
        onValueChange={(v) => setSubTab(v as SubTab)}
      />

      {subTab === 'overview' && <OverviewSub data={data} />}
      {subTab === 'heatmaps' && <HeatmapsSub />}
      {subTab === 'scroll-depth' && <ScrollDepthSub data={data} />}
      {subTab === 'session-replays' && <SessionReplaysSub data={data} />}
      {subTab === 'click-paths' && <ClickPathsSub />}
      {subTab === 'rage-misclicks' && <RageMisclicksSub data={data} />}
    </div>
  );
}
