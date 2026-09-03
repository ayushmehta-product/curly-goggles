'use client';

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ParticipantBreadcrumb,
  ParticipantStudyShell,
} from '@/components/projects/participant/ParticipantStudyShell';
import { questPreviewPath, studyPreviewPath } from '@/components/projects/participant/preview-routes';
import { EmptyState } from '@/components/ui/EmptyState';
import { getStudyById, type StudyQuest } from '@/data/mock-projects';
import { formatRelativeDate } from '@/data/mock-utils';

const WuButton = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuButton })),
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

type QuestSort = 'last-added' | 'first-added' | 'title';
type QuestTab = 'active' | 'closed';

export default function ParticipantStudyHomePage() {
  const { folderId, studyId } = useParams<{ folderId: string; studyId: string }>();
  const study = getStudyById(folderId, studyId);
  const [tab, setTab] = useState<QuestTab>('active');
  const [sort, setSort] = useState<QuestSort>('last-added');

  const quests = useMemo(() => {
    if (!study) return [];
    const filtered = study.quests.filter((quest) =>
      tab === 'closed' ? quest.status === 'closed' : quest.status !== 'closed'
    );
    const sorted = [...filtered];
    if (sort === 'title') {
      sorted.sort((a, b) => a.title.localeCompare(b.title));
    } else {
      sorted.sort((a, b) => {
        const aTime = a.startsAt ? new Date(a.startsAt).getTime() : 0;
        const bTime = b.startsAt ? new Date(b.startsAt).getTime() : 0;
        return sort === 'last-added' ? bTime - aTime : aTime - bTime;
      });
    }
    return sorted;
  }, [study, tab, sort]);

  if (!study) {
    return (
      <div className="px-4 py-8">
        <EmptyState icon="wm-home" title="Study not found" description="This participant preview is not available." />
      </div>
    );
  }

  const sortLabel = sort === 'last-added' ? 'Last added' : sort === 'first-added' ? 'First added' : 'Title';

  return (
    <ParticipantStudyShell
      folderId={folderId}
      studyId={studyId}
      studyName={study.heroTitle ?? study.name}
      heroImage={study.heroImage}
    >
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[minmax(0,18rem)_1fr]">
        <div>
          <ParticipantBreadcrumb
            items={[{ href: studyPreviewPath(folderId, studyId), label: 'My quests' }]}
          />
          <h2 className="mt-6 text-xl font-semibold text-ink">Description</h2>
          <p className="mt-2 text-ink">{study.description}</p>
        </div>
        <div>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-6">
              <TabButton active={tab === 'active'} onClick={() => setTab('active')}>
                Active
              </TabButton>
              <TabButton active={tab === 'closed'} onClick={() => setTab('closed')}>
                Closed
              </TabButton>
            </div>
            <WuMenu
              Trigger={
                <WuButton variant="secondary" size="sm">
                  {sortLabel}
                  <span className="wm-apps" />
                </WuButton>
              }
              align="end"
            >
              <WuMenuItem onSelect={() => setSort('last-added')}>Last added</WuMenuItem>
              <WuMenuItem onSelect={() => setSort('first-added')}>First added</WuMenuItem>
              <WuMenuItem onSelect={() => setSort('title')}>Title</WuMenuItem>
            </WuMenu>
          </div>
          {quests.length === 0 ? (
            <EmptyState
              icon="wm-flag"
              title={tab === 'closed' ? 'No closed quests' : 'No active quests'}
              description="Quests in this study will show up here."
            />
          ) : (
            <div className="flex flex-col gap-3">
              {quests.map((quest) => (
                <QuestRow key={quest.id} folderId={folderId} studyId={studyId} quest={quest} />
              ))}
            </div>
          )}
        </div>
      </div>
    </ParticipantStudyShell>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`border-b-2 pb-1 text-sm ${
        active ? 'border-accent font-medium text-accent' : 'border-transparent text-ink-muted'
      }`}
    >
      {children}
    </button>
  );
}

function QuestRow({
  folderId,
  studyId,
  quest,
}: {
  folderId: string;
  studyId: string;
  quest: StudyQuest;
}) {
  const href = questPreviewPath(folderId, studyId, quest.id);
  const started = quest.startsAt ? formatRelativeDate(quest.startsAt) : 'Not scheduled';
  const overdue = quest.id === 'q003' || quest.id === 'q005';

  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-lg border border-line bg-surface px-3 py-3 hover:bg-[var(--qp-gray-20)]"
    >
      <div className="flex h-12 w-16 shrink-0 items-center justify-center overflow-hidden rounded bg-[var(--qp-gray-20)]">
        {quest.thumbnail ? (
          <img src={quest.thumbnail} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="wm-image text-xl text-ink-muted" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-accent">{quest.title}</p>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-ink-muted">
          <span>{started}</span>
          {overdue ? (
            <span className="inline-flex items-center gap-1">
              <span className="wm-notifications" />
              overdue
            </span>
          ) : null}
        </div>
      </div>
      <span className="inline-flex shrink-0 items-center gap-1 text-sm text-ink-muted">
        <span className="inline-block h-3.5 w-3.5 rounded-full border border-dashed border-ink-muted" />
        Not started
      </span>
    </Link>
  );
}
