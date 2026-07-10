export type PostSessionQuestionType =
  | 'free-response'
  | 'single-select'
  | 'multi-select'
  | 'rating-scale'
  | 'yes-no';

export interface PostSessionQuestion {
  id: string;
  type: PostSessionQuestionType;
  prompt: string;
}

export const POST_SESSION_QUESTION_TYPE_OPTIONS: { value: PostSessionQuestionType; label: string }[] = [
  { value: 'free-response', label: 'Free response' },
  { value: 'single-select', label: 'Single select' },
  { value: 'multi-select', label: 'Multi select' },
  { value: 'rating-scale', label: 'Rating scale' },
  { value: 'yes-no', label: 'Yes / No' },
];

export const INITIAL_POST_SESSION_QUESTIONS: PostSessionQuestion[] = [
  {
    id: 'post-question-overall',
    type: 'rating-scale',
    prompt: 'Overall, how satisfied are you with today\u2019s discussion?',
  },
  {
    id: 'post-question-anything-else',
    type: 'free-response',
    prompt: 'Is there anything you wanted to share but didn\u2019t get the chance to during the session?',
  },
];
