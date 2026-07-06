export type StudyStatus = 'draft' | 'recruiting' | 'active' | 'completed' | 'archived';

export type ModerationMode = 'Human Moderated' | 'AI Moderated';

export interface StudyOwner {
  name: string;
  initials: string;
}

export interface IdiStudy {
  id: string;
  title: string;
  moderationMode: ModerationMode;
  status: StudyStatus;
  researchObjective?: string;
  participantTarget?: string;
  participantsEnrolled: number;
  participantGoal: number;
  sessionsCompleted: number;
  sessionsTotal: number;
  createdBy: StudyOwner;
  createdAt: string;
  updatedAt: string;
  pendingParticipantResponses: number;
  activeSessions: number;
  tags?: string[];
}

export const STUDY_STATUS_LABELS: Record<StudyStatus, string> = {
  draft: 'Draft',
  recruiting: 'Recruiting',
  active: 'Active',
  completed: 'Completed',
  archived: 'Archived',
};

export const MOCK_IDI_STUDIES: IdiStudy[] = [
  {
    id: 'idi-001',
    title: 'Enterprise Onboarding Friction Study',
    moderationMode: 'Human Moderated',
    status: 'active',
    researchObjective:
      'Understand where admins and team leads lose confidence during first workspace setup.',
    participantTarget: 'New enterprise admins in their first 45 days',
    participantsEnrolled: 18,
    participantGoal: 24,
    sessionsCompleted: 11,
    sessionsTotal: 18,
    createdBy: { name: 'Maya Iyer', initials: 'MI' },
    createdAt: '2026-04-08T10:30:00.000Z',
    updatedAt: '2026-05-13T08:15:00.000Z',
    pendingParticipantResponses: 6,
    activeSessions: 3,
    tags: ['onboarding', 'enterprise admins', 'activation'],
  },
  {
    id: 'idi-002',
    title: 'Mobile Banking Trust and Recovery Research',
    moderationMode: 'AI Moderated',
    status: 'recruiting',
    researchObjective:
      'Evaluate how retail banking customers interpret security prompts, failed transfers, and recovery flows.',
    participantTarget: 'Mobile banking customers who completed a digital transfer in the last 30 days',
    participantsEnrolled: 9,
    participantGoal: 20,
    sessionsCompleted: 2,
    sessionsTotal: 9,
    createdBy: { name: 'Elena Rodriguez', initials: 'ER' },
    createdAt: '2026-05-02T14:20:00.000Z',
    updatedAt: '2026-05-12T16:45:00.000Z',
    pendingParticipantResponses: 11,
    activeSessions: 2,
    tags: ['banking trust', 'mobile', 'security'],
  },
  {
    id: 'idi-003',
    title: 'Healthcare Care Team Workflow Discovery',
    moderationMode: 'Human Moderated',
    status: 'draft',
    researchObjective:
      'Map how nurses, schedulers, and care coordinators hand off patient follow-up tasks.',
    participantTarget: 'Healthcare operations staff across ambulatory clinics',
    participantsEnrolled: 0,
    participantGoal: 16,
    sessionsCompleted: 0,
    sessionsTotal: 0,
    createdBy: { name: 'Noah Kim', initials: 'NK' },
    createdAt: '2026-05-10T09:00:00.000Z',
    updatedAt: '2026-05-12T11:05:00.000Z',
    pendingParticipantResponses: 0,
    activeSessions: 0,
    tags: ['healthcare workflows', 'care teams'],
  },
  {
    id: 'idi-004',
    title: 'Procurement Approval Tool Evaluation',
    moderationMode: 'AI Moderated',
    status: 'completed',
    researchObjective:
      'Identify how procurement managers review approvals, exceptions, and vendor risk signals.',
    participantTarget: 'Procurement managers at companies with more than 1,000 employees',
    participantsEnrolled: 22,
    participantGoal: 22,
    sessionsCompleted: 22,
    sessionsTotal: 22,
    createdBy: { name: 'Priya Shah', initials: 'PS' },
    createdAt: '2026-03-18T15:10:00.000Z',
    updatedAt: '2026-05-06T19:30:00.000Z',
    pendingParticipantResponses: 0,
    activeSessions: 0,
    tags: ['procurement tools', 'approval flows', 'vendor risk'],
  },
  {
    id: 'idi-005',
    title: 'AI Usability Expectations for Insight Summaries',
    moderationMode: 'AI Moderated',
    status: 'active',
    researchObjective:
      'Learn how researchers judge usefulness, evidence quality, and editability in AI-generated insight summaries.',
    participantTarget: 'UX researchers who synthesize at least two studies per quarter',
    participantsEnrolled: 15,
    participantGoal: 18,
    sessionsCompleted: 7,
    sessionsTotal: 15,
    createdBy: { name: 'Jordan Lee', initials: 'JL' },
    createdAt: '2026-04-22T12:00:00.000Z',
    updatedAt: '2026-05-13T05:35:00.000Z',
    pendingParticipantResponses: 5,
    activeSessions: 4,
    tags: ['AI usability', 'insights', 'research synthesis'],
  },
  {
    id: 'idi-006',
    title: 'Insurance Claims Portal Follow-Up Interviews',
    moderationMode: 'Human Moderated',
    status: 'archived',
    researchObjective:
      'Understand why claimants abandon document upload and status tracking steps.',
    participantTarget: 'Policyholders who opened an auto or property claim in Q1',
    participantsEnrolled: 14,
    participantGoal: 14,
    sessionsCompleted: 13,
    sessionsTotal: 14,
    createdBy: { name: 'Aisha Morgan', initials: 'AM' },
    createdAt: '2026-01-21T17:15:00.000Z',
    updatedAt: '2026-03-02T13:10:00.000Z',
    pendingParticipantResponses: 0,
    activeSessions: 0,
    tags: ['insurance', 'claims', 'document upload'],
  },
  {
    id: 'idi-007',
    title:
      'Extremely Detailed Cross-Regional Enterprise Buyer Interview Study for Complex Multi-Stakeholder Procurement Evaluation and Renewal Decision Journeys',
    moderationMode: 'AI Moderated',
    status: 'draft',
    researchObjective:
      'Prepare a structured guide for renewal decision makers across finance, security, procurement, and product operations.',
    participantTarget: 'Enterprise software buyers involved in renewals over $250K ARR',
    participantsEnrolled: 0,
    participantGoal: 28,
    sessionsCompleted: 0,
    sessionsTotal: 0,
    createdBy: { name: 'Marcus Chen', initials: 'MC' },
    createdAt: '2026-05-11T18:25:00.000Z',
    updatedAt: '2026-05-11T20:40:00.000Z',
    pendingParticipantResponses: 0,
    activeSessions: 0,
    tags: ['enterprise buying', 'renewals', 'procurement'],
  },
  {
    id: 'idi-008',
    title: 'Field Sales Mobile Experience Interviews',
    moderationMode: 'Human Moderated',
    status: 'completed',
    researchObjective:
      'Discover where sales representatives struggle to capture account notes and next steps on mobile devices.',
    participantTarget: 'Field sales representatives using CRM mobile apps weekly',
    participantsEnrolled: 19,
    participantGoal: 18,
    sessionsCompleted: 18,
    sessionsTotal: 19,
    createdBy: { name: 'Sofia Martinez', initials: 'SM' },
    createdAt: '2026-02-26T08:45:00.000Z',
    updatedAt: '2026-04-28T17:00:00.000Z',
    pendingParticipantResponses: 0,
    activeSessions: 0,
    tags: ['mobile experiences', 'CRM', 'field sales'],
  },
  {
    id: 'idi-009',
    title: 'Clinician Scheduling Console Evaluation',
    moderationMode: 'Human Moderated',
    status: 'active',
    researchObjective:
      'Validate whether appointment schedulers can resolve conflicts without switching tools.',
    participantTarget: 'Hospital scheduling coordinators and clinic administrators',
    participantsEnrolled: 12,
    participantGoal: 16,
    sessionsCompleted: 6,
    sessionsTotal: 12,
    createdBy: { name: 'Daniel Okafor', initials: 'DO' },
    createdAt: '2026-04-16T11:10:00.000Z',
    updatedAt: '2026-05-12T21:10:00.000Z',
    pendingParticipantResponses: 4,
    activeSessions: 2,
    tags: ['healthcare workflows', 'scheduling'],
  },
  {
    id: 'idi-010',
    title: 'B2B Subscription Renewal Objection Research',
    moderationMode: 'AI Moderated',
    status: 'recruiting',
    researchObjective:
      'Capture language customers use when explaining renewal hesitation, budget constraints, and perceived value gaps.',
    participantsEnrolled: 6,
    participantGoal: 18,
    sessionsCompleted: 1,
    sessionsTotal: 6,
    createdBy: { name: 'Rachel Green', initials: 'RG' },
    createdAt: '2026-05-06T13:55:00.000Z',
    updatedAt: '2026-05-13T06:20:00.000Z',
    pendingParticipantResponses: 12,
    activeSessions: 1,
  },
  {
    id: 'idi-011',
    title: 'Digital Wallet Trust Cues Study',
    moderationMode: 'Human Moderated',
    status: 'completed',
    researchObjective:
      'Assess how small-business owners interpret balance visibility, limits, and fraud-protection messaging.',
    participantTarget: 'Small-business owners using digital wallets for vendor payments',
    participantsEnrolled: 17,
    participantGoal: 16,
    sessionsCompleted: 16,
    sessionsTotal: 17,
    createdBy: { name: 'Hannah Patel', initials: 'HP' },
    createdAt: '2026-02-03T16:40:00.000Z',
    updatedAt: '2026-04-18T09:50:00.000Z',
    pendingParticipantResponses: 0,
    activeSessions: 0,
    tags: ['banking trust', 'payments'],
  },
  {
    id: 'idi-012',
    title: 'Partner Portal Onboarding Retrospective',
    moderationMode: 'AI Moderated',
    status: 'archived',
    researchObjective:
      'Review friction in partner account setup, certification tasks, and first campaign activation.',
    participantTarget: 'New channel partners onboarded during the winter launch',
    participantsEnrolled: 13,
    participantGoal: 15,
    sessionsCompleted: 12,
    sessionsTotal: 13,
    createdBy: { name: 'Owen Brooks', initials: 'OB' },
    createdAt: '2025-12-12T10:20:00.000Z',
    updatedAt: '2026-02-14T15:30:00.000Z',
    pendingParticipantResponses: 0,
    activeSessions: 0,
    tags: ['onboarding', 'partners'],
  },
  {
    id: 'idi-013',
    title: 'Stakeholder Insight Consumption Habits',
    moderationMode: 'Human Moderated',
    status: 'draft',
    researchObjective:
      'Plan interviews with product leaders about how they consume clips, quotes, and executive summaries.',
    participantTarget: 'Product managers and design leaders who review qualitative findings monthly',
    participantsEnrolled: 2,
    participantGoal: 12,
    sessionsCompleted: 0,
    sessionsTotal: 2,
    createdBy: { name: 'Lena Fischer', initials: 'LF' },
    createdAt: '2026-05-09T07:25:00.000Z',
    updatedAt: '2026-05-10T22:05:00.000Z',
    pendingParticipantResponses: 3,
    activeSessions: 0,
    tags: ['stakeholders', 'insight reels', 'executive summaries'],
  },
];
