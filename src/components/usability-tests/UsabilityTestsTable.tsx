'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { IWuTableColumnDef } from '@npm-questionpro/wick-ui-lib';
import {
  type UsabilityTest,
  type TestStatus,
  TEST_STATUS_LABELS,
  TEST_SURFACE_LABELS,
  TEST_SURFACE_ICONS,
} from '@/data/mock-usability-tests';
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
const WuChip = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuChip })),
  { ssr: false }
);

interface UsabilityTestsTableProps {
  tests: UsabilityTest[];
  isLoading: boolean;
  noDataContent: React.ReactNode;
  onDuplicate: (test: UsabilityTest) => void;
  onArchive: (test: UsabilityTest) => void;
  onDelete: (test: UsabilityTest) => void;
}

function StatusBadge({ status }: { status: TestStatus }) {
  const styles: Record<TestStatus, string> = {
    draft: 'bg-gray-100 text-gray-700',
    recruiting: 'bg-purple-50 text-purple-700',
    active: 'bg-green-50 text-green-700',
    completed: 'bg-blue-50 text-blue-700',
    archived: 'bg-amber-50 text-amber-700',
  };
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${styles[status]}`}>
      {TEST_STATUS_LABELS[status]}
    </span>
  );
}

function SurfaceChip({ test }: { test: UsabilityTest }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`${TEST_SURFACE_ICONS[test.surface]} text-sm text-gray-400`} />
      <span className="text-sm text-gray-600">{TEST_SURFACE_LABELS[test.surface]}</span>
    </div>
  );
}

function CreatedByCell({ test }: { test: UsabilityTest }) {
  return (
    <div className="flex min-w-[140px] items-center gap-2">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 text-[11px] font-semibold text-gray-600">
        {test.createdBy.initials}
      </span>
      <span className="text-sm text-gray-700">{test.createdBy.name}</span>
    </div>
  );
}

function RowActions({
  test,
  onDuplicate,
  onArchive,
  onDelete,
}: {
  test: UsabilityTest;
  onDuplicate: (test: UsabilityTest) => void;
  onArchive: (test: UsabilityTest) => void;
  onDelete: (test: UsabilityTest) => void;
}) {
  const router = useRouter();
  return (
    <WuMenu
      Trigger={
        <button
          type="button"
          aria-label={`Actions for ${test.title}`}
          className="rounded-md p-1 hover:bg-gray-100"
        >
          <span className="wm-more-vert text-gray-500" />
        </button>
      }
      align="end"
    >
      <WuMenuItem onSelect={() => router.push(`/usability-tests/${test.id}`)}>
        Open Test
      </WuMenuItem>
      <WuMenuItem onSelect={() => router.push(`/usability-tests/${test.id}/analyze`)}>
        View Analytics
      </WuMenuItem>
      <WuMenuItem onSelect={() => onDuplicate(test)}>Duplicate</WuMenuItem>
      <WuMenuSeparatorItem />
      <WuMenuItem onSelect={() => onArchive(test)} disabled={test.status === 'archived'}>
        Archive
      </WuMenuItem>
      <WuMenuItem onSelect={() => onDelete(test)}>Delete</WuMenuItem>
    </WuMenu>
  );
}

function LoadingTableSkeleton() {
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[900px] overflow-hidden rounded-lg border border-gray-200 bg-white">
        <div className="grid grid-cols-[minmax(320px,1.8fr)_120px_130px_130px_160px_80px] gap-4 border-b border-gray-100 bg-gray-50 px-4 py-3">
          {['Test Name', 'Status', 'Surface', 'Participants', 'Created By', 'Actions'].map((label) => (
            <div key={label} className="text-xs font-medium text-gray-500">{label}</div>
          ))}
        </div>
        <div className="divide-y divide-gray-100">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={`ut-loading-${i}`} className="grid grid-cols-[minmax(320px,1.8fr)_120px_130px_130px_160px_80px] gap-4 px-4 py-4">
              <div className="space-y-2">
                <div className="h-4 w-64 animate-pulse rounded bg-gray-200" />
                <div className="h-3 w-80 animate-pulse rounded bg-gray-100" />
              </div>
              <div className="h-5 w-20 animate-pulse rounded-full bg-gray-100" />
              <div className="h-5 w-24 animate-pulse rounded bg-gray-100" />
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

export function UsabilityTestsTable({
  tests,
  isLoading,
  noDataContent,
  onDuplicate,
  onArchive,
  onDelete,
}: UsabilityTestsTableProps) {
  const columns: IWuTableColumnDef<UsabilityTest>[] = [
    {
      accessorKey: 'title',
      header: 'Test Name',
      filterable: true,
      size: 400,
      cell: ({ row }) => {
        const test = row.original;
        return (
          <div className="max-w-[400px]">
            <Link
              href={`/usability-tests/${test.id}`}
              title={test.title}
              className="block font-medium text-blue-600 hover:underline"
            >
              {truncate(test.title, 86)}
            </Link>
            {test.tags && test.tags.length > 0 && (
              <div className="mt-2 flex max-w-full flex-wrap gap-1">
                {test.tags.slice(0, 3).map((tag) => (
                  <WuChip key={tag} variant="secondary" size="sm">{tag}</WuChip>
                ))}
                {test.tags.length > 3 && (
                  <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[11px] font-medium text-gray-500">
                    +{test.tags.length - 3}
                  </span>
                )}
              </div>
            )}
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
      accessorKey: 'surface',
      header: 'Surface',
      size: 130,
      cell: ({ row }) => <SurfaceChip test={row.original} />,
    },
    {
      accessorKey: 'participantsEnrolled',
      header: 'Participants',
      headerAlign: 'right',
      cellAlign: 'right',
      size: 120,
      cell: ({ row }) => (
        <p className="text-sm font-medium text-gray-700">
          {row.original.participantsEnrolled} / {row.original.participantGoal}
        </p>
      ),
    },
    {
      accessorKey: 'createdBy',
      header: 'Created By',
      size: 160,
      cell: ({ row }) => <CreatedByCell test={row.original} />,
    },
    {
      accessorKey: 'id',
      header: 'Actions',
      cellAlign: 'right',
      size: 80,
      cell: ({ row }) => (
        <RowActions
          test={row.original}
          onDuplicate={onDuplicate}
          onArchive={onArchive}
          onDelete={onDelete}
        />
      ),
    },
  ];

  if (isLoading) return <LoadingTableSkeleton />;

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[900px]">
        <WuTable
          data={tests as unknown[]}
          columns={columns as unknown as IWuTableColumnDef<unknown>[]}
          variant="striped"
          sort={{ enabled: true }}
          NoDataContent={noDataContent}
        />
      </div>
    </div>
  );
}
