import { normalizeInputUrl } from '@/data/site-fetch';
import { pageFromUrl, type PageControl, type PageLandmark, type SitePage } from '@/data/site-page-utils';
import {
  DEFAULT_DEMOGRAPHICS,
  type DemographicFilters,
  type RecruitmentMethod,
  type ScreenerItem,
} from '@/data/mock-usability-audience';

export type UsabilitySurface = 'website' | 'saas' | 'figma';

export type TaskSuccessMode = 'reach-page' | 'reach-section' | 'click-control' | 'participant-done';

export const MAX_VARIANTS = 5;

export interface TaskVariantMapping {
  startPageId: string | null;
  successMode: TaskSuccessMode;
  successPageId: string | null;
  successLandmarkId: string | null;
}

export interface UsabilityTaskDraft {
  id: string;
  title: string;
  instructions: string;
  mappings: Record<string, TaskVariantMapping>;
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

export interface UsabilityVariantDraft {
  id: string;
  name: string;
  website: WebsiteLinkState;
  saas: SaasLinkState;
  figma: FigmaLinkState;
  pages: SitePage[];
  fetchError: string | null;
  fetchBlocked: boolean;
}

export interface AudienceDraft {
  method: RecruitmentMethod;
  demographics: DemographicFilters;
  screeners: ScreenerItem[];
  requireNda: boolean;
  ndaCommit: boolean;
  participantGoal: number;
}

export interface UsabilityCreateDraft {
  surface: UsabilitySurface | null;
  variants: UsabilityVariantDraft[];
  audience: AudienceDraft;
  tasks: UsabilityTaskDraft[];
}

export const USABILITY_CREATE_STORAGE_KEY = 'qp-usability-create-draft';

export function evenSplit(goal: number, variantCount: number): number[] {
  if (variantCount <= 0) return [];
  const safeGoal = Math.max(0, Math.floor(goal));
  const base = Math.floor(safeGoal / variantCount);
  const rem = safeGoal % variantCount;
  return Array.from({ length: variantCount }, (_, index) => base + (index < rem ? 1 : 0));
}

export function formatEvenSplit(counts: number[]): string {
  if (counts.length === 0) return '0 testers';
  if (counts.length === 1) return `${counts[0]} testers`;
  if (counts.length === 2) return `${counts[0]} and ${counts[1]} testers`;
  return `${counts.slice(0, -1).join(', ')}, and ${counts[counts.length - 1]} testers`;
}

export function variantLetter(index: number): string {
  return String.fromCharCode(65 + (index % 26));
}

export function defaultVariantName(index: number): string {
  return `Variant ${variantLetter(index)}`;
}

function emptyWebsite(): WebsiteLinkState {
  return { url: '', recordingOnly: false, verified: false };
}

function emptySaas(): SaasLinkState {
  return { url: '', environment: 'Staging', email: '', verified: false };
}

function emptyFigma(): FigmaLinkState {
  return { connected: false, file: '', trackInteractive: true };
}

export function emptyMapping(): TaskVariantMapping {
  return {
    startPageId: null,
    successMode: 'reach-page',
    successPageId: null,
    successLandmarkId: null,
  };
}

export function emptyVariant(id: string, name: string): UsabilityVariantDraft {
  return {
    id,
    name,
    website: emptyWebsite(),
    saas: emptySaas(),
    figma: emptyFigma(),
    pages: [],
    fetchError: null,
    fetchBlocked: false,
  };
}

export function duplicateVariant(source: UsabilityVariantDraft, id: string, name: string): UsabilityVariantDraft {
  return {
    ...source,
    id,
    name,
    website: { ...source.website, verified: false },
    saas: { ...source.saas, verified: false },
    figma: { ...source.figma },
    pages: [...source.pages],
    fetchError: source.fetchError,
    fetchBlocked: source.fetchBlocked,
  };
}

export function emptyTask(id: string, variantIds: string[]): UsabilityTaskDraft {
  const mappings: Record<string, TaskVariantMapping> = {};
  for (const variantId of variantIds) {
    mappings[variantId] = emptyMapping();
  }
  return { id, title: '', instructions: '', mappings };
}

export const DEFAULT_VARIANT_ID = 'variant-a';

export const DEFAULT_AUDIENCE: AudienceDraft = {
  method: 'panel',
  demographics: { ...DEFAULT_DEMOGRAPHICS },
  screeners: [],
  requireNda: false,
  ndaCommit: false,
  participantGoal: 20,
};

export const DEFAULT_CREATE_DRAFT: UsabilityCreateDraft = {
  surface: null,
  variants: [emptyVariant(DEFAULT_VARIANT_ID, 'Variant A')],
  audience: DEFAULT_AUDIENCE,
  tasks: [emptyTask('task-1', [DEFAULT_VARIANT_ID])],
};

export function getTaskMapping(task: UsabilityTaskDraft, variantId: string): TaskVariantMapping {
  return task.mappings[variantId] ?? emptyMapping();
}

export function setTaskMapping(
  task: UsabilityTaskDraft,
  variantId: string,
  patch: Partial<TaskVariantMapping>
): UsabilityTaskDraft {
  const current = getTaskMapping(task, variantId);
  return {
    ...task,
    mappings: {
      ...task.mappings,
      [variantId]: { ...current, ...patch },
    },
  };
}

export function isTaskSuccessComplete(mapping: TaskVariantMapping): boolean {
  if (mapping.successMode === 'participant-done') return true;
  if (!mapping.successPageId) return false;
  if (mapping.successMode === 'reach-page') return true;
  return Boolean(mapping.successLandmarkId);
}

export function isTaskConfigured(task: UsabilityTaskDraft, variantId: string, hasPages: boolean): boolean {
  const mapping = getTaskMapping(task, variantId);
  if (mapping.successMode === 'participant-done') {
    return !hasPages || Boolean(mapping.startPageId);
  }
  if (!hasPages) return false;
  return Boolean(mapping.startPageId) && isTaskSuccessComplete(mapping);
}

export function isTaskConfiguredForAllVariants(task: UsabilityTaskDraft, draft: UsabilityCreateDraft): boolean {
  const isFigma = draft.surface === 'figma';
  return draft.variants.every((variant) => {
    if (isFigma) {
      const mapping = getTaskMapping(task, variant.id);
      return mapping.successMode === 'participant-done';
    }
    return isTaskConfigured(task, variant.id, variant.pages.length > 0);
  });
}

export function applyDefaultStartPages(
  tasks: UsabilityTaskDraft[],
  pages: SitePage[],
  variantId: string
): UsabilityTaskDraft[] {
  const startId = pages[0]?.id ?? null;
  if (!startId) return tasks;
  const ids = new Set(pages.map((page) => page.id));
  return tasks.map((task) => {
    const mapping = getTaskMapping(task, variantId);
    return setTaskMapping(task, variantId, {
      startPageId: mapping.startPageId && ids.has(mapping.startPageId) ? mapping.startPageId : startId,
      successPageId: mapping.successPageId && ids.has(mapping.successPageId) ? mapping.successPageId : null,
    });
  });
}

export function addCustomPage(pages: SitePage[], rawUrl: string): { pages: SitePage[]; page: SitePage } | { error: string } {
  const url = normalizeInputUrl(rawUrl);
  if (!url) return { error: 'Enter a public http(s) page URL' };
  const page = pageFromUrl(url);
  const existing = pages.find((item) => item.url === page.url);
  if (existing) return { pages, page: existing };
  return { pages: [...pages, page], page };
}

export function taskSuccessSummary(task: UsabilityTaskDraft, pages: SitePage[], variantId: string): string {
  const mapping = getTaskMapping(task, variantId);
  const start = pages.find((page) => page.id === mapping.startPageId)?.label;
  const success = pages.find((page) => page.id === mapping.successPageId)?.label;
  if (mapping.successMode === 'participant-done') {
    return start ? `Starts on ${start}. Participant marks done.` : 'Participant marks done.';
  }
  if (!success) return 'Success not set';
  if (mapping.successMode === 'reach-page') {
    return `${start ? `Starts on ${start}. ` : ''}They reach ${success}.`;
  }
  if (mapping.successMode === 'reach-section') {
    return `${start ? `Starts on ${start}. ` : ''}They reach a section on ${success}.`;
  }
  return `${start ? `Starts on ${start}. ` : ''}They click a control on ${success}.`;
}

export function pageCatalogUrl(variant: UsabilityVariantDraft, surface: UsabilitySurface | null): string {
  if (surface === 'saas') return variant.saas.url.trim();
  return variant.website.url.trim();
}

export function isVariantConnected(surface: UsabilitySurface | null, variant: UsabilityVariantDraft): boolean {
  if (surface === 'website') return variant.website.verified;
  if (surface === 'saas') return variant.saas.verified;
  if (surface === 'figma') return variant.figma.connected && Boolean(variant.figma.file);
  return false;
}

export function areAllVariantsConnected(draft: UsabilityCreateDraft): boolean {
  if (!draft.surface || draft.variants.length === 0) return false;
  return draft.variants.every((variant) => isVariantConnected(draft.surface, variant));
}

export function attachMappingsToNewVariant(tasks: UsabilityTaskDraft[], sourceId: string, newId: string): UsabilityTaskDraft[] {
  return tasks.map((task) => {
    const source = getTaskMapping(task, sourceId);
    return {
      ...task,
      mappings: { ...task.mappings, [newId]: { ...source } },
    };
  });
}

function migrateLegacyTask(task: UsabilityTaskDraft & Partial<TaskVariantMapping>, variantIds: string[]): UsabilityTaskDraft {
  if (task.mappings && Object.keys(task.mappings).length > 0) {
    const mappings = { ...task.mappings };
    for (const variantId of variantIds) {
      if (!mappings[variantId]) mappings[variantId] = emptyMapping();
    }
    return { id: task.id, title: task.title, instructions: task.instructions, mappings };
  }
  const legacy: TaskVariantMapping = {
    startPageId: task.startPageId ?? null,
    successMode: task.successMode ?? 'reach-page',
    successPageId: task.successPageId ?? null,
    successLandmarkId: task.successLandmarkId ?? null,
  };
  const mappings: Record<string, TaskVariantMapping> = {};
  for (const variantId of variantIds) mappings[variantId] = { ...legacy };
  return { id: task.id, title: task.title ?? '', instructions: task.instructions ?? '', mappings };
}

function migrateLegacyDraft(parsed: Partial<UsabilityCreateDraft> & {
  website?: WebsiteLinkState;
  saas?: SaasLinkState;
  figma?: FigmaLinkState;
  pages?: SitePage[];
  fetchError?: string | null;
  fetchBlocked?: boolean;
}): UsabilityCreateDraft {
  let variants = parsed.variants && parsed.variants.length > 0
    ? parsed.variants.map((variant, index) => ({
        ...emptyVariant(variant.id || `variant-${index + 1}`, variant.name || defaultVariantName(index)),
        ...variant,
        website: { ...emptyWebsite(), ...variant.website },
        saas: { ...emptySaas(), ...variant.saas },
        figma: { ...emptyFigma(), ...variant.figma },
        pages: variant.pages ?? [],
      }))
    : [
        {
          ...emptyVariant(DEFAULT_VARIANT_ID, 'Variant A'),
          website: { ...emptyWebsite(), ...parsed.website },
          saas: { ...emptySaas(), ...parsed.saas },
          figma: { ...emptyFigma(), ...parsed.figma },
          pages: parsed.pages ?? [],
          fetchError: parsed.fetchError ?? null,
          fetchBlocked: Boolean(parsed.fetchBlocked),
        },
      ];

  const variantIds = variants.map((variant) => variant.id);
  const tasks = parsed.tasks && parsed.tasks.length > 0
    ? parsed.tasks.map((task) => migrateLegacyTask(task as UsabilityTaskDraft & Partial<TaskVariantMapping>, variantIds))
    : [emptyTask('task-1', variantIds)];

  return {
    surface: parsed.surface ?? null,
    variants,
    audience: {
      ...DEFAULT_AUDIENCE,
      ...parsed.audience,
      demographics: { ...DEFAULT_DEMOGRAPHICS, ...parsed.audience?.demographics },
      screeners: parsed.audience?.screeners ?? [],
    },
    tasks,
  };
}

export function loadCreateDraft(): UsabilityCreateDraft {
  if (typeof window === 'undefined') return DEFAULT_CREATE_DRAFT;
  try {
    const raw = window.sessionStorage.getItem(USABILITY_CREATE_STORAGE_KEY);
    if (!raw) return DEFAULT_CREATE_DRAFT;
    const parsed = JSON.parse(raw) as Partial<UsabilityCreateDraft> & {
      website?: WebsiteLinkState;
      saas?: SaasLinkState;
      figma?: FigmaLinkState;
      pages?: SitePage[];
    };
    return migrateLegacyDraft(parsed);
  } catch {
    return DEFAULT_CREATE_DRAFT;
  }
}

export function saveCreateDraft(draft: UsabilityCreateDraft) {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(USABILITY_CREATE_STORAGE_KEY, JSON.stringify(draft));
}

export type LandmarkCache = Record<string, { sections: PageLandmark[]; controls: PageControl[] }>;
