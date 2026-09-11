'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import type { IWuTabItem } from '@npm-questionpro/wick-ui-lib';
import { UsabilityTestWorkspaceTabs } from '@/components/usability-tests/UsabilityTestWorkspaceTabs';
import { BehaviorAnalyticsTab } from '@/components/usability-tests/analyze/BehaviorAnalyticsTab';
import { UXDiagnosticsTab } from '@/components/usability-tests/analyze/UXDiagnosticsTab';
import { BenchmarksTab } from '@/components/usability-tests/analyze/BenchmarksTab';
import { EmptyState } from '@/components/ui/EmptyState';
import { WuTabPlaceholder } from '@/components/ui/WuTabPlaceholder';
import { MOCK_USABILITY_TESTS } from '@/data/mock-usability-tests';
import { MOCK_USABILITY_ANALYTICS } from '@/data/mock-usability-analytics';
import { formatDate } from '@/data/mock-utils';
import { routeId } from '@/data/route-id';

const WuTab = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuTab })),
  { ssr: false }
);

type AnalyzeTab = 'behavior' | 'diagnostics' | 'benchmarks';

export default function UsabilityTestAnalyzePage() {
  const id = routeId(useParams<{ id: string }>().id);
  const [activeTab, setActiveTab] = useState<AnalyzeTab>('behavior');

  const test = MOCK_USABILITY_TESTS.find((t) => t.id === id);
  const analytics = { ...MOCK_USABILITY_ANALYTICS, testId: id };

  if (!test) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <EmptyState
          icon="wm-error-outline"
          title="Usability test not found"
          action={<Link href="/usability-tests" className="text-sm font-medium text-blue-600 hover:underline">Back to usability tests</Link>}
        />
      </div>
    );
  }

  const tabItems: IWuTabItem[] = [
    {
      value: 'behavior',
      Trigger: (
        <span className="flex items-center gap-1.5">
          Behavior analytics
          <span className="rounded-full bg-blue-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">New</span>
        </span>
      ),
      Content: activeTab === 'behavior'
        ? <div className="pt-4"><BehaviorAnalyticsTab data={analytics} /></div>
        : <WuTabPlaceholder label="Behavior analytics" />,
    },
    {
      value: 'diagnostics',
      Trigger: 'UX diagnostics',
      Content: activeTab === 'diagnostics'
        ? <div className="pt-4"><UXDiagnosticsTab data={analytics} /></div>
        : <WuTabPlaceholder label="UX diagnostics" />,
    },
    {
      value: 'benchmarks',
      Trigger: 'Benchmarks',
      Content: activeTab === 'benchmarks'
        ? <div className="pt-4"><BenchmarksTab data={analytics} /></div>
        : <WuTabPlaceholder label="Benchmarks" />,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Link href="/usability-tests" className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
        <span className="wm-arrow-back text-base" /> Back to usability tests
      </Link>

      {/* Header */}
      <div className="mb-2">
        <h1 className="text-2xl font-semibold text-gray-950">{test.title}</h1>
      </div>

      {/* Task banner */}
      {test.taskDescription && (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm">
          <span className="wm-assignment mt-0.5 shrink-0 text-gray-400" />
          <p className="text-sm text-gray-700">{test.taskDescription}</p>
        </div>
      )}

      {/* Meta row */}
      <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
        <span>Created {formatDate(test.createdAt)} by {test.createdBy.name}</span>
        <span className="h-1 w-1 rounded-full bg-gray-300" />
        <span>{test.sessionsCompleted} sessions completed</span>
        <span className="h-1 w-1 rounded-full bg-gray-300" />
        <span className="capitalize">{test.surface} test</span>
      </div>

      {/* Workspace tabs */}
      <div className="mb-5">
        <UsabilityTestWorkspaceTabs testId={test.id} activeTab="analyze" />
      </div>

      {/* Top-level analysis tabs */}
      <div className="mb-5">
        <WuTab
          items={tabItems}
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as AnalyzeTab)}
        />
      </div>
    </div>
  );
}
