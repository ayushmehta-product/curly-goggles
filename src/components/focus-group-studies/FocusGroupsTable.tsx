'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import type { IWuTableColumnDef } from '@npm-questionpro/wick-ui-lib';
import { FOCUS_GROUP_STATUS_LABELS, type FocusGroup, type FocusGroupStatus } from '@/data/mock-focus-groups';
import { truncate } from '@/data/mock-utils';

const WuTable = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuTable })),
  { ssr: false }
);
const WuMenu = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuMenu })),
  { ssr: false }
);
const WuMenuItem = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuMenuItem })),
  { ssr: false }
);
const WuMenuSeparatorItem = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuMenuSeparatorItem })),
  { ssr: false }
);

interface FocusGroupsTableProps {
  focusGroups: FocusGroup[];
  isLoading: boolean;
  noDataContent: React.ReactNode;
  onDuplicate: (focusGroup: FocusGroup) => void;
  onArchive: (focusGroup: FocusGroup) => void;
  onDelete: (focusGroup: FocusGroup) => void;
}

const STATUS_STYLES: Record<FocusGroupStatus, string> = {
  draft: 'bg-gray-100 text-gray-700',
  scheduling: 'bg-purple-50 text-purple-700',
  confirmed: 'bg-green-50 text-green-700',
  completed: 'bg-blue-50 text-blue-700',
  archived: 'bg-amber-50 text-amber-700',
};

function StatusBadge({ status }: { status: FocusGroupStatus }) {
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[status]}`}>
      {FOCUS_GROUP_STATUS_LABELS[status]}
    </span>
  );
}

function SessionDateCell({ focusGroup }: { focusGroup: FocusGroup }) {
  if (!focusGroup.sessionAt) {
    return <p className="text-sm text-gray-400">Not scheduled</p>;
  }

  const sessionDate = new Date(focusGroup.sessionAt);
  return (
    <div>
      <p className="text-sm text-gray-700">{format(sessionDate, 'MMM d, yyyy')}</p>
      <p className="text-xs text-gray-500">{format(sessionDate, 'h:mm a')}</p>
    </div>
  );
}

function CreatedBy({ focusGroup }: { focusGroup: FocusGroup }) {
  return (
    <div className="flex min-w-[150px] items-center gap-2">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 text-[11px] font-semibold text-gray-600">
        {focusGroup.createdBy.initials}
      </span>
      <span className="text-sm text-gray-700">{focusGroup.createdBy.name}</span>
    </div>
  );
}

function RowActions({
  focusGroup,
  onDuplicate,
  onArchive,
  onDelete,
}: {
  focusGroup: FocusGroup;
  onDuplicate: (focusGroup: FocusGroup) => void;
  onArchive: (focusGroup: FocusGroup) => void;
  onDelete: (focusGroup: FocusGroup) => void;
}) {
  const router = useRouter();

  return (
    <WuMenu
      Trigger={
        <button
          type="button"
          aria-label={`Actions for ${focusGroup.title}`}
          className="p-1 rounded-md hover:bg-gray-100"
        >
          <span className="wm-more-vert text-gray-500" />
        </button>
      }
      align="end"
    >
      <WuMenuItem onSelect={() => router.push(`/focus-group-studies/${focusGroup.id}`)}>
        Open Focus Group
      </WuMenuItem>
      <WuMenuItem onSelect={() => onDuplicate(focusGroup)}>Duplicate</WuMenuItem>
      <WuMenuSeparatorItem />
      <WuMenuItem onSelect={() => onArchive(focusGroup)} disabled={focusGroup.status === 'archived'}>
        Archive
      </WuMenuItem>
      <WuMenuItem onSelect={() => onDelete(focusGroup)}>Delete</WuMenuItem>
    </WuMenu>
  );
}

function LoadingTableSkeleton() {
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[900px] overflow-hidden rounded-lg border border-gray-200 bg-white">
        <div className="grid grid-cols-[minmax(320px,1.8fr)_120px_140px_140px_170px_80px] gap-4 border-b border-gray-100 bg-gray-50 px-4 py-3">
          {['Focus Group', 'Status', 'Session Date', 'Participants', 'Created By', 'Actions'].map((label) => (
            <div key={label} className="text-xs font-medium text-gray-500">
              {label}
            </div>
          ))}
        </div>
        <div className="divide-y divide-gray-100">
          {Array.from({ length: 6 }, (_, index) => (
            <div
              key={`focus-group-loading-${index}`}
              className="grid grid-cols-[minmax(320px,1.8fr)_120px_140px_140px_170px_80px] gap-4 px-4 py-4"
            >
              <div className="space-y-2">
                <div className="h-4 w-64 animate-pulse rounded bg-gray-200" />
                <div className="h-3 w-40 animate-pulse rounded bg-gray-100" />
              </div>
              <div className="h-5 w-20 animate-pulse rounded-full bg-gray-100" />
              <div className="h-4 w-20 animate-pulse rounded bg-gray-100" />
              <div className="h-4 w-14 animate-pulse rounded bg-gray-100" />
              <div className="h-7 w-32 animate-pulse rounded bg-gray-100" />
              <div className="h-5 w-5 animate-pulse rounded bg-gray-100" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function FocusGroupsTable({
  focusGroups,
  isLoading,
  noDataContent,
  onDuplicate,
  onArchive,
  onDelete,
}: FocusGroupsTableProps) {
  const columns: IWuTableColumnDef<FocusGroup>[] = [
    {
      accessorKey: 'title',
      header: 'Focus Group',
      filterable: true,
      size: 400,
      cell: ({ row }) => {
        const focusGroup = row.original;
        return (
          <Link
            href={`/focus-group-studies/${focusGroup.id}`}
            title={focusGroup.title}
            className="block max-w-[400px] font-medium text-blue-600 hover:underline"
          >
            {truncate(focusGroup.title, 86)}
          </Link>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      filterable: true,
      size: 120,
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: 'sessionAt',
      header: 'Session Date',
      size: 150,
      cell: ({ row }) => <SessionDateCell focusGroup={row.original} />,
    },
    {
      accessorKey: 'participantsConfirmed',
      header: 'Participants',
      headerAlign: 'right',
      cellAlign: 'right',
      size: 130,
      cell: ({ row }) => (
        <p className="text-sm font-medium text-gray-700">
          {row.original.participantsConfirmed} / {row.original.targetParticipants}
        </p>
      ),
    },
    {
      accessorKey: 'createdBy',
      header: 'Created By',
      size: 170,
      cell: ({ row }) => <CreatedBy focusGroup={row.original} />,
    },
    {
      accessorKey: 'id',
      header: 'Actions',
      cellAlign: 'right',
      size: 80,
      cell: ({ row }) => (
        <RowActions
          focusGroup={row.original}
          onDuplicate={onDuplicate}
          onArchive={onArchive}
          onDelete={onDelete}
        />
      ),
    },
  ];

  if (isLoading) {
    return <LoadingTableSkeleton />;
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[900px]">
        <WuTable
          data={focusGroups as unknown[]}
          columns={columns as unknown as IWuTableColumnDef<unknown>[]}
          variant="striped"
          sort={{ enabled: true }}
          NoDataContent={noDataContent}
        />
      </div>
    </div>
  );
}
