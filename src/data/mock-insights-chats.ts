import type { ChatThread } from '@/components/insights-chat/chat-types';

export const MOCK_INSIGHTS_CHAT_THREADS: ChatThread[] = [
  {
    id: 'chat-001',
    title: 'Thematic analysis for Farhan Khan',
    scopeLabel: 'Farhan Khan · Enterprise Onboarding Friction Study',
    createdAt: '2026-08-10T09:15:00.000+05:30',
    updatedAt: '2026-08-10T09:18:00.000+05:30',
    messages: [
      { id: 'chat-001-m1', role: 'user', promptLabel: 'Do a thematic analysis of this video' },
      {
        id: 'chat-001-m2',
        role: 'assistant',
        response: {
          kind: 'thematic',
          intro: 'Identified 2 recurring themes across the transcript:',
          themes: [
            {
              title: 'Language',
              quotes: [
                {
                  timestamp: '01:22',
                  speaker: 'Participant',
                  text: "By the time I found the language toggle buried in advanced settings, I'd already set up half my team wrong.",
                },
              ],
            },
            {
              title: 'Settings',
              quotes: [
                {
                  timestamp: '03:58',
                  speaker: 'Participant',
                  text: 'Our offices span three countries, and the defaults assumed everyone was in one region.',
                },
              ],
            },
          ],
        },
      },
    ],
  },
  {
    id: 'chat-002',
    title: 'Books moments for Nina Kapoor',
    scopeLabel: 'Nina Kapoor · Checkout Redesign Reaction Group',
    createdAt: '2026-08-08T14:40:00.000+05:30',
    updatedAt: '2026-08-08T14:42:00.000+05:30',
    messages: [
      {
        id: 'chat-002-m1',
        role: 'user',
        promptLabel: 'Show moments and gives quotes for whenever the participant talked about books',
      },
      {
        id: 'chat-002-m2',
        role: 'assistant',
        response: {
          kind: 'quotes',
          intro: 'Found 2 moments mentioning "book":',
          quotes: [
            {
              timestamp: '01:58',
              speaker: 'Nina Kapoor',
              text: 'Honestly, it is like buying a book online. I read the negative reviews first, not the positive ones.',
            },
            {
              timestamp: '05:05',
              speaker: 'Nina Kapoor',
              text: 'That confirmation screen is the equivalent of reading the last chapter of a book before deciding to commit.',
            },
          ],
        },
      },
    ],
  },
  {
    id: 'chat-003',
    title: 'Study-level summary for Enterprise Onboarding',
    scopeLabel: 'Enterprise Onboarding Friction Study',
    createdAt: '2026-08-05T11:05:00.000+05:30',
    updatedAt: '2026-08-05T11:07:00.000+05:30',
    messages: [
      { id: 'chat-003-m1', role: 'user', promptLabel: 'Give me a study-level summary' },
      {
        id: 'chat-003-m2',
        role: 'assistant',
        response: {
          kind: 'rollup',
          intro: 'Study-level summary for Enterprise Onboarding Friction Study across 5 sessions:',
          items: [
            {
              label: 'Nina Kapoor',
              detail:
                'Trust depends on seeing why a recommendation was generated and having a reversible path before applying workflow-wide changes.',
            },
            {
              label: 'Mei Tan',
              detail:
                'Onboarding recommendations need to fit implementation context rather than generic best practices.',
            },
            {
              label: 'Farhan Khan',
              detail:
                "Farhan's session ran during a layover; language settings and location defaults were the clearest signals captured.",
            },
          ],
        },
      },
    ],
  },
  {
    id: 'chat-004',
    title: 'Active studies overview',
    scopeLabel: 'your projects',
    createdAt: '2026-08-01T16:20:00.000+05:30',
    updatedAt: '2026-08-01T16:21:00.000+05:30',
    messages: [
      { id: 'chat-004-m1', role: 'user', promptLabel: 'How many studies are currently active?' },
      {
        id: 'chat-004-m2',
        role: 'assistant',
        response: {
          kind: 'list',
          intro: 'Active study counts:',
          items: ['3 active interview studies', '2 focus groups in progress or scheduling'],
        },
      },
    ],
  },
  {
    id: 'chat-005',
    title: 'Word frequency across payroll focus group',
    scopeLabel: 'Small Business Payroll Trust Signals',
    createdAt: '2026-07-28T10:00:00.000+05:30',
    updatedAt: '2026-07-28T10:03:00.000+05:30',
    messages: [
      { id: 'chat-005-m1', role: 'user', promptLabel: 'Do a word frequency analysis across this discussion' },
      {
        id: 'chat-005-m2',
        role: 'assistant',
        response: {
          kind: 'word-frequency',
          intro: 'Top terms across 8 transcript lines:',
          entries: [
            { word: 'payroll', count: 4 },
            { word: 'review', count: 3 },
            { word: 'trust', count: 3 },
            { word: 'changelog', count: 2 },
            { word: 'mistake', count: 2 },
          ],
        },
      },
    ],
  },
  {
    id: 'chat-006',
    title: 'Top Tag Recommendations',
    scopeLabel: 'Enterprise Onboarding Friction Study',
    createdAt: '2026-08-18T11:00:00.000+05:30',
    updatedAt: '2026-08-18T11:02:00.000+05:30',
    messages: [
      {
        id: 'chat-006-m1',
        role: 'user',
        promptLabel: 'Recommend tags that capture the most relevant terms from these sessions',
      },
      {
        id: 'chat-006-m2',
        role: 'assistant',
        response: {
          kind: 'tags',
          intro: 'Suggested tags based on this transcript:',
          tags: [
            'Onboarding',
            'Language',
            'Settings',
            'Navigation',
            'Defaults',
            'Workflow',
          ],
          note: 'These tags reflect the most frequently recurring terms across 3 sessions — "onboarding" and "language" each appear with strong sentiment context. Review and remove any that don\'t match your coding scheme before saving.',
        },
      },
    ],
  },
];
