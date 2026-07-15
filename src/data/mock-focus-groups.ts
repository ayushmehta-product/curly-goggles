export type FocusGroupStatus = 'draft' | 'scheduling' | 'confirmed' | 'completed' | 'archived';

export interface FocusGroupOwner {
  name: string;
  initials: string;
}

export interface FocusGroup {
  id: string;
  title: string;
  status: FocusGroupStatus;
  targetParticipants: number;
  sessionDurationMinutes: number;
  /** The single decided session date/time. Null until a time has been set. */
  sessionAt: string | null;
  /** Participants who have acknowledged the session time. */
  participantsConfirmed: number;
  participantsTotal: number;
  createdBy: FocusGroupOwner;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
}

export const FOCUS_GROUP_STATUS_LABELS: Record<FocusGroupStatus, string> = {
  draft: 'Draft',
  scheduling: 'Scheduling',
  confirmed: 'Confirmed',
  completed: 'Completed',
  archived: 'Archived',
};

export const MOCK_FOCUS_GROUPS: FocusGroup[] = [
  {
    id: 'fg-001',
    title: 'Checkout Redesign Reaction Group',
    status: 'scheduling',
    targetParticipants: 5,
    sessionDurationMinutes: 60,
    sessionAt: '2026-07-16T15:00:00.000+05:30',
    participantsConfirmed: 3,
    participantsTotal: 8,
    createdBy: { name: 'Maya Iyer', initials: 'MI' },
    createdAt: '2026-06-28T10:30:00.000Z',
    updatedAt: '2026-07-09T09:10:00.000Z',
    tags: ['checkout', 'e-commerce', 'pricing'],
  },
  {
    id: 'fg-002',
    title: 'Streaming App Recommendation Feed Study',
    status: 'confirmed',
    targetParticipants: 6,
    sessionDurationMinutes: 45,
    sessionAt: '2026-07-18T18:30:00.000+05:30',
    participantsConfirmed: 6,
    participantsTotal: 7,
    createdBy: { name: 'Elena Rodriguez', initials: 'ER' },
    createdAt: '2026-06-20T14:20:00.000Z',
    updatedAt: '2026-07-08T16:45:00.000Z',
    tags: ['streaming', 'recommendations'],
  },
  {
    id: 'fg-003',
    title: 'Rural Broadband Onboarding Concerns',
    status: 'draft',
    targetParticipants: 8,
    sessionDurationMinutes: 60,
    sessionAt: null,
    participantsConfirmed: 0,
    participantsTotal: 0,
    createdBy: { name: 'Noah Kim', initials: 'NK' },
    createdAt: '2026-07-07T09:00:00.000Z',
    updatedAt: '2026-07-07T11:05:00.000Z',
    tags: ['broadband', 'rural access'],
  },
  {
    id: 'fg-004',
    title: 'Small Business Payroll Trust Signals',
    status: 'completed',
    targetParticipants: 6,
    sessionDurationMinutes: 60,
    sessionAt: '2026-06-18T16:00:00.000+05:30',
    participantsConfirmed: 6,
    participantsTotal: 9,
    createdBy: { name: 'Priya Shah', initials: 'PS' },
    createdAt: '2026-05-18T15:10:00.000Z',
    updatedAt: '2026-06-19T19:30:00.000Z',
    tags: ['payroll', 'small business', 'trust'],
  },
  {
    id: 'fg-005',
    title: 'AI Summary Trust Calibration Panel',
    status: 'scheduling',
    targetParticipants: 5,
    sessionDurationMinutes: 45,
    sessionAt: '2026-07-20T13:00:00.000+05:30',
    participantsConfirmed: 2,
    participantsTotal: 6,
    createdBy: { name: 'Jordan Lee', initials: 'JL' },
    createdAt: '2026-07-01T12:00:00.000Z',
    updatedAt: '2026-07-09T05:35:00.000Z',
    tags: ['AI trust', 'insight summaries'],
  },
  {
    id: 'fg-006',
    title: 'Claims Portal Document Upload Frustrations',
    status: 'archived',
    targetParticipants: 6,
    sessionDurationMinutes: 60,
    sessionAt: '2026-03-02T17:00:00.000+05:30',
    participantsConfirmed: 6,
    participantsTotal: 6,
    createdBy: { name: 'Aisha Morgan', initials: 'AM' },
    createdAt: '2026-01-21T17:15:00.000Z',
    updatedAt: '2026-03-02T18:10:00.000Z',
    tags: ['insurance', 'claims'],
  },
  {
    id: 'fg-007',
    title:
      'Extremely Detailed Cross-Regional Enterprise Buyer Focus Group for Complex Multi-Stakeholder Procurement Evaluation and Renewal Decision Journeys',
    status: 'draft',
    targetParticipants: 7,
    sessionDurationMinutes: 90,
    sessionAt: null,
    participantsConfirmed: 0,
    participantsTotal: 0,
    createdBy: { name: 'Marcus Chen', initials: 'MC' },
    createdAt: '2026-07-05T18:25:00.000Z',
    updatedAt: '2026-07-05T20:40:00.000Z',
    tags: ['enterprise buying', 'renewals'],
  },
  {
    id: 'fg-008',
    title: 'Field Sales Mobile Note-Taking Habits',
    status: 'completed',
    targetParticipants: 5,
    sessionDurationMinutes: 45,
    sessionAt: '2026-04-28T11:00:00.000+05:30',
    participantsConfirmed: 5,
    participantsTotal: 5,
    createdBy: { name: 'Sofia Martinez', initials: 'SM' },
    createdAt: '2026-02-26T08:45:00.000Z',
    updatedAt: '2026-04-28T17:00:00.000Z',
    tags: ['mobile', 'CRM', 'field sales'],
  },
  {
    id: 'fg-009',
    title: 'Clinician Scheduling Console Conflict Resolution',
    status: 'scheduling',
    targetParticipants: 6,
    sessionDurationMinutes: 60,
    sessionAt: '2026-07-17T10:00:00.000+05:30',
    participantsConfirmed: 1,
    participantsTotal: 8,
    createdBy: { name: 'Daniel Okafor', initials: 'DO' },
    createdAt: '2026-06-30T11:10:00.000Z',
    updatedAt: '2026-07-09T07:10:00.000Z',
    tags: ['healthcare workflows', 'scheduling'],
  },
  {
    id: 'fg-010',
    title: 'B2B Renewal Objection Language Study',
    status: 'scheduling',
    targetParticipants: 8,
    sessionDurationMinutes: 60,
    sessionAt: '2026-07-22T14:00:00.000+05:30',
    participantsConfirmed: 0,
    participantsTotal: 3,
    createdBy: { name: 'Rachel Green', initials: 'RG' },
    createdAt: '2026-07-02T13:55:00.000Z',
    updatedAt: '2026-07-08T06:20:00.000Z',
  },
  {
    id: 'fg-011',
    title: 'Digital Wallet Fraud-Protection Messaging Reactions',
    status: 'completed',
    targetParticipants: 6,
    sessionDurationMinutes: 45,
    sessionAt: '2026-04-18T09:00:00.000+05:30',
    participantsConfirmed: 6,
    participantsTotal: 8,
    createdBy: { name: 'Hannah Patel', initials: 'HP' },
    createdAt: '2026-02-03T16:40:00.000Z',
    updatedAt: '2026-04-18T09:50:00.000Z',
    tags: ['banking trust', 'payments'],
  },
  {
    id: 'fg-012',
    title: 'Partner Portal First-Campaign Activation Retro',
    status: 'archived',
    targetParticipants: 5,
    sessionDurationMinutes: 60,
    sessionAt: '2026-02-14T15:00:00.000+05:30',
    participantsConfirmed: 5,
    participantsTotal: 5,
    createdBy: { name: 'Owen Brooks', initials: 'OB' },
    createdAt: '2025-12-12T10:20:00.000Z',
    updatedAt: '2026-02-14T15:30:00.000Z',
    tags: ['onboarding', 'partners'],
  },
];
