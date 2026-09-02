'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useWuShowToast } from '@npm-questionpro/wick-ui-lib';
import { format } from 'date-fns';
import { EmptyState } from '@/components/ui/EmptyState';
import { QuestTaskList } from '@/components/projects/QuestTaskList';
import { AddTaskPanel, taskTypeLabel } from '@/components/projects/AddTaskPanel';
import { getFolderById, getQuestById, type QuestTask, type QuestTaskType } from '@/data/mock-projects';
import { defaultTreeTestingConfig } from '@/data/mock-tree-testing';
import { cloneTree } from '@/data/tree-utils';

const WuButton = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuButton })),
  { ssr: false }
);
const WuTextarea = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuTextarea })),
  { ssr: false }
);

export default function QuestBuilderPage() {
  const { id: folderId, studyId, questId } = useParams<{
    id: string;
    studyId: string;
    questId: string;
  }>();
  const { showToast } = useWuShowToast();
  const router = useRouter();
  const folder = getFolderById(folderId);
  const matched = getQuestById(folderId, studyId, questId);

  const [description, setDescription] = useState(matched?.quest.description ?? '');
  const [editingDescription, setEditingDescription] = useState(false);
  const [tasks, setTasks] = useState<QuestTask[]>(matched?.quest.tasks ?? []);
  const [panelOpen, setPanelOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<QuestTaskType | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(matched?.quest.tasks[0]?.id ?? null);

  if (!folder || !matched) {
    return (
      <div className="px-4 py-8">
        <EmptyState
          icon="wm-error-outline"
          title="Quest not found"
          description="This quest doesn't exist or has been removed."
          action={
            <Link href="/projects" className="qp-link text-sm">
              Back to folders
            </Link>
          }
        />
      </div>
    );
  }

  const { study, quest } = matched;
  const startsLabel = quest.startsAt
    ? format(new Date(quest.startsAt), 'MM/dd/yyyy hh:mm a')
    : null;

  function nextTitle(type: QuestTaskType) {
    const label = taskTypeLabel(type);
    const count = tasks.filter((task) => (task.type ?? 'survey') === type).length + 1;
    return `${label} ${String(count).padStart(2, '0')}`;
  }

  function handleSelectType(type: QuestTaskType) {
    setSelectedType(type);
    const task: QuestTask = {
      id: `t-${Date.now()}`,
      title: nextTitle(type),
      type,
      treeTesting:
        type === 'tree-testing'
          ? {
              tree: cloneTree(defaultTreeTestingConfig().tree),
              findabilityTasks: defaultTreeTestingConfig().findabilityTasks,
            }
          : undefined,
    };
    setTasks((current) => [...current, task]);
    setExpandedId(task.id);
    setPanelOpen(false);
    setSelectedType(null);
    showToast({ message: `"${task.title}" added`, variant: 'success' });
  }

  return (
    <div className="qp-enter min-h-full bg-surface-sunken px-4 py-8">
      <div className="mb-4 flex items-center justify-between gap-2">
        <Link
          href={`/projects/${folderId}/${studyId}`}
          className="qp-link inline-flex items-center gap-1 text-sm"
        >
          <span className="wm-arrow-back text-base" />
          {study.heroTitle ?? study.name}
        </Link>
      </div>

      <nav className="mb-8 text-sm text-ink-muted">
        <Link href="/projects" className="qp-link">Folders</Link>
        <span className="mx-1.5">/</span>
        <Link href={`/projects/${folderId}`} className="qp-link">{folder.name}</Link>
        <span className="mx-1.5">/</span>
        <Link href={`/projects/${folderId}/${studyId}`} className="qp-link">
          {study.heroTitle ?? study.name}
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-ink">{quest.title}</span>
      </nav>

      <div className="flex items-start gap-8">
        {panelOpen && (
          <AddTaskPanel selectedType={selectedType} onSelect={handleSelectType} />
        )}
        <div className="mx-auto min-w-0 flex-1 max-w-3xl">
          <div className="overflow-hidden rounded-xl border border-line bg-surface wu-shadow-sm">
            <div className="h-1.5 bg-accent" />
            <div className="flex items-center justify-end gap-2 px-5 pt-4 text-sm text-ink-muted">
              {startsLabel && <span>Starts - {startsLabel}</span>}
              <WuButton
                variant="iconOnly"
                aria-label="Quest settings"
                Icon={<span className="wm-settings text-accent" />}
                onClick={() => showToast({ message: 'Quest settings saved', variant: 'success' })}
              />
            </div>
            <div className="px-5 pb-4">
              <h1 className="text-3xl font-semibold text-ink">{quest.title}</h1>
              {editingDescription ? (
                <div className="mt-3 flex flex-col items-start gap-2">
                  <WuTextarea
                    variant="outlined"
                    placeholder="Add description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                  <WuButton
                    size="sm"
                    onClick={() => {
                      setEditingDescription(false);
                      showToast({ message: 'Description saved', variant: 'success' });
                    }}
                  >
                    Save
                  </WuButton>
                </div>
              ) : (
                <WuButton
                  variant="link"
                  size="sm"
                  onClick={() => setEditingDescription(true)}
                >
                  {description.trim() || 'Add description'}
                </WuButton>
              )}
            </div>
            <QuestTaskList
              tasks={tasks}
              expandedId={expandedId}
              onExpand={setExpandedId}
              onAnalyze={(task) =>
                router.push(`/projects/${folderId}/${studyId}/analytics?task=${task.id}`)
              }
              onChange={(task) =>
                setTasks((current) => current.map((item) => (item.id === task.id ? task : item)))
              }
              onDuplicate={(task) => {
                const copy: QuestTask = {
                  ...task,
                  id: `t-${Date.now()}`,
                  title: `${task.title} copy`,
                  treeTesting: task.treeTesting
                    ? {
                        tree: cloneTree(task.treeTesting.tree),
                        findabilityTasks: task.treeTesting.findabilityTasks,
                      }
                    : undefined,
                };
                setTasks((current) => [...current, copy]);
                showToast({ message: `"${task.title}" duplicated`, variant: 'success' });
              }}
              onDelete={(task) => {
                setTasks((current) => current.filter((item) => item.id !== task.id));
                if (expandedId === task.id) setExpandedId(null);
                showToast({ message: `"${task.title}" deleted`, variant: 'success' });
              }}
            />
          </div>

          <div className="mt-4 flex justify-center">
            <WuButton
              variant={panelOpen ? 'secondary' : 'outline'}
              Icon={<span className={panelOpen ? 'wm-close' : 'wm-add'} />}
              onClick={() => setPanelOpen((open) => !open)}
            >
              {panelOpen ? 'Close' : 'New task'}
            </WuButton>
          </div>
        </div>
      </div>
    </div>
  );
}
