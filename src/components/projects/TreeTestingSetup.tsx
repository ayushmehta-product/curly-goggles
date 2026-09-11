'use client';

import { useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { useWuShowToast } from '@npm-questionpro/wick-ui-lib';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { TreeEditor } from '@/components/projects/TreeEditor';
import type { FindabilityChoice, FindabilityTask, TreeTestingConfig } from '@/data/mock-tree-testing';
import { MOCK_DUNKIN_TREE, createFindabilityTask } from '@/data/mock-tree-testing';
import type { DropPosition, TreeNode } from '@/data/tree-utils';
import {
  addChildNode,
  cloneTree,
  createTreeNode,
  emptyTree,
  findNode,
  flattenTree,
  insertNode,
  matchTreeNodes,
  parseTreeCsv,
  removeNode,
  setDesiredNode,
  updateNodeLabel,
} from '@/data/tree-utils';

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
const WuToggle = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuToggle })),
  { ssr: false }
);

interface TreeTestingSetupProps {
  config: TreeTestingConfig;
  onChange: (config: TreeTestingConfig) => void;
}

export function TreeTestingSetup({ config, onChange }: TreeTestingSetupProps) {
  const { showToast } = useWuShowToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState('');
  const [fetching, setFetching] = useState(false);
  const [removeId, setRemoveId] = useState<string | null>(null);

  const tree = config.tree;
  const pendingRemove = removeId ? findNode(tree, removeId) : null;

  function setTree(next: TreeNode[]) {
    const ids = new Set(flattenTree(next).map((node) => node.id));
    onChange({
      ...config,
      tree: next,
      findabilityTasks: config.findabilityTasks.map((task) => ({
        ...task,
        correctLeafIds: task.correctLeafIds.filter((id) => ids.has(id)),
      })),
    });
  }

  async function handleFetch() {
    if (!url.trim()) {
      showToast({ message: 'Enter a website URL', variant: 'error' });
      return;
    }
    setFetching(true);
    try {
      const response = await fetch('/api/sitemap-tree', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });
      const payload = (await response.json()) as {
        tree?: TreeNode[];
        urlCount?: number;
        source?: string;
        error?: string;
      };
      if (!response.ok || !payload.tree || payload.tree.length === 0) {
        showToast({
          message: payload.error ?? 'Could not fetch that navigation',
          variant: 'error',
        });
        return;
      }
      setTree(payload.tree);
      showToast({
        message: `Fetched ${payload.urlCount ?? 0} items from navigation`,
        variant: 'success',
      });
    } catch {
      showToast({ message: 'Could not fetch that website', variant: 'error' });
    } finally {
      setFetching(false);
    }
  }

  function handleFile(file: File | undefined) {
    if (!file) return;
    if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      setTree(cloneTree(MOCK_DUNKIN_TREE));
      showToast({ message: 'Spreadsheet imported', variant: 'success' });
      return;
    }
    file
      .text()
      .then((text) => {
        setTree(parseTreeCsv(text));
        showToast({ message: 'Spreadsheet imported', variant: 'success' });
      })
      .catch(() => showToast({ message: 'Could not read that file', variant: 'error' }));
  }

  function handleMove(draggedId: string, targetId: string, position: DropPosition) {
    setTree(insertNode(tree, draggedId, targetId, position));
  }

  function applyRemove(nodeId: string) {
    const result = removeNode(tree, nodeId);
    setTree(result.nodes);
    showToast({ message: 'Page removed', variant: 'success' });
    setRemoveId(null);
  }

  function handleRemove(nodeId: string) {
    const node = findNode(tree, nodeId);
    if (node && node.children.length > 0) {
      setRemoveId(nodeId);
      return;
    }
    applyRemove(nodeId);
  }

  function addFindabilityTask() {
    if (config.findabilityTasks.length >= 8) {
      showToast({ message: 'Keep tree tests to 5–8 findability tasks', variant: 'error' });
      return;
    }
    onChange({
      ...config,
      findabilityTasks: [...config.findabilityTasks, createFindabilityTask()],
    });
  }

  function updateTask(taskId: string, patch: Partial<FindabilityTask>) {
    onChange({
      ...config,
      findabilityTasks: config.findabilityTasks.map((item) =>
        item.id === taskId ? { ...item, ...patch } : item
      ),
    });
  }

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h4 className="mb-1 text-sm font-semibold text-ink">Tree</h4>
        <p className="mb-3 text-sm text-ink-muted">
          Hierarchy only — no visual design. Drag to reorder, drop on a row to nest, use add / remove
          to change pages. Mark one node as the desired end point.
        </p>
        <WuCard rounded className="bg-surface-sunken p-4 wu-shadow-sm">
          <p className="text-sm text-ink-muted">
            Fetch the page&apos;s navigation — header menus, mega-menu labels, or a help-center
            hierarchy. Not a sitemap of every URL. Or import a spreadsheet (homepage in column A, one
            category per row, deeper levels to the right).
          </p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-end">
            <div className="flex-1">
              <WuInput
                Label="Website URL"
                variant="outlined"
                placeholder="https://www.example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
            <WuButton
              Icon={<span className="wm-cloud-download" />}
              onClick={() => void handleFetch()}
              loading={fetching}
              disabled={fetching}
            >
              {fetching ? 'Fetching…' : 'Fetch navigation'}
            </WuButton>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <WuButton variant="secondary" onClick={() => fileRef.current?.click()}>
              Attach spreadsheet
            </WuButton>
            <WuButton variant="link" onClick={() => window.open('/tree-testing-template.csv', '_self')}>
              Download template
            </WuButton>
            <WuButton
              variant="outline"
              onClick={() => {
                setTree([...tree, createTreeNode('New page')]);
                showToast({ message: 'Page added', variant: 'success' });
              }}
            >
              Add page
            </WuButton>
            {tree.length > 0 && (
              <WuButton variant="link" onClick={() => setTree(emptyTree())}>
                Clear tree
              </WuButton>
            )}
            <input
              ref={fileRef}
              type="file"
              accept=".csv,.xlsx,.xls,text/csv"
              className="hidden"
              onChange={(event) => handleFile(event.target.files?.[0])}
            />
          </div>
        </WuCard>
        <div className="mt-4">
          <TreeEditor
            nodes={tree}
            onAddChild={(parentId) => {
              setTree(addChildNode(tree, parentId));
              showToast({ message: 'Page added', variant: 'success' });
            }}
            onRemove={handleRemove}
            onRename={(nodeId, label) => setTree(updateNodeLabel(tree, nodeId, label))}
            onMove={handleMove}
            onSetDesired={(nodeId) => {
              const next = setDesiredNode(tree, nodeId);
              const marked = flattenTree(next).find((node) => findNode(next, node.id)?.desired);
              setTree(next);
              showToast({
                message: marked ? `Desired end point: ${marked.label}` : 'Desired end point cleared',
                variant: 'success',
              });
            }}
          />
        </div>
      </section>

      <section>
        <div className="mb-3">
          <h4 className="text-sm font-semibold text-ink">Findability tasks</h4>
          <p className="text-sm text-ink-muted">
            5–8 scenario questions. Add destinations by typing — they auto-match pages already in the tree.
          </p>
        </div>
        <div className="flex flex-col gap-4">
          {config.findabilityTasks.map((task, index) => (
            <FindabilityQuestionCard
              key={task.id}
              index={index}
              task={task}
              tree={tree}
              onChange={(patch) => updateTask(task.id, patch)}
              onRemove={() =>
                onChange({
                  ...config,
                  findabilityTasks: config.findabilityTasks.filter((item) => item.id !== task.id),
                })
              }
            />
          ))}
        </div>
        <div className="mt-4 flex justify-center">
          <WuButton Icon={<span className="wm-add" />} onClick={addFindabilityTask}>
            Add question
          </WuButton>
        </div>
      </section>

      <ConfirmModal
        open={removeId !== null}
        onOpenChange={(open) => {
          if (!open) setRemoveId(null);
        }}
        title="Remove this page?"
        description={`${pendingRemove?.label ?? 'This page'} and all inside will be removed.`}
        confirmLabel="Remove"
        variant="critical"
        onConfirm={() => {
          if (removeId) applyRemove(removeId);
        }}
      />
    </div>
  );
}

const QUESTION_TYPES = [{ value: 'single-choice', label: 'Single choice' }];

function wrapText(value: string, before: string, after = before): string {
  return value ? `${before}${value}${after}` : `${before}${after}`;
}

function FindabilityQuestionCard({
  index,
  task,
  tree,
  onChange,
  onRemove,
}: {
  index: number;
  task: FindabilityTask;
  tree: TreeNode[];
  onChange: (patch: Partial<FindabilityTask>) => void;
  onRemove: () => void;
}) {
  const { showToast } = useWuShowToast();
  const choices = task.choices ?? [];
  const required = task.required !== false;
  const selectedType = QUESTION_TYPES[0];

  function setChoices(next: FindabilityChoice[]) {
    onChange({ choices: next });
  }

  function addChoice(kind: FindabilityChoice['kind'] = 'option', label = '') {
    if (kind === 'other' && choices.some((choice) => choice.kind === 'other')) {
      showToast({ message: 'Other is already added', variant: 'error' });
      return;
    }
    if (kind === 'na' && choices.some((choice) => choice.kind === 'na')) {
      showToast({ message: 'N/A is already added', variant: 'error' });
      return;
    }
    const preset = kind === 'other' ? 'Other' : kind === 'na' ? 'N/A' : label;
    setChoices([...choices, { id: `ch-${Date.now()}`, label: preset, kind }]);
  }

  return (
    <WuCard rounded className="border border-line bg-surface p-4 wu-shadow-sm">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-ink-muted">
          Question {index + 1}
          {task.isWarmup ? ' · Warmup' : ''}
        </p>
        <WuButton variant="link" size="sm" color="error" onClick={onRemove}>
          Remove
        </WuButton>
      </div>

      <WuTextarea
        variant="outlined"
        placeholder="Question"
        value={task.prompt}
        onChange={(event) => onChange({ prompt: event.target.value })}
      />
      <div className="mt-1 flex items-center gap-1">
        <WuButton
          variant="iconOnly"
          aria-label="Bold"
          Icon={<span className="font-bold">B</span>}
          onClick={() => onChange({ prompt: wrapText(task.prompt, '**') })}
        />
        <WuButton
          variant="iconOnly"
          aria-label="Italic"
          Icon={<span className="italic">I</span>}
          onClick={() => onChange({ prompt: wrapText(task.prompt, '_') })}
        />
        <WuButton
          variant="iconOnly"
          aria-label="Underline"
          Icon={<span className="underline">U</span>}
          onClick={() => onChange({ prompt: wrapText(task.prompt, '<u>', '</u>') })}
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4">
        <div className="min-w-44">
          <WuSelect
            data={QUESTION_TYPES}
            accessorKey={{ value: 'value', label: 'label' }}
            value={selectedType}
            variant="outlined"
            onSelect={() => undefined}
          />
        </div>
        <WuToggle
          Label="Required"
          labelPosition="left"
          checked={required}
          onChange={(checked) => onChange({ required: checked })}
        />
        <WuToggle
          Label="Randomize"
          labelPosition="left"
          checked={Boolean(task.randomize)}
          onChange={(checked) => onChange({ randomize: checked })}
        />
      </div>

      <div className="mt-4">
        <div className="mb-2 flex justify-end gap-1">
          <WuButton
            variant="iconOnly"
            aria-label="Add image"
            Icon={<span className="wm-image" />}
            onClick={() => showToast({ message: 'Image added to question', variant: 'success' })}
          />
          <WuButton
            variant="iconOnly"
            aria-label="Reorder options"
            Icon={<span className="wm-drag-indicator" />}
            onClick={() => showToast({ message: 'Drag the options to reorder them', variant: 'success' })}
          />
        </div>
        <div className="flex flex-col gap-3">
          {choices.map((choice, choiceIndex) => (
            <div key={choice.id} className="flex items-center gap-2">
              <span className="inline-block h-5 w-5 shrink-0 rounded-full border-2 border-ink-muted" aria-hidden />
              <div className="min-w-0 flex-1">
                <WuInput
                  variant="outlined"
                  placeholder={choiceIndex === 0 ? 'Option' : `Option ${choiceIndex + 1}`}
                  value={choice.label}
                  onChange={(event) =>
                    setChoices(
                      choices.map((item) =>
                        item.id === choice.id ? { ...item, label: event.target.value } : item
                      )
                    )
                  }
                />
              </div>
              <WuButton
                variant="iconOnly"
                aria-label="Attach file"
                Icon={<span className="wm-attach-file" />}
                onClick={() => showToast({ message: 'Attachment added', variant: 'success' })}
              />
              <WuButton
                variant="iconOnly"
                aria-label="Delete option"
                Icon={<span className="wm-delete" />}
                disabled={choices.length <= 1}
                onClick={() => setChoices(choices.filter((item) => item.id !== choice.id))}
              />
            </div>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <WuButton variant="secondary" size="sm" onClick={() => addChoice('option')}>
              + Option
            </WuButton>
            <WuButton variant="secondary" size="sm" onClick={() => addChoice('other')}>
              Other
            </WuButton>
            <WuButton variant="secondary" size="sm" onClick={() => addChoice('na')}>
              N/A
            </WuButton>
          </div>
          <WuButton variant="outline" size="sm" onClick={() => addChoice('option')}>
            Add a choice
          </WuButton>
        </div>
      </div>

      <div className="mt-4 border-t border-line pt-4">
        <p className="mb-2 text-xs font-medium text-ink">Correct destinations</p>
        <FindabilityMatcher
          tree={tree}
          selectedIds={task.correctLeafIds}
          onChange={(correctLeafIds) => onChange({ correctLeafIds })}
        />
      </div>
    </WuCard>
  );
}

function FindabilityMatcher({
  tree,
  selectedIds,
  onChange,
}: {
  tree: TreeNode[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}) {
  const [query, setQuery] = useState('');
  const selected = flattenTree(tree).filter((node) => selectedIds.includes(node.id));
  const matches = useMemo(() => {
    return matchTreeNodes(tree, query).filter((node) => !selectedIds.includes(node.id)).slice(0, 8);
  }, [tree, query, selectedIds]);

  function addNode(id: string) {
    if (selectedIds.includes(id)) return;
    onChange([...selectedIds, id]);
    setQuery('');
  }

  function tryAdd() {
    const exact = matchTreeNodes(tree, query).find(
      (node) => node.label.toLowerCase() === query.trim().toLowerCase() && !selectedIds.includes(node.id)
    );
    const next = exact ?? matches[0];
    if (!next) return;
    addNode(next.id);
  }

  if (tree.length === 0) {
    return <p className="text-sm text-ink-muted">Add pages to the tree first.</p>;
  }

  return (
    <div>
      {selected.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1">
          {selected.map((node) => (
            <WuChip key={node.id} variant="secondary" size="sm">
              <span className="inline-flex items-center gap-1">
                {node.label}
                <button
                  type="button"
                  className="wm-close text-xs text-ink-muted"
                  aria-label={`Remove ${node.label}`}
                  onClick={() => onChange(selectedIds.filter((id) => id !== node.id))}
                />
              </span>
            </WuChip>
          ))}
        </div>
      )}
      <div
        className="flex items-end gap-2"
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            tryAdd();
          }
        }}
      >
        <div className="flex-1">
          <WuInput
            variant="outlined"
            placeholder="Type a page name to match"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <WuButton variant="secondary" size="sm" onClick={tryAdd} disabled={!matches[0]}>
          Add
        </WuButton>
      </div>
      {query.trim() && (
        <div className="mt-1 overflow-hidden rounded-md border border-line bg-surface">
          {matches.length === 0 ? (
            <p className="px-3 py-2 text-sm text-ink-muted">No matching pages in the tree.</p>
          ) : (
            matches.map((node) => (
              <button
                key={node.id}
                type="button"
                className="flex w-full flex-col items-start px-3 py-2 text-left text-sm text-ink hover:bg-surface-sunken"
                onClick={() => addNode(node.id)}
              >
                <span>{node.label}</span>
                <span className="text-xs text-ink-muted">{node.path}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
