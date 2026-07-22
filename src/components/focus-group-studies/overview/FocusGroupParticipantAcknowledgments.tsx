'use client';

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { format } from 'date-fns';
import { useWuShowToast } from '@npm-questionpro/wick-ui-lib';
import type { IWuTableColumnDef, IWuSwitcherOptions } from '@npm-questionpro/wick-ui-lib';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  getParticipantFullName,
  type AcknowledgmentStatus,
  type FocusGroupParticipant,
} from '@/data/mock-focus-group-scheduling';
import {
  formatVideoDuration,
  type FocusGroupWorkspacePhase,
} from '@/data/focus-group-workspace-utils';
import {
  AcknowledgmentStatusChip,
  AttendanceStatusChip,
} from '@/components/focus-group-studies/overview/focus-group-status-badges';

const WuTable = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuTable })),
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

type ParticipantTab = 'upcoming' | 'completed';

type TableParticipant = FocusGroupParticipant & { displayId: number };

function formatInvitationLabel(participant: FocusGroupParticipant) {
  if (participant.invitationStatus === 'not_sent') {
    return 'Not sent';
  }
  if (participant.invitedAt) {
    return `Sent \u00b7 ${format(new Date(participant.invitedAt), 'MMM d')}`;
  }
  return 'Sent';
}

function ParticipantNameCell({
  participant,
  showAttendance,
}: {
  participant: FocusGroupParticipant;
  showAttendance: boolean;
}) {
  return (
    <div className="min-w-0">
      <div className="flex flex-wrap items-center gap-2">
        <p className="truncate text-sm font-semibold text-gray-950">{getParticipantFullName(participant)}</p>
        {showAttendance && participant.attendanceStatus && (
          <AttendanceStatusChip status={participant.attendanceStatus} />
        )}
      </div>
      <p className="mt-0.5 truncate text-xs text-gray-500">{participant.email}</p>
    </div>
  );
}

function VideoActionsCell({
  participant,
  onPlay,
}: {
  participant: FocusGroupParticipant;
  onPlay: () => void;
}) {
  const { showToast } = useWuShowToast();
  const fullName = getParticipantFullName(participant);

  if (participant.attendanceStatus !== 'attended' || !participant.videoDurationSeconds) {
    return <span className="text-sm text-gray-400">No recording</span>;
  }

  const iconActions = [
    { icon: 'wm-download', label: 'Download video', message: `Downloading recording for ${fullName}…` },
    { icon: 'wm-share', label: 'Share video', message: `Share link created for ${fullName}'s recording.` },
    { icon: 'wm-content-copy', label: 'Copy video link', message: `Video link copied for ${fullName}.` },
    { icon: 'wm-delete', label: 'Delete video', message: `Recording deletion is not available in this prototype.` },
  ];

  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        className="inline-flex items-center gap-1 whitespace-nowrap text-sm font-medium text-blue-600 hover:underline"
        onClick={onPlay}
      >
        <span className="wm-play-arrow text-base" />
        Play ({formatVideoDuration(participant.videoDurationSeconds)})
      </button>
      {iconActions.map((action) => (
        <button
          key={action.icon}
          type="button"
          aria-label={`${action.label} for ${fullName}`}
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

function RatingCell({
  participant,
  onRate,
}: {
  participant: FocusGroupParticipant;
  onRate: (rating: number) => void;
}) {
  const rating = participant.rating ?? 0;

  return (
    <div className="flex items-center gap-0.5" role="group" aria-label={`Rating for ${getParticipantFullName(participant)}`}>
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

function NotesCell({ participant }: { participant: FocusGroupParticipant }) {
  const { showToast } = useWuShowToast();
  const openNotes = () =>
    showToast({ message: `Opening notes editor for ${getParticipantFullName(participant)}…`, variant: 'success' });

  if (!participant.notes) {
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
      <span className="line-clamp-3">{participant.notes}</span>
    </button>
  );
}

function ParticipantRowMenu({
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
  const fullName = getParticipantFullName(participant);

  return (
    <WuMenu
      Trigger={
        <button
          type="button"
          aria-label={`Actions for ${fullName}`}
          className="rounded-md border border-gray-200 p-2 text-gray-500 hover:bg-gray-50 hover:text-gray-700"
        >
          <span className="wm-more-horiz text-sm" />
        </button>
      }
      align="end"
    >
      <WuMenuItem onSelect={onResendInvitation}>Resend invitation</WuMenuItem>
      <WuMenuItem onSelect={onCopyParticipantLink}>Copy participant link</WuMenuItem>
      {!showAttendance && (
        <>
          <WuMenuSeparatorItem />
          <WuMenuItem onSelect={() => onSetAcknowledgment('acknowledged')}>Mark acknowledged</WuMenuItem>
          <WuMenuItem onSelect={() => onSetAcknowledgment('declined')}>Mark declined</WuMenuItem>
          <WuMenuItem onSelect={() => onSetAcknowledgment('pending')}>Reset to pending</WuMenuItem>
        </>
      )}
    </WuMenu>
  );
}

interface FocusGroupParticipantAcknowledgmentsProps {
  participants: FocusGroupParticipant[];
  phase: FocusGroupWorkspacePhase;
  onSetAcknowledgment: (participantId: string, status: AcknowledgmentStatus) => void;
  onResendInvitation: (participant: FocusGroupParticipant) => void;
  onCopyParticipantLink: (participant: FocusGroupParticipant) => void;
  onRateParticipant: (participantId: string, rating: number) => void;
  onPlayRecording: (participant: FocusGroupParticipant) => void;
}

export function FocusGroupParticipantAcknowledgments({
  participants,
  phase,
  onSetAcknowledgment,
  onResendInvitation,
  onCopyParticipantLink,
  onRateParticipant,
  onPlayRecording,
}: FocusGroupParticipantAcknowledgmentsProps) {
  const isSessionCompleted = phase === 'completed';

  const [activeTab, setActiveTab] = useState<ParticipantTab>(isSessionCompleted ? 'completed' : 'upcoming');
  const [lastPhase, setLastPhase] = useState(phase);
  if (phase !== lastPhase) {
    setLastPhase(phase);
    if (phase === 'completed') setActiveTab('completed');
  }

  const tableParticipants = useMemo<TableParticipant[]>(
    () => participants.map((participant, index) => ({ ...participant, displayId: index + 1 })),
    [participants]
  );

  const upcomingParticipants = isSessionCompleted ? [] : tableParticipants;
  const completedParticipants = isSessionCompleted ? tableParticipants : [];
  const visibleParticipants = activeTab === 'upcoming' ? upcomingParticipants : completedParticipants;

  const tabItems: IWuSwitcherOptions<ParticipantTab> = [
    { value: 'upcoming', label: `Upcoming ${upcomingParticipants.length}` },
    { value: 'completed', label: `Completed ${completedParticipants.length}` },
  ];

  const showAttendance = activeTab === 'completed';

  const upcomingColumns: IWuTableColumnDef<TableParticipant>[] = [
    {
      accessorKey: 'displayId',
      header: 'ID',
      cell: ({ row }) => <span className="text-sm text-gray-500">{row.original.displayId}</span>,
    },
    {
      accessorKey: 'firstName',
      header: 'User Name',
      cell: ({ row }) => <ParticipantNameCell participant={row.original} showAttendance={false} />,
    },
    {
      accessorKey: 'invitationStatus',
      header: 'Invitation',
      cell: ({ row }) => <span className="text-sm text-gray-600">{formatInvitationLabel(row.original)}</span>,
    },
    {
      accessorKey: 'acknowledgmentStatus',
      header: 'Status',
      cell: ({ row }) => <AcknowledgmentStatusChip status={row.original.acknowledgmentStatus} />,
    },
    {
      accessorKey: 'id',
      header: '',
      cellAlign: 'right',
      cell: ({ row }) => (
        <ParticipantRowMenu
          participant={row.original}
          showAttendance={false}
          onSetAcknowledgment={(status) => onSetAcknowledgment(row.original.id, status)}
          onResendInvitation={() => onResendInvitation(row.original)}
          onCopyParticipantLink={() => onCopyParticipantLink(row.original)}
        />
      ),
    },
  ];

  const completedColumns: IWuTableColumnDef<TableParticipant>[] = [
    {
      accessorKey: 'displayId',
      header: 'ID',
      cell: ({ row }) => <span className="text-sm text-gray-500">{row.original.displayId}</span>,
    },
    {
      accessorKey: 'firstName',
      header: 'User Name',
      cell: ({ row }) => <ParticipantNameCell participant={row.original} showAttendance />,
    },
    {
      accessorKey: 'videoDurationSeconds',
      header: 'Video',
      cell: ({ row }) => (
        <VideoActionsCell participant={row.original} onPlay={() => onPlayRecording(row.original)} />
      ),
    },
    {
      accessorKey: 'rating',
      header: 'Rating',
      cell: ({ row }) => (
        <RatingCell participant={row.original} onRate={(rating) => onRateParticipant(row.original.id, rating)} />
      ),
    },
    {
      accessorKey: 'notes',
      header: 'Notes | Tags',
      cell: ({ row }) => <NotesCell participant={row.original} />,
    },
    {
      accessorKey: 'id',
      header: '',
      cellAlign: 'right',
      cell: ({ row }) => (
        <ParticipantRowMenu
          participant={row.original}
          showAttendance
          onSetAcknowledgment={(status) => onSetAcknowledgment(row.original.id, status)}
          onResendInvitation={() => onResendInvitation(row.original)}
          onCopyParticipantLink={() => onCopyParticipantLink(row.original)}
        />
      ),
    },
  ];

  const columns = showAttendance ? completedColumns : upcomingColumns;

  const sectionTitle = showAttendance ? 'Participant attendance' : 'Participant acknowledgments';
  const sectionDescription = showAttendance
    ? 'Who joined the session, their recordings, ratings, and notes.'
    : 'Participants receive the decided session time and confirm they can make it.';

  const emptyState =
    activeTab === 'completed' ? (
      <EmptyState
        icon="wm-task-alt"
        title="Session not completed yet"
        description="Recordings, ratings, and notes will appear here once the session has run."
      />
    ) : (
      <EmptyState
        icon="wm-groups"
        title={isSessionCompleted ? 'No upcoming participants' : 'No participants invited yet'}
        description={
          isSessionCompleted
            ? 'This session has already run — switch to Completed to review attendance.'
            : 'Invite participants from Scheduling to start tracking responses.'
        }
      />
    );

  return (
    <section>
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-gray-950">{sectionTitle}</h2>
        <p className="mt-1 text-sm text-gray-500">{sectionDescription}</p>
        <div className="mt-3 inline-flex" aria-label="Participant state filter">
          <WuSwitcher
            options={tabItems}
            value={activeTab}
            onChange={(value) => setActiveTab(value as ParticipantTab)}
            type="tab"
            size="md"
          />
        </div>
      </div>

      <WuTable
        data={visibleParticipants as unknown[]}
        columns={columns as unknown as IWuTableColumnDef<unknown>[]}
        variant="striped"
        NoDataContent={<div className="py-8">{emptyState}</div>}
      />
    </section>
  );
}
