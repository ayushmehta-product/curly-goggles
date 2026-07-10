export interface DiscussionTopic {
  id: string;
  title: string;
  questions: string[];
}

export const DEFAULT_INTRO_GREETING =
  "Thanks so much for joining today. This session will run about an hour and we'll be discussing your recent shopping experiences. There are no right or wrong answers — we want to hear your honest reactions. With your permission, we'll record this session for internal research purposes only.";

export const INITIAL_DISCUSSION_TOPICS: DiscussionTopic[] = [
  {
    id: 'topic-first-impressions',
    title: 'First impressions of the new checkout flow',
    questions: [
      'What was your first reaction when you saw this checkout screen?',
      'Is anything confusing or unexpected on this page?',
    ],
  },
  {
    id: 'topic-trust-signals',
    title: 'Trust and security signals',
    questions: [
      'What would make you feel confident entering payment details here?',
      'Have you ever abandoned a purchase because a checkout page felt untrustworthy?',
    ],
  },
  {
    id: 'topic-pricing-clarity',
    title: 'Pricing and fee transparency',
    questions: ['Are the total cost and any added fees clear before you check out?'],
  },
];
