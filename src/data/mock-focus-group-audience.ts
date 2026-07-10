export type ScreenerType = 'technical' | 'verbal-response' | 'survey-question';

export interface ScreenerItem {
  id: string;
  type: ScreenerType;
  prompt: string;
}

export const SCREENER_TYPE_LABELS: Record<ScreenerType, string> = {
  technical: 'Technical check',
  'verbal-response': 'Verbal response',
  'survey-question': 'Survey question',
};

export const SCREENER_TYPE_DESCRIPTIONS: Record<ScreenerType, string> = {
  technical: 'Confirms camera, mic, and connection quality before the session.',
  'verbal-response': 'Participant records a short spoken answer used to gauge articulateness.',
  'survey-question': 'A written multiple-choice or open text question used to qualify participants.',
};

export const INITIAL_SCREENER_ITEMS: ScreenerItem[] = [
  {
    id: 'screener-device-check',
    type: 'technical',
    prompt: 'Confirm you can join from a laptop or desktop with a working camera and microphone.',
  },
  {
    id: 'screener-comfort-speaking',
    type: 'verbal-response',
    prompt: 'In 30 seconds, tell us about the last time you compared prices while shopping online.',
  },
  {
    id: 'screener-usage-frequency',
    type: 'survey-question',
    prompt: 'How often do you complete an online purchase on a mobile device?',
  },
];
