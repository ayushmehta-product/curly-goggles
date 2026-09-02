'use client';

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { format } from 'date-fns';
import { useWuShowToast } from '@npm-questionpro/wick-ui-lib';
import type { IWuTableColumnDef } from '@npm-questionpro/wick-ui-lib';
import { AiLabel } from '@/components/ui/AiLabel';
import type { StudyQuest } from '@/data/mock-projects';
import {
  buildStudySummary,
  type StudySummaryLog,
} from '@/data/mock-study-analytics';

const WuCard = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuCard })),
  { ssr: false }
);
const WuButton = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuButton })),
  { ssr: false }
);
const WuCombobox = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuCombobox })),
  { ssr: false }
);
const WuLoader = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuLoader })),
  { ssr: false }
);
const WuModal = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuModal })),
  { ssr: false }
);
const WuModalHeader = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuModalHeader })),
  { ssr: false }
);
const WuModalContent = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuModalContent })),
  { ssr: false }
);
const WuModalFooter = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuModalFooter })),
  { ssr: false }
);
const WuModalClose = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuModalClose })),
  { ssr: false }
);
const WuTable = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuTable })),
  { ssr: false }
);
const WuActivityLog = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuActivityLog })),
  { ssr: false }
);

interface Option {
  value: string;
  label: string;
}

interface StudyAiSummaryCardProps {
  quests: StudyQuest[];
}

export function StudyAiSummaryCard({ quests }: StudyAiSummaryCardProps) {
  const { showToast } = useWuShowToast();
  const [logs, setLogs] = useState<StudySummaryLog[]>([]);
  const [generateOpen, setGenerateOpen] = useState(false);
  const [logsOpen, setLogsOpen] = useState(false);
  const [viewing, setViewing] = useState<StudySummaryLog | null>(null);
  const [generating, setGenerating] = useState(false);
  const [selectedQuests, setSelectedQuests] = useState<Option[]>([]);
  const [selectedTasks, setSelectedTasks] = useState<Option[]>([]);

  const questOptions = useMemo<Option[]>(
    () => quests.map((quest) => ({ value: quest.id, label: quest.title })),
    [quests]
  );

  const taskOptions = useMemo<Option[]>(() => {
    const pool = selectedQuests.length === 0 ? quests : quests.filter((quest) => selectedQuests.some((item) => item.value === quest.id));
    return pool.flatMap((quest) =>
      quest.tasks.map((task) => ({
        value: task.id,
        label: `${quest.title} · ${task.title}`,
      }))
    );
  }, [quests, selectedQuests]);

  const latest = logs[0];

  function openGenerate() {
    setSelectedQuests(questOptions);
    setSelectedTasks(
      quests.flatMap((quest) =>
        quest.tasks.map((task) => ({
          value: task.id,
          label: `${quest.title} · ${task.title}`,
        }))
      )
    );
    setGenerateOpen(true);
  }

  function handleGenerate() {
    const questTitles =
      selectedQuests.length === 0 || selectedQuests.length === questOptions.length
        ? []
        : selectedQuests.map((item) => item.label);
    const taskTitles =
      selectedTasks.length === 0 || selectedTasks.length === taskOptions.length
        ? []
        : selectedTasks.map((item) => item.label.split(' · ').pop() ?? item.label);
    const allQuests = selectedQuests.length === 0 || selectedQuests.length === questOptions.length;
    const allTasks = selectedTasks.length === 0 || selectedTasks.length === taskOptions.length;
    const scope = [
      allQuests ? 'All quests' : selectedQuests.map((item) => item.label).join(', '),
      allTasks ? 'All tasks' : selectedTasks.map((item) => item.label.split(' · ').pop()).join(', '),
    ].join(' · ');
    const now = new Date();
    const body = buildStudySummary(questTitles, taskTitles);
    const log: StudySummaryLog = {
      id: `sum-${now.getTime()}`,
      createdAt: now.toISOString(),
      date: format(now, 'MMM d, yyyy'),
      time: format(now, 'h:mm a'),
      userName: 'Ayush Mehta',
      userInitials: 'AM',
      scope,
      description: `Generated summary for ${scope}`,
      body,
    };
    setGenerating(true);
    window.setTimeout(() => {
      setLogs((current) => [log, ...current]);
      setGenerating(false);
      setGenerateOpen(false);
      showToast({ message: 'Summary generated', variant: 'success' });
    }, 1200);
  }

  const columns: IWuTableColumnDef<StudySummaryLog>[] = [
    {
      accessorKey: 'date',
      header: 'Created at',
      cell: ({ row }) => `${row.original.date} · ${row.original.time}`,
    },
    {
      accessorKey: 'scope',
      header: 'Scope',
    },
    {
      accessorKey: 'id',
      header: 'Actions',
      cell: ({ row }) => (
        <WuButton
          variant="link"
          size="sm"
          onClick={() => {
            setViewing(row.original);
            setLogsOpen(false);
          }}
        >
          View
        </WuButton>
      ),
    },
  ];

  return (
    <>
      <WuCard rounded className="qp-card-depth p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-base font-semibold text-ink">
            <AiLabel>AI summaries</AiLabel>
          </h3>
          {latest ? (
            <div className="flex items-center gap-2">
              <WuButton variant="outline" size="sm" onClick={() => setLogsOpen(true)}>
                Summary logs
              </WuButton>
              <WuButton size="sm" onClick={openGenerate}>
                Generate another
              </WuButton>
            </div>
          ) : (
            <WuButton onClick={openGenerate}>Generate summary</WuButton>
          )}
        </div>
        {latest ? (
          <div>
            <p className="mb-2 text-xs text-ink-muted">
              Latest · {latest.date} · {latest.scope}
            </p>
            <p className="whitespace-pre-line text-sm text-ink">{latest.body}</p>
          </div>
        ) : (
          <p className="text-sm text-ink-muted">
            Generate a text summary for selected quests and tasks, or for the whole study.
          </p>
        )}
      </WuCard>

      <WuModal open={generateOpen} onOpenChange={setGenerateOpen} size="md">
        <WuModalHeader>Generate summary</WuModalHeader>
        <WuModalContent>
          {generating ? (
            <div className="flex min-h-40 items-center justify-center">
              <WuLoader message="Writing summary" />
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <WuCombobox
                data={questOptions}
                accessorKey={{ value: 'value', label: 'label' }}
                value={selectedQuests}
                onSelect={(value) => {
                  const next = (Array.isArray(value) ? value : value ? [value] : []) as Option[];
                  setSelectedQuests(next);
                  setSelectedTasks([]);
                }}
                Label="Quests"
                variant="outlined"
                multiple
                selectAll={{ enable: true, label: 'All quests', triggerText: 'All quests' }}
                placeholder="Select quests"
              />
              <WuCombobox
                data={taskOptions}
                accessorKey={{ value: 'value', label: 'label' }}
                value={selectedTasks}
                onSelect={(value) => {
                  const next = (Array.isArray(value) ? value : value ? [value] : []) as Option[];
                  setSelectedTasks(next);
                }}
                Label="Tasks"
                variant="outlined"
                multiple
                selectAll={{ enable: true, label: 'All tasks', triggerText: 'All tasks' }}
                placeholder="Select tasks"
              />
            </div>
          )}
        </WuModalContent>
        <WuModalFooter>
          <WuModalClose variant="secondary">Cancel</WuModalClose>
          <WuButton onClick={handleGenerate} disabled={generating} loading={generating}>
            Generate summary
          </WuButton>
        </WuModalFooter>
      </WuModal>

      <WuModal open={logsOpen} onOpenChange={setLogsOpen} size="lg">
        <WuModalHeader>Summary logs</WuModalHeader>
        <WuModalContent>
          <div className="mb-4">
            <WuActivityLog
              logs={logs}
              accessorKey={{
                id: 'id',
                date: 'date',
                time: 'time',
                userName: 'userName',
                userInitials: 'userInitials',
                description: 'description',
              }}
            />
          </div>
          <WuTable
            data={logs as unknown[]}
            columns={columns as unknown as IWuTableColumnDef<unknown>[]}
            variant="striped"
            NoDataContent={<p className="py-6 text-center text-sm text-ink-muted">No summaries yet.</p>}
          />
        </WuModalContent>
        <WuModalFooter>
          <WuModalClose variant="secondary">Close</WuModalClose>
        </WuModalFooter>
      </WuModal>

      <WuModal open={viewing !== null} onOpenChange={(open) => !open && setViewing(null)} size="md">
        <WuModalHeader>Summary · {viewing?.date}</WuModalHeader>
        <WuModalContent>
          <p className="mb-3 text-xs text-ink-muted">{viewing?.scope}</p>
          <p className="whitespace-pre-line text-sm text-ink">{viewing?.body}</p>
        </WuModalContent>
        <WuModalFooter>
          <WuButton
            variant="secondary"
            onClick={() => {
              setViewing(null);
              setLogsOpen(true);
            }}
          >
            Back to logs
          </WuButton>
          <WuModalClose variant="secondary">Close</WuModalClose>
        </WuModalFooter>
      </WuModal>
    </>
  );
}
