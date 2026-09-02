'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { IWuTableColumnDef } from '@npm-questionpro/wick-ui-lib';
import type { FolderStudy, StudyStatus } from '@/data/mock-projects';
import { formatDate, truncate } from '@/data/mock-utils';

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

const STATUS_STYLES: Record<StudyStatus, string> = {
  live: 'bg-green-100 text-green-800',
  closed: 'bg-red-100 text-red-700',
  draft: 'bg-gray-100 text-gray-600',
};

function StatusPill({ status }: { status: StudyStatus }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${STATUS_STYLES[status]}`}>
      {status}
    </span>
  );
}

interface FolderStudiesTableProps {
  folderId: string;
  studies: FolderStudy[];
  noDataContent: React.ReactNode;
  onDuplicate: (study: FolderStudy) => void;
  onClose: (study: FolderStudy) => void;
}

export function FolderStudiesTable({
  folderId,
  studies,
  noDataContent,
  onDuplicate,
  onClose,
}: FolderStudiesTableProps) {
  const router = useRouter();

  const columns: IWuTableColumnDef<FolderStudy>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      filterable: true,
      cell: ({ row }) => (
        <Link
          href={`/projects/${folderId}/${row.original.id}`}
          className="font-medium text-blue-600 hover:underline"
        >
          {truncate(row.original.name, 64)}
        </Link>
      ),
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => row.original.type,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusPill status={row.original.status} />,
    },
    {
      accessorKey: 'updatedAt',
      header: 'Last modified',
      cell: ({ row }) => formatDate(row.original.updatedAt),
    },
    {
      accessorKey: 'id',
      header: '',
      cellAlign: 'right',
      cell: ({ row }) => (
        <WuMenu
          Trigger={
            <button type="button" className="rounded-md p-1 hover:bg-gray-100" aria-label="Study actions">
              <span className="wm-more-vert text-gray-500" />
            </button>
          }
          align="end"
        >
          <WuMenuItem onSelect={() => router.push(`/projects/${folderId}/${row.original.id}`)}>
            Open
          </WuMenuItem>
          <WuMenuItem onSelect={() => onDuplicate(row.original)}>Duplicate</WuMenuItem>
          <WuMenuSeparatorItem />
          <WuMenuItem onSelect={() => onClose(row.original)} disabled={row.original.status === 'closed'}>
            Close
          </WuMenuItem>
        </WuMenu>
      ),
    },
  ];

  return (
    <WuTable
      data={studies as unknown[]}
      columns={columns as unknown as IWuTableColumnDef<unknown>[]}
      variant="striped"
      sort={{ enabled: true }}
      NoDataContent={noDataContent}
    />
  );
}
