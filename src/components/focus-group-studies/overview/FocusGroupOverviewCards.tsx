'use client';

import dynamic from 'next/dynamic';
import { format } from 'date-fns';
import { useWuShowToast } from '@npm-questionpro/wick-ui-lib';
import type { FocusGroup } from '@/data/mock-focus-groups';
import type { FocusGroupStudyDetails } from '@/data/mock-focus-group-study-details';
import type { StudyTeamMember } from '@/data/mock-study-team';
import type { FocusGroupWorkspace } from '@/data/mock-focus-group-scheduling';
import {
  formatSessionWindow,
  type FocusGroupWorkspacePhase,
} from '@/data/focus-group-workspace-utils';
import { OverviewCard, OverviewDetailRow } from '@/components/ui/OverviewCards';
import { ProgressBar } from '@/components/focus-group-studies/overview/OverviewSidebarSection';

const WuButton = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuButton })),
  { ssr: false }
);

const PHASE_PROGRESS_LABELS: Record<FocusGroupWorkspacePhase, string> = {
  scheduling: 'In progress',
  ready: 'Ready to run',
  live: 'Session live',
  completed: 'Completed',
};

interface FocusGroupOverviewCardsProps {
  focusGroup: FocusGroup;
  studyDetails: FocusGroupStudyDetails;
  workspace: FocusGroupWorkspace;
  phase: FocusGroupWorkspacePhase;
  scriptTopicCount: number;
  moderators: StudyTeamMember[];
  acknowledgedCount: number;
  pendingCount: number;
  declinedCount: number;
  attendedCount: number;
  noShowCount: number;
  attendanceDeclinedCount: number;
  invitationsSentCount: number;
  notSentCount: number;
  canLaunchCallRoom: boolean;
  onLaunchCallRoom: () => void;
  onCopyRoomLink: () => void;
  onCancelRequest: () => void;
}

function SeeMoreLink({ message }: { message: string }) {
  const { showToast } = useWuShowToast();

  return (
    <button
      type="button"
      className="text-sm font-medium text-blue-600 hover:underline"
      onClick={() => showToast({ message, variant: 'success' })}
    >
      See more
    </button>
  );
}

export function FocusGroupOverviewCards({
  focusGroup,
  studyDetails,
  workspace,
  phase,
  scriptTopicCount,
  moderators,
  acknowledgedCount,
  pendingCount,
  declinedCount,
  attendedCount,
  noShowCount,
  attendanceDeclinedCount,
  invitationsSentCount,
  notSentCount,
  canLaunchCallRoom,
  onLaunchCallRoom,
  onCopyRoomLink,
  onCancelRequest,
}: FocusGroupOverviewCardsProps) {
  const isCompleted = phase === 'completed';

  const scriptLabel =
    scriptTopicCount > 0 ? `${scriptTopicCount} topic${scriptTopicCount === 1 ? '' : 's'} added` : '(None added)';
  const moderatorLabel =
    moderators.length === 0
      ? '(None assigned)'
      : moderators.length === 1
        ? moderators[0].fullName
        : `${moderators[0].fullName} +${moderators.length - 1} more`;

  const progressRatio = isCompleted
    ? attendedCount / workspace.targetParticipants
    : acknowledgedCount / workspace.targetParticipants;
  const progressDone = isCompleted
    ? attendedCount >= workspace.targetParticipants
    : acknowledgedCount >= workspace.targetParticipants;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <OverviewCard
        footer={
          <span className="text-xs text-gray-500">
            Created {format(new Date(focusGroup.createdAt), 'MMM d, yyyy hh:mm a')} by {focusGroup.createdBy.name}
          </span>
        }
      >
        <OverviewDetailRow label="Focus group ID" value={studyDetails.numericId} />
        <OverviewDetailRow label="Device type" value={studyDetails.deviceType} />
        <OverviewDetailRow
          label="Demographics"
          value={studyDetails.demographics}
          action={<SeeMoreLink message="Opening demographics details…" />}
        />
        <OverviewDetailRow label="Session duration" value={`Up to ${focusGroup.sessionDurationMinutes} min`} />
        <OverviewDetailRow
          label="Script"
          value={scriptLabel}
          action={<SeeMoreLink message="Opening full script…" />}
        />
        <OverviewDetailRow
          label="Moderator"
          value={moderatorLabel}
          action={moderators.length > 0 ? <SeeMoreLink message="Opening moderator details…" /> : undefined}
        />
      </OverviewCard>

      <OverviewCard
        footer={
          <>
            <span className="text-xs text-gray-500">
              Requested {format(new Date(studyDetails.orderedAt), 'MMM d, yyyy hh:mm a')}
            </span>
            <button
              type="button"
              className="text-xs font-medium text-blue-600 hover:underline"
              onClick={onCancelRequest}
              disabled={isCompleted}
            >
              Cancel request
            </button>
          </>
        }
      >
        <div className="flex h-full flex-col items-center justify-center gap-3 py-2 text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-gray-700">
            {PHASE_PROGRESS_LABELS[phase]}
          </p>

          <p className="text-sm text-gray-600">
            <span className="font-semibold text-gray-900">{workspace.targetParticipants}</span> participants requested
            {' \u00b7 '}
            {isCompleted ? (
              <>
                <span className="font-semibold text-gray-900">{attendedCount}</span> attended{' \u00b7 '}
                <span className="font-semibold text-gray-900">{noShowCount}</span> no-show{' \u00b7 '}
                <span className="font-semibold text-gray-900">{attendanceDeclinedCount}</span> declined
              </>
            ) : (
              <>
                <span className="font-semibold text-gray-900">{acknowledgedCount}</span> acknowledged{' \u00b7 '}
                <span className="font-semibold text-gray-900">{pendingCount}</span> pending{' \u00b7 '}
                <span className="font-semibold text-gray-900">{declinedCount}</span> declined
              </>
            )}
            {' \u00b7 '}
            <button
              type="button"
              className="font-medium text-blue-600 hover:underline"
              onClick={onCopyRoomLink}
            >
              Room links
            </button>
          </p>

          <div className="w-full max-w-xs">
            <ProgressBar ratio={progressRatio} tone={progressDone ? 'green' : 'blue'} />
          </div>

          <p className="text-xs text-gray-500">
            Session time: {formatSessionWindow(workspace.sessionAt, workspace.sessionDurationMinutes)}
            {' \u00b7 '}
            Invitations: {invitationsSentCount} sent {'\u00b7'} {notSentCount} not sent
          </p>

          <WuButton Icon={<span className="wm-videocam" />} disabled={!canLaunchCallRoom} onClick={onLaunchCallRoom}>
            Launch call room
          </WuButton>
        </div>
      </OverviewCard>
    </div>
  );
}
