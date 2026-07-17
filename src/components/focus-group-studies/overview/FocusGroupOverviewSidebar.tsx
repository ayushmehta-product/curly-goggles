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
import {
  OverviewSidebarSection,
  ProgressBar,
  SidebarDetailRow,
} from '@/components/focus-group-studies/overview/OverviewSidebarSection';

const WuButton = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuButton })),
  { ssr: false }
);
const WuSubtext = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuSubtext })),
  { ssr: false }
);
const WuText = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuText })),
  { ssr: false }
);

const PHASE_FULFILLMENT_LABELS: Record<FocusGroupWorkspacePhase, string> = {
  scheduling: 'Awaiting acknowledgments',
  ready: 'Ready to run',
  live: 'Session live',
  completed: 'Order fulfilled',
};

interface FocusGroupOverviewSidebarProps {
  focusGroup: FocusGroup;
  studyDetails: FocusGroupStudyDetails;
  workspace: FocusGroupWorkspace;
  phase: FocusGroupWorkspacePhase;
  scriptTopicCount: number;
  moderators: StudyTeamMember[];
  observers: StudyTeamMember[];
  acknowledgedCount: number;
  pendingCount: number;
  declinedCount: number;
  attendedCount: number;
  noShowCount: number;
  attendanceDeclinedCount: number;
  invitationsSentCount: number;
  notSentCount: number;
  onEditSessionTime: () => void;
}

export function FocusGroupOverviewSidebar({
  focusGroup,
  studyDetails,
  workspace,
  phase,
  scriptTopicCount,
  moderators,
  observers,
  acknowledgedCount,
  pendingCount,
  declinedCount,
  attendedCount,
  noShowCount,
  attendanceDeclinedCount,
  invitationsSentCount,
  notSentCount,
  onEditSessionTime,
}: FocusGroupOverviewSidebarProps) {
  const { showToast } = useWuShowToast();

  const scriptLabel =
    scriptTopicCount > 0 ? `${scriptTopicCount} topic${scriptTopicCount === 1 ? '' : 's'} added` : '(None added)';

  return (
    <aside className="space-y-4 xl:sticky xl:top-4 xl:self-start">
      <OverviewSidebarSection title="Session">
        <div className="mb-3">
          <WuText size="sm" className="font-semibold uppercase tracking-wide text-gray-700">
            {PHASE_FULFILLMENT_LABELS[phase]}
          </WuText>
        </div>
        <SidebarDetailRow
          label="Session time"
          value={formatSessionWindow(workspace.sessionAt, workspace.sessionDurationMinutes)}
        />
        <SidebarDetailRow label="Duration" value={`Up to ${focusGroup.sessionDurationMinutes} min`} />
        <SidebarDetailRow
          label="Ordered"
          value={format(new Date(studyDetails.orderedAt), 'MMM d, yyyy h:mm a')}
        />
      </OverviewSidebarSection>

      <OverviewSidebarSection title={phase === 'completed' ? 'Session attendance' : 'Acknowledgment progress'}>
        {phase === 'completed' ? (
          <>
            <WuSubtext size="sm" className="text-gray-600">
              {attendedCount} of {workspace.targetParticipants} attended
            </WuSubtext>
            <div className="mt-2">
              <ProgressBar
                ratio={attendedCount / workspace.targetParticipants}
                tone={attendedCount >= workspace.targetParticipants ? 'green' : 'blue'}
              />
            </div>
            <div className="mt-3 space-y-1">
              <SidebarDetailRow label="No-show" value={String(noShowCount)} />
              <SidebarDetailRow label="Declined" value={String(attendanceDeclinedCount)} />
              <SidebarDetailRow label="Invitations" value={`${invitationsSentCount} sent · ${notSentCount} not sent`} />
            </div>
          </>
        ) : (
          <>
            <WuSubtext size="sm" className="text-gray-600">
              {acknowledgedCount} of {workspace.targetParticipants} acknowledged
            </WuSubtext>
            <div className="mt-2">
              <ProgressBar
                ratio={acknowledgedCount / workspace.targetParticipants}
                tone={acknowledgedCount >= workspace.targetParticipants ? 'green' : 'blue'}
              />
            </div>
            <div className="mt-3 space-y-1">
              <SidebarDetailRow label="Pending" value={String(pendingCount)} />
              <SidebarDetailRow label="Declined" value={String(declinedCount)} />
              <SidebarDetailRow label="Invitations" value={`${invitationsSentCount} sent · ${notSentCount} not sent`} />
            </div>
          </>
        )}
      </OverviewSidebarSection>

      <OverviewSidebarSection
        title="Study setup"
        footer={
          <WuSubtext size="sm" className="text-gray-500">
            Created {format(new Date(focusGroup.createdAt), 'MMM d, yyyy h:mm a')} by {focusGroup.createdBy.name}
          </WuSubtext>
        }
      >
        <SidebarDetailRow label="Focus group ID" value={studyDetails.numericId} />
        <SidebarDetailRow label="Device type" value={studyDetails.deviceType} />
        <SidebarDetailRow label="Demographics" value={studyDetails.demographics} />
        <SidebarDetailRow
          label="Script"
          value={scriptLabel}
          action={
            <WuButton
              size="sm"
              variant="link"
              onClick={() => showToast({ message: 'Opening full script…', variant: 'success' })}
            >
              See more
            </WuButton>
          }
        />
      </OverviewSidebarSection>

      <OverviewSidebarSection title="Team">
        <div>
          <WuSubtext size="sm" className="font-medium text-gray-700">
            Moderators
          </WuSubtext>
          {moderators.length === 0 ? (
            <WuSubtext size="sm" className="mt-1 text-gray-500">
              No moderator assigned.
            </WuSubtext>
          ) : (
            <div className="mt-2 space-y-2">
              {moderators.map((moderator) => (
                <div key={moderator.id} className="flex items-center gap-2">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[11px] font-semibold text-blue-700">
                    {moderator.initials}
                  </span>
                  <WuText size="sm" className="text-gray-700">
                    {moderator.fullName}
                  </WuText>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4">
          <WuSubtext size="sm" className="font-medium text-gray-700">
            Observers
          </WuSubtext>
          {observers.length === 0 ? (
            <WuSubtext size="sm" className="mt-1 text-gray-500">
              No observers assigned.
            </WuSubtext>
          ) : (
            <div className="mt-2 space-y-2">
              {observers.map((observer) => (
                <div key={observer.id} className="flex items-center gap-2">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 text-[11px] font-semibold text-gray-600">
                    {observer.initials}
                  </span>
                  <WuText size="sm" className="text-gray-700">
                    {observer.fullName}
                  </WuText>
                </div>
              ))}
            </div>
          )}
        </div>
      </OverviewSidebarSection>

      <OverviewSidebarSection title="Actions">
        <WuButton
          className="w-full"
          variant="secondary"
          Icon={<span className="wm-event-repeat" />}
          disabled={phase === 'completed'}
          onClick={onEditSessionTime}
        >
          Edit Session Time
        </WuButton>
      </OverviewSidebarSection>
    </aside>
  );
}
