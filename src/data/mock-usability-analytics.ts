export interface EngagementPoint {
  t: string;
  clicks: number;
  scrolls: number;
}

export interface ScrollDepthBand {
  band: string;
  pct: number;
}

export interface SessionReplay {
  id: string;
  anonymousId: string;
  duration: string;
  durationSeconds: number;
  misclicks: number;
  device: 'Desktop' | 'Mobile' | 'Tablet';
  progressPct: number;
}

export interface ClickPathStage {
  label: string;
  x: number;
  y: number;
  height: number;
  count: number;
}

export interface ClickPathEdge {
  fromIndex: number;
  toIndex: number;
  count: number;
  type: 'continued' | 'dropped';
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
  avgTimeOnTask: string;
  taskSuccessRate: string;
  avgScrollDepth: string;
  rageClickEvents: number;
  misclickRate: string;
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
}

export interface UsabilityAnalytics {
  testId: string;
  taskBanner: string;
  behavior: BehaviorStats;
  engagementSeries: EngagementPoint[];
  scrollDepth: ScrollDepthBand[];
  pageScrollDepth: PageScrollDepthData[];
  replays: SessionReplay[];
  clickPathStages: ClickPathStage[];
  clickPathEdges: ClickPathEdge[];
  rageMisclicks: RageMisclickRow[];
  diagnostics: DiagnosticsData;
  benchmark: BenchmarkData;
}

export const MOCK_USABILITY_ANALYTICS: UsabilityAnalytics = {
  testId: 'ut-001',
  taskBanner:
    'Evaluate how new members navigate the onboarding wizard from account creation to their first dashboard action.',
  behavior: {
    participantsTracked: 24,
    avgTimeOnTask: '2m 14s',
    taskSuccessRate: '78%',
    avgScrollDepth: '64%',
    rageClickEvents: 9,
    misclickRate: '12%',
  },
  engagementSeries: [
    { t: '0m', clicks: 4, scrolls: 2 },
    { t: '1m', clicks: 9, scrolls: 6 },
    { t: '2m', clicks: 7, scrolls: 11 },
    { t: '3m', clicks: 5, scrolls: 9 },
    { t: '4m', clicks: 2, scrolls: 4 },
  ],
  scrollDepth: [
    { band: '0–25%', pct: 100 },
    { band: '25–50%', pct: 82 },
    { band: '50–75%', pct: 54 },
    { band: '75–100%', pct: 31 },
  ],
  pageScrollDepth: [
    { path: '/', label: '/ (Home)', avgScrollDepth: 72, reached25: 100, reached50: 84, reached75: 61, reached100: 29 },
    { path: '/product', label: '/product', avgScrollDepth: 65, reached25: 95, reached50: 78, reached75: 52, reached100: 21 },
    { path: '/checkout', label: '/checkout', avgScrollDepth: 58, reached25: 100, reached50: 71, reached75: 44, reached100: 18 },
    { path: '/signup', label: '/signup', avgScrollDepth: 83, reached25: 100, reached50: 92, reached75: 79, reached100: 52 },
    { path: '/dashboard', label: '/dashboard', avgScrollDepth: 45, reached25: 88, reached50: 62, reached75: 38, reached100: 12 },
  ],
  replays: [
    { id: 'replay-1', anonymousId: 'Anon:626', duration: '3m 42s', durationSeconds: 222, misclicks: 2, device: 'Desktop', progressPct: 62 },
    { id: 'replay-2', anonymousId: 'Anon:412', duration: '1m 58s', durationSeconds: 118, misclicks: 0, device: 'Mobile', progressPct: 38 },
    { id: 'replay-3', anonymousId: 'Anon:891', duration: '5m 10s', durationSeconds: 310, misclicks: 4, device: 'Desktop', progressPct: 88 },
    { id: 'replay-4', anonymousId: 'Anon:247', duration: '2m 33s', durationSeconds: 153, misclicks: 1, device: 'Desktop', progressPct: 45 },
    { id: 'replay-5', anonymousId: 'Anon:119', duration: '4m 01s', durationSeconds: 241, misclicks: 3, device: 'Tablet', progressPct: 70 },
    { id: 'replay-6', anonymousId: 'Anon:334', duration: '1m 22s', durationSeconds: 82, misclicks: 0, device: 'Mobile', progressPct: 25 },
  ],
  clickPathStages: [
    { label: 'Landing', x: 40, y: 100, height: 40, count: 40 },
    { label: 'Search', x: 220, y: 70, height: 40, count: 32 },
    { label: 'Product', x: 400, y: 60, height: 40, count: 26 },
    { label: 'Checkout', x: 580, y: 55, height: 40, count: 18 },
  ],
  clickPathEdges: [
    { fromIndex: 0, toIndex: 1, count: 32, type: 'continued' },
    { fromIndex: 0, toIndex: -1, count: 8, type: 'dropped' },
    { fromIndex: 1, toIndex: 2, count: 26, type: 'continued' },
    { fromIndex: 1, toIndex: -1, count: 6, type: 'dropped' },
    { fromIndex: 2, toIndex: 3, count: 18, type: 'continued' },
    { fromIndex: 2, toIndex: -1, count: 8, type: 'dropped' },
  ],
  rageMisclicks: [
    { screen: 'Checkout', rageClicks: 6, misclickRate: '18%', deadClicks: 3, severity: 'High' },
    { screen: 'Product page', rageClicks: 2, misclickRate: '9%', deadClicks: 1, severity: 'Medium' },
    { screen: 'Search results', rageClicks: 1, misclickRate: '6%', deadClicks: 0, severity: 'Low' },
    { screen: 'Landing page', rageClicks: 0, misclickRate: '3%', deadClicks: 0, severity: 'Low' },
  ],
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
    taskCompletionRate: '78%',
    taskDurationMedian: '2m 14s',
    positiveSentimentPct: '68%',
  },
  benchmark: {
    yourSusScore: 65.5,
    industryAverage: 68.0,
    percentile: 44.5,
    industryLabel: 'Software & SaaS',
  },
};
