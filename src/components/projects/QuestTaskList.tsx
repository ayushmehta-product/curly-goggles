'use client';

import dynamic from 'next/dynamic';
import type { QuestTask } from '@/data/mock-projects';
import { TreeTestingSetup } from '@/components/projects/TreeTestingSetup';
import { CardSortingSetup } from '@/components/projects/CardSortingSetup';
import { taskTypeIcon } from '@/components/projects/AddTaskPanel';
import { defaultTreeTestingConfig } from '@/data/mock-tree-testing';
import { defaultCardSortingConfig } from '@/data/mock-card-sorting';

const WuMenu = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuMenu })),
  { ssr: false }
);
const WuMenuItem = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuMenuItem })),
  { ssr: false }
);
const WuMenuSeparatorItem = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuMenuSeparatorItem })),
  { ssr: false }
);
const WuToggle = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuToggle })),
  { ssr: false }
);
const WuTextarea = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuTextarea })),
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

interface QuestTaskListProps {
  tasks: QuestTask[];
  expandedId: string | null;
  onExpand: (id: string | null) => void;
  onChange: (task: QuestTask) => void;
  onDuplicate: (task: QuestTask) => void;
  onDelete: (task: QuestTask) => void;
  onAnalyze?: (task: QuestTask) => void;
}

export function QuestTaskList({
  tasks,
  expandedId,
  onExpand,
  onChange,
  onDuplicate,
  onDelete,
  onAnalyze,
}: QuestTaskListProps) {
  if (tasks.length === 0) {
    return (
      <p className="px-4 py-6 text-center text-sm text-ink-muted">No tasks yet. Add a task to get started.</p>
    );
  }

  return (
    <div className="flex flex-col gap-3 px-4 pb-4">
      {tasks.map((task, index) => {
        const expanded = expandedId === task.id;
        const isTree = task.type === 'tree-testing';
        const isCardSort = task.type === 'card-sorting';
        return (
          <WuCard
            key={task.id}
            rounded
            className={`overflow-hidden border bg-surface wu-shadow-sm transition-colors duration-150 ${
              expanded ? 'border-accent' : 'border-line'
            }`}
          >
            <div className="flex items-stretch">
              <div
                className={`flex w-8 items-center justify-center text-sm font-semibold transition-colors duration-200 ${
                  expanded ? 'bg-accent text-inverse' : 'bg-surface-sunken text-ink-muted'
                }`}
              >
                {index + 1}
              </div>
              <div className="flex min-w-0 flex-1 flex-col">
                <div
                  className={`flex items-center gap-2 px-3 py-3 transition-colors duration-150 ${
                    expanded ? 'bg-surface' : 'bg-surface-sunken'
                  }`}
                >
                  <span className={`${taskTypeIcon(task.type ?? 'survey')} text-lg text-ink-muted`} />
                  <span className="flex-1 truncate text-sm font-medium text-ink">{task.title}</span>
                  <WuButton
                    variant="iconOnly"
                    size="sm"
                    aria-label={expanded ? 'Collapse task' : 'Expand task'}
                    Icon={
                      <span
                        className={`wm-expand-more text-ink-muted transition-transform duration-200 ${
                          expanded ? 'rotate-180' : 'rotate-0'
                        }`}
                      />
                    }
                    onClick={() => onExpand(expanded ? null : task.id)}
                  />
                  <WuMenu
                    Trigger={
                      <WuButton
                        variant="iconOnly"
                        size="sm"
                        aria-label="Task actions"
                        Icon={<span className="wm-more-vert text-ink-muted" />}
                      />
                    }
                    align="end"
                  >
                    {(isTree || isCardSort) && onAnalyze && (
                      <WuMenuItem onSelect={() => onAnalyze(task)}>View analysis</WuMenuItem>
                    )}
                    <WuMenuItem onSelect={() => onDuplicate(task)}>Duplicate</WuMenuItem>
                    <WuMenuSeparatorItem />
                    <WuMenuItem onSelect={() => onDelete(task)}>Delete</WuMenuItem>
                  </WuMenu>
                </div>
                {expanded && (
                  <div className="qp-enter border-t border-line bg-surface px-4 py-4">
                    <div className="mb-4 flex items-center gap-2 text-sm text-ink">
                      Description
                      <WuToggle
                        checked={Boolean(task.showDescription)}
                        onChange={(checked) => onChange({ ...task, showDescription: checked })}
                      />
                    </div>
                    {task.showDescription && (
                      <div className="mb-4">
                        <WuTextarea
                          variant="outlined"
                          placeholder="Description"
                          value={task.description ?? ''}
                          onChange={(e) => onChange({ ...task, description: e.target.value })}
                        />
                      </div>
                    )}
                    {isTree ? (
                      <TreeTestingSetup
                        config={task.treeTesting ?? defaultTreeTestingConfig()}
                        onChange={(treeTesting) => onChange({ ...task, treeTesting })}
                      />
                    ) : isCardSort ? (
                      <CardSortingSetup
                        config={task.cardSorting ?? defaultCardSortingConfig()}
                        onChange={(cardSorting) => onChange({ ...task, cardSorting })}
                      />
                    ) : (
                      <p className="text-sm text-ink-muted">
                        Configure this {task.type ?? 'survey'} task in the next version of this prototype.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </WuCard>
        );
      })}
    </div>
  );
}
