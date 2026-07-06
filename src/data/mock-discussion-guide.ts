export interface DiscussionGuideQuestion {
  id: string;
  question: string;
  probes: string[];
  moderatorNotes: string;
  durationMinutes: number;
  isExpanded: boolean;
}

export interface DiscussionGuideSection {
  id: string;
  title: string;
  targetMinutes: number;
  isExpanded: boolean;
  questions: DiscussionGuideQuestion[];
}

export const CONFIGURED_SESSION_DURATION_MINUTES = 30;

export const MOCK_DISCUSSION_GUIDE_SECTIONS: DiscussionGuideSection[] = [
  {
    id: 'section-introduction',
    title: 'Introduction',
    targetMinutes: 3,
    isExpanded: true,
    questions: [
      {
        id: 'question-intro-1',
        question:
          'Before we begin, could you briefly share your role and how you typically work with internal workflow tools?',
        probes: ['What systems do you touch most often?', 'How long have you been in this role?'],
        moderatorNotes:
          'Confirm consent, recording comfort, and remind the participant there are no right or wrong answers.',
        durationMinutes: 3,
        isExpanded: false,
      },
    ],
  },
  {
    id: 'section-warm-up',
    title: 'Warm-up',
    targetMinutes: 5,
    isExpanded: true,
    questions: [
      {
        id: 'question-warmup-1',
        question: 'Walk me through the last time you had to prepare for a customer workflow review.',
        probes: ['What triggered the review?', 'Who else was involved?', 'What information did you need?'],
        moderatorNotes: 'Keep this conversational. Listen for current process language and handoff points.',
        durationMinutes: 5,
        isExpanded: false,
      },
    ],
  },
  {
    id: 'section-core-topics',
    title: 'Core Topics',
    targetMinutes: 17,
    isExpanded: true,
    questions: [
      {
        id: 'question-core-1',
        question: 'When you compare workflow options, what signals help you decide which path is best?',
        probes: ['What stood out most?', 'What trade-offs matter most?', 'What would make you hesitate?'],
        moderatorNotes: 'Probe for evaluation criteria, confidence signals, and moments of uncertainty.',
        durationMinutes: 7,
        isExpanded: true,
      },
      {
        id: 'question-core-2',
        question: 'Show me how you would explain this workflow recommendation to a stakeholder.',
        probes: ['What evidence would you include?', 'What objections would you expect?'],
        moderatorNotes: 'Ask participant to narrate their thinking. Capture exact phrases used for stakeholder framing.',
        durationMinutes: 7,
        isExpanded: false,
      },
      {
        id: 'question-core-3',
        question: 'What would make this workflow feel easier to trust or act on?',
        probes: ['What confused you?', 'What would you change?', 'What information is missing?'],
        moderatorNotes: 'Prioritize concrete improvement ideas over general satisfaction ratings.',
        durationMinutes: 5,
        isExpanded: false,
      },
    ],
  },
  {
    id: 'section-wrap-up',
    title: 'Wrap-up',
    targetMinutes: 5,
    isExpanded: true,
    questions: [
      {
        id: 'question-wrapup-1',
        question: 'Is there anything important about this workflow that we did not cover today?',
        probes: ['What should our team pay closer attention to?', 'Who else should we learn from?'],
        moderatorNotes: 'Reserve final minutes for open feedback and participant follow-up permission.',
        durationMinutes: 4,
        isExpanded: false,
      },
    ],
  },
];

export const SUGGESTED_PROBES = [
  'What stood out most?',
  'What were you expecting?',
  'How did that make you feel?',
  'What would you change?',
  'What confused you?',
  'Can you tell me more?',
  'What frustrated you most?',
  'What happened next?',
];
