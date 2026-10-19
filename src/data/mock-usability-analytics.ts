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

export type NpsGroup = 'detractor' | 'passive' | 'promoter';

export interface AnalyticsTester {
  id: string;
  name: string;
  variantId: string;
  susScore: number;
  susQuestions: number[];
  npsScore: number;
  npsGroup: NpsGroup;
  taskEase: number[];
  taskDurationSec: number[];
  taskCompleted: boolean[];
  notes: string;
}

export interface TestVideoRow {
  id: string;
  testerId: string;
  name: string;
  variantId: string;
  duration: string;
  rating: number;
  notes: string;
}

export interface AnalyticsVariant {
  id: string;
  name: string;
  url: string;
  n: number;
  tasks: AnalyticsTaskView[];
  diagnostics: DiagnosticsData;
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
  variants: AnalyticsVariant[];
  testers: AnalyticsTester[];
  videos: TestVideoRow[];
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

export const VARIANT_CURRENT_ID = 'current';
export const VARIANT_NEW_ID = 'new';

export const VARIANT_PALETTE = ['#1B87E6', '#1B3380', '#F5A300', '#545E6B', '#22C55E'];

function scaleTask(
  task: AnalyticsTaskView,
  n: number,
  reached: number,
  left: number
): AnalyticsTaskView {
  const factor = n / Math.max(1, task.behavior.participantsTracked);
  return {
    ...task,
    behavior: {
      ...task.behavior,
      participantsTracked: n,
      reachedSuccess: reached,
      leftBeforeSuccess: left,
      rageClickEvents: Math.round(task.behavior.rageClickEvents * factor),
      misclickEvents: Math.round(task.behavior.misclickEvents * factor),
    },
    clickPathNodes: task.clickPathNodes.map((node) => ({ ...node, count: Math.round(node.count * factor) })),
    clickPathLinks: task.clickPathLinks.map((link) => ({ ...link, count: Math.round(link.count * factor) })),
    firstClicks: task.firstClicks.map((row) => ({ ...row, count: Math.round(row.count * factor) })),
    outcomes: {
      direct: Math.round(task.outcomes.direct * factor),
      divertedSuccess: Math.max(0, reached - Math.round(task.outcomes.direct * factor)),
      left,
    },
    dropOffs: task.dropOffs.map((row) => ({ ...row, count: Math.round(row.count * factor) })),
    rageMisclicks: task.rageMisclicks.map((row) => ({
      ...row,
      rageClicks: Math.round(row.rageClicks * factor),
      deadClicks: Math.round(row.deadClicks * factor),
    })),
    replays: task.replays.slice(0, Math.max(2, Math.round(task.replays.length * factor))),
  };
}

const CURRENT_TASKS: AnalyticsTaskView[] = [
  scaleTask(TASK_1, 12, 10, 2),
  scaleTask(TASK_2, 12, 8, 4),
  scaleTask(TASK_3, 12, 7, 5),
];

const NEW_TASKS: AnalyticsTaskView[] = [
  scaleTask(TASK_1, 12, 12, 0),
  scaleTask(TASK_2, 12, 11, 1),
  scaleTask(TASK_3, 12, 10, 2),
];

const CURRENT_DIAGNOSTICS: DiagnosticsData = {
  susScore: 61.0,
  susScores: [
    { anonymousId: 'Edgar V.', score: 50.0, deviation: '-18.03%' },
    { anonymousId: 'Testing A.', score: 55.0, deviation: '-9.84%' },
    { anonymousId: 'Anon:626', score: 47.5, deviation: '-22.13%' },
    { anonymousId: 'Anon:412', score: 82.5, deviation: '+35.25%' },
    { anonymousId: 'Anon:247', score: 70.0, deviation: '+14.75%' },
  ],
  nps: 18,
  taskUsabilityRating: '3.8 / 5',
  taskCompletionRate: '7 of 12',
  taskDurationMedian: '8m 12s',
  positiveSentimentPct: '58%',
};

const NEW_DIAGNOSTICS: DiagnosticsData = {
  susScore: 70.0,
  susScores: [
    { anonymousId: 'Test 2', score: 77.5, deviation: '+10.71%' },
    { anonymousId: 'Anon:891', score: 72.5, deviation: '+3.57%' },
    { anonymousId: 'Anon:118', score: 80.0, deviation: '+14.29%' },
    { anonymousId: 'Anon:229', score: 62.5, deviation: '-10.71%' },
    { anonymousId: 'Anon:340', score: 67.5, deviation: '-3.57%' },
  ],
  nps: 46,
  taskUsabilityRating: '4.5 / 5',
  taskCompletionRate: '9 of 12',
  taskDurationMedian: '7m 05s',
  positiveSentimentPct: '76%',
};

function susQuestions(seed: number): number[] {
  return Array.from({ length: 10 }, (_, index) => 1 + ((seed + index * 3) % 5));
}

function makeTester(
  id: string,
  name: string,
  variantId: string,
  susScore: number,
  npsScore: number,
  ease: number[],
  durationSec: number[],
  completed: boolean[],
  notes: string
): AnalyticsTester {
  const npsGroup: NpsGroup = npsScore >= 9 ? 'promoter' : npsScore >= 7 ? 'passive' : 'detractor';
  return {
    id,
    name,
    variantId,
    susScore,
    susQuestions: susQuestions(id.length + susScore),
    npsScore,
    npsGroup,
    taskEase: ease,
    taskDurationSec: durationSec,
    taskCompleted: completed,
    notes,
  };
}

const TESTERS: AnalyticsTester[] = [
  makeTester('t-edgar', 'Edgar V.', VARIANT_CURRENT_ID, 50, 4, [2, 3, 2], [132, 198, 88], [true, false, false], 'Paused on signup and asked where to go next.'),
  makeTester('t-testing-a', 'Testing A.', VARIANT_CURRENT_ID, 55, 6, [3, 3, 3], [118, 164, 72], [true, true, false], 'Finished join, then searched instead of checkout.'),
  makeTester('t-626', 'Anon:626', VARIANT_CURRENT_ID, 47.5, 3, [2, 2, 2], [140, 210, 94], [true, false, false], 'Repeated clicks on the signup submit control.'),
  makeTester('t-412', 'Anon:412', VARIANT_CURRENT_ID, 82.5, 9, [4, 4, 5], [70, 118, 48], [true, true, true], 'Fast path; marked the flow as easy.'),
  makeTester('t-247', 'Anon:247', VARIANT_CURRENT_ID, 70, 8, [4, 3, 4], [100, 153, 61], [true, true, true], 'Recovered after opening Help.'),
  makeTester('t-119', 'Anon:119', VARIANT_CURRENT_ID, 62.5, 7, [3, 4, 3], [108, 241, 70], [true, true, false], 'Reached checkout, then left Help.'),
  makeTester('t-334', 'Anon:334', VARIANT_CURRENT_ID, 45, 2, [2, 2, 1], [88, 82, 55], [false, false, false], 'Left from Home on the first task.'),
  makeTester('t-768', 'Anon:768', VARIANT_CURRENT_ID, 58, 5, [3, 3, 2], [124, 176, 80], [true, true, false], 'Needed a hint on the answer task.'),
  makeTester('t-215', 'Anon:215', VARIANT_CURRENT_ID, 66, 8, [4, 3, 4], [96, 148, 64], [true, true, true], 'Completed all three with one diversion.'),
  makeTester('t-903', 'Anon:903', VARIANT_CURRENT_ID, 52, 4, [2, 3, 2], [150, 188, 90], [true, false, false], 'Stuck on the coupon field.'),
  makeTester('t-441', 'Anon:441', VARIANT_CURRENT_ID, 73, 8, [4, 4, 3], [92, 140, 58], [true, true, true], 'Quiet session, few off-target clicks.'),
  makeTester('t-552', 'Anon:552', VARIANT_CURRENT_ID, 60, 6, [3, 3, 3], [110, 160, 68], [true, true, false], 'Found Help after searching.'),
  makeTester('t-test2', 'Test 2', VARIANT_NEW_ID, 77.5, 9, [5, 4, 4], [84, 132, 50], [true, true, true], 'Straight path through the new layout.'),
  makeTester('t-891', 'Anon:891', VARIANT_NEW_ID, 72.5, 8, [4, 4, 4], [90, 146, 56], [true, true, true], 'One extra click on product reviews.'),
  makeTester('t-118', 'Anon:118', VARIANT_NEW_ID, 80, 10, [5, 5, 4], [72, 118, 44], [true, true, true], 'Called the new flow obvious.'),
  makeTester('t-229', 'Anon:229', VARIANT_NEW_ID, 62.5, 6, [3, 3, 4], [128, 170, 62], [true, true, false], 'Missed Help in the new nav.'),
  makeTester('t-340', 'Anon:340', VARIANT_NEW_ID, 67.5, 7, [4, 3, 4], [102, 154, 58], [true, true, true], 'Paused once on checkout.'),
  makeTester('t-451', 'Anon:451', VARIANT_NEW_ID, 74, 9, [4, 5, 4], [88, 126, 52], [true, true, true], 'No diversions.'),
  makeTester('t-562', 'Anon:562', VARIANT_NEW_ID, 69, 8, [4, 4, 3], [96, 138, 60], [true, true, true], 'Used search, then recovered.'),
  makeTester('t-673', 'Anon:673', VARIANT_NEW_ID, 58, 5, [3, 3, 3], [140, 188, 74], [true, false, true], 'Left the first-action task.'),
  makeTester('t-784', 'Anon:784', VARIANT_NEW_ID, 71, 8, [4, 4, 4], [86, 130, 48], [true, true, true], 'Marked all tasks easy.'),
  makeTester('t-895', 'Anon:895', VARIANT_NEW_ID, 64, 7, [3, 4, 3], [112, 162, 66], [true, true, false], 'Asked where answers live.'),
  makeTester('t-906', 'Anon:906', VARIANT_NEW_ID, 76, 9, [5, 4, 5], [78, 122, 46], [true, true, true], 'Fastest session on the new design.'),
  makeTester('t-017', 'Anon:017', VARIANT_NEW_ID, 68, 7, [4, 3, 4], [104, 150, 54], [true, true, true], 'One rage click on checkout, then finished.'),
];

const VIDEOS: TestVideoRow[] = TESTERS.map((tester, index) => ({
  id: `vid-${tester.id}`,
  testerId: tester.id,
  name: tester.name,
  variantId: tester.variantId,
  duration: `${6 + (index % 5)}m ${12 + (index % 40)}s`,
  rating: Math.min(5, Math.max(2, Math.round(tester.susScore / 20))),
  notes: tester.notes,
}));

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
  variants: [
    {
      id: VARIANT_CURRENT_ID,
      name: 'Current onboarding',
      url: 'https://midland.example.com',
      n: 12,
      tasks: CURRENT_TASKS,
      diagnostics: CURRENT_DIAGNOSTICS,
    },
    {
      id: VARIANT_NEW_ID,
      name: 'New onboarding',
      url: 'https://new.midland.example.com',
      n: 12,
      tasks: NEW_TASKS,
      diagnostics: NEW_DIAGNOSTICS,
    },
  ],
  testers: TESTERS,
  videos: VIDEOS,
  diagnostics: {
    susScore: 65.5,
    susScores: [
      { anonymousId: 'Edgar V.', score: 50.0, deviation: '-23.66%' },
      { anonymousId: 'Testing A.', score: 55.0, deviation: '-16.03%' },
      { anonymousId: 'Anon:626', score: 47.5, deviation: '-27.48%' },
      { anonymousId: 'Anon:412', score: 82.5, deviation: '+25.95%' },
      { anonymousId: 'Anon:247', score: 70.0, deviation: '+6.87%' },
      { anonymousId: 'Test 2', score: 77.5, deviation: '+18.32%' },
      { anonymousId: 'Anon:891', score: 72.5, deviation: '+10.69%' },
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

export function analyticsWithoutVariants(source: UsabilityAnalytics, testId: string): UsabilityAnalytics {
  return {
    ...source,
    testId,
    variants: [],
    testers: source.testers.map((tester) => ({ ...tester, variantId: '' })),
    videos: source.videos.map((video) => ({ ...video, variantId: '' })),
  };
}
