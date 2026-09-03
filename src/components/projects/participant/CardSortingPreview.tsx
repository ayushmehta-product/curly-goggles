'use client';

import { useMemo, useState } from 'react';
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

export function CardSortingPreview({ title, config, backHref }: CardSortingPreviewProps) {
  const router = useRouter();
  const { showToast } = useWuShowToast();
  const [seed] = useState(() => initialBoard(config));
  const [categories, setCategories] = useState<CardSortItem[]>(seed.categories);
  const [unsorted, setUnsorted] = useState<CardSortItem[]>(seed.unsorted);
  const [groups, setGroups] = useState<Record<string, string[]>>(seed.groups);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState('');
  const [done, setDone] = useState(false);

  const cardById = useMemo(() => {
    const map = new Map<string, CardSortItem>();
    for (const card of config.cards) map.set(card.id, card);
    return map;
  }, [config.cards]);

  const canAddCategory = config.kind === 'open' || config.kind === 'hybrid';
  const remaining = unsorted.length;
  const canSubmit = config.allowIncomplete || remaining === 0;

  function removeFromAll(cardId: string): { nextUnsorted: CardSortItem[]; nextGroups: Record<string, string[]> } {
    const nextUnsorted = unsorted.filter((card) => card.id !== cardId);
    const nextGroups: Record<string, string[]> = {};
    for (const [categoryId, cardIds] of Object.entries(groups)) {
      nextGroups[categoryId] = cardIds.filter((id) => id !== cardId);
    }
    return { nextUnsorted, nextGroups };
  }

  function placeCard(cardId: string, categoryId: string | null) {
    const card = cardById.get(cardId) ?? unsorted.find((item) => item.id === cardId);
    if (!card) return;
    if (categoryId && config.maxCardsPerCategory != null) {
      const count = groups[categoryId]?.length ?? 0;
      if (count >= config.maxCardsPerCategory && !groups[categoryId]?.includes(cardId)) {
        showToast({ message: `This category already has ${config.maxCardsPerCategory} cards`, variant: 'error' });
        return;
      }
    }
    const { nextUnsorted, nextGroups } = removeFromAll(cardId);
    if (categoryId) {
      nextGroups[categoryId] = [...(nextGroups[categoryId] ?? []), cardId];
      setUnsorted(nextUnsorted);
      setGroups(nextGroups);
    } else {
      if (!nextUnsorted.some((item) => item.id === cardId)) nextUnsorted.push(card);
      setUnsorted(nextUnsorted);
      setGroups(nextGroups);
    }
    setSelectedCardId(null);
    setDropTarget(null);
    setDraggingId(null);
  }

  function moveInCategory(categoryId: string, cardId: string, direction: -1 | 1) {
    setGroups((current) => {
      const list = [...(current[categoryId] ?? [])];
      const index = list.indexOf(cardId);
      const nextIndex = index + direction;
      if (index < 0 || nextIndex < 0 || nextIndex >= list.length) return current;
      const swap = list[nextIndex];
      list[nextIndex] = list[index];
      list[index] = swap;
      return { ...current, [categoryId]: list };
    });
  }

  function addCategory() {
    const label = newCategory.trim();
    if (!label) return;
    const id = `cat-custom-${Date.now()}`;
    const category = { id, label };
    setCategories((current) => [...current, category]);
    setGroups((current) => ({ ...current, [id]: [] }));
    setNewCategory('');
    showToast({ message: 'Category added', variant: 'success' });
  }

  function onDragStart(event: React.DragEvent, cardId: string) {
    event.dataTransfer.setData('text/plain', cardId);
    event.dataTransfer.effectAllowed = 'move';
    setDraggingId(cardId);
    setSelectedCardId(cardId);
  }

  function onDragOverZone(event: React.DragEvent, zoneId: string) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    if (dropTarget !== zoneId) setDropTarget(zoneId);
  }

  function onDropZone(event: React.DragEvent, categoryId: string | null) {
    event.preventDefault();
    const cardId = event.dataTransfer.getData('text/plain') || draggingId;
    if (cardId) placeCard(cardId, categoryId);
  }

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
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-2xl font-semibold text-[var(--qp-q-blue)]">{title}</h2>
        <p className="mt-2 text-ink">{config.instructions}</p>
        <p className="mt-1 text-sm text-ink-muted">
          Drag a card into a category, or click a card and then click a category. You can move cards between categories.
        </p>
      </div>

      <section>
        <div className="mb-2 flex items-baseline justify-between gap-2">
          <h3 className="text-sm font-semibold text-ink">Unsorted cards</h3>
          <p className="text-xs text-ink-muted">{remaining} left</p>
        </div>
        <div
          className={`flex min-h-32 flex-wrap gap-3 rounded-lg border-2 border-dashed p-4 ${
            dropTarget === 'unsorted' ? 'border-accent bg-[var(--qp-title-line)]' : 'border-line bg-[var(--qp-gray-20)]'
          }`}
          onDragOver={(event) => onDragOverZone(event, 'unsorted')}
          onDragLeave={() => setDropTarget((current) => (current === 'unsorted' ? null : current))}
          onDrop={(event) => onDropZone(event, null)}
        >
          {unsorted.length === 0 ? (
            <p className="self-center text-sm text-ink-muted">All cards are sorted. Drop a card here to unsort it.</p>
          ) : (
            unsorted.map((card) => (
              <SortCard
                key={card.id}
                label={card.label}
                selected={selectedCardId === card.id}
                dragging={draggingId === card.id}
                compact
                onSelect={() => setSelectedCardId(card.id)}
                onDragStart={(event) => onDragStart(event, card.id)}
                onDragEnd={() => {
                  setDraggingId(null);
                  setDropTarget(null);
                }}
              />
            ))
          )}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-ink">Categories</h3>
        {categories.length === 0 ? (
          <p className="text-sm text-ink-muted">Add a category to start grouping cards.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {categories.map((category) => {
              const cardIds = groups[category.id] ?? [];
              const active = dropTarget === category.id;
              return (
                <div
                  key={category.id}
                  className={`flex min-h-56 flex-col rounded-lg p-4 qp-card-depth ${
                    active ? 'ring-2 ring-accent' : ''
                  }`}
                  onClick={() => {
                    if (selectedCardId) placeCard(selectedCardId, category.id);
                  }}
                  onDragOver={(event) => onDragOverZone(event, category.id)}
                  onDragLeave={() => setDropTarget((current) => (current === category.id ? null : current))}
                  onDrop={(event) => onDropZone(event, category.id)}
                >
                  <p className="mb-3 font-semibold text-ink">{category.label}</p>
                  <div className="flex flex-1 flex-col gap-3">
                    {cardIds.length === 0 ? (
                      <p className="rounded-lg border border-dashed border-line px-3 py-8 text-center text-sm text-ink-muted">
                        Drop cards here
                      </p>
                    ) : (
                      cardIds.map((cardId, index) => {
                        const card = cardById.get(cardId);
                        if (!card) return null;
                        return (
                          <div key={cardId} className="flex items-stretch gap-1">
                            {config.requireRanking ? (
                              <span className="flex w-5 items-center text-sm font-medium text-ink-muted">{index + 1}</span>
                            ) : null}
                            <div className="min-w-0 flex-1">
                              <SortCard
                                label={card.label}
                                selected={selectedCardId === cardId}
                                dragging={draggingId === cardId}
                                onSelect={() => setSelectedCardId(cardId)}
                                onDragStart={(event) => onDragStart(event, cardId)}
                                onDragEnd={() => {
                                  setDraggingId(null);
                                  setDropTarget(null);
                                }}
                              />
                            </div>
                            {config.requireRanking ? (
                              <span
                                className="flex flex-col justify-center"
                                onClick={(event) => event.stopPropagation()}
                              >
                                <button
                                  type="button"
                                  aria-label="Move up"
                                  className="rounded p-1 text-ink-muted hover:bg-[var(--qp-gray-20)]"
                                  onClick={() => moveInCategory(category.id, cardId, -1)}
                                >
                                  <span className="wm-expand-less" />
                                </button>
                                <button
                                  type="button"
                                  aria-label="Move down"
                                  className="rounded p-1 text-ink-muted hover:bg-[var(--qp-gray-20)]"
                                  onClick={() => moveInCategory(category.id, cardId, 1)}
                                >
                                  <span className="wm-expand-more" />
                                </button>
                              </span>
                            ) : null}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {canAddCategory ? (
          <div className="flex flex-wrap items-end gap-2">
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
    </div>
  );
}

function SortCard({
  label,
  selected,
  dragging,
  compact,
  onSelect,
  onDragStart,
  onDragEnd,
}: {
  label: string;
  selected: boolean;
  dragging: boolean;
  compact?: boolean;
  onSelect: () => void;
  onDragStart: (event: React.DragEvent<HTMLButtonElement>) => void;
  onDragEnd: () => void;
}) {
  return (
    <button
      type="button"
      draggable
      onClick={(event) => {
        event.stopPropagation();
        onSelect();
      }}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={`flex min-h-[4.5rem] cursor-grab items-center gap-3 rounded-lg px-4 py-3 text-left active:cursor-grabbing ${
        compact ? 'w-[13rem]' : 'w-full'
      } ${selected ? 'ring-2 ring-accent' : ''} ${dragging ? 'opacity-50' : ''} qp-card-depth hover:bg-[var(--qp-gray-20)]`}
    >
      <span className="wm-drag-indicator text-lg text-ink-muted" aria-hidden />
      <span className="text-base font-medium text-ink">{label}</span>
    </button>
  );
}
