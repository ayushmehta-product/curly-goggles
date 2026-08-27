/**
 * AI-generated research artifacts (themes, tags, annotations) created from the InsightsHub
 * chat. Stored separately from the core mock datasets so the chat can write to them without
 * mutating the static session/study fixtures, then merged back in by the pages that render
 * Highlights/Themes/Tags/Annotations.
 */

export type InsightScopeRef =
  | { kind: 'idi-session'; studyId: string; sessionId: string }
  | { kind: 'fg-session'; focusGroupId: string }
  | { kind: 'idi-study'; studyId: string }
  | { kind: 'fg-study'; focusGroupId: string };

export type AiSessionThemeColor = 'yellow' | 'green' | 'pink' | 'blue';

export interface AiExcerpt {
  quote: string;
  speaker: string;
  timestamp: string;
  timestampSeconds?: number;
}

export type AiInsightStatus = 'suggested' | 'saved' | 'validated';

export interface AiTheme {
  id: string;
  scope: InsightScopeRef;
  label: string;
  color: AiSessionThemeColor;
  excerpts: AiExcerpt[];
  status: AiInsightStatus;
  createdBy: 'ai';
  createdAt: string;
  updatedAt: string;
}

export interface AiTag {
  id: string;
  scope: InsightScopeRef;
  label: string;
  excerpts: AiExcerpt[];
  status: AiInsightStatus;
  createdBy: 'ai';
  createdAt: string;
  updatedAt: string;
}

export interface AiAnnotation {
  id: string;
  scope: InsightScopeRef;
  note: string;
  excerpt: AiExcerpt;
  status: AiInsightStatus;
  createdBy: 'ai';
  createdAt: string;
  updatedAt: string;
}

export interface AiInsightsData {
  themes: AiTheme[];
  tags: AiTag[];
  annotations: AiAnnotation[];
}

export function scopeRefsMatch(a: InsightScopeRef, b: InsightScopeRef): boolean {
  if (a.kind !== b.kind) return false;
  switch (a.kind) {
    case 'idi-session':
      return b.kind === 'idi-session' && a.studyId === b.studyId && a.sessionId === b.sessionId;
    case 'idi-study':
      return b.kind === 'idi-study' && a.studyId === b.studyId;
    case 'fg-session':
      return b.kind === 'fg-session' && a.focusGroupId === b.focusGroupId;
    case 'fg-study':
      return b.kind === 'fg-study' && a.focusGroupId === b.focusGroupId;
  }
}

/** Seed data so write-back surfaces have something to show before a user runs the chat. */
export const MOCK_AI_INSIGHTS_SEED: AiInsightsData = {
  themes: [
    {
      id: 'ai-theme-seed-1',
      scope: { kind: 'idi-session', studyId: 'idi-001', sessionId: 'ws-session-005' },
      label: 'Chapter-Style Onboarding',
      color: 'blue',
      excerpts: [
        {
          quote: 'It breaks everything into small chapters you can absorb in five minutes.',
          speaker: 'Farhan Khan',
          timestamp: '06:28',
          timestampSeconds: 388,
        },
      ],
      status: 'saved',
      createdBy: 'ai',
      createdAt: '2026-07-20T09:12:00.000Z',
      updatedAt: '2026-07-20T09:12:00.000Z',
    },
    {
      id: 'ai-theme-seed-2',
      scope: { kind: 'fg-session', focusGroupId: 'fg-001' },
      label: 'Reviews Before Buying',
      color: 'pink',
      excerpts: [
        {
          quote: 'Honestly, it is like buying a book online. I read the negative reviews first, not the positive ones, because that is where I find out what actually goes wrong.',
          speaker: 'Nina Kapoor',
          timestamp: '01:58',
          timestampSeconds: 118,
        },
      ],
      status: 'saved',
      createdBy: 'ai',
      createdAt: '2026-07-20T09:18:00.000Z',
      updatedAt: '2026-07-20T09:18:00.000Z',
    },
  ],
  tags: [
    {
      id: 'ai-tag-seed-1',
      scope: { kind: 'idi-session', studyId: 'idi-001', sessionId: 'ws-session-005' },
      label: 'Language settings',
      excerpts: [
        {
          quote: "By the time I found the language toggle buried in advanced settings, I'd already set up half my team wrong.",
          speaker: 'Farhan Khan',
          timestamp: '01:22',
          timestampSeconds: 82,
        },
      ],
      status: 'saved',
      createdBy: 'ai',
      createdAt: '2026-07-20T09:14:00.000Z',
      updatedAt: '2026-07-20T09:14:00.000Z',
    },
  ],
  annotations: [
    {
      id: 'ai-annotation-seed-1',
      scope: { kind: 'fg-session', focusGroupId: 'fg-001' },
      note: "Nina's reviews-before-buying analogy is a strong pull quote for checkout trust messaging.",
      excerpt: {
        quote: 'Honestly, it is like buying a book online. I read the negative reviews first, not the positive ones, because that is where I find out what actually goes wrong.',
        speaker: 'Nina Kapoor',
        timestamp: '01:58',
        timestampSeconds: 118,
      },
      status: 'saved',
      createdBy: 'ai',
      createdAt: '2026-07-20T09:20:00.000Z',
      updatedAt: '2026-07-20T09:20:00.000Z',
    },
  ],
};
