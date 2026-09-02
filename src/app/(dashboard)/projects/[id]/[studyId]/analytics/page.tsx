'use client';

import { Suspense, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import type { IWuTabItem } from '@npm-questionpro/wick-ui-lib';
import { useWuShowToast } from '@npm-questionpro/wick-ui-lib';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';
import { AiLabel } from '@/components/ui/AiLabel';
import { TreeTestingAnalysis } from '@/components/projects/TreeTestingAnalysis';
import { AnalyticsFilters } from '@/components/projects/AnalyticsFilters';
import { ThematicAnalysisCard } from '@/components/projects/ThematicAnalysisCard';
import { WordCloudCard } from '@/components/projects/WordCloudCard';
import { SentimentTimeline } from '@/components/projects/SentimentTimeline';
import { StudyAiSummaryCard } from '@/components/projects/StudyAiSummaryCard';
import { taskTypeIcon, taskTypeLabel } from '@/components/projects/AddTaskPanel';
import { getFolderById, getStudyById, type StudyQuest } from '@/data/mock-projects';
import {
  ANALYTICS_PARTICIPANTS,
  DEFAULT_ANALYTICS_FILTERS,
  buildResponseTimeline,
  filterCompletion,
  filterResponses,
  filterThemes,
  filterWords,
  summaryFromResponses,
  type AnalyticsFiltersState,
} from '@/data/mock-study-analytics';
import { truncate } from '@/data/mock-utils';

const WuButton = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuButton })),
  { ssr: false }
);
const WuCard = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuCard })),
  { ssr: false }
);
const WuTab = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuTab })),
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
const WuLoader = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuLoader })),
  { ssr: false }
);

export default function StudyAnalyticsPage() {
  return (
    <Suspense fallback={<div className="px-4 py-8 text-sm text-ink-muted">Loading analytics…</div>}>
      <StudyAnalyticsContent />
    </Suspense>
  );
}

function StudyAnalyticsContent() {
  const { id: folderId, studyId } = useParams<{ id: string; studyId: string }>();
  const searchParams = useSearchParams();
  const taskFromQuery = searchParams.get('task');
  const { showToast } = useWuShowToast();
  const folder = getFolderById(folderId);
  const study = getStudyById(folderId, studyId);
  const [showFilters, setShowFilters] = useState(false);
  const [draftFilters, setDraftFilters] = useState<AnalyticsFiltersState>(DEFAULT_ANALYTICS_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState<AnalyticsFiltersState>(DEFAULT_ANALYTICS_FILTERS);
  const [aiStatus, setAiStatus] = useState<'idle' | 'running' | 'ready'>('idle');
  const initialQuest =
    study?.quests.find((quest) => quest.tasks.some((task) => task.id === taskFromQuery))?.id ??
    study?.quests[0]?.id ??
    null;
  const initialTask =
    taskFromQuery ??
    study?.quests.flatMap((quest) => quest.tasks).find((task) => task.type === 'tree-testing')?.id ??
    null;
  const [expandedQuest, setExpandedQuest] = useState<string | null>(initialQuest);
  const [expandedTask, setExpandedTask] = useState<string | null>(initialTask);

  const responses = useMemo(() => filterResponses(appliedFilters), [appliedFilters]);
  const themes = useMemo(() => filterThemes(appliedFilters), [appliedFilters]);
  const words = useMemo(() => filterWords(appliedFilters), [appliedFilters]);
  const completion = useMemo(() => filterCompletion(appliedFilters), [appliedFilters]);
  const responseTimeline = useMemo(() => buildResponseTimeline(responses), [responses]);

  if (!folder || !study) {
    return (
      <div className="px-4 py-8">
        <EmptyState
          icon="wm-error-outline"
          title="Study not found"
          action={
            <Link href="/projects" className="qp-link text-sm">
              Back to folders
            </Link>
          }
        />
      </div>
    );
  }

  const summary = summaryFromResponses(responses, {
    participants: new Set(responses.map((row) => row.participantId)).size || ANALYTICS_PARTICIPANTS.length,
    completion: `${Math.round((responses.length / 15) * 100)}%`,
    standardQuests: study.quests.filter((quest) => quest.type === 'Standard').length,
    diaryQuests: study.quests.filter((quest) => quest.type === 'Diary').length,
    tasks: study.quests.reduce((sum, quest) => sum + quest.tasks.length, 0),
    days: '6',
  });

  const visibleQuests =
    appliedFilters.taskId === 'all'
      ? study.quests
      : study.quests.filter((quest) => quest.tasks.some((task) => task.id === appliedFilters.taskId));

  function runAiAnalysis() {
    setAiStatus('running');
    window.setTimeout(() => {
      setAiStatus('ready');
      showToast({ message: 'AI analysis ready', variant: 'success' });
    }, 1400);
  }

  const overview = (
    <div className="flex flex-col gap-8 pt-4 pb-8">
      <StudyAiSummaryCard quests={study.quests} />

      <div>
        <div className="mb-3 flex justify-end">
          <WuButton
            variant="link"
            Icon={<span className="wm-filter-list" />}
            onClick={() => setShowFilters((open) => !open)}
          >
            {showFilters ? 'Hide filters' : 'Filter'}
          </WuButton>
        </div>
        <div className={`qp-reveal ${showFilters ? 'qp-reveal-open' : ''}`}>
          <div>
            <AnalyticsFilters
              draft={draftFilters}
              onDraftChange={setDraftFilters}
              onApply={() => {
                setAppliedFilters(draftFilters);
                showToast({ message: 'Filters applied', variant: 'success' });
              }}
              onClear={() => {
                setDraftFilters(DEFAULT_ANALYTICS_FILTERS);
                setAppliedFilters(DEFAULT_ANALYTICS_FILTERS);
                showToast({ message: 'Filters cleared', variant: 'success' });
              }}
            />
          </div>
        </div>
      </div>

      <WuCard rounded className="qp-card-depth p-4">
        <h3 className="mb-4 text-base font-semibold text-ink">Summary</h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          <Metric value={String(summary.participants)} label="Total participants" icon="wm-groups" />
          <Metric value={summary.completion} label="Completion rate" icon="wm-pie-chart" />
          <Metric value={String(summary.standardQuests)} label="Standard quests" icon="wm-assignment" />
          <Metric value={String(summary.diaryQuests)} label="Diary quests" icon="wm-menu-book" />
          <Metric value={String(summary.tasks)} label="Total tasks" icon="wm-apps" />
          <Metric value={summary.days} label="Days elapsed" icon="wm-calendar-month" />
        </div>
      </WuCard>

      <WuCard rounded className="qp-card-depth p-4">
        <h3 className="mb-3 text-base font-semibold text-ink">Response timeline</h3>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={responseTimeline}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--qp-gray-40)" />
              <XAxis dataKey="date" tick={{ fill: '#9B9B9B', fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fill: '#9B9B9B', fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#1B87E6" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </WuCard>

      {aiStatus === 'running' && (
        <WuCard rounded className="qp-card-depth flex min-h-40 items-center justify-center p-8">
          <WuLoader message="Running AI analysis" />
        </WuCard>
      )}

      {aiStatus === 'ready' && <SentimentTimeline responses={responses} />}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <WuCard rounded className="qp-card-depth p-4">
          <h3 className="mb-4 text-base font-semibold text-ink">Completion progress</h3>
          {completion.length === 0 ? (
            <p className="mt-8 text-center text-sm text-ink-muted">No data available</p>
          ) : (
            <div className="flex flex-col gap-4">
              {completion.map((quest) => {
                const pct = quest.total === 0 ? 0 : Math.round((quest.completed / quest.total) * 100);
                return (
                  <div key={quest.id}>
                    <div className="mb-1 flex items-center justify-between gap-2 text-sm">
                      <span className="truncate text-ink">{quest.title}</span>
                      <span className="shrink-0 text-ink-muted">
                        {quest.completed}/{quest.total}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-[var(--qp-gray-20)]">
                      <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </WuCard>
        <WordCloudCard words={words} showKeywords={appliedFilters.keywords} />
      </div>

      {aiStatus === 'ready' && <ThematicAnalysisCard themes={themes} onRerun={runAiAnalysis} />}
    </div>
  );

  const responsesTab = (
    <div className="flex flex-col gap-4 pt-4">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[220px_minmax(0,1fr)] pb-8">
        <nav className="h-fit" aria-label="Jump to section">
          <p className="mb-2 px-2 text-xs font-semibold text-ink-muted">Jump to section</p>
          {visibleQuests.map((quest, index) => (
            <div key={quest.id} className="mb-2">
              <button
                type="button"
                className="w-full truncate rounded px-2 py-1.5 text-left text-sm font-medium text-ink hover:bg-[var(--qp-gray-20)]"
                onClick={() => {
                  setExpandedQuest(quest.id);
                  document.getElementById(`quest-${quest.id}`)?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Q{index + 1}: {truncate(quest.title, 28)}
              </button>
              {quest.tasks
                .filter((task) => appliedFilters.taskId === 'all' || task.id === appliedFilters.taskId)
                .map((task) => (
                  <button
                    key={task.id}
                    type="button"
                    className="block w-full truncate rounded px-4 py-1 text-left text-xs text-ink-muted hover:text-accent"
                    onClick={() => {
                      setExpandedQuest(quest.id);
                      setExpandedTask(task.id);
                      document.getElementById(`task-${task.id}`)?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    {task.title} ({taskTypeLabel(task.type)})
                  </button>
                ))}
            </div>
          ))}
        </nav>

        <div className="flex flex-col gap-3">
          {visibleQuests.map((quest, index) => (
            <QuestAnalysisCard
              key={quest.id}
              quest={quest}
              index={index}
              expanded={expandedQuest === quest.id}
              expandedTask={expandedTask}
              taskFilter={appliedFilters.taskId}
              onToggle={() => setExpandedQuest((current) => (current === quest.id ? null : quest.id))}
              onToggleTask={(taskId) => setExpandedTask((current) => (current === taskId ? null : taskId))}
              onFilter={() => showToast({ message: 'Filter applied', variant: 'success' })}
            />
          ))}
        </div>
      </div>
    </div>
  );

  const tabs: IWuTabItem[] = [
    { value: 'overview', Trigger: 'Overview', Content: overview },
    { value: 'responses', Trigger: 'Responses', Content: responsesTab },
  ];

  return (
    <div className="qp-enter bg-[var(--qp-gray-20)]">
      <div className="px-4 pt-3">
        <Link href={`/projects/${folderId}/${studyId}`} className="qp-link inline-flex items-center gap-1 text-sm">
          <span className="wm-arrow-back" />
          {truncate(study.heroTitle ?? study.name, 28)}
        </Link>
      </div>
      <PageHeader
        title={
          <span className="inline-flex items-center gap-1">
            Analytics
            <span className="wm-info-outline text-base text-ink-muted" />
          </span>
        }
        action={
          <>
            <WuButton
              variant="secondary"
              loading={aiStatus === 'running'}
              disabled={aiStatus === 'running'}
              onClick={runAiAnalysis}
            >
              <AiLabel>AI analysis</AiLabel>
            </WuButton>
            <WuButton variant="iconOnly" aria-label="Preview" Icon={<span className="wm-visibility" />} onClick={() => showToast({ message: 'Preview opened', variant: 'success' })} />
            <WuMenu
              Trigger={
                <WuButton>
                  Published
                  <span className="wm-arrow-drop-down" />
                </WuButton>
              }
              align="end"
            >
              <WuMenuItem onSelect={() => showToast({ message: 'Study unpublished', variant: 'success' })}>Unpublish</WuMenuItem>
            </WuMenu>
            <WuButton onClick={() => showToast({ message: 'Report generated', variant: 'success' })}>Generate report</WuButton>
          </>
        }
      />
      <div className="px-4">
        <WuTab items={tabs} defaultValue={taskFromQuery ? 'responses' : 'overview'} />
      </div>
    </div>
  );
}

function Metric({ value, label, icon }: { value: string; label: string; icon: string }) {
  return (
    <div className="text-center">
      <p className="text-2xl font-semibold text-ink">{value}</p>
      <span className={`${icon} mt-1 block text-ink-muted`} />
      <p className="mt-1 text-xs text-ink-muted">{label}</p>
    </div>
  );
}

function QuestAnalysisCard({
  quest,
  index,
  expanded,
  expandedTask,
  taskFilter,
  onToggle,
  onToggleTask,
  onFilter,
}: {
  quest: StudyQuest;
  index: number;
  expanded: boolean;
  expandedTask: string | null;
  taskFilter: string;
  onToggle: () => void;
  onToggleTask: (taskId: string) => void;
  onFilter: () => void;
}) {
  const tasks = quest.tasks.filter((task) => taskFilter === 'all' || task.id === taskFilter);

  return (
    <div className="overflow-hidden rounded-lg bg-surface qp-card-depth" id={`quest-${quest.id}`}>
      <WuCard rounded className="overflow-hidden">
        <button
          type="button"
          className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left"
          onClick={onToggle}
        >
          <span className="truncate font-semibold text-ink">
            Q{index + 1}: {quest.title}
          </span>
          <span className={`wm-expand-more text-ink-muted transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
        </button>
        {expanded && (
          <div className="qp-enter space-y-2 border-t border-[var(--qp-gray-40)] bg-[var(--qp-gray-20)] p-3">
            {tasks.length === 0 ? (
              <p className="px-2 py-3 text-sm text-ink-muted">No tasks in this quest.</p>
            ) : (
              tasks.map((task) => {
                const open = expandedTask === task.id;
                return (
                  <div key={task.id} id={`task-${task.id}`} className="overflow-hidden rounded-lg bg-surface qp-card-depth">
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-ink hover:bg-[var(--qp-gray-20)]"
                      onClick={() => onToggleTask(task.id)}
                    >
                      <span className={`${taskTypeIcon(task.type)} text-ink-muted`} />
                      <span className="flex-1 truncate font-medium">{task.title}</span>
                      <span className="text-xs text-ink-muted">{taskTypeLabel(task.type)} task</span>
                      <span className={`wm-expand-more text-ink-muted transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
                    </button>
                    {open && (
                      <div className="qp-enter border-t border-[var(--qp-gray-40)] p-3">
                        {task.type === 'tree-testing' ? (
                          <TreeTestingAnalysis onFilter={onFilter} />
                        ) : (
                          <p className="text-sm text-ink-muted">
                            Task analysis for {taskTypeLabel(task.type).toLowerCase()} is shown here when responses are collected.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </WuCard>
    </div>
  );
}
