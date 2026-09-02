'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useWuShowToast } from '@npm-questionpro/wick-ui-lib';
import type { IWuTableColumnDef } from '@npm-questionpro/wick-ui-lib';
import type { StudyFolder } from '@/data/mock-projects';
import { getFolderStudyCount } from '@/data/mock-projects';
import { formatDate, truncate } from '@/data/mock-utils';

const WuTable = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuTable })),
  { ssr: false }
);
const WuCheckbox = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuCheckbox })),
  { ssr: false }
);
const WuButton = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuButton })),
  { ssr: false }
);

interface FoldersTableProps {
  folders: StudyFolder[];
  selectedIds: string[];
  onToggle: (folder: StudyFolder) => void;
  onRename?: (folder: StudyFolder) => void;
  noDataContent: React.ReactNode;
}

export function FoldersTable({
  folders,
  selectedIds,
  onToggle,
  onRename,
  noDataContent,
}: FoldersTableProps) {
  const { showToast } = useWuShowToast();

  const columns: IWuTableColumnDef<StudyFolder>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      filterable: true,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <WuCheckbox
            checked={selectedIds.includes(row.original.id)}
            onChange={() => onToggle(row.original)}
          />
          <Link href={`/projects/${row.original.id}`} className="qp-link font-medium">
            {truncate(row.original.name, 72)}
          </Link>
        </div>
      ),
    },
    {
      accessorKey: 'id',
      header: 'Studies',
      cell: ({ row }) => getFolderStudyCount(row.original.id),
    },
    {
      accessorKey: 'createdAt',
      header: 'Created at',
      cell: ({ row }) => formatDate(row.original.createdAt),
    },
    {
      accessorKey: 'updatedAt',
      header: 'Last modified',
      cell: ({ row }) => (
        <div className="group flex items-center justify-between gap-2">
          <span>{formatDate(row.original.updatedAt)}</span>
          <WuButton
            variant="iconOnly"
            size="sm"
            aria-label="Rename"
            className="opacity-0 transition-opacity duration-150 group-hover:opacity-100"
            Icon={<span className="wm-edit text-accent" />}
            onClick={() => {
              onRename?.(row.original);
              showToast({ message: 'Rename opened', variant: 'success' });
            }}
          />
        </div>
      ),
    },
  ];

  return (
    <WuTable
      data={folders as unknown[]}
      columns={columns as unknown as IWuTableColumnDef<unknown>[]}
      variant="striped"
      sort={{ enabled: true }}
      NoDataContent={noDataContent}
    />
  );
}
