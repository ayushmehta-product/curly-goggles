import {
  type AiAnnotation,
  type AiInsightStatus,
  type AiTag,
  type AiTheme,
  type InsightScopeRef,
} from '@/data/mock-ai-insights';
import { loadInsights, saveInsights } from './ai-insights-store';
import type { ChatQuote, ChatScope } from './chat-types';

let insightIdSeq = 0;
function nextInsightId(prefix: string): string {
  insightIdSeq += 1;
  return `${prefix}-${Date.now().toString(36)}-${insightIdSeq}`;
}

/** Resolves the single save target for a chat scope, or null if the scope has no clean target
 * (e.g. a generic page with nothing picked, or a cross-study selection with no single home). */
export function scopeRefFromChatScope(scope: ChatScope): InsightScopeRef | null {
  switch (scope.kind) {
    case 'idi-session':
      return { kind: 'idi-session', studyId: scope.studyId, sessionId: scope.sessionId };
    case 'idi-collective':
      return { kind: 'idi-study', studyId: scope.studyId };
    case 'fg-session':
      return { kind: 'fg-session', focusGroupId: scope.focusGroupId };
    case 'fg-collective':
      return { kind: 'fg-study', focusGroupId: scope.focusGroupId };
    case 'multi':
      return scope.saveScope;
    case 'generic':
      return null;
  }
}

function toExcerpt(quote: ChatQuote) {
  return { quote: quote.text, speaker: quote.speaker, timestamp: quote.timestamp, timestampSeconds: quote.timestampSeconds };
}

export function saveThemeFromResponse(
  theme: { title: string; quotes: ChatQuote[] },
  scope: InsightScopeRef,
  color: AiTheme['color'] = 'blue'
): AiTheme {
  const nowIso = new Date().toISOString();
  const newTheme: AiTheme = {
    id: nextInsightId('ai-theme'),
    scope,
    label: theme.title,
    color,
    excerpts: theme.quotes.map(toExcerpt),
    status: 'saved',
    createdBy: 'ai',
    createdAt: nowIso,
    updatedAt: nowIso,
  };

  const data = loadInsights();
  saveInsights({ ...data, themes: [...data.themes, newTheme] });
  return newTheme;
}

export function saveTagsFromResponse(tags: string[], scope: InsightScopeRef): AiTag[] {
  const nowIso = new Date().toISOString();
  const newTags: AiTag[] = tags.map((label) => ({
    id: nextInsightId('ai-tag'),
    scope,
    label,
    excerpts: [],
    status: 'saved',
    createdBy: 'ai',
    createdAt: nowIso,
    updatedAt: nowIso,
  }));

  const data = loadInsights();
  saveInsights({ ...data, tags: [...data.tags, ...newTags] });
  return newTags;
}

export function saveAnnotationFromQuote(quote: ChatQuote, note: string, scope: InsightScopeRef): AiAnnotation {
  const nowIso = new Date().toISOString();
  const newAnnotation: AiAnnotation = {
    id: nextInsightId('ai-annotation'),
    scope,
    note,
    excerpt: toExcerpt(quote),
    status: 'saved',
    createdBy: 'ai',
    createdAt: nowIso,
    updatedAt: nowIso,
  };

  const data = loadInsights();
  saveInsights({ ...data, annotations: [...data.annotations, newAnnotation] });
  return newAnnotation;
}

type InsightKind = 'theme' | 'tag' | 'annotation';

export function updateInsight(
  kind: InsightKind,
  id: string,
  patch: Partial<Pick<AiTheme, 'label'>> & Partial<Pick<AiAnnotation, 'note'>>
): void {
  const data = loadInsights();
  const nowIso = new Date().toISOString();

  if (kind === 'theme') {
    saveInsights({
      ...data,
      themes: data.themes.map((theme) =>
        theme.id === id ? { ...theme, label: patch.label ?? theme.label, updatedAt: nowIso } : theme
      ),
    });
  } else if (kind === 'tag') {
    saveInsights({
      ...data,
      tags: data.tags.map((tag) => (tag.id === id ? { ...tag, label: patch.label ?? tag.label, updatedAt: nowIso } : tag)),
    });
  } else {
    saveInsights({
      ...data,
      annotations: data.annotations.map((annotation) =>
        annotation.id === id ? { ...annotation, note: patch.note ?? annotation.note, updatedAt: nowIso } : annotation
      ),
    });
  }
}

export function setInsightStatus(kind: InsightKind, id: string, status: AiInsightStatus): void {
  const data = loadInsights();
  const nowIso = new Date().toISOString();

  if (kind === 'theme') {
    saveInsights({ ...data, themes: data.themes.map((theme) => (theme.id === id ? { ...theme, status, updatedAt: nowIso } : theme)) });
  } else if (kind === 'tag') {
    saveInsights({ ...data, tags: data.tags.map((tag) => (tag.id === id ? { ...tag, status, updatedAt: nowIso } : tag)) });
  } else {
    saveInsights({
      ...data,
      annotations: data.annotations.map((annotation) => (annotation.id === id ? { ...annotation, status, updatedAt: nowIso } : annotation)),
    });
  }
}

export function validateInsight(kind: InsightKind, id: string): void {
  setInsightStatus(kind, id, 'validated');
}

export function deleteInsight(kind: InsightKind, id: string): void {
  const data = loadInsights();

  if (kind === 'theme') {
    saveInsights({ ...data, themes: data.themes.filter((theme) => theme.id !== id) });
  } else if (kind === 'tag') {
    saveInsights({ ...data, tags: data.tags.filter((tag) => tag.id !== id) });
  } else {
    saveInsights({ ...data, annotations: data.annotations.filter((annotation) => annotation.id !== id) });
  }
}
