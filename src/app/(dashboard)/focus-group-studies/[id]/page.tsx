'use client';

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useWuShowToast } from '@npm-questionpro/wick-ui-lib';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { FocusGroupWorkspaceTabs } from '@/components/focus-group-studies/FocusGroupWorkspaceTabs';
import { FocusGroupOverviewSidebar } from '@/components/focus-group-studies/overview/FocusGroupOverviewSidebar';
import { FocusGroupParticipantAcknowledgments } from '@/components/focus-group-studies/overview/FocusGroupParticipantAcknowledgments';
import { PhaseStatusChip } from '@/components/focus-group-studies/overview/focus-group-status-badges';
import { MOCK_FOCUS_GROUPS } from '@/data/mock-focus-groups';
import {
  MOCK_FOCUS_GROUP_WORKSPACES,
  type AcknowledgmentStatus,
  type FocusGroupParticipant,
  type FocusGroupWorkspace,
} from '@/data/mock-focus-group-scheduling';
import {
  applyCompletedSessionState,
  countAcknowledged,
  countAttendanceDeclined,
  countAttended,
  countDeclined,
  countInvitationsSent,
  countNoShow,
  countPending,
  getWorkspacePhase,
} from '@/data/focus-group-workspace-utils';
import { MOCK_FOCUS_GROUP_STUDY_DETAILS } from '@/data/mock-focus-group-study-details';
import { MOCK_FOCUS_GROUP_SESSION_ANALYSIS } from '@/data/mock-focus-group-session-analysis';
import { MOCK_MODERATORS, MOCK_OBSERVERS } from '@/data/mock-study-team';

const WuButton = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuButton })),
  { ssr: false }
);

function cloneWorkspace(workspace: FocusGroupWorkspace): FocusGroupWorkspace {
  return {
    ...workspace,
    participants: workspace.participants.map((participant) => ({ ...participant })),
  };
}

export default function FocusGroupOverviewPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { showToast } = useWuShowToast();

  const focusGroup = MOCK_FOCUS_GROUPS.find((item) => item.id === id);
  const seedWorkspace =
    MOCK_FOCUS_GROUP_WORKSPACES.find((item) => item.focusGroupId === id) ?? MOCK_FOCUS_GROUP_WORKSPACES[0];
  const studyDetails =
    MOCK_FOCUS_GROUP_STUDY_DETAILS.find((item) => item.focusGroupId === id) ?? MOCK_FOCUS_GROUP_STUDY_DETAILS[0];
  const analysis =
    MOCK_FOCUS_GROUP_SESSION_ANALYSIS.find((item) => item.focusGroupId === id) ?? MOCK_FOCUS_GROUP_SESSION_ANALYSIS[0];

  const [workspace, setWorkspace] = useState<FocusGroupWorkspace>(() => cloneWorkspace(seedWorkspace));

  const phase = useMemo(() => getWorkspacePhase(workspace), [workspace]);
  const acknowledgedCount = countAcknowledged(workspace.participants);
  const pendingCount = countPending(workspace.participants);
  const declinedCount = countDeclined(workspace.participants);
  const invitationsSentCount = countInvitationsSent(workspace.participants);
  const notSentCount = workspace.participants.length - invitationsSentCount;
  const attendedCount = countAttended(workspace.participants);
  const noShowCount = countNoShow(workspace.participants);
  const attendanceDeclinedCount = countAttendanceDeclined(workspace.participants);

  const moderators = MOCK_MODERATORS.filter((moderator) => workspace.moderatorIds.includes(moderator.id));
  const observers = MOCK_OBSERVERS.filter((observer) => workspace.observerIds.includes(observer.id));

  if (!focusGroup) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <EmptyState
          icon="wm-error-outline"
          title="Focus group not found"
          description="This focus group does not exist or has been removed from the prototype workspace."
          action={
            <Link href="/focus-group-studies" className="text-sm font-medium text-blue-600 hover:underline">
              Back to Focus Groups
            </Link>
          }
        />
      </div>
    );
  }

  function updateAcknowledgment(participantId: string, status: AcknowledgmentStatus) {
    setWorkspace((current) => ({
      ...current,
      participants: current.participants.map((participant) =>
        participant.id === participantId
          ? {
              ...participant,
              acknowledgmentStatus: status,
              acknowledgedAt: status === 'acknowledged' ? new Date().toISOString() : participant.acknowledgedAt,
            }
          : participant
      ),
    }));
    showToast({ message: 'Participant status updated.', variant: 'success' });
  }

  function resendInvitation(participant: FocusGroupParticipant) {
    setWorkspace((current) => ({
      ...current,
      participants: current.participants.map((item) =>
        item.id === participant.id
          ? { ...item, invitationStatus: 'sent', invitedAt: new Date().toISOString() }
          : item
      ),
    }));
    showToast({ message: `Invitation resent to ${participant.email}.`, variant: 'success' });
  }

  async function copyParticipantLink(participant: FocusGroupParticipant) {
    try {
      await navigator.clipboard.writeText(`${workspace.schedulingLink}?participant=${participant.id}`);
      showToast({ message: 'Participant link copied.', variant: 'success' });
    } catch {
      showToast({ message: 'Unable to copy participant link.', variant: 'error' });
    }
  }

  async function copySchedulingLink() {
    try {
      await navigator.clipboard.writeText(workspace.schedulingLink);
      showToast({ message: 'Scheduling link copied.', variant: 'success' });
    } catch {
      showToast({ message: 'Unable to copy scheduling link.', variant: 'error' });
    }
  }

  function joinSession() {
    if (phase === 'completed') {
      router.push(`/focus-group-studies/${id}/session`);
      return;
    }

    setWorkspace((current) => applyCompletedSessionState(current));
    showToast({ message: 'Session marked as completed.', variant: 'success' });
  }

  function joinCallRoom() {
    showToast({ message: 'Opening call room…', variant: 'success' });
    window.open(workspace.callRoomUrl, '_blank', 'noopener,noreferrer');
  }

  function editSessionTime() {
    showToast({
      message: 'Editing the session time will reset every participant to pending and notify them of the change.',
      variant: 'warning',
    });
  }

  const canJoinCallRoom = phase === 'ready' || phase === 'live';

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Link
        href="/focus-group-studies"
        className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
      >
        <span className="wm-arrow-back text-base" /> Back to Focus Groups
      </Link>

      <PageHeader
        title={focusGroup.title}
        action={
          <>
            <PhaseStatusChip phase={phase} />
            <WuButton variant="secondary" Icon={<span className="wm-content-copy" />} onClick={copySchedulingLink}>
              Copy Scheduling Link
            </WuButton>
            <WuButton
              variant="secondary"
              Icon={<span className={phase === 'completed' ? 'wm-play-circle' : 'wm-forum'} />}
              onClick={joinSession}
            >
              {phase === 'completed' ? 'Go to Session' : 'Join Session'}
            </WuButton>
            <WuButton Icon={<span className="wm-videocam" />} disabled={!canJoinCallRoom} onClick={joinCallRoom}>
              Join Call Room
            </WuButton>
          </>
        }
      />

      <div className="mb-5">
        <FocusGroupWorkspaceTabs focusGroupId={focusGroup.id} activeTab="overview" />
      </div>

      {phase === 'live' && (
        <div className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          Session is in progress.{' '}
          <Link href={`/focus-group-studies/${focusGroup.id}/session`} className="font-medium underline">
            Go to the session workspace
          </Link>{' '}
          to view live notes and recording.
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <FocusGroupParticipantAcknowledgments
          participants={workspace.participants}
          phase={phase}
          onSetAcknowledgment={updateAcknowledgment}
          onResendInvitation={resendInvitation}
          onCopyParticipantLink={copyParticipantLink}
        />

        <FocusGroupOverviewSidebar
          focusGroup={focusGroup}
          studyDetails={studyDetails}
          workspace={workspace}
          phase={phase}
          scriptTopicCount={analysis.scriptTopics.length}
          moderators={moderators}
          observers={observers}
          acknowledgedCount={acknowledgedCount}
          pendingCount={pendingCount}
          declinedCount={declinedCount}
          attendedCount={attendedCount}
          noShowCount={noShowCount}
          attendanceDeclinedCount={attendanceDeclinedCount}
          invitationsSentCount={invitationsSentCount}
          notSentCount={notSentCount}
          onEditSessionTime={editSessionTime}
        />
      </div>
    </div>
  );
}
