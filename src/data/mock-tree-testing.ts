import type { TreeNode } from '@/data/tree-utils';

export interface FindabilityTask {
  id: string;
  prompt: string;
  description?: string;
  isWarmup?: boolean;
  correctLeafIds: string[];
}

export interface TreeTestingConfig {
  tree: TreeNode[];
  findabilityTasks: FindabilityTask[];
}

export type PathResult = 'direct' | 'indirect' | 'fail';

export interface TreeParticipantRow {
  id: string;
  name: string;
  result: PathResult;
  timeSeconds: number;
  path: string;
  firstClick: string;
  destination: string;
}

export interface TreeFindabilityAnalysis {
  taskId: string;
  prompt: string;
  successRate: number;
  directness: number;
  avgTimeSeconds: number;
  endDestinations: { label: string; count: number; correct?: boolean }[];
  commonPaths: { path: string; count: number; correct: boolean }[];
  firstClicks: { label: string; count: number }[];
  participants: TreeParticipantRow[];
}

function n(id: string, label: string, children: TreeNode[] = []): TreeNode {
  return { id, label, children };
}

export const MOCK_DUNKIN_TREE: TreeNode[] = [
  n('n-home', 'Home', [
    n('n-menu', 'Menu', [
      n('n-donuts', 'Donuts'),
      n('n-coffee', 'Coffee'),
      n('n-breakfast', 'Breakfast'),
      n('n-sandwiches', 'Sandwiches'),
    ]),
    n('n-locations', 'Locations', [
      n('n-locator', 'Store locator'),
      n('n-hours', 'Hours'),
    ]),
    n('n-rewards', 'Rewards', [
      n('n-perks', 'Join DD Perks'),
      n('n-gifts', 'Gift cards'),
    ]),
    n('n-about', 'About', [
      n('n-story', 'Our story'),
      n('n-careers', 'Careers'),
    ]),
    n('n-order', 'Order', [
      n('n-pickup', 'Pickup'),
      n('n-delivery', 'Delivery'),
    ]),
  ]),
];

export const MOCK_FINDABILITY_TASKS: FindabilityTask[] = [
  {
    id: 'ft-warmup',
    prompt: 'You want to see if a nearby shop is open this evening. Where would you look?',
    description: 'Warmup — an easy hours lookup to screen attention.',
    isWarmup: true,
    correctLeafIds: ['n-hours'],
  },
  {
    id: 'ft-perks',
    prompt: 'You want to earn points on your usual morning coffee. Where would you go to sign up?',
    description: 'Avoids the label “Join DD Perks” in the prompt.',
    correctLeafIds: ['n-perks'],
  },
  {
    id: 'ft-gifts',
    prompt: 'You need to send a coworker a treat without meeting in person. Where would you go?',
    correctLeafIds: ['n-gifts', 'n-delivery'],
  },
];

export function defaultTreeTestingConfig(): TreeTestingConfig {
  return {
    tree: [],
    findabilityTasks: [],
  };
}

export const MOCK_TREE_TESTING_ANALYSIS: TreeFindabilityAnalysis[] = [
  {
    taskId: 'ft-warmup',
    prompt: 'You want to see if a nearby shop is open this evening. Where would you look?',
    successRate: 88,
    directness: 75,
    avgTimeSeconds: 18,
    endDestinations: [
      { label: 'Hours', count: 14, correct: true },
      { label: 'Store locator', count: 2, correct: false },
    ],
    commonPaths: [
      { path: 'Home > Locations > Hours', count: 12, correct: true },
      { path: 'Home > Locations > Store locator', count: 2, correct: false },
      { path: 'Home > About > Hours', count: 2, correct: true },
    ],
    firstClicks: [
      { label: 'Locations', count: 13 },
      { label: 'About', count: 2 },
      { label: 'Menu', count: 1 },
    ],
    participants: [
      { id: 'p01', name: 'Amulya M.', result: 'direct', timeSeconds: 12, path: 'Home > Locations > Hours', firstClick: 'Locations', destination: 'Hours' },
      { id: 'p02', name: 'Jordan P.', result: 'direct', timeSeconds: 15, path: 'Home > Locations > Hours', firstClick: 'Locations', destination: 'Hours' },
      { id: 'p03', name: 'Priya K.', result: 'indirect', timeSeconds: 28, path: 'Home > About > Careers > Locations > Hours', firstClick: 'About', destination: 'Hours' },
      { id: 'p04', name: 'Marcus W.', result: 'direct', timeSeconds: 11, path: 'Home > Locations > Hours', firstClick: 'Locations', destination: 'Hours' },
      { id: 'p05', name: 'Lena T.', result: 'fail', timeSeconds: 41, path: 'Home > Locations > Store locator', firstClick: 'Locations', destination: 'Store locator' },
      { id: 'p06', name: 'James O.', result: 'direct', timeSeconds: 14, path: 'Home > Locations > Hours', firstClick: 'Locations', destination: 'Hours' },
      { id: 'p07', name: 'Sarah C.', result: 'direct', timeSeconds: 9, path: 'Home > Locations > Hours', firstClick: 'Locations', destination: 'Hours' },
      { id: 'p08', name: 'Diego R.', result: 'indirect', timeSeconds: 33, path: 'Home > Menu > Coffee > Locations > Hours', firstClick: 'Menu', destination: 'Hours' },
      { id: 'p09', name: 'Nina B.', result: 'direct', timeSeconds: 16, path: 'Home > Locations > Hours', firstClick: 'Locations', destination: 'Hours' },
      { id: 'p10', name: 'Chris L.', result: 'direct', timeSeconds: 13, path: 'Home > Locations > Hours', firstClick: 'Locations', destination: 'Hours' },
      { id: 'p11', name: 'Aisha N.', result: 'direct', timeSeconds: 17, path: 'Home > Locations > Hours', firstClick: 'Locations', destination: 'Hours' },
      { id: 'p12', name: 'Owen F.', result: 'fail', timeSeconds: 38, path: 'Home > Locations > Store locator', firstClick: 'Locations', destination: 'Store locator' },
      { id: 'p13', name: 'Mei Z.', result: 'direct', timeSeconds: 10, path: 'Home > Locations > Hours', firstClick: 'Locations', destination: 'Hours' },
      { id: 'p14', name: 'Hannah S.', result: 'direct', timeSeconds: 19, path: 'Home > Locations > Hours', firstClick: 'Locations', destination: 'Hours' },
      { id: 'p15', name: 'Ruben A.', result: 'direct', timeSeconds: 14, path: 'Home > Locations > Hours', firstClick: 'Locations', destination: 'Hours' },
      { id: 'p16', name: 'Tara V.', result: 'indirect', timeSeconds: 27, path: 'Home > About > Our story > Locations > Hours', firstClick: 'About', destination: 'Hours' },
    ],
  },
  {
    taskId: 'ft-perks',
    prompt: 'You want to earn points on your usual morning coffee. Where would you go to sign up?',
    successRate: 62,
    directness: 44,
    avgTimeSeconds: 34,
    endDestinations: [
      { label: 'Join DD Perks', count: 10, correct: true },
      { label: 'Coffee', count: 3, correct: false },
      { label: 'Gift cards', count: 2, correct: false },
      { label: 'Order', count: 1, correct: false },
    ],
    commonPaths: [
      { path: 'Home > Rewards > Join DD Perks', count: 7, correct: true },
      { path: 'Home > Menu > Coffee', count: 3, correct: false },
      { path: 'Home > Order > Rewards > Join DD Perks', count: 3, correct: true },
      { path: 'Home > Rewards > Gift cards', count: 2, correct: false },
    ],
    firstClicks: [
      { label: 'Rewards', count: 8 },
      { label: 'Menu', count: 4 },
      { label: 'Order', count: 3 },
      { label: 'About', count: 1 },
    ],
    participants: [
      { id: 'p01', name: 'Amulya M.', result: 'direct', timeSeconds: 18, path: 'Home > Rewards > Join DD Perks', firstClick: 'Rewards', destination: 'Join DD Perks' },
      { id: 'p02', name: 'Jordan P.', result: 'fail', timeSeconds: 42, path: 'Home > Menu > Coffee', firstClick: 'Menu', destination: 'Coffee' },
      { id: 'p03', name: 'Priya K.', result: 'indirect', timeSeconds: 51, path: 'Home > Order > Pickup > Rewards > Join DD Perks', firstClick: 'Order', destination: 'Join DD Perks' },
      { id: 'p04', name: 'Marcus W.', result: 'direct', timeSeconds: 22, path: 'Home > Rewards > Join DD Perks', firstClick: 'Rewards', destination: 'Join DD Perks' },
      { id: 'p05', name: 'Lena T.', result: 'fail', timeSeconds: 39, path: 'Home > Rewards > Gift cards', firstClick: 'Rewards', destination: 'Gift cards' },
      { id: 'p06', name: 'James O.', result: 'direct', timeSeconds: 16, path: 'Home > Rewards > Join DD Perks', firstClick: 'Rewards', destination: 'Join DD Perks' },
      { id: 'p07', name: 'Sarah C.', result: 'fail', timeSeconds: 44, path: 'Home > Menu > Coffee', firstClick: 'Menu', destination: 'Coffee' },
      { id: 'p08', name: 'Diego R.', result: 'indirect', timeSeconds: 47, path: 'Home > Menu > Donuts > Rewards > Join DD Perks', firstClick: 'Menu', destination: 'Join DD Perks' },
      { id: 'p09', name: 'Nina B.', result: 'direct', timeSeconds: 21, path: 'Home > Rewards > Join DD Perks', firstClick: 'Rewards', destination: 'Join DD Perks' },
      { id: 'p10', name: 'Chris L.', result: 'fail', timeSeconds: 36, path: 'Home > Order > Delivery', firstClick: 'Order', destination: 'Delivery' },
      { id: 'p11', name: 'Aisha N.', result: 'direct', timeSeconds: 19, path: 'Home > Rewards > Join DD Perks', firstClick: 'Rewards', destination: 'Join DD Perks' },
      { id: 'p12', name: 'Owen F.', result: 'fail', timeSeconds: 40, path: 'Home > Menu > Coffee', firstClick: 'Menu', destination: 'Coffee' },
      { id: 'p13', name: 'Mei Z.', result: 'direct', timeSeconds: 14, path: 'Home > Rewards > Join DD Perks', firstClick: 'Rewards', destination: 'Join DD Perks' },
      { id: 'p14', name: 'Hannah S.', result: 'indirect', timeSeconds: 55, path: 'Home > About > Our story > Rewards > Join DD Perks', firstClick: 'About', destination: 'Join DD Perks' },
      { id: 'p15', name: 'Ruben A.', result: 'direct', timeSeconds: 24, path: 'Home > Rewards > Join DD Perks', firstClick: 'Rewards', destination: 'Join DD Perks' },
      { id: 'p16', name: 'Tara V.', result: 'fail', timeSeconds: 48, path: 'Home > Rewards > Gift cards', firstClick: 'Rewards', destination: 'Gift cards' },
    ],
  },
  {
    taskId: 'ft-gifts',
    prompt: 'You need to send a coworker a treat without meeting in person. Where would you go?',
    successRate: 69,
    directness: 38,
    avgTimeSeconds: 31,
    endDestinations: [
      { label: 'Gift cards', count: 7, correct: true },
      { label: 'Delivery', count: 4, correct: true },
      { label: 'Pickup', count: 3, correct: false },
      { label: 'Donuts', count: 2, correct: false },
    ],
    commonPaths: [
      { path: 'Home > Rewards > Gift cards', count: 6, correct: true },
      { path: 'Home > Order > Delivery', count: 4, correct: true },
      { path: 'Home > Order > Pickup', count: 3, correct: false },
      { path: 'Home > Menu > Donuts', count: 2, correct: false },
    ],
    firstClicks: [
      { label: 'Order', count: 7 },
      { label: 'Rewards', count: 6 },
      { label: 'Menu', count: 3 },
    ],
    participants: [
      { id: 'p01', name: 'Amulya M.', result: 'direct', timeSeconds: 20, path: 'Home > Rewards > Gift cards', firstClick: 'Rewards', destination: 'Gift cards' },
      { id: 'p02', name: 'Jordan P.', result: 'direct', timeSeconds: 17, path: 'Home > Order > Delivery', firstClick: 'Order', destination: 'Delivery' },
      { id: 'p03', name: 'Priya K.', result: 'indirect', timeSeconds: 44, path: 'Home > Menu > Donuts > Order > Delivery', firstClick: 'Menu', destination: 'Delivery' },
      { id: 'p04', name: 'Marcus W.', result: 'fail', timeSeconds: 29, path: 'Home > Order > Pickup', firstClick: 'Order', destination: 'Pickup' },
      { id: 'p05', name: 'Lena T.', result: 'direct', timeSeconds: 22, path: 'Home > Rewards > Gift cards', firstClick: 'Rewards', destination: 'Gift cards' },
      { id: 'p06', name: 'James O.', result: 'fail', timeSeconds: 35, path: 'Home > Menu > Donuts', firstClick: 'Menu', destination: 'Donuts' },
      { id: 'p07', name: 'Sarah C.', result: 'direct', timeSeconds: 18, path: 'Home > Rewards > Gift cards', firstClick: 'Rewards', destination: 'Gift cards' },
      { id: 'p08', name: 'Diego R.', result: 'indirect', timeSeconds: 40, path: 'Home > Order > Pickup > Delivery', firstClick: 'Order', destination: 'Delivery' },
      { id: 'p09', name: 'Nina B.', result: 'direct', timeSeconds: 16, path: 'Home > Rewards > Gift cards', firstClick: 'Rewards', destination: 'Gift cards' },
      { id: 'p10', name: 'Chris L.', result: 'fail', timeSeconds: 33, path: 'Home > Order > Pickup', firstClick: 'Order', destination: 'Pickup' },
      { id: 'p11', name: 'Aisha N.', result: 'direct', timeSeconds: 21, path: 'Home > Order > Delivery', firstClick: 'Order', destination: 'Delivery' },
      { id: 'p12', name: 'Owen F.', result: 'fail', timeSeconds: 37, path: 'Home > Menu > Donuts', firstClick: 'Menu', destination: 'Donuts' },
      { id: 'p13', name: 'Mei Z.', result: 'direct', timeSeconds: 13, path: 'Home > Rewards > Gift cards', firstClick: 'Rewards', destination: 'Gift cards' },
      { id: 'p14', name: 'Hannah S.', result: 'indirect', timeSeconds: 46, path: 'Home > About > Careers > Rewards > Gift cards', firstClick: 'About', destination: 'Gift cards' },
      { id: 'p15', name: 'Ruben A.', result: 'direct', timeSeconds: 25, path: 'Home > Rewards > Gift cards', firstClick: 'Rewards', destination: 'Gift cards' },
      { id: 'p16', name: 'Tara V.', result: 'fail', timeSeconds: 31, path: 'Home > Order > Pickup', firstClick: 'Order', destination: 'Pickup' },
    ],
  },
];
