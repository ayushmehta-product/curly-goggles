export type TestStatus = 'draft' | 'recruiting' | 'active' | 'completed' | 'archived';

export type TestSurface = 'website' | 'saas' | 'figma';

export interface TestOwner {
  name: string;
  initials: string;
}

export interface WebsiteTrackingConfig {
  surface: 'website';
  url: string;
  recordingOnly: boolean;
  snippetVerified: boolean;
}

export interface SaasTrackingConfig {
  surface: 'saas';
  appUrl: string;
  environment: 'Staging' | 'Production';
  testAccountEmail: string;
  snippetVerified: boolean;
}

export interface FigmaTrackingConfig {
  surface: 'figma';
  connectedAccount: string;
  fileName: string;
  trackInteractiveComponents: boolean;
}

export type TrackingConfig =
  | WebsiteTrackingConfig
  | SaasTrackingConfig
  | FigmaTrackingConfig;

export interface UsabilityTest {
  id: string;
  title: string;
  status: TestStatus;
  surface: TestSurface;
  tracking: TrackingConfig;
  taskDescription?: string;
  participantTarget?: string;
  participantsEnrolled: number;
  participantGoal: number;
  sessionsCompleted: number;
  sessionsTotal: number;
  createdBy: TestOwner;
  createdAt: string;
  updatedAt: string;
  pendingParticipantResponses: number;
  activeSessions: number;
  tags?: string[];
}

export const TEST_STATUS_LABELS: Record<TestStatus, string> = {
  draft: 'Draft',
  recruiting: 'Recruiting',
  active: 'Active',
  completed: 'Completed',
  archived: 'Archived',
};

export const TEST_SURFACE_LABELS: Record<TestSurface, string> = {
  website: 'Website',
  saas: 'SaaS Product',
  figma: 'Figma Prototype',
};

export const TEST_SURFACE_ICONS: Record<TestSurface, string> = {
  website: 'wm-language',
  saas: 'wm-deployed-code',
  figma: 'wm-gesture',
};

export const MOCK_USABILITY_TESTS: UsabilityTest[] = [
  {
    id: 'ut-001',
    title: 'Greater Midland Community Onboarding Flow',
    status: 'active',
    surface: 'figma',
    tracking: {
      surface: 'figma',
      connectedAccount: 'maya.iyer@questionpro.com',
      fileName: 'Greater Midland Community — Onboarding v4',
      trackInteractiveComponents: true,
    },
    taskDescription: 'Evaluate how new members navigate the onboarding wizard from account creation to their first dashboard action.',
    participantTarget: 'New users who signed up in the past 14 days',
    participantsEnrolled: 24,
    participantGoal: 30,
    sessionsCompleted: 24,
    sessionsTotal: 24,
    createdBy: { name: 'Maya Iyer', initials: 'MI' },
    createdAt: '2026-04-02T10:00:00.000Z',
    updatedAt: '2026-05-12T08:30:00.000Z',
    pendingParticipantResponses: 6,
    activeSessions: 2,
    tags: ['onboarding', 'figma prototype', 'activation'],
  },
  {
    id: 'ut-002',
    title: 'Checkout Redesign 2026 — Cart to Confirmation',
    status: 'active',
    surface: 'website',
    tracking: {
      surface: 'website',
      url: 'https://shop.example.com',
      recordingOnly: false,
      snippetVerified: true,
    },
    taskDescription: 'Test if customers can complete a multi-item purchase with a coupon code applied without confusion or abandonment.',
    participantTarget: 'Online shoppers who purchase at least monthly',
    participantsEnrolled: 18,
    participantGoal: 25,
    sessionsCompleted: 12,
    sessionsTotal: 18,
    createdBy: { name: 'Elena Rodriguez', initials: 'ER' },
    createdAt: '2026-04-18T14:20:00.000Z',
    updatedAt: '2026-05-13T11:15:00.000Z',
    pendingParticipantResponses: 8,
    activeSessions: 3,
    tags: ['checkout', 'e-commerce', 'conversion'],
  },
  {
    id: 'ut-003',
    title: 'Admin Dashboard Settings Panel Evaluation',
    status: 'recruiting',
    surface: 'saas',
    tracking: {
      surface: 'saas',
      appUrl: 'https://app.platform.io',
      environment: 'Staging',
      testAccountEmail: 'tester@platform.io',
      snippetVerified: true,
    },
    taskDescription: 'Assess how enterprise admins find, update, and save integration settings inside the Settings panel.',
    participantTarget: 'Enterprise IT admins managing SaaS tools',
    participantsEnrolled: 7,
    participantGoal: 20,
    sessionsCompleted: 3,
    sessionsTotal: 7,
    createdBy: { name: 'Noah Kim', initials: 'NK' },
    createdAt: '2026-05-05T09:00:00.000Z',
    updatedAt: '2026-05-12T16:45:00.000Z',
    pendingParticipantResponses: 13,
    activeSessions: 1,
    tags: ['admin tools', 'settings', 'SaaS'],
  },
  {
    id: 'ut-004',
    title: 'Mobile Banking Transfer Flow',
    status: 'completed',
    surface: 'figma',
    tracking: {
      surface: 'figma',
      connectedAccount: 'priya.shah@questionpro.com',
      fileName: 'Mobile Banking Redesign — Transfer Prototype',
      trackInteractiveComponents: true,
    },
    taskDescription: 'Verify that banking customers can initiate and confirm an external transfer in under 3 minutes.',
    participantTarget: 'Mobile banking users who transfer money at least once per month',
    participantsEnrolled: 32,
    participantGoal: 30,
    sessionsCompleted: 30,
    sessionsTotal: 32,
    createdBy: { name: 'Priya Shah', initials: 'PS' },
    createdAt: '2026-02-14T15:10:00.000Z',
    updatedAt: '2026-04-06T19:30:00.000Z',
    pendingParticipantResponses: 0,
    activeSessions: 0,
    tags: ['mobile banking', 'transfer flow', 'task completion'],
  },
  {
    id: 'ut-005',
    title: 'Help Center Search Experience',
    status: 'draft',
    surface: 'website',
    tracking: {
      surface: 'website',
      url: 'https://help.example.com',
      recordingOnly: false,
      snippetVerified: false,
    },
    taskDescription: 'Evaluate whether users can locate an answer to a billing question using the Help Center search without contacting support.',
    participantTarget: 'Customers who have opened a support ticket in the past 60 days',
    participantsEnrolled: 0,
    participantGoal: 18,
    sessionsCompleted: 0,
    sessionsTotal: 0,
    createdBy: { name: 'Jordan Lee', initials: 'JL' },
    createdAt: '2026-05-10T12:00:00.000Z',
    updatedAt: '2026-05-10T12:00:00.000Z',
    pendingParticipantResponses: 0,
    activeSessions: 0,
    tags: ['self-service', 'help center', 'search'],
  },
  {
    id: 'ut-006',
    title: 'Insurance Claims Document Upload — Portal v3',
    status: 'archived',
    surface: 'saas',
    tracking: {
      surface: 'saas',
      appUrl: 'https://claims.insure.com',
      environment: 'Production',
      testAccountEmail: 'tester@insure.com',
      snippetVerified: true,
    },
    taskDescription: 'Measure where claimants struggle to attach supporting documents during the claims upload flow.',
    participantTarget: 'Policyholders with an active auto or property claim',
    participantsEnrolled: 22,
    participantGoal: 22,
    sessionsCompleted: 22,
    sessionsTotal: 22,
    createdBy: { name: 'Aisha Morgan', initials: 'AM' },
    createdAt: '2026-01-10T17:15:00.000Z',
    updatedAt: '2026-03-01T13:10:00.000Z',
    pendingParticipantResponses: 0,
    activeSessions: 0,
    tags: ['insurance', 'document upload', 'claims'],
  },
  {
    id: 'ut-007',
    title:
      'Cross-Platform Enterprise Procurement Approval Workflow Evaluation Study with Multi-Stakeholder Decision Paths',
    status: 'draft',
    surface: 'saas',
    tracking: {
      surface: 'saas',
      appUrl: 'https://app.procureplatform.io',
      environment: 'Staging',
      testAccountEmail: '',
      snippetVerified: false,
    },
    participantsEnrolled: 0,
    participantGoal: 24,
    sessionsCompleted: 0,
    sessionsTotal: 0,
    createdBy: { name: 'Marcus Chen', initials: 'MC' },
    createdAt: '2026-05-11T18:25:00.000Z',
    updatedAt: '2026-05-11T18:25:00.000Z',
    pendingParticipantResponses: 0,
    activeSessions: 0,
    tags: ['procurement', 'enterprise', 'multi-stakeholder'],
  },
  {
    id: 'ut-008',
    title: 'Patient Intake Form Redesign',
    status: 'completed',
    surface: 'figma',
    tracking: {
      surface: 'figma',
      connectedAccount: 'sofia.martinez@questionpro.com',
      fileName: 'Patient Intake Redesign — High Fidelity v2',
      trackInteractiveComponents: false,
    },
    taskDescription: 'Test whether patients can complete pre-appointment intake in under 5 minutes on a mobile device.',
    participantTarget: 'Patients scheduled for a primary care visit in the next 30 days',
    participantsEnrolled: 19,
    participantGoal: 20,
    sessionsCompleted: 19,
    sessionsTotal: 19,
    createdBy: { name: 'Sofia Martinez', initials: 'SM' },
    createdAt: '2026-02-20T08:45:00.000Z',
    updatedAt: '2026-04-12T17:00:00.000Z',
    pendingParticipantResponses: 0,
    activeSessions: 0,
    tags: ['healthcare', 'mobile form', 'intake'],
  },
  {
    id: 'ut-009',
    title: 'Recruitment Funnel Landing Page',
    status: 'active',
    surface: 'website',
    tracking: {
      surface: 'website',
      url: 'https://hire.example.com',
      recordingOnly: true,
      snippetVerified: false,
    },
    taskDescription: 'Understand where candidates drop off when navigating from a job listing to a completed application.',
    participantTarget: 'Job seekers actively applying to software roles',
    participantsEnrolled: 11,
    participantGoal: 16,
    sessionsCompleted: 5,
    sessionsTotal: 11,
    createdBy: { name: 'Daniel Okafor', initials: 'DO' },
    createdAt: '2026-04-20T11:10:00.000Z',
    updatedAt: '2026-05-13T09:10:00.000Z',
    pendingParticipantResponses: 5,
    activeSessions: 2,
    tags: ['recruitment', 'landing page', 'drop-off'],
  },
  {
    id: 'ut-010',
    title: 'B2B SaaS Subscription Upgrade Path',
    status: 'recruiting',
    surface: 'saas',
    tracking: {
      surface: 'saas',
      appUrl: 'https://app.saasproduct.com',
      environment: 'Production',
      testAccountEmail: 'upgrades@saasproduct.com',
      snippetVerified: true,
    },
    taskDescription: 'Find the friction points that prevent power users from upgrading to the Business plan from within the app.',
    participantsEnrolled: 4,
    participantGoal: 18,
    sessionsCompleted: 1,
    sessionsTotal: 4,
    createdBy: { name: 'Rachel Green', initials: 'RG' },
    createdAt: '2026-05-07T13:55:00.000Z',
    updatedAt: '2026-05-13T06:20:00.000Z',
    pendingParticipantResponses: 14,
    activeSessions: 1,
  },
  {
    id: 'ut-011',
    title: 'Digital Wallet Onboarding First-Launch Experience',
    status: 'completed',
    surface: 'figma',
    tracking: {
      surface: 'figma',
      connectedAccount: 'hannah.patel@questionpro.com',
      fileName: 'Digital Wallet — Onboarding Prototype v3',
      trackInteractiveComponents: true,
    },
    taskDescription: 'Assess whether first-time users can add a payment method and make their first transaction without guidance.',
    participantTarget: 'Adults 25–45 who have never used a digital wallet',
    participantsEnrolled: 20,
    participantGoal: 20,
    sessionsCompleted: 20,
    sessionsTotal: 20,
    createdBy: { name: 'Hannah Patel', initials: 'HP' },
    createdAt: '2026-01-28T16:40:00.000Z',
    updatedAt: '2026-04-05T09:50:00.000Z',
    pendingParticipantResponses: 0,
    activeSessions: 0,
    tags: ['fintech', 'wallet', 'first-launch'],
  },
];
