'use client';

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import type { IWuTableColumnDef } from '@npm-questionpro/wick-ui-lib';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  MOCK_TREE_TESTING_ANALYSIS,
  type PathResult,
  type TreeParticipantRow,
} from '@/data/mock-tree-testing';

const WuInput = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuInput })),
  { ssr: false }
);
const WuButton = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuButton })),
  { ssr: false }
);
const WuCard = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuCard })),
  { ssr: false }
);
const WuChip = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuChip })),
  { ssr: false }
);
const WuMenu = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuMenu })),
  { ssr: false }
);
const WuMenuItem = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuMenuItem })),
  { ssr: false }
);
const WuSelect = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuSelect })),
  { ssr: false }
);
const WuTable = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuTable })),
  { ssr: false }
);

const RESULT_LABELS: Record<PathResult, string> = {
  direct: 'Direct success',
  indirect: 'Indirect success',
  fail: 'Fail',
};

const FILTER_OPTIONS: { value: 'all' | PathResult; label: string }[] = [
  { value: 'all', label: 'All results' },
  { value: 'direct', label: 'Direct success' },
  { value: 'indirect', label: 'Indirect success' },
  { value: 'fail', label: 'Fail' },
];

interface TreeTestingAnalysisProps {
  onFilter: () => void;
}

export function TreeTestingAnalysis({ onFilter }: TreeTestingAnalysisProps) {
  const [activeTaskId, setActiveTaskId] = useState(MOCK_TREE_TESTING_ANALYSIS[0]?.taskId ?? '');
  const [search, setSearch] = useState('');
  const [resultFilter, setResultFilter] = useState<'all' | PathResult>('all');
  const analysis =
    MOCK_TREE_TESTING_ANALYSIS.find((item) => item.taskId === activeTaskId) ??
    MOCK_TREE_TESTING_ANALYSIS[0];

  const taskOptions = useMemo(
    () =>
      MOCK_TREE_TESTING_ANALYSIS.map((item, index) => ({
        value: item.taskId,
        label: `Task ${index + 1}`,
      })),
    []
  );

  const participants = useMemo(() => {
    if (!analysis) return [];
    return analysis.participants.filter((row) => {
      if (resultFilter !== 'all' && row.result !== resultFilter) return false;
      const query = search.trim().toLowerCase();
      if (!query) return true;
      return (
        row.name.toLowerCase().includes(query) ||
        row.path.toLowerCase().includes(query) ||
        row.destination.toLowerCase().includes(query)
      );
    });
  }, [analysis, resultFilter, search]);

  const columns: IWuTableColumnDef<TreeParticipantRow>[] = [
    {
      accessorKey: 'name',
      header: 'Participant',
      cell: ({ row }) => <span className="font-medium text-accent">{row.original.name}</span>,
    },
    {
      accessorKey: 'result',
      header: 'Result',
      cell: ({ row }) => (
        <WuChip
          variant="secondary"
          size="sm"
          color={
            row.original.result === 'direct'
              ? 'success'
              : row.original.result === 'fail'
                ? 'danger'
                : undefined
          }
        >
          {RESULT_LABELS[row.original.result]}
        </WuChip>
      ),
    },
    {
      accessorKey: 'path',
      header: 'Path',
    },
    {
      accessorKey: 'firstClick',
      header: 'First click',
    },
    {
      accessorKey: 'timeSeconds',
      header: 'Time',
      cell: ({ row }) => `${row.original.timeSeconds}s`,
    },
    {
      accessorKey: 'destination',
      header: 'Ended at',
    },
  ];

  if (!analysis) return null;

  const selectedTask = taskOptions.find((option) => option.value === analysis.taskId) ?? taskOptions[0];
  const selectedFilter = FILTER_OPTIONS.find((option) => option.value === resultFilter) ?? FILTER_OPTIONS[0];

  return (
    <div className="qp-enter flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="w-56">
          <WuSelect
            data={taskOptions}
            accessorKey={{ value: 'value', label: 'label' }}
            value={selectedTask}
            onSelect={(value) => {
              const option = value as { value: string };
              setActiveTaskId(option.value);
              setSearch('');
              setResultFilter('all');
            }}
            Label="Findability task"
            variant="outlined"
          />
        </div>
        <WuMenu
          Trigger={
            <WuButton variant="outline" size="sm" Icon={<span className="wm-filter-list" />}>
              {selectedFilter.label}
            </WuButton>
          }
          align="end"
        >
          {FILTER_OPTIONS.map((option) => (
            <WuMenuItem
              key={option.value}
              onSelect={() => {
                setResultFilter(option.value);
                onFilter();
              }}
            >
              {option.label}
            </WuMenuItem>
          ))}
        </WuMenu>
      </div>

      <WuCard rounded className="qp-card-depth overflow-hidden">
        <div className="flex items-start justify-between gap-3 border-b border-line bg-surface-sunken px-4 py-3">
          <div>
            <p className="text-xs font-medium text-ink-muted">Tree testing task</p>
            <h3 className="mt-1 text-base font-semibold text-ink">{analysis.prompt}</h3>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-3">
          <Stat label="Success" value={`${analysis.successRate}%`} hint="NN/g: 60–80% is good" />
          <Stat label="Directness" value={`${analysis.directness}%`} hint="Reached the correct leaf first" />
          <Stat label="Avg. time" value={`${analysis.avgTimeSeconds}s`} hint="Time to select a destination" />
        </div>
      </WuCard>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <ChartCard title="End destinations" data={analysis.endDestinations} />
        <ChartCard title="First click" data={analysis.firstClicks} />
      </div>

      <WuCard rounded className="qp-card-depth p-4">
        <h4 className="mb-3 text-sm font-semibold text-ink">Most common paths</h4>
        <div className="flex flex-col gap-2">
          {analysis.commonPaths.map((row) => (
            <div
              key={row.path}
              className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm transition-colors duration-150 ${
                row.correct
                  ? 'border-success/30 bg-success-surface text-ink'
                  : 'border-line bg-surface-sunken text-ink'
              }`}
            >
              <span>{row.path}</span>
              <span className="text-xs text-ink-muted">{row.count} participants</span>
            </div>
          ))}
        </div>
      </WuCard>

      <WuCard rounded className="qp-card-depth p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-sm font-semibold text-ink">Participant responses</h4>
          <WuInput
            variant="outlined"
            placeholder="Search in task"
            Icon={<span className="wm-search" />}
            iconPosition="left"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64"
          />
        </div>
        <WuTable
          data={participants as unknown[]}
          columns={columns as unknown as IWuTableColumnDef<unknown>[]}
          variant="striped"
          sort={{ enabled: true }}
          NoDataContent={<p className="py-6 text-center text-sm text-ink-muted">No matching participants.</p>}
        />
      </WuCard>
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-lg border border-line bg-surface-sunken px-3 py-3">
      <p className="text-xs text-ink-muted">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-ink">{value}</p>
      <p className="mt-1 text-xs text-ink-muted">{hint}</p>
    </div>
  );
}

function ChartCard({ title, data }: { title: string; data: { label: string; count: number }[] }) {
  return (
    <WuCard rounded className="qp-card-depth p-4">
      <h4 className="mb-3 text-sm font-semibold text-ink">{title}</h4>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 16, right: 16 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-line)" horizontal={false} />
            <XAxis type="number" allowDecimals={false} tick={{ fill: '#9B9B9B', fontSize: 12 }} />
            <YAxis type="category" dataKey="label" width={110} tick={{ fill: '#545E6B', fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="count" fill="#1B87E6" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </WuCard>
  );
}
