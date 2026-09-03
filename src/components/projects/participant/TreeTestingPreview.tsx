'use client';

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useWuShowToast } from '@npm-questionpro/wick-ui-lib';
import { EmptyState } from '@/components/ui/EmptyState';
import type { FindabilityTask, TreeTestingConfig } from '@/data/mock-tree-testing';
import { findNode, type TreeNode } from '@/data/tree-utils';

const WuButton = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuButton })),
  { ssr: false }
);
const WuChip = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuChip })),
  { ssr: false }
);

interface TreeTestingPreviewProps {
  title: string;
  config: TreeTestingConfig;
  backHref: string;
}

const BROWSE_PROMPT: FindabilityTask = {
  id: 'browse',
  prompt: 'Where would you look for this information? Click through the topics until you reach a last page, then select it.',
  correctLeafIds: [],
};

const EASE_OPTIONS = [
  { value: '1', label: 'Very difficult' },
  { value: '2', label: 'Difficult' },
  { value: '3', label: 'Neutral' },
  { value: '4', label: 'Easy' },
  { value: '5', label: 'Very easy' },
];

const CONFIDENCE_OPTIONS = [
  { value: '1', label: 'Not at all' },
  { value: '2', label: 'Slightly' },
  { value: '3', label: 'Moderately' },
  { value: '4', label: 'Very' },
  { value: '5', label: 'Completely' },
];

function findPath(nodes: TreeNode[], id: string, trail: TreeNode[] = []): TreeNode[] | null {
  for (const node of nodes) {
    const next = [...trail, node];
    if (node.id === id) return next;
    const nested = findPath(node.children, id, next);
    if (nested) return nested;
  }
  return null;
}

function startingNodeId(tree: TreeNode[]): string | null {
  if (tree.length === 1) return tree[0].id;
  return null;
}

function isLeaf(node: TreeNode): boolean {
  return node.children.length === 0;
}

export function TreeTestingPreview({ title, config, backHref }: TreeTestingPreviewProps) {
  const router = useRouter();
  const { showToast } = useWuShowToast();
  const tree = config.tree;
  const tasks = config.findabilityTasks.length > 0 ? config.findabilityTasks : [BROWSE_PROMPT];
  const startId = useMemo(() => startingNodeId(tree), [tree]);
  const [taskIndex, setTaskIndex] = useState(0);
  const [currentId, setCurrentId] = useState<string | null>(startId);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [ease, setEase] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const task = tasks[taskIndex];
  const current = currentId ? findNode(tree, currentId) : null;
  const children = current ? current.children : tree;
  const trail = currentId ? (findPath(tree, currentId) ?? []) : [];
  const canGoBack = trail.length > 1 || (trail.length === 1 && startId === null);
  const selectedIsLeaf = Boolean(selectedId && findNode(tree, selectedId) && isLeaf(findNode(tree, selectedId)!));
  const canSubmit = selectedIsLeaf && ease !== null && confidence !== null;
  const isLastTask = taskIndex >= tasks.length - 1;

  function resetLocation() {
    setCurrentId(startId);
    setSelectedId(null);
  }

  function resetTask() {
    resetLocation();
    setEase(null);
    setConfidence(null);
  }

  function goBack() {
    if (trail.length <= 1) {
      resetLocation();
      setSelectedId(null);
      return;
    }
    const parent = trail[trail.length - 2];
    setCurrentId(parent.id);
    setSelectedId(null);
  }

  function submitTask() {
    if (!canSubmit) return;
    if (isLastTask) {
      setDone(true);
      showToast({ message: 'Tree test completed (preview)', variant: 'success' });
      return;
    }
    setTaskIndex((index) => index + 1);
    resetTask();
    showToast({ message: 'Answer recorded', variant: 'success' });
  }

  function onOpenBranch(node: TreeNode) {
    setCurrentId(node.id);
    setSelectedId(null);
  }

  if (tree.length === 0) {
    return (
      <EmptyState
        icon="wm-account-tree"
        title="This tree test has no navigation yet"
        description="Add a tree in the quest builder, then preview again."
        action={
          <WuButton variant="secondary" onClick={() => router.push(backHref)}>
            Back to tasks
          </WuButton>
        }
      />
    );
  }

  if (done) {
    return (
      <div className="flex flex-col items-start gap-4">
        <h2 className="text-3xl font-semibold text-[var(--qp-q-blue)]">{title}</h2>
        <p className="text-ink">You finished this tree test. Thank you for previewing it.</p>
        <WuButton onClick={() => router.push(backHref)}>Back to tasks</WuButton>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8">
      <div>
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <p className="text-sm text-ink-muted">
            Task {taskIndex + 1} of {tasks.length}
          </p>
          {task.isWarmup ? (
            <WuChip size="sm" variant="secondary">
              Warmup
            </WuChip>
          ) : null}
        </div>
        <h2 className="text-2xl font-semibold text-[var(--qp-q-blue)]">{title}</h2>
        <p className="mt-2 text-lg text-ink">{task.prompt}</p>
        {task.description ? <p className="mt-1 text-sm text-ink-muted">{task.description}</p> : null}
      </div>

      <section className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <nav aria-label="Current path" className="flex flex-wrap items-center gap-1 text-sm">
            {trail.length === 0 ? (
              <span className="text-ink">Home</span>
            ) : (
              trail.map((node, index) => (
                <span key={node.id} className="inline-flex items-center gap-1">
                  {index > 0 && <span className="text-ink-muted">›</span>}
                  <button
                    type="button"
                    className="qp-link"
                    onClick={() => {
                      setCurrentId(index === 0 ? startId : node.id);
                      setSelectedId(null);
                    }}
                  >
                    {node.label}
                  </button>
                </span>
              ))
            )}
          </nav>
          {canGoBack ? (
            <WuButton variant="secondary" size="sm" onClick={goBack}>
              <span className="wm-arrow-back" />
              Back
            </WuButton>
          ) : null}
        </div>

        <ul className="flex flex-col gap-3">
          {children.length === 0 ? (
            <li className="rounded-lg border border-line bg-[var(--qp-gray-20)] px-4 py-6 text-sm text-ink-muted">
              No more pages under this topic. Go back and choose a last page.
            </li>
          ) : (
            children.map((node) => {
              if (isLeaf(node)) {
                const selected = selectedId === node.id;
                return (
                  <li key={node.id}>
                    <label
                      className={`flex cursor-pointer items-center gap-3 rounded-lg px-5 py-4 qp-card-depth ${
                        selected
                          ? 'border-accent bg-[var(--qp-title-line)] ring-1 ring-accent'
                          : 'hover:bg-[var(--qp-gray-20)]'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`tree-leaf-${task.id}`}
                        value={node.id}
                        checked={selected}
                        onChange={() => setSelectedId(node.id)}
                        className="h-5 w-5 shrink-0 accent-[var(--qp-p-blue)]"
                      />
                      <span className="text-base font-medium text-ink">{node.label}</span>
                    </label>
                  </li>
                );
              }

              return (
                <li key={node.id}>
                  <button
                    type="button"
                    aria-label={`${node.label}, next`}
                    onClick={() => onOpenBranch(node)}
                    className="flex w-full items-center justify-between gap-3 rounded-lg px-5 py-4 text-left qp-card-depth hover:bg-[var(--qp-gray-20)]"
                  >
                    <span className="text-base font-medium text-ink">{node.label}</span>
                    <span className="wm-chevron-right text-xl text-accent" aria-hidden />
                  </button>
                </li>
              );
            })
          )}
        </ul>
        <p className="text-sm text-ink-muted">
          Topics with a next arrow open more pages. Last pages use a radio — choose one as your answer.
        </p>
      </section>

      <section className="flex flex-col gap-6 rounded-lg border border-line bg-[var(--qp-gray-20)] p-4">
        <h3 className="text-base font-semibold text-ink">Task usability</h3>
        <ChoiceScale
          legend="How easy was this task?"
          name={`ease-${task.id}`}
          value={ease}
          options={EASE_OPTIONS}
          onChange={setEase}
        />
        <ChoiceScale
          legend="How confident are you that you found the right place?"
          name={`confidence-${task.id}`}
          value={confidence}
          options={CONFIDENCE_OPTIONS}
          onChange={setConfidence}
        />
      </section>

      <div className="flex flex-col items-end gap-2">
        {!canSubmit ? (
          <p className="text-sm text-ink-muted">
            Select a last page and answer both usability questions to submit.
          </p>
        ) : null}
        <WuButton disabled={!canSubmit} onClick={submitTask}>
          {isLastTask ? 'Submit' : 'Submit and continue'}
        </WuButton>
      </div>
    </div>
  );
}

function ChoiceScale({
  legend,
  name,
  value,
  options,
  onChange,
}: {
  legend: string;
  name: string;
  value: string | null;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium text-ink">{legend}</legend>
      <div className="grid gap-2 sm:grid-cols-5">
        {options.map((option) => {
          const selected = value === option.value;
          return (
            <label
              key={option.value}
              className={`flex cursor-pointer flex-col items-center gap-2 rounded-lg border bg-surface px-3 py-3 text-center ${
                selected ? 'border-accent bg-[var(--qp-title-line)] ring-1 ring-accent' : 'border-line hover:bg-white'
              }`}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={selected}
                onChange={() => onChange(option.value)}
                className="h-4 w-4 accent-[var(--qp-p-blue)]"
              />
              <span className="text-xs text-ink">{option.label}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
