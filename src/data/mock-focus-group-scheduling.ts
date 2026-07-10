export type FocusGroupSchedulingMode = 'fixed' | 'poll';

export type FocusGroupSchedulingStatus = 'proposing' | 'awaiting-responses' | 'confirmed';

export type ParticipantRsvpStatus = 'confirmed' | 'pending' | 'declined';

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
  status: ParticipantRsvpStatus;
  /** Poll mode only — which candidate slot this participant picked. */
  pickedSlotId?: string | null;
  invitationStatus: 'sent' | 'not_sent';
  invitedAt?: string;
}

export interface FocusGroupSchedulingConfig {
  focusGroupId: string;
  mode: FocusGroupSchedulingMode;
  /** Fixed mode only. Defaults to true — participants must Accept/Decline. */
  requireRsvp: boolean;
  fixedSlot: CandidateSlot;
  pollSlots: CandidateSlot[];
  isLocked: boolean;
  lockedSlotId: string | null;
  lockedBy: 'quorum' | 'manual' | null;
  quorumTarget: number;
  moderatorIds: string[];
  observerIds: string[];
  participants: FocusGroupParticipant[];
  callRoomUrl: string;
  schedulingLink: string;
}

export function getParticipantFullName(participant: FocusGroupParticipant) {
  return `${participant.firstName} ${participant.lastName}`;
}

export function getParticipantInitials(participant: FocusGroupParticipant) {
  return `${participant.firstName[0] ?? ''}${participant.lastName[0] ?? ''}`.toUpperCase();
}

export const MOCK_FOCUS_GROUP_SCHEDULING: FocusGroupSchedulingConfig[] = [
  {
    focusGroupId: 'fg-001',
    mode: 'poll',
    requireRsvp: true,
    fixedSlot: {
      id: 'fixed-fg-001',
      date: '2026-07-16',
      startTime: '15:00',
      endTime: '16:00',
    },
    pollSlots: [
      { id: 'slot-tue', date: '2026-07-14', startTime: '17:00', endTime: '18:00' },
      { id: 'slot-thu', date: '2026-07-16', startTime: '15:00', endTime: '16:00' },
      { id: 'slot-fri', date: '2026-07-17', startTime: '11:00', endTime: '12:00' },
    ],
    isLocked: false,
    lockedSlotId: null,
    lockedBy: null,
    quorumTarget: 5,
    moderatorIds: ['mod-amara-shah'],
    observerIds: ['obs-zoe-martin'],
    participants: [
      {
        id: 'fgp-nina-kapoor',
        firstName: 'Nina',
        lastName: 'Kapoor',
        email: 'nina.kapoor@astercloud.com',
        status: 'confirmed',
        pickedSlotId: 'slot-thu',
        invitationStatus: 'sent',
        invitedAt: '2026-07-02T09:00:00.000+05:30',
      },
      {
        id: 'fgp-daniel-weber',
        firstName: 'Daniel',
        lastName: 'Weber',
        email: 'daniel.weber@northstarsystems.com',
        status: 'confirmed',
        pickedSlotId: 'slot-thu',
        invitationStatus: 'sent',
        invitedAt: '2026-07-02T09:00:00.000+05:30',
      },
      {
        id: 'fgp-mei-tan',
        firstName: 'Mei',
        lastName: 'Tan',
        email: 'mei.tan@orbitops.com',
        status: 'confirmed',
        pickedSlotId: 'slot-thu',
        invitationStatus: 'sent',
        invitedAt: '2026-07-02T09:00:00.000+05:30',
      },
      {
        id: 'fgp-owen-brooks',
        firstName: 'Owen',
        lastName: 'Brooks',
        email: 'owen.brooks@rivergateretail.com',
        status: 'confirmed',
        pickedSlotId: 'slot-tue',
        invitationStatus: 'sent',
        invitedAt: '2026-07-02T09:00:00.000+05:30',
      },
      {
        id: 'fgp-hannah-patel',
        firstName: 'Hannah',
        lastName: 'Patel',
        email: 'hannah.patel@nimbushr.com',
        status: 'pending',
        pickedSlotId: null,
        invitationStatus: 'sent',
        invitedAt: '2026-07-02T09:00:00.000+05:30',
      },
      {
        id: 'fgp-priya-menon',
        firstName: 'Priya',
        lastName: 'Menon',
        email: 'priya.menon@fieldstack.com',
        status: 'pending',
        pickedSlotId: null,
        invitationStatus: 'sent',
        invitedAt: '2026-07-02T09:00:00.000+05:30',
      },
      {
        id: 'fgp-marcus-lee-participant',
        firstName: 'Marcus',
        lastName: 'Chen',
        email: 'marcus.chen@evergreenprocurement.com',
        status: 'declined',
        pickedSlotId: null,
        invitationStatus: 'sent',
        invitedAt: '2026-07-02T09:00:00.000+05:30',
      },
      {
        id: 'fgp-sofia-alvarez-participant',
        firstName: 'Sofia',
        lastName: 'Alvarez',
        email: 'sofia.alvarez@brightlinehealth.com',
        status: 'pending',
        pickedSlotId: 'slot-fri',
        invitationStatus: 'sent',
        invitedAt: '2026-07-05T09:00:00.000+05:30',
      },
    ],
    callRoomUrl: 'https://research.questionpro.com/focus-group/fg-001/room',
    schedulingLink: 'https://research.questionpro.com/schedule/fg-001',
  },
  {
    focusGroupId: 'fg-002',
    mode: 'fixed',
    requireRsvp: true,
    fixedSlot: {
      id: 'fixed-fg-002',
      date: '2026-07-14',
      startTime: '18:30',
      endTime: '19:15',
    },
    pollSlots: [
      { id: 'slot-fg-002-a', date: '2026-07-14', startTime: '18:30', endTime: '19:15' },
      { id: 'slot-fg-002-b', date: '2026-07-15', startTime: '19:00', endTime: '19:45' },
    ],
    isLocked: true,
    lockedSlotId: 'fixed-fg-002',
    lockedBy: 'quorum',
    quorumTarget: 6,
    moderatorIds: ['mod-lena-hoffman'],
    observerIds: ['obs-ravi-menon', 'obs-maya-chen'],
    participants: [
      { id: 'fgp-002-1', firstName: 'Arjun', lastName: 'Kulkarni', email: 'arjun.kulkarni@mail.com', status: 'confirmed', invitationStatus: 'sent' },
      { id: 'fgp-002-2', firstName: 'Isabella', lastName: 'Novak', email: 'isabella.novak@mail.com', status: 'confirmed', invitationStatus: 'sent' },
      { id: 'fgp-002-3', firstName: 'Kenji', lastName: 'Sato', email: 'kenji.sato@mail.com', status: 'confirmed', invitationStatus: 'sent' },
      { id: 'fgp-002-4', firstName: 'Grace', lastName: 'Adeyemi', email: 'grace.adeyemi@mail.com', status: 'confirmed', invitationStatus: 'sent' },
      { id: 'fgp-002-5', firstName: 'Lucas', lastName: 'Meyer', email: 'lucas.meyer@mail.com', status: 'confirmed', invitationStatus: 'sent' },
      { id: 'fgp-002-6', firstName: 'Amelia', lastName: 'Foster', email: 'amelia.foster@mail.com', status: 'confirmed', invitationStatus: 'sent' },
      { id: 'fgp-002-7', firstName: 'Tariq', lastName: 'Hassan', email: 'tariq.hassan@mail.com', status: 'pending', invitationStatus: 'sent' },
    ],
    callRoomUrl: 'https://research.questionpro.com/focus-group/fg-002/room',
    schedulingLink: 'https://research.questionpro.com/schedule/fg-002',
  },
  {
    focusGroupId: 'fg-009',
    mode: 'poll',
    requireRsvp: true,
    fixedSlot: {
      id: 'fixed-fg-009',
      date: '2026-07-17',
      startTime: '10:00',
      endTime: '11:00',
    },
    pollSlots: [
      { id: 'slot-fg-009-a', date: '2026-07-17', startTime: '10:00', endTime: '11:00' },
      { id: 'slot-fg-009-b', date: '2026-07-18', startTime: '16:00', endTime: '17:00' },
      { id: 'slot-fg-009-c', date: '2026-07-20', startTime: '09:30', endTime: '10:30' },
    ],
    isLocked: false,
    lockedSlotId: null,
    lockedBy: null,
    quorumTarget: 6,
    moderatorIds: ['mod-priya-nair'],
    observerIds: [],
    participants: [
      { id: 'fgp-009-1', firstName: 'Farhan', lastName: 'Iqbal', email: 'farhan.iqbal@mail.com', status: 'confirmed', pickedSlotId: 'slot-fg-009-b', invitationStatus: 'sent' },
      { id: 'fgp-009-2', firstName: 'Naomi', lastName: 'Clarke', email: 'naomi.clarke@mail.com', status: 'pending', pickedSlotId: null, invitationStatus: 'sent' },
      { id: 'fgp-009-3', firstName: 'Diego', lastName: 'Rossi', email: 'diego.rossi@mail.com', status: 'pending', pickedSlotId: null, invitationStatus: 'sent' },
      { id: 'fgp-009-4', firstName: 'Ingrid', lastName: 'Larsen', email: 'ingrid.larsen@mail.com', status: 'pending', pickedSlotId: null, invitationStatus: 'sent' },
      { id: 'fgp-009-5', firstName: 'Michael', lastName: 'Osei', email: 'michael.osei@mail.com', status: 'pending', pickedSlotId: null, invitationStatus: 'sent' },
      { id: 'fgp-009-6', firstName: 'Chloe', lastName: 'Dubois', email: 'chloe.dubois@mail.com', status: 'pending', pickedSlotId: null, invitationStatus: 'sent' },
      { id: 'fgp-009-7', firstName: 'Ravi', lastName: 'Chandran', email: 'ravi.chandran@mail.com', status: 'pending', pickedSlotId: null, invitationStatus: 'sent' },
      { id: 'fgp-009-8', firstName: 'Elif', lastName: 'Yildiz', email: 'elif.yildiz@mail.com', status: 'declined', pickedSlotId: null, invitationStatus: 'sent' },
    ],
    callRoomUrl: 'https://research.questionpro.com/focus-group/fg-009/room',
    schedulingLink: 'https://research.questionpro.com/schedule/fg-009',
  },
];
