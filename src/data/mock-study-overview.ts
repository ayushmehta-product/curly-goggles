export type StudySessionStatus = 'confirmed' | 'pending' | 'completed' | 'cancelled';
export type ParticipantPipelineStatus = 'invited' | 'booked' | 'completed' | 'no-show';
export type StudyHealthTone = 'success' | 'warning';

export interface StudySession {
  id: string;
  studyId: string;
  participantName: string;
  participantCompany: string;
  startsAt: string;
  moderator: string;
  observerCount: number;
  timezone: string;
  status: StudySessionStatus;
  /** Recording length for completed sessions; unset when no recording exists. */
  videoDurationSeconds?: number | null;
  /** Researcher rating 1–5; unset until rated. */
  rating?: number | null;
  /** Free-form researcher notes shown in the completed table. */
  notes?: string;
}

export interface ParticipantPipelineGroup {
  status: ParticipantPipelineStatus;
  label: string;
  count: number;
  participants: string[];
}

export interface StudyHealthItem {
  id: string;
  tone: StudyHealthTone;
  title: string;
  description: string;
}

export interface StudyAttentionItem {
  id: string;
  title: string;
  description: string;
}

export interface StudyOperationalOverview {
  studyId: string;
  interviewDurationMinutes: number;
  timezone: string;
  moderatorCount: number;
  recruitmentStatus: 'Recruiting' | 'Paused' | 'Scheduling Active';
  operationalPulse: {
    nextSessionStartsIn: string;
    recruitmentClosesInDays: number;
    bookingSlotsRemaining: number;
  };
  bookingLink: string;
  discussionGuide: {
    totalQuestions: number;
    estimatedDurationMinutes: number;
    lastUpdatedAt: string;
  };
  recruitment: {
    invitesSent: number;
    bookingRate: number;
    completedInterviews: number;
    pendingScheduling: number;
  };
  sessions: StudySession[];
  pipeline: ParticipantPipelineGroup[];
  attentionItems: StudyAttentionItem[];
  health: StudyHealthItem[];
}

export const MOCK_STUDY_OPERATIONAL_OVERVIEWS: StudyOperationalOverview[] = [
  {
    studyId: 'idi-001',
    interviewDurationMinutes: 30,
    timezone: 'Asia/Calcutta',
    moderatorCount: 4,
    recruitmentStatus: 'Scheduling Active',
    operationalPulse: {
      nextSessionStartsIn: '45 mins',
      recruitmentClosesInDays: 3,
      bookingSlotsRemaining: 6,
    },
    bookingLink: 'https://research.questionpro.com/book/enterprise-onboarding-friction',
    discussionGuide: {
      totalQuestions: 6,
      estimatedDurationMinutes: 30,
      lastUpdatedAt: '2026-05-13T10:20:00.000+05:30',
    },
    recruitment: {
      invitesSent: 42,
      bookingRate: 57,
      completedInterviews: 11,
      pendingScheduling: 6,
    },
    sessions: [
      {
        id: 'session-001',
        studyId: 'idi-001',
        participantName: 'Nina Kapoor',
        participantCompany: 'AsterCloud',
        startsAt: '2026-05-14T10:00:00.000+05:30',
        moderator: 'Amara Shah',
        observerCount: 2,
        timezone: 'Asia/Calcutta',
        status: 'confirmed',
      },
      {
        id: 'session-002',
        studyId: 'idi-001',
        participantName: 'Daniel Weber',
        participantCompany: 'Northstar Systems',
        startsAt: '2026-05-14T14:30:00.000+05:30',
        moderator: 'Lena Hoffman',
        observerCount: 1,
        timezone: 'Europe/Berlin',
        status: 'confirmed',
      },
      {
        id: 'session-003',
        studyId: 'idi-001',
        participantName: 'Mei Tan',
        participantCompany: 'OrbitOps',
        startsAt: '2026-05-14T17:00:00.000+05:30',
        moderator: 'Priya Nair',
        observerCount: 3,
        timezone: 'Asia/Singapore',
        status: 'pending',
      },
      {
        id: 'session-004',
        studyId: 'idi-001',
        participantName: 'Sofia Alvarez',
        participantCompany: 'Brightline Health',
        startsAt: '2026-05-15T09:30:00.000+05:30',
        moderator: 'Amara Shah',
        observerCount: 2,
        timezone: 'Europe/London',
        status: 'confirmed',
      },
      {
        id: 'session-005',
        studyId: 'idi-001',
        participantName: 'Marcus Chen',
        participantCompany: 'Evergreen Procurement',
        startsAt: '2026-05-15T13:00:00.000+05:30',
        moderator: 'Marcus Lee',
        observerCount: 1,
        timezone: 'America/Los_Angeles',
        status: 'confirmed',
      },
      {
        id: 'session-006',
        studyId: 'idi-001',
        participantName: 'Priya Menon',
        participantCompany: 'FieldStack',
        startsAt: '2026-05-16T11:00:00.000+05:30',
        moderator: 'Priya Nair',
        observerCount: 0,
        timezone: 'Asia/Calcutta',
        status: 'pending',
      },
      {
        id: 'session-007',
        studyId: 'idi-001',
        participantName: 'Owen Brooks',
        participantCompany: 'Rivergate Retail',
        startsAt: '2026-05-13T16:00:00.000+05:30',
        moderator: 'Lena Hoffman',
        observerCount: 2,
        timezone: 'America/New_York',
        status: 'completed',
        videoDurationSeconds: 571,
        rating: 4,
        notes: 'Confirms the onboarding checklist helps, but flags workspace permissions as the point where he lost confidence and needed support.',
      },
      {
        id: 'session-008',
        studyId: 'idi-001',
        participantName: 'Hannah Patel',
        participantCompany: 'Nimbus HR',
        startsAt: '2026-05-17T15:30:00.000+05:30',
        moderator: 'Amara Shah',
        observerCount: 1,
        timezone: 'Australia/Sydney',
        status: 'confirmed',
      },
      {
        id: 'session-011',
        studyId: 'idi-001',
        participantName: 'Zoe Martin',
        participantCompany: 'Cobalt Retail Group',
        startsAt: '2026-05-11T14:00:00.000+05:30',
        moderator: 'Marcus Lee',
        observerCount: 1,
        timezone: 'America/New_York',
        status: 'completed',
      },
      {
        id: 'session-009',
        studyId: 'idi-001',
        participantName: 'Elena Rossi',
        participantCompany: 'Vantage Logistics',
        startsAt: '2026-05-12T11:30:00.000+05:30',
        moderator: 'Amara Shah',
        observerCount: 1,
        timezone: 'Europe/London',
        status: 'completed',
        videoDurationSeconds: 103,
        rating: 5,
        notes: 'The conversation is fragmented; logistics rather than substantive content early on. She offers acknowledgments, indicates a willingness to share details on how the setup wizard was rolled out across her operations team, and repeatedly returns to the missing bulk-import validation as the reason her admins still double-check every workspace manually before inviting team leads.',
      },
      {
        id: 'session-010',
        studyId: 'idi-001',
        participantName: 'Farhan Khan',
        participantCompany: 'Meridian Health Group',
        startsAt: '2026-05-12T18:00:00.000+05:30',
        moderator: 'Priya Nair',
        observerCount: 0,
        timezone: 'Asia/Dubai',
        status: 'completed',
        videoDurationSeconds: 442,
        rating: 3,
        notes: 'Briefly confirms procedures; mentions being in transit. Largely logistical, centering on language and location settings.',
      },
    ],
    pipeline: [
      {
        status: 'invited',
        label: 'Invited',
        count: 18,
        participants: ['Arun Nair', 'Maya Chen', 'Noah Kim', 'Rachel Green'],
      },
      {
        status: 'booked',
        label: 'Booked',
        count: 7,
        participants: ['Nina Kapoor', 'Daniel Weber', 'Mei Tan', 'Sofia Alvarez'],
      },
      {
        status: 'completed',
        label: 'Completed',
        count: 11,
        participants: ['Owen Brooks', 'Elena Rossi', 'Farhan Khan', 'Zoe Martin'],
      },
      {
        status: 'no-show',
        label: 'No-show',
        count: 1,
        participants: ['Alex Morgan'],
      },
    ],
    attentionItems: [
      {
        id: 'attention-confirmations',
        title: '2 pending confirmations',
        description: 'Mei Tan and Priya Menon still need moderator confirmation.',
      },
      {
        id: 'attention-friday',
        title: 'Friday availability running low',
        description: 'Only two participant-friendly slots remain this week.',
      },
      {
        id: 'attention-unassigned',
        title: '1 unassigned observer seat',
        description: 'Assign an observer before the 5:00 PM session.',
      },
    ],
    health: [
      {
        id: 'health-recruitment',
        tone: 'success',
        title: 'Recruitment pacing healthy',
        description: 'Booking rate is ahead of the weekly target.',
      },
      {
        id: 'health-availability',
        tone: 'warning',
        title: 'Low availability next week',
        description: 'Only six moderated slots remain open after Wednesday.',
      },
      {
        id: 'health-observers',
        tone: 'success',
        title: 'Observer capacity healthy',
        description: "Observer coverage is confirmed for today's sessions.",
      },
      {
        id: 'health-friday',
        tone: 'warning',
        title: 'Limited Friday coverage',
        description: 'One backup moderator is available after 2:00 PM.',
      },
    ],
  },
];
