'use client';

import { useMemo, useState, type ReactNode } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useWuShowToast } from '@npm-questionpro/wick-ui-lib';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { FocusGroupWorkspaceTabs } from '@/components/focus-group-studies/FocusGroupWorkspaceTabs';
import { FocusGroupOverviewMetadataCards } from '@/components/focus-group-studies/FocusGroupOverviewMetadataCards';
import { MOCK_FOCUS_GROUPS } from '@/data/mock-focus-groups';
import {
  MOCK_FOCUS_GROUP_WORKSPACES,
  getParticipantFullName,
  getParticipantInitials,
  type AcknowledgmentStatus,
  type AttendanceStatus,
  type FocusGroupParticipant,
  type FocusGroupWorkspace,
} from '@/data/mock-focus-group-scheduling';
import {
  countAcknowledged,
  countAttended,
  countDeclined,
  countInvitationsSent,
  countPending,
  formatSessionWindow,
  getWorkspacePhase,
  type FocusGroupWorkspacePhase,
} from '@/data/focus-group-workspace-utils';
import { MOCK_FOCUS_GROUP_STUDY_DETAILS } from '@/data/mock-focus-group-study-details';
import { MOCK_FOCUS_GROUP_SESSION_ANALYSIS } from '@/data/mock-focus-group-session-analysis';
import { MOCK_MODERATORS, MOCK_OBSERVERS } from '@/data/mock-study-team';

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
const WuMenuSeparatorItem = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuMenuSeparatorItem })),
  { ssr: false }
);

function cloneWorkspace(workspace: FocusGroupWorkspace): FocusGroupWorkspace {
  return {
    ...workspace,
    participants: workspace.participants.map((participant) => ({ ...participant })),
  };
}

function Pill({ children, className }: { children: ReactNode; className: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${className}`}>
      {children}
    </span>
  );
}

const PHASE_STYLES: Record<FocusGroupWorkspacePhase, string> = {
  scheduling: 'bg-gray-100 text-gray-700',
  ready: 'bg-amber-50 text-amber-700',
  live: 'bg-green-50 text-green-700',
  completed: 'bg-blue-50 text-blue-700',
};

const PHASE_LABELS: Record<FocusGroupWorkspacePhase, string> = {
  scheduling: 'Scheduling',
  ready: 'Ready',
  live: 'Live',
  completed: 'Completed',
};

function PhaseBadge({ phase }: { phase: FocusGroupWorkspacePhase }) {
  return <Pill className={PHASE_STYLES[phase]}>{PHASE_LABELS[phase]}</Pill>;
}

const INVITATION_STYLES = {
  sent: 'bg-blue-50 text-blue-700',
  not_sent: 'bg-gray-100 text-gray-500',
};

const INVITATION_LABELS = {
  sent: 'Sent',
  not_sent: 'Not sent',
};

function InvitationBadge({ status }: { status: 'sent' | 'not_sent' }) {
  return <Pill className={INVITATION_STYLES[status]}>{INVITATION_LABELS[status]}</Pill>;
}

const ACKNOWLEDGMENT_STYLES: Record<AcknowledgmentStatus, string> = {
  acknowledged: 'bg-green-50 text-green-700',
  pending: 'bg-amber-50 text-amber-700',
  declined: 'bg-gray-100 text-gray-600',
};

const ACKNOWLEDGMENT_LABELS: Record<AcknowledgmentStatus, string> = {
  acknowledged: 'Acknowledged',
  pending: 'Pending',
  declined: 'Declined',
};

function AcknowledgmentBadge({ status }: { status: AcknowledgmentStatus }) {
  return <Pill className={ACKNOWLEDGMENT_STYLES[status]}>{ACKNOWLEDGMENT_LABELS[status]}</Pill>;
}

const ATTENDANCE_STYLES: Record<AttendanceStatus, string> = {
  attended: 'bg-green-50 text-green-700',
  'no-show': 'bg-amber-50 text-amber-700',
  declined: 'bg-gray-100 text-gray-600',
};

const ATTENDANCE_LABELS: Record<AttendanceStatus, string> = {
  attended: 'Attended',
  'no-show': 'No-show',
  declined: 'Declined',
};

function AttendanceBadge({ status }: { status: AttendanceStatus }) {
  return <Pill className={ATTENDANCE_STYLES[status]}>{ATTENDANCE_LABELS[status]}</Pill>;
}

function SectionCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-lg border border-gray-200 bg-white">
      <div className="border-b border-gray-100 px-5 py-3">
        <h2 className="text-base font-semibold text-gray-900">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function ProgressBar({ ratio, tone = 'blue' }: { ratio: number; tone?: 'blue' | 'green' }) {
  const toneStyles = { blue: 'bg-blue-500', green: 'bg-green-500' };
  const percent = Math.min(100, Math.max(0, Math.round(ratio * 100)));

  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
      <div className={`h-full rounded-full ${toneStyles[tone]} transition-all`} style={{ width: `${percent}%` }} />
    </div>
  );
}

function StatCard({ label, value, children }: { label: string; value: string; children?: ReactNode }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-gray-900">{value}</p>
      {children && <div className="mt-2">{children}</div>}
    </div>
  );
}

function ParticipantRow({
  participant,
  showAttendance,
  onSetAcknowledgment,
  onResendInvitation,
  onCopyParticipantLink,
}: {
  participant: FocusGroupParticipant;
  showAttendance: boolean;
  onSetAcknowledgment: (status: AcknowledgmentStatus) => void;
  onResendInvitation: () => void;
  onCopyParticipantLink: () => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 lg:grid-cols-[minmax(220px,1fr)_120px_130px_auto] lg:items-center">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-semibold text-blue-700">
          {getParticipantInitials(participant)}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-gray-900">{getParticipantFullName(participant)}</p>
          <p className="mt-0.5 truncate text-xs text-gray-500">{participant.email}</p>
        </div>
      </div>
      <InvitationBadge status={participant.invitationStatus} />
      {showAttendance && participant.attendanceStatus ? (
        <AttendanceBadge status={participant.attendanceStatus} />
      ) : (
        <AcknowledgmentBadge status={participant.acknowledgmentStatus} />
      )}
      <div className="flex items-center justify-end">
        <WuMenu
          Trigger={
            <button
              type="button"
              aria-label={`Actions for ${getParticipantFullName(participant)}`}
              className="rounded-md border border-gray-200 p-2 text-gray-500 hover:bg-gray-50 hover:text-gray-700"
            >
              <span className="wm-more-horiz text-sm" />
            </button>
          }
          align="end"
        >
          <WuMenuItem onSelect={onResendInvitation}>Resend invitation</WuMenuItem>
          <WuMenuItem onSelect={onCopyParticipantLink}>Copy participant link</WuMenuItem>
          <WuMenuSeparatorItem />
          <WuMenuItem onSelect={() => onSetAcknowledgment('acknowledged')}>Mark acknowledged</WuMenuItem>
          <WuMenuItem onSelect={() => onSetAcknowledgment('declined')}>Mark declined</WuMenuItem>
          <WuMenuItem onSelect={() => onSetAcknowledgment('pending')}>Reset to pending</WuMenuItem>
        </WuMenu>
      </div>
    </div>
  );
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

  function joinCallRoom() {
    showToast({ message: 'Opening call room\u2026', variant: 'success' });
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
            <PhaseBadge phase={phase} />
            <WuButton variant="secondary" Icon={<span className="wm-content-copy" />} onClick={copySchedulingLink}>
              Copy Scheduling Link
            </WuButton>
            <WuButton
              variant="secondary"
              Icon={<span className="wm-forum" />}
              onClick={() => router.push(`/focus-group-studies/${focusGroup.id}/session`)}
            >
              Go to Session
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

      <FocusGroupOverviewMetadataCards
        focusGroup={focusGroup}
        studyDetails={studyDetails}
        scriptTopicCount={analysis.scriptTopics.length}
        moderators={moderators}
        phase={phase}
        requestedCount={workspace.targetParticipants}
        joinedCount={phase === 'completed' ? attendedCount : acknowledgedCount}
      />

      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Session time" value={formatSessionWindow(workspace.sessionAt, workspace.sessionDurationMinutes)} />
        <StatCard
          label="Acknowledgment progress"
          value={`${acknowledgedCount} of ${workspace.targetParticipants} acknowledged`}
        >
          <ProgressBar
            ratio={acknowledgedCount / workspace.targetParticipants}
            tone={acknowledgedCount >= workspace.targetParticipants ? 'green' : 'blue'}
          />
        </StatCard>
        <StatCard label="Invitations" value={`${invitationsSentCount} sent \u00b7 ${notSentCount} not sent`} />
        <StatCard
          label="Participants"
          value={`${acknowledgedCount} acknowledged \u00b7 ${pendingCount} pending \u00b7 ${declinedCount} declined`}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <SectionCard
            title={phase === 'completed' ? 'Participant attendance' : 'Participant acknowledgments'}
            subtitle={
              phase === 'completed'
                ? 'Who joined the session and who did not.'
                : 'Participants receive the decided session time and confirm they can make it.'
            }
          >
            {workspace.participants.length === 0 ? (
              <EmptyState
                icon="wm-groups"
                title="No participants invited yet"
                description="Invite participants from Scheduling to start tracking responses."
              />
            ) : (
              <div className="space-y-2">
                {workspace.participants.map((participant) => (
                  <ParticipantRow
                    key={participant.id}
                    participant={participant}
                    showAttendance={phase === 'completed'}
                    onSetAcknowledgment={(status) => updateAcknowledgment(participant.id, status)}
                    onResendInvitation={() => resendInvitation(participant)}
                    onCopyParticipantLink={() => copyParticipantLink(participant)}
                  />
                ))}
              </div>
            )}
          </SectionCard>
        </div>

        <aside className="space-y-4 xl:sticky xl:top-4 xl:self-start">
          <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900">Moderators</h3>
            {moderators.length === 0 ? (
              <p className="mt-2 text-xs text-gray-500">No moderator assigned.</p>
            ) : (
              <div className="mt-2 space-y-2">
                {moderators.map((moderator) => (
                  <div key={moderator.id} className="flex items-center gap-2">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[11px] font-semibold text-blue-700">
                      {moderator.initials}
                    </span>
                    <span className="text-sm text-gray-700">{moderator.fullName}</span>
                  </div>
                ))}
              </div>
            )}

            <h3 className="mt-4 text-sm font-semibold text-gray-900">Observers</h3>
            {observers.length === 0 ? (
              <p className="mt-2 text-xs text-gray-500">No observers assigned.</p>
            ) : (
              <div className="mt-2 space-y-2">
                {observers.map((observer) => (
                  <div key={observer.id} className="flex items-center gap-2">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 text-[11px] font-semibold text-gray-600">
                      {observer.initials}
                    </span>
                    <span className="text-sm text-gray-700">{observer.fullName}</span>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="space-y-2 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <h3 className="mb-1 text-sm font-semibold text-gray-900">Actions</h3>
            <WuButton
              className="w-full"
              variant="secondary"
              Icon={<span className="wm-event-repeat" />}
              disabled={phase === 'completed'}
              onClick={editSessionTime}
            >
              Edit Session Time
            </WuButton>
          </section>
        </aside>
      </div>
    </div>
  );
}
