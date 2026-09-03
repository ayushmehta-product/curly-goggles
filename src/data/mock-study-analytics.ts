export type Sentiment = 'positive' | 'neutral' | 'negative';

export interface AnalyticsOption {
  value: string;
  label: string;
}

export interface AnalyticsParticipant {
  id: string;
  name: string;
}

export interface SentimentResponse {
  id: string;
  dateKey: string;
  dateLabel: string;
  sentiment: Sentiment;
  participantId: string;
  participantName: string;
  questId: string;
  questLabel: string;
  taskId: string;
  taskLabel: string;
  source: 'Conversation' | 'Survey';
  text: string;
}

export interface ThemeRow {
  id: string;
  rank: number;
  name: string;
  responseCount: number;
  percent: number;
  positive: number;
  neutral: number;
  negative: number;
  participantIds: string[];
  taskIds: string[];
}

export interface WordFrequencyRow {
  word: string;
  count: number;
  participantIds: string[];
}

export interface CompletionQuest {
  id: string;
  title: string;
  completed: number;
  total: number;
}

export interface AnalyticsFiltersState {
  dateFrom: string;
  dateTo: string;
  questIds: string[];
  taskIds: string[];
  participantId: string;
  responses: string;
  segmentId: string;
  choiceId: string;
  keywords: boolean;
}

export const DEFAULT_ANALYTICS_FILTERS: AnalyticsFiltersState = {
  dateFrom: '2026-08-27',
  dateTo: '2026-09-02',
  questIds: [],
  taskIds: [],
  participantId: 'all',
  responses: 'all',
  segmentId: 'all',
  choiceId: 'all',
  keywords: false,
};
export const ANALYTICS_QUEST_OPTIONS: AnalyticsOption[] = [
  { value: 'q001', label: 'Stranger things finale (re)closure' },
  { value: 'q002', label: 'Quest 1' },
  { value: 'q003', label: 'Upside Down walkthrough' },
  { value: 'q004', label: 'Vecna theory diary' },
  { value: 'q005', label: 'Group watch protocol' },
];

export const ANALYTICS_TASK_OPTIONS: AnalyticsOption[] = [
  { value: 't001', label: 'Opening sentiment' },
  { value: 't002', label: 'Character fates' },
  { value: 't010', label: 'Survey 01' },
  { value: 't011', label: 'Tree testing 01' },
  { value: 't020', label: 'Scene recall' },
  { value: 't030', label: 'Watch log' },
];

const TASK_TO_QUEST: Record<string, string> = {
  t001: 'q001',
  t002: 'q001',
  t010: 'q002',
  t011: 'q002',
  t020: 'q003',
  t030: 'q005',
};

export const ANALYTICS_RESPONSE_OPTIONS: AnalyticsOption[] = [
  { value: 'all', label: 'All responses' },
  { value: 'quotes', label: 'Show saved quotes' },
  { value: 'conversation', label: 'Conversation only' },
  { value: 'survey', label: 'Survey only' },
];

export const ANALYTICS_SEGMENT_OPTIONS: AnalyticsOption[] = [
  { value: 'all', label: 'All segments' },
  { value: 'finale-fans', label: 'Finale fans' },
  { value: 'casual', label: 'Casual viewers' },
];

export const ANALYTICS_CHOICE_OPTIONS: AnalyticsOption[] = [
  { value: 'all', label: 'All response choices' },
  { value: 'earned', label: 'Felt earned' },
  { value: 'unresolved', label: 'Still unresolved' },
];

export const ANALYTICS_PARTICIPANTS: AnalyticsParticipant[] = [
  { id: 'p01', name: 'Maya Chen' },
  { id: 'p02', name: 'Jordan Hale' },
  { id: 'p03', name: 'Priya Shah' },
  { id: 'p04', name: 'Luis Ortega' },
  { id: 'p05', name: 'Hannah Brooks' },
  { id: 'p06', name: 'Kenji Sato' },
  { id: 'p07', name: 'Amira Hassan' },
  { id: 'p08', name: 'Noah Patel' },
];

export const ANALYTICS_PARTICIPANT_OPTIONS: AnalyticsOption[] = [
  { value: 'all', label: 'All participants' },
  ...ANALYTICS_PARTICIPANTS.map((participant) => ({
    value: participant.id,
    label: participant.name,
  })),
];

export const MOCK_SENTIMENT_RESPONSES: SentimentResponse[] = [
  {
    id: 'r1',
    dateKey: '2026-08-27',
    dateLabel: 'Aug 27',
    sentiment: 'positive',
    participantId: 'p01',
    participantName: 'Maya Chen',
    questId: 'q001',
    questLabel: 'Stranger things finale (re)closure',
    taskId: 't001',
    taskLabel: 'Opening sentiment',
    source: 'Conversation',
    text: 'The cold open still gave me chills. It felt like the show remembered why we cared in the first place.',
  },
  {
    id: 'r2',
    dateKey: '2026-08-27',
    dateLabel: 'Aug 27',
    sentiment: 'neutral',
    participantId: 'p02',
    participantName: 'Jordan Hale',
    questId: 'q001',
    questLabel: 'Stranger things finale (re)closure',
    taskId: 't001',
    taskLabel: 'Opening sentiment',
    source: 'Survey',
    text: 'The first scene was fine. I was waiting to see whether the rest of the episode would pick up.',
  },
  {
    id: 'r3',
    dateKey: '2026-08-28',
    dateLabel: 'Aug 28',
    sentiment: 'negative',
    participantId: 'p03',
    participantName: 'Priya Shah',
    questId: 'q001',
    questLabel: 'Stranger things finale (re)closure',
    taskId: 't002',
    taskLabel: 'Character fates',
    source: 'Conversation',
    text: 'I still do not understand why they closed that character arc so quickly. It felt unfinished.',
  },
  {
    id: 'r4',
    dateKey: '2026-08-28',
    dateLabel: 'Aug 28',
    sentiment: 'positive',
    participantId: 'p04',
    participantName: 'Luis Ortega',
    questId: 'q001',
    questLabel: 'Stranger things finale (re)closure',
    taskId: 't002',
    taskLabel: 'Character fates',
    source: 'Survey',
    text: 'The group payoff landed for me. Everyone got a moment that felt earned.',
  },
  {
    id: 'r5',
    dateKey: '2026-08-29',
    dateLabel: 'Aug 29',
    sentiment: 'neutral',
    participantId: 'p05',
    participantName: 'Hannah Brooks',
    questId: 'q002',
    questLabel: 'Quest 1',
    taskId: 't010',
    taskLabel: 'Survey 01',
    source: 'Survey',
    text: 'The content was accessible, but I needed captions on sooner to follow the conversation.',
  },
  {
    id: 'r6',
    dateKey: '2026-08-29',
    dateLabel: 'Aug 29',
    sentiment: 'positive',
    participantId: 'p06',
    participantName: 'Kenji Sato',
    questId: 'q001',
    questLabel: 'Stranger things finale (re)closure',
    taskId: 't001',
    taskLabel: 'Opening sentiment',
    source: 'Conversation',
    text: 'The pattern of callbacks made the ending feel intentional rather than rushed.',
  },
  {
    id: 'r7',
    dateKey: '2026-08-30',
    dateLabel: 'Aug 30',
    sentiment: 'positive',
    participantId: 'p07',
    participantName: 'Amira Hassan',
    questId: 'q002',
    questLabel: 'Quest 1',
    taskId: 't010',
    taskLabel: 'Survey 01',
    source: 'Survey',
    text: 'I liked how clearly the tasks explained what to watch for. Communication was easy to follow.',
  },
  {
    id: 'r8',
    dateKey: '2026-08-30',
    dateLabel: 'Aug 30',
    sentiment: 'negative',
    participantId: 'p08',
    participantName: 'Noah Patel',
    questId: 'q001',
    questLabel: 'Stranger things finale (re)closure',
    taskId: 't002',
    taskLabel: 'Character fates',
    source: 'Conversation',
    text: 'The last fight went on too long and the emotional beat got lost in the noise.',
  },
  {
    id: 'r9',
    dateKey: '2026-08-31',
    dateLabel: 'Aug 31',
    sentiment: 'neutral',
    participantId: 'p01',
    participantName: 'Maya Chen',
    questId: 'q002',
    questLabel: 'Quest 1',
    taskId: 't010',
    taskLabel: 'Survey 01',
    source: 'Survey',
    text: 'Some scenes were moving, some were just setup. I am still sorting how I feel overall.',
  },
  {
    id: 'r10',
    dateKey: '2026-08-31',
    dateLabel: 'Aug 31',
    sentiment: 'positive',
    participantId: 'p03',
    participantName: 'Priya Shah',
    questId: 'q001',
    questLabel: 'Stranger things finale (re)closure',
    taskId: 't001',
    taskLabel: 'Opening sentiment',
    source: 'Conversation',
    text: 'Once the music cue hit, I was in. The atmosphere did more than the dialogue.',
  },
  {
    id: 'r11',
    dateKey: '2026-09-01',
    dateLabel: 'Sep 01',
    sentiment: 'positive',
    participantId: 'p02',
    participantName: 'Jordan Hale',
    questId: 'q001',
    questLabel: 'Stranger things finale (re)closure',
    taskId: 't002',
    taskLabel: 'Character fates',
    source: 'Conversation',
    text: 'The quiet kitchen scene was the best part. People finally talked like they knew each other.',
  },
  {
    id: 'r12',
    dateKey: '2026-09-01',
    dateLabel: 'Sep 01',
    sentiment: 'negative',
    participantId: 'p05',
    participantName: 'Hannah Brooks',
    questId: 'q002',
    questLabel: 'Quest 1',
    taskId: 't011',
    taskLabel: 'Tree testing 01',
    source: 'Survey',
    text: 'I could not find where to log the ending reaction. The labels did not match how I think about the story.',
  },
  {
    id: 'r13',
    dateKey: '2026-09-01',
    dateLabel: 'Sep 01',
    sentiment: 'neutral',
    participantId: 'p04',
    participantName: 'Luis Ortega',
    questId: 'q002',
    questLabel: 'Quest 1',
    taskId: 't010',
    taskLabel: 'Survey 01',
    source: 'Survey',
    text: 'The content was clear enough. I would have liked one more prompt about unresolved threads.',
  },
  {
    id: 'r14',
    dateKey: '2026-09-02',
    dateLabel: 'Sep 02',
    sentiment: 'positive',
    participantId: 'p08',
    participantName: 'Noah Patel',
    questId: 'q001',
    questLabel: 'Stranger things finale (re)closure',
    taskId: 't001',
    taskLabel: 'Opening sentiment',
    source: 'Conversation',
    text: 'Coming back a day later, the ending sits better. The change in tone now feels like a pattern, not a mistake.',
  },
  {
    id: 'r15',
    dateKey: '2026-09-02',
    dateLabel: 'Sep 02',
    sentiment: 'positive',
    participantId: 'p07',
    participantName: 'Amira Hassan',
    questId: 'q001',
    questLabel: 'Stranger things finale (re)closure',
    taskId: 't002',
    taskLabel: 'Character fates',
    source: 'Conversation',
    text: 'I keep thinking about the bike scene. That is the image that made the finale feel like home.',
  },
  {
    id: 'r16',
    dateKey: '2026-08-28',
    dateLabel: 'Aug 28',
    sentiment: 'positive',
    participantId: 'p02',
    participantName: 'Jordan Hale',
    questId: 'q003',
    questLabel: 'Upside Down walkthrough',
    taskId: 't020',
    taskLabel: 'Scene recall',
    source: 'Conversation',
    text: 'The walkthrough made the geography click. I finally understood how the two worlds sit together.',
  },
  {
    id: 'r17',
    dateKey: '2026-08-30',
    dateLabel: 'Aug 30',
    sentiment: 'neutral',
    participantId: 'p06',
    participantName: 'Kenji Sato',
    questId: 'q003',
    questLabel: 'Upside Down walkthrough',
    taskId: 't020',
    taskLabel: 'Scene recall',
    source: 'Survey',
    text: 'The recap was useful, though I already knew most of the map from earlier seasons.',
  },
  {
    id: 'r18',
    dateKey: '2026-09-01',
    dateLabel: 'Sep 01',
    sentiment: 'negative',
    participantId: 'p03',
    participantName: 'Priya Shah',
    questId: 'q005',
    questLabel: 'Group watch protocol',
    taskId: 't030',
    taskLabel: 'Watch log',
    source: 'Conversation',
    text: 'The group protocol felt rigid. People wanted to pause and talk, and the task kept pushing us forward.',
  },
  {
    id: 'r19',
    dateKey: '2026-09-02',
    dateLabel: 'Sep 02',
    sentiment: 'positive',
    participantId: 'p01',
    participantName: 'Maya Chen',
    questId: 'q005',
    questLabel: 'Group watch protocol',
    taskId: 't030',
    taskLabel: 'Watch log',
    source: 'Survey',
    text: 'Watching together with a shared prompt made the ending land. The discussion after was the best part.',
  },
];

export const MOCK_THEMES: ThemeRow[] = [
  {
    id: 'th1',
    rank: 1,
    name: 'Communication, content & accessibility',
    responseCount: 4,
    percent: 40,
    positive: 0,
    neutral: 100,
    negative: 0,
    participantIds: ['p01', 'p05', 'p07', 'p04'],
    taskIds: ['t010', 't001'],
  },
  {
    id: 'th2',
    rank: 2,
    name: 'Character payoff felt earned',
    responseCount: 3,
    percent: 30,
    positive: 100,
    neutral: 0,
    negative: 0,
    participantIds: ['p02', 'p04', 'p07'],
    taskIds: ['t002'],
  },
  {
    id: 'th3',
    rank: 3,
    name: 'Atmosphere and music cues',
    responseCount: 2,
    percent: 20,
    positive: 100,
    neutral: 0,
    negative: 0,
    participantIds: ['p01', 'p03'],
    taskIds: ['t001'],
  },
  {
    id: 'th4',
    rank: 4,
    name: 'Group moments and belonging',
    responseCount: 2,
    percent: 20,
    positive: 100,
    neutral: 0,
    negative: 0,
    participantIds: ['p04', 'p08'],
    taskIds: ['t002', 't001'],
  },
  {
    id: 'th5',
    rank: 5,
    name: 'Unresolved endings and pacing',
    responseCount: 2,
    percent: 20,
    positive: 50,
    neutral: 50,
    negative: 0,
    participantIds: ['p03', 'p01'],
    taskIds: ['t002', 't010'],
  },
];

export const MOCK_WORD_FREQUENCY: WordFrequencyRow[] = [
  { word: 'ending', count: 9, participantIds: ['p01', 'p03', 'p04', 'p08', 'p07'] },
  { word: 'character', count: 6, participantIds: ['p02', 'p03', 'p04', 'p07'] },
  { word: 'content', count: 4, participantIds: ['p05', 'p07', 'p04'] },
  { word: 'pattern', count: 3, participantIds: ['p06', 'p08'] },
  { word: 'people', count: 3, participantIds: ['p02', 'p04'] },
  { word: 'scene', count: 3, participantIds: ['p02', 'p08', 'p05'] },
  { word: 'change', count: 2, participantIds: ['p08'] },
  { word: 'accessible', count: 2, participantIds: ['p05', 'p07'] },
  { word: 'unresolved', count: 2, participantIds: ['p03', 'p04'] },
  { word: 'music', count: 2, participantIds: ['p03'] },
  { word: 'conversation', count: 2, participantIds: ['p02', 'p05'] },
  { word: 'home', count: 1, participantIds: ['p07'] },
];

export const MOCK_COMPLETION: CompletionQuest[] = [
  { id: 'q001', title: 'Stranger things finale (re)closure', completed: 18, total: 24 },
  { id: 'q002', title: 'Quest 1', completed: 9, total: 12 },
  { id: 'q003', title: 'Upside Down walkthrough', completed: 11, total: 18 },
  { id: 'q004', title: 'Vecna theory diary', completed: 0, total: 8 },
];

export function ordinal(place: number): string {
  const remainder = place % 100;
  if (remainder >= 11 && remainder <= 13) return `${place}th`;
  switch (place % 10) {
    case 1:
      return `${place}st`;
    case 2:
      return `${place}nd`;
    case 3:
      return `${place}rd`;
    default:
      return `${place}th`;
  }
}

export function matchesFilters(
  filters: AnalyticsFiltersState,
  meta: {
    participantId?: string;
    participantIds?: string[];
    questId?: string;
    taskId?: string;
    taskIds?: string[];
    source?: SentimentResponse['source'];
  }
): boolean {
  if (filters.participantId !== 'all') {
    const ids = meta.participantIds ?? (meta.participantId ? [meta.participantId] : []);
    if (!ids.includes(filters.participantId)) return false;
  }
  if (filters.questIds.length > 0) {
    const questId = meta.questId ?? (meta.taskId ? TASK_TO_QUEST[meta.taskId] : undefined);
    if (questId && !filters.questIds.includes(questId)) return false;
    if (!questId && meta.taskIds) {
      const quests = meta.taskIds.map((id) => TASK_TO_QUEST[id]).filter(Boolean);
      if (quests.length > 0 && !quests.some((id) => filters.questIds.includes(id))) return false;
    }
  }
  if (filters.taskIds.length > 0) {
    const ids = meta.taskIds ?? (meta.taskId ? [meta.taskId] : []);
    if (ids.length > 0 && !ids.some((id) => filters.taskIds.includes(id))) return false;
  }
  if (filters.responses === 'conversation' && meta.source && meta.source !== 'Conversation') return false;
  if (filters.responses === 'survey' && meta.source && meta.source !== 'Survey') return false;
  if (filters.responses === 'quotes' && meta.source && meta.source !== 'Conversation') return false;
  return true;
}

export function filterResponses(filters: AnalyticsFiltersState): SentimentResponse[] {
  return MOCK_SENTIMENT_RESPONSES.filter((row) => {
    if (row.dateKey < filters.dateFrom || row.dateKey > filters.dateTo) return false;
    return matchesFilters(filters, {
      participantId: row.participantId,
      questId: row.questId,
      taskId: row.taskId,
      source: row.source,
    });
  });
}

export function buildResponseTimeline(responses: SentimentResponse[]) {
  const days = ['Aug 27', 'Aug 28', 'Aug 29', 'Aug 30', 'Aug 31', 'Sep 01', 'Sep 02'];
  return days.map((date) => ({
    date,
    value: responses.filter((row) => row.dateLabel === date).length,
  }));
}

export interface SentimentAxisPoint {
  key: string;
  label: string;
  score: number;
  positive: number;
  neutral: number;
  negative: number;
  total: number;
}

export interface SentimentTimelineQuest {
  id: string;
  title: string;
  tasks: { id: string; title: string }[];
}

function sentimentScore(rows: SentimentResponse[]): Omit<SentimentAxisPoint, 'key' | 'label'> {
  const positive = rows.filter((row) => row.sentiment === 'positive').length;
  const neutral = rows.filter((row) => row.sentiment === 'neutral').length;
  const negative = rows.filter((row) => row.sentiment === 'negative').length;
  const total = rows.length;
  const score = total === 0 ? 0 : Math.round(((positive - negative) / total) * 100);
  return { score, positive, neutral, negative, total };
}

export function buildCollectiveSentimentTimeline(
  responses: SentimentResponse[],
  quests: SentimentTimelineQuest[],
  selectedQuestIds: string[],
  selectedTaskIds: string[] = []
): { mode: 'quest' | 'task'; points: SentimentAxisPoint[] } {
  const scopedQuests =
    selectedQuestIds.length === 0
      ? quests.filter((quest) => quest.tasks.length > 0)
      : quests.filter((quest) => selectedQuestIds.includes(quest.id));

  if (scopedQuests.length <= 1) {
    const quest = scopedQuests[0];
    const tasks = (quest?.tasks ?? []).filter(
      (task) => selectedTaskIds.length === 0 || selectedTaskIds.includes(task.id)
    );
    return {
      mode: 'task',
      points: tasks.map((task) => ({
        key: task.id,
        label: task.title,
        ...sentimentScore(responses.filter((row) => row.taskId === task.id)),
      })),
    };
  }

  return {
    mode: 'quest',
    points: scopedQuests.map((quest) => ({
      key: quest.id,
      label: quest.title,
      ...sentimentScore(responses.filter((row) => row.questId === quest.id)),
    })),
  };
}

export function filterThemes(filters: AnalyticsFiltersState): ThemeRow[] {
  return MOCK_THEMES.filter((theme) =>
    matchesFilters(filters, {
      participantIds: theme.participantIds,
      taskIds: theme.taskIds,
    })
  );
}

export function filterWords(filters: AnalyticsFiltersState): WordFrequencyRow[] {
  return MOCK_WORD_FREQUENCY.filter((row) =>
    matchesFilters(filters, { participantIds: row.participantIds })
  );
}

export function filterCompletion(filters: AnalyticsFiltersState): CompletionQuest[] {
  if (filters.participantId === 'all') return MOCK_COMPLETION;
  return MOCK_COMPLETION.map((quest) => ({
    ...quest,
    completed: Math.max(0, Math.round(quest.completed * 0.12)),
    total: Math.max(1, Math.round(quest.total * 0.12)),
  }));
}

export interface StudySummaryLog {
  id: string;
  createdAt: string;
  date: string;
  time: string;
  userName: string;
  userInitials: string;
  scope: string;
  description: string;
  body: string;
}

export function buildStudySummary(questTitles: string[], taskTitles: string[]): string {
  const quests = questTitles.length === 0 ? 'all quests' : questTitles.join(', ');
  const tasks = taskTitles.length === 0 ? 'all tasks' : taskTitles.join(', ');
  return [
    `Participants described the finale as emotionally loaded, with the strongest agreement around character payoff and atmosphere.`,
    `This summary covers ${quests}, focusing on ${tasks}. Opening reactions were mostly positive. Character-fate answers split between people who felt the ending was earned and people who still wanted unresolved threads named more clearly.`,
    `Survey and conversation answers both pointed to communication and accessibility as a recurring theme: captions, prompts, and task labels shaped how confidently people could talk about the story. Tree testing comments showed that a few people could not find where to log their ending reaction.`,
    `Overall sentiment leaned positive, with neutral comments clustering around pacing and setup scenes rather than outright rejection of the ending.`,
  ].join('\n\n');
}

export function summaryFromResponses(
  responses: SentimentResponse[],
  base: { participants: number; completion: string; standardQuests: number; diaryQuests: number; tasks: number; days: string }
) {
  if (base.participants === 0) return base;
  if (responses.length === 0) {
    return { ...base, participants: 0, completion: '0%' };
  }
  const uniquePeople = new Set(responses.map((row) => row.participantId)).size;
  return {
    ...base,
    participants: uniquePeople,
    completion: `${Math.round((uniquePeople / ANALYTICS_PARTICIPANTS.length) * 100)}%`,
  };
}
