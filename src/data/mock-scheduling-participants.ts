export type ParticipantInvitationStatus = 'not_sent' | 'sent';

export interface ScheduledParticipant {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  invitationStatus: ParticipantInvitationStatus;
  invitedAt?: string;
}

export const INITIAL_SCHEDULED_PARTICIPANTS: ScheduledParticipant[] = [
  {
    id: 'participant-jane-doe',
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'jane.doe@northwind.io',
    invitationStatus: 'sent',
    invitedAt: '2026-07-05T10:30:00.000Z',
  },
];

export function getParticipantFullName(participant: ScheduledParticipant) {
  return `${participant.firstName} ${participant.lastName}`.trim();
}

export function getParticipantInitials(participant: ScheduledParticipant) {
  const first = participant.firstName.trim().charAt(0);
  const last = participant.lastName.trim().charAt(0);
  return `${first}${last}`.toUpperCase() || '?';
}
