'use client';

import { useMemo, useState, type ReactNode } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { format, isAfter } from 'date-fns';
import { useWuShowToast } from '@npm-questionpro/wick-ui-lib';
import { StudyWorkspaceTabs } from '@/components/idi-studies/StudyWorkspaceTabs';
import {
  ParticipantInterviewsTable,
  type InterviewTab,
} from '@/components/idi-studies/ParticipantInterviewsTable';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { OverviewCard, OverviewDetailRow } from '@/components/ui/OverviewCards';
import { MOCK_IDI_STUDY_DETAILS } from '@/data/mock-idi-study-details';
import {
  MOCK_IDI_STUDIES,
  STUDY_STATUS_LABELS,
  type StudyStatus,
} from '@/data/mock-idi-studies';
import {
  MOCK_STUDY_OPERATIONAL_OVERVIEWS,
  type StudySession,
} from '@/data/mock-study-overview';

const WuButton = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuButton })),
  { ssr: false }
);

const OPERATION_NOW = new Date('2026-05-14T09:15:00.000+05:30');

const STUDY_STATUS_STYLES: Record<StudyStatus, string> = {
  draft: 'bg-gray-100 text-gray-700',
  recruiting: 'bg-purple-50 text-purple-700',
  active: 'bg-green-50 text-green-700',
  completed: 'bg-blue-50 text-blue-700',
  archived: 'bg-amber-50 text-amber-700',
};

function Pill({ children, className }: { children: ReactNode; className: string }) {
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${className}`}>{children}</span>;
}

function StudyStatusBadge({ status }: { status: StudyStatus }) {
  return <Pill className={STUDY_STATUS_STYLES[status]}>{STUDY_STATUS_LABELS[status]}</Pill>;
}

export default function StudyOverviewPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { showToast } = useWuShowToast();
  const study = MOCK_IDI_STUDIES.find((item) => item.id === id);
  const overview = MOCK_STUDY_OPERATIONAL_OVERVIEWS.find((item) => item.studyId === id) ?? MOCK_STUDY_OPERATIONAL_OVERVIEWS[0];
  const studyDetails = MOCK_IDI_STUDY_DETAILS.find((item) => item.studyId === id) ?? MOCK_IDI_STUDY_DETAILS[0];
  const [sessions, setSessions] = useState<StudySession[]>(overview.sessions);
  const [activeInterviewTab, setActiveInterviewTab] = useState<InterviewTab>('upcoming');

  const nextConfirmedSession = useMemo(
    () => sessions.find((session) => session.status === 'confirmed' && isAfter(new Date(session.startsAt), OPERATION_NOW)),
    [sessions]
  );

  if (!study) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <EmptyState
          icon="wm-error-outline"
          title="IDI Study not found"
          description="This study does not exist or has been removed from the prototype workspace."
          action={<Link href="/idi-studies" className="text-sm font-medium text-blue-600 hover:underline">Back to IDI Studies</Link>}
        />
      </div>
    );
  }

  const studyId = study.id;

  function showActionToast(message: string) {
    showToast({ message, variant: 'success' });
  }

  async function copyBookingLink() {
    try {
      await navigator.clipboard.writeText(overview.bookingLink);
      showActionToast('Booking link copied.');
    } catch {
      showToast({ message: 'Unable to copy booking link.', variant: 'error' });
    }
  }

  async function copySessionLink(session: StudySession) {
    try {
      await navigator.clipboard.writeText(`https://research.questionpro.com/session/${session.id}`);
      showActionToast(`Session link copied for ${session.participantName}.`);
    } catch {
      showToast({ message: 'Unable to copy session link.', variant: 'error' });
    }
  }

  function handleStartSession() {
    if (!nextConfirmedSession) {
      showToast({ message: 'No confirmed session is ready to start.', variant: 'warning' });
      return;
    }

    showActionToast(`Opening session workspace for ${nextConfirmedSession.participantName}.`);
    router.push(`/idi-studies/${studyId}/sessions`);
  }

  function handleJoinSession(session: StudySession) {
    showActionToast(`Opening session workspace for ${session.participantName}.`);
    router.push(`/idi-studies/${studyId}/sessions?session=${session.id}`);
  }

  function handlePlayRecording(session: StudySession) {
    showActionToast(`Opening ${session.participantName}'s session…`);
    router.push(`/idi-studies/${studyId}/sessions?session=${session.id}`);
  }

  function rateSession(sessionId: string, rating: number) {
    setSessions((currentSessions) =>
      currentSessions.map((item) => (item.id === sessionId ? { ...item, rating } : item))
    );
    showActionToast(`Rated ${rating} star${rating === 1 ? '' : 's'}.`);
  }

  function handleReschedule(session: StudySession) {
    setSessions((currentSessions) =>
      currentSessions.map((item) =>
        item.id === session.id
          ? { ...item, status: 'pending', startsAt: '2026-05-20T11:00:00.000+05:30' }
          : item
      )
    );
    showActionToast(`Reschedule request sent for ${session.participantName}.`);
  }

  function handleCancel(session: StudySession) {
    setSessions((currentSessions) =>
      currentSessions.map((item) => (item.id === session.id ? { ...item, status: 'cancelled' } : item))
    );
    showActionToast(`Session with ${session.participantName} cancelled.`);
  }

  function handleAssignObserver(session: StudySession) {
    setSessions((currentSessions) =>
      currentSessions.map((item) =>
        item.id === session.id ? { ...item, observerCount: item.observerCount + 1 } : item
      )
    );
    showActionToast(`Observer assigned to ${session.participantName}.`);
  }

  function launchCallRoom() {
    showActionToast('Opening call room…');
    router.push(`/idi-studies/${studyId}/sessions`);
  }

  function cancelRequest() {
    showToast({
      message: 'Cancelling the request will stop recruitment and notify all booked participants.',
      variant: 'warning',
    });
  }

  function seeMore(message: string) {
    return () => showActionToast(message);
  }

  const leadModerator = sessions[0]?.moderator ?? study.createdBy.name;
  const scriptLabel =
    overview.discussionGuide.totalQuestions > 0
      ? `${overview.discussionGuide.totalQuestions} question${overview.discussionGuide.totalQuestions === 1 ? '' : 's'} added`
      : '(None added)';
  const progressLabel = study.status === 'completed' ? 'Completed' : 'In progress';

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Link href="/idi-studies" className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
        <span className="wm-arrow-back text-base" /> Back to IDI Studies
      </Link>
      <PageHeader
        title={study.title}
        action={
          <>
            <StudyStatusBadge status={study.status} />
            <WuButton variant="secondary" onClick={copyBookingLink}>Share Booking Link</WuButton>
            <WuButton Icon={<span className="wm-play-arrow" />} onClick={handleStartSession}>Start Session</WuButton>
          </>
        }
      />
      <div className="mb-5">
        <StudyWorkspaceTabs studyId={studyId} activeTab="overview" />
      </div>

      <div className="mb-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <OverviewCard
          footer={
            <span className="text-xs text-gray-500">
              Created {format(new Date(study.createdAt), 'MMM d, yyyy hh:mm a')} by {study.createdBy.name}
            </span>
          }
        >
          <OverviewDetailRow label="Interview ID" value={studyDetails.numericId} />
          <OverviewDetailRow label="Device type" value={studyDetails.deviceType} />
          <OverviewDetailRow
            label="Demographics"
            value={studyDetails.demographics}
            action={
              <button
                type="button"
                className="text-sm font-medium text-blue-600 hover:underline"
                onClick={seeMore('Opening demographics details…')}
              >
                See more
              </button>
            }
          />
          <OverviewDetailRow
            label="Session duration"
            value={`Up to ${overview.interviewDurationMinutes} min each`}
          />
          <OverviewDetailRow
            label="Script"
            value={scriptLabel}
            action={
              <button
                type="button"
                className="text-sm font-medium text-blue-600 hover:underline"
                onClick={seeMore('Opening discussion guide…')}
              >
                See more
              </button>
            }
          />
          <OverviewDetailRow
            label="Moderator"
            value={leadModerator}
            action={
              <button
                type="button"
                className="text-sm font-medium text-blue-600 hover:underline"
                onClick={seeMore('Opening moderator details…')}
              >
                See more
              </button>
            }
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
                onClick={cancelRequest}
                disabled={study.status === 'completed'}
              >
                Cancel request
              </button>
            </>
          }
        >
          <div className="flex h-full flex-col items-center justify-center gap-3 py-2 text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-gray-700">{progressLabel}</p>
            <p className="text-sm text-gray-600">
              <span className="font-semibold text-gray-900">{study.participantGoal}</span> participants requested
              {' \u00b7 '}
              <span className="font-semibold text-gray-900">{study.sessionsCompleted}</span> completed
              {' \u00b7 '}
              <span className="font-semibold text-gray-900">{study.activeSessions}</span> in progress
              {' \u00b7 '}
              <button
                type="button"
                className="font-medium text-blue-600 hover:underline"
                onClick={copyBookingLink}
              >
                Room links
              </button>
            </p>
            <WuButton Icon={<span className="wm-videocam" />} onClick={launchCallRoom}>
              Launch call room
            </WuButton>
          </div>
        </OverviewCard>
      </div>

      <ParticipantInterviewsTable
        sessions={sessions}
        activeTab={activeInterviewTab}
        now={OPERATION_NOW}
        onChangeTab={setActiveInterviewTab}
        onJoin={handleJoinSession}
        onCopyLink={copySessionLink}
        onReschedule={handleReschedule}
        onCancel={handleCancel}
        onAssignObserver={handleAssignObserver}
        onPlayRecording={handlePlayRecording}
        onRateSession={rateSession}
      />
    </div>
  );
}
