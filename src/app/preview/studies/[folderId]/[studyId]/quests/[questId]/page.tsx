'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { taskTypeIcon } from '@/components/projects/AddTaskPanel';
import {
  ParticipantBreadcrumb,
  ParticipantStudyShell,
} from '@/components/projects/participant/ParticipantStudyShell';
import {
  questPreviewPath,
  studyPreviewPath,
  taskPreviewPath,
} from '@/components/projects/participant/preview-routes';
import { EmptyState } from '@/components/ui/EmptyState';
import { getQuestById } from '@/data/mock-projects';

export default function ParticipantQuestPage() {
  const { folderId, studyId, questId } = useParams<{
    folderId: string;
    studyId: string;
    questId: string;
  }>();
  const found = getQuestById(folderId, studyId, questId);

  if (!found) {
    return (
      <div className="px-4 py-8">
        <EmptyState icon="wm-flag" title="Quest not found" description="This participant preview is not available." />
      </div>
    );
  }

  const { study, quest } = found;
  const homeHref = studyPreviewPath(folderId, studyId);
  const questHref = questPreviewPath(folderId, studyId, questId);

  return (
    <ParticipantStudyShell
      folderId={folderId}
      studyId={studyId}
      studyName={study.heroTitle ?? study.name}
      heroImage={study.heroImage}
    >
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[minmax(0,20rem)_1fr]">
        <div>
          <ParticipantBreadcrumb
            items={[
              { href: homeHref, label: 'Home' },
              { href: questHref, label: quest.title },
            ]}
          />
          <h2 className="mt-6 text-2xl font-semibold text-[var(--qp-q-blue)]">{quest.title}</h2>
          <p className="mt-3 text-ink">
            {quest.description || 'Please proceed through the tasks given in the quest. Thank you!'}
          </p>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-semibold text-ink">Tasks</h3>
          {quest.tasks.length === 0 ? (
            <EmptyState icon="wm-assignment" title="No tasks yet" description="Tasks added to this quest will show up here." />
          ) : (
            <div className="flex flex-col gap-2">
              {quest.tasks.map((task, index) => (
                <Link
                  key={task.id}
                  href={taskPreviewPath(folderId, studyId, questId, task.id)}
                  className="flex items-center gap-3 rounded bg-[var(--qp-gray-20)] px-3 py-3 hover:bg-[var(--qp-gray-25)]"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-[var(--qp-gray-40)] text-sm text-ink">
                    {index + 1}
                  </span>
                  <span className={`${taskTypeIcon(task.type)} text-lg text-ink-muted`} />
                  <span className="min-w-0 flex-1 truncate text-accent">{task.title}</span>
                  <span className="inline-flex shrink-0 items-center gap-1 text-sm text-ink-muted">
                    <span className="inline-block h-3.5 w-3.5 rounded-full border border-ink-muted" />
                    Not started
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </ParticipantStudyShell>
  );
}
