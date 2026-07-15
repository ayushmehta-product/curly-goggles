'use client';

import dynamic from 'next/dynamic';
import { format } from 'date-fns';
import { useWuShowToast } from '@npm-questionpro/wick-ui-lib';
import type { FocusGroup } from '@/data/mock-focus-groups';
import type { FocusGroupStudyDetails } from '@/data/mock-focus-group-study-details';
import type { StudyTeamMember } from '@/data/mock-study-team';
import type { FocusGroupWorkspacePhase } from '@/data/focus-group-workspace-utils';

const WuButton = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuButton })),
  { ssr: false }
);

const PHASE_FULFILLMENT_LABELS: Record<FocusGroupWorkspacePhase, string> = {
  scheduling: 'AWAITING ACKNOWLEDGMENTS',
  ready: 'READY TO RUN',
  live: 'SESSION LIVE',
  completed: 'ORDER FULFILLED',
};

function DetailRow({ label, value, action }: { label: string; value: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-1.5">
      <span className="text-sm text-gray-500">{label}:</span>
      <span className="flex items-center gap-2 text-right text-sm font-medium text-gray-900">
        {value}
        {action}
      </span>
    </div>
  );
}

interface FocusGroupOverviewMetadataCardsProps {
  focusGroup: FocusGroup;
  studyDetails: FocusGroupStudyDetails;
  scriptTopicCount: number;
  moderators: StudyTeamMember[];
  phase: FocusGroupWorkspacePhase;
  requestedCount: number;
  joinedCount: number;
}

export function FocusGroupOverviewMetadataCards({
  focusGroup,
  studyDetails,
  scriptTopicCount,
  moderators,
  phase,
  requestedCount,
  joinedCount,
}: FocusGroupOverviewMetadataCardsProps) {
  const { showToast } = useWuShowToast();

  const scriptLabel = scriptTopicCount > 0 ? `${scriptTopicCount} topic${scriptTopicCount === 1 ? '' : 's'} added` : '(None added)';
  const moderatorLabel = moderators.length > 0 ? moderators[0].fullName : 'Unassigned';

  const joinedLabel = phase === 'completed' ? `${joinedCount} joined` : `${joinedCount} acknowledged`;
  const fulfillmentSummary = `${requestedCount} requested \u00b7 ${joinedLabel} \u00b7 ${
    phase === 'completed' ? 'Session completed' : 'Session ' + (phase === 'live' ? 'live' : phase === 'ready' ? 'ready' : 'scheduling')
  }`;

  return (
    <div className="mb-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
      <section className="rounded-lg border border-gray-200 bg-white p-5">
        <DetailRow label="Focus group ID" value={studyDetails.numericId} />
        <DetailRow label="Device type" value={studyDetails.deviceType} />
        <DetailRow label="Demographics" value={studyDetails.demographics} />
        <DetailRow label="Session duration" value={`Up to ${focusGroup.sessionDurationMinutes} min`} />
        <DetailRow
          label="Script"
          value={scriptLabel}
          action={
            <WuButton
              size="sm"
              variant="link"
              onClick={() => showToast({ message: 'Opening full script\u2026', variant: 'success' })}
            >
              See more
            </WuButton>
          }
        />
        <DetailRow
          label="Moderators"
          value={moderatorLabel}
          action={
            moderators.length > 1 && (
              <WuButton
                size="sm"
                variant="link"
                onClick={() =>
                  showToast({
                    message: `Moderators: ${moderators.map((moderator) => moderator.fullName).join(', ')}`,
                    variant: 'success',
                  })
                }
              >
                See more
              </WuButton>
            )
          }
        />
        <p className="mt-3 border-t border-gray-100 pt-3 text-xs text-gray-500">
          Created {format(new Date(focusGroup.createdAt), 'MMM d, yyyy h:mm a')} by {focusGroup.createdBy.name}
        </p>
      </section>

      <section className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white p-5 text-center">
        <p className="text-sm font-bold uppercase tracking-wide text-gray-700">{PHASE_FULFILLMENT_LABELS[phase]}</p>
        <p className="mt-3 text-sm text-gray-600">{fulfillmentSummary}</p>
        <p className="mt-auto w-full border-t border-gray-100 pt-3 text-xs text-gray-500">
          Ordered {format(new Date(studyDetails.orderedAt), 'MMM d, yyyy h:mm a')}
        </p>
      </section>
    </div>
  );
}
