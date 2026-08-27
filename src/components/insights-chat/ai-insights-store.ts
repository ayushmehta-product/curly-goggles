import { useEffect, useState } from 'react';
import {
  MOCK_AI_INSIGHTS_SEED,
  scopeRefsMatch,
  type AiAnnotation,
  type AiInsightsData,
  type AiTag,
  type AiTheme,
  type InsightScopeRef,
} from '@/data/mock-ai-insights';

export const AI_INSIGHTS_STORAGE_KEY = 'insightshub_ai_insights_v1';
export const AI_INSIGHTS_UPDATED_EVENT = 'insightshub:ai-insights-updated';

export function loadInsights(): AiInsightsData {
  if (typeof window === 'undefined') return MOCK_AI_INSIGHTS_SEED;

  const storedValue = window.localStorage.getItem(AI_INSIGHTS_STORAGE_KEY);
  if (!storedValue) return MOCK_AI_INSIGHTS_SEED;

  try {
    return JSON.parse(storedValue) as AiInsightsData;
  } catch {
    return MOCK_AI_INSIGHTS_SEED;
  }
}

export function saveInsights(data: AiInsightsData) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(AI_INSIGHTS_STORAGE_KEY, JSON.stringify(data));
  window.dispatchEvent(new Event(AI_INSIGHTS_UPDATED_EVENT));
}

export function themesForScope(data: AiInsightsData, scope: InsightScopeRef): AiTheme[] {
  return data.themes.filter((theme) => scopeRefsMatch(theme.scope, scope));
}

export function tagsForScope(data: AiInsightsData, scope: InsightScopeRef): AiTag[] {
  return data.tags.filter((tag) => scopeRefsMatch(tag.scope, scope));
}

export function annotationsForScope(data: AiInsightsData, scope: InsightScopeRef): AiAnnotation[] {
  return data.annotations.filter((annotation) => scopeRefsMatch(annotation.scope, scope));
}

/**
 * Live view of the AI insights store. Chat surfaces write via `saveInsights`, which dispatches
 * `AI_INSIGHTS_UPDATED_EVENT`; any page rendering saved themes/tags/annotations can use this hook
 * to stay in sync without a global store (there is no Context/Redux in this project).
 */
export function useAiInsights(): AiInsightsData {
  const [data, setData] = useState<AiInsightsData>(() => loadInsights());

  useEffect(() => {
    function handleUpdate() {
      setData(loadInsights());
    }
    window.addEventListener(AI_INSIGHTS_UPDATED_EVENT, handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener(AI_INSIGHTS_UPDATED_EVENT, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  return data;
}
