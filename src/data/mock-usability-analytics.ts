export interface SessionReplay {
  id: string;
  anonymousId: string;
  duration: string;
  durationSeconds: number;
  misclicks: number;
  device: 'Desktop' | 'Mobile' | 'Tablet';
  progressPct: number;
  reachedSuccess: boolean;
}

export type PathEdgeKind = 'expected' | 'diverted' | 'dropped';

export interface ClickPathNode {
  id: string;
  label: string;
  path: string;
  step: number;
  count: number;
  expected: boolean;
}

export interface ClickPathLink {
  fromId: string;
  toId: string | null;
  count: number;
  kind: PathEdgeKind;
}

export interface FirstClickRow {
  nodeId: string;
  label: string;
  count: number;
  expected: boolean;
}

export interface TaskOutcomeMix {
  direct: number;
  divertedSuccess: number;
  left: number;
}

export interface ScreenDropOff {
  nodeId: string;
  label: string;
  count: number;
}

export interface FoldVisibility {
  pagePath: string;
  pageLabel: string;
  reached50: number;
  reached75: number;
}

export interface RageMisclickRow {
  screen: string;
  rageClicks: number;
  misclickRate: string;
  deadClicks: number;
  severity: 'High' | 'Medium' | 'Low';
}

export interface SUSUserScore {
  anonymousId: string;
  score: number;
  deviation: string;
}

export interface BehaviorStats {
  participantsTracked: number;
  reachedSuccess: number;
  leftBeforeSuccess: number;
  avgTimeOnTask: string;
  rageClickEvents: number;
  rageClickScreen: string;
  misclickEvents: number;
}

export interface TaskSuccessDefinition {
  startPath: string;
  startLabel: string;
  successPath: string;
  successLabel: string;
  mode: 'reach-page' | 'reach-section' | 'click-control' | 'participant-done';
  sectionLabel: string | null;
}

export interface DiagnosticsData {
  susScore: number;
  susScores: SUSUserScore[];
  nps: number;
  taskUsabilityRating: string;
  taskCompletionRate: string;
  taskDurationMedian: string;
  positiveSentimentPct: string;
}

export interface BenchmarkData {
  yourSusScore: number;
  industryAverage: number;
  percentile: number;
  industryLabel: string;
}

export interface PageScrollDepthData {
  path: string;
  label: string;
  avgScrollDepth: number;
  reached25: number;
  reached50: number;
  reached75: number;
  reached100: number;
  isStart?: boolean;
  isSuccess?: boolean;
}

export interface AnalyticsTaskView {
  id: string;
  title: string;
  successDefinition: TaskSuccessDefinition;
  behavior: BehaviorStats;
  pageScrollDepth: PageScrollDepthData[];
  replays: SessionReplay[];
  clickPathNodes: ClickPathNode[];
  clickPathLinks: ClickPathLink[];
  firstClicks: FirstClickRow[];
  outcomes: TaskOutcomeMix;
  dropOffs: ScreenDropOff[];
  foldVisibility: FoldVisibility;
  rageMisclicks: RageMisclickRow[];
  lookNext: string;
}

export interface TestOverviewStats {
  participantsTracked: number;
  sessionsCompleted: number;
  finishedAllTasks: number;
  leftAnyTask: number;
  medianSessionTime: string;
}

export interface UsabilityAnalytics {
  testId: string;
  taskBanner: string;
  testOverview: TestOverviewStats;
  tasks: AnalyticsTaskView[];
  diagnostics: DiagnosticsData;
  benchmark: BenchmarkData;
}

const TASK_1: AnalyticsTaskView = {
  id: 'task-1',
  title: 'Join as a new member',
  lookNext: '2 people left from Home. Open click paths for this task.',
  successDefinition: {
    startPath: '/',
    startLabel: 'Home',
    successPath: '/signup',
    successLabel: 'Signup',
    mode: 'reach-page',
    sectionLabel: null,
  },
  behavior: {
    participantsTracked: 24,
    reachedSuccess: 22,
    leftBeforeSuccess: 2,
    avgTimeOnTask: '1m 48s',
    rageClickEvents: 2,
    rageClickScreen: 'Signup',
    misclickEvents: 5,
  },
  pageScrollDepth: [
    { path: '/', label: 'Home', avgScrollDepth: 72, reached25: 100, reached50: 84, reached75: 61, reached100: 29, isStart: true },
    { path: '/signup', label: 'Signup', avgScrollDepth: 83, reached25: 100, reached50: 92, reached75: 79, reached100: 52, isSuccess: true },
  ],
  replays: [
    { id: 't1-replay-1', anonymousId: 'Anon:626', duration: '1m 52s', durationSeconds: 112, misclicks: 0, device: 'Desktop', progressPct: 80, reachedSuccess: true },
    { id: 't1-replay-2', anonymousId: 'Anon:412', duration: '1m 10s', durationSeconds: 70, misclicks: 0, device: 'Mobile', progressPct: 40, reachedSuccess: false },
    { id: 't1-replay-3', anonymousId: 'Anon:891', duration: '2m 05s', durationSeconds: 125, misclicks: 1, device: 'Desktop', progressPct: 90, reachedSuccess: true },
    { id: 't1-replay-4', anonymousId: 'Anon:247', duration: '1m 40s', durationSeconds: 100, misclicks: 0, device: 'Desktop', progressPct: 75, reachedSuccess: true },
  ],
  clickPathNodes: [
    { id: 'home', label: 'Home', path: '/', step: 0, count: 24, expected: true },
    { id: 'signup', label: 'Signup', path: '/signup', step: 1, count: 22, expected: true },
    { id: 'help', label: 'Help', path: '/help', step: 1, count: 1, expected: false },
  ],
  clickPathLinks: [
    { fromId: 'home', toId: 'signup', count: 21, kind: 'expected' },
    { fromId: 'home', toId: 'help', count: 1, kind: 'diverted' },
    { fromId: 'home', toId: null, count: 2, kind: 'dropped' },
    { fromId: 'help', toId: 'signup', count: 1, kind: 'diverted' },
  ],
  firstClicks: [
    { nodeId: 'signup', label: 'Signup', count: 21, expected: true },
    { nodeId: 'help', label: 'Help', count: 1, expected: false },
    { nodeId: 'left', label: 'Left before success', count: 2, expected: false },
  ],
  outcomes: { direct: 21, divertedSuccess: 1, left: 2 },
  dropOffs: [{ nodeId: 'home', label: 'Home', count: 2 }],
  foldVisibility: { pagePath: '/signup', pageLabel: 'Signup', reached50: 92, reached75: 79 },
  rageMisclicks: [
    { screen: 'Signup', rageClicks: 2, misclickRate: '6%', deadClicks: 1, severity: 'Low' },
    { screen: 'Home', rageClicks: 0, misclickRate: '2%', deadClicks: 0, severity: 'Low' },
  ],
};

const TASK_2: AnalyticsTaskView = {
  id: 'task-2',
  title: 'Take your first action',
  lookNext: 'Most people left from Help. Repeated clicks clustered on Checkout.',
  successDefinition: {
    startPath: '/',
    startLabel: 'Home',
    successPath: '/checkout',
    successLabel: 'Checkout',
    mode: 'reach-page',
    sectionLabel: null,
  },
  behavior: {
    participantsTracked: 24,
    reachedSuccess: 19,
    leftBeforeSuccess: 5,
    avgTimeOnTask: '2m 14s',
    rageClickEvents: 9,
    rageClickScreen: 'Checkout',
    misclickEvents: 14,
  },
  pageScrollDepth: [
    { path: '/', label: 'Home', avgScrollDepth: 72, reached25: 100, reached50: 84, reached75: 61, reached100: 29, isStart: true },
    { path: '/search', label: 'Search', avgScrollDepth: 68, reached25: 98, reached50: 81, reached75: 55, reached100: 24 },
    { path: '/help', label: 'Help', avgScrollDepth: 41, reached25: 90, reached50: 48, reached75: 22, reached100: 8 },
    { path: '/product', label: 'Product', avgScrollDepth: 65, reached25: 95, reached50: 78, reached75: 52, reached100: 21 },
    { path: '/checkout', label: 'Checkout', avgScrollDepth: 58, reached25: 100, reached50: 71, reached75: 44, reached100: 18, isSuccess: true },
  ],
  replays: [
    { id: 'replay-1', anonymousId: 'Anon:626', duration: '3m 42s', durationSeconds: 222, misclicks: 2, device: 'Desktop', progressPct: 62, reachedSuccess: true },
    { id: 'replay-2', anonymousId: 'Anon:412', duration: '1m 58s', durationSeconds: 118, misclicks: 0, device: 'Mobile', progressPct: 38, reachedSuccess: false },
    { id: 'replay-3', anonymousId: 'Anon:891', duration: '5m 10s', durationSeconds: 310, misclicks: 4, device: 'Desktop', progressPct: 88, reachedSuccess: true },
    { id: 'replay-4', anonymousId: 'Anon:247', duration: '2m 33s', durationSeconds: 153, misclicks: 1, device: 'Desktop', progressPct: 45, reachedSuccess: true },
    { id: 'replay-5', anonymousId: 'Anon:119', duration: '4m 01s', durationSeconds: 241, misclicks: 3, device: 'Tablet', progressPct: 70, reachedSuccess: true },
    { id: 'replay-6', anonymousId: 'Anon:334', duration: '1m 22s', durationSeconds: 82, misclicks: 0, device: 'Mobile', progressPct: 25, reachedSuccess: false },
  ],
  clickPathNodes: [
    { id: 'home', label: 'Home', path: '/', step: 0, count: 24, expected: true },
    { id: 'search', label: 'Search', path: '/search', step: 1, count: 16, expected: true },
    { id: 'help', label: 'Help', path: '/help', step: 1, count: 4, expected: false },
    { id: 'product', label: 'Product', path: '/product', step: 2, count: 19, expected: true },
    { id: 'reviews', label: 'Reviews', path: '/product', step: 2, count: 1, expected: false },
    { id: 'checkout', label: 'Checkout', path: '/checkout', step: 3, count: 19, expected: true },
  ],
  clickPathLinks: [
    { fromId: 'home', toId: 'search', count: 16, kind: 'expected' },
    { fromId: 'home', toId: 'help', count: 4, kind: 'diverted' },
    { fromId: 'home', toId: 'product', count: 3, kind: 'diverted' },
    { fromId: 'home', toId: null, count: 1, kind: 'dropped' },
    { fromId: 'search', toId: 'product', count: 14, kind: 'expected' },
    { fromId: 'search', toId: 'reviews', count: 1, kind: 'diverted' },
    { fromId: 'search', toId: null, count: 1, kind: 'dropped' },
    { fromId: 'help', toId: 'product', count: 2, kind: 'diverted' },
    { fromId: 'help', toId: null, count: 2, kind: 'dropped' },
    { fromId: 'product', toId: 'checkout', count: 19, kind: 'expected' },
    { fromId: 'reviews', toId: null, count: 1, kind: 'dropped' },
  ],
  firstClicks: [
    { nodeId: 'search', label: 'Search', count: 16, expected: true },
    { nodeId: 'help', label: 'Help', count: 4, expected: false },
    { nodeId: 'product', label: 'Product', count: 3, expected: false },
    { nodeId: 'left', label: 'Left before success', count: 1, expected: false },
  ],
  outcomes: { direct: 14, divertedSuccess: 5, left: 5 },
  dropOffs: [
    { nodeId: 'help', label: 'Help', count: 2 },
    { nodeId: 'home', label: 'Home', count: 1 },
    { nodeId: 'search', label: 'Search', count: 1 },
    { nodeId: 'reviews', label: 'Reviews', count: 1 },
  ],
  foldVisibility: { pagePath: '/checkout', pageLabel: 'Checkout', reached50: 71, reached75: 44 },
  rageMisclicks: [
    { screen: 'Checkout', rageClicks: 6, misclickRate: '18%', deadClicks: 3, severity: 'High' },
    { screen: 'Product page', rageClicks: 2, misclickRate: '9%', deadClicks: 1, severity: 'Medium' },
    { screen: 'Search results', rageClicks: 1, misclickRate: '6%', deadClicks: 0, severity: 'Low' },
    { screen: 'Home', rageClicks: 0, misclickRate: '3%', deadClicks: 0, severity: 'Low' },
  ],
};

const TASK_3: AnalyticsTaskView = {
  id: 'task-3',
  title: 'Find an answer without contacting support',
  lookNext: '7 people left before Help. Search was the common diversion.',
  successDefinition: {
    startPath: '/',
    startLabel: 'Home',
    successPath: '/help',
    successLabel: 'Help',
    mode: 'reach-page',
    sectionLabel: null,
  },
  behavior: {
    participantsTracked: 24,
    reachedSuccess: 17,
    leftBeforeSuccess: 7,
    avgTimeOnTask: '1m 05s',
    rageClickEvents: 4,
    rageClickScreen: 'Search',
    misclickEvents: 8,
  },
  pageScrollDepth: [
    { path: '/', label: 'Home', avgScrollDepth: 64, reached25: 100, reached50: 78, reached75: 42, reached100: 18, isStart: true },
    { path: '/search', label: 'Search', avgScrollDepth: 55, reached25: 96, reached50: 70, reached75: 38, reached100: 12 },
    { path: '/help', label: 'Help', avgScrollDepth: 41, reached25: 90, reached50: 48, reached75: 22, reached100: 8, isSuccess: true },
  ],
  replays: [
    { id: 't3-replay-1', anonymousId: 'Anon:626', duration: '1m 12s', durationSeconds: 72, misclicks: 1, device: 'Desktop', progressPct: 70, reachedSuccess: true },
    { id: 't3-replay-2', anonymousId: 'Anon:412', duration: '0m 48s', durationSeconds: 48, misclicks: 0, device: 'Mobile', progressPct: 22, reachedSuccess: false },
    { id: 't3-replay-3', anonymousId: 'Anon:891', duration: '1m 30s', durationSeconds: 90, misclicks: 2, device: 'Desktop', progressPct: 85, reachedSuccess: true },
    { id: 't3-replay-4', anonymousId: 'Anon:334', duration: '0m 55s', durationSeconds: 55, misclicks: 0, device: 'Mobile', progressPct: 30, reachedSuccess: false },
  ],
  clickPathNodes: [
    { id: 'home', label: 'Home', path: '/', step: 0, count: 24, expected: true },
    { id: 'help', label: 'Help', path: '/help', step: 1, count: 17, expected: true },
    { id: 'search', label: 'Search', path: '/search', step: 1, count: 5, expected: false },
  ],
  clickPathLinks: [
    { fromId: 'home', toId: 'help', count: 14, kind: 'expected' },
    { fromId: 'home', toId: 'search', count: 5, kind: 'diverted' },
    { fromId: 'home', toId: null, count: 5, kind: 'dropped' },
    { fromId: 'search', toId: 'help', count: 3, kind: 'diverted' },
    { fromId: 'search', toId: null, count: 2, kind: 'dropped' },
  ],
  firstClicks: [
    { nodeId: 'help', label: 'Help', count: 14, expected: true },
    { nodeId: 'search', label: 'Search', count: 5, expected: false },
    { nodeId: 'left', label: 'Left before success', count: 5, expected: false },
  ],
  outcomes: { direct: 14, divertedSuccess: 3, left: 7 },
  dropOffs: [
    { nodeId: 'home', label: 'Home', count: 5 },
    { nodeId: 'search', label: 'Search', count: 2 },
  ],
  foldVisibility: { pagePath: '/help', pageLabel: 'Help', reached50: 48, reached75: 22 },
  rageMisclicks: [
    { screen: 'Search', rageClicks: 3, misclickRate: '11%', deadClicks: 2, severity: 'Medium' },
    { screen: 'Home', rageClicks: 1, misclickRate: '5%', deadClicks: 0, severity: 'Low' },
    { screen: 'Help', rageClicks: 0, misclickRate: '4%', deadClicks: 0, severity: 'Low' },
  ],
};

export const MOCK_USABILITY_ANALYTICS: UsabilityAnalytics = {
  testId: 'ut-001',
  taskBanner: 'Get set up as a new member, take a first action, and find an answer if you get stuck.',
  testOverview: {
    participantsTracked: 24,
    sessionsCompleted: 24,
    finishedAllTasks: 16,
    leftAnyTask: 8,
    medianSessionTime: '7m 40s',
  },
  tasks: [TASK_1, TASK_2, TASK_3],
  diagnostics: {
    susScore: 65.5,
    susScores: [
      { anonymousId: 'Anon:626', score: 50.0, deviation: '-23.66%' },
      { anonymousId: 'Anon:412', score: 100.0, deviation: '+52.67%' },
      { anonymousId: 'Anon:891', score: 55.0, deviation: '-16.03%' },
      { anonymousId: 'Anon:247', score: 75.0, deviation: '+14.50%' },
      { anonymousId: 'Anon:119', score: 62.5, deviation: '-4.58%' },
    ],
    nps: 32,
    taskUsabilityRating: '4.2 / 5',
    taskCompletionRate: '16 of 24',
    taskDurationMedian: '7m 40s',
    positiveSentimentPct: '68%',
  },
  benchmark: {
    yourSusScore: 65.5,
    industryAverage: 68.0,
    percentile: 44.5,
    industryLabel: 'Software & SaaS',
  },
};
