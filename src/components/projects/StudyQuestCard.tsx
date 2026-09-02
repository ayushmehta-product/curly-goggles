'use client';

import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import type { QuestStatus, StudyQuest } from '@/data/mock-projects';

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

const STATUS_LABEL: Record<QuestStatus, string> = {
  live: 'Live',
  closed: 'Closed',
  draft: 'Draft',
};

interface StudyQuestCardProps {
  folderId: string;
  studyId: string;
  quest: StudyQuest;
  onDuplicate: (quest: StudyQuest) => void;
  onClose: (quest: StudyQuest) => void;
}

export function StudyQuestCard({
  folderId,
  studyId,
  quest,
  onDuplicate,
  onClose,
}: StudyQuestCardProps) {
  const router = useRouter();
  const href = `/projects/${folderId}/${studyId}/quests/${quest.id}`;

  return (
    <div className="flex items-center gap-3 rounded-lg bg-surface px-3 py-3 qp-card-depth qp-card-hover">
      <button
        type="button"
        className="flex min-w-0 flex-1 items-center gap-3 text-left"
        onClick={() => router.push(href)}
      >
        <div className="flex h-12 w-16 shrink-0 items-center justify-center overflow-hidden rounded bg-[var(--qp-gray-20)]">
          {quest.thumbnail ? (
            <img src={quest.thumbnail} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="wm-image text-xl text-ink-muted" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-ink">{quest.title}</p>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-ink-muted">
            <span>{quest.type}</span>
            <span className="inline-flex items-center gap-1">
              <span className="wm-person text-sm" />
              {quest.participantCount}
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="wm-apps text-sm" />
              {quest.stepCount}
            </span>
          </div>
        </div>
      </button>
      <WuChip
        variant="secondary"
        size="sm"
        color={quest.status === 'live' ? 'success' : quest.status === 'closed' ? 'danger' : undefined}
      >
        {STATUS_LABEL[quest.status]}
      </WuChip>
      <WuMenu
        Trigger={
          <button type="button" className="rounded p-1 hover:bg-[var(--qp-gray-20)]" aria-label="Quest actions">
            <span className="wm-more-vert text-ink-muted" />
          </button>
        }
        align="end"
      >
        <WuMenuItem onSelect={() => router.push(href)}>Open</WuMenuItem>
        <WuMenuItem onSelect={() => onDuplicate(quest)}>Duplicate</WuMenuItem>
        <WuMenuSeparatorItem />
        <WuMenuItem onSelect={() => onClose(quest)} disabled={quest.status === 'closed'}>
          Close
        </WuMenuItem>
      </WuMenu>
    </div>
  );
}
