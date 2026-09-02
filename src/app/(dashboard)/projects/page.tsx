'use client';

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useWuShowToast } from '@npm-questionpro/wick-ui-lib';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { FoldersTable } from '@/components/projects/FoldersTable';
import { FoldersGrid } from '@/components/projects/FoldersGrid';
import { MOCK_STUDY_FOLDERS, type StudyFolder } from '@/data/mock-projects';

const WuButton = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuButton })),
  { ssr: false }
);
const WuInput = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuInput })),
  { ssr: false }
);
const WuCheckbox = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuCheckbox })),
  { ssr: false }
);
const WuModal = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuModal })),
  { ssr: false }
);
const WuModalHeader = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuModalHeader })),
  { ssr: false }
);
const WuModalContent = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuModalContent })),
  { ssr: false }
);
const WuModalFooter = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuModalFooter })),
  { ssr: false }
);
const WuModalClose = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuModalClose })),
  { ssr: false }
);

type ViewMode = 'list' | 'grid';
const PAGE_SIZE = 8;

export default function FoldersPage() {
  const { showToast } = useWuShowToast();
  const router = useRouter();
  const [folders, setFolders] = useState<StudyFolder[]>(MOCK_STUDY_FOLDERS);
  const [search, setSearch] = useState('');
  const [view, setView] = useState<ViewMode>('list');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [page, setPage] = useState(0);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [archiveOpen, setArchiveOpen] = useState(false);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return folders;
    return folders.filter((folder) => folder.name.toLowerCase().includes(query));
  }, [folders, search]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const allPageSelected = pageItems.length > 0 && pageItems.every((folder) => selectedIds.includes(folder.id));

  function handleToggle(folder: StudyFolder) {
    setSelectedIds((current) =>
      current.includes(folder.id) ? current.filter((id) => id !== folder.id) : [...current, folder.id]
    );
  }

  function handleSelectAll(checked: boolean) {
    const pageIds = pageItems.map((folder) => folder.id);
    setSelectedIds((current) => {
      const withoutPage = current.filter((id) => !pageIds.includes(id));
      return checked ? [...withoutPage, ...pageIds] : withoutPage;
    });
  }

  function handleCreate() {
    if (!newName.trim()) return;
    const now = new Date().toISOString().slice(0, 10);
    const folder: StudyFolder = {
      id: `f-${Date.now()}`,
      name: newName.trim(),
      createdAt: now,
      updatedAt: now,
    };
    setFolders((current) => [folder, ...current]);
    setIsCreateOpen(false);
    setNewName('');
    showToast({ message: `"${folder.name}" created`, variant: 'success' });
  }

  function handleArchive() {
    if (selectedIds.length === 0) {
      showToast({ message: 'Select folders to archive', variant: 'error' });
      return;
    }
    setArchiveOpen(true);
  }

  function confirmArchive() {
    setFolders((current) => current.filter((folder) => !selectedIds.includes(folder.id)));
    showToast({ message: `${selectedIds.length} items archived`, variant: 'success' });
    setSelectedIds([]);
    setArchiveOpen(false);
    router.push('/projects/recycle-bin');
  }

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
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <WuButton Icon={<span className="wm-add" />} onClick={() => setIsCreateOpen(true)}>
            New folder
          </WuButton>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <WuInput
              variant="outlined"
              placeholder="Search for folders"
              Icon={<span className="wm-search" />}
              iconPosition="left"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
                setSelectedIds([]);
              }}
              className="w-72"
            />
            <WuButton
              variant="iconOnly"
              aria-label="Grid view"
              Icon={<span className="wm-grid-view" />}
              className={view === 'grid' ? 'text-accent' : 'text-ink-muted'}
              onClick={() => setView('grid')}
            />
            <WuButton
              variant="iconOnly"
              aria-label="List view"
              Icon={<span className="wm-view-list" />}
              className={view === 'list' ? 'text-accent' : 'text-ink-muted'}
              onClick={() => setView('list')}
            />
            <WuButton
              variant="iconOnly"
              aria-label="Archive"
              Icon={<span className="wm-delete text-ink-muted" />}
              onClick={() => {
                if (selectedIds.length === 0) {
                  router.push('/projects/recycle-bin');
                  return;
                }
                handleArchive();
              }}
            />
          </div>
        </div>

        <div className="mb-3 flex items-center gap-2">
          <WuCheckbox checked={allPageSelected} onChange={handleSelectAll} />
          <span className="text-sm text-ink">Select all</span>
          {selectedIds.length > 0 && (
            <span className="text-sm text-ink-muted">{selectedIds.length} items selected</span>
          )}
        </div>

        {pageItems.length === 0 ? (
          <EmptyState icon="wm-search-off" title="No folders found" description="Try adjusting your search" />
        ) : view === 'list' ? (
          <FoldersTable
            folders={pageItems}
            selectedIds={selectedIds}
            onToggle={handleToggle}
            noDataContent={<EmptyState icon="wm-folder-off" title="No folders found" />}
          />
        ) : (
          <FoldersGrid folders={pageItems} selectedIds={selectedIds} onToggle={handleToggle} />
        )}

        {filtered.length >= 4 && (
          <div className="mt-4 flex items-center justify-end gap-2 text-sm text-ink-muted">
            <span>{filtered.length} folders</span>
            {pageCount > 1 && (
              <>
                <WuButton variant="outline" size="sm" disabled={page === 0} onClick={() => { setPage((p) => p - 1); setSelectedIds([]); }}>
                  Previous
                </WuButton>
                <span>
                  {page + 1} / {pageCount}
                </span>
                <WuButton variant="outline" size="sm" disabled={page + 1 >= pageCount} onClick={() => { setPage((p) => p + 1); setSelectedIds([]); }}>
                  Next
                </WuButton>
              </>
            )}
          </div>
        )}
      </div>

      <WuModal open={isCreateOpen} onOpenChange={setIsCreateOpen} size="md">
        <WuModalHeader>New folder</WuModalHeader>
        <WuModalContent>
          <WuInput
            Label="Folder name"
            variant="outlined"
            placeholder="e.g. My Folder"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
        </WuModalContent>
        <WuModalFooter>
          <WuModalClose variant="secondary">Cancel</WuModalClose>
          <WuButton onClick={handleCreate} disabled={!newName.trim()}>
            Create folder
          </WuButton>
        </WuModalFooter>
      </WuModal>

      <ConfirmModal
        open={archiveOpen}
        onOpenChange={setArchiveOpen}
        title="Archive selected folders?"
        description="Selected folders will move to the recycle bin."
        confirmLabel="Archive"
        variant="critical"
        onConfirm={confirmArchive}
      />
    </div>
  );
}
