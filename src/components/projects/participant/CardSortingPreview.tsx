'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useWuShowToast } from '@npm-questionpro/wick-ui-lib';
import { EmptyState } from '@/components/ui/EmptyState';
import type { CardSortItem, CardSortingConfig } from '@/data/mock-card-sorting';

const WuButton = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuButton })),
  { ssr: false }
);
const WuInput = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuInput })),
  { ssr: false }
);

interface CardSortingPreviewProps {
  title: string;
  config: CardSortingConfig;
  backHref: string;
}

type DropZone = 'unsorted' | string;

interface DragState {
  cardId: string;
  label: string;
  width: number;
  height: number;
  offsetX: number;
  offsetY: number;
  x: number;
  y: number;
}

interface InsertTarget {
  zone: DropZone;
  index: number;
}

function shuffle<T>(items: T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const current = next[i];
    next[i] = next[j];
    next[j] = current;
  }
  return next;
}

function emptyGroups(categories: CardSortItem[]): Record<string, string[]> {
  return Object.fromEntries(categories.map((category) => [category.id, []]));
}

function initialBoard(config: CardSortingConfig) {
  const categories = (config.shuffleCategories ? shuffle(config.categories) : config.categories).map((item) => ({
    ...item,
  }));
  const unsorted = (config.shuffleCards ? shuffle(config.cards) : config.cards).map((item) => ({ ...item }));
  return { categories, unsorted, groups: emptyGroups(categories) };
}

function cardsInZone(
  zone: DropZone,
  unsorted: CardSortItem[],
  groups: Record<string, string[]>,
  cardById: Map<string, CardSortItem>
): CardSortItem[] {
  if (zone === 'unsorted') return unsorted;
  return (groups[zone] ?? []).map((id) => cardById.get(id)).filter((card): card is CardSortItem => Boolean(card));
}

export function CardSortingPreview({ title, config, backHref }: CardSortingPreviewProps) {
  const router = useRouter();
  const { showToast } = useWuShowToast();
  const [seed] = useState(() => initialBoard(config));
  const [categories, setCategories] = useState<CardSortItem[]>(seed.categories);
  const [unsorted, setUnsorted] = useState<CardSortItem[]>(seed.unsorted);
  const [groups, setGroups] = useState<Record<string, string[]>>(seed.groups);
  const [drag, setDrag] = useState<DragState | null>(null);
  const [insert, setInsert] = useState<InsertTarget | null>(null);
  const [newCategory, setNewCategory] = useState('');
  const [done, setDone] = useState(false);
  const boardRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const insertRef = useRef<InsertTarget | null>(null);
  const unsortedRef = useRef(unsorted);
  const groupsRef = useRef(groups);
  dragRef.current = drag;
  insertRef.current = insert;
  unsortedRef.current = unsorted;
  groupsRef.current = groups;

  const cardById = useMemo(() => {
    const map = new Map<string, CardSortItem>();
    for (const card of config.cards) map.set(card.id, card);
    return map;
  }, [config.cards]);

  const canAddCategory = config.kind === 'open' || config.kind === 'hybrid';
  const remaining = unsorted.length;
  const canSubmit = config.allowIncomplete || remaining === 0;

  function removeFromAll(
    cardId: string,
    fromUnsorted = unsorted,
    fromGroups = groups
  ): { nextUnsorted: CardSortItem[]; nextGroups: Record<string, string[]> } {
    const nextUnsorted = fromUnsorted.filter((card) => card.id !== cardId);
    const nextGroups: Record<string, string[]> = {};
    for (const [categoryId, cardIds] of Object.entries(fromGroups)) {
      nextGroups[categoryId] = cardIds.filter((id) => id !== cardId);
    }
    return { nextUnsorted, nextGroups };
  }

  function placeAt(cardId: string, zone: DropZone, index: number) {
    const card = cardById.get(cardId);
    if (!card) return;
    const fromUnsorted = unsortedRef.current;
    const fromGroups = groupsRef.current;
    if (zone !== 'unsorted' && config.maxCardsPerCategory != null) {
      const alreadyHere = fromGroups[zone]?.includes(cardId);
      const count = fromGroups[zone]?.length ?? 0;
      if (!alreadyHere && count >= config.maxCardsPerCategory) {
        showToast({ message: `This category already has ${config.maxCardsPerCategory} cards`, variant: 'error' });
        return;
      }
    }
    const { nextUnsorted, nextGroups } = removeFromAll(cardId, fromUnsorted, fromGroups);
    if (zone === 'unsorted') {
      const at = Math.max(0, Math.min(index, nextUnsorted.length));
      nextUnsorted.splice(at, 0, card);
    } else {
      const list = nextGroups[zone] ?? [];
      const at = Math.max(0, Math.min(index, list.length));
      list.splice(at, 0, cardId);
      nextGroups[zone] = list;
    }
    setUnsorted(nextUnsorted);
    setGroups(nextGroups);
  }

  function addCategory() {
    const label = newCategory.trim();
    if (!label) return;
    const id = `cat-custom-${Date.now()}`;
    setCategories((current) => [...current, { id, label }]);
    setGroups((current) => ({ ...current, [id]: [] }));
    setNewCategory('');
    showToast({ message: 'Category added', variant: 'success' });
  }

  function insertFromPoint(clientX: number, clientY: number, cardId: string): InsertTarget | null {
    const root = boardRef.current;
    if (!root) return null;
    const zones = root.querySelectorAll<HTMLElement>('[data-drop-zone]');
    let hit: HTMLElement | null = null;
    for (const zone of zones) {
      const rect = zone.getBoundingClientRect();
      if (clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom) {
        hit = zone;
        break;
      }
    }
    if (!hit) return null;
    const zone = hit.dataset.dropZone as DropZone;
    const items = [...hit.querySelectorAll<HTMLElement>('[data-card-id]')].filter(
      (el) => el.dataset.cardId !== cardId
    );
    let index = items.length;
    for (let i = 0; i < items.length; i += 1) {
      const rect = items[i].getBoundingClientRect();
      if (clientY < rect.top + rect.height / 2) {
        index = i;
        break;
      }
    }
    return { zone, index };
  }

  function startDrag(event: React.PointerEvent<HTMLElement>, card: CardSortItem) {
    if (event.button !== 0) return;
    event.preventDefault();
    const rect = event.currentTarget.getBoundingClientRect();
    const next: DragState = {
      cardId: card.id,
      label: card.label,
      width: rect.width,
      height: rect.height,
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
      x: event.clientX,
      y: event.clientY,
    };
    setDrag(next);
    setInsert(insertFromPoint(event.clientX, event.clientY, card.id));
  }

  useEffect(() => {
    if (!drag) return;
    const previousCursor = document.body.style.cursor;
    const previousUserSelect = document.body.style.userSelect;
    document.body.style.cursor = 'move';
    document.body.style.userSelect = 'none';

    function onMove(event: PointerEvent) {
      const current = dragRef.current;
      if (!current) return;
      setDrag({ ...current, x: event.clientX, y: event.clientY });
      setInsert(insertFromPoint(event.clientX, event.clientY, current.cardId));
    }

    function onUp() {
      const current = dragRef.current;
      const target = insertRef.current;
      if (current && target) {
        placeAt(current.cardId, target.zone, target.index);
      }
      setDrag(null);
      setInsert(null);
    }

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    return () => {
      document.body.style.cursor = previousCursor;
      document.body.style.userSelect = previousUserSelect;
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
  }, [drag?.cardId]);

  if (config.cards.length === 0) {
    return (
      <EmptyState
        icon="wm-view-agenda"
        title="This card sort has no cards yet"
        description="Add cards in the quest builder, then preview again."
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
        <p className="text-ink">You finished this card sort. Thank you for previewing it.</p>
        <WuButton onClick={() => router.push(backHref)}>Back to tasks</WuButton>
      </div>
    );
  }

  return (
    <div ref={boardRef} className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-semibold text-[var(--qp-q-blue)]">{title}</h2>
        <p className="mt-2 text-ink">{config.instructions}</p>
      </div>

      <div className="grid items-start gap-8 lg:grid-cols-[17rem_minmax(0,1fr)]">
        <section>
          <div className="mb-2 flex items-baseline justify-between gap-2">
            <h3 className="text-sm font-semibold text-ink">Cards</h3>
            <p className="text-xs text-ink-muted">{remaining} left</p>
          </div>
          <CardList
            zone="unsorted"
            cards={unsorted}
            draggingId={drag?.cardId ?? null}
            insert={insert}
            showRank={false}
            emptyLabel="All cards are sorted"
            onPointerDown={startDrag}
          />
        </section>

        <section>
          <p className="mb-3 text-sm text-ink-muted">Drag your cards here to categorize them.</p>
          {categories.length === 0 ? (
            <p className="text-sm text-ink-muted">Add a category to start grouping cards.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {categories.map((category) => {
                const cards = cardsInZone(category.id, unsorted, groups, cardById);
                const over = insert?.zone === category.id;
                return (
                  <div
                    key={category.id}
                    data-drop-zone={category.id}
                    className={`flex min-h-40 flex-col rounded-lg p-3 qp-card-depth ${
                      over ? 'ring-2 ring-accent' : ''
                    }`}
                  >
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <p className="font-semibold text-ink">{category.label}</p>
                      <span className="text-sm text-ink-muted">{cards.filter((card) => card.id !== drag?.cardId).length}</span>
                    </div>
                    <CardList
                      zone={category.id}
                      bindZone={false}
                      cards={cards}
                      draggingId={drag?.cardId ?? null}
                      insert={insert}
                      showRank={config.requireRanking}
                      emptyLabel="Drop cards here"
                      onPointerDown={startDrag}
                    />
                  </div>
                );
              })}
            </div>
          )}
          {canAddCategory ? (
            <div className="mt-4 flex flex-wrap items-end gap-2">
              <div className="min-w-48 flex-1">
                <p className="mb-1 text-sm text-ink">New category</p>
                <WuInput
                  variant="outlined"
                  placeholder="Category name"
                  value={newCategory}
                  onChange={(event) => setNewCategory(event.target.value)}
                />
              </div>
              <WuButton variant="secondary" disabled={!newCategory.trim()} onClick={addCategory}>
                New category
              </WuButton>
            </div>
          ) : null}
        </section>
      </div>

      <div className="flex justify-end">
        <WuButton
          disabled={!canSubmit}
          onClick={() => {
            setDone(true);
            showToast({ message: 'Responses recorded (preview)', variant: 'success' });
          }}
        >
          Submit
        </WuButton>
      </div>

      {drag ? (
        <div
          className="pointer-events-none fixed z-[1100] opacity-80"
          style={{
            left: drag.x - drag.offsetX,
            top: drag.y - drag.offsetY,
            width: drag.width,
            height: drag.height,
          }}
        >
          <SortCard label={drag.label} showRank={false} rank={null} ghost />
        </div>
      ) : null}
    </div>
  );
}

function CardList({
  zone,
  bindZone = true,
  cards,
  draggingId,
  insert,
  showRank,
  emptyLabel,
  onPointerDown,
}: {
  zone: DropZone;
  bindZone?: boolean;
  cards: CardSortItem[];
  draggingId: string | null;
  insert: InsertTarget | null;
  showRank: boolean;
  emptyLabel: string;
  onPointerDown: (event: React.PointerEvent<HTMLElement>, card: CardSortItem) => void;
}) {
  const visible = cards.filter((card) => card.id !== draggingId);
  const showPlaceholder = insert?.zone === zone;
  const placeholderIndex = showPlaceholder ? insert.index : -1;
  const rows: Array<{ type: 'card'; card: CardSortItem; rank: number } | { type: 'placeholder' }> = [];
  visible.forEach((card, index) => {
    if (placeholderIndex === index) rows.push({ type: 'placeholder' });
    rows.push({ type: 'card', card, rank: index + 1 + (placeholderIndex !== -1 && index >= placeholderIndex ? 1 : 0) });
  });
  if (placeholderIndex === visible.length) rows.push({ type: 'placeholder' });

  return (
    <div
      data-drop-zone={bindZone ? zone : undefined}
      className={`flex min-h-24 flex-col gap-2 rounded-lg border border-line p-2 ${
        showPlaceholder ? 'bg-[var(--qp-title-line)]' : 'bg-[var(--qp-gray-20)]'
      }`}
    >
      {rows.length === 0 ? (
        <p className="px-2 py-6 text-center text-sm text-ink-muted">{emptyLabel}</p>
      ) : (
        rows.map((row) =>
          row.type === 'placeholder' ? (
            <div
              key={`placeholder-${zone}`}
              className="min-h-[3.25rem] rounded-lg border-2 border-dashed border-accent bg-surface/70"
            />
          ) : (
            <div key={row.card.id} data-card-id={row.card.id}>
              <SortCard
                label={row.card.label}
                showRank={showRank}
                rank={showRank ? row.rank : null}
                onPointerDown={(event) => onPointerDown(event, row.card)}
              />
            </div>
          )
        )
      )}
    </div>
  );
}

function SortCard({
  label,
  showRank,
  rank,
  ghost,
  onPointerDown,
}: {
  label: string;
  showRank: boolean;
  rank: number | null;
  ghost?: boolean;
  onPointerDown?: (event: React.PointerEvent<HTMLElement>) => void;
}) {
  return (
    <div
      role="listitem"
      onPointerDown={onPointerDown}
      onDragStart={(event) => event.preventDefault()}
      className={`flex min-h-[3.25rem] w-full cursor-move touch-none items-center gap-3 rounded-lg border border-line bg-surface px-3 py-2 text-left ${
        ghost ? 'qp-card-depth' : 'hover:bg-[var(--qp-gray-20)]'
      }`}
    >
      <span className="wm-drag-indicator shrink-0 text-lg text-ink-muted" aria-hidden />
      <span className="min-w-0 flex-1 text-sm font-medium text-ink">{label}</span>
      {showRank && rank != null ? (
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-accent text-xs font-medium text-white">
          {rank}
        </span>
      ) : null}
    </div>
  );
}
