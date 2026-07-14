export type PostSessionQuestionType =
  | 'free-response'
  | 'single-select'
  | 'multi-select'
  | 'rating-scale'
  | 'yes-no';

export interface PostSessionChoice {
  id: string;
  text: string;
}

export interface PostSessionQuestion {
  id: string;
  type: PostSessionQuestionType;
  prompt: string;
  choices?: PostSessionChoice[];
  ratingMin?: number;
  ratingMax?: number;
  ratingMinLabel?: string;
  ratingMaxLabel?: string;
}

export const POST_SESSION_QUESTION_TYPE_OPTIONS: { value: PostSessionQuestionType; label: string }[] = [
  { value: 'free-response', label: 'Free response' },
  { value: 'single-select', label: 'Single select' },
  { value: 'multi-select', label: 'Multi select' },
  { value: 'rating-scale', label: 'Rating scale' },
  { value: 'yes-no', label: 'Yes / No' },
];

function makeChoiceId() {
  return `choice-${Math.random().toString(36).slice(2, 8)}`;
}

export const DEFAULT_CHOICES: PostSessionChoice[] = [
  { id: makeChoiceId(), text: '' },
  { id: makeChoiceId(), text: '' },
];

export const INITIAL_POST_SESSION_QUESTIONS: PostSessionQuestion[] = [
  {
    id: 'post-question-overall',
    type: 'rating-scale',
    prompt: 'Overall, how satisfied are you with today\u2019s discussion?',
    ratingMin: 1,
    ratingMax: 5,
    ratingMinLabel: 'Not satisfied',
    ratingMaxLabel: 'Very satisfied',
  },
  {
    id: 'post-question-recommend',
    type: 'single-select',
    prompt: 'Would you recommend participating in a session like this to a colleague?',
    choices: [
      { id: makeChoiceId(), text: 'Yes, definitely' },
      { id: makeChoiceId(), text: 'Maybe' },
      { id: makeChoiceId(), text: 'No' },
    ],
  },
  {
    id: 'post-question-anything-else',
    type: 'free-response',
    prompt: 'Is there anything you wanted to share but didn\u2019t get the chance to during the session?',
  },
];
