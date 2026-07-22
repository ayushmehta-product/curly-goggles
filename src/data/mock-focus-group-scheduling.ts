export type FocusGroupSessionStatus = 'scheduled' | 'live' | 'processing' | 'completed';

export type InvitationStatus = 'sent' | 'not_sent';

export type AcknowledgmentStatus = 'acknowledged' | 'pending' | 'declined';

export type AttendanceStatus = 'attended' | 'no-show' | 'declined';

/**
 * A single candidate date/time. Only used by the Focus Group creation wizard's
 * Scheduling step ([CandidateSlot] predates the acknowledgment-only model below
 * and is kept here so that step's existing "poll" UI keeps compiling).
 */
export interface CandidateSlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
}

export interface FocusGroupParticipant {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  invitationStatus: InvitationStatus;
  acknowledgmentStatus: AcknowledgmentStatus;
  /** Only set once the session has happened. */
  attendanceStatus?: AttendanceStatus | null;
  invitedAt?: string;
  acknowledgedAt?: string;
  /** Recording length for attended participants; null/undefined when no recording exists. */
  videoDurationSeconds?: number | null;
  /** Researcher rating 1–5; unset until rated. */
  rating?: number | null;
  /** Free-form researcher notes shown in the completed table. */
  notes?: string;
}

export interface FocusGroupWorkspace {
  focusGroupId: string;
  /** The single decided session time — participants acknowledge this, they don't vote. */
  sessionAt: string;
  sessionDurationMinutes: number;
  sessionStatus: FocusGroupSessionStatus;
  /** Quorum-style target used to drive the acknowledgment progress bar. */
  targetParticipants: number;
  moderatorIds: string[];
  observerIds: string[];
  participants: FocusGroupParticipant[];
  schedulingLink: string;
  callRoomUrl: string;
}

export function getParticipantFullName(participant: FocusGroupParticipant) {
  return `${participant.firstName} ${participant.lastName}`;
}

export function getParticipantInitials(participant: FocusGroupParticipant) {
  return `${participant.firstName[0] ?? ''}${participant.lastName[0] ?? ''}`.toUpperCase();
}

export const MOCK_FOCUS_GROUP_WORKSPACES: FocusGroupWorkspace[] = [
  {
    focusGroupId: 'fg-001',
    sessionAt: '2026-07-16T15:00:00.000+05:30',
    sessionDurationMinutes: 60,
    sessionStatus: 'scheduled',
    targetParticipants: 5,
    moderatorIds: ['mod-amara-shah'],
    observerIds: ['obs-zoe-martin'],
    participants: [
      {
        id: 'fgp-nina-kapoor',
        firstName: 'Nina',
        lastName: 'Kapoor',
        email: 'nina.kapoor@astercloud.com',
        invitationStatus: 'sent',
        acknowledgmentStatus: 'acknowledged',
        invitedAt: '2026-07-09T09:00:00.000+05:30',
        acknowledgedAt: '2026-07-09T14:20:00.000+05:30',
      },
      {
        id: 'fgp-daniel-weber',
        firstName: 'Daniel',
        lastName: 'Weber',
        email: 'daniel.weber@northstarsystems.com',
        invitationStatus: 'sent',
        acknowledgmentStatus: 'acknowledged',
        invitedAt: '2026-07-09T09:00:00.000+05:30',
        acknowledgedAt: '2026-07-10T08:05:00.000+05:30',
      },
      {
        id: 'fgp-mei-tan',
        firstName: 'Mei',
        lastName: 'Tan',
        email: 'mei.tan@orbitops.com',
        invitationStatus: 'sent',
        acknowledgmentStatus: 'acknowledged',
        invitedAt: '2026-07-09T09:00:00.000+05:30',
        acknowledgedAt: '2026-07-10T11:40:00.000+05:30',
      },
      {
        id: 'fgp-owen-brooks',
        firstName: 'Owen',
        lastName: 'Brooks',
        email: 'owen.brooks@rivergateretail.com',
        invitationStatus: 'sent',
        acknowledgmentStatus: 'pending',
        invitedAt: '2026-07-09T09:00:00.000+05:30',
      },
      {
        id: 'fgp-hannah-patel',
        firstName: 'Hannah',
        lastName: 'Patel',
        email: 'hannah.patel@nimbushr.com',
        invitationStatus: 'sent',
        acknowledgmentStatus: 'pending',
        invitedAt: '2026-07-09T09:00:00.000+05:30',
      },
      {
        id: 'fgp-priya-menon',
        firstName: 'Priya',
        lastName: 'Menon',
        email: 'priya.menon@fieldstack.com',
        invitationStatus: 'sent',
        acknowledgmentStatus: 'declined',
        invitedAt: '2026-07-09T09:00:00.000+05:30',
        acknowledgedAt: '2026-07-11T10:15:00.000+05:30',
      },
      {
        id: 'fgp-marcus-chen',
        firstName: 'Marcus',
        lastName: 'Chen',
        email: 'marcus.chen@evergreenprocurement.com',
        invitationStatus: 'sent',
        acknowledgmentStatus: 'pending',
        invitedAt: '2026-07-09T09:00:00.000+05:30',
      },
      {
        id: 'fgp-sofia-alvarez',
        firstName: 'Sofia',
        lastName: 'Alvarez',
        email: 'sofia.alvarez@brightlinehealth.com',
        invitationStatus: 'not_sent',
        acknowledgmentStatus: 'pending',
      },
    ],
    schedulingLink: 'https://research.questionpro.com/schedule/fg-001',
    callRoomUrl: 'https://research.questionpro.com/focus-group/fg-001/room',
  },
  {
    focusGroupId: 'fg-002',
    sessionAt: '2026-07-18T18:30:00.000+05:30',
    sessionDurationMinutes: 45,
    sessionStatus: 'scheduled',
    targetParticipants: 6,
    moderatorIds: ['mod-lena-hoffman'],
    observerIds: ['obs-ravi-menon', 'obs-maya-chen'],
    participants: [
      { id: 'fgp-002-1', firstName: 'Arjun', lastName: 'Kulkarni', email: 'arjun.kulkarni@mail.com', invitationStatus: 'sent', acknowledgmentStatus: 'acknowledged', invitedAt: '2026-07-08T09:00:00.000+05:30', acknowledgedAt: '2026-07-08T19:00:00.000+05:30' },
      { id: 'fgp-002-2', firstName: 'Isabella', lastName: 'Novak', email: 'isabella.novak@mail.com', invitationStatus: 'sent', acknowledgmentStatus: 'acknowledged', invitedAt: '2026-07-08T09:00:00.000+05:30', acknowledgedAt: '2026-07-09T07:30:00.000+05:30' },
      { id: 'fgp-002-3', firstName: 'Kenji', lastName: 'Sato', email: 'kenji.sato@mail.com', invitationStatus: 'sent', acknowledgmentStatus: 'acknowledged', invitedAt: '2026-07-08T09:00:00.000+05:30', acknowledgedAt: '2026-07-09T21:10:00.000+05:30' },
      { id: 'fgp-002-4', firstName: 'Grace', lastName: 'Adeyemi', email: 'grace.adeyemi@mail.com', invitationStatus: 'sent', acknowledgmentStatus: 'acknowledged', invitedAt: '2026-07-08T09:00:00.000+05:30', acknowledgedAt: '2026-07-10T08:45:00.000+05:30' },
      { id: 'fgp-002-5', firstName: 'Lucas', lastName: 'Meyer', email: 'lucas.meyer@mail.com', invitationStatus: 'sent', acknowledgmentStatus: 'acknowledged', invitedAt: '2026-07-08T09:00:00.000+05:30', acknowledgedAt: '2026-07-10T12:20:00.000+05:30' },
      { id: 'fgp-002-6', firstName: 'Amelia', lastName: 'Foster', email: 'amelia.foster@mail.com', invitationStatus: 'sent', acknowledgmentStatus: 'acknowledged', invitedAt: '2026-07-08T09:00:00.000+05:30', acknowledgedAt: '2026-07-11T09:05:00.000+05:30' },
      { id: 'fgp-002-7', firstName: 'Tariq', lastName: 'Hassan', email: 'tariq.hassan@mail.com', invitationStatus: 'sent', acknowledgmentStatus: 'pending', invitedAt: '2026-07-08T09:00:00.000+05:30' },
    ],
    schedulingLink: 'https://research.questionpro.com/schedule/fg-002',
    callRoomUrl: 'https://research.questionpro.com/focus-group/fg-002/room',
  },
  {
    focusGroupId: 'fg-004',
    sessionAt: '2026-06-18T16:00:00.000+05:30',
    sessionDurationMinutes: 60,
    sessionStatus: 'completed',
    targetParticipants: 6,
    moderatorIds: ['mod-sofia-alvarez'],
    observerIds: ['obs-elena-rossi'],
    participants: [
      { id: 'fgp-004-1', firstName: 'Farid', lastName: 'Bashir', email: 'farid.bashir@brightpay.com', invitationStatus: 'sent', acknowledgmentStatus: 'acknowledged', attendanceStatus: 'attended', invitedAt: '2026-06-10T09:00:00.000+05:30', acknowledgedAt: '2026-06-10T18:00:00.000+05:30', videoDurationSeconds: 571, rating: 4, notes: 'Summary lean: confirms reconciliation workflow mostly works, but flags approval delays as the biggest friction point.' },
      { id: 'fgp-004-2', firstName: 'Grace', lastName: 'Liu', email: 'grace.liu@nimbleledger.com', invitationStatus: 'sent', acknowledgmentStatus: 'acknowledged', attendanceStatus: 'attended', invitedAt: '2026-06-10T09:00:00.000+05:30', acknowledgedAt: '2026-06-11T07:40:00.000+05:30', videoDurationSeconds: 103, rating: 5, notes: 'The conversation is fragmented; logistics rather than substantive content. She offers acknowledgments, indicates a willingness to share details on how the exports would be implemented across her finance team, and repeatedly returns to the missing audit trail as the reason her team still keeps a parallel spreadsheet.' },
      { id: 'fgp-004-3', firstName: 'Tomas', lastName: 'Novak', email: 'tomas.novak@fieldcraftco.com', invitationStatus: 'sent', acknowledgmentStatus: 'acknowledged', attendanceStatus: 'attended', invitedAt: '2026-06-10T09:00:00.000+05:30', acknowledgedAt: '2026-06-11T10:15:00.000+05:30', videoDurationSeconds: 327 },
      { id: 'fgp-004-4', firstName: 'Aaliyah', lastName: 'Brooks', email: 'aaliyah.brooks@paystreamhq.com', invitationStatus: 'sent', acknowledgmentStatus: 'acknowledged', attendanceStatus: 'attended', invitedAt: '2026-06-10T09:00:00.000+05:30', acknowledgedAt: '2026-06-12T09:30:00.000+05:30', videoDurationSeconds: 442, rating: 3, notes: 'Briefly confirms procedures; mentions being in transit, and notes being at work. Largely logistical, centering on language and location.' },
      { id: 'fgp-004-5', firstName: 'Samuel', lastName: 'Osei', email: 'samuel.osei@ledgerlinkco.com', invitationStatus: 'sent', acknowledgmentStatus: 'acknowledged', attendanceStatus: 'attended', invitedAt: '2026-06-10T09:00:00.000+05:30', acknowledgedAt: '2026-06-12T14:50:00.000+05:30', videoDurationSeconds: 205, rating: 4, notes: 'Confirms there are two areas for the demo after a brief tether panel issue; the details of how a chat script will be implemented are unclear.' },
      { id: 'fgp-004-6', firstName: 'Rina', lastName: 'Kapoor', email: 'rina.kapoor@smallworksco.com', invitationStatus: 'sent', acknowledgmentStatus: 'acknowledged', attendanceStatus: 'attended', invitedAt: '2026-06-10T09:00:00.000+05:30', acknowledgedAt: '2026-06-13T08:10:00.000+05:30', videoDurationSeconds: 141 },
      { id: 'fgp-004-7', firstName: 'Derek', lastName: 'Chan', email: 'derek.chan@paystreamhq.com', invitationStatus: 'sent', acknowledgmentStatus: 'declined', attendanceStatus: 'declined', invitedAt: '2026-06-10T09:00:00.000+05:30', acknowledgedAt: '2026-06-13T16:30:00.000+05:30' },
      { id: 'fgp-004-8', firstName: 'Wei', lastName: 'Zhang', email: 'wei.zhang@fieldcraftco.com', invitationStatus: 'sent', acknowledgmentStatus: 'pending', attendanceStatus: 'no-show', invitedAt: '2026-06-10T09:00:00.000+05:30' },
      { id: 'fgp-004-9', firstName: 'Elif', lastName: 'Demir', email: 'elif.demir@smallworksco.com', invitationStatus: 'not_sent', acknowledgmentStatus: 'pending', attendanceStatus: null },
    ],
    schedulingLink: 'https://research.questionpro.com/schedule/fg-004',
    callRoomUrl: 'https://research.questionpro.com/focus-group/fg-004/room',
  },
];
