'use client';

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useWuShowToast } from '@npm-questionpro/wick-ui-lib';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { FoldersTable } from '@/components/projects/FoldersTable';
import { MOCK_RECYCLE_FOLDERS, type StudyFolder } from '@/data/mock-projects';

const WuButton = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuButton })),
  { ssr: false }
);
const WuInput = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuInput })),
  { ssr: false }
);

export default function RecycleBinPage() {
  const { showToast } = useWuShowToast();
  const [folders, setFolders] = useState<StudyFolder[]>(MOCK_RECYCLE_FOLDERS);
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [emptyOpen, setEmptyOpen] = useState(false);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return folders;
    return folders.filter((folder) => folder.name.toLowerCase().includes(query));
  }, [folders, search]);

  return (
    <div className="qp-enter">
      <PageHeader
        title="Folders"
        action={
          <>
            <WuButton variant="link" Icon={<span className="wm-security" />} onClick={() => showToast({ message: 'System logs opened', variant: 'success' })}>
              System logs
            </WuButton>
            <WuButton variant="outline" Icon={<span className="wm-settings" />} onClick={() => showToast({ message: 'Admin opened', variant: 'success' })}>
              Admin
            </WuButton>
          </>
        }
      />
      <div className="px-4 pb-8">
        <Link href="/projects" className="qp-link mb-4 inline-flex items-center gap-1 text-sm">
          <span className="wm-arrow-back" /> Recycle bin
        </Link>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <WuButton color="error" onClick={() => setEmptyOpen(true)}>
            Empty recycle bin
          </WuButton>
          <WuInput
            variant="outlined"
            placeholder="Search for folders"
            Icon={<span className="wm-search" />}
            iconPosition="left"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-72"
          />
        </div>
        {filtered.length === 0 ? (
          <EmptyState icon="wm-delete" title="Recycle bin is empty" />
        ) : (
          <FoldersTable
            folders={filtered}
            selectedIds={selectedIds}
            onToggle={(folder) =>
              setSelectedIds((current) =>
                current.includes(folder.id) ? current.filter((id) => id !== folder.id) : [...current, folder.id]
              )
            }
            noDataContent={<EmptyState icon="wm-search-off" title="No folders found" />}
          />
        )}
      </div>
      <ConfirmModal
        open={emptyOpen}
        onOpenChange={setEmptyOpen}
        title="Empty recycle bin?"
        description="All folders in the recycle bin will be permanently removed."
        confirmLabel="Empty recycle bin"
        variant="critical"
        onConfirm={() => {
          setFolders([]);
          setSelectedIds([]);
          showToast({ message: 'Recycle bin emptied', variant: 'success' });
        }}
      />
    </div>
  );
}
