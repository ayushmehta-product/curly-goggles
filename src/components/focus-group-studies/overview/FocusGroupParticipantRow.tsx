'use client';

import dynamic from 'next/dynamic';
import { format } from 'date-fns';
import {
  getParticipantFullName,
  getParticipantInitials,
  type AcknowledgmentStatus,
  type FocusGroupParticipant,
} from '@/data/mock-focus-group-scheduling';
import {
  AcknowledgmentStatusChip,
  AttendanceStatusChip,
} from '@/components/focus-group-studies/overview/focus-group-status-badges';

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
const WuSubtext = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuSubtext })),
  { ssr: false }
);

function formatInvitationSubtext(participant: FocusGroupParticipant) {
  if (participant.invitationStatus === 'not_sent') {
    return 'Invitation not sent';
  }

  if (participant.invitedAt) {
    return `Invitation sent · ${format(new Date(participant.invitedAt), 'MMM d')}`;
  }

  return 'Invitation sent';
}

interface FocusGroupParticipantRowProps {
  participant: FocusGroupParticipant;
  showAttendance: boolean;
  onSetAcknowledgment: (status: AcknowledgmentStatus) => void;
  onResendInvitation: () => void;
  onCopyParticipantLink: () => void;
}

export function FocusGroupParticipantRow({
  participant,
  showAttendance,
  onSetAcknowledgment,
  onResendInvitation,
  onCopyParticipantLink,
}: FocusGroupParticipantRowProps) {
  const fullName = getParticipantFullName(participant);

  return (
    <div className="flex min-h-[64px] items-center overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition hover:border-blue-200 hover:shadow">
      <div className="flex min-w-0 flex-1 items-center gap-3 px-5 py-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-xs font-semibold text-indigo-700">
          {getParticipantInitials(participant)}
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-sm font-semibold text-gray-950">{fullName}</p>
            {showAttendance && participant.attendanceStatus ? (
              <AttendanceStatusChip status={participant.attendanceStatus} />
            ) : (
              <AcknowledgmentStatusChip status={participant.acknowledgmentStatus} />
            )}
          </div>
          <p className="mt-0.5 truncate text-xs text-gray-500">{participant.email}</p>
          <WuSubtext size="sm" className="mt-1 text-ink-muted">
            {formatInvitationSubtext(participant)}
          </WuSubtext>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2 px-4">
        <button
          type="button"
          aria-label={`Copy link for ${fullName}`}
          onClick={onCopyParticipantLink}
          className="rounded-md border border-gray-200 p-2 text-gray-500 hover:bg-gray-50 hover:text-gray-700"
        >
          <span className="wm-link text-sm" />
        </button>
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
      </div>
    </div>
  );
}
