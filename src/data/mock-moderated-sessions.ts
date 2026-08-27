export type WorkspaceSessionStatus = 'scheduled' | 'live' | 'completed' | 'processing' | 'cancelled';
export type WorkspaceRecordingStatus = 'ready' | 'uploading' | 'not-started';
export type TranscriptSpeaker = 'Moderator' | 'Participant';

export interface WorkspaceTranscriptLine {
  id: string;
  timestamp: string;
  speaker: TranscriptSpeaker;
  text: string;
}

export interface WorkspaceHighlight {
  id: string;
  timestamp: string;
  title: string;
  quote: string;
  observation: string;
}

export interface ModeratedWorkspaceSession {
  id: string;
  studyId: string;
  participantName: string;
  participantRole: string;
  participantCompany: string;
  scheduledAt: string;
  moderator: string;
  observerCount: number;
  duration: string;
  status: WorkspaceSessionStatus;
  recordingStatus: WorkspaceRecordingStatus;
  summary: string;
  participantOverview: string;
  keyObservations: string[];
  transcript: WorkspaceTranscriptLine[];
  highlights: WorkspaceHighlight[];
}

export const WORKSPACE_SESSION_STATUS_LABELS: Record<WorkspaceSessionStatus, string> = {
  scheduled: 'Scheduled',
  live: 'Live',
  completed: 'Completed',
  processing: 'Processing',
  cancelled: 'Cancelled',
};

export const WORKSPACE_RECORDING_STATUS_LABELS: Record<WorkspaceRecordingStatus, string> = {
  ready: 'Recording ready',
  uploading: 'Uploading',
  'not-started': 'Not started',
};

export const MOCK_MODERATED_WORKSPACE_SESSIONS: ModeratedWorkspaceSession[] = [
  {
    id: 'ws-session-001',
    studyId: 'idi-001',
    participantName: 'Nina Kapoor',
    participantRole: 'Director of Customer Operations',
    participantCompany: 'AsterCloud',
    scheduledAt: '2026-05-14T10:00:00.000+05:30',
    moderator: 'Amara Shah',
    observerCount: 2,
    duration: '30:00',
    status: 'live',
    recordingStatus: 'ready',
    summary:
      'Nina described onboarding as a sequence of confidence checks. The strongest friction appears when admins have to decide whether a recommendation is safe to apply across multiple teams.',
    participantOverview:
      'Enterprise admin responsible for onboarding regional teams and maintaining workflow governance across 400+ users.',
    keyObservations: [
      'Trust depends on seeing why a recommendation was generated.',
      'Admins want a reversible path before applying workflow-wide changes.',
      'Setup feels manageable until cross-team permissions become visible.',
    ],
    transcript: [
      {
        id: 'tr-001-001',
        timestamp: '00:12',
        speaker: 'Moderator',
        text: 'Tell me about how your team currently evaluates workflow recommendations during onboarding.',
      },
      {
        id: 'tr-001-002',
        timestamp: '00:28',
        speaker: 'Participant',
        text: 'We usually pause and ask who else has used it. The recommendation can look helpful, but we need to understand the impact before we apply it.',
      },
      {
        id: 'tr-001-003',
        timestamp: '02:10',
        speaker: 'Moderator',
        text: 'What kind of evidence would make that recommendation easier to trust?',
      },
      {
        id: 'tr-001-004',
        timestamp: '02:24',
        speaker: 'Participant',
        text: 'A short explanation and a preview. If I can see which teams are affected and how to undo it, I am much more comfortable moving forward.',
      },
      {
        id: 'tr-001-005',
        timestamp: '07:48',
        speaker: 'Participant',
        text: 'The first week is not about speed for us. It is about not making a mistake that creates support tickets for everyone else.',
      },
      {
        id: 'tr-001-006',
        timestamp: '13:36',
        speaker: 'Moderator',
        text: 'Where does the setup process start to feel uncertain?',
      },
      {
        id: 'tr-001-007',
        timestamp: '13:51',
        speaker: 'Participant',
        text: 'Permissions. The language becomes more technical, and I am not always sure whether I am configuring a workspace default or just my own view.',
      },
    ],
    highlights: [
      {
        id: 'hl-001-001',
        timestamp: '02:24',
        title: 'Trust requires preview and reversibility',
        quote:
          'If I can see which teams are affected and how to undo it, I am much more comfortable moving forward.',
        observation: 'Recommendation confidence is tied to impact visibility, not only explanation quality.',
      },
      {
        id: 'hl-001-002',
        timestamp: '07:48',
        title: 'Onboarding success is risk reduction',
        quote:
          'The first week is not about speed for us. It is about not making a mistake that creates support tickets.',
        observation: 'Speed-focused onboarding metrics may miss the admin need for controlled rollout.',
      },
    ],
  },
  {
    id: 'ws-session-002',
    studyId: 'idi-001',
    participantName: 'Daniel Weber',
    participantRole: 'VP, Revenue Operations',
    participantCompany: 'Northstar Systems',
    scheduledAt: '2026-05-14T14:30:00.000+05:30',
    moderator: 'Lena Hoffman',
    observerCount: 1,
    duration: '28:42',
    status: 'scheduled',
    recordingStatus: 'not-started',
    summary:
      'Daniel is expected to focus on recommendation governance and rollout confidence for revenue teams.',
    participantOverview:
      'Revenue operations leader managing onboarding templates for sales, success, and implementation teams.',
    keyObservations: [
      'Pre-session notes indicate high sensitivity to cross-functional workflow changes.',
      'Participant has recently consolidated team onboarding playbooks.',
      'Moderator should probe on approval flows and team-level ownership.',
    ],
    transcript: [
      {
        id: 'tr-002-001',
        timestamp: '00:00',
        speaker: 'Moderator',
        text: 'Transcript will appear here after the session recording is processed.',
      },
    ],
    highlights: [
      {
        id: 'hl-002-001',
        timestamp: 'Pre-session',
        title: 'Probe on governance',
        quote: 'Ask how revenue teams decide which onboarding recommendations become team defaults.',
        observation: 'This participant can clarify decision ownership across revenue functions.',
      },
    ],
  },
  {
    id: 'ws-session-003',
    studyId: 'idi-001',
    participantName: 'Mei Tan',
    participantRole: 'Senior Implementation Manager',
    participantCompany: 'OrbitOps',
    scheduledAt: '2026-05-14T17:00:00.000+05:30',
    moderator: 'Priya Nair',
    observerCount: 3,
    duration: '31:18',
    status: 'processing',
    recordingStatus: 'uploading',
    summary:
      'Mei emphasized that onboarding recommendations need to fit implementation context. She distinguished between generic best practices and setup guidance that reflects customer maturity.',
    participantOverview:
      'Implementation manager who has led enterprise onboarding programs for finance and operations teams.',
    keyObservations: [
      'Generic recommendations are useful only when paired with customer context.',
      'Implementation teams want room to adapt the guide without losing the original rationale.',
      'Maturity level changes which setup tasks feel urgent.',
    ],
    transcript: [
      {
        id: 'tr-003-001',
        timestamp: '01:04',
        speaker: 'Moderator',
        text: 'When does a recommendation feel genuinely useful during implementation?',
      },
      {
        id: 'tr-003-002',
        timestamp: '01:22',
        speaker: 'Participant',
        text: 'When it acknowledges where the customer is. A mature operations team needs a different path than someone setting up their first workflow.',
      },
      {
        id: 'tr-003-003',
        timestamp: '05:49',
        speaker: 'Participant',
        text: 'I do not want the tool to decide for me. I want it to show a good starting point and let me adjust it with a reason attached.',
      },
    ],
    highlights: [
      {
        id: 'hl-003-001',
        timestamp: '01:22',
        title: 'Context changes recommendation value',
        quote:
          'A mature operations team needs a different path than someone setting up their first workflow.',
        observation: 'Recommendation quality is judged against customer maturity and implementation context.',
      },
      {
        id: 'hl-003-002',
        timestamp: '05:49',
        title: 'Assistive, not autonomous',
        quote:
          'I want it to show a good starting point and let me adjust it with a reason attached.',
        observation: 'Participants value AI assistance when it remains editable and preserves rationale.',
      },
    ],
  },
  {
    id: 'ws-session-004',
    studyId: 'idi-001',
    participantName: 'Sofia Alvarez',
    participantRole: 'Head of Customer Enablement',
    participantCompany: 'Brightline Health',
    scheduledAt: '2026-05-15T09:30:00.000+05:30',
    moderator: 'Amara Shah',
    observerCount: 2,
    duration: '30:00',
    status: 'scheduled',
    recordingStatus: 'not-started',
    summary:
      'Sofia will help validate whether onboarding guidance works for regulated teams with strict enablement governance.',
    participantOverview:
      'Enablement leader responsible for admin education and customer onboarding in healthcare operations.',
    keyObservations: [
      'Session should explore compliance language in onboarding recommendations.',
      'Ask where enablement teams need templates versus decision support.',
      'Probe on stakeholder review before publishing workspace changes.',
    ],
    transcript: [
      {
        id: 'tr-004-001',
        timestamp: '00:00',
        speaker: 'Moderator',
        text: 'Transcript will appear here after the session recording is processed.',
      },
    ],
    highlights: [
      {
        id: 'hl-004-001',
        timestamp: 'Pre-session',
        title: 'Probe on regulated workflows',
        quote: 'Explore how healthcare teams review and approve recommended setup changes.',
        observation: 'This session can reveal how governance affects onboarding confidence.',
      },
    ],
  },
  {
    id: 'ws-session-005',
    studyId: 'idi-001',
    participantName: 'Farhan Khan',
    participantRole: 'IT Onboarding Lead',
    participantCompany: 'Meridian Health Group',
    scheduledAt: '2026-05-12T18:00:00.000+05:30',
    moderator: 'Priya Nair',
    observerCount: 0,
    duration: '07:22',
    status: 'completed',
    recordingStatus: 'ready',
    summary:
      "Farhan's session ran during a layover, so much of the conversation centered on confirming logistics rather than deep product feedback. He surfaced two clear signals: the language toggle needs to be visible earlier in setup, and location-based defaults caused early confusion for his multi-country team.",
    participantOverview:
      'IT onboarding lead rolling out workspace setup across regional offices for a multi-country healthcare network.',
    keyObservations: [
      'Language settings need to be visible earlier in the onboarding flow, not buried in advanced settings.',
      'Location-based defaults created early confusion for teams spanning multiple countries.',
      'Session context (in transit) limited the depth of product feedback captured.',
    ],
    transcript: [
      {
        id: 'tr-005-001',
        timestamp: '00:00',
        speaker: 'Moderator',
        text: 'Thanks for making time between flights. Can you confirm you can hear me okay before we start?',
      },
      {
        id: 'tr-005-002',
        timestamp: '00:14',
        speaker: 'Participant',
        text: "Yes, loud and clear. I'm at the gate, so I'll flag if boarding starts.",
      },
      {
        id: 'tr-005-003',
        timestamp: '01:05',
        speaker: 'Moderator',
        text: 'No problem. Let\u2019s start with the language settings during setup. How did that go for your team?',
      },
      {
        id: 'tr-005-004',
        timestamp: '01:22',
        speaker: 'Participant',
        text: "It's like skipping straight to the last chapter of a book and missing why anything happened. By the time I found the language toggle buried in advanced settings, I'd already set up half my team wrong.",
      },
      {
        id: 'tr-005-005',
        timestamp: '03:40',
        speaker: 'Moderator',
        text: 'Got it. What about the location-based defaults \u2014 did those cause any confusion?',
      },
      {
        id: 'tr-005-006',
        timestamp: '03:58',
        speaker: 'Participant',
        text: 'Some. Our offices span three countries, and the defaults assumed everyone was in one region. We had to manually correct it for two sites.',
      },
      {
        id: 'tr-005-007',
        timestamp: '06:10',
        speaker: 'Moderator',
        text: 'Last question \u2014 any recommendations for how onboarding could work better for a team like yours?',
      },
      {
        id: 'tr-005-008',
        timestamp: '06:28',
        speaker: 'Participant',
        text: "Actually, I've been reading a book on managing distributed teams, and it breaks everything into small chapters you can absorb in five minutes. I wish workspace setup worked the same way instead of one long form.",
      },
    ],
    highlights: [
      {
        id: 'hl-005-001',
        timestamp: '01:22',
        title: 'Buried language toggle causes early missteps',
        quote:
          "By the time I found the language toggle buried in advanced settings, I'd already set up half my team wrong.",
        observation: 'Language settings need to surface earlier in setup, not inside advanced settings.',
      },
      {
        id: 'hl-005-002',
        timestamp: '06:28',
        title: 'Onboarding should read like a well-structured book',
        quote: 'It breaks everything into small chapters you can absorb in five minutes.',
        observation: 'Chunked, chapter-style onboarding may reduce setup fatigue for busy admins.',
      },
    ],
  },
];
