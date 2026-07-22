import { addMinutes, format } from 'date-fns';
import type {
  AttendanceStatus,
  FocusGroupParticipant,
  FocusGroupWorkspace,
} from '@/data/mock-focus-group-scheduling';

export type FocusGroupWorkspacePhase = 'scheduling' | 'ready' | 'live' | 'completed';

export function countAcknowledged(participants: FocusGroupParticipant[]) {
  return participants.filter((participant) => participant.acknowledgmentStatus === 'acknowledged').length;
}

export function countPending(participants: FocusGroupParticipant[]) {
  return participants.filter((participant) => participant.acknowledgmentStatus === 'pending').length;
}

export function countDeclined(participants: FocusGroupParticipant[]) {
  return participants.filter((participant) => participant.acknowledgmentStatus === 'declined').length;
}

export function countInvitationsSent(participants: FocusGroupParticipant[]) {
  return participants.filter((participant) => participant.invitationStatus === 'sent').length;
}

export function countAttended(participants: FocusGroupParticipant[]) {
  return participants.filter((participant) => participant.attendanceStatus === 'attended').length;
}

export function countNoShow(participants: FocusGroupParticipant[]) {
  return participants.filter((participant) => participant.attendanceStatus === 'no-show').length;
}

export function countAttendanceDeclined(participants: FocusGroupParticipant[]) {
  return participants.filter((participant) => participant.attendanceStatus === 'declined').length;
}

function deriveAttendanceStatus(participant: FocusGroupParticipant): AttendanceStatus | null {
  if (participant.acknowledgmentStatus === 'acknowledged') return 'attended';
  if (participant.acknowledgmentStatus === 'declined') return 'declined';
  if (participant.invitationStatus === 'sent') return 'no-show';
  return null;
}

/** Deterministic per-participant recording length so the prototype looks stable across renders. */
function synthesizeVideoDuration(index: number) {
  return 240 + ((index * 83) % 360);
}

/** Marks the session completed and assigns attendance from acknowledgment/invitation state. */
export function applyCompletedSessionState(workspace: FocusGroupWorkspace): FocusGroupWorkspace {
  return {
    ...workspace,
    sessionStatus: 'completed',
    participants: workspace.participants.map((participant, index) => {
      const attendanceStatus = deriveAttendanceStatus(participant);
      return {
        ...participant,
        attendanceStatus,
        videoDurationSeconds:
          participant.videoDurationSeconds ??
          (attendanceStatus === 'attended' ? synthesizeVideoDuration(index) : null),
      };
    }),
  };
}

export function formatVideoDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/** Drives the status badge and which Overview layout (pre/live/post) to show. */
export function getWorkspacePhase(workspace: FocusGroupWorkspace): FocusGroupWorkspacePhase {
  if (workspace.sessionStatus === 'completed') return 'completed';
  if (workspace.sessionStatus === 'live') return 'live';

  const acknowledged = countAcknowledged(workspace.participants);
  return acknowledged >= workspace.targetParticipants ? 'ready' : 'scheduling';
}

export function formatSessionWindow(sessionAt: string, durationMinutes: number) {
  const start = new Date(sessionAt);
  const end = addMinutes(start, durationMinutes);
  return `${format(start, 'EEE, MMM d')} \u00b7 ${format(start, 'h:mm a')}\u2013${format(end, 'h:mm a')}`;
}
