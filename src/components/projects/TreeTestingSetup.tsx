'use client';

import { useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { useWuShowToast } from '@npm-questionpro/wick-ui-lib';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { ParticipantTreePreview, TreeEditor } from '@/components/projects/TreeEditor';
import type { TreeTestingConfig } from '@/data/mock-tree-testing';
import { defaultTreeTestingConfig } from '@/data/mock-tree-testing';
import type { DropPosition, TreeNode } from '@/data/tree-utils';
import {
  addChildNode,
  emptyTree,
  getLeaves,
  insertNode,
  parseNngCsv,
  removeNode,
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
const WuCheckbox = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuCheckbox })),
  { ssr: false }
);
const WuScrollArea = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuScrollArea })),
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
  const [preview, setPreview] = useState(false);
  const [removeId, setRemoveId] = useState<string | null>(null);

  const tree = config.tree;
  const leaves = getLeaves(tree);

  function setTree(next: TreeNode[]) {
    onChange({ ...config, tree: next });
  }

  function handleFetch() {
    if (!url.trim()) {
      showToast({ message: 'Enter a website URL', variant: 'error' });
      return;
    }
    setFetching(true);
    window.setTimeout(() => {
      onChange(defaultTreeTestingConfig());
      setFetching(false);
      showToast({ message: 'Sitemap fetched', variant: 'success' });
    }, 900);
  }

  function handleFile(file: File | undefined) {
    if (!file) return;
    if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      onChange(defaultTreeTestingConfig());
      showToast({ message: 'Spreadsheet imported', variant: 'success' });
      return;
    }
    file
      .text()
      .then((text) => {
        setTree(parseNngCsv(text));
        showToast({ message: 'Spreadsheet imported', variant: 'success' });
      })
      .catch(() => showToast({ message: 'Could not read that file', variant: 'error' }));
  }

  function handleMove(draggedId: string, targetId: string, position: DropPosition) {
    setTree(insertNode(tree, draggedId, targetId, position));
  }

  function confirmRemove() {
    if (!removeId) return;
    const result = removeNode(tree, removeId);
    if (result.nodes.length === 0) {
      showToast({ message: 'Keep at least one page in the tree', variant: 'error' });
    } else {
      setTree(result.nodes);
      showToast({ message: 'Page removed', variant: 'success' });
    }
    setRemoveId(null);
  }

  function addFindabilityTask() {
    if (config.findabilityTasks.length >= 8) {
      showToast({ message: 'Keep tree tests to 5–8 findability tasks', variant: 'error' });
      return;
    }
    onChange({
      ...config,
      findabilityTasks: [
        ...config.findabilityTasks,
        {
          id: `ft-${Date.now()}`,
          prompt: '',
          correctLeafIds: [],
        },
      ],
    });
  }

  const pendingRemove = removeId ? treeHasChildren(tree, removeId) : false;

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h4 className="mb-1 text-sm font-semibold text-ink">Tree</h4>
        <p className="mb-3 text-sm text-ink-muted">
          Hierarchy only — no visual design. Drag to reorder, drop on a row to nest, use add / remove
          to change pages.
        </p>
        <WuCard rounded className="bg-surface-sunken p-4 wu-shadow-sm">
          <p className="text-sm text-ink-muted">
            Fetch a sitemap from a URL, or import an NN/g spreadsheet (homepage in column A, one
            category per row, deeper levels to the right).
          </p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-end">
            <div className="flex-1">
              <WuInput
                Label="Website URL"
                variant="outlined"
                placeholder="https://www.dunkindonuts.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
            <WuButton Icon={<span className="wm-cloud-download" />} onClick={handleFetch} disabled={fetching}>
              {fetching ? 'Fetching…' : 'Fetch sitemap'}
            </WuButton>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <WuButton variant="secondary" onClick={() => fileRef.current?.click()}>
              Attach spreadsheet
            </WuButton>
            <WuButton variant="link" onClick={() => window.open('/tree-testing-template.csv', '_self')}>
              Download template
            </WuButton>
            <WuButton variant="outline" onClick={() => setTree(emptyTree())}>
              Start from home
            </WuButton>
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
            onRemove={(nodeId) => setRemoveId(nodeId)}
            onRename={(nodeId, label) => setTree(updateNodeLabel(tree, nodeId, label))}
            onMove={handleMove}
          />
        </div>
        <div className="mt-3 flex items-center gap-2">
          <WuButton variant="outline" size="sm" onClick={() => setPreview((current) => !current)}>
            {preview ? 'Hide participant view' : 'Show participant view'}
          </WuButton>
        </div>
        <div className={`qp-reveal mt-3 ${preview ? 'qp-reveal-open' : ''}`}>
          <div>
            <ParticipantTreePreview nodes={tree} />
          </div>
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between gap-2">
          <div>
            <h4 className="text-sm font-semibold text-ink">Findability tasks</h4>
            <p className="text-sm text-ink-muted">
              5–8 scenario tasks. Do not repeat the destination label. Mark correct leaf pages only.
            </p>
          </div>
          <WuButton
            variant="secondary"
            size="sm"
            Icon={<span className="wm-add" />}
            onClick={addFindabilityTask}
          >
            Add findability task
          </WuButton>
        </div>
        <div className="flex flex-col gap-3">
          {config.findabilityTasks.map((task, index) => (
            <WuCard key={task.id} rounded className="qp-card-hover qp-enter border border-line bg-surface p-4 wu-shadow-sm">
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="text-xs font-medium text-ink-muted">
                  Task {index + 1}
                  {task.isWarmup ? ' · Warmup' : ''}
                </p>
                <WuButton
                  variant="link"
                  size="sm"
                  color="error"
                  onClick={() =>
                    onChange({
                      ...config,
                      findabilityTasks: config.findabilityTasks.filter((item) => item.id !== task.id),
                    })
                  }
                >
                  Remove
                </WuButton>
              </div>
              <WuTextarea
                Label="Scenario prompt"
                variant="outlined"
                placeholder="You are considering opening a lawn-care service. See if there are resources that can help you begin."
                value={task.prompt}
                onChange={(e) =>
                  onChange({
                    ...config,
                    findabilityTasks: config.findabilityTasks.map((item) =>
                      item.id === task.id ? { ...item, prompt: e.target.value } : item
                    ),
                  })
                }
              />
              <div className="mt-3">
                <p className="mb-2 text-xs font-medium text-ink">Correct leaf(s)</p>
                {leaves.length === 0 ? (
                  <p className="text-sm text-ink-muted">Add pages to the tree first.</p>
                ) : (
                  <div className="rounded-lg border border-line bg-surface-sunken">
                    <WuScrollArea className="max-h-40 p-2">
                      <div className="flex flex-col gap-1">
                        {leaves.map((leaf) => {
                          const checked = task.correctLeafIds.includes(leaf.id);
                          return (
                            <label
                              key={leaf.id}
                              className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm text-ink transition-colors duration-150 hover:bg-surface"
                            >
                              <WuCheckbox
                                checked={checked}
                                onChange={() => {
                                  const next = checked
                                    ? task.correctLeafIds.filter((id) => id !== leaf.id)
                                    : [...task.correctLeafIds, leaf.id];
                                  onChange({
                                    ...config,
                                    findabilityTasks: config.findabilityTasks.map((item) =>
                                      item.id === task.id ? { ...item, correctLeafIds: next } : item
                                    ),
                                  });
                                }}
                              />
                              {leaf.label}
                            </label>
                          );
                        })}
                      </div>
                    </WuScrollArea>
                  </div>
                )}
              </div>
            </WuCard>
          ))}
        </div>
      </section>

      <ConfirmModal
        open={removeId !== null}
        onOpenChange={(open) => {
          if (!open) setRemoveId(null);
        }}
        title={pendingRemove ? 'Remove this page and its children?' : 'Remove this page?'}
        description={
          pendingRemove
            ? 'All nested pages under this item will be removed from the tree.'
            : 'This page will be removed from the tree.'
        }
        confirmLabel="Remove"
        variant="critical"
        onConfirm={confirmRemove}
      />
    </div>
  );
}

function treeHasChildren(nodes: TreeNode[], id: string): boolean {
  for (const node of nodes) {
    if (node.id === id) return node.children.length > 0;
    if (treeHasChildren(node.children, id)) return true;
  }
  return false;
}
