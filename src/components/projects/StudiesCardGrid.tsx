'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import type { FolderStudy, StudyStatus } from '@/data/mock-projects';
import { truncate } from '@/data/mock-utils';

const WuCard = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuCard })),
  { ssr: false }
);
const WuChip = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuChip })),
  { ssr: false }
);

const STATUS_LABEL: Record<StudyStatus, string> = {
  live: 'Active',
  closed: 'Closed',
  draft: 'Draft',
};

function participantCount(study: FolderStudy): number {
  return study.quests.reduce((sum, quest) => sum + quest.participantCount, 0);
}

interface StudiesCardGridProps {
  folderId: string;
  studies: FolderStudy[];
}

export function StudiesCardGrid({ folderId, studies }: StudiesCardGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {studies.map((study) => (
        <Link key={study.id} href={`/projects/${folderId}/${study.id}`} className="block">
          <WuCard rounded className="qp-card-hover qp-card-depth overflow-hidden">
            <img src={study.heroImage} alt="" className="h-28 w-full object-cover" />
            <div className="p-3">
              <p className="truncate text-sm font-medium text-accent">{truncate(study.heroTitle ?? study.name, 48)}</p>
              <div className="mt-3 flex items-center justify-between gap-2">
                <WuChip
                  variant="secondary"
                  size="sm"
                  color={study.status === 'live' ? 'success' : study.status === 'closed' ? 'danger' : undefined}
                >
                  {STATUS_LABEL[study.status]}
                </WuChip>
                <span className="inline-flex items-center gap-1 text-xs text-ink-muted">
                  <span className="wm-groups text-sm" />
                  {participantCount(study)}
                </span>
              </div>
            </div>
          </WuCard>
        </Link>
      ))}
    </div>
  );
}
