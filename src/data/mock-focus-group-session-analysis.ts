export type {
  FocusGroupRecordingStatus,
  FocusGroupTranscriptLine,
  SessionAnnotation,
  SessionIndexEntry,
  SessionTheme,
  SessionThemeColor,
} from '@/data/mock-focus-group-session';

export { THEME_PROGRESS_BAR_STYLES } from '@/data/mock-focus-group-session';

import { MOCK_FOCUS_GROUP_SESSIONS, type FocusGroupSession } from '@/data/mock-focus-group-session';

export interface FocusGroupScriptTopic {
  title: string;
  questions: string[];
}

/** Extended session record used by Overview and Analyze tabs (includes script metadata). */
export interface FocusGroupSessionAnalysis extends FocusGroupSession {
  scriptTopics: FocusGroupScriptTopic[];
}

const SCRIPT_TOPICS_BY_FOCUS_GROUP: Record<string, FocusGroupScriptTopic[]> = {
  'fg-001': [
    {
      title: 'First impressions of the new checkout flow',
      questions: [
        'What was your first reaction when you saw this checkout screen?',
        'Is anything confusing or unexpected on this page?',
      ],
    },
    {
      title: 'Trust and security signals',
      questions: ['What would make you feel confident entering payment details here?'],
    },
  ],
  'fg-002': [
    {
      title: 'Recommendation feed relevance',
      questions: ['How often do the suggested titles match what you actually want to watch?'],
    },
  ],
  'fg-004': [
    {
      title: 'First reactions to payroll automation',
      questions: [
        'When you hear "automated payroll," what is the first concern that comes to mind?',
        'How much oversight do you want during the first few runs?',
      ],
    },
    {
      title: 'Audit trail and trust',
      questions: [
        'What has made you trust (or distrust) a payroll tool in the past?',
        'Has an audit trail or changelog ever caught a mistake for you?',
      ],
    },
    {
      title: 'Word-of-mouth and reputation',
      questions: ['What do you tell other business owners about the payroll tools you have used?'],
    },
  ],
};

export const MOCK_FOCUS_GROUP_SESSION_ANALYSIS: FocusGroupSessionAnalysis[] = MOCK_FOCUS_GROUP_SESSIONS.map(
  (session) => ({
    ...session,
    scriptTopics: SCRIPT_TOPICS_BY_FOCUS_GROUP[session.focusGroupId] ?? [],
  })
);
