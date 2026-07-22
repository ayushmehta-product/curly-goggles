'use client';

import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import { addMinutes, format, isAfter } from 'date-fns';
import { useWuShowToast } from '@npm-questionpro/wick-ui-lib';
import type { IWuTableColumnDef, IWuSwitcherOptions } from '@npm-questionpro/wick-ui-lib';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatVideoDuration } from '@/data/focus-group-workspace-utils';
import type { StudySession, StudySessionStatus } from '@/data/mock-study-overview';

const WuTable = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuTable })),
  { ssr: false }
);
const WuSwitcher = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuSwitcher })),
  { ssr: false }
);
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

const INTERVIEW_DURATION_MINUTES = 45;

export type InterviewTab = 'upcoming' | 'completed';

type TableSession = StudySession & { displayId: number };

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

function SessionStatusBadge({ status }: { status: StudySessionStatus }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${SESSION_STATUS_STYLES[status]}`}>
      {SESSION_STATUS_LABELS[status]}
    </span>
  );
}

function formatSessionWindow(startsAt: string) {
  const starts = new Date(startsAt);
  const ends = addMinutes(starts, INTERVIEW_DURATION_MINUTES);
  return `${format(starts, 'EEE, MMM d')} \u00b7 ${format(starts, 'HH:mm')}\u2013${format(ends, 'HH:mm')}`;
}

export function getSessionsForTab(sessions: StudySession[], activeTab: InterviewTab, now: Date) {
  return sessions
    .filter((session) =>
      activeTab === 'upcoming'
        ? isAfter(new Date(session.startsAt), now) && session.status !== 'completed'
        : session.status === 'completed'
    )
    .sort((first, second) => new Date(first.startsAt).getTime() - new Date(second.startsAt).getTime());
}

function SessionNameCell({ session, showModerator }: { session: StudySession; showModerator: boolean }) {
  return (
    <div className="min-w-0">
      <p className="truncate text-sm font-semibold text-gray-950">{session.participantName}</p>
      <p className="mt-0.5 truncate text-xs text-gray-500">
        {showModerator ? `Moderator: ${session.moderator}` : session.participantCompany}
      </p>
    </div>
  );
}

function VideoActionsCell({ session, onPlay }: { session: StudySession; onPlay: () => void }) {
  const { showToast } = useWuShowToast();

  if (session.status !== 'completed' || !session.videoDurationSeconds) {
    return <span className="text-sm text-gray-400">No recording</span>;
  }

  const iconActions = [
    { icon: 'wm-download', label: 'Download video', message: `Downloading recording for ${session.participantName}…` },
    { icon: 'wm-share', label: 'Share video', message: `Share link created for ${session.participantName}'s recording.` },
    { icon: 'wm-content-copy', label: 'Copy video link', message: `Video link copied for ${session.participantName}.` },
    { icon: 'wm-delete', label: 'Delete video', message: 'Recording deletion is not available in this prototype.' },
  ];

  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        className="inline-flex items-center gap-1 whitespace-nowrap text-sm font-medium text-blue-600 hover:underline"
        onClick={onPlay}
      >
        <span className="wm-play-arrow text-base" />
        Play ({formatVideoDuration(session.videoDurationSeconds)})
      </button>
      {iconActions.map((action) => (
        <button
          key={action.icon}
          type="button"
          aria-label={`${action.label} for ${session.participantName}`}
          title={action.label}
          className="rounded p-1 text-blue-600 hover:bg-blue-50"
          onClick={() =>
            showToast({
              message: action.message,
              variant: action.icon === 'wm-delete' ? 'warning' : 'success',
            })
          }
        >
          <span className={`${action.icon} text-sm`} />
        </button>
      ))}
    </div>
  );
}

function RatingCell({ session, onRate }: { session: StudySession; onRate: (rating: number) => void }) {
  const rating = session.rating ?? 0;

  return (
    <div className="flex items-center gap-0.5" role="group" aria-label={`Rating for ${session.participantName}`}>
      {[1, 2, 3, 4, 5].map((value) => (
        <button
          key={value}
          type="button"
          aria-label={`Rate ${value} star${value === 1 ? '' : 's'}`}
          className={`text-lg leading-none transition-colors ${
            value <= rating ? 'text-amber-400' : 'text-gray-300 hover:text-amber-300'
          }`}
          onClick={() => onRate(value)}
        >
          {'\u2605'}
        </button>
      ))}
    </div>
  );
}

function NotesCell({ session }: { session: StudySession }) {
  const { showToast } = useWuShowToast();
  const openNotes = () =>
    showToast({ message: `Opening notes editor for ${session.participantName}…`, variant: 'success' });

  if (!session.notes) {
    return (
      <button type="button" className="text-sm font-medium text-blue-600 hover:underline" onClick={openNotes}>
        Click to add notes
      </button>
    );
  }

  return (
    <button
      type="button"
      className="block max-w-[320px] text-left text-xs leading-snug text-gray-600 hover:text-gray-900"
      title="Open notes"
      onClick={openNotes}
    >
      <span className="line-clamp-3">{session.notes}</span>
    </button>
  );
}

function SessionRowMenu({
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
  onJoin: () => void;
  onCopyLink: () => void;
  onReschedule: () => void;
  onCancel: () => void;
  onAssignObserver: () => void;
}) {
  return (
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
      {activeTab === 'completed' && <WuMenuItem onSelect={onJoin}>Go to session</WuMenuItem>}
      <WuMenuItem onSelect={onCopyLink}>Copy session link</WuMenuItem>
      {activeTab === 'upcoming' && (
        <>
          <WuMenuItem onSelect={onReschedule}>Reschedule</WuMenuItem>
          <WuMenuItem onSelect={onAssignObserver}>Assign Observer</WuMenuItem>
          <WuMenuSeparatorItem />
          <WuMenuItem onSelect={onCancel}>Cancel Session</WuMenuItem>
        </>
      )}
    </WuMenu>
  );
}

interface ParticipantInterviewsTableProps {
  sessions: StudySession[];
  activeTab: InterviewTab;
  now: Date;
  onChangeTab: (tab: InterviewTab) => void;
  onJoin: (session: StudySession) => void;
  onCopyLink: (session: StudySession) => void;
  onReschedule: (session: StudySession) => void;
  onCancel: (session: StudySession) => void;
  onAssignObserver: (session: StudySession) => void;
  onPlayRecording: (session: StudySession) => void;
  onRateSession: (sessionId: string, rating: number) => void;
}

export function ParticipantInterviewsTable({
  sessions,
  activeTab,
  now,
  onChangeTab,
  onJoin,
  onCopyLink,
  onReschedule,
  onCancel,
  onAssignObserver,
  onPlayRecording,
  onRateSession,
}: ParticipantInterviewsTableProps) {
  const upcomingCount = getSessionsForTab(sessions, 'upcoming', now).length;
  const completedCount = getSessionsForTab(sessions, 'completed', now).length;

  const visibleSessions = useMemo<TableSession[]>(
    () =>
      getSessionsForTab(sessions, activeTab, now).map((session, index) => ({
        ...session,
        displayId: index + 1,
      })),
    [sessions, activeTab, now]
  );

  const tabItems: IWuSwitcherOptions<InterviewTab> = [
    { value: 'upcoming', label: `Upcoming ${upcomingCount}` },
    { value: 'completed', label: `Completed ${completedCount}` },
  ];

  const menuColumn: IWuTableColumnDef<TableSession> = {
    accessorKey: 'id',
    header: '',
    cellAlign: 'right',
    cell: ({ row }) => (
      <SessionRowMenu
        session={row.original}
        activeTab={activeTab}
        onJoin={() => onJoin(row.original)}
        onCopyLink={() => onCopyLink(row.original)}
        onReschedule={() => onReschedule(row.original)}
        onCancel={() => onCancel(row.original)}
        onAssignObserver={() => onAssignObserver(row.original)}
      />
    ),
  };

  const upcomingColumns: IWuTableColumnDef<TableSession>[] = [
    {
      accessorKey: 'displayId',
      header: 'ID',
      cell: ({ row }) => <span className="text-sm text-gray-500">{row.original.displayId}</span>,
    },
    {
      accessorKey: 'startsAt',
      header: 'Session time',
      cell: ({ row }) => (
        <span className="whitespace-nowrap text-sm text-gray-800">{formatSessionWindow(row.original.startsAt)}</span>
      ),
    },
    {
      accessorKey: 'participantName',
      header: 'User Name',
      cell: ({ row }) => <SessionNameCell session={row.original} showModerator />,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <SessionStatusBadge status={row.original.status} />,
    },
    {
      accessorKey: 'timezone',
      header: '',
      cellAlign: 'right',
      cell: ({ row }) => (
        <WuButton
          size="sm"
          variant="secondary"
          Icon={<span className="wm-videocam" />}
          disabled={row.original.status === 'cancelled'}
          onClick={() => onJoin(row.original)}
        >
          Join
        </WuButton>
      ),
    },
    menuColumn,
  ];

  const completedColumns: IWuTableColumnDef<TableSession>[] = [
    {
      accessorKey: 'displayId',
      header: 'ID',
      cell: ({ row }) => <span className="text-sm text-gray-500">{row.original.displayId}</span>,
    },
    {
      accessorKey: 'participantName',
      header: 'User Name',
      cell: ({ row }) => <SessionNameCell session={row.original} showModerator={false} />,
    },
    {
      accessorKey: 'videoDurationSeconds',
      header: 'Video',
      cell: ({ row }) => <VideoActionsCell session={row.original} onPlay={() => onPlayRecording(row.original)} />,
    },
    {
      accessorKey: 'rating',
      header: 'Rating',
      cell: ({ row }) => (
        <RatingCell session={row.original} onRate={(rating) => onRateSession(row.original.id, rating)} />
      ),
    },
    {
      accessorKey: 'notes',
      header: 'Notes | Tags',
      cell: ({ row }) => <NotesCell session={row.original} />,
    },
    menuColumn,
  ];

  const columns = activeTab === 'completed' ? completedColumns : upcomingColumns;

  return (
    <section>
      <div className="mb-5 flex items-start justify-between gap-4">
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

      <WuTable
        data={visibleSessions as unknown[]}
        columns={columns as unknown as IWuTableColumnDef<unknown>[]}
        variant="striped"
        NoDataContent={
          <div className="py-8">
            <EmptyState
              icon="wm-calendar"
              title={activeTab === 'upcoming' ? 'No upcoming interviews' : 'No completed interviews'}
              description="Participant interviews will appear here as sessions are scheduled and completed."
            />
          </div>
        }
      />
    </section>
  );
}
