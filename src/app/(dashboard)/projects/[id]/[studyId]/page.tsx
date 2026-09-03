'use client';

import { useMemo, useRef, useState, Suspense } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import type { IWuTabItem } from '@npm-questionpro/wick-ui-lib';
import { useWuShowToast } from '@npm-questionpro/wick-ui-lib';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';
import { StudyHero } from '@/components/projects/StudyHero';
import { StudyQuestCard } from '@/components/projects/StudyQuestCard';
import { openStudyPreview } from '@/components/projects/participant/preview-routes';
import { getFolderById, getStudyById, type StudyQuest } from '@/data/mock-projects';
import { truncate } from '@/data/mock-utils';

const WuButton = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuButton })),
  { ssr: false }
);
const WuTab = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuTab })),
  { ssr: false }
);
const WuToggle = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuToggle })),
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
const WuInput = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuInput })),
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

export default function StudyWorkspacePage() {
  return (
    <Suspense fallback={<div className="px-4 py-8 text-sm text-ink-muted">Loading…</div>}>
      <StudyWorkspaceContent />
    </Suspense>
  );
}

function StudyWorkspaceContent() {
  const { id: folderId, studyId } = useParams<{ id: string; studyId: string }>();
  const searchParams = useSearchParams();
  const view = searchParams.get('view');
  const { showToast } = useWuShowToast();
  const folder = getFolderById(folderId);
  const study = getStudyById(folderId, studyId);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [published, setPublished] = useState(study?.published ?? false);
  const [videoName, setVideoName] = useState(study?.introductoryVideoName);
  const [progressive, setProgressive] = useState(false);
  const [quests, setQuests] = useState<StudyQuest[]>(study?.quests ?? []);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newQuestName, setNewQuestName] = useState('');

  const visibleQuests = useMemo(() => {
    if (!progressive) return quests;
    return quests.filter((quest) => quest.status === 'live' || quest.status === 'draft');
  }, [quests, progressive]);

  if (!folder || !study) {
    return (
      <div className="px-4 py-8">
        <EmptyState
          icon="wm-error-outline"
          title="Study not found"
          description="This study doesn't exist or has been removed."
          action={
            <Link href="/projects" className="qp-link text-sm">
              Back to folders
            </Link>
          }
        />
      </div>
    );
  }

  const viewTitle: Record<string, string> = {
    participants: 'Participants',
    panel: 'Panel',
    quotes: 'My quotes',
    media: 'Media library',
    reports: 'Reports',
    documents: 'Documents',
    messages: 'Messages',
    logs: 'Logs',
    admin: 'Admin',
  };

  if (view && viewTitle[view]) {
    return (
      <div className="qp-enter">
        <PageHeader title={viewTitle[view]} />
        <div className="px-4 pb-8">
          <EmptyState
            icon="wm-folder-data"
            title={`${viewTitle[view]} is ready for this prototype`}
            description="This Digsite workspace section is available from the study sidebar."
          />
        </div>
      </div>
    );
  }

  function handleVideo(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    setVideoName(file.name);
    showToast({ message: 'Video uploaded', variant: 'success' });
  }

  function handleCreateQuest() {
    if (!newQuestName.trim()) return;
    const quest: StudyQuest = {
      id: `q-${Date.now()}`,
      title: newQuestName.trim(),
      type: 'Standard',
      status: 'draft',
      participantCount: 0,
      stepCount: 0,
      tasks: [],
    };
    setQuests((current) => [quest, ...current]);
    setIsCreateOpen(false);
    setNewQuestName('');
    showToast({ message: `"${quest.title}" created`, variant: 'success' });
  }

  const questsContent = (
    <div className="flex flex-col gap-3 pt-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="flex items-center gap-2 text-sm text-ink">
          <WuToggle checked={progressive} onChange={setProgressive} />
          Progressive quest disclosure
          <span className="wm-info-outline text-ink-muted" title="Show only live and draft quests" />
        </label>
        <WuButton variant="outline" onClick={() => setIsCreateOpen(true)}>
          <span className="wm-add" /> New quest
        </WuButton>
      </div>
      {visibleQuests.length === 0 ? (
        <EmptyState
          icon="wm-assignment"
          title="No quests yet"
          description="Create a quest to add tasks for participants."
          action={
            <WuButton variant="outline" onClick={() => setIsCreateOpen(true)}>
              <span className="wm-add" /> New quest
            </WuButton>
          }
        />
      ) : (
        visibleQuests.map((quest) => (
          <StudyQuestCard
            key={quest.id}
            folderId={folderId}
            studyId={studyId}
            quest={quest}
            onDuplicate={(item) => showToast({ message: `"${item.title}" duplicated`, variant: 'success' })}
            onClose={(item) => {
              setQuests((current) =>
                current.map((questItem) =>
                  questItem.id === item.id ? { ...questItem, status: 'closed' } : questItem
                )
              );
              showToast({ message: `"${item.title}" closed`, variant: 'success' });
            }}
          />
        ))
      )}
    </div>
  );

  const topicsContent = (
    <div className="pt-3">
      <EmptyState
        icon="wm-label"
        title="No topics yet"
        description="Topics help you group research themes across quests."
        action={
          <WuButton
            variant="outline"
            onClick={() => showToast({ message: 'Topic created', variant: 'success' })}
          >
            <span className="wm-add" /> New topic
          </WuButton>
        }
      />
    </div>
  );

  const tabs: IWuTabItem[] = [
    { value: 'quests', Trigger: 'Quests', Content: questsContent },
    { value: 'topics', Trigger: 'Topics', Content: topicsContent },
  ];

  return (
    <div className="qp-enter px-4 pb-8 pt-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <Link
          href={`/projects/${folderId}`}
          className="qp-link inline-flex items-center gap-1 text-sm"
        >
          <span className="wm-arrow-back text-base" />
          {truncate(folder.name, 28)}
        </Link>
        <div className="flex items-center gap-2">
          <WuButton
            variant="iconOnly"
            aria-label="Preview"
            Icon={<span className="wm-visibility" />}
            onClick={() => {
              openStudyPreview(folderId, studyId);
              showToast({ message: 'Preview opened', variant: 'success' });
            }}
          />
          <WuMenu
            Trigger={
              <WuButton>
                {published ? 'Published' : 'Unpublished'}
                <span className="wm-arrow-drop-down" />
              </WuButton>
            }
            align="end"
          >
            <WuMenuItem
              onSelect={() => {
                setPublished((current) => !current);
                showToast({
                  message: published ? 'Study unpublished' : 'Study published',
                  variant: 'success',
                });
              }}
            >
              {published ? 'Unpublish' : 'Publish'}
            </WuMenuItem>
            <WuMenuItem onSelect={() => showToast({ message: 'Study duplicated', variant: 'success' })}>
              Duplicate
            </WuMenuItem>
          </WuMenu>
        </div>
      </div>

      <nav className="mb-4 text-sm text-ink-muted">
        <Link href="/projects" className="qp-link">Folders</Link>
        <span className="mx-1.5">/</span>
        <Link href={`/projects/${folderId}`} className="qp-link">{folder.name}</Link>
        <span className="mx-1.5">/</span>
        <span className="text-ink">{study.heroTitle ?? study.name}</span>
      </nav>

      <StudyHero title={study.heroTitle ?? study.name} imageSrc={study.heroImage} />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <div className="flex flex-col gap-6">
          <section>
            <h3 className="mb-2 text-base font-semibold text-ink">Description</h3>
            {study.description ? (
              <p className="text-sm leading-6 text-ink-muted">{study.description}</p>
            ) : (
              <p className="text-sm text-ink-muted">There is no description for this study yet.</p>
            )}
          </section>
          <section>
            <h3 className="mb-2 text-base font-semibold text-ink">Introductory video</h3>
            <p className="mb-3 text-sm text-ink-muted">
              Help participants understand the research context and objectives before they begin.
            </p>
            <button
              type="button"
              className="flex w-full flex-col items-center justify-center gap-2 rounded-md border border-dashed border-[var(--qp-gray-40)] px-4 py-10 text-sm text-ink-muted transition-colors duration-150 hover:border-accent hover:bg-[var(--qp-title-line)]"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                handleVideo(event.dataTransfer.files);
              }}
            >
              <span className="wm-cloud-upload text-3xl text-ink-muted" />
              {videoName ? (
                <span className="text-ink">{videoName}</span>
              ) : (
                <span>
                  Drag your video here or{' '}
                  <span className="text-accent">click to browse</span>
                </span>
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              className="hidden"
              onChange={(event) => handleVideo(event.target.files)}
            />
          </section>
        </div>
        <div>
          <WuTab items={tabs} defaultValue="quests" />
        </div>
      </div>

      <WuModal open={isCreateOpen} onOpenChange={setIsCreateOpen} size="md">
        <WuModalHeader>New quest</WuModalHeader>
        <WuModalContent>
          <WuInput
            Label="Quest name"
            variant="outlined"
            placeholder="e.g. Quest 1"
            value={newQuestName}
            onChange={(e) => setNewQuestName(e.target.value)}
          />
        </WuModalContent>
        <WuModalFooter>
          <WuModalClose variant="secondary">Cancel</WuModalClose>
          <WuButton onClick={handleCreateQuest} disabled={!newQuestName.trim()}>
            Create quest
          </WuButton>
        </WuModalFooter>
      </WuModal>
    </div>
  );
}
