export type FocusGroupRecordingStatus = 'ready' | 'uploading' | 'not-started';

export type SessionThemeColor = 'yellow' | 'green' | 'pink' | 'blue';

export interface SessionTheme {
  id: string;
  label: string;
  color: SessionThemeColor;
  startSeconds: number;
  endSeconds: number;
}

export interface SessionAnnotation {
  id: string;
  timestampSeconds: number;
  timestampLabel: string;
  note: string;
  author: string;
}

export interface FocusGroupTranscriptLine {
  id: string;
  timestampSeconds: number;
  timestampLabel: string;
  speaker: string;
  text: string;
}

export interface SessionIndexEntry {
  id: string;
  label: string;
  timestampSeconds: number;
  timestampLabel: string;
}

export interface FocusGroupSession {
  focusGroupId: string;
  moderator: string;
  durationSeconds: number;
  recordingStatus: FocusGroupRecordingStatus;
  /** Footer timestamp shown under the player. */
  recordedAt?: string;
  summary: string;
  keyTakeaways: string[];
  themes: SessionTheme[];
  annotations: SessionAnnotation[];
  transcript: FocusGroupTranscriptLine[];
  index: SessionIndexEntry[];
  participantRoster: string[];
}

export const THEME_BAR_STYLES: Record<SessionThemeColor, string> = {
  yellow: 'bg-amber-400',
  green: 'bg-green-500',
  pink: 'bg-pink-400',
  blue: 'bg-blue-500',
};

export const THEME_PROGRESS_BAR_STYLES: Record<SessionThemeColor, string> = {
  yellow: 'bg-amber-400',
  green: 'bg-green-400',
  pink: 'bg-pink-400',
  blue: 'bg-blue-400',
};

export const MOCK_FOCUS_GROUP_SESSIONS: FocusGroupSession[] = [
  {
    focusGroupId: 'fg-001',
    moderator: 'Amara Shah',
    durationSeconds: 2760,
    recordingStatus: 'ready',
    recordedAt: '2026-07-16T15:52:00.000+05:30',
    summary:
      'The group anchored checkout trust to how visibly the new flow explained itself, comparing it more than once to how they choose what to buy or read based on reviews rather than marketing. Nina Kapoor in particular drew a direct parallel between skimming negative product reviews before a purchase and wanting the same skepticism built into the checkout confirmation step. Daniel Weber and Mei Tan agreed that speed mattered less than a clear, reversible confirmation before payment was captured.',
    keyTakeaways: [
      'Participants compare checkout trust signals to how they evaluate other purchases, like reading reviews before buying.',
      'Negative reviews and skepticism carry more weight than positive marketing when the group decides whether to trust a new flow.',
      'Speed matters less than a clear, reversible confirmation step before payment is captured.',
    ],
    themes: [{ id: 'theme-fg-001-1', label: 'Trust Through Skepticism', color: 'blue', startSeconds: 0, endSeconds: 1200 }],
    annotations: [],
    index: [
      { id: 'idx-fg-001-0', label: 'Introduction and ground rules', timestampSeconds: 0, timestampLabel: '00:00' },
      { id: 'idx-fg-001-1', label: 'First reactions to the new checkout flow', timestampSeconds: 62, timestampLabel: '01:02' },
      { id: 'idx-fg-001-2', label: 'Comparing checkout trust to everyday purchase habits', timestampSeconds: 118, timestampLabel: '01:58' },
      { id: 'idx-fg-001-3', label: 'Confirmation step expectations', timestampSeconds: 305, timestampLabel: '05:05' },
    ],
    participantRoster: ['Nina Kapoor', 'Daniel Weber', 'Mei Tan'],
    transcript: [
      {
        id: 'tr-fg-001-001',
        timestampSeconds: 62,
        timestampLabel: '01:02',
        speaker: 'Moderator',
        text: 'Walk me through your first reaction when you saw the redesigned checkout flow.',
      },
      {
        id: 'tr-fg-001-002',
        timestampSeconds: 88,
        timestampLabel: '01:28',
        speaker: 'Nina Kapoor',
        text: 'It looked cleaner, but I did not trust it right away. I wanted to see why it was recommending the default shipping option before I clicked through.',
      },
      {
        id: 'tr-fg-001-003',
        timestampSeconds: 118,
        timestampLabel: '01:58',
        speaker: 'Nina Kapoor',
        text: 'Honestly, it is like buying a book online. I read the negative reviews first, not the positive ones, because that is where I find out what actually goes wrong.',
      },
      {
        id: 'tr-fg-001-004',
        timestampSeconds: 156,
        timestampLabel: '02:36',
        speaker: 'Daniel Weber',
        text: 'Same instinct here. I skim for the complaints before I trust a five-star rating.',
      },
      {
        id: 'tr-fg-001-005',
        timestampSeconds: 210,
        timestampLabel: '03:30',
        speaker: 'Mei Tan',
        text: 'For me it is less about reviews and more about being able to undo something. If checkout confirms before charging me, I relax a bit.',
      },
      {
        id: 'tr-fg-001-006',
        timestampSeconds: 305,
        timestampLabel: '05:05',
        speaker: 'Nina Kapoor',
        text: 'Right, that confirmation screen is the equivalent of reading the last chapter of a book before deciding to commit to the whole story. I want to know the ending is safe first.',
      },
      {
        id: 'tr-fg-001-007',
        timestampSeconds: 340,
        timestampLabel: '05:40',
        speaker: 'Moderator',
        text: 'That is a helpful comparison. What would make that confirmation step feel trustworthy enough to skip in the future?',
      },
      {
        id: 'tr-fg-001-008',
        timestampSeconds: 362,
        timestampLabel: '06:02',
        speaker: 'Daniel Weber',
        text: 'A track record. After a few clean checkouts, I would stop double-checking every field, the same way I stop reading reviews for a brand I already trust.',
      },
    ],
  },
  {
    focusGroupId: 'fg-002',
    moderator: 'Lena Hoffman',
    durationSeconds: 2700,
    recordingStatus: 'not-started',
    summary:
      'This session has not started yet. Once it runs, the recording, AI summary, and transcript will appear here automatically.',
    keyTakeaways: [
      'Pre-session notes: focus on how the recommendation feed changes binge-watching habits.',
      'Ask about trust in autoplay suggestions versus manually chosen titles.',
    ],
    themes: [],
    annotations: [],
    index: [],
    participantRoster: ['Arjun Kulkarni', 'Isabella Novak', 'Kenji Sato', 'Grace Adeyemi', 'Lucas Meyer', 'Amelia Foster'],
    transcript: [
      {
        id: 'tr-fg-002-000',
        timestampSeconds: 0,
        timestampLabel: '00:00',
        speaker: 'Moderator',
        text: 'Transcript will appear here once the session has been recorded and processed.',
      },
    ],
  },
  {
    focusGroupId: 'fg-004',
    moderator: 'Sofia Alvarez',
    durationSeconds: 3504,
    recordingStatus: 'ready',
    recordedAt: '2026-06-18T17:18:24.000+05:30',
    summary:
      'The group converged quickly on payroll trust hinging on visible audit trails rather than raw automation speed. Participants repeatedly contrasted "black box" payroll runs with tools that show exactly what changed and why before money moves. Several owners described a phased trust model: heavy manual review for the first few payroll cycles, then gradually relaxing oversight once the tool proved reliable. The conversation surfaced strong emotional weight around error recovery — participants cared less about how fast payroll ran on a good day and far more about what happened when something went wrong. Moderators noted recurring language around "seeing the math" and "knowing who approved what" as non-negotiable trust signals. By the end of the session, the group agreed that transparency features (changelog, diff view, approval history) were more persuasive than marketing claims about automation or AI. This pattern held across participants with different business sizes, suggesting audit visibility may be a universal onboarding requirement rather than a power-user feature.',
    keyTakeaways: [
      'Trust in payroll automation depends on a visible, reviewable audit trail before funds are released.',
      'Owners want a manual review step for the first few runs, then are comfortable easing off it.',
      'Error recovery stories dominate word-of-mouth reputation more than any feature comparison.',
      'Participants consistently asked for a diff-style changelog showing what changed since the last run.',
      'Approval history (who signed off, when) was cited as important for multi-person small businesses.',
    ],
    themes: [
      { id: 'theme-fg-004-1', label: 'Movie vs Book', color: 'yellow', startSeconds: 0, endSeconds: 620 },
      { id: 'theme-fg-004-2', label: 'Backstory Explanation', color: 'green', startSeconds: 470, endSeconds: 1400 },
      { id: 'theme-fg-004-3', label: 'Commercialization Critique', color: 'pink', startSeconds: 1360, endSeconds: 2100 },
    ],
    index: [
      { id: 'idx-fg-004-0', label: 'Introduction and ground rules', timestampSeconds: 0, timestampLabel: '00:00' },
      { id: 'idx-fg-004-1', label: 'First reactions to payroll automation', timestampSeconds: 74, timestampLabel: '01:14' },
      { id: 'idx-fg-004-2', label: 'First-run review expectations', timestampSeconds: 112, timestampLabel: '01:52' },
      { id: 'idx-fg-004-3', label: 'Audit trail and changelog discussion', timestampSeconds: 483, timestampLabel: '08:03' },
      { id: 'idx-fg-004-4', label: 'Real mistake caught by review screen', timestampSeconds: 514, timestampLabel: '08:34' },
      { id: 'idx-fg-004-5', label: 'Word-of-mouth and vendor reputation', timestampSeconds: 1367, timestampLabel: '22:47' },
      { id: 'idx-fg-004-6', label: 'Long-term trust and reduced oversight', timestampSeconds: 1870, timestampLabel: '31:10' },
      { id: 'idx-fg-004-7', label: 'Wrap-up and closing thoughts', timestampSeconds: 3200, timestampLabel: '53:20' },
    ],
    annotations: [
      {
        id: 'an-fg-004-1',
        timestampSeconds: 112,
        timestampLabel: '01:52',
        note: 'Strong quote on wanting a review window before trusting automation \u2014 good pull-quote candidate.',
        author: 'Sofia Alvarez',
      },
      {
        id: 'an-fg-004-2',
        timestampSeconds: 514,
        timestampLabel: '08:34',
        note: 'Concrete story about the audit trail catching a doubled contractor rate. Flag for highlight reel.',
        author: 'Sofia Alvarez',
      },
      {
        id: 'an-fg-004-3',
        timestampSeconds: 1367,
        timestampLabel: '22:47',
        note: 'Future consideration: ask follow-up studies whether error recovery outweighs speed in vendor selection.',
        author: 'Elena Rossi',
      },
    ],
    participantRoster: ['Farid Bashir', 'Grace Liu', 'Tomas Novak', 'Aaliyah Brooks', 'Samuel Osei', 'Rina Kapoor'],
    transcript: [
      {
        id: 'tr-fg-004-001',
        timestampSeconds: 74,
        timestampLabel: '01:14',
        speaker: 'Moderator',
        text: 'When you hear "automated payroll," what is the first concern that comes to mind?',
      },
      {
        id: 'tr-fg-004-002',
        timestampSeconds: 89,
        timestampLabel: '01:29',
        speaker: 'Farid Bashir',
        text: 'Honestly, whether it will just run and take money out before I have a chance to catch a mistake.',
      },
      {
        id: 'tr-fg-004-003',
        timestampSeconds: 112,
        timestampLabel: '01:52',
        speaker: 'Grace Liu',
        text: 'Same. I do not need it to be manual forever, but the first couple of runs I want to see every line before it submits.',
      },
      {
        id: 'tr-fg-004-004',
        timestampSeconds: 483,
        timestampLabel: '08:03',
        speaker: 'Tomas Novak',
        text: 'What made me trust our current tool was a changelog. It shows exactly what changed since the last run and who approved it.',
      },
      {
        id: 'tr-fg-004-005',
        timestampSeconds: 501,
        timestampLabel: '08:21',
        speaker: 'Moderator',
        text: 'Has that changelog ever caught a mistake before it went out?',
      },
      {
        id: 'tr-fg-004-006',
        timestampSeconds: 514,
        timestampLabel: '08:34',
        speaker: 'Tomas Novak',
        text: 'Once, yes. A contractor rate had doubled from a bad import. I would not have noticed without that review screen.',
      },
      {
        id: 'tr-fg-004-007',
        timestampSeconds: 1367,
        timestampLabel: '22:47',
        speaker: 'Aaliyah Brooks',
        text: 'I tell other small business owners about payroll tools based on how they handled my mistake, not how fast they usually run.',
      },
      {
        id: 'tr-fg-004-008',
        timestampSeconds: 1870,
        timestampLabel: '31:10',
        speaker: 'Samuel Osei',
        text: 'After a year of clean runs I stopped reviewing every line. Now I just skim the total and the audit summary.',
      },
    ],
  },
];
