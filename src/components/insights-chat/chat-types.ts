import type { AiAnnotation, AiTag, AiTheme, InsightScopeRef } from '@/data/mock-ai-insights';

export interface ChatTranscriptLine {
  timestamp: string;
  speaker: string;
  text: string;
  timestampSeconds?: number;
}

export interface ChatSessionSource {
  participantLabel: string;
  summary?: string;
  transcript: ChatTranscriptLine[];
  keyPoints: string[];
}

export interface GenericScopeProject {
  name: string;
  description: string;
  status: string;
  owner: string;
  responses: number;
}

export type ChatScope =
  | { kind: 'idi-session'; studyId: string; studyTitle: string; sessionId: string; source: ChatSessionSource }
  | { kind: 'idi-collective'; studyId: string; studyTitle: string; sources: ChatSessionSource[] }
  | { kind: 'fg-session'; focusGroupId: string; focusGroupTitle: string; source: ChatSessionSource }
  | { kind: 'fg-collective'; focusGroupId: string; focusGroupTitle: string; source: ChatSessionSource }
  | { kind: 'multi'; label: string; sources: ChatSessionSource[]; saveScope: InsightScopeRef | null }
  | { kind: 'generic'; label: string; project?: GenericScopeProject };

export interface ChatQuote {
  timestamp: string;
  speaker: string;
  text: string;
  timestampSeconds?: number;
}

export interface WordFrequencyEntry {
  word: string;
  count: number;
}

export type ChatResponse =
  | { kind: 'quotes'; intro: string; quotes: ChatQuote[] }
  | { kind: 'word-frequency'; intro: string; entries: WordFrequencyEntry[] }
  | { kind: 'key-quotes'; intro: string; matches: { keyPoint: string; quote: ChatQuote | null }[] }
  | { kind: 'thematic'; intro: string; themes: { title: string; quotes: ChatQuote[] }[] }
  | { kind: 'tags'; intro: string; tags: string[]; note?: string }
  | { kind: 'annotation-suggestion'; intro: string; excerpt: ChatQuote; noteDraft: string }
  | { kind: 'saved-items'; intro: string; themes: AiTheme[]; tags: AiTag[]; annotations: AiAnnotation[] }
  | { kind: 'rollup'; intro: string; items: { label: string; detail: string }[] }
  | { kind: 'list'; intro: string; items: string[] }
  | { kind: 'text'; text: string };

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  promptLabel?: string;
  response?: ChatResponse;
}

/** Explicit set of studies/sessions a user has chosen to target, overriding the page-derived scope. */
export interface ContextOverride {
  idiSessionIds: string[];
  fgFocusGroupIds: string[];
}

export interface ChatThread {
  id: string;
  title: string;
  scopeLabel: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
  contextOverride?: ContextOverride;
}
