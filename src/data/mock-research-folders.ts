import { MOCK_FOCUS_GROUPS, type FocusGroup } from '@/data/mock-focus-groups';
import { MOCK_IDI_STUDIES, type IdiStudy } from '@/data/mock-idi-studies';
import { MOCK_FOLDER_STUDIES, MOCK_STUDY_FOLDERS, type FolderStudy, type StudyFolder } from '@/data/mock-projects';
import { MOCK_USABILITY_TESTS, type UsabilityTest } from '@/data/mock-usability-tests';

export type ResearchArea = 'usability-tests' | 'interviews' | 'focus-groups' | 'studies';

export interface ResearchFolder {
  id: string;
  area: Exclude<ResearchArea, 'studies'>;
  name: string;
}

export const RESEARCH_AREA_LABELS: Record<ResearchArea, string> = {
  'usability-tests': 'Usability tests',
  interviews: 'Interviews',
  'focus-groups': 'Focus groups',
  studies: 'Studies',
};

export const RESEARCH_AREA_ICONS: Record<ResearchArea, string> = {
  'usability-tests': 'wm-touch-app',
  interviews: 'wm-mic',
  'focus-groups': 'wm-groups',
  studies: 'wm-folder',
};

export const USABILITY_TEST_FOLDERS: ResearchFolder[] = [
  { id: 'utf-onboarding', area: 'usability-tests', name: 'Onboarding tests' },
  { id: 'utf-checkout', area: 'usability-tests', name: 'Checkout and conversion' },
];

export const INTERVIEW_FOLDERS: ResearchFolder[] = [
  { id: 'idf-enterprise', area: 'interviews', name: 'Enterprise interviews' },
  { id: 'idf-healthcare', area: 'interviews', name: 'Healthcare interviews' },
];

export const FOCUS_GROUP_FOLDERS: ResearchFolder[] = [
  { id: 'fgf-commerce', area: 'focus-groups', name: 'Commerce groups' },
  { id: 'fgf-trust', area: 'focus-groups', name: 'Trust research' },
];

export function foldersForArea(area: Exclude<ResearchArea, 'studies'>): ResearchFolder[] {
  if (area === 'usability-tests') return USABILITY_TEST_FOLDERS;
  if (area === 'interviews') return INTERVIEW_FOLDERS;
  return FOCUS_GROUP_FOLDERS;
}

export function unfiledUsabilityTests(): UsabilityTest[] {
  return MOCK_USABILITY_TESTS.filter((item) => !item.folderId);
}

export function usabilityTestsInFolder(folderId: string): UsabilityTest[] {
  return MOCK_USABILITY_TESTS.filter((item) => item.folderId === folderId);
}

export function unfiledInterviews(): IdiStudy[] {
  return MOCK_IDI_STUDIES.filter((item) => !item.folderId);
}

export function interviewsInFolder(folderId: string): IdiStudy[] {
  return MOCK_IDI_STUDIES.filter((item) => item.folderId === folderId);
}

export function unfiledFocusGroups(): FocusGroup[] {
  return MOCK_FOCUS_GROUPS.filter((item) => !item.folderId);
}

export function focusGroupsInFolder(folderId: string): FocusGroup[] {
  return MOCK_FOCUS_GROUPS.filter((item) => item.folderId === folderId);
}

export function studyFolders(): StudyFolder[] {
  return MOCK_STUDY_FOLDERS;
}

export function studiesInFolder(folderId: string): FolderStudy[] {
  return MOCK_FOLDER_STUDIES.filter((study) => study.folderId === folderId);
}
