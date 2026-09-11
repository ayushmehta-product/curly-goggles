import { normalizeInputUrl } from '@/data/site-fetch';
import { pageFromUrl, type PageControl, type PageLandmark, type SitePage } from '@/data/site-page-utils';

export type UsabilitySurface = 'website' | 'saas' | 'figma';

export type TaskSuccessMode = 'reach-page' | 'reach-section' | 'click-control' | 'participant-done';

export interface UsabilityTaskDraft {
  id: string;
  title: string;
  instructions: string;
  startPageId: string | null;
  successMode: TaskSuccessMode;
  successPageId: string | null;
  successLandmarkId: string | null;
}

export interface WebsiteLinkState {
  url: string;
  recordingOnly: boolean;
  verified: boolean;
}

export interface SaasLinkState {
  url: string;
  environment: string;
  email: string;
  verified: boolean;
}

export interface FigmaLinkState {
  connected: boolean;
  file: string;
  trackInteractive: boolean;
}

export interface UsabilityCreateDraft {
  surface: UsabilitySurface | null;
  website: WebsiteLinkState;
  saas: SaasLinkState;
  figma: FigmaLinkState;
  pages: SitePage[];
  fetchError: string | null;
  fetchBlocked: boolean;
  tasks: UsabilityTaskDraft[];
}

export const USABILITY_CREATE_STORAGE_KEY = 'qp-usability-create-draft';

export const DEFAULT_CREATE_DRAFT: UsabilityCreateDraft = {
  surface: null,
  website: { url: '', recordingOnly: false, verified: false },
  saas: { url: '', environment: 'Staging', email: '', verified: false },
  figma: { connected: false, file: '', trackInteractive: true },
  pages: [],
  fetchError: null,
  fetchBlocked: false,
  tasks: [emptyTask('task-1')],
};

export function emptyTask(id: string): UsabilityTaskDraft {
  return {
    id,
    title: '',
    instructions: '',
    startPageId: null,
    successMode: 'reach-page',
    successPageId: null,
    successLandmarkId: null,
  };
}

export function isTaskSuccessComplete(task: UsabilityTaskDraft): boolean {
  if (task.successMode === 'participant-done') return true;
  if (!task.successPageId) return false;
  if (task.successMode === 'reach-page') return true;
  return Boolean(task.successLandmarkId);
}

export function isTaskConfigured(task: UsabilityTaskDraft, hasPages: boolean): boolean {
  if (task.successMode === 'participant-done') {
    return !hasPages || Boolean(task.startPageId);
  }
  if (!hasPages) return false;
  return Boolean(task.startPageId) && isTaskSuccessComplete(task);
}

export function applyDefaultStartPages(tasks: UsabilityTaskDraft[], pages: SitePage[]): UsabilityTaskDraft[] {
  const startId = pages[0]?.id ?? null;
  if (!startId) return tasks;
  const ids = new Set(pages.map((page) => page.id));
  return tasks.map((task) => ({
    ...task,
    startPageId: task.startPageId && ids.has(task.startPageId) ? task.startPageId : startId,
    successPageId: task.successPageId && ids.has(task.successPageId) ? task.successPageId : null,
  }));
}

export function addCustomPage(pages: SitePage[], rawUrl: string): { pages: SitePage[]; page: SitePage } | { error: string } {
  const url = normalizeInputUrl(rawUrl);
  if (!url) return { error: 'Enter a public http(s) page URL' };
  const page = pageFromUrl(url);
  const existing = pages.find((item) => item.url === page.url);
  if (existing) return { pages, page: existing };
  return { pages: [...pages, page], page };
}

export function taskSuccessSummary(task: UsabilityTaskDraft, pages: SitePage[]): string {
  const start = pages.find((page) => page.id === task.startPageId)?.label;
  const success = pages.find((page) => page.id === task.successPageId)?.label;
  if (task.successMode === 'participant-done') {
    return start ? `Starts on ${start}. Participant marks done.` : 'Participant marks done.';
  }
  if (!success) return 'Success not set';
  if (task.successMode === 'reach-page') {
    return `${start ? `Starts on ${start}. ` : ''}They reach ${success}.`;
  }
  if (task.successMode === 'reach-section') {
    return `${start ? `Starts on ${start}. ` : ''}They reach a section on ${success}.`;
  }
  return `${start ? `Starts on ${start}. ` : ''}They click a control on ${success}.`;
}

export function pageCatalogUrl(draft: UsabilityCreateDraft): string {
  if (draft.surface === 'saas') return draft.saas.url.trim();
  return draft.website.url.trim();
}

export function loadCreateDraft(): UsabilityCreateDraft {
  if (typeof window === 'undefined') return DEFAULT_CREATE_DRAFT;
  try {
    const raw = window.sessionStorage.getItem(USABILITY_CREATE_STORAGE_KEY);
    if (!raw) return DEFAULT_CREATE_DRAFT;
    const parsed = JSON.parse(raw) as Partial<UsabilityCreateDraft>;
    return {
      ...DEFAULT_CREATE_DRAFT,
      ...parsed,
      website: { ...DEFAULT_CREATE_DRAFT.website, ...parsed.website },
      saas: { ...DEFAULT_CREATE_DRAFT.saas, ...parsed.saas },
      figma: { ...DEFAULT_CREATE_DRAFT.figma, ...parsed.figma },
      pages: parsed.pages ?? [],
      tasks: parsed.tasks && parsed.tasks.length > 0 ? parsed.tasks : DEFAULT_CREATE_DRAFT.tasks,
    };
  } catch {
    return DEFAULT_CREATE_DRAFT;
  }
}

export function saveCreateDraft(draft: UsabilityCreateDraft) {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(USABILITY_CREATE_STORAGE_KEY, JSON.stringify(draft));
}

export type LandmarkCache = Record<string, { sections: PageLandmark[]; controls: PageControl[] }>;
