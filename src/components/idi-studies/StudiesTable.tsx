'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { IWuTableColumnDef } from '@npm-questionpro/wick-ui-lib';
import {
  type IdiStudy,
  type StudyStatus,
  STUDY_STATUS_LABELS,
} from '@/data/mock-idi-studies';
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

interface StudiesTableProps {
  studies: IdiStudy[];
  isLoading: boolean;
  noDataContent: React.ReactNode;
  onDuplicate: (study: IdiStudy) => void;
  onArchive: (study: IdiStudy) => void;
  onDelete: (study: IdiStudy) => void;
}

function StatusBadge({ status }: { status: StudyStatus }) {
  const styles: Record<StudyStatus, string> = {
    draft: 'bg-gray-100 text-gray-700',
    recruiting: 'bg-purple-50 text-purple-700',
    active: 'bg-green-50 text-green-700',
    completed: 'bg-blue-50 text-blue-700',
    archived: 'bg-amber-50 text-amber-700',
  };

  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${styles[status]}`}>
      {STUDY_STATUS_LABELS[status]}
    </span>
  );
}

function CreatedBy({ study }: { study: IdiStudy }) {
  return (
    <div className="flex items-center gap-2 min-w-[150px]">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 text-[11px] font-semibold text-gray-600">
        {study.createdBy.initials}
      </span>
      <span className="text-sm text-gray-700">{study.createdBy.name}</span>
    </div>
  );
}

function RowActions({
  study,
  onDuplicate,
  onArchive,
  onDelete,
}: {
  study: IdiStudy;
  onDuplicate: (study: IdiStudy) => void;
  onArchive: (study: IdiStudy) => void;
  onDelete: (study: IdiStudy) => void;
}) {
  const router = useRouter();

  return (
    <WuMenu
      Trigger={
        <button
          type="button"
          aria-label={`Actions for ${study.title}`}
          className="p-1 rounded-md hover:bg-gray-100"
        >
          <span className="wm-more-vert text-gray-500" />
        </button>
      }
      align="end"
    >
      <WuMenuItem onSelect={() => router.push(`/idi-studies/${study.id}`)}>
        Open Study
      </WuMenuItem>
      <WuMenuItem onSelect={() => router.push(`/idi-studies/${study.id}?mode=edit`)}>
        Edit
      </WuMenuItem>
      <WuMenuItem onSelect={() => onDuplicate(study)}>Duplicate</WuMenuItem>
      <WuMenuSeparatorItem />
      <WuMenuItem
        onSelect={() => onArchive(study)}
        disabled={study.status === 'archived'}
      >
        Archive
      </WuMenuItem>
      <WuMenuItem onSelect={() => onDelete(study)}>Delete</WuMenuItem>
    </WuMenu>
  );
}

function LoadingTableSkeleton() {
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[860px] overflow-hidden rounded-lg border border-gray-200 bg-white">
        <div className="grid grid-cols-[minmax(320px,1.8fr)_140px_140px_180px_80px] gap-4 border-b border-gray-100 bg-gray-50 px-4 py-3">
          {['Study Name', 'Status', 'Participants', 'Created By', 'Actions'].map((label) => (
            <div key={label} className="text-xs font-medium text-gray-500">
              {label}
            </div>
          ))}
        </div>
        <div className="divide-y divide-gray-100">
          {Array.from({ length: 6 }, (_, index) => (
            <div
              key={`study-loading-${index}`}
              className="grid grid-cols-[minmax(320px,1.8fr)_140px_140px_180px_80px] gap-4 px-4 py-4"
            >
              <div className="space-y-2">
                <div className="h-4 w-64 animate-pulse rounded bg-gray-200" />
                <div className="h-3 w-80 animate-pulse rounded bg-gray-100" />
              </div>
              <div className="h-5 w-20 animate-pulse rounded-full bg-gray-100" />
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

export function StudiesTable({
  studies,
  isLoading,
  noDataContent,
  onDuplicate,
  onArchive,
  onDelete,
}: StudiesTableProps) {
  const columns: IWuTableColumnDef<IdiStudy>[] = [
    {
      accessorKey: 'title',
      header: 'Study Name',
      filterable: true,
      size: 420,
      cell: ({ row }) => {
        const study = row.original;

        return (
          <div className="max-w-[420px]">
            <Link
              href={`/idi-studies/${study.id}`}
              title={study.title}
              className="block font-medium text-blue-600 hover:underline"
            >
              {truncate(study.title, 86)}
            </Link>
            {/* <p className="mt-1 text-xs text-gray-500">
              {study.researchObjective
                ? truncate(study.researchObjective, 112)
                : 'Research objective not added yet.'}
            </p> */}
            {/* {study.tags && study.tags.length > 0 && (
              <div className="mt-2 flex max-w-full flex-wrap gap-1">
                {study.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="rounded bg-gray-100 px-1.5 py-0.5 text-[11px] font-medium text-gray-600"
                  >
                    {tag}
                  </span>
                ))}
                {study.tags.length > 3 && (
                  <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[11px] font-medium text-gray-500">
                    +{study.tags.length - 3}
                  </span>
                )}
              </div>
            )} */}
          </div>
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
      accessorKey: 'participantsEnrolled',
      header: 'Participants',
      headerAlign: 'right',
      cellAlign: 'right',
      size: 120,
      cell: ({ row }) => (
        <div>
          <p className="text-sm font-medium text-gray-700">
            {row.original.participantsEnrolled} / {row.original.participantGoal}
          </p>
          {/* {row.original.participantsEnrolled === 0 && (
            <p className="text-xs text-gray-400">None yet</p>
          )} */}
        </div>
      ),
    },
    {
      accessorKey: 'createdBy',
      header: 'Created By',
      size: 170,
      cell: ({ row }) => <CreatedBy study={row.original} />,
    },
    {
      accessorKey: 'id',
      header: 'Actions',
      cellAlign: 'right',
      size: 80,
      cell: ({ row }) => (
        <RowActions
          study={row.original}
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
      <div className="min-w-[860px]">
        <WuTable
          data={studies as unknown[]}
          columns={columns as unknown as IWuTableColumnDef<unknown>[]}
          variant="striped"
          sort={{ enabled: true }}
          NoDataContent={noDataContent}
        />
      </div>
    </div>
  );
}
