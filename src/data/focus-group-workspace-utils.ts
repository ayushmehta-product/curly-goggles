import { addMinutes, format } from 'date-fns';
import type { FocusGroupParticipant, FocusGroupWorkspace } from '@/data/mock-focus-group-scheduling';

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
