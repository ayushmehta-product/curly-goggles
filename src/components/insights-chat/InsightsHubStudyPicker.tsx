'use client';

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import type { IWuDrilldownContext, IWuTableColumnDef, IWuTableRowSelection } from '@npm-questionpro/wick-ui-lib';
import { FOCUS_GROUP_STATUS_LABELS, MOCK_FOCUS_GROUPS, type FocusGroup } from '@/data/mock-focus-groups';
import { STUDY_STATUS_LABELS as INTERVIEW_STATUS_LABELS, MOCK_IDI_STUDIES, type IdiStudy } from '@/data/mock-idi-studies';
import { TEST_STATUS_LABELS, MOCK_USABILITY_TESTS, type UsabilityTest } from '@/data/mock-usability-tests';
import { MOCK_FOLDER_STUDIES, MOCK_STUDY_FOLDERS, type FolderStudy } from '@/data/mock-projects';
import {
  FOCUS_GROUP_FOLDERS,
  INTERVIEW_FOLDERS,
  RESEARCH_AREA_LABELS,
  USABILITY_TEST_FOLDERS,
  foldersForArea,
  focusGroupsInFolder,
  interviewsInFolder,
  studiesInFolder,
  studyFolders,
  unfiledFocusGroups,
  unfiledInterviews,
  unfiledUsabilityTests,
  usabilityTestsInFolder,
  type ResearchArea,
} from '@/data/mock-research-folders';
import type { ContextOverride, InsightsStudyKind, InsightsStudySelection } from './chat-types';

const WuDrilldown = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuDrilldown })),
  { ssr: false }
);
const WuTable = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuTable })),
  { ssr: false }
);
const WuButton = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuButton })),
  { ssr: false }
);
const WuInput = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuInput })),
  { ssr: false }
);
const WuChip = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuChip })),
  { ssr: false }
);

interface InsightsHubStudyPickerProps {
  selected: InsightsStudySelection[];
  onChange: (next: InsightsStudySelection[]) => void;
  onContinue: () => void;
  continueLabel?: string;
  onBack?: () => void;
}

type NamedRow = { id: string; name: string; status: string };
type PickerRow = NamedRow & {
  rowKind: 'folder' | 'item';
  itemCount?: number;
};

const AREAS: ResearchArea[] = ['usability-tests', 'interviews', 'focus-groups', 'studies'];

function matchesQuery(value: string, query: string): boolean {
  if (!query) return true;
  return value.toLowerCase().includes(query);
}

function CompactTable({
  rows,
  selectedRows,
  onRowSelect,
  emptyLabel,
  onFolderOpen,
}: {
  rows: PickerRow[];
  selectedRows: PickerRow[];
  onRowSelect?: IWuTableRowSelection<PickerRow>['onRowSelect'];
  emptyLabel: string;
  onFolderOpen?: (folderId: string, folderName: string) => void;
}) {
  const hasSelectableRows = rows.some((row) => !isFolderRowDisabled(row));
  const columns: IWuTableColumnDef<PickerRow>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => {
        const item = row.original;
        if (item.rowKind === 'folder') {
          return (
            <button
              type="button"
              className="flex w-full items-center gap-1 text-left"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onFolderOpen?.(folderIdFromRow(item), item.name);
              }}
            >
              <span className="wm-folder text-base text-ink-muted" aria-hidden />
              <span className="text-sm font-medium text-ink">{item.name}</span>
              <span className="wm-chevron-right text-ink-muted" aria-hidden />
            </button>
          );
        }
        return <span className="text-sm font-medium text-ink">{item.name}</span>;
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      size: 96,
      cell: ({ row }) => {
        const item = row.original;
        if (item.rowKind === 'folder') {
          const count = item.itemCount ?? 0;
          return (
            <span className="text-xs text-ink-muted">
              {count === 1 ? '1 item' : `${count} items`}
            </span>
          );
        }
        return <span className="text-xs capitalize text-ink-muted">{item.status}</span>;
      },
    },
  ];

  return (
    <div className="overflow-x-auto">
      <WuTable
        data={rows as unknown[]}
        columns={columns as unknown as IWuTableColumnDef<unknown>[]}
        size="compact"
        variant="unstyled"
        NoDataContent={<p className="px-2 py-3 text-sm text-ink-muted">{emptyLabel}</p>}
        rowSelection={{
          isEnabled: hasSelectableRows,
          selectedRows: selectedRows as unknown[],
          onRowSelect: onRowSelect as IWuTableRowSelection<unknown>['onRowSelect'],
          rowUniqueKey: 'id',
          isRowDisabled: (row) => isFolderRowDisabled(row as PickerRow),
          hideSelectAll: !hasSelectableRows,
        }}
      />
    </div>
  );
}

function toUtRow(item: UsabilityTest): NamedRow {
  return { id: item.id, name: item.title, status: TEST_STATUS_LABELS[item.status] };
}

function toInterviewRow(item: IdiStudy): NamedRow {
  return { id: item.id, name: item.title, status: INTERVIEW_STATUS_LABELS[item.status] };
}

function toFgRow(item: FocusGroup): NamedRow {
  return { id: item.id, name: item.title, status: FOCUS_GROUP_STATUS_LABELS[item.status] };
}

function toStudyRow(item: FolderStudy): NamedRow {
  return { id: `${item.folderId}:${item.id}`, name: item.name, status: item.status };
}

function folderIdFromRow(row: PickerRow): string {
  return row.id.replace(/^folder:/, '');
}

function isFolderRowDisabled(row: PickerRow): boolean {
  return row.rowKind === 'folder' && (row.itemCount ?? 0) === 0;
}

function itemsInFolder(kind: InsightsStudyKind, folderId: string): NamedRow[] {
  if (kind === 'usability-test') return usabilityTestsInFolder(folderId).map(toUtRow);
  if (kind === 'interview') return interviewsInFolder(folderId).map(toInterviewRow);
  if (kind === 'focus-group') return focusGroupsInFolder(folderId).map(toFgRow);
  return studiesInFolder(folderId).map(toStudyRow);
}

function toSelection(kind: InsightsStudyKind, row: NamedRow, folderId?: string): InsightsStudySelection {
  const id = kind === 'study' ? row.id.split(':')[1] : row.id;
  const resolvedFolderId = kind === 'study' ? row.id.split(':')[0] : folderId;
  return {
    key: kind === 'study' ? `study:${resolvedFolderId}:${id}` : `${kind}:${id}`,
    kind,
    id,
    folderId: resolvedFolderId,
    name: row.name,
  };
}

function folderDisplayName(kind: InsightsStudyKind, folderId: string): string {
  if (kind === 'usability-test') return USABILITY_TEST_FOLDERS.find((folder) => folder.id === folderId)?.name ?? folderId;
  if (kind === 'interview') return INTERVIEW_FOLDERS.find((folder) => folder.id === folderId)?.name ?? folderId;
  if (kind === 'focus-group') return FOCUS_GROUP_FOLDERS.find((folder) => folder.id === folderId)?.name ?? folderId;
  return MOCK_STUDY_FOLDERS.find((folder) => folder.id === folderId)?.name ?? folderId;
}

function isFolderFullySelected(selected: InsightsStudySelection[], kind: InsightsStudyKind, folderId: string): boolean {
  const items = itemsInFolder(kind, folderId);
  if (items.length === 0) return false;
  return items.every((row) => selected.some((item) => item.key === toSelection(kind, row, folderId).key));
}

interface DisplayChip {
  key: string;
  name: string;
  kind: InsightsStudyKind;
  removeKeys: string[];
}

function displayChips(selected: InsightsStudySelection[]): DisplayChip[] {
  const grouped = new Map<string, InsightsStudySelection[]>();
  for (const item of selected) {
    if (!item.folderId) continue;
    const groupKey = `${item.kind}::${item.folderId}`;
    const group = grouped.get(groupKey) ?? [];
    group.push(item);
    grouped.set(groupKey, group);
  }

  const fullFolders = new Set<string>();
  for (const [groupKey, group] of grouped) {
    const folderId = group[0].folderId;
    if (!folderId) continue;
    const all = itemsInFolder(group[0].kind, folderId);
    if (all.length > 0 && group.length === all.length) fullFolders.add(groupKey);
  }

  const consumed = new Set<string>();
  const chips: DisplayChip[] = [];
  for (const item of selected) {
    if (consumed.has(item.key)) continue;
    if (item.folderId) {
      const groupKey = `${item.kind}::${item.folderId}`;
      if (fullFolders.has(groupKey)) {
        const group = grouped.get(groupKey) ?? [];
        group.forEach((entry) => consumed.add(entry.key));
        chips.push({
          key: `folder:${groupKey}`,
          name: folderDisplayName(item.kind, item.folderId),
          kind: item.kind,
          removeKeys: group.map((entry) => entry.key),
        });
        continue;
      }
    }
    consumed.add(item.key);
    chips.push({ key: item.key, name: item.name, kind: item.kind, removeKeys: [item.key] });
  }
  return chips;
}

const KIND_TO_AREA: Record<InsightsStudySelection['kind'], ResearchArea> = {
  'usability-test': 'usability-tests',
  interview: 'interviews',
  'focus-group': 'focus-groups',
  study: 'studies',
};

export function InsightsHubStudyPicker({
  selected,
  onChange,
  onContinue,
  continueLabel = 'Continue',
  onBack,
}: InsightsHubStudyPickerProps) {
  const [area, setArea] = useState<ResearchArea>('usability-tests');
  const [activeFolder, setActiveFolder] = useState<{ id: string; name: string } | null>(null);
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();

  const chips = useMemo(() => displayChips(selected), [selected]);
  const selectedCount = chips.length;
  const selectedByArea = useMemo(() => {
    const counts: Record<ResearchArea, number> = {
      'usability-tests': 0,
      interviews: 0,
      'focus-groups': 0,
      studies: 0,
    };
    for (const chip of chips) {
      counts[KIND_TO_AREA[chip.kind]] += 1;
    }
    return counts;
  }, [chips]);

  function removeSelected(keys: string[]) {
    const remove = new Set(keys);
    onChange(selected.filter((item) => !remove.has(item.key)));
  }

  function upsertRows(
    kind: InsightsStudySelection['kind'],
    nextRows: NamedRow[],
    folderId?: string
  ) {
    const kept = selected.filter((item) => {
      if (item.kind !== kind) return true;
      if (folderId) return item.folderId !== folderId;
      return item.folderId !== undefined;
    });
    const added = nextRows.map((row) => toSelection(kind, row, folderId));
    onChange([...kept, ...added]);
  }

  const unfiledRows = useMemo(() => {
    if (area === 'usability-tests') return unfiledUsabilityTests().map(toUtRow).filter((row) => matchesQuery(row.name, q));
    if (area === 'interviews') return unfiledInterviews().map(toInterviewRow).filter((row) => matchesQuery(row.name, q));
    if (area === 'focus-groups') return unfiledFocusGroups().map(toFgRow).filter((row) => matchesQuery(row.name, q));
    return [];
  }, [area, q]);

  const folderList = useMemo(() => {
    if (area === 'studies') {
      return studyFolders()
        .filter((folder) => matchesQuery(folder.name, q) || studiesInFolder(folder.id).some((study) => matchesQuery(study.name, q)))
        .map((folder) => ({ id: folder.id, name: folder.name, count: studiesInFolder(folder.id).length }));
    }
    return foldersForArea(area)
      .filter((folder) => {
        const items =
          area === 'usability-tests'
            ? usabilityTestsInFolder(folder.id)
            : area === 'interviews'
              ? interviewsInFolder(folder.id)
              : focusGroupsInFolder(folder.id);
        return matchesQuery(folder.name, q) || items.some((item) => matchesQuery(('title' in item ? item.title : '') as string, q));
      })
      .map((folder) => ({
        id: folder.id,
        name: folder.name,
        count:
          area === 'usability-tests'
            ? usabilityTestsInFolder(folder.id).length
            : area === 'interviews'
              ? interviewsInFolder(folder.id).length
              : focusGroupsInFolder(folder.id).length,
      }));
  }, [area, q]);

  const folderRows = useMemo(() => {
    if (!activeFolder) return [];
    if (area === 'usability-tests') {
      return usabilityTestsInFolder(activeFolder.id).map(toUtRow).filter((row) => matchesQuery(row.name, q));
    }
    if (area === 'interviews') {
      return interviewsInFolder(activeFolder.id).map(toInterviewRow).filter((row) => matchesQuery(row.name, q));
    }
    if (area === 'focus-groups') {
      return focusGroupsInFolder(activeFolder.id).map(toFgRow).filter((row) => matchesQuery(row.name, q));
    }
    return studiesInFolder(activeFolder.id).map(toStudyRow).filter((row) => matchesQuery(row.name, q));
  }, [activeFolder, area, q]);

  const kindForArea: InsightsStudySelection['kind'] =
    area === 'usability-tests' ? 'usability-test' : area === 'interviews' ? 'interview' : area === 'focus-groups' ? 'focus-group' : 'study';

  const areaRows: PickerRow[] = useMemo(() => {
    const folders: PickerRow[] = folderList.map((folder) => ({
      id: `folder:${folder.id}`,
      name: folder.name,
      status: '',
      rowKind: 'folder',
      itemCount: folder.count,
    }));
    const items: PickerRow[] = unfiledRows.map((row) => ({ ...row, rowKind: 'item' }));
    return [...folders, ...items];
  }, [folderList, unfiledRows]);

  const selectedUnfiledRows = unfiledRows
    .filter((row) =>
      selected.some(
        (item) =>
          item.kind === kindForArea &&
          (kindForArea === 'study' ? `${item.folderId}:${item.id}` : item.id) === row.id &&
          !item.folderId
      )
    )
    .map((row) => ({ ...row, rowKind: 'item' as const }));

  const selectedFolderRows = areaRows.filter(
    (row) => row.rowKind === 'folder' && isFolderFullySelected(selected, kindForArea, folderIdFromRow(row))
  );

  const selectedAreaRows: PickerRow[] = [...selectedFolderRows, ...selectedUnfiledRows];

  const selectedFolderItemRows = folderRows
    .filter((row) =>
      selected.some((item) => {
        const rowId = kindForArea === 'study' ? `${item.folderId}:${item.id}` : item.id;
        return item.kind === kindForArea && rowId === row.id && item.folderId === activeFolder?.id;
      })
    )
    .map((row) => ({ ...row, rowKind: 'item' as const }));

  function applyAreaSelection(nextRows: PickerRow[]) {
    const nextFolderIds = new Set(
      nextRows.filter((row) => row.rowKind === 'folder' || row.id.startsWith('folder:')).map((row) => folderIdFromRow(row))
    );
    const nextUnfiledIds = new Set(
      nextRows.filter((row) => row.rowKind !== 'folder' && !row.id.startsWith('folder:')).map((row) => row.id)
    );
    const previouslyFullFolderIds = new Set(
      folderList.filter((folder) => isFolderFullySelected(selected, kindForArea, folder.id)).map((folder) => folder.id)
    );
    const visibleFolderIds = new Set(folderList.map((folder) => folder.id));
    const visibleUnfiledIds = new Set(unfiledRows.map((row) => row.id));

    const otherAreas = selected.filter((item) => KIND_TO_AREA[item.kind] !== area);
    const thisArea: InsightsStudySelection[] = [];

    for (const row of unfiledRows) {
      if (nextUnfiledIds.has(row.id)) thisArea.push(toSelection(kindForArea, row));
    }
    for (const item of selected) {
      if (KIND_TO_AREA[item.kind] !== area || item.folderId) continue;
      if (!visibleUnfiledIds.has(item.id)) thisArea.push(item);
    }

    for (const folder of folderList) {
      if (nextFolderIds.has(folder.id)) {
        thisArea.push(...itemsInFolder(kindForArea, folder.id).map((row) => toSelection(kindForArea, row, folder.id)));
        continue;
      }
      if (previouslyFullFolderIds.has(folder.id)) continue;
      thisArea.push(...selected.filter((item) => item.kind === kindForArea && item.folderId === folder.id));
    }
    for (const item of selected) {
      if (item.kind !== kindForArea || !item.folderId || visibleFolderIds.has(item.folderId)) continue;
      thisArea.push(item);
    }

    onChange([...otherAreas, ...thisArea]);
  }

  function AreaLevel({ ctx }: { ctx: IWuDrilldownContext }) {
    return (
      <div className="h-full overflow-y-auto p-4 pb-6">
        <div className="flex flex-col gap-4">
          <WuInput
            variant="outlined"
            placeholder={`Search ${RESEARCH_AREA_LABELS[area].toLowerCase()}`}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <CompactTable
            rows={areaRows}
            selectedRows={selectedAreaRows}
            emptyLabel="No folders or unfiled items"
            onFolderOpen={(folderId, folderName) => {
              setActiveFolder({ id: folderId, name: folderName });
              ctx.goNext('LEVEL_1', { id: 'LEVEL_1', title: folderName });
            }}
            onRowSelect={(updater) => {
              const next = typeof updater === 'function' ? updater(selectedAreaRows) : updater;
              applyAreaSelection(next as PickerRow[]);
            }}
          />
        </div>
      </div>
    );
  }

  function FolderLevel() {
    return (
      <div className="h-full overflow-y-auto p-4 pb-6">
        <div className="flex flex-col gap-3">
          <p className="text-xs text-ink-muted">Items in this folder are not listed outside it.</p>
          <CompactTable
            rows={folderRows.map((row) => ({ ...row, rowKind: 'item' as const }))}
            selectedRows={selectedFolderItemRows}
            emptyLabel="No studies in this folder."
            onRowSelect={(updater) => {
              const currentItems = selectedFolderItemRows;
              const next = typeof updater === 'function' ? updater(currentItems) : updater;
              upsertRows(
                kindForArea,
                (next as PickerRow[]).filter((row) => row.rowKind === 'item'),
                activeFolder?.id
              );
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-surface">
      <div className="shrink-0 border-b border-line px-4 py-3">
        <p className="text-sm font-semibold text-ink">Select studies to import</p>
        <p className="mt-1 text-xs leading-5 text-ink-muted">
          Add from any area. Switch types to keep building the same list. Foldered items stay inside their folder.
        </p>
        <div className="mt-3 flex flex-wrap gap-1">
          {AREAS.map((item) => {
            const isActive = item === area;
            const count = selectedByArea[item];
            return (
              <WuButton
                key={item}
                size="sm"
                variant={isActive ? 'primary' : 'secondary'}
                onClick={() => {
                  setArea(item);
                  setActiveFolder(null);
                  setQuery('');
                }}
              >
                {`${RESEARCH_AREA_LABELS[item]}${count > 0 ? ` · ${count}` : ''}`}
              </WuButton>
            );
          })}
        </div>
      </div>

      <div className="relative h-0 min-h-0 flex-1 overflow-hidden">
        <WuDrilldown
          key={area}
          initial="LEVEL_0"
          baseTitle={{ id: 'LEVEL_0', title: RESEARCH_AREA_LABELS[area] }}
          variant="slideRight"
          offsetHeight={40}
          items={{
            LEVEL_0: { component: (ctx) => <AreaLevel ctx={ctx} /> },
            LEVEL_1: { component: () => <FolderLevel /> },
          }}
        />
      </div>

      <div className="relative z-[1] shrink-0 border-t border-line bg-surface px-4 py-3">
        {selectedCount > 0 && (
          <div className="mb-3 flex max-h-20 flex-wrap gap-1 overflow-y-auto">
            {chips.map((chip) => (
              <WuChip
                key={chip.key}
                variant="secondary"
                size="sm"
                onClose={() => removeSelected(chip.removeKeys)}
              >
                {chip.name}
              </WuChip>
            ))}
          </div>
        )}
        <div className="flex items-center justify-between gap-2">
          {onBack ? (
            <WuButton variant="secondary" onClick={onBack}>
              Back to chat
            </WuButton>
          ) : (
            <span className="text-xs text-ink-muted">
              {selectedCount === 0 ? 'Select from more than one area' : `${selectedCount} selected`}
            </span>
          )}
          <WuButton onClick={onContinue} disabled={selectedCount === 0}>
            {continueLabel}
          </WuButton>
        </div>
      </div>
    </div>
  );
}

export function selectionFromOverride(override?: ContextOverride): InsightsStudySelection[] {
  if (!override) return [];
  const items: InsightsStudySelection[] = [];

  for (const id of override.usabilityTestIds ?? []) {
    const test = MOCK_USABILITY_TESTS.find((item) => item.id === id);
    if (!test) continue;
    items.push({
      key: `usability-test:${id}`,
      kind: 'usability-test',
      id,
      folderId: test.folderId,
      name: test.title,
    });
  }

  for (const id of override.idiStudyIds ?? []) {
    const study = MOCK_IDI_STUDIES.find((item) => item.id === id);
    if (!study) continue;
    items.push({
      key: `interview:${id}`,
      kind: 'interview',
      id,
      folderId: study.folderId,
      name: study.title,
    });
  }

  for (const id of override.fgFocusGroupIds ?? []) {
    const group = MOCK_FOCUS_GROUPS.find((item) => item.id === id);
    if (!group) continue;
    items.push({
      key: `focus-group:${id}`,
      kind: 'focus-group',
      id,
      folderId: group.folderId,
      name: group.title,
    });
  }

  for (const studyKey of override.studyKeys ?? []) {
    const [folderId, id] = studyKey.split(':');
    const study = MOCK_FOLDER_STUDIES.find((item) => item.folderId === folderId && item.id === id);
    if (!study) continue;
    items.push({
      key: `study:${folderId}:${id}`,
      kind: 'study',
      id,
      folderId,
      name: study.name,
    });
  }

  return items;
}

export function selectionToOverride(selected: InsightsStudySelection[]): ContextOverride {
  return {
    usabilityTestIds: selected.filter((item) => item.kind === 'usability-test').map((item) => item.id),
    idiStudyIds: selected.filter((item) => item.kind === 'interview').map((item) => item.id),
    fgFocusGroupIds: selected.filter((item) => item.kind === 'focus-group').map((item) => item.id),
    idiSessionIds: [],
    studyKeys: selected
      .filter((item) => item.kind === 'study' && item.folderId)
      .map((item) => `${item.folderId}:${item.id}`),
  };
}
