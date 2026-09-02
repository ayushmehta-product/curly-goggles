import { MOCK_IDI_STUDIES } from '@/data/mock-idi-studies';
import { MOCK_FOCUS_GROUPS } from '@/data/mock-focus-groups';
import { MOCK_STUDY_OPERATIONAL_OVERVIEWS } from '@/data/mock-study-overview';
import { MOCK_MODERATED_WORKSPACE_SESSIONS, type ModeratedWorkspaceSession } from '@/data/mock-moderated-sessions';
import { MOCK_FOCUS_GROUP_SESSIONS, type FocusGroupSession } from '@/data/mock-focus-group-session';
import { MOCK_FOCUS_GROUP_WORKSPACES } from '@/data/mock-focus-group-scheduling';
import { getFolderById, getStudyById } from '@/data/mock-projects';
import type { InsightScopeRef } from '@/data/mock-ai-insights';
import type { ChatScope, ChatSessionSource, ContextOverride } from './chat-types';

export const STUDY_CREATION_ROUTE_PREFIXES = ['/idi-studies/create', '/focus-group-studies/create'];
export const INSIGHTS_HUB_CHATS_ROUTE = '/insights-hub-chats';

export function isStudyCreationRoute(pathname: string): boolean {
  return STUDY_CREATION_ROUTE_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export function isChatWidgetHiddenRoute(pathname: string): boolean {
  return isStudyCreationRoute(pathname) || pathname.startsWith(INSIGHTS_HUB_CHATS_ROUTE);
}

export function hasContextOverride(override: ContextOverride | undefined): boolean {
  return !!override && (override.idiSessionIds.length > 0 || override.fgFocusGroupIds.length > 0);
}

const VIDEO_SINGLE_PROMPTS = [
  'Do a thematic analysis of this video',
  'Suggest tags for this video',
  'Recommend tags that capture the most relevant terms from these sessions',
  'Add an annotation at the part where they talked about books',
  'Show moments and gives quotes for whenever the participant talked about books',
  'Do a word frequency analysis on this data and generate an exportable wordcloud for the same',
  'Find quotes supporting the key observations.',
  'What have I saved for this session so far?',
];

const IDI_COLLECTIVE_PROMPTS = [
  'Summary of these videos',
  'Compare key themes across these sessions',
  'Do a word frequency analysis across all sessions',
  'Which sessions need my attention?',
  'Suggest follow-up questions based on these interviews',
];

const FG_COLLECTIVE_PROMPTS = [
  'Summary of this session',
  'Compare perspectives across participants',
  'Do a word frequency analysis across this discussion',
  'Find quotes supporting the key takeaways',
  'Suggest follow-up questions based on this focus group',
];

export const GENERIC_PROMPTS = [
  'What needs my attention across my studies?',
  'How many studies are currently active?',
  'Show my most recently completed sessions',
  'Give me a study-level summary',
];

const PROJECT_DETAIL_PROMPTS = ['Summarize this study', ...GENERIC_PROMPTS];

const MULTI_SCOPE_PROMPTS = [
  'Do a thematic analysis across this selection',
  'Suggest tags for this selection',
  'Summary of this selection',
  'Compare perspectives across this selection',
  'What have I saved for this selection so far?',
];

function parseTimestampToSeconds(timestamp: string): number | undefined {
  const parts = timestamp.split(':').map((part) => Number(part));
  if (parts.length < 2 || parts.some((part) => Number.isNaN(part))) return undefined;
  return parts.reduce((total, part) => total * 60 + part, 0);
}

function toIdiSource(session: ModeratedWorkspaceSession): ChatSessionSource {
  return {
    participantLabel: session.participantName,
    summary: session.summary,
    transcript: session.transcript.map((line) => ({
      timestamp: line.timestamp,
      speaker: line.speaker,
      text: line.text,
      timestampSeconds: parseTimestampToSeconds(line.timestamp),
    })),
    keyPoints: session.keyObservations,
  };
}

function toFgSource(session: FocusGroupSession, participantLabel: string): ChatSessionSource {
  return {
    participantLabel,
    summary: session.summary,
    transcript: session.transcript.map((line) => ({
      timestamp: line.timestampLabel,
      speaker: line.speaker,
      text: line.text,
      timestampSeconds: line.timestampSeconds,
    })),
    keyPoints: session.keyTakeaways,
  };
}

function resolveIdiSessionScope(studyId: string, searchParams: URLSearchParams) {
  const study = MOCK_IDI_STUDIES.find((item) => item.id === studyId);
  const studySessions = MOCK_MODERATED_WORKSPACE_SESSIONS.filter((session) => session.studyId === studyId);
  const fallbackSessions =
    studySessions.length > 0 ? studySessions : MOCK_MODERATED_WORKSPACE_SESSIONS.filter((session) => session.studyId === 'idi-001');
  if (fallbackSessions.length === 0) return null;

  let activeSession = fallbackSessions[0];
  const overviewSessionId = searchParams.get('session');
  if (overviewSessionId) {
    const overview = MOCK_STUDY_OPERATIONAL_OVERVIEWS.find((item) => item.studyId === studyId);
    const overviewSession = overview?.sessions.find((item) => item.id === overviewSessionId);
    const matched = overviewSession
      ? fallbackSessions.find((session) => session.participantName === overviewSession.participantName)
      : undefined;
    if (matched) activeSession = matched;
  }

  const scope: ChatScope = {
    kind: 'idi-session',
    studyId,
    studyTitle: study?.title ?? 'IDI study',
    sessionId: activeSession.id,
    source: toIdiSource(activeSession),
  };
  return { scope, suggestedPrompts: VIDEO_SINGLE_PROMPTS };
}

function resolveIdiCollectiveScope(studyId: string) {
  const study = MOCK_IDI_STUDIES.find((item) => item.id === studyId);
  if (!study) return null;
  const sessions = MOCK_MODERATED_WORKSPACE_SESSIONS.filter((session) => session.studyId === studyId);

  const scope: ChatScope = {
    kind: 'idi-collective',
    studyId,
    studyTitle: study.title,
    sources: sessions.map(toIdiSource),
  };
  return { scope, suggestedPrompts: IDI_COLLECTIVE_PROMPTS };
}

function resolveFgSessionScope(focusGroupId: string, searchParams: URLSearchParams) {
  const focusGroup = MOCK_FOCUS_GROUPS.find((item) => item.id === focusGroupId);
  if (!focusGroup) return null;
  const session =
    MOCK_FOCUS_GROUP_SESSIONS.find((item) => item.focusGroupId === focusGroupId) ?? MOCK_FOCUS_GROUP_SESSIONS[0];
  const workspace = MOCK_FOCUS_GROUP_WORKSPACES.find((item) => item.focusGroupId === focusGroupId);
  const participantId = searchParams.get('participant');
  const participant = workspace?.participants.find((item) => item.id === participantId);
  const participantLabel = participant ? `${participant.firstName} ${participant.lastName}` : 'This group';

  const scope: ChatScope = {
    kind: 'fg-session',
    focusGroupId,
    focusGroupTitle: focusGroup.title,
    source: toFgSource(session, participantLabel),
  };
  return { scope, suggestedPrompts: VIDEO_SINGLE_PROMPTS };
}

function resolveFgCollectiveScope(focusGroupId: string) {
  const focusGroup = MOCK_FOCUS_GROUPS.find((item) => item.id === focusGroupId);
  const session = MOCK_FOCUS_GROUP_SESSIONS.find((item) => item.focusGroupId === focusGroupId);
  if (!focusGroup || !session) return null;

  const scope: ChatScope = {
    kind: 'fg-collective',
    focusGroupId,
    focusGroupTitle: focusGroup.title,
    source: toFgSource(session, 'This group'),
  };
  return { scope, suggestedPrompts: FG_COLLECTIVE_PROMPTS };
}

function genericLabelForPathname(pathname: string): string {
  if (pathname.startsWith('/insights-hub-chats')) return 'your research';
  if (pathname.startsWith('/idi-studies')) return 'your interview studies';
  if (pathname.startsWith('/focus-group-studies')) return 'your focus groups';
  if (pathname.startsWith('/projects')) return 'your studies';
  return 'this workspace';
}

function resolveProjectDetailScope(folderId: string, studyId?: string) {
  const study = studyId ? getStudyById(folderId, studyId) : undefined;
  const folder = getFolderById(folderId);
  const name = study?.name ?? folder?.name;
  const description = study?.description ?? folder?.name ?? 'this folder';
  const scope: ChatScope = {
    kind: 'generic',
    label: name ?? 'this study',
    project: name
      ? {
          name,
          description: description || name,
          status: study?.status ?? 'active',
          owner: 'Ayush Mehta',
          responses: study?.quests.reduce((sum, quest) => sum + quest.participantCount, 0) ?? 0,
        }
      : undefined,
  };
  return { scope, suggestedPrompts: PROJECT_DETAIL_PROMPTS };
}

/**
 * Builds an explicit multi-session/study scope from a `ContextOverride`, used when the user has
 * picked specific studies/sessions/focus groups via the chat context picker instead of relying on
 * the current page. A single, unambiguous selection resolves to a real save target (`saveScope`);
 * a mixed/plural selection is still fully queryable, but Save actions are disabled in the UI since
 * there is no single Themes/Tags/Annotations surface for it to write back to.
 */
function resolveOverrideScope(override: ContextOverride) {
  const idiSessions = MOCK_MODERATED_WORKSPACE_SESSIONS.filter((session) => override.idiSessionIds.includes(session.id));
  const fgGroups = MOCK_FOCUS_GROUPS.filter((group) => override.fgFocusGroupIds.includes(group.id));

  const fgSources = fgGroups
    .map((group) => {
      const session = MOCK_FOCUS_GROUP_SESSIONS.find((item) => item.focusGroupId === group.id);
      return session ? toFgSource(session, group.title) : null;
    })
    .filter((source): source is ChatSessionSource => source !== null);

  const sources: ChatSessionSource[] = [...idiSessions.map(toIdiSource), ...fgSources];
  if (sources.length === 0) return null;

  const distinctIdiStudyIds = new Set(idiSessions.map((session) => session.studyId));

  let saveScope: InsightScopeRef | null = null;
  if (idiSessions.length === 1 && fgGroups.length === 0) {
    saveScope = { kind: 'idi-session', studyId: idiSessions[0].studyId, sessionId: idiSessions[0].id };
  } else if (idiSessions.length > 1 && fgGroups.length === 0 && distinctIdiStudyIds.size === 1) {
    saveScope = { kind: 'idi-study', studyId: idiSessions[0].studyId };
  } else if (fgGroups.length === 1 && idiSessions.length === 0) {
    saveScope = { kind: 'fg-session', focusGroupId: fgGroups[0].id };
  }

  const labelParts = [...idiSessions.map((session) => session.participantName), ...fgGroups.map((group) => group.title)];
  const label = labelParts.length > 0 ? labelParts.join(', ') : 'Selected context';

  const scope: ChatScope = { kind: 'multi', label, sources, saveScope };
  return { scope, suggestedPrompts: sources.length > 1 ? MULTI_SCOPE_PROMPTS : VIDEO_SINGLE_PROMPTS };
}

export function resolveChatScope(
  pathname: string,
  searchParams: URLSearchParams,
  override?: ContextOverride
): { scope: ChatScope; suggestedPrompts: string[] } {
  if (hasContextOverride(override)) {
    const resolved = resolveOverrideScope(override!);
    if (resolved) return resolved;
  }

  const idiSessionMatch = pathname.match(/^\/idi-studies\/([^/]+)\/sessions/);
  if (idiSessionMatch) {
    const resolved = resolveIdiSessionScope(idiSessionMatch[1], searchParams);
    if (resolved) return resolved;
  }

  const idiCollectiveMatch = pathname.match(/^\/idi-studies\/([^/]+)(?:\/analyze)?$/);
  if (idiCollectiveMatch) {
    const resolved = resolveIdiCollectiveScope(idiCollectiveMatch[1]);
    if (resolved) return resolved;
  }

  const fgSessionMatch = pathname.match(/^\/focus-group-studies\/([^/]+)\/session$/);
  if (fgSessionMatch) {
    const resolved = resolveFgSessionScope(fgSessionMatch[1], searchParams);
    if (resolved) return resolved;
  }

  const fgCollectiveMatch = pathname.match(/^\/focus-group-studies\/([^/]+)(?:\/analyze)?$/);
  if (fgCollectiveMatch) {
    const resolved = resolveFgCollectiveScope(fgCollectiveMatch[1]);
    if (resolved) return resolved;
  }

  const projectDetailMatch = pathname.match(/^\/projects\/([^/]+)(?:\/([^/]+))?/);
  if (projectDetailMatch) {
    return resolveProjectDetailScope(projectDetailMatch[1], projectDetailMatch[2]);
  }

  return {
    scope: { kind: 'generic', label: genericLabelForPathname(pathname) },
    suggestedPrompts: GENERIC_PROMPTS,
  };
}

/**
 * The IDI sessions page deep-links via an "overview session id" (`?session=`), which is distinct
 * from the workspace session id (`ws-session-...`) the chat engine tracks internally. This reverses
 * that lookup so a chat quote can build a working session-page URL for its "Play at timestamp" action.
 */
export function resolveOverviewSessionId(studyId: string, sessionId: string): string | null {
  const session = MOCK_MODERATED_WORKSPACE_SESSIONS.find((item) => item.id === sessionId);
  if (!session) return null;
  const overview = MOCK_STUDY_OPERATIONAL_OVERVIEWS.find((item) => item.studyId === studyId);
  const overviewSession = overview?.sessions.find((item) => item.participantName === session.participantName);
  return overviewSession?.id ?? null;
}

export function scopeLabel(scope: ChatScope): string {
  switch (scope.kind) {
    case 'idi-session':
      return `${scope.source.participantLabel} · ${scope.studyTitle}`;
    case 'idi-collective':
      return scope.studyTitle;
    case 'fg-session':
      return `${scope.source.participantLabel} · ${scope.focusGroupTitle}`;
    case 'fg-collective':
      return scope.focusGroupTitle;
    case 'multi':
      return scope.label;
    case 'generic':
      return scope.project?.name ?? scope.label;
  }
}

export interface ContextPickerOption {
  value: string;
  label: string;
}

/**
 * Flat (non-grouped) option list for the chat context picker's WuCombobox. Values are encoded as
 * `idi:<studyId>:<sessionId>` or `fg:<focusGroupId>` so the picker can decode a multi-select back
 * into a `ContextOverride` without a second lookup pass.
 */
export function buildContextPickerOptions(): ContextPickerOption[] {
  const idiOptions = MOCK_MODERATED_WORKSPACE_SESSIONS.map((session) => {
    const study = MOCK_IDI_STUDIES.find((item) => item.id === session.studyId);
    return {
      value: `idi:${session.studyId}:${session.id}`,
      label: `${session.participantName} — ${study?.title ?? 'Interview study'}`,
    };
  });

  const fgOptions = MOCK_FOCUS_GROUPS.filter((group) =>
    MOCK_FOCUS_GROUP_SESSIONS.some((session) => session.focusGroupId === group.id)
  ).map((group) => ({
    value: `fg:${group.id}`,
    label: `${group.title} (focus group)`,
  }));

  return [...idiOptions, ...fgOptions];
}

export function overrideFromSelectedOptions(options: ContextPickerOption[]): ContextOverride {
  const idiSessionIds: string[] = [];
  const fgFocusGroupIds: string[] = [];

  for (const option of options) {
    const [kind, a, b] = option.value.split(':');
    if (kind === 'idi' && b) idiSessionIds.push(b);
    if (kind === 'fg' && a) fgFocusGroupIds.push(a);
  }

  return { idiSessionIds, fgFocusGroupIds };
}

export function selectedOptionsFromOverride(
  override: ContextOverride | undefined,
  options: ContextPickerOption[]
): ContextPickerOption[] {
  if (!override) return [];
  const idiValues = new Set(override.idiSessionIds.map((id) => options.find((option) => option.value.endsWith(`:${id}`))?.value));
  const fgValues = new Set(override.fgFocusGroupIds.map((id) => `fg:${id}`));
  return options.filter((option) => idiValues.has(option.value) || fgValues.has(option.value));
}
