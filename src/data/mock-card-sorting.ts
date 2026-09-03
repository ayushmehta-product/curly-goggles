export type CardSortKind = 'open' | 'closed' | 'hybrid';

export interface CardSortItem {
  id: string;
  label: string;
}

export interface CardSortingConfig {
  kind: CardSortKind;
  instructions: string;
  cards: CardSortItem[];
  categories: CardSortItem[];
  shuffleCards: boolean;
  shuffleCategories: boolean;
  allowIncomplete: boolean;
  requireRanking: boolean;
  maxCardsPerCategory: number | null;
}

export interface CardSortParticipantRow {
  id: string;
  name: string;
  groups: { category: string; cards: string[] }[];
  unsorted: string[];
  timeSeconds: number;
}

export interface CardCategoryAgreement {
  cardId: string;
  cardLabel: string;
  categories: { label: string; count: number; percent: number; avgRank?: number }[];
  topCategory: string;
  agreement: number;
}

export interface CardPairSimilarity {
  a: string;
  b: string;
  percent: number;
}

export interface CardSortingAnalysis {
  taskId: string;
  prompt: string;
  kind: CardSortKind;
  participantCount: number;
  avgTimeSeconds: number;
  unsortedRate: number;
  cards: CardSortItem[];
  categories: string[];
  agreement: CardCategoryAgreement[];
  similarity: CardPairSimilarity[];
  popularCategories: { label: string; count: number; percent: number }[];
  participants: CardSortParticipantRow[];
}

const DEFAULT_INSTRUCTIONS =
  'Organize these cards into groups that make sense to you. Group sizes can vary, and there is no set number of groups. If you are unsure about a card, leave it unsorted rather than placing it at random.';

function item(id: string, label: string): CardSortItem {
  return { id, label };
}

export const MOCK_CARD_SORT_CARDS: CardSortItem[] = [
  item('c-donuts', 'Donuts'),
  item('c-coffee', 'Coffee'),
  item('c-breakfast', 'Breakfast'),
  item('c-sandwiches', 'Sandwiches'),
  item('c-locator', 'Store locator'),
  item('c-hours', 'Hours'),
  item('c-perks', 'Join DD Perks'),
  item('c-gifts', 'Gift cards'),
  item('c-story', 'Our story'),
  item('c-careers', 'Careers'),
  item('c-pickup', 'Pickup'),
  item('c-delivery', 'Delivery'),
];

export const MOCK_CARD_SORT_CATEGORIES: CardSortItem[] = [
  item('cat-menu', 'Menu'),
  item('cat-locations', 'Locations'),
  item('cat-rewards', 'Rewards'),
  item('cat-about', 'About'),
  item('cat-order', 'Order'),
];

export function defaultCardSortingConfig(): CardSortingConfig {
  return {
    kind: 'open',
    instructions: DEFAULT_INSTRUCTIONS,
    cards: [],
    categories: [],
    shuffleCards: true,
    shuffleCategories: false,
    allowIncomplete: true,
    requireRanking: false,
    maxCardsPerCategory: null,
  };
}

export function demoCardSortingConfig(): CardSortingConfig {
  return {
    kind: 'closed',
    instructions: DEFAULT_INSTRUCTIONS,
    cards: MOCK_CARD_SORT_CARDS.map((card) => ({ ...card })),
    categories: MOCK_CARD_SORT_CATEGORIES.map((category) => ({ ...category })),
    shuffleCards: true,
    shuffleCategories: false,
    allowIncomplete: true,
    requireRanking: true,
    maxCardsPerCategory: null,
  };
}

export function cloneCardSortingConfig(config: CardSortingConfig): CardSortingConfig {
  return {
    ...config,
    cards: config.cards.map((card) => ({ ...card })),
    categories: config.categories.map((category) => ({ ...category })),
  };
}

export const MOCK_CARD_SORTING_ANALYSIS: CardSortingAnalysis = {
  taskId: 't012',
  prompt: 'Group these pages the way you would look for them on the site.',
  kind: 'closed',
  participantCount: 16,
  avgTimeSeconds: 142,
  unsortedRate: 6,
  cards: MOCK_CARD_SORT_CARDS,
  categories: MOCK_CARD_SORT_CATEGORIES.map((category) => category.label),
  agreement: [
    {
      cardId: 'c-donuts',
      cardLabel: 'Donuts',
      topCategory: 'Menu',
      agreement: 94,
      categories: [
        { label: 'Menu', count: 15, percent: 94, avgRank: 1.2 },
        { label: 'Order', count: 1, percent: 6, avgRank: 2.0 },
      ],
    },
    {
      cardId: 'c-coffee',
      cardLabel: 'Coffee',
      topCategory: 'Menu',
      agreement: 88,
      categories: [
        { label: 'Menu', count: 14, percent: 88, avgRank: 1.4 },
        { label: 'Order', count: 2, percent: 12, avgRank: 1.5 },
      ],
    },
    {
      cardId: 'c-breakfast',
      cardLabel: 'Breakfast',
      topCategory: 'Menu',
      agreement: 81,
      categories: [
        { label: 'Menu', count: 13, percent: 81, avgRank: 2.1 },
        { label: 'Order', count: 3, percent: 19, avgRank: 2.3 },
      ],
    },
    {
      cardId: 'c-sandwiches',
      cardLabel: 'Sandwiches',
      topCategory: 'Menu',
      agreement: 75,
      categories: [
        { label: 'Menu', count: 12, percent: 75, avgRank: 2.4 },
        { label: 'Order', count: 4, percent: 25, avgRank: 2.0 },
      ],
    },
    {
      cardId: 'c-locator',
      cardLabel: 'Store locator',
      topCategory: 'Locations',
      agreement: 94,
      categories: [
        { label: 'Locations', count: 15, percent: 94, avgRank: 1.1 },
        { label: 'About', count: 1, percent: 6, avgRank: 3.0 },
      ],
    },
    {
      cardId: 'c-hours',
      cardLabel: 'Hours',
      topCategory: 'Locations',
      agreement: 88,
      categories: [
        { label: 'Locations', count: 14, percent: 88, avgRank: 1.6 },
        { label: 'About', count: 2, percent: 12, avgRank: 2.0 },
      ],
    },
    {
      cardId: 'c-perks',
      cardLabel: 'Join DD Perks',
      topCategory: 'Rewards',
      agreement: 69,
      categories: [
        { label: 'Rewards', count: 11, percent: 69, avgRank: 1.3 },
        { label: 'Order', count: 3, percent: 19, avgRank: 3.0 },
        { label: 'About', count: 2, percent: 12, avgRank: 2.5 },
      ],
    },
    {
      cardId: 'c-gifts',
      cardLabel: 'Gift cards',
      topCategory: 'Rewards',
      agreement: 56,
      categories: [
        { label: 'Rewards', count: 9, percent: 56, avgRank: 1.8 },
        { label: 'Order', count: 5, percent: 31, avgRank: 2.2 },
        { label: 'Menu', count: 2, percent: 13, avgRank: 3.0 },
      ],
    },
    {
      cardId: 'c-story',
      cardLabel: 'Our story',
      topCategory: 'About',
      agreement: 88,
      categories: [{ label: 'About', count: 14, percent: 88, avgRank: 1.2 }, { label: 'Rewards', count: 2, percent: 12, avgRank: 3.0 }],
    },
    {
      cardId: 'c-careers',
      cardLabel: 'Careers',
      topCategory: 'About',
      agreement: 81,
      categories: [{ label: 'About', count: 13, percent: 81, avgRank: 1.7 }, { label: 'Locations', count: 3, percent: 19, avgRank: 3.0 }],
    },
    {
      cardId: 'c-pickup',
      cardLabel: 'Pickup',
      topCategory: 'Order',
      agreement: 75,
      categories: [
        { label: 'Order', count: 12, percent: 75, avgRank: 1.3 },
        { label: 'Locations', count: 3, percent: 19, avgRank: 2.7 },
        { label: 'Menu', count: 1, percent: 6, avgRank: 4.0 },
      ],
    },
    {
      cardId: 'c-delivery',
      cardLabel: 'Delivery',
      topCategory: 'Order',
      agreement: 81,
      categories: [
        { label: 'Order', count: 13, percent: 81, avgRank: 1.5 },
        { label: 'Menu', count: 2, percent: 13, avgRank: 3.5 },
        { label: 'Rewards', count: 1, percent: 6, avgRank: 4.0 },
      ],
    },
  ],
  similarity: [
    { a: 'Donuts', b: 'Coffee', percent: 88 },
    { a: 'Donuts', b: 'Breakfast', percent: 75 },
    { a: 'Coffee', b: 'Breakfast', percent: 69 },
    { a: 'Breakfast', b: 'Sandwiches', percent: 81 },
    { a: 'Store locator', b: 'Hours', percent: 94 },
    { a: 'Join DD Perks', b: 'Gift cards', percent: 56 },
    { a: 'Our story', b: 'Careers', percent: 81 },
    { a: 'Pickup', b: 'Delivery', percent: 88 },
    { a: 'Gift cards', b: 'Delivery', percent: 31 },
    { a: 'Coffee', b: 'Join DD Perks', percent: 25 },
  ],
  popularCategories: [
    { label: 'Menu', count: 16, percent: 100 },
    { label: 'Locations', count: 16, percent: 100 },
    { label: 'Order', count: 15, percent: 94 },
    { label: 'About', count: 15, percent: 94 },
    { label: 'Rewards', count: 14, percent: 88 },
  ],
  participants: [
    {
      id: 'p01',
      name: 'Amulya M.',
      timeSeconds: 118,
      unsorted: [],
      groups: [
        { category: 'Menu', cards: ['Donuts', 'Coffee', 'Breakfast', 'Sandwiches'] },
        { category: 'Locations', cards: ['Store locator', 'Hours'] },
        { category: 'Rewards', cards: ['Join DD Perks', 'Gift cards'] },
        { category: 'About', cards: ['Our story', 'Careers'] },
        { category: 'Order', cards: ['Pickup', 'Delivery'] },
      ],
    },
    {
      id: 'p02',
      name: 'Jordan P.',
      timeSeconds: 156,
      unsorted: [],
      groups: [
        { category: 'Menu', cards: ['Donuts', 'Coffee'] },
        { category: 'Order', cards: ['Breakfast', 'Sandwiches', 'Pickup', 'Delivery', 'Gift cards'] },
        { category: 'Locations', cards: ['Store locator', 'Hours'] },
        { category: 'Rewards', cards: ['Join DD Perks'] },
        { category: 'About', cards: ['Our story', 'Careers'] },
      ],
    },
    {
      id: 'p03',
      name: 'Priya K.',
      timeSeconds: 171,
      unsorted: ['Careers'],
      groups: [
        { category: 'Menu', cards: ['Donuts', 'Coffee', 'Breakfast', 'Sandwiches'] },
        { category: 'Locations', cards: ['Store locator', 'Hours'] },
        { category: 'Rewards', cards: ['Join DD Perks', 'Gift cards'] },
        { category: 'About', cards: ['Our story'] },
        { category: 'Order', cards: ['Pickup', 'Delivery'] },
      ],
    },
    {
      id: 'p04',
      name: 'Marcus W.',
      timeSeconds: 99,
      unsorted: [],
      groups: [
        { category: 'Menu', cards: ['Donuts', 'Coffee', 'Breakfast', 'Sandwiches'] },
        { category: 'Locations', cards: ['Store locator', 'Hours'] },
        { category: 'Rewards', cards: ['Join DD Perks', 'Gift cards'] },
        { category: 'About', cards: ['Our story', 'Careers'] },
        { category: 'Order', cards: ['Pickup', 'Delivery'] },
      ],
    },
  ],
};
