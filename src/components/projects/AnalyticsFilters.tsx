'use client';

import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import { format } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import type { AnalyticsFiltersState, AnalyticsOption } from '@/data/mock-study-analytics';
import {
  ANALYTICS_CHOICE_OPTIONS,
  ANALYTICS_PARTICIPANT_OPTIONS,
  ANALYTICS_RESPONSE_OPTIONS,
  ANALYTICS_SEGMENT_OPTIONS,
} from '@/data/mock-study-analytics';
import type { StudyQuest } from '@/data/mock-projects';

const WuCard = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuCard })),
  { ssr: false }
);
const WuButton = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuButton })),
  { ssr: false }
);
const WuSelect = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuSelect })),
  { ssr: false }
);
const WuCombobox = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuCombobox })),
  { ssr: false }
);
const WuToggle = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuToggle })),
  { ssr: false }
);
const WuDateRangePicker = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuDateRangePicker })),
  { ssr: false }
);

interface AnalyticsFiltersProps {
  quests: StudyQuest[];
  draft: AnalyticsFiltersState;
  onDraftChange: (next: AnalyticsFiltersState) => void;
  onApply: () => void;
  onClear: () => void;
}

function optionFor(data: AnalyticsOption[], value: string): AnalyticsOption {
  return data.find((item) => item.value === value) ?? data[0];
}

function parseIsoDate(iso: string): Date {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function AnalyticsFilters({
  quests,
  draft,
  onDraftChange,
  onApply,
  onClear,
}: AnalyticsFiltersProps) {
  const range: DateRange = {
    from: parseIsoDate(draft.dateFrom),
    to: parseIsoDate(draft.dateTo),
  };

  const questOptions = useMemo(
    () => quests.map((quest) => ({ value: quest.id, label: quest.title })),
    [quests]
  );
  const selectedQuests = questOptions.filter((option) => draft.questIds.includes(option.value));
  const taskSource =
    draft.questIds.length === 0
      ? quests
      : quests.filter((quest) => draft.questIds.includes(quest.id));
  const taskOptions = useMemo(
    () =>
      taskSource.flatMap((quest) =>
        quest.tasks.map((task) => ({ value: task.id, label: task.title }))
      ),
    [taskSource]
  );
  const selectedTasks = taskOptions.filter((option) => draft.taskIds.includes(option.value));

  return (
    <WuCard rounded className="qp-card-depth p-4">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-ink">Filters</h3>
        <div className="flex items-center gap-2">
          <WuButton variant="link" size="sm" onClick={onClear}>
            Clear
          </WuButton>
          <WuButton size="sm" onClick={onApply}>
            Apply filters
          </WuButton>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <WuDateRangePicker
          Label="Date range"
          labelPosition="top"
          variant="outlined"
          formatString="MMM d, yyyy"
          placeholder="Select dates"
          showResetButton
          value={range}
          minDate={new Date(2026, 7, 1)}
          maxDate={new Date(2026, 8, 30)}
          onChange={(next) => {
            if (!next?.from) return;
            onDraftChange({
              ...draft,
              dateFrom: format(next.from, 'yyyy-MM-dd'),
              dateTo: format(next.to ?? next.from, 'yyyy-MM-dd'),
            });
          }}
          onReset={() =>
            onDraftChange({
              ...draft,
              dateFrom: '2026-08-27',
              dateTo: '2026-09-02',
            })
          }
        />
        <WuCombobox
          data={questOptions}
          accessorKey={{ value: 'value', label: 'label' }}
          value={selectedQuests}
          onSelect={(value) => {
            const next = (Array.isArray(value) ? value : value ? [value] : []) as AnalyticsOption[];
            const questIds = next.map((item) => item.value);
            const allowedTasks = new Set(
              quests
                .filter((quest) => questIds.length === 0 || questIds.includes(quest.id))
                .flatMap((quest) => quest.tasks.map((task) => task.id))
            );
            onDraftChange({
              ...draft,
              questIds,
              taskIds: draft.taskIds.filter((id) => allowedTasks.has(id)),
            });
          }}
          Label="Quests"
          variant="outlined"
          multiple
          selectAll={{ enable: true, label: 'All quests', triggerText: 'All quests' }}
          placeholder="All quests"
        />
        <WuCombobox
          data={taskOptions}
          accessorKey={{ value: 'value', label: 'label' }}
          value={selectedTasks}
          onSelect={(value) => {
            const next = (Array.isArray(value) ? value : value ? [value] : []) as AnalyticsOption[];
            onDraftChange({ ...draft, taskIds: next.map((item) => item.value) });
          }}
          Label="Tasks"
          variant="outlined"
          multiple
          selectAll={{ enable: true, label: 'All tasks', triggerText: 'All tasks' }}
          placeholder="All tasks"
        />
        <WuSelect
          data={ANALYTICS_PARTICIPANT_OPTIONS}
          accessorKey={{ value: 'value', label: 'label' }}
          value={optionFor(ANALYTICS_PARTICIPANT_OPTIONS, draft.participantId)}
          Label="Participant"
          variant="outlined"
          onSelect={(value) =>
            onDraftChange({ ...draft, participantId: (value as AnalyticsOption).value })
          }
        />
        <WuSelect
          data={ANALYTICS_RESPONSE_OPTIONS}
          accessorKey={{ value: 'value', label: 'label' }}
          value={optionFor(ANALYTICS_RESPONSE_OPTIONS, draft.responses)}
          Label="Responses"
          variant="outlined"
          onSelect={(value) =>
            onDraftChange({ ...draft, responses: (value as AnalyticsOption).value })
          }
        />
        <WuSelect
          data={ANALYTICS_SEGMENT_OPTIONS}
          accessorKey={{ value: 'value', label: 'label' }}
          value={optionFor(ANALYTICS_SEGMENT_OPTIONS, draft.segmentId)}
          Label="Segments"
          variant="outlined"
          onSelect={(value) =>
            onDraftChange({ ...draft, segmentId: (value as AnalyticsOption).value })
          }
        />
        <WuSelect
          data={ANALYTICS_CHOICE_OPTIONS}
          accessorKey={{ value: 'value', label: 'label' }}
          value={optionFor(ANALYTICS_CHOICE_OPTIONS, draft.choiceId)}
          Label="Response choices"
          variant="outlined"
          onSelect={(value) =>
            onDraftChange({ ...draft, choiceId: (value as AnalyticsOption).value })
          }
        />
        <WuToggle
          Label="Show keywords"
          labelPosition="left"
          checked={draft.keywords}
          onChange={(checked) => onDraftChange({ ...draft, keywords: checked })}
        />
      </div>
    </WuCard>
  );
}
