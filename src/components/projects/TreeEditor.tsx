'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import type { DropPosition, TreeNode } from '@/data/tree-utils';

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
  onSetDesired: (nodeId: string) => void;
}

export function TreeEditor({
  nodes,
  onAddChild,
  onRemove,
  onRename,
  onMove,
  onSetDesired,
}: TreeEditorProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropHint, setDropHint] = useState<{ id: string; position: DropPosition } | null>(null);

  function isExpanded(id: string) {
    return expanded[id] !== false;
  }

  if (nodes.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-line bg-surface px-4 py-10 text-center">
        <p className="text-sm text-ink-muted">
          No pages yet. Add a page or fetch navigation to start the tree.
        </p>
      </div>
    );
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
          onSetDesired={onSetDesired}
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
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
  onDropHint: (hint: { id: string; position: DropPosition } | null) => void;
  onMove: (draggedId: string, targetId: string, position: DropPosition) => void;
  onAddChild: (parentId: string) => void;
  onRemove: (nodeId: string) => void;
  onRename: (nodeId: string, label: string) => void;
  onSetDesired: (nodeId: string) => void;
}

function positionFromEvent(event: React.DragEvent<HTMLDivElement>): DropPosition {
  const rect = event.currentTarget.getBoundingClientRect();
  const y = event.clientY - rect.top;
  if (y < rect.height * 0.28) return 'before';
  if (y > rect.height * 0.72) return 'after';
  return 'child';
}

function nodeKind(node: TreeNode, depth: number): 'root' | 'folder' | 'page' {
  if (depth === 0) return 'root';
  if (node.children.length > 0) return 'folder';
  return 'page';
}

function TreeRow({
  node,
  depth,
  isExpanded,
  onToggle,
  draggingId,
  dropHint,
  onDragStart,
  onDragEnd,
  onDropHint,
  onMove,
  onAddChild,
  onRemove,
  onRename,
  onSetDesired,
}: TreeRowProps) {
  const hasChildren = node.children.length > 0;
  const open = isExpanded(node.id);
  const hintHere = dropHint?.id === node.id ? dropHint.position : null;
  const isDragging = draggingId === node.id;
  const kind = nodeKind(node, depth);
  const kindIcon =
    kind === 'root' ? 'wm-home' : kind === 'folder' ? 'wm-folder' : 'wm-description';
  const kindLabel = kind === 'root' ? 'Root' : kind === 'folder' ? 'Folder' : 'Page';

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
        } ${kind === 'root' ? 'bg-[#F7F9FC]' : kind === 'folder' ? 'bg-surface-sunken/60' : 'bg-surface'}`}
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
          className={`absolute inset-y-1 left-0 w-1 rounded-r ${
            kind === 'root' ? 'bg-accent' : kind === 'folder' ? 'bg-[var(--qp-q-blue)]' : 'bg-transparent'
          }`}
          aria-hidden
        />
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
        <span
          className={`${kindIcon} text-base ${
            kind === 'root' ? 'text-accent' : kind === 'folder' ? 'text-[var(--qp-q-blue)]' : 'text-ink-muted'
          }`}
          title={kindLabel}
          aria-hidden
        />
        <input
          value={node.label}
          onChange={(event) => onRename(node.id, event.target.value)}
          className="min-w-0 flex-1 rounded border border-transparent bg-transparent px-1.5 py-1 text-sm text-ink outline-none transition-colors duration-150 group-hover:border-line group-hover:bg-surface focus:border-accent focus:bg-surface"
        />
        <span className="hidden text-[11px] text-ink-muted sm:inline">{kindLabel}</span>
        <WuButton
          variant="iconOnly"
          size="sm"
          aria-label={node.desired ? 'Clear desired end point' : 'Mark as desired end point'}
          Icon={
            <span
              className={`wm-check-circle text-lg ${node.desired ? 'text-accent' : 'text-ink-muted opacity-40 group-hover:opacity-100'}`}
            />
          }
          onClick={() => onSetDesired(node.id)}
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
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
                onDropHint={onDropHint}
                onMove={onMove}
                onAddChild={onAddChild}
                onRemove={onRemove}
                onRename={onRename}
                onSetDesired={onSetDesired}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
