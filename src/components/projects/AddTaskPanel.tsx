'use client';

import type { QuestTaskType } from '@/data/mock-projects';

export const TASK_TYPE_OPTIONS: {
  type: QuestTaskType;
  label: string;
  icon: string;
}[] = [
  { type: 'conversation', label: 'Conversation', icon: 'wm-forum' },
  { type: 'fill-in-the-blank', label: 'Fill in the blank', icon: 'wm-edit' },
  { type: 'idea-markup', label: 'Idea markup', icon: 'wm-lightbulb' },
  { type: 'survey', label: 'Survey', icon: 'wm-assignment' },
  { type: 'video', label: 'Video', icon: 'wm-videocam' },
  { type: 'voting', label: 'Voting', icon: 'wm-thumb-up' },
  { type: 'photo-journal', label: 'Photo journal', icon: 'wm-photo-camera' },
  { type: 'tree-testing', label: 'Tree testing', icon: 'wm-account-tree' },
];

interface AddTaskPanelProps {
  selectedType: QuestTaskType | null;
  onSelect: (type: QuestTaskType) => void;
}

export function AddTaskPanel({ selectedType, onSelect }: AddTaskPanelProps) {
  return (
    <aside className="qp-enter-left w-64 shrink-0 overflow-hidden rounded-lg border border-[var(--qp-gray-40)] bg-[var(--qp-gray-20)] p-4">
      <div className="mb-3">
        <h2 className="text-sm font-semibold text-ink">Add a task</h2>
      </div>
      <div className="flex flex-col gap-2">
        {TASK_TYPE_OPTIONS.map((option) => {
          const selected = selectedType === option.type;
          return (
            <button
              key={option.type}
              type="button"
              onClick={() => onSelect(option.type)}
              className={`flex items-center gap-1 rounded border px-3 py-2.5 text-left text-sm transition-all duration-150 ${
                selected
                  ? 'border-accent bg-surface text-ink ring-1 ring-accent'
                  : 'border-line bg-surface text-ink hover:border-accent hover:bg-surface hover:text-[var(--qp-q-blue)]'
              }`}
            >
              <span className={`${option.icon} text-lg ${selected ? 'text-accent' : 'text-ink-muted'}`} />
              {option.label}
            </button>
          );
        })}
      </div>
    </aside>
  );
}

export function taskTypeLabel(type: QuestTaskType | undefined): string {
  return TASK_TYPE_OPTIONS.find((option) => option.type === type)?.label ?? 'Survey';
}

export function taskTypeIcon(type: QuestTaskType | undefined): string {
  return TASK_TYPE_OPTIONS.find((option) => option.type === type)?.icon ?? 'wm-assignment';
}
