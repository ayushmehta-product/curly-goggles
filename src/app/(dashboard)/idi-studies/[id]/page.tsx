'use client';

import { useMemo, useState, type ReactNode } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { addMinutes, format, isAfter } from 'date-fns';
import { useWuShowToast } from '@npm-questionpro/wick-ui-lib';
import type { IWuSwitcherOptions } from '@npm-questionpro/wick-ui-lib';
import { StudyWorkspaceTabs } from '@/components/idi-studies/StudyWorkspaceTabs';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  MOCK_IDI_STUDIES,
  STUDY_STATUS_LABELS,
  type StudyStatus,
} from '@/data/mock-idi-studies';
import {
  MOCK_STUDY_OPERATIONAL_OVERVIEWS,
  type StudySession,
  type StudySessionStatus,
} from '@/data/mock-study-overview';

const WuButton = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuButton })),
  { ssr: false }
);
const WuSwitcher = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuSwitcher })),
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

const OPERATION_NOW = new Date('2026-05-14T09:15:00.000+05:30');
const INTERVIEW_DURATION_MINUTES = 45;

type InterviewTab = 'upcoming' | 'completed';

const STUDY_STATUS_STYLES: Record<StudyStatus, string> = {
  draft: 'bg-gray-100 text-gray-700',
  recruiting: 'bg-purple-50 text-purple-700',
  active: 'bg-green-50 text-green-700',
  completed: 'bg-blue-50 text-blue-700',
  archived: 'bg-amber-50 text-amber-700',
};

const SESSION_STATUS_STYLES: Record<StudySessionStatus, string> = {
  confirmed: 'bg-green-50 text-green-700',
  pending: 'bg-amber-50 text-amber-700',
  completed: 'bg-blue-50 text-blue-700',
  cancelled: 'bg-gray-100 text-gray-600',
};

const SESSION_STATUS_LABELS: Record<StudySessionStatus, string> = {
  confirmed: 'Confirmed',
  pending: 'Pending',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

function Pill({ children, className }: { children: ReactNode; className: string }) {
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${className}`}>{children}</span>;
}

function StudyStatusBadge({ status }: { status: StudyStatus }) {
  return <Pill className={STUDY_STATUS_STYLES[status]}>{STUDY_STATUS_LABELS[status]}</Pill>;
}

function SessionStatusBadge({ status }: { status: StudySessionStatus }) {
  return <Pill className={SESSION_STATUS_STYLES[status]}>{SESSION_STATUS_LABELS[status]}</Pill>;
}

function formatSessionTimeRange(startsAt: string) {
  const starts = new Date(startsAt);
  const ends = addMinutes(starts, INTERVIEW_DURATION_MINUTES);

  return `${format(starts, 'HH:mm')} - ${format(ends, 'HH:mm')}`;
}

function formatSessionGroupDate(startsAt: string) {
  return format(new Date(startsAt), 'EEEE, d MMMM yyyy');
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function getSessionsForTab(sessions: StudySession[], activeTab: InterviewTab) {
  return sessions
    .filter((session) =>
      activeTab === 'upcoming'
        ? isAfter(new Date(session.startsAt), OPERATION_NOW) && session.status !== 'completed'
        : session.status === 'completed'
    )
    .sort((first, second) => new Date(first.startsAt).getTime() - new Date(second.startsAt).getTime());
}

function groupSessionsByDate(sessions: StudySession[]) {
  return sessions.reduce<Array<{ label: string; sessions: StudySession[] }>>((groups, session) => {
    const label = formatSessionGroupDate(session.startsAt);
    const existingGroup = groups.find((group) => group.label === label);

    if (existingGroup) {
      existingGroup.sessions.push(session);
      return groups;
    }

    groups.push({ label, sessions: [session] });
    return groups;
  }, []);
}

function ParticipantInterviewCard({
  session,
  activeTab,
  onJoin,
  onCopyLink,
  onReschedule,
  onCancel,
  onAssignObserver,
}: {
  session: StudySession;
  activeTab: InterviewTab;
  onJoin: (session: StudySession) => void;
  onCopyLink: (session: StudySession) => void;
  onReschedule: (session: StudySession) => void;
  onCancel: (session: StudySession) => void;
  onAssignObserver: (session: StudySession) => void;
}) {
  return (
    <div className="flex min-h-[64px] items-center overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition hover:border-blue-200 hover:shadow">
      <div className="flex w-32 shrink-0 items-center justify-center self-stretch border-r border-gray-100 px-4 text-sm font-medium text-gray-800">
        {formatSessionTimeRange(session.startsAt)}
      </div>
      <div className="flex min-w-0 flex-1 items-center gap-3 px-5 py-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-xs font-semibold text-indigo-700">
          {getInitials(session.participantName)}
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-sm font-semibold text-gray-950">{session.participantName}</p>
            <SessionStatusBadge status={session.status} />
          </div>
          <p className="mt-1 text-xs text-gray-500">Moderator: {session.moderator}</p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2 px-4">
        <WuButton
          size="sm"
          variant="secondary"
          Icon={<span className={activeTab === 'upcoming' ? 'wm-videocam' : 'wm-play-circle'} />}
          onClick={() => onJoin(session)}
          disabled={session.status === 'cancelled'}
        >
          {activeTab === 'upcoming' ? 'Join' : 'Go to session'}
        </WuButton>
        <button
          type="button"
          aria-label={`Copy link for ${session.participantName}`}
          onClick={() => onCopyLink(session)}
          className="rounded-md border border-gray-200 p-2 text-gray-500 hover:bg-gray-50 hover:text-gray-700"
        >
          <span className="wm-link text-sm" />
        </button>
        <WuMenu
          Trigger={
            <button
              type="button"
              aria-label={`Actions for ${session.participantName}`}
              className="rounded-md border border-gray-200 p-2 text-gray-500 hover:bg-gray-50 hover:text-gray-700"
            >
              <span className="wm-more-horiz text-sm" />
            </button>
          }
          align="end"
        >
          <WuMenuItem onSelect={() => onReschedule(session)}>Reschedule</WuMenuItem>
          <WuMenuItem onSelect={() => onAssignObserver(session)}>Assign Observer</WuMenuItem>
          <WuMenuSeparatorItem />
          <WuMenuItem onSelect={() => onCancel(session)}>Cancel Session</WuMenuItem>
        </WuMenu>
      </div>
    </div>
  );
}

function ParticipantInterviews({
  sessions,
  activeTab,
  onChangeTab,
  onJoin,
  onCopyLink,
  onReschedule,
  onCancel,
  onAssignObserver,
}: {
  sessions: StudySession[];
  activeTab: InterviewTab;
  onChangeTab: (tab: InterviewTab) => void;
  onJoin: (session: StudySession) => void;
  onCopyLink: (session: StudySession) => void;
  onReschedule: (session: StudySession) => void;
  onCancel: (session: StudySession) => void;
  onAssignObserver: (session: StudySession) => void;
}) {
  const upcomingCount = getSessionsForTab(sessions, 'upcoming').length;
  const completedCount = getSessionsForTab(sessions, 'completed').length;
  const visibleSessions = getSessionsForTab(sessions, activeTab);
  const groupedSessions = groupSessionsByDate(visibleSessions);

  const tabItems: IWuSwitcherOptions<InterviewTab> = [
    { value: 'upcoming', label: `Upcoming ${upcomingCount}` },
    { value: 'completed', label: `Completed ${completedCount}` },
  ];

  return (
    <section>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-950">Participant interviews</h2>
          <div className="mt-3 inline-flex" aria-label="Session state filter">
            <WuSwitcher
              options={tabItems}
              value={activeTab}
              onChange={(value) => onChangeTab(value as InterviewTab)}
              type="tab"
              size="md"
            />
          </div>
        </div>
        <WuButton size="sm" variant="secondary" Icon={<span className="wm-bar-chart" />} onClick={() => undefined}>
          Recruitment stats
        </WuButton>
      </div>

      <div>
        {/* <h3 className="text-lg font-semibold text-gray-950">
          {activeTab === 'upcoming' ? 'Upcoming interviews' : 'Completed interviews'}
        </h3> */}
        {groupedSessions.length === 0 ? (
          <div className="mt-4 rounded-xl border border-gray-200 bg-white p-8">
            <EmptyState
              icon="wm-calendar"
              title={activeTab === 'upcoming' ? 'No upcoming interviews' : 'No completed interviews'}
              description="Participant interviews will appear here as sessions are scheduled and completed."
            />
          </div>
        ) : (
          <div className="mt-5 space-y-7">
            {groupedSessions.map((group) => (
              <div key={group.label}>
                <p className="mb-4 text-sm font-semibold text-gray-500">{group.label}</p>
                <div className="space-y-3">
                  {group.sessions.map((session) => (
                    <ParticipantInterviewCard
                      key={session.id}
                      session={session}
                      activeTab={activeTab}
                      onJoin={onJoin}
                      onCopyLink={onCopyLink}
                      onReschedule={onReschedule}
                      onCancel={onCancel}
                      onAssignObserver={onAssignObserver}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default function StudyOverviewPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { showToast } = useWuShowToast();
  const study = MOCK_IDI_STUDIES.find((item) => item.id === id);
  const overview = MOCK_STUDY_OPERATIONAL_OVERVIEWS.find((item) => item.studyId === id) ?? MOCK_STUDY_OPERATIONAL_OVERVIEWS[0];
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
    router.push(`/idi-studies/${studyId}/sessions`);
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

      <div className="max-w-5xl">
        <ParticipantInterviews
          sessions={sessions}
          activeTab={activeInterviewTab}
          onChangeTab={setActiveInterviewTab}
          onJoin={handleJoinSession}
          onCopyLink={copySessionLink}
          onReschedule={handleReschedule}
          onCancel={handleCancel}
          onAssignObserver={handleAssignObserver}
        />
      </div>
    </div>
  );
}
