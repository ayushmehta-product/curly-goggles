'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useWuShowToast } from '@npm-questionpro/wick-ui-lib';
import type { CardSortItem, CardSortKind, CardSortingConfig } from '@/data/mock-card-sorting';

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
const WuToggle = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuToggle })),
  { ssr: false }
);
const WuSelect = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuSelect })),
  { ssr: false }
);

const KIND_OPTIONS: { value: CardSortKind; label: string }[] = [
  { value: 'open', label: 'Open' },
  { value: 'closed', label: 'Closed' },
  { value: 'hybrid', label: 'Hybrid' },
];

const KIND_HELP: Record<CardSortKind, string> = {
  open: 'Participants create and label their own groups. Use this to learn mental models.',
  closed: 'Participants sort cards into your predefined categories. Use this to validate an existing IA.',
  hybrid: 'You provide some categories, and participants can still create their own.',
};

interface CardSortingSetupProps {
  config: CardSortingConfig;
  onChange: (config: CardSortingConfig) => void;
}

export function CardSortingSetup({ config, onChange }: CardSortingSetupProps) {
  const { showToast } = useWuShowToast();
  const [cardDraft, setCardDraft] = useState('');
  const [categoryDraft, setCategoryDraft] = useState('');
  const [bulkCards, setBulkCards] = useState('');
  const [bulkCategories, setBulkCategories] = useState('');
  const showCategories = config.kind !== 'open';
  const selectedKind = KIND_OPTIONS.find((option) => option.value === config.kind) ?? KIND_OPTIONS[0];

  function addItems(raw: string, existing: CardSortItem[], prefix: string): CardSortItem[] {
    const labels = raw
      .split(/[\n,]/)
      .map((label) => label.trim())
      .filter(Boolean);
    const next = [...existing];
    for (const label of labels) {
      if (next.some((item) => item.label.toLowerCase() === label.toLowerCase())) continue;
      next.push({ id: `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, label });
    }
    return next;
  }

  function addCards(raw: string) {
    if (!raw.trim()) return;
    const next = addItems(raw, config.cards, 'c');
    if (next.length === config.cards.length) {
      showToast({ message: 'That card is already in the list', variant: 'error' });
      return;
    }
    onChange({ ...config, cards: next });
    setCardDraft('');
    setBulkCards('');
    showToast({ message: 'Card added', variant: 'success' });
  }

  function addCategories(raw: string) {
    if (!raw.trim()) return;
    const next = addItems(raw, config.categories, 'cat');
    if (next.length === config.categories.length) {
      showToast({ message: 'That category is already in the list', variant: 'error' });
      return;
    }
    onChange({ ...config, categories: next });
    setCategoryDraft('');
    setBulkCategories('');
    showToast({ message: 'Category added', variant: 'success' });
  }

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h4 className="mb-1 text-sm font-semibold text-ink">Card sort</h4>
        <p className="mb-3 text-sm text-ink-muted">
          Participants group labeled cards to show how they expect content to be organized. NN/g recommends 30–50
          cards for a quantitative study.
        </p>
        <WuCard rounded className="bg-surface-sunken p-4 wu-shadow-sm">
          <WuSelect
            data={KIND_OPTIONS}
            accessorKey={{ value: 'value', label: 'label' }}
            value={selectedKind}
            Label="Sort type"
            variant="outlined"
            onSelect={(value) => onChange({ ...config, kind: (value as { value: CardSortKind }).value })}
          />
          <p className="mt-2 text-sm text-ink-muted">{KIND_HELP[config.kind]}</p>
          <div className="mt-4">
            <WuTextarea
              Label="Instructions"
              variant="outlined"
              value={config.instructions}
              onChange={(e) => onChange({ ...config, instructions: e.target.value })}
            />
          </div>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <WuToggle
              Label="Shuffle cards"
              labelPosition="left"
              checked={config.shuffleCards}
              onChange={(checked) => onChange({ ...config, shuffleCards: checked })}
            />
            {showCategories && (
              <WuToggle
                Label="Shuffle categories"
                labelPosition="left"
                checked={config.shuffleCategories}
                onChange={(checked) => onChange({ ...config, shuffleCategories: checked })}
              />
            )}
            <WuToggle
              Label="Allow unsorted cards"
              labelPosition="left"
              checked={config.allowIncomplete}
              onChange={(checked) => onChange({ ...config, allowIncomplete: checked })}
            />
            <WuToggle
              Label="Require ranking"
              labelPosition="left"
              checked={config.requireRanking}
              onChange={(checked) => onChange({ ...config, requireRanking: checked })}
            />
          </div>
          {config.requireRanking && (
            <p className="mt-3 text-sm text-ink-muted">
              The order is important. Participants rank cards in each category with the most important at the top.
            </p>
          )}
        </WuCard>
      </section>

      <ItemEditor
        title="Cards"
        hint="Add one card per topic, page, or offering. Avoid repeating the same word across cards."
        items={config.cards}
        draft={cardDraft}
        bulk={bulkCards}
        placeholder="Donuts"
        bulkPlaceholder={'Donuts\nCoffee\nGift cards'}
        onDraftChange={setCardDraft}
        onBulkChange={setBulkCards}
        onAdd={() => addCards(cardDraft)}
        onBulkAdd={() => addCards(bulkCards)}
        onRename={(id, label) =>
          onChange({
            ...config,
            cards: config.cards.map((item) => (item.id === id ? { ...item, label } : item)),
          })
        }
        onRemove={(id) => {
          onChange({ ...config, cards: config.cards.filter((item) => item.id !== id) });
          showToast({ message: 'Card removed', variant: 'success' });
        }}
      />

      {showCategories && (
        <ItemEditor
          title="Categories"
          hint={
            config.kind === 'hybrid'
              ? 'Predefined groups participants can use. They can still create their own.'
              : 'Closed sorts need at least two categories.'
          }
          items={config.categories}
          draft={categoryDraft}
          bulk={bulkCategories}
          placeholder="Menu"
          bulkPlaceholder={'Menu\nLocations\nRewards'}
          onDraftChange={setCategoryDraft}
          onBulkChange={setBulkCategories}
          onAdd={() => addCategories(categoryDraft)}
          onBulkAdd={() => addCategories(bulkCategories)}
          onRename={(id, label) =>
            onChange({
              ...config,
              categories: config.categories.map((item) => (item.id === id ? { ...item, label } : item)),
            })
          }
          onRemove={(id) => {
            onChange({ ...config, categories: config.categories.filter((item) => item.id !== id) });
            showToast({ message: 'Category removed', variant: 'success' });
          }}
        />
      )}
    </div>
  );
}

function ItemEditor({
  title,
  hint,
  items,
  draft,
  bulk,
  placeholder,
  bulkPlaceholder,
  onDraftChange,
  onBulkChange,
  onAdd,
  onBulkAdd,
  onRename,
  onRemove,
}: {
  title: string;
  hint: string;
  items: CardSortItem[];
  draft: string;
  bulk: string;
  placeholder: string;
  bulkPlaceholder: string;
  onDraftChange: (value: string) => void;
  onBulkChange: (value: string) => void;
  onAdd: () => void;
  onBulkAdd: () => void;
  onRename: (id: string, label: string) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <h4 className="text-sm font-semibold text-ink">{title}</h4>
          <p className="text-sm text-ink-muted">{hint}</p>
        </div>
        <span className="text-xs text-ink-muted">{items.length}</span>
      </div>
      <div
        className="mb-3 flex items-end gap-2"
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            onAdd();
          }
        }}
      >
        <div className="flex-1">
          <WuInput
            variant="outlined"
            placeholder={placeholder}
            value={draft}
            onChange={(e) => onDraftChange(e.target.value)}
          />
        </div>
        <WuButton variant="secondary" size="sm" onClick={onAdd} disabled={!draft.trim()}>
          Add
        </WuButton>
      </div>
      {items.length === 0 ? (
        <p className="mb-3 text-sm text-ink-muted">None added yet.</p>
      ) : (
        <div className="mb-3 flex flex-col gap-1">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-1 rounded-md border border-line bg-surface px-2 py-1">
              <input
                value={item.label}
                onChange={(event) => onRename(item.id, event.target.value)}
                className="min-w-0 flex-1 rounded border border-transparent bg-transparent px-1.5 py-1 text-sm text-ink outline-none focus:border-accent"
              />
              <WuButton
                variant="iconOnly"
                size="sm"
                color="error"
                aria-label={`Remove ${item.label}`}
                Icon={<span className="wm-remove" />}
                onClick={() => onRemove(item.id)}
              />
            </div>
          ))}
        </div>
      )}
      <WuCard rounded className="bg-surface-sunken p-3 wu-shadow-sm">
        <WuTextarea
          Label="Add in bulk"
          variant="outlined"
          placeholder={bulkPlaceholder}
          value={bulk}
          onChange={(e) => onBulkChange(e.target.value)}
        />
        <div className="mt-2 flex justify-end">
          <WuButton variant="secondary" size="sm" onClick={onBulkAdd} disabled={!bulk.trim()}>
            Add list
          </WuButton>
        </div>
      </WuCard>
    </section>
  );
}
