'use client';

import { useParams, useRouter } from 'next/navigation';
import { useWuShowToast } from '@npm-questionpro/wick-ui-lib';
import { CardSortingPreview } from '@/components/projects/participant/CardSortingPreview';
import { ConversationTaskPreview } from '@/components/projects/participant/ConversationTaskPreview';
import { GenericTaskPreview } from '@/components/projects/participant/GenericTaskPreview';
import {
  ParticipantBreadcrumb,
  ParticipantStudyShell,
} from '@/components/projects/participant/ParticipantStudyShell';
import { TreeTestingPreview } from '@/components/projects/participant/TreeTestingPreview';
import {
  questPreviewPath,
  studyPreviewPath,
} from '@/components/projects/participant/preview-routes';
import { EmptyState } from '@/components/ui/EmptyState';
import { defaultCardSortingConfig } from '@/data/mock-card-sorting';
import { getTaskById } from '@/data/mock-projects';
import { defaultTreeTestingConfig } from '@/data/mock-tree-testing';

export default function ParticipantTaskPage() {
  const router = useRouter();
  const { showToast } = useWuShowToast();
  const { folderId, studyId, questId, taskId } = useParams<{
    folderId: string;
    studyId: string;
    questId: string;
    taskId: string;
  }>();
  const found = getTaskById(folderId, studyId, questId, taskId);

  if (!found) {
    return (
      <div className="px-4 py-8">
        <EmptyState icon="wm-assignment" title="Task not found" description="This participant preview is not available." />
      </div>
    );
  }

  const { study, quest, task } = found;
  const homeHref = studyPreviewPath(folderId, studyId);
  const questHref = questPreviewPath(folderId, studyId, questId);
  const type = task.type ?? 'conversation';
  const wide = type === 'tree-testing' || type === 'card-sorting';

  let body: React.ReactNode;
  if (type === 'tree-testing') {
    body = (
      <TreeTestingPreview
        title={task.title}
        config={task.treeTesting ?? defaultTreeTestingConfig()}
        backHref={questHref}
      />
    );
  } else if (type === 'card-sorting') {
    body = (
      <CardSortingPreview
        title={task.title}
        config={task.cardSorting ?? defaultCardSortingConfig()}
        backHref={questHref}
      />
    );
  } else if (type === 'conversation' || type === 'fill-in-the-blank') {
    body = (
      <ConversationTaskPreview
        title={task.title}
        description={task.showDescription === false ? undefined : task.description}
      />
    );
  } else {
    body = (
      <GenericTaskPreview
        title={task.title}
        description={task.description}
        onContinue={() => {
          showToast({ message: 'Task completed (preview)', variant: 'success' });
          router.push(questHref);
        }}
      />
    );
  }

  return (
    <ParticipantStudyShell
      folderId={folderId}
      studyId={studyId}
      studyName={study.heroTitle ?? study.name}
      heroImage={study.heroImage}
    >
      <div className={`mx-auto rounded-xl bg-surface p-8 ${wide ? 'max-w-6xl' : 'max-w-3xl'}`}>
        <ParticipantBreadcrumb
          items={[
            { href: homeHref, label: 'Home' },
            { href: questHref, label: quest.title },
            { label: task.title },
          ]}
        />
        <div className="mt-6">{body}</div>
      </div>
    </ParticipantStudyShell>
  );
}
