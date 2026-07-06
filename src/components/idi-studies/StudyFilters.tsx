'use client';

import dynamic from 'next/dynamic';
import type { ModerationMode, StudyStatus } from '@/data/mock-idi-studies';

const WuInput = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuInput })),
  { ssr: false }
);
const WuSelect = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuSelect })),
  { ssr: false }
);

export type DateCreatedFilter =
  | 'all'
  | 'last-7-days'
  | 'last-30-days'
  | 'this-quarter'
  | 'older-than-90-days';

export interface StudyFilterState {
  search: string;
  moderationMode: 'all' | ModerationMode;
  owner: string;
  dateCreated: DateCreatedFilter;
  status: 'all' | StudyStatus;
}

interface FilterOption<T extends string = string> {
  value: T;
  label: string;
}

interface StudyFiltersProps {
  filters: StudyFilterState;
  ownerOptions: FilterOption[];
  onChange: (filters: StudyFilterState) => void;
}

const MODERATION_OPTIONS: FilterOption<StudyFilterState['moderationMode']>[] = [
  { value: 'all', label: 'All Moderation Modes' },
  { value: 'Human Moderated', label: 'Human Moderated' },
  { value: 'AI Moderated', label: 'AI Moderated' },
];

const DATE_CREATED_OPTIONS: FilterOption<DateCreatedFilter>[] = [
  { value: 'all', label: 'Any Date Created' },
  { value: 'last-7-days', label: 'Last 7 Days' },
  { value: 'last-30-days', label: 'Last 30 Days' },
  { value: 'this-quarter', label: 'This Quarter' },
  { value: 'older-than-90-days', label: 'Older Than 90 Days' },
];

const STATUS_OPTIONS: FilterOption<StudyFilterState['status']>[] = [
  { value: 'all', label: 'All Statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'recruiting', label: 'Recruiting' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'archived', label: 'Archived' },
];

function getSelectedOption<T extends string>(options: FilterOption<T>[], value: T) {
  return options.find((option) => option.value === value) ?? options[0];
}

export function StudyFilters({ filters, ownerOptions, onChange }: StudyFiltersProps) {
  const ownerFilterOptions: FilterOption[] = [
    { value: 'all', label: 'All Study Owners' },
    ...ownerOptions,
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 mb-4">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-[minmax(280px,1.5fr)_repeat(4,minmax(180px,1fr))] gap-3">
        <WuInput
          variant="outlined"
          placeholder="Search studies, tags, or participant targets..."
          Icon={<span className="wm-search" />}
          iconPosition="left"
          value={filters.search}
          onChange={(event) => onChange({ ...filters, search: event.target.value })}
        />
        <WuSelect
          data={MODERATION_OPTIONS}
          accessorKey={{ value: 'value', label: 'label' }}
          value={getSelectedOption(MODERATION_OPTIONS, filters.moderationMode)}
          onSelect={(value) => {
            const option = value as FilterOption<StudyFilterState['moderationMode']>;
            onChange({ ...filters, moderationMode: option.value });
          }}
          variant="outlined"
        />
        <WuSelect
          data={ownerFilterOptions}
          accessorKey={{ value: 'value', label: 'label' }}
          value={getSelectedOption(ownerFilterOptions, filters.owner)}
          onSelect={(value) => {
            const option = value as FilterOption;
            onChange({ ...filters, owner: option.value });
          }}
          variant="outlined"
        />
        <WuSelect
          data={DATE_CREATED_OPTIONS}
          accessorKey={{ value: 'value', label: 'label' }}
          value={getSelectedOption(DATE_CREATED_OPTIONS, filters.dateCreated)}
          onSelect={(value) => {
            const option = value as FilterOption<DateCreatedFilter>;
            onChange({ ...filters, dateCreated: option.value });
          }}
          variant="outlined"
        />
        <WuSelect
          data={STATUS_OPTIONS}
          accessorKey={{ value: 'value', label: 'label' }}
          value={getSelectedOption(STATUS_OPTIONS, filters.status)}
          onSelect={(value) => {
            const option = value as FilterOption<StudyFilterState['status']>;
            onChange({ ...filters, status: option.value });
          }}
          variant="outlined"
        />
      </div>
    </div>
  );
}
