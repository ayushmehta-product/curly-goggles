'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import type { DropPosition, TreeNode } from '@/data/tree-utils';
import { countNodes } from '@/data/tree-utils';

const WuButton = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuButton })),
  { ssr: false }
);

interface TreeEditorProps {
  nodes: TreeNode[];
  onAddChild: (parentId: string) => void;
  onRemove: (nodeId: string) => void;
  onRename: (nodeId: string, label: string) => void;
  onMove: (draggedId: string, targetId: string, position: DropPosition) => void;
}

export function TreeEditor({
  nodes,
  onAddChild,
  onRemove,
  onRename,
  onMove,
}: TreeEditorProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropHint, setDropHint] = useState<{ id: string; position: DropPosition } | null>(null);

  function isExpanded(id: string) {
    return expanded[id] !== false;
  }

  return (
    <div className="overflow-hidden rounded-lg border border-line bg-surface">
      {nodes.map((node) => (
        <TreeRow
          key={node.id}
          node={node}
          depth={0}
          isExpanded={isExpanded}
          onToggle={(id) => setExpanded((current) => ({ ...current, [id]: !isExpanded(id) }))}
          draggingId={draggingId}
          dropHint={dropHint}
          canDelete={countNodes(nodes) > 1}
          onDragStart={setDraggingId}
          onDragEnd={() => {
            setDraggingId(null);
            setDropHint(null);
          }}
          onDropHint={setDropHint}
          onMove={onMove}
          onAddChild={onAddChild}
          onRemove={onRemove}
          onRename={onRename}
        />
      ))}
    </div>
  );
}

interface TreeRowProps {
  node: TreeNode;
  depth: number;
  isExpanded: (id: string) => boolean;
  onToggle: (id: string) => void;
  draggingId: string | null;
  dropHint: { id: string; position: DropPosition } | null;
  canDelete: boolean;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
  onDropHint: (hint: { id: string; position: DropPosition } | null) => void;
  onMove: (draggedId: string, targetId: string, position: DropPosition) => void;
  onAddChild: (parentId: string) => void;
  onRemove: (nodeId: string) => void;
  onRename: (nodeId: string, label: string) => void;
}

function positionFromEvent(event: React.DragEvent<HTMLDivElement>): DropPosition {
  const rect = event.currentTarget.getBoundingClientRect();
  const y = event.clientY - rect.top;
  if (y < rect.height * 0.28) return 'before';
  if (y > rect.height * 0.72) return 'after';
  return 'child';
}

function TreeRow({
  node,
  depth,
  isExpanded,
  onToggle,
  draggingId,
  dropHint,
  canDelete,
  onDragStart,
  onDragEnd,
  onDropHint,
  onMove,
  onAddChild,
  onRemove,
  onRename,
}: TreeRowProps) {
  const hasChildren = node.children.length > 0;
  const open = isExpanded(node.id);
  const hintHere = dropHint?.id === node.id ? dropHint.position : null;
  const isDragging = draggingId === node.id;

  return (
    <div>
      <div
        draggable
        onDragStart={(event) => {
          event.dataTransfer.setData('text/plain', node.id);
          event.dataTransfer.effectAllowed = 'move';
          onDragStart(node.id);
        }}
        onDragEnd={onDragEnd}
        onDragOver={(event) => {
          event.preventDefault();
          event.dataTransfer.dropEffect = 'move';
          onDropHint({ id: node.id, position: positionFromEvent(event) });
        }}
        onDragLeave={() => {
          if (dropHint?.id === node.id) onDropHint(null);
        }}
        onDrop={(event) => {
          event.preventDefault();
          const draggedId = event.dataTransfer.getData('text/plain');
          if (draggedId) onMove(draggedId, node.id, positionFromEvent(event));
          onDropHint(null);
          onDragEnd();
        }}
        className={`group relative flex items-center gap-1 border-b border-line py-1.5 pr-2 pl-1 transition-colors duration-150 ${
          isDragging ? 'opacity-40' : 'hover:bg-surface-sunken'
        }`}
        style={{ paddingLeft: 8 + depth * 20 }}
      >
        {hintHere === 'before' && (
          <span className="absolute inset-x-2 top-0 h-0.5 bg-accent transition-opacity" />
        )}
        {hintHere === 'after' && (
          <span className="absolute inset-x-2 bottom-0 h-0.5 bg-accent transition-opacity" />
        )}
        {hintHere === 'child' && (
          <span className="pointer-events-none absolute inset-0 rounded ring-2 ring-accent ring-inset" />
        )}
        <span
          className="wm-drag-indicator cursor-grab text-lg text-ink-muted transition-colors duration-150 group-hover:text-ink"
          aria-hidden
        />
        {hasChildren ? (
          <WuButton
            variant="iconOnly"
            size="sm"
            aria-label={open ? 'Collapse' : 'Expand'}
            Icon={
              <span
                className={`wm-expand-more text-base text-ink-muted transition-transform duration-200 ${
                  open ? 'rotate-0' : '-rotate-90'
                }`}
              />
            }
            onClick={() => onToggle(node.id)}
          />
        ) : (
          <span className="w-7" />
        )}
        <input
          value={node.label}
          onChange={(event) => onRename(node.id, event.target.value)}
          className="min-w-0 flex-1 rounded border border-transparent bg-transparent px-1.5 py-1 text-sm text-ink outline-none transition-colors duration-150 group-hover:border-line group-hover:bg-surface focus:border-accent focus:bg-surface"
        />
        <span className="flex items-center gap-1 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
          <WuButton
            variant="iconOnly"
            size="sm"
            aria-label="Add child page"
            Icon={<span className="wm-add text-accent" />}
            onClick={() => onAddChild(node.id)}
          />
          <WuButton
            variant="iconOnly"
            size="sm"
            color="error"
            aria-label="Remove page"
            disabled={!canDelete}
            Icon={<span className="wm-remove" />}
            onClick={() => onRemove(node.id)}
          />
        </span>
      </div>
      {hasChildren && (
        <div className={`qp-reveal ${open ? 'qp-reveal-open' : ''}`}>
          <div>
            {node.children.map((child) => (
              <TreeRow
                key={child.id}
                node={child}
                depth={depth + 1}
                isExpanded={isExpanded}
                onToggle={onToggle}
                draggingId={draggingId}
                dropHint={dropHint}
                canDelete
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
                onDropHint={onDropHint}
                onMove={onMove}
                onAddChild={onAddChild}
                onRemove={onRemove}
                onRename={onRename}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface ParticipantPreviewProps {
  nodes: TreeNode[];
}

export function ParticipantTreePreview({ nodes }: ParticipantPreviewProps) {
  return (
    <div className="qp-enter rounded-lg border border-line bg-surface p-3">
      <p className="mb-2 text-xs font-medium text-ink-muted">Participant view</p>
      <PreviewList nodes={nodes} />
    </div>
  );
}

function PreviewList({ nodes }: { nodes: TreeNode[] }) {
  return (
    <ul className="flex flex-col">
      {nodes.map((node) => (
        <PreviewItem key={node.id} node={node} />
      ))}
    </ul>
  );
}

function PreviewItem({ node }: { node: TreeNode }) {
  const [open, setOpen] = useState(false);
  const hasChildren = node.children.length > 0;
  return (
    <li>
      <button
        type="button"
        className="flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-sm text-ink transition-colors duration-150 hover:bg-surface-sunken"
        onClick={() => hasChildren && setOpen((current) => !current)}
      >
        {node.label}
        {hasChildren && (
          <span
            className={`wm-expand-more text-ink-muted transition-transform duration-200 ${
              open ? 'rotate-180' : 'rotate-0'
            }`}
          />
        )}
      </button>
      {hasChildren && (
        <div className={`qp-reveal ${open ? 'qp-reveal-open' : ''}`}>
          <div className="ml-4 border-l border-line pl-2">
            <PreviewList nodes={node.children} />
          </div>
        </div>
      )}
    </li>
  );
}
