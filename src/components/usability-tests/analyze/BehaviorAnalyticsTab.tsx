'use client';

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { useWuShowToast } from '@npm-questionpro/wick-ui-lib';
import type { IWuTabItem, IWuTableColumnDef } from '@npm-questionpro/wick-ui-lib';
import { HeatmapMock } from './charts';
import { ClickPathsView } from './ClickPathsView';
import { WuTabPlaceholder } from '@/components/ui/WuTabPlaceholder';
import { EmptyState } from '@/components/ui/EmptyState';
import type {
  AnalyticsTaskView,
  RageMisclickRow,
  TaskSuccessDefinition,
  UsabilityAnalytics,
} from '@/data/mock-usability-analytics';

const ScrollDepthView = dynamic(
  () => import('./ScrollDepthView').then((m) => ({ default: m.ScrollDepthView })),
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

type SubTab = 'overview' | 'heatmaps' | 'scroll-depth' | 'session-replays' | 'click-paths' | 'rage-misclicks';
type PageOption = { value: string; label: string };
type ScopeOption = { value: string; label: string };

const WHOLE_TEST = 'all';
const COMPARE = 'compare';

const SUB_TABS: { value: SubTab; label: string }[] = [
  { value: 'overview', label: 'Overview' },
  { value: 'heatmaps', label: 'Heatmaps' },
  { value: 'scroll-depth', label: 'Scroll depth' },
  { value: 'session-replays', label: 'Session replays' },
  { value: 'click-paths', label: 'Click paths' },
  { value: 'rage-misclicks', label: 'Repeated clicks' },
];

function successCopy(def: TaskSuccessDefinition): string {
  if (def.mode === 'reach-section' && def.sectionLabel) {
    return `They reach “${def.sectionLabel}” on ${def.successLabel}`;
  }
  if (def.mode === 'click-control' && def.sectionLabel) {
    return `They click “${def.sectionLabel}” on ${def.successLabel}`;
  }
  if (def.mode === 'participant-done') return 'Participant marks done';
  return `They reach ${def.successLabel}`;
}

function pageOptionsFrom(task: AnalyticsTaskView): PageOption[] {
  return task.pageScrollDepth.map((page) => ({
    value: page.path,
    label: page.isStart
      ? `${page.label} (start)`
      : page.isSuccess
        ? `${page.label} (success)`
        : page.label,
  }));
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <WuCard rounded className="p-4 wu-shadow-sm">
      <p className="text-xs font-medium text-ink-muted">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-ink">{value}</p>
    </WuCard>
  );
}

interface TaskRow {
  id: string;
  task: string;
  success: string;
  reached: string;
  left: number;
  time: string;
}

function TestOverview({
  data,
  onOpenTask,
}: {
  data: UsabilityAnalytics;
  onOpenTask: (taskId: string) => void;
}) {
  const overview = data.testOverview;
  const weakest = [...data.tasks].sort((a, b) => b.behavior.leftBeforeSuccess - a.behavior.leftBeforeSuccess)[0];

  const rows: TaskRow[] = data.tasks.map((task, index) => ({
    id: task.id,
    task: `Task ${index + 1} · ${task.title}`,
    success: successCopy(task.successDefinition),
    reached: `${task.behavior.reachedSuccess} of ${task.behavior.participantsTracked}`,
    left: task.behavior.leftBeforeSuccess,
    time: task.behavior.avgTimeOnTask,
  }));

  const columns: IWuTableColumnDef<TaskRow>[] = [
    {
      accessorKey: 'task',
      header: 'Task',
      cell: ({ row }) => (
        <WuButton variant="link" onClick={() => onOpenTask(row.original.id)}>
          {row.original.task}
        </WuButton>
      ),
    },
    { accessorKey: 'success', header: 'Success' },
    { accessorKey: 'reached', header: 'Reached success' },
    { accessorKey: 'left', header: 'Left' },
    { accessorKey: 'time', header: 'Time' },
  ];

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-ink-muted">
        Across the test — not scored against a single start or success.
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard label="Participants" value={String(overview.participantsTracked)} />
        <StatCard
          label="Finished every task"
          value={`${overview.finishedAllTasks} of ${overview.participantsTracked}`}
        />
        <StatCard label="Left a task" value={String(overview.leftAnyTask)} />
      </div>
      {data.variants.length > 1 && (
        <p className="text-sm text-ink-muted">
          {data.variants.map((variant) => `${variant.name}: ${variant.n}`).join(' · ')} of {overview.participantsTracked}
        </p>
      )}
      <WuCard rounded className="overflow-hidden p-0 wu-shadow-sm">
        <WuTable
          data={rows as unknown[]}
          columns={columns as unknown as IWuTableColumnDef<unknown>[]}
          variant="striped"
        />
      </WuCard>
      {weakest ? (
        <p className="text-sm text-ink-muted">
          Most people left <span className="font-medium text-ink">{weakest.title}</span>. Open that task to see the path.
        </p>
      ) : null}
    </div>
  );
}

interface OutcomeRow {
  id: string;
  how: string;
  people: number;
}

function TaskOverview({ task }: { task: AnalyticsTaskView }) {
  const def = task.successDefinition;
  const b = task.behavior;
  const outcomes: OutcomeRow[] = [
    { id: 'direct', how: 'Direct path', people: task.outcomes.direct },
    { id: 'recovered', how: 'Recovered, then succeeded', people: task.outcomes.divertedSuccess },
    { id: 'left', how: 'Left before success', people: task.outcomes.left },
  ];
  const outcomeColumns: IWuTableColumnDef<OutcomeRow>[] = [
    { accessorKey: 'how', header: 'How it ended' },
    { accessorKey: 'people', header: 'People' },
  ];

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-ink">
        Starts on {def.startLabel}. Success: {successCopy(def)}.
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard label="Reached success" value={`${b.reachedSuccess} of ${b.participantsTracked}`} />
        <StatCard label="Left before success" value={String(b.leftBeforeSuccess)} />
        <StatCard label="Time on task" value={b.avgTimeOnTask} />
      </div>
      <WuCard rounded className="overflow-hidden p-0 wu-shadow-sm">
        <WuTable
          data={outcomes as unknown[]}
          columns={outcomeColumns as unknown as IWuTableColumnDef<unknown>[]}
          variant="striped"
        />
      </WuCard>
      <p className="text-sm text-ink-muted">{task.lookNext}</p>
    </div>
  );
}

function HeatmapsSub({ task }: { task: AnalyticsTaskView }) {
  const options = useMemo(() => pageOptionsFrom(task), [task]);
  const [selected, setSelected] = useState<PageOption>(
    () => options.find((option) => option.value === task.successDefinition.startPath) ?? options[0]
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="w-56">
        <WuSelect
          data={options}
          accessorKey={{ value: 'value', label: 'label' }}
          value={options.find((option) => option.value === selected.value) ?? selected}
          Label="Page"
          variant="outlined"
          onSelect={(value) => setSelected(value as PageOption)}
        />
      </div>
      <HeatmapMock path={selected.value} label={selected.label} />
      <p className="text-xs text-ink-muted">
        Clicks from {task.behavior.participantsTracked} sessions on this page. Heatmaps show where attention went, not whether the task succeeded.
      </p>
    </div>
  );
}

function SessionReplaysSub({ task }: { task: AnalyticsTaskView }) {
  const { showToast } = useWuShowToast();
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {task.replays.map((r) => (
        <WuCard key={r.id} rounded className="overflow-hidden p-0 wu-shadow-sm">
          <div className="relative h-32 bg-[var(--qp-q-blue)]">
            <div className="absolute inset-0 flex flex-col gap-2 p-4 opacity-20">
              <div className="h-4 w-full rounded bg-white" />
              <div className="h-12 w-full rounded bg-white" />
              <div className="h-4 w-2/3 rounded bg-white" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="rounded-full bg-surface">
                <WuButton
                  variant="iconOnly"
                  aria-label={`Play session for ${r.anonymousId}`}
                  Icon={<span className="wm-play-arrow" />}
                  onClick={() =>
                    showToast({ message: `Playing ${r.anonymousId}`, variant: 'success' })
                  }
                />
              </div>
            </div>
          </div>
          <div className="p-3">
            <div className="flex items-start justify-between gap-2">
              <p className="font-mono text-sm font-medium text-ink">{r.anonymousId}</p>
              <WuChip variant="secondary" size="sm">
                {r.device}
              </WuChip>
            </div>
            <p className="mt-1 text-xs text-ink-muted">{r.duration}</p>
            <div className="mt-2">
              <WuChip variant="secondary" size="sm" color={r.reachedSuccess ? undefined : 'warning'}>
                {r.reachedSuccess ? 'Reached success' : 'Left before success'}
              </WuChip>
            </div>
          </div>
        </WuCard>
      ))}
    </div>
  );
}

function RageMisclicksSub({ task }: { task: AnalyticsTaskView }) {
  const columns: IWuTableColumnDef<RageMisclickRow>[] = [
    {
      accessorKey: 'screen',
      header: 'Screen',
      cell: ({ row }) => <span className="font-medium text-ink">{row.original.screen}</span>,
    },
    { accessorKey: 'rageClicks', header: 'Repeated clicks' },
    { accessorKey: 'misclickRate', header: 'Off-target rate' },
    { accessorKey: 'deadClicks', header: 'Dead clicks' },
    {
      accessorKey: 'severity',
      header: 'Severity',
      cell: ({ row }) => {
        const severity = row.original.severity;
        const color = severity === 'High' ? 'danger' : severity === 'Medium' ? 'warning' : undefined;
        return (
          <WuChip variant="secondary" size="sm" color={color}>
            {severity}
          </WuChip>
        );
      },
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-ink-muted">
        Use these screens for replay review. Repeated clicks do not prove frustration on their own.
      </p>
      <WuCard rounded className="overflow-hidden p-0 wu-shadow-sm">
        <WuTable
          data={task.rageMisclicks as unknown[]}
          columns={columns as unknown as IWuTableColumnDef<unknown>[]}
          variant="striped"
        />
      </WuCard>
    </div>
  );
}

function PickATask({ onOverview }: { onOverview: () => void }) {
  return (
    <EmptyState
      icon="wm-filter-list"
      title="Choose a task"
      description="Heatmaps, paths, and replays are per task. The whole-test view stays on Overview."
      action={
        <WuButton variant="secondary" onClick={onOverview}>
          Back to overview
        </WuButton>
      }
    />
  );
}

function PickAVariant({ onOverview }: { onOverview: () => void }) {
  return (
    <EmptyState
      icon="wm-filter-list"
      title="Choose a variant"
      description="Heatmaps, scroll, paths, and repeated clicks are one design at a time."
      action={
        <WuButton variant="secondary" onClick={onOverview}>
          Back to overview
        </WuButton>
      }
    />
  );
}

export function BehaviorAnalyticsTab({ data }: { data: UsabilityAnalytics }) {
  const [subTab, setSubTab] = useState<SubTab>('overview');
  const [scope, setScope] = useState(WHOLE_TEST);
  const hasVariants = data.variants.length > 1;
  const [variantScope, setVariantScope] = useState(hasVariants ? COMPARE : data.variants[0]?.id ?? '');

  const variantOptions: ScopeOption[] = useMemo(() => {
    if (!hasVariants) return [];
    return [
      { value: COMPARE, label: 'Compare' },
      ...data.variants.map((variant) => ({ value: variant.id, label: variant.name })),
    ];
  }, [data.variants, hasVariants]);

  const selectedVariant = data.variants.find((variant) => variant.id === variantScope) ?? null;
  const scopedTasks = selectedVariant?.tasks ?? data.tasks;
  const isCompare = hasVariants && variantScope === COMPARE;

  const scopeOptions: ScopeOption[] = useMemo(
    () => [
      { value: WHOLE_TEST, label: 'Whole test' },
      ...scopedTasks.map((task, index) => ({
        value: task.id,
        label: `Task ${index + 1} · ${task.title}`,
      })),
    ],
    [scopedTasks]
  );
  const selectedScope = scopeOptions.find((option) => option.value === scope) ?? scopeOptions[0];
  const selectedTask = scopedTasks.find((task) => task.id === scope) ?? null;
  const isWholeTest = scope === WHOLE_TEST;
  const selectedVariantOption = variantOptions.find((option) => option.value === variantScope) ?? variantOptions[0];

  function handleScope(option: ScopeOption) {
    setScope(option.value);
    if (option.value === WHOLE_TEST) setSubTab('overview');
  }

  const subTabItems: IWuTabItem[] = SUB_TABS.map((tab) => {
    const needsTask = tab.value !== 'overview';
    const needsSingleVariant = tab.value === 'heatmaps' || tab.value === 'scroll-depth' || tab.value === 'click-paths' || tab.value === 'rage-misclicks';
    const content =
      tab.value !== subTab ? (
        <WuTabPlaceholder label={tab.label} />
      ) : isCompare && needsSingleVariant ? (
        <div className="pt-4">
          <PickAVariant onOverview={() => setSubTab('overview')} />
        </div>
      ) : isWholeTest && needsTask ? (
        <div className="pt-4">
          <PickATask onOverview={() => setSubTab('overview')} />
        </div>
      ) : (
        <div className="pt-4">
          {tab.value === 'overview' && (
            isWholeTest || !selectedTask ? (
              <TestOverview
                data={{ ...data, tasks: scopedTasks }}
                onOpenTask={(id) => { setScope(id); setSubTab('overview'); }}
              />
            ) : (
              <TaskOverview task={selectedTask} />
            )
          )}
          {tab.value === 'heatmaps' && selectedTask && <HeatmapsSub key={`${variantScope}-${selectedTask.id}`} task={selectedTask} />}
          {tab.value === 'scroll-depth' && selectedTask && (
            <ScrollDepthView key={`${variantScope}-${selectedTask.id}`} allPages={selectedTask.pageScrollDepth} />
          )}
          {tab.value === 'session-replays' && selectedTask && (
            <SessionReplaysSub key={`${variantScope}-${selectedTask.id}`} task={selectedTask} />
          )}
          {tab.value === 'click-paths' && selectedTask && (
            <ClickPathsView
              key={`${variantScope}-${selectedTask.id}`}
              nodes={selectedTask.clickPathNodes}
              links={selectedTask.clickPathLinks}
            />
          )}
          {tab.value === 'rage-misclicks' && selectedTask && (
            <RageMisclicksSub key={`${variantScope}-${selectedTask.id}`} task={selectedTask} />
          )}
        </div>
      );

    return { value: tab.value, Trigger: tab.label, Content: content };
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-3">
        {hasVariants && (
          <div className="w-56">
            <WuSelect
              data={variantOptions}
              accessorKey={{ value: 'value', label: 'label' }}
              value={selectedVariantOption}
              Label="Design"
              variant="outlined"
              onSelect={(value) => {
                setVariantScope((value as ScopeOption).value);
                setSubTab('overview');
              }}
            />
          </div>
        )}
        <div className="max-w-md flex-1">
          <WuSelect
            data={scopeOptions}
            accessorKey={{ value: 'value', label: 'label' }}
            value={selectedScope}
            Label="View"
            variant="outlined"
            onSelect={(value) => handleScope(value as ScopeOption)}
          />
        </div>
      </div>
      {isCompare && (
        <p className="text-xs text-ink-muted">
          Compare shows both designs together on Overview. Choose a single design to open heatmaps, scroll, paths, or repeated clicks. n = {data.variants.map((variant) => `${variant.name} ${variant.n}`).join(' · ')}
        </p>
      )}
      <WuTab items={subTabItems} value={subTab} onValueChange={(v) => setSubTab(v as SubTab)} />
    </div>
  );
}
