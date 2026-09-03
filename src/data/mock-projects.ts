import type { TreeTestingConfig } from '@/data/mock-tree-testing';
import { MOCK_DUNKIN_TREE, MOCK_FINDABILITY_TASKS } from '@/data/mock-tree-testing';
import { cloneTree } from '@/data/tree-utils';
import type { CardSortingConfig } from '@/data/mock-card-sorting';
import { demoCardSortingConfig } from '@/data/mock-card-sorting';

export type StudyStatus = 'live' | 'closed' | 'draft';
export type QuestType = 'Standard' | 'Diary';
export type QuestStatus = 'live' | 'closed' | 'draft';

export type QuestTaskType =
  | 'conversation'
  | 'fill-in-the-blank'
  | 'idea-markup'
  | 'survey'
  | 'video'
  | 'voting'
  | 'photo-journal'
  | 'tree-testing'
  | 'card-sorting';

export interface QuestTask {
  id: string;
  title: string;
  type?: QuestTaskType;
  description?: string;
  showDescription?: boolean;
  treeTesting?: TreeTestingConfig;
  cardSorting?: CardSortingConfig;
}

export interface StudyQuest {
  id: string;
  title: string;
  type: QuestType;
  status: QuestStatus;
  participantCount: number;
  stepCount: number;
  thumbnail?: string;
  startsAt?: string;
  description?: string;
  tasks: QuestTask[];
}

export interface FolderStudy {
  id: string;
  folderId: string;
  name: string;
  type: QuestType;
  status: StudyStatus;
  description?: string;
  heroImage: string;
  heroTitle?: string;
  introductoryVideoName?: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  quests: StudyQuest[];
}

export interface StudyFolder {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

const HERO_STRANGER = '/study-hero.svg';
const HERO_LAB = '/study-hero-alt.svg';
const THUMB_FINALE = '/quest-thumb-finale.svg';
const THUMB_DIARY = '/quest-thumb-diary.svg';

export const MOCK_STUDY_FOLDERS: StudyFolder[] = [
  {
    id: 'f001',
    name: 'My Folder',
    createdAt: '2025-04-07',
    updatedAt: '2025-04-07',
  },
  {
    id: 'f002',
    name: 'Studies 2026',
    createdAt: '2026-01-20',
    updatedAt: '2026-01-20',
  },
  {
    id: 'f003',
    name: 'Mixed Method Studies',
    createdAt: '2026-04-09',
    updatedAt: '2026-04-09',
  },
  {
    id: 'f004',
    name: 'Onepoll',
    createdAt: '2026-08-10',
    updatedAt: '2026-08-10',
  },
  {
    id: 'f005',
    name: 'Product Research Q3',
    createdAt: '2025-07-02',
    updatedAt: '2025-09-14',
  },
  {
    id: 'f006',
    name: 'Healthcare Diary Program',
    createdAt: '2025-05-18',
    updatedAt: '2026-02-03',
  },
  {
    id: 'f007',
    name: 'North America Enterprise Voice of Customer and Longitudinal Brand Perception Tracker 2026',
    createdAt: '2025-11-04',
    updatedAt: '2026-03-22',
  },
  {
    id: 'f008',
    name: 'Archived Pilots',
    createdAt: '2024-12-01',
    updatedAt: '2025-01-15',
  },
  {
    id: 'f009',
    name: 'Retail Ethnography',
    createdAt: '2025-08-21',
    updatedAt: '2026-01-08',
  },
  {
    id: 'f010',
    name: 'Onboarding Journey 2025',
    createdAt: '2025-03-12',
    updatedAt: '2025-06-30',
  },
  {
    id: 'f011',
    name: 'Accessibility Audit Series',
    createdAt: '2026-02-11',
    updatedAt: '2026-05-19',
  },
  {
    id: 'f012',
    name: 'Campus Diary Spring',
    createdAt: '2026-03-03',
    updatedAt: '2026-04-28',
  },
];

export const MOCK_FOLDER_STUDIES: FolderStudy[] = [
  {
    id: 's001',
    folderId: 'f001',
    name: 'Stranger things - Finale',
    type: 'Standard',
    status: 'live',
    description:
      "Let's settle this once and for all. What do you think about the ending of Stranger Things? Is El alive or has Mike just . . . completely lost it?",
    heroImage: HERO_STRANGER,
    heroTitle: 'Stranger things - Finale',
    introductoryVideoName: undefined,
    published: true,
    createdAt: '2025-04-01',
    updatedAt: '2026-01-16',
    quests: [
      {
        id: 'q001',
        title: 'Stranger things finale (re)closure',
        type: 'Standard',
        status: 'live',
        participantCount: 24,
        stepCount: 8,
        thumbnail: THUMB_FINALE,
        startsAt: '2026-01-16T18:35:00',
        description: 'Please proceed through the tasks given in the quest. Thank you!',
        tasks: [
          {
            id: 't001',
            title: 'Wait... Where Were All the Demogorgons?',
            type: 'conversation',
            showDescription: true,
            description:
              'In the final battle of Season 5, the absence of the Demogorgons was hard to miss. Did you notice the lack of demo-creatures, and did it bother you?',
          },
          {
            id: 't002',
            title: "Was Will's coming out scene poorly timed?",
            type: 'conversation',
          },
          {
            id: 't003',
            title: "Woke messaging ruined Season 5",
            type: 'conversation',
          },
          {
            id: 't004',
            title: 'Hot take: what was your most controversial opinion',
            type: 'conversation',
          },
          { id: 't005', title: 'Final quest', type: 'survey' },
          { id: 't006', title: 'Survey 01', type: 'survey' },
          { id: 't007', title: 'PhotoJournal 01', type: 'photo-journal' },
        ],
      },
      {
        id: 'q002',
        title: 'Quest 1',
        type: 'Diary',
        status: 'live',
        participantCount: 12,
        stepCount: 5,
        thumbnail: THUMB_DIARY,
        startsAt: '2026-01-16T18:35:00',
        description: 'Please proceed through the tasks given in the quest. Thank you!',
        tasks: [
          { id: 't010', title: 'Survey 01', type: 'survey' },
          {
            id: 't011',
            title: 'Tree testing 01',
            type: 'tree-testing',
            treeTesting: {
              tree: cloneTree(MOCK_DUNKIN_TREE),
              findabilityTasks: MOCK_FINDABILITY_TASKS.map((task) => ({
                ...task,
                correctLeafIds: [...task.correctLeafIds],
              })),
            },
          },
          {
            id: 't012',
            title: 'Card sorting 01',
            type: 'card-sorting',
            cardSorting: demoCardSortingConfig(),
          },
        ],
      },
      {
        id: 'q003',
        title: 'Upside Down walkthrough',
        type: 'Standard',
        status: 'live',
        participantCount: 18,
        stepCount: 6,
        thumbnail: THUMB_FINALE,
        startsAt: '2026-01-20T10:00:00',
        tasks: [{ id: 't020', title: 'Scene recall' }],
      },
      {
        id: 'q004',
        title: 'Vecna theory diary',
        type: 'Diary',
        status: 'draft',
        participantCount: 0,
        stepCount: 4,
        startsAt: '2026-02-10T09:00:00',
        tasks: [],
      },
      {
        id: 'q005',
        title: 'Group watch protocol',
        type: 'Standard',
        status: 'closed',
        participantCount: 9,
        stepCount: 3,
        thumbnail: THUMB_DIARY,
        startsAt: '2026-02-01T14:00:00',
        tasks: [{ id: 't030', title: 'Watch log' }],
      },
    ],
  },
  {
    id: 's002',
    folderId: 'f001',
    name: 'Hawkins Lab follow-up diary',
    type: 'Diary',
    status: 'live',
    description: 'Seven-day diary capturing lingering questions after the lab reveal.',
    heroImage: HERO_LAB,
    published: true,
    createdAt: '2025-04-03',
    updatedAt: '2025-06-12',
    quests: [
      {
        id: 'q110',
        title: 'Daily lab notes',
        type: 'Diary',
        status: 'live',
        participantCount: 16,
        stepCount: 7,
        tasks: [{ id: 't110', title: 'Day 1 check-in' }],
      },
    ],
  },
  {
    id: 's003',
    folderId: 'f001',
    name: 'Season recap intercept',
    type: 'Standard',
    status: 'closed',
    description: 'Intercept study with viewers immediately after finishing the season.',
    heroImage: HERO_STRANGER,
    published: true,
    createdAt: '2025-03-22',
    updatedAt: '2025-05-02',
    quests: [
      {
        id: 'q120',
        title: 'Recap intercept',
        type: 'Standard',
        status: 'closed',
        participantCount: 40,
        stepCount: 10,
        tasks: [{ id: 't120', title: 'Survey 01' }],
      },
    ],
  },
  {
    id: 's004',
    folderId: 'f001',
    name: 'Fan community interviews',
    type: 'Standard',
    status: 'live',
    description: 'Moderated interviews with long-running fan community members.',
    heroImage: HERO_LAB,
    published: true,
    createdAt: '2025-04-05',
    updatedAt: '2025-08-19',
    quests: [
      {
        id: 'q130',
        title: 'Community voices',
        type: 'Standard',
        status: 'live',
        participantCount: 11,
        stepCount: 9,
        tasks: [{ id: 't130', title: 'Discussion guide' }],
      },
    ],
  },
  {
    id: 's005',
    folderId: 'f001',
    name: 'Streaming drop-off diary',
    type: 'Diary',
    status: 'draft',
    description: 'Understand where viewers paused or abandoned the finale arc.',
    heroImage: HERO_STRANGER,
    published: false,
    createdAt: '2025-04-06',
    updatedAt: '2025-04-06',
    quests: [],
  },
  {
    id: 's006',
    folderId: 'f001',
    name: 'Character attachment survey',
    type: 'Standard',
    status: 'live',
    description: 'Measure attachment to core characters before and after the finale.',
    heroImage: HERO_LAB,
    published: true,
    createdAt: '2025-02-18',
    updatedAt: '2025-09-01',
    quests: [
      {
        id: 'q140',
        title: 'Attachment battery',
        type: 'Standard',
        status: 'live',
        participantCount: 86,
        stepCount: 12,
        tasks: [{ id: 't140', title: 'Survey 01' }],
      },
    ],
  },
  {
    id: 's007',
    folderId: 'f001',
    name: 'Finale spoiler reaction',
    type: 'Diary',
    status: 'closed',
    description: 'Capture first-hour reactions from people who were spoiled vs. not spoiled.',
    heroImage: HERO_STRANGER,
    published: true,
    createdAt: '2025-03-30',
    updatedAt: '2025-07-11',
    quests: [
      {
        id: 'q150',
        title: 'Spoiler diary',
        type: 'Diary',
        status: 'closed',
        participantCount: 22,
        stepCount: 4,
        tasks: [{ id: 't150', title: 'Immediate reaction' }],
      },
    ],
  },
  {
    id: 's008',
    folderId: 'f001',
    name: 'Untitled study',
    type: 'Standard',
    status: 'draft',
    heroImage: HERO_LAB,
    published: false,
    createdAt: '2025-04-07',
    updatedAt: '2025-04-07',
    quests: [],
  },
  {
    id: 's009',
    folderId: 'f001',
    name: 'Cast reunion watch-along',
    type: 'Standard',
    status: 'live',
    description: 'Watch-along protocol for the reunion special with in-the-moment prompts.',
    heroImage: HERO_STRANGER,
    introductoryVideoName: 'reunion-brief.mp4',
    published: true,
    createdAt: '2025-04-04',
    updatedAt: '2026-01-09',
    quests: [
      {
        id: 'q160',
        title: 'Watch-along prompts',
        type: 'Standard',
        status: 'live',
        participantCount: 15,
        stepCount: 6,
        tasks: [{ id: 't160', title: 'Live prompts' }],
      },
    ],
  },
  {
    id: 's010',
    folderId: 'f002',
    name: '2026 research calendar kickoff',
    type: 'Standard',
    status: 'live',
    description: 'Planning study for the 2026 qualitative calendar and resourcing.',
    heroImage: HERO_LAB,
    published: true,
    createdAt: '2026-01-20',
    updatedAt: '2026-01-20',
    quests: [
      {
        id: 'q200',
        title: 'Kickoff survey',
        type: 'Standard',
        status: 'live',
        participantCount: 8,
        stepCount: 5,
        tasks: [{ id: 't200', title: 'Priorities' }],
      },
    ],
  },
  {
    id: 's011',
    folderId: 'f003',
    name: 'Checkout friction mixed method',
    type: 'Standard',
    status: 'live',
    description: 'Pair diary entries with follow-up interviews on checkout abandonment.',
    heroImage: HERO_LAB,
    published: true,
    createdAt: '2026-04-09',
    updatedAt: '2026-04-09',
    quests: [
      {
        id: 'q210',
        title: 'Diary then interview',
        type: 'Diary',
        status: 'live',
        participantCount: 14,
        stepCount: 8,
        tasks: [{ id: 't210', title: 'Checkout log' }],
      },
    ],
  },
  {
    id: 's012',
    folderId: 'f004',
    name: 'Onepoll panel quality check',
    type: 'Standard',
    status: 'closed',
    description: 'Quality and attention checks for the Onepoll panel sample.',
    heroImage: HERO_LAB,
    published: true,
    createdAt: '2026-08-10',
    updatedAt: '2026-08-10',
    quests: [
      {
        id: 'q220',
        title: 'Quality screener',
        type: 'Standard',
        status: 'closed',
        participantCount: 120,
        stepCount: 3,
        tasks: [{ id: 't220', title: 'Survey 01' }],
      },
    ],
  },
  {
    id: 's013',
    folderId: 'f005',
    name: 'Pricing page comprehension',
    type: 'Standard',
    status: 'live',
    description: 'Unmoderated study of how buyers parse new pricing tiers.',
    heroImage: HERO_LAB,
    published: true,
    createdAt: '2025-07-08',
    updatedAt: '2025-09-14',
    quests: [
      {
        id: 'q230',
        title: 'Tier walkthrough',
        type: 'Standard',
        status: 'live',
        participantCount: 20,
        stepCount: 7,
        tasks: [{ id: 't230', title: 'Task script' }],
      },
    ],
  },
  {
    id: 's014',
    folderId: 'f005',
    name: 'Admin settings findability',
    type: 'Standard',
    status: 'draft',
    description: 'Findability of billing and seat-management controls.',
    heroImage: HERO_LAB,
    published: false,
    createdAt: '2025-08-01',
    updatedAt: '2025-08-22',
    quests: [],
  },
  {
    id: 's015',
    folderId: 'f005',
    name: 'Notification preference diary',
    type: 'Diary',
    status: 'closed',
    description: 'Two-week diary of notification fatigue after the Q3 release.',
    heroImage: HERO_STRANGER,
    published: true,
    createdAt: '2025-07-02',
    updatedAt: '2025-08-18',
    quests: [
      {
        id: 'q240',
        title: 'Fatigue diary',
        type: 'Diary',
        status: 'closed',
        participantCount: 19,
        stepCount: 14,
        tasks: [{ id: 't240', title: 'Day 1' }],
      },
    ],
  },
  {
    id: 's016',
    folderId: 'f006',
    name: 'Medication reminder adherence',
    type: 'Diary',
    status: 'live',
    description: 'Diary of reminder usefulness for chronic-care patients.',
    heroImage: HERO_LAB,
    published: true,
    createdAt: '2025-05-18',
    updatedAt: '2026-02-03',
    quests: [
      {
        id: 'q250',
        title: 'Adherence log',
        type: 'Diary',
        status: 'live',
        participantCount: 32,
        stepCount: 21,
        tasks: [{ id: 't250', title: 'Week 1' }],
      },
    ],
  },
  {
    id: 's017',
    folderId: 'f006',
    name: 'Clinic waiting-room intercept',
    type: 'Standard',
    status: 'closed',
    description: 'In-clinic intercepts about portal signup barriers.',
    heroImage: HERO_LAB,
    published: true,
    createdAt: '2025-06-09',
    updatedAt: '2025-10-02',
    quests: [
      {
        id: 'q260',
        title: 'Waiting-room survey',
        type: 'Standard',
        status: 'closed',
        participantCount: 54,
        stepCount: 6,
        tasks: [{ id: 't260', title: 'Survey 01' }],
      },
    ],
  },
  {
    id: 's018',
    folderId: 'f007',
    name: 'Brand perception wave 1',
    type: 'Standard',
    status: 'live',
    description: 'First wave of the 2026 longitudinal brand tracker.',
    heroImage: HERO_LAB,
    published: true,
    createdAt: '2025-11-04',
    updatedAt: '2026-03-22',
    quests: [
      {
        id: 'q270',
        title: 'Wave 1 battery',
        type: 'Standard',
        status: 'live',
        participantCount: 210,
        stepCount: 18,
        tasks: [{ id: 't270', title: 'Core metrics' }],
      },
    ],
  },
  {
    id: 's019',
    folderId: 'f009',
    name: 'Aisle decision mapping',
    type: 'Diary',
    status: 'live',
    description: 'In-store diary of trade-off decisions in the snack aisle.',
    heroImage: HERO_LAB,
    published: true,
    createdAt: '2025-08-21',
    updatedAt: '2026-01-08',
    quests: [
      {
        id: 'q280',
        title: 'Aisle diary',
        type: 'Diary',
        status: 'live',
        participantCount: 13,
        stepCount: 5,
        tasks: [{ id: 't280', title: 'Store visit 1' }],
      },
    ],
  },
  {
    id: 's020',
    folderId: 'f009',
    name: 'Self-checkout recovery',
    type: 'Standard',
    status: 'draft',
    description: 'Observe recovery after a self-checkout error.',
    heroImage: HERO_LAB,
    published: false,
    createdAt: '2025-09-10',
    updatedAt: '2025-09-10',
    quests: [],
  },
  {
    id: 's021',
    folderId: 'f010',
    name: 'First-week activation',
    type: 'Diary',
    status: 'closed',
    description: 'Seven-day diary of first-week product activation.',
    heroImage: HERO_LAB,
    published: true,
    createdAt: '2025-03-12',
    updatedAt: '2025-06-30',
    quests: [
      {
        id: 'q290',
        title: 'Activation diary',
        type: 'Diary',
        status: 'closed',
        participantCount: 28,
        stepCount: 7,
        tasks: [{ id: 't290', title: 'Day 1' }],
      },
    ],
  },
  {
    id: 's022',
    folderId: 'f011',
    name: 'Keyboard-only admin flows',
    type: 'Standard',
    status: 'live',
    description: 'Task-based study of keyboard-only administration.',
    heroImage: HERO_LAB,
    published: true,
    createdAt: '2026-02-11',
    updatedAt: '2026-05-19',
    quests: [
      {
        id: 'q300',
        title: 'Keyboard tasks',
        type: 'Standard',
        status: 'live',
        participantCount: 10,
        stepCount: 8,
        tasks: [{ id: 't300', title: 'Invite a teammate' }],
      },
    ],
  },
  {
    id: 's023',
    folderId: 'f012',
    name: 'Dorm wifi reliability diary',
    type: 'Diary',
    status: 'live',
    description: 'Campus diary of wifi reliability during exam week.',
    heroImage: HERO_LAB,
    published: true,
    createdAt: '2026-03-03',
    updatedAt: '2026-04-28',
    quests: [
      {
        id: 'q310',
        title: 'Exam-week log',
        type: 'Diary',
        status: 'live',
        participantCount: 25,
        stepCount: 10,
        tasks: [{ id: 't310', title: 'Sunday check-in' }],
      },
    ],
  },
];

export const MOCK_RECYCLE_FOLDERS: StudyFolder[] = [
  { id: 'r001', name: 'new folder', createdAt: '2026-01-19', updatedAt: '2026-01-19' },
  { id: 'r002', name: 'asd', createdAt: '2026-03-16', updatedAt: '2026-01-20' },
  { id: 'r003', name: 'desk', createdAt: '2026-03-16', updatedAt: '2026-01-20' },
];

export function getFolderById(folderId: string): StudyFolder | undefined {
  return MOCK_STUDY_FOLDERS.find((folder) => folder.id === folderId);
}

export function getStudiesByFolderId(folderId: string): FolderStudy[] {
  return MOCK_FOLDER_STUDIES.filter((study) => study.folderId === folderId);
}

export function getFolderStudyCount(folderId: string): number {
  return getStudiesByFolderId(folderId).length;
}

export function getStudyById(folderId: string, studyId: string): FolderStudy | undefined {
  return MOCK_FOLDER_STUDIES.find((study) => study.folderId === folderId && study.id === studyId);
}

export function getQuestById(
  folderId: string,
  studyId: string,
  questId: string
): { study: FolderStudy; quest: StudyQuest } | undefined {
  const study = getStudyById(folderId, studyId);
  if (!study) return undefined;
  const quest = study.quests.find((item) => item.id === questId);
  if (!quest) return undefined;
  return { study, quest };
}

export function getTaskById(
  folderId: string,
  studyId: string,
  questId: string,
  taskId: string
): { study: FolderStudy; quest: StudyQuest; task: QuestTask } | undefined {
  const found = getQuestById(folderId, studyId, questId);
  if (!found) return undefined;
  const task = found.quest.tasks.find((item) => item.id === taskId);
  if (!task) return undefined;
  return { ...found, task };
}
