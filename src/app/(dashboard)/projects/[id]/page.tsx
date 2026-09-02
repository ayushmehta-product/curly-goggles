'use client';

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useWuShowToast } from '@npm-questionpro/wick-ui-lib';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { StudiesCardGrid } from '@/components/projects/StudiesCardGrid';
import { FolderStudiesTable } from '@/components/projects/FolderStudiesTable';
import {
  getFolderById,
  getStudiesByFolderId,
  type FolderStudy,
} from '@/data/mock-projects';

const WuButton = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuButton })),
  { ssr: false }
);
const WuInput = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuInput })),
  { ssr: false }
);
const WuSelect = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuSelect })),
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

type TypeOption = { value: 'Standard' | 'Diary'; label: string };
type ViewMode = 'grid' | 'list';

const TYPE_OPTIONS: TypeOption[] = [
  { value: 'Standard', label: 'Standard' },
  { value: 'Diary', label: 'Diary' },
];

export default function FolderStudiesPage() {
  const { id: folderId } = useParams<{ id: string }>();
  const router = useRouter();
  const { showToast } = useWuShowToast();
  const folder = getFolderById(folderId);
  const [studies, setStudies] = useState<FolderStudy[]>(() => getStudiesByFolderId(folderId));
  const [search, setSearch] = useState('');
  const [view, setView] = useState<ViewMode>('grid');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<TypeOption>(TYPE_OPTIONS[0]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return studies;
    return studies.filter((study) => study.name.toLowerCase().includes(query));
  }, [studies, search]);

  if (!folder) {
    return (
      <div className="px-4 py-8">
        <EmptyState
          icon="wm-error-outline"
          title="Folder not found"
          action={
            <Link href="/projects" className="qp-link text-sm">
              Back to folders
            </Link>
          }
        />
      </div>
    );
  }

  function handleCreate() {
    if (!newName.trim()) return;
    const now = new Date().toISOString().slice(0, 10);
    const study: FolderStudy = {
      id: `s-${Date.now()}`,
      folderId,
      name: newName.trim(),
      type: newType.value,
      status: 'draft',
      heroImage: '/study-hero-alt.svg',
      published: false,
      createdAt: now,
      updatedAt: now,
      quests: [],
    };
    setStudies((current) => [study, ...current]);
    setIsCreateOpen(false);
    setNewName('');
    setNewType(TYPE_OPTIONS[0]);
    showToast({ message: `"${study.name}" created`, variant: 'success' });
  }

  return (
    <div className="qp-enter">
      <PageHeader
        title={
          <span className="inline-flex items-center gap-1">
            Studies
            <span className="wm-info-outline text-base text-ink-muted" title="Studies in this folder" />
          </span>
        }
        action={
          <>
            <WuButton variant="link" Icon={<span className="wm-description" />} onClick={() => showToast({ message: 'System logs opened', variant: 'success' })}>
              System logs
            </WuButton>
            <WuButton variant="outline" onClick={() => showToast({ message: 'Admin opened', variant: 'success' })}>
              Admin
            </WuButton>
          </>
        }
      />
      <div className="px-4 pb-8">
        <Link href="/projects" className="qp-link mb-4 inline-flex items-center gap-1 text-sm">
          <span className="wm-arrow-back" />
          Folders
        </Link>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <WuButton Icon={<span className="wm-add" />} onClick={() => setIsCreateOpen(true)}>
            New study
          </WuButton>
          <div className="flex flex-wrap items-center gap-2">
            <WuInput
              variant="outlined"
              placeholder="Search for studies"
              Icon={<span className="wm-search" />}
              iconPosition="left"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
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
              onClick={() => router.push('/projects/recycle-bin')}
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon="wm-folder-off"
            title="No studies in this folder"
            action={
              <WuButton onClick={() => setIsCreateOpen(true)}>
                New study
              </WuButton>
            }
          />
        ) : view === 'grid' ? (
          <StudiesCardGrid folderId={folderId} studies={filtered} />
        ) : (
          <FolderStudiesTable
            folderId={folderId}
            studies={filtered}
            onDuplicate={(study) => showToast({ message: `"${study.name}" duplicated`, variant: 'success' })}
            onClose={(study) => {
              setStudies((current) =>
                current.map((item) => (item.id === study.id ? { ...item, status: 'closed' } : item))
              );
              showToast({ message: `"${study.name}" closed`, variant: 'success' });
            }}
            noDataContent={<EmptyState icon="wm-search-off" title="No studies found" />}
          />
        )}
      </div>

      <WuModal open={isCreateOpen} onOpenChange={setIsCreateOpen} size="md">
        <WuModalHeader>New study</WuModalHeader>
        <WuModalContent>
          <div className="flex flex-col gap-4">
            <WuInput
              Label="Study name"
              variant="outlined"
              placeholder="e.g. Stranger things - Finale"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <WuSelect
              data={TYPE_OPTIONS}
              accessorKey={{ value: 'value', label: 'label' }}
              value={newType}
              onSelect={(value) => setNewType(value as TypeOption)}
              Label="Type"
              variant="outlined"
            />
          </div>
        </WuModalContent>
        <WuModalFooter>
          <WuModalClose variant="secondary">Cancel</WuModalClose>
          <WuButton onClick={handleCreate} disabled={!newName.trim()}>
            Create study
          </WuButton>
        </WuModalFooter>
      </WuModal>
    </div>
  );
}
