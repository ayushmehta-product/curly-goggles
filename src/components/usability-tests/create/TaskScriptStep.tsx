'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';

const WuButton = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuButton })),
  { ssr: false }
);
const WuInput = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuInput })),
  { ssr: false }
);
const WuTextarea = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuTextarea })),
  { ssr: false }
);
const WuSelect = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuSelect })),
  { ssr: false }
);

interface TaskScriptStepProps {
  onBack: () => void;
  onSaveDraft: () => void;
  onContinue: () => void;
}

interface SelectOption { value: string; label: string; }

const TASK_TYPE_OPTIONS: SelectOption[] = [
  { value: 'navigation', label: 'Navigation task' },
  { value: 'form', label: 'Form completion' },
  { value: 'search', label: 'Search & find' },
  { value: 'decision', label: 'Decision making' },
  { value: 'open', label: 'Open exploration' },
];

interface Task {
  id: string;
  title: string;
  instructions: string;
  type: SelectOption | null;
  successCriteria: string;
}

function TaskCard({
  task,
  index,
  onChange,
  onRemove,
}: {
  task: Task;
  index: number;
  onChange: (task: Task) => void;
  onRemove: () => void;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-700">Task {index + 1}</span>
        <button
          type="button"
          onClick={onRemove}
          className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500"
          aria-label="Remove task"
        >
          <span className="wm-delete text-base" />
        </button>
      </div>

      <div className="space-y-3">
        <WuInput
          Label="Task title"
          variant="outlined"
          placeholder="e.g. Find and complete checkout"
          value={task.title}
          onChange={(e) => onChange({ ...task, title: e.target.value })}
        />
        <WuTextarea
          Label="Participant instructions"
          variant="outlined"
          placeholder="Describe what you'd like the participant to do, in plain language."
          value={task.instructions}
          rows={2}
          onChange={(e) => onChange({ ...task, instructions: e.target.value })}
        />
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <WuSelect
            Label="Task type"
            data={TASK_TYPE_OPTIONS}
            accessorKey={{ value: 'value', label: 'label' }}
            value={task.type}
            onSelect={(v) => onChange({ ...task, type: v as SelectOption })}
            variant="outlined"
          />
          <WuInput
            Label="Success criteria"
            variant="outlined"
            placeholder="e.g. Participant reached confirmation page"
            value={task.successCriteria}
            onChange={(e) => onChange({ ...task, successCriteria: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}

export function TaskScriptStep({ onBack, onSaveDraft, onContinue }: TaskScriptStepProps) {
  const [tasks, setTasks] = useState<Task[]>([
    { id: 'task-1', title: '', instructions: '', type: null, successCriteria: '' },
  ]);

  function addTask() {
    setTasks((prev) => [
      ...prev,
      { id: `task-${Date.now()}`, title: '', instructions: '', type: null, successCriteria: '' },
    ]);
  }

  function updateTask(id: string, updated: Task) {
    setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
  }

  function removeTask(id: string) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="border-b border-gray-100 px-5 py-3">
          <h2 className="text-base font-semibold text-gray-900">Discussion Guide</h2>
          <p className="mt-1 text-sm text-gray-500">
            Define the tasks participants will complete during the test.
          </p>
        </div>

        <div className="space-y-4 p-5">
          {tasks.map((task, index) => (
            <TaskCard
              key={task.id}
              task={task}
              index={index}
              onChange={(updated) => updateTask(task.id, updated)}
              onRemove={() => removeTask(task.id)}
            />
          ))}

          <WuButton variant="secondary" Icon={<span className="wm-add" />} onClick={addTask}>
            Add Task
          </WuButton>

          <div className="rounded-md bg-gray-50 px-3 py-2 text-xs leading-5 text-gray-600">
            Tasks are shown to participants one at a time in the order listed. Behaviour analytics (clicks, scroll depth, paths) are recorded per task when tracking is connected.
          </div>
        </div>

        <div className="sticky bottom-0 z-20 flex items-center justify-between border-t border-gray-100 bg-white px-5 py-3 shadow-[0_-8px_20px_rgba(15,23,42,0.06)]">
          <WuButton variant="secondary" onClick={onBack}>Back</WuButton>
          <div className="flex items-center gap-2">
            <WuButton variant="secondary" onClick={onSaveDraft}>Save Draft</WuButton>
            <WuButton Icon={<span className="wm-arrow-forward" />} iconPosition="right" onClick={onContinue}>
              Continue
            </WuButton>
          </div>
        </div>
      </div>

      <aside className="space-y-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900">Task Guide</h3>
          <ul className="mt-3 space-y-2 text-xs leading-5 text-gray-600">
            <li className="flex gap-2"><span className="mt-0.5 text-blue-600">1.</span> Keep instructions concise — participants should be able to read them in under 30 seconds.</li>
            <li className="flex gap-2"><span className="mt-0.5 text-blue-600">2.</span> Avoid leading language like "Use the checkout button" — let participants navigate naturally.</li>
            <li className="flex gap-2"><span className="mt-0.5 text-blue-600">3.</span> Define a clear success state so analytics can automatically flag completions.</li>
          </ul>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900">Tasks configured</h3>
          <p className="mt-2 text-2xl font-semibold text-gray-900">{tasks.length}</p>
          <p className="mt-1 text-xs text-gray-500">task{tasks.length === 1 ? '' : 's'} added</p>
        </div>
      </aside>
    </div>
  );
}
