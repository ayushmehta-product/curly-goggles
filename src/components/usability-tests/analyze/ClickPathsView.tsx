'use client';

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import type {
  ClickPathLink,
  ClickPathNode,
  PathEdgeKind,
} from '@/data/mock-usability-analytics';

const WuCard = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuCard })),
  { ssr: false }
);
const WuChip = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuChip })),
  { ssr: false }
);
const WuTooltip = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuTooltip })),
  { ssr: false }
);

const COL_W = 168;
const COL_GAP = 80;
const NODE_H = 72;
const ROW_GAP = 28;
const STRIDE = COL_W + COL_GAP;
const DROP_H = 56;

const STROKE: Record<PathEdgeKind, string> = {
  expected: '#1B87E6',
  diverted: '#9B9B9B',
  dropped: '#C45656',
};

interface ClickPathsViewProps {
  nodes: ClickPathNode[];
  links: ClickPathLink[];
}

function byId(nodes: ClickPathNode[]): Map<string, ClickPathNode> {
  return new Map(nodes.map((node) => [node.id, node]));
}

function outbound(links: ClickPathLink[], nodeId: string): ClickPathLink[] {
  return links.filter((link) => link.fromId === nodeId);
}

function inbound(links: ClickPathLink[], nodeId: string): ClickPathLink[] {
  return links.filter((link) => link.toId === nodeId);
}

function nodeTooltip(node: ClickPathNode, links: ClickPathLink[], nodes: ClickPathNode[]): string {
  const out = outbound(links, node.id);
  if (out.length === 0) {
    return `${node.count} stayed`;
  }
  const stayed = out.filter((link) => link.kind === 'expected').reduce((sum, link) => sum + link.count, 0);
  const dropped = out.filter((link) => link.kind === 'dropped').reduce((sum, link) => sum + link.count, 0);
  const diverted = out.filter((link) => link.kind === 'diverted');
  const lookup = byId(nodes);
  const divertBits = diverted.map((link) => {
    const dest = link.toId ? lookup.get(link.toId)?.label ?? 'another page' : 'another page';
    return `${link.count} diverted to ${dest}`;
  });
  const parts = [`${stayed} stayed`];
  if (divertBits.length > 0) parts.push(...divertBits);
  if (dropped > 0) parts.push(`${dropped} left before success`);
  return parts.join(' · ');
}

function edgeTooltip(link: ClickPathLink, nodes: ClickPathNode[]): string {
  const lookup = byId(nodes);
  const from = lookup.get(link.fromId)?.label ?? 'This page';
  if (link.kind === 'dropped' || !link.toId) {
    return `${link.count} ${link.count === 1 ? 'person' : 'people'} left before success from ${from}`;
  }
  const to = lookup.get(link.toId)?.label ?? 'another page';
  return `${link.count} ${link.count === 1 ? 'person' : 'people'} went ${from} to ${to}`;
}

function layout(nodes: ClickPathNode[]): Map<string, { x: number; y: number }> {
  const positions = new Map<string, { x: number; y: number }>();
  const steps = [...new Set(nodes.map((node) => node.step))].sort((a, b) => a - b);
  for (const step of steps) {
    const column = nodes
      .filter((node) => node.step === step)
      .sort((a, b) => Number(b.expected) - Number(a.expected));
    column.forEach((node, index) => {
      positions.set(node.id, { x: step * STRIDE, y: index * (NODE_H + ROW_GAP) });
    });
  }
  return positions;
}

function connectedIds(nodeId: string, links: ClickPathLink[]): Set<string> {
  const ids = new Set<string>([nodeId]);
  for (const link of links) {
    if (link.fromId === nodeId && link.toId) ids.add(link.toId);
    if (link.toId === nodeId) ids.add(link.fromId);
  }
  return ids;
}

export function ClickPathsView({ nodes, links }: ClickPathsViewProps) {
  const [selectedId, setSelectedId] = useState<string | null>(nodes[0]?.id ?? null);
  const positions = useMemo(() => layout(nodes), [nodes]);
  const lookup = useMemo(() => byId(nodes), [nodes]);
  const selected = selectedId ? lookup.get(selectedId) ?? null : null;
  const highlight = selectedId ? connectedIds(selectedId, links) : null;

  const steps = [...new Set(nodes.map((node) => node.step))].sort((a, b) => a - b);
  const maxRow = Math.max(
    ...steps.map(
      (step) => nodes.filter((node) => node.step === step).length
    ),
    1
  );
  const width = steps.length * STRIDE - COL_GAP;
  const height = maxRow * (NODE_H + ROW_GAP) - ROW_GAP + DROP_H + 8;

  const selectedOut = selected ? outbound(links, selected.id) : [];
  const selectedIn = selected ? inbound(links, selected.id) : [];

  return (
    <div className="flex flex-col gap-4 xl:flex-row">
      <WuCard rounded className="min-w-0 flex-1 overflow-x-auto p-4 wu-shadow-sm">
        <div className="mb-3 flex flex-wrap items-center gap-3 text-xs text-ink">
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-2 w-4 rounded-sm bg-accent" />
            <WuChip variant="secondary" size="sm">
              Intended path
            </WuChip>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-2 w-4 rounded-sm bg-ink-muted" />
            <WuChip variant="secondary" size="sm">
              Other pages
            </WuChip>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-2 w-4 rounded-sm bg-[#C45656]" />
            <WuChip variant="secondary" size="sm" color="danger">
              Left before success
            </WuChip>
          </span>
        </div>
        <div className="relative" style={{ width, height }}>
          <svg
            className="pointer-events-none absolute inset-0"
            width={width}
            height={height}
            aria-hidden
          >
            {links.map((link) => {
              const from = positions.get(link.fromId);
              if (!from) return null;
              const dimmed =
                highlight !== null &&
                highlight.has(link.fromId) === false &&
                (link.toId === null || highlight.has(link.toId) === false);
              const x1 = from.x + COL_W;
              const y1 = from.y + NODE_H / 2;
              if (link.kind === 'dropped' || !link.toId) {
                const x2 = from.x + COL_W / 2;
                const y2 = from.y + NODE_H + DROP_H - 8;
                return (
                  <path
                    key={`${link.fromId}-drop`}
                    d={`M ${from.x + COL_W / 2},${from.y + NODE_H} Q ${from.x + COL_W / 2 + 24},${y2} ${x2},${y2}`}
                    fill="none"
                    stroke={STROKE.dropped}
                    strokeWidth={Math.max(2, (link.count / 24) * 10)}
                    strokeDasharray="5 4"
                    strokeLinecap="round"
                    opacity={dimmed ? 0.2 : 1}
                  />
                );
              }
              const to = positions.get(link.toId);
              if (!to) return null;
              const x2 = to.x;
              const y2 = to.y + NODE_H / 2;
              const midX = (x1 + x2) / 2;
              return (
                <path
                  key={`${link.fromId}-${link.toId}-${link.kind}`}
                  d={`M ${x1},${y1} C ${midX},${y1} ${midX},${y2} ${x2},${y2}`}
                  fill="none"
                  stroke={STROKE[link.kind]}
                  strokeWidth={Math.max(2, (link.count / 24) * 14)}
                  strokeLinecap="round"
                  opacity={dimmed ? 0.15 : link.kind === 'expected' ? 0.85 : 0.7}
                />
              );
            })}
          </svg>

          {links.map((link) => {
            const from = positions.get(link.fromId);
            if (!from) return null;
            if (link.kind === 'dropped' || !link.toId) {
              return (
                <div
                  key={`${link.fromId}-drop-hit`}
                  className="absolute"
                  style={{ left: from.x + COL_W / 2 - 36, top: from.y + NODE_H + 8, width: 72 }}
                >
                  <WuTooltip content={edgeTooltip(link, nodes)}>
                    <button
                      type="button"
                      className="w-full text-center text-[11px] font-medium text-[#C45656]"
                    >
                      {link.count} left
                    </button>
                  </WuTooltip>
                </div>
              );
            }
            const to = positions.get(link.toId);
            if (!to) return null;
            const x1 = from.x + COL_W;
            const y1 = from.y + NODE_H / 2;
            const x2 = to.x;
            const y2 = to.y + NODE_H / 2;
            const left = (x1 + x2) / 2 - 28;
            const top = (y1 + y2) / 2 - 12;
            return (
              <div
                key={`${link.fromId}-${link.toId}-hit`}
                className="absolute z-[1]"
                style={{ left, top, width: 56 }}
              >
                <WuTooltip content={edgeTooltip(link, nodes)}>
                  <button type="button" className="w-full text-center text-[11px] font-medium text-ink-muted">
                    {link.count}
                  </button>
                </WuTooltip>
              </div>
            );
          })}

          {nodes.map((node) => {
            const pos = positions.get(node.id);
            if (!pos) return null;
            const dimmed = highlight !== null && !highlight.has(node.id);
            const isSelected = selectedId === node.id;
            return (
              <div
                key={node.id}
                className="absolute"
                style={{ left: pos.x, top: pos.y, width: COL_W, height: NODE_H }}
              >
                <WuTooltip content={nodeTooltip(node, links, nodes)}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(node.id)}
                    aria-pressed={isSelected}
                    className="h-full w-full text-left"
                  >
                    <WuCard
                      rounded
                      className={`flex h-full flex-col justify-center gap-0.5 px-3 py-2 transition ${
                        isSelected ? 'ring-2 ring-accent' : ''
                      } ${node.expected ? 'border-accent/40' : 'border-line'} ${
                        dimmed ? 'opacity-30' : ''
                      }`}
                    >
                      <p className="text-sm font-semibold text-ink">{node.label}</p>
                      <p className="text-xs text-ink-muted">
                        {node.count} {node.count === 1 ? 'person' : 'people'}
        {node.expected ? '' : ' · Other page'}
                      </p>
                    </WuCard>
                  </button>
                </WuTooltip>
              </div>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-ink-muted">
          Hover a screen or path to see who stayed on the intended path, went elsewhere, or left before success. Select a screen to isolate it.
        </p>
      </WuCard>

      <WuCard rounded className="w-full shrink-0 p-4 xl:w-72 wu-shadow-sm">
        {selected ? (
          <div className="flex flex-col gap-3">
            <div>
              <p className="text-xs font-medium text-ink-muted">Selected screen</p>
              <h3 className="text-base font-semibold text-ink">{selected.label}</h3>
              <p className="text-sm text-ink-muted">
                {selected.count} people reached this page
              </p>
            </div>
            {selectedIn.length > 0 ? (
              <div>
                <p className="mb-1 text-xs font-medium text-ink">Arrived from</p>
                <ul className="flex flex-col gap-1">
                  {selectedIn.map((link) => (
                    <li key={`${link.fromId}-${link.toId}`} className="text-sm text-ink">
                      {lookup.get(link.fromId)?.label ?? 'Unknown'} · {link.count}
                      {link.kind === 'diverted' ? ' (other page)' : ''}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-sm text-ink-muted">Task start</p>
            )}
            <div>
              <p className="mb-1 text-xs font-medium text-ink">Next</p>
              {selectedOut.length === 0 ? (
                <p className="text-sm text-ink">Success page · {selected.count} reached it</p>
              ) : (
                <ul className="flex flex-col gap-1">
                  {selectedOut.map((link) => {
                    const dest =
                      link.kind === 'dropped' || !link.toId
                        ? 'Left before success'
                        : lookup.get(link.toId)?.label ?? 'Another page';
                    return (
                      <li key={`${link.fromId}-${link.toId ?? 'drop'}`} className="text-sm text-ink">
                        {dest} · {link.count}
                        {link.kind === 'expected' ? ' stayed' : link.kind === 'diverted' ? ' other page' : ''}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        ) : (
          <p className="text-sm text-ink-muted">Select a screen to see who stayed, went elsewhere, or left before success.</p>
        )}
      </WuCard>
    </div>
  );
}
