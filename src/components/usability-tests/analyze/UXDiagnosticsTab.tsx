'use client';

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { useWuShowToast } from '@npm-questionpro/wick-ui-lib';
import type { IWuTabItem, IWuTableColumnDef } from '@npm-questionpro/wick-ui-lib';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { EmptyChartNote, RadialRing, SectionShell, susLetter } from './charts';
import { WuTabPlaceholder } from '@/components/ui/WuTabPlaceholder';
import {
  VARIANT_PALETTE,
  type AnalyticsTester,
  type AnalyticsVariant,
  type NpsGroup,
  type TestVideoRow,
  type UsabilityAnalytics,
} from '@/data/mock-usability-analytics';

const WuButton = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuButton })),
  { ssr: false }
);
const WuCheckbox = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuCheckbox })),
  { ssr: false }
);
const WuInput = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuInput })),
  { ssr: false }
);
const WuSelect = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuSelect })),
  { ssr: false }
);
const WuTab = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuTab })),
  { ssr: false }
);
const WuTable = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuTable })),
  { ssr: false }
);

type DiagSubTab = 'sus' | 'nps' | 'task-usability' | 'task-completion' | 'task-duration' | 'emotions';
type ScopeOption = { value: string; label: string };

const COMPARE = 'compare';
const EASE_LABELS = ['Very difficult', 'Difficult', 'Neutral', 'Easy', 'Very easy'];

const DIAG_TABS: { value: DiagSubTab; label: string }[] = [
  { value: 'sus', label: 'SUS' },
  { value: 'nps', label: 'NPS' },
  { value: 'task-usability', label: 'Task ease' },
  { value: 'task-completion', label: 'Reached success' },
  { value: 'task-duration', label: 'Time to success' },
  { value: 'emotions', label: 'How it felt' },
];

const EMOTION_DATA = [
  { label: 'Confident', pct: 38, color: '#22C55E' },
  { label: 'Neutral', pct: 30, color: '#9CA3AF' },
  { label: 'Confused', pct: 20, color: '#F59E0B' },
  { label: 'Frustrated', pct: 12, color: '#EF4444' },
];

function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return `${mins}m ${String(secs).padStart(2, '0')}s`;
}

function testersForScope(testers: AnalyticsTester[], scope: string): AnalyticsTester[] {
  if (scope === COMPARE || !scope) return testers;
  return testers.filter((tester) => tester.variantId === scope);
}

function SampleNote({ n }: { n: number }) {
  return <p className="text-xs text-gray-500">n = {n}</p>;
}

function SUSPanel({
  testers,
  variants,
  compare,
}: {
  testers: AnalyticsTester[];
  variants: AnalyticsVariant[];
  compare: boolean;
}) {
  const [query, setQuery] = useState('');
  const average = mean(testers.map((tester) => tester.susScore));
  const visible = testers.filter((tester) => tester.name.toLowerCase().includes(query.trim().toLowerCase()));
  const percentile = Math.max(5, Math.min(95, Math.round(average - 20)));

  const grouped = variants.map((variant) => {
    const group = testers.filter((tester) => tester.variantId === variant.id);
    return { variant, testers: group, score: mean(group.map((tester) => tester.susScore)) };
  });

  const rows = visible.map((tester) => ({
    id: tester.id,
    name: tester.name,
    variant: variants.find((variant) => variant.id === tester.variantId)?.name ?? '—',
    q1: tester.susQuestions[0],
    q2: tester.susQuestions[1],
    q3: tester.susQuestions[2],
    score: tester.susScore,
    deviation: average === 0 ? '0%' : `${tester.susScore >= average ? '+' : ''}${(((tester.susScore - average) / average) * 100).toFixed(2)}%`,
  }));

  const columns: IWuTableColumnDef<(typeof rows)[number]>[] = [
    { accessorKey: 'name', header: 'Name' },
    ...(compare ? [{ accessorKey: 'variant' as const, header: 'Design' }] : []),
    { accessorKey: 'q1', header: 'Q1' },
    { accessorKey: 'q2', header: 'Q2' },
    { accessorKey: 'q3', header: 'Q3' },
    { accessorKey: 'score', header: 'Score' },
    {
      accessorKey: 'deviation',
      header: 'Deviation',
      cell: ({ row }) => (
        <span className={row.original.deviation.startsWith('+') ? 'text-green-700' : 'text-red-600'}>
          {row.original.deviation}
        </span>
      ),
    },
  ];

  if (testers.length === 0) {
    return <EmptyChartNote message="No sessions on this design yet." />;
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-8">
        {compare && variants.length > 1 ? (
          grouped.map(({ variant, score, testers: group }) => (
            <div key={variant.id} className="flex items-center gap-3">
              <RadialRing score={Number(score.toFixed(1))} size={110} label="/100" />
              <div>
                <p className="text-sm font-semibold text-gray-900">{variant.name}</p>
                <p className="text-xs text-gray-500">Letter {susLetter(score)} · n = {group.length}</p>
              </div>
            </div>
          ))
        ) : (
          <>
            <RadialRing score={Number(average.toFixed(1))} size={130} label="/100" />
            <RadialRing score={percentile} max={100} size={100} label="percentile" />
            <div className="flex h-[100px] w-[100px] flex-col items-center justify-center rounded-full border-8 border-blue-100">
              <p className="text-2xl font-bold text-blue-800">{susLetter(average)}</p>
              <p className="text-[10px] text-gray-500">letter</p>
            </div>
          </>
        )}
      </div>
      <SampleNote n={testers.length} />
      <SectionShell title="Testers">
        <div className="mb-3 max-w-xs">
          <WuInput
            variant="outlined"
            placeholder="Search testers"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <WuTable
          data={rows as unknown[]}
          columns={columns as unknown as IWuTableColumnDef<unknown>[]}
          variant="striped"
        />
      </SectionShell>
    </div>
  );
}

function TaskEasePanel({
  testers,
  variants,
  compare,
  taskTitles,
}: {
  testers: AnalyticsTester[];
  variants: AnalyticsVariant[];
  compare: boolean;
  taskTitles: string[];
}) {
  if (testers.length === 0) return <EmptyChartNote message="No sessions on this design yet." />;

  const chartData = taskTitles.map((title, index) => {
    const point: Record<string, string | number> = { task: `Task ${index + 1}` };
    if (compare && variants.length > 1) {
      for (const variant of variants) {
        const group = testers.filter((tester) => tester.variantId === variant.id);
        point[variant.name] = Number(mean(group.map((tester) => tester.taskEase[index] ?? 0)).toFixed(2));
      }
    } else {
      point.Average = Number(mean(testers.map((tester) => tester.taskEase[index] ?? 0)).toFixed(2));
    }
    return point;
  });

  const series = compare && variants.length > 1
    ? variants.map((variant, index) => ({ key: variant.name, color: VARIANT_PALETTE[index] }))
    : [{ key: 'Average', color: '#1B87E6' }];

  return (
    <div className="space-y-3">
      <SampleNote n={testers.length} />
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="#EEF3FB" />
            <XAxis dataKey="task" tick={{ fontSize: 12, fill: '#545E6B' }} />
            <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tickFormatter={(value) => EASE_LABELS[value - 1] ?? String(value)} width={110} tick={{ fontSize: 11, fill: '#545E6B' }} />
            <Tooltip />
            <Legend />
            {series.map((item) => (
              <Line key={item.key} type="monotone" dataKey={item.key} stroke={item.color} strokeWidth={2} dot />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function TaskCompletionPanel({
  testers,
  variants,
  compare,
  taskTitles,
}: {
  testers: AnalyticsTester[];
  variants: AnalyticsVariant[];
  compare: boolean;
  taskTitles: string[];
}) {
  if (testers.length === 0) return <EmptyChartNote message="No sessions on this design yet." />;

  const chartData = taskTitles.map((title, index) => {
    const point: Record<string, string | number> = { task: `Task ${index + 1}` };
    if (compare && variants.length > 1) {
      for (const variant of variants) {
        const group = testers.filter((tester) => tester.variantId === variant.id);
        const complete = group.filter((tester) => tester.taskCompleted[index]).length;
        point[`${variant.name} complete`] = complete;
        point[`${variant.name} incomplete`] = group.length - complete;
      }
    } else {
      const complete = testers.filter((tester) => tester.taskCompleted[index]).length;
      point.Complete = complete;
      point.Incomplete = testers.length - complete;
    }
    return point;
  });

  return (
    <div className="space-y-3">
      <SampleNote n={testers.length} />
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="#EEF3FB" />
            <XAxis dataKey="task" tick={{ fontSize: 12, fill: '#545E6B' }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#545E6B' }} />
            <Tooltip />
            <Legend />
            {compare && variants.length > 1 ? (
              variants.flatMap((variant, index) => [
                <Bar key={`${variant.id}-c`} dataKey={`${variant.name} complete`} stackId={variant.id} fill={VARIANT_PALETTE[index]} />,
                <Bar key={`${variant.id}-i`} dataKey={`${variant.name} incomplete`} stackId={variant.id} fill="#D8D8D8" />,
              ])
            ) : (
              <>
                <Bar dataKey="Complete" stackId="one" fill="#1B87E6" />
                <Bar dataKey="Incomplete" stackId="one" fill="#D8D8D8" />
              </>
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function TaskDurationPanel({
  testers,
  variants,
  compare,
  taskTitles,
  showAverage,
  highlightedIds,
}: {
  testers: AnalyticsTester[];
  variants: AnalyticsVariant[];
  compare: boolean;
  taskTitles: string[];
  showAverage: boolean;
  highlightedIds: string[];
}) {
  if (testers.length === 0) return <EmptyChartNote message="No sessions on this design yet." />;

  const chartData = taskTitles.map((_, index) => {
    const point: Record<string, string | number> = { task: `Task ${index + 1}` };
    if (compare && variants.length > 1) {
      for (const variant of variants) {
        const group = testers.filter((tester) => tester.variantId === variant.id);
        point[variant.name] = Number(mean(group.map((tester) => tester.taskDurationSec[index] ?? 0)).toFixed(0));
      }
    } else if (showAverage) {
      point.Average = Number(mean(testers.map((tester) => tester.taskDurationSec[index] ?? 0)).toFixed(0));
    }
    for (const tester of testers) {
      if (highlightedIds.length === 0 || highlightedIds.includes(tester.id)) {
        point[tester.name] = tester.taskDurationSec[index] ?? 0;
      }
    }
    return point;
  });

  const testerSeries = testers.filter((tester) => highlightedIds.length === 0 || highlightedIds.includes(tester.id));

  return (
    <div className="space-y-3">
      <SampleNote n={testers.length} />
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="#EEF3FB" />
            <XAxis dataKey="task" tick={{ fontSize: 12, fill: '#545E6B' }} />
            <YAxis tick={{ fontSize: 12, fill: '#545E6B' }} />
            <Tooltip formatter={(value) => formatDuration(Number(value))} />
            <Legend />
            {compare && variants.length > 1
              ? variants.map((variant, index) => (
                  <Line key={variant.id} type="monotone" dataKey={variant.name} stroke={VARIANT_PALETTE[index]} strokeWidth={2} />
                ))
              : showAverage && <Line type="monotone" dataKey="Average" stroke="#1B3380" strokeWidth={2} />}
            {(!compare || variants.length < 2) && testerSeries.slice(0, 8).map((tester, index) => (
              <Line
                key={tester.id}
                type="monotone"
                dataKey={tester.name}
                stroke={VARIANT_PALETTE[index % VARIANT_PALETTE.length]}
                strokeWidth={1}
                dot={false}
                strokeOpacity={0.55}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function NpsTables({ testers, variants, compare }: { testers: AnalyticsTester[]; variants: AnalyticsVariant[]; compare: boolean }) {
  if (testers.length === 0) return <EmptyChartNote message="No sessions on this design yet." />;

  const groups: NpsGroup[] = ['detractor', 'passive', 'promoter'];
  const labels: Record<NpsGroup, string> = { detractor: 'Detractors', passive: 'Passives', promoter: 'Promoters' };
  const nps = Math.round(
    ((testers.filter((tester) => tester.npsGroup === 'promoter').length - testers.filter((tester) => tester.npsGroup === 'detractor').length) /
      testers.length) *
      100
  );

  function table(group: NpsGroup) {
    const rows = testers.filter((tester) => tester.npsGroup === group).map((tester) => ({
      id: tester.id,
      name: tester.name,
      score: tester.npsScore,
      variant: variants.find((variant) => variant.id === tester.variantId)?.name ?? '—',
    }));
    const columns: IWuTableColumnDef<(typeof rows)[number]>[] = [
      { accessorKey: 'name', header: 'Name' },
      ...(compare ? [{ accessorKey: 'variant' as const, header: 'Design' }] : []),
      { accessorKey: 'score', header: 'Score' },
    ];
    return (
      <SectionShell title={`${labels[group]} (${rows.length})`}>
        {rows.length === 0 ? (
          <p className="text-sm text-gray-500">None in this group.</p>
        ) : (
          <WuTable data={rows as unknown[]} columns={columns as unknown as IWuTableColumnDef<unknown>[]} variant="striped" />
        )}
      </SectionShell>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-6">
        <div>
          <p className="text-3xl font-bold text-gray-900">{nps}</p>
          <p className="text-sm text-gray-500">Net promoter score</p>
          <SampleNote n={testers.length} />
        </div>
        {compare && variants.length > 1 && (
          <div className="flex gap-4">
            {variants.map((variant) => {
              const group = testers.filter((tester) => tester.variantId === variant.id);
              const score = group.length === 0
                ? 0
                : Math.round(
                    ((group.filter((tester) => tester.npsGroup === 'promoter').length - group.filter((tester) => tester.npsGroup === 'detractor').length) /
                      group.length) *
                      100
                  );
              return (
                <div key={variant.id}>
                  <p className="text-lg font-semibold text-gray-900">{score}</p>
                  <p className="text-xs text-gray-500">{variant.name} · n = {group.length}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {groups.map((group) => (
          <div key={group}>{table(group)}</div>
        ))}
      </div>
    </div>
  );
}

function EmotionsPanel({ n }: { n: number }) {
  return (
    <div className="space-y-5">
      <SampleNote n={n} />
      <div className="space-y-3">
        {EMOTION_DATA.map((item) => (
          <div key={item.label} className="flex items-center gap-3">
            <span className="w-24 shrink-0 text-sm text-gray-700">{item.label}</span>
            <div className="flex-1 overflow-hidden rounded-full bg-gray-100" style={{ height: 10 }}>
              <div className="h-full rounded-full" style={{ width: `${item.pct}%`, backgroundColor: item.color }} />
            </div>
            <span className="w-10 text-right text-xs font-medium text-gray-500">{item.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ParticipantFilter({
  testers,
  selectedIds,
  showAverage,
  onToggle,
  onToggleAll,
  onToggleAverage,
}: {
  testers: AnalyticsTester[];
  selectedIds: string[];
  showAverage: boolean;
  onToggle: (id: string) => void;
  onToggleAll: (checked: boolean) => void;
  onToggleAverage: (checked: boolean) => void;
}) {
  const allSelected = testers.length > 0 && selectedIds.length === testers.length;
  return (
    <aside className="rounded-lg border border-gray-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-gray-900">Participant filter</h3>
      <div className="mt-3 space-y-2">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-800">
          <WuCheckbox checked={allSelected} onChange={onToggleAll} />
          Select all
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-800">
          <WuCheckbox checked={showAverage} onChange={onToggleAverage} />
          Average
        </label>
        <div className="max-h-80 space-y-2 overflow-y-auto pt-1">
          {testers.map((tester) => (
            <label key={tester.id} className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
              <WuCheckbox checked={selectedIds.includes(tester.id)} onChange={() => onToggle(tester.id)} />
              {tester.name}
            </label>
          ))}
        </div>
      </div>
    </aside>
  );
}

function VideosTable({
  videos,
  variants,
}: {
  videos: TestVideoRow[];
  variants: AnalyticsVariant[];
}) {
  const { showToast } = useWuShowToast();
  const columns: IWuTableColumnDef<TestVideoRow>[] = [
    { accessorKey: 'id', header: 'Id', cell: ({ row }) => <span className="font-mono text-xs">{row.original.id}</span> },
    { accessorKey: 'name', header: 'Name' },
    {
      accessorKey: 'variantId',
      header: 'Design',
      cell: ({ row }) => variants.find((variant) => variant.id === row.original.variantId)?.name ?? '—',
    },
    {
      accessorKey: 'duration',
      header: 'Play',
      cell: ({ row }) => (
        <WuButton
          variant="iconOnly"
          size="sm"
          aria-label={`Play ${row.original.name}`}
          Icon={<span className="wm-play-arrow" />}
          onClick={() => showToast({ message: `Playing ${row.original.name}`, variant: 'success' })}
        />
      ),
    },
    { accessorKey: 'rating', header: 'Rating' },
    { accessorKey: 'notes', header: 'Notes' },
  ];

  return (
    <SectionShell title="Test videos">
      <WuTable
        data={videos as unknown[]}
        columns={columns as unknown as IWuTableColumnDef<unknown>[]}
        variant="striped"
      />
    </SectionShell>
  );
}

export function UXDiagnosticsTab({ data }: { data: UsabilityAnalytics }) {
  const [subTab, setSubTab] = useState<DiagSubTab>('sus');
  const hasVariants = data.variants.length > 1;
  const [scope, setScope] = useState(hasVariants ? COMPARE : data.variants[0]?.id ?? '');
  const [selectedIds, setSelectedIds] = useState<string[]>(() => data.testers.map((tester) => tester.id));
  const [showAverage, setShowAverage] = useState(true);

  const scopeOptions: ScopeOption[] = useMemo(() => {
    if (!hasVariants) return [];
    return [
      { value: COMPARE, label: 'Compare' },
      ...data.variants.map((variant) => ({ value: variant.id, label: variant.name })),
    ];
  }, [data.variants, hasVariants]);

  const scopedTesters = testersForScope(data.testers, scope).filter((tester) => selectedIds.includes(tester.id));
  const scopedVideos = data.videos.filter((video) => {
    if (scope !== COMPARE && scope) return video.variantId === scope;
    return selectedIds.includes(video.testerId);
  }).filter((video) => selectedIds.includes(video.testerId));
  const taskTitles = data.tasks.map((task) => task.title);
  const compare = scope === COMPARE && hasVariants;
  const selectedScope = scopeOptions.find((option) => option.value === scope) ?? scopeOptions[0];

  const panel = (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      {subTab === 'sus' && <SUSPanel testers={scopedTesters} variants={data.variants} compare={compare} />}
      {subTab === 'nps' && <NpsTables testers={scopedTesters} variants={data.variants} compare={compare} />}
      {subTab === 'task-usability' && (
        <TaskEasePanel testers={scopedTesters} variants={data.variants} compare={compare} taskTitles={taskTitles} />
      )}
      {subTab === 'task-completion' && (
        <TaskCompletionPanel testers={scopedTesters} variants={data.variants} compare={compare} taskTitles={taskTitles} />
      )}
      {subTab === 'task-duration' && (
        <TaskDurationPanel
          testers={scopedTesters}
          variants={data.variants}
          compare={compare}
          taskTitles={taskTitles}
          showAverage={showAverage}
          highlightedIds={selectedIds}
        />
      )}
      {subTab === 'emotions' && <EmotionsPanel n={scopedTesters.length} />}
    </div>
  );

  const subTabItems: IWuTabItem[] = DIAG_TABS.map((tab) => ({
    value: tab.value,
    Trigger: tab.label,
    Content: tab.value === subTab ? <div className="pt-4">{panel}</div> : <WuTabPlaceholder label={tab.label} />,
  }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_260px]">
        <div className="space-y-4">
          {hasVariants && (
            <div className="max-w-xs">
              <WuSelect
                data={scopeOptions}
                accessorKey={{ value: 'value', label: 'label' }}
                value={selectedScope}
                Label="Design"
                variant="outlined"
                onSelect={(value) => setScope((value as ScopeOption).value)}
              />
            </div>
          )}
          <WuTab items={subTabItems} value={subTab} onValueChange={(v) => setSubTab(v as DiagSubTab)} />
        </div>
        <ParticipantFilter
          testers={testersForScope(data.testers, scope)}
          selectedIds={selectedIds}
          showAverage={showAverage}
          onToggle={(id) =>
            setSelectedIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]))
          }
          onToggleAll={(checked) =>
            setSelectedIds(checked ? testersForScope(data.testers, scope).map((tester) => tester.id) : [])
          }
          onToggleAverage={setShowAverage}
        />
      </div>
      <VideosTable videos={scopedVideos} variants={data.variants} />
    </div>
  );
}
