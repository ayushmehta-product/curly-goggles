import { MOCK_MODERATED_WORKSPACE_SESSIONS } from '@/data/mock-moderated-sessions';
import { MOCK_FOCUS_GROUP_SESSIONS } from '@/data/mock-focus-group-session';
import { MOCK_STUDY_OPERATIONAL_OVERVIEWS } from '@/data/mock-study-overview';
import { MOCK_IDI_STUDIES } from '@/data/mock-idi-studies';
import { MOCK_FOCUS_GROUPS } from '@/data/mock-focus-groups';
import { annotationsForScope, loadInsights, tagsForScope, themesForScope } from './ai-insights-store';
import { scopeRefFromChatScope } from './chat-actions';
import type { ChatQuote, ChatResponse, ChatScope, ChatSessionSource, ChatTranscriptLine, WordFrequencyEntry } from './chat-types';
import { scopeLabel } from './chat-scope';

const STOP_WORDS = new Set([
  'the', 'and', 'that', 'this', 'with', 'have', 'from', 'they', 'what', 'when', 'where', 'which',
  'about', 'into', 'just', 'like', 'were', 'been', 'being', 'would', 'could', 'should', 'their',
  'there', 'here', 'your', 'you', 'our', 'ours', 'was', 'are', 'for', 'not', 'but', 'can', 'did',
  'does', 'over', 'than', 'then', 'them', 'some', 'each', 'more', 'most', 'much', 'very', 'also',
  'because', 'before', 'after', 'still', 'even', 'while', 'yeah', 'okay', 'kind', 'sort', 'really',
  'actually', 'thing', 'things', 'going', 'think', 'know', 'right', 'well', 'good', 'first', 'need',
  'want', 'feel', 'felt', 'make', 'makes', 'made', 'usually', 'basically', 'moderator', 'participant',
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9'\s]/g, '')
    .split(/\s+/)
    .filter(Boolean);
}

function significantWords(text: string): Set<string> {
  return new Set(tokenize(text).filter((word) => word.length > 3 && !STOP_WORDS.has(word)));
}

function overlapScore(a: Set<string>, b: Set<string>): number {
  let score = 0;
  for (const word of a) {
    if (b.has(word)) score += 1;
  }
  return score;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function toQuote(line: ChatTranscriptLine, source: ChatSessionSource, tagSource: boolean): ChatQuote {
  return {
    timestamp: line.timestamp,
    speaker: tagSource ? `${source.participantLabel} · ${line.speaker}` : line.speaker,
    text: line.text,
    timestampSeconds: line.timestampSeconds,
  };
}

function getSources(scope: ChatScope): ChatSessionSource[] {
  switch (scope.kind) {
    case 'idi-session':
    case 'fg-session':
    case 'fg-collective':
      return [scope.source];
    case 'idi-collective':
    case 'multi':
      return scope.sources;
    case 'generic':
      return [];
  }
}

function isStudySummaryRequest(text: string): boolean {
  return /study[\s-]*(level|wide|summary)|overall (study|summary)|entire study|summarize the study/.test(text);
}

function isThematicRequest(text: string): boolean {
  return /thematic|theme analysis|group.*themes|identify themes/.test(text);
}

function isTagRequest(text: string): boolean {
  return /suggest tags|tag(s)? for this|generate.*tags|recommend.*tags|tags that capture|top tag/.test(text);
}

function isWordFrequencyRequest(text: string): boolean {
  return /word frequency|wordcloud|word cloud/.test(text);
}

function isKeyQuotesRequest(text: string): boolean {
  return /key observation|key takeaway|key quote|quotes supporting/.test(text);
}

function isAttentionRequest(text: string): boolean {
  return /need(s)? (my )?attention|which sessions need/.test(text);
}

function isCompareThemesRequest(text: string): boolean {
  return /compare.*(themes|perspectives)/.test(text);
}

function isFollowUpRequest(text: string): boolean {
  return /follow-?up questions/.test(text);
}

function isBulkSummaryRequest(text: string): boolean {
  return /summary of these videos|summarize these (videos|sessions)|summary of this selection|summarize this selection|summary of this session/.test(
    text
  );
}

function isAnnotationRequest(text: string): boolean {
  return /\bannotat(e|ion)|flag this moment|add a note|make a note|mark this moment\b/.test(text);
}

function isSavedItemsRequest(text: string): boolean {
  return /what have i (saved|tagged)|show (my )?saved (themes|tags|annotations)|saved items|what.?s been saved/.test(text);
}

function extractTopic(text: string): string | null {
  if (/\bbooks?\b/.test(text)) return 'book';
  const match = text.match(/(?:talked about|mentioned|discussed|moments (?:of|about))\s+([a-z][a-z0-9\s]{1,24})/);
  if (match) {
    return match[1].trim().split(/\s+/).slice(0, 2).join(' ').replace(/[.?!,]+$/, '');
  }
  return null;
}

function topicQuotesResponse(sources: ChatSessionSource[], topic: string): ChatResponse {
  const pattern = new RegExp(`\\b${escapeRegExp(topic)}s?\\b`, 'i');
  const tagSource = sources.length > 1;
  const quotes: ChatQuote[] = [];

  for (const source of sources) {
    for (const line of source.transcript) {
      if (pattern.test(line.text)) quotes.push(toQuote(line, source, tagSource));
    }
  }

  if (quotes.length === 0) {
    return { kind: 'quotes', intro: `I did not find any moments mentioning "${topic}" in this transcript.`, quotes: [] };
  }

  return {
    kind: 'quotes',
    intro: `Found ${quotes.length} moment${quotes.length > 1 ? 's' : ''} mentioning "${topic}":`,
    quotes,
  };
}

function wordFrequencyResponse(sources: ChatSessionSource[]): ChatResponse {
  const counts = new Map<string, number>();
  let lineCount = 0;

  for (const source of sources) {
    for (const line of source.transcript) {
      lineCount += 1;
      for (const word of tokenize(line.text)) {
        if (word.length <= 3 || STOP_WORDS.has(word)) continue;
        counts.set(word, (counts.get(word) ?? 0) + 1);
      }
    }
  }

  const entries: WordFrequencyEntry[] = Array.from(counts.entries())
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count || a.word.localeCompare(b.word))
    .slice(0, 10);

  return { kind: 'word-frequency', intro: `Top terms across ${lineCount} transcript lines:`, entries };
}

function keyQuotesResponse(sources: ChatSessionSource[]): ChatResponse {
  const tagSource = sources.length > 1;
  const matches = sources.flatMap((source) =>
    source.keyPoints.map((keyPoint) => {
      const keyPointWords = significantWords(keyPoint);
      let best: { line: ChatTranscriptLine; score: number } | null = null;

      for (const line of source.transcript) {
        const score = overlapScore(keyPointWords, significantWords(line.text));
        if (score > 0 && (!best || score > best.score)) best = { line, score };
      }

      return {
        keyPoint: tagSource ? `${source.participantLabel}: ${keyPoint}` : keyPoint,
        quote: best ? toQuote(best.line, source, false) : null,
      };
    })
  );

  return { kind: 'key-quotes', intro: 'Here is how the transcript supports each key observation:', matches };
}

function thematicResponse(sources: ChatSessionSource[]): ChatResponse {
  const counts = new Map<string, number>();
  for (const source of sources) {
    for (const line of source.transcript) {
      for (const word of tokenize(line.text)) {
        if (word.length <= 4 || STOP_WORDS.has(word)) continue;
        counts.set(word, (counts.get(word) ?? 0) + 1);
      }
    }
  }

  const topWords = Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 3)
    .map(([word]) => word);

  if (topWords.length === 0) {
    return { kind: 'thematic', intro: 'Not enough transcript text to identify themes yet.', themes: [] };
  }

  const tagSource = sources.length > 1;
  const themes = topWords.map((word) => {
    const pattern = new RegExp(`\\b${escapeRegExp(word)}\\b`, 'i');
    const quotes: ChatQuote[] = [];
    for (const source of sources) {
      for (const line of source.transcript) {
        if (quotes.length >= 3) break;
        if (pattern.test(line.text)) quotes.push(toQuote(line, source, tagSource));
      }
    }
    return { title: `${word.charAt(0).toUpperCase()}${word.slice(1)}`, quotes };
  });

  return { kind: 'thematic', intro: `Identified ${themes.length} recurring themes across the transcript:`, themes };
}

function tagResponse(sources: ChatSessionSource[]): ChatResponse {
  const counts = new Map<string, number>();
  for (const source of sources) {
    for (const line of source.transcript) {
      for (const word of tokenize(line.text)) {
        if (word.length <= 4 || STOP_WORDS.has(word)) continue;
        counts.set(word, (counts.get(word) ?? 0) + 1);
      }
    }
  }

  const topEntries = Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 6);

  const tags = topEntries.map(([word]) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`);

  const topTwo = topEntries.slice(0, 2).map(([word]) => word);
  const sourceCount = sources.length;
  const note =
    topTwo.length >= 2
      ? `These tags reflect the most frequently recurring terms across ${sourceCount > 1 ? `${sourceCount} sessions` : 'the transcript'} — "${topTwo[0]}" and "${topTwo[1]}" each appear with strong sentiment context. Review and remove any that don't match your coding scheme before saving.`
      : `Tags were derived from the most significant terms in the transcript. Review and remove any that don't apply before saving.`;

  return { kind: 'tags', intro: 'Suggested tags based on this transcript:', tags, note };
}

function annotationSuggestionResponse(sources: ChatSessionSource[], promptText: string): ChatResponse {
  const promptWords = significantWords(promptText);
  let best: { line: ChatTranscriptLine; source: ChatSessionSource; score: number } | null = null;

  for (const source of sources) {
    for (const line of source.transcript) {
      const score = overlapScore(promptWords, significantWords(line.text));
      if (score > 0 && (!best || score > best.score)) best = { line, source, score };
    }
  }

  if (!best) {
    return {
      kind: 'text',
      text: 'I could not find a specific moment matching that request. Try mentioning a topic or phrase from the transcript.',
    };
  }

  const tagSource = sources.length > 1;
  const excerpt = toQuote(best.line, best.source, tagSource);
  return {
    kind: 'annotation-suggestion',
    intro: 'Here is a moment that matches your request:',
    excerpt,
    noteDraft: `Notable moment: ${excerpt.text}`,
  };
}

function savedItemsResponse(scope: ChatScope): ChatResponse {
  const scopeRef = scopeRefFromChatScope(scope);
  if (!scopeRef) {
    return {
      kind: 'text',
      text: 'Saved themes, tags, and annotations are available once you are viewing (or have picked) a specific study or session.',
    };
  }

  const data = loadInsights();
  const themes = themesForScope(data, scopeRef);
  const tags = tagsForScope(data, scopeRef);
  const annotations = annotationsForScope(data, scopeRef);

  if (themes.length === 0 && tags.length === 0 && annotations.length === 0) {
    return {
      kind: 'text',
      text: 'Nothing has been saved for this scope yet. Try asking for a thematic analysis or tag suggestions first, then save the results.',
    };
  }

  return { kind: 'saved-items', intro: 'Here is what has been saved for this scope:', themes, tags, annotations };
}

function bulkSummaryResponse(sources: ChatSessionSource[], intro: string): ChatResponse {
  return {
    kind: 'rollup',
    intro,
    items: sources.map((source) => ({
      label: source.participantLabel,
      detail: source.summary ?? 'No summary available yet.',
    })),
  };
}

function compareThemesResponse(sources: ChatSessionSource[]): ChatResponse {
  return {
    kind: 'rollup',
    intro: 'Key themes by participant:',
    items: sources.map((source) => ({
      label: source.participantLabel,
      detail: source.keyPoints.slice(0, 2).join(' ') || 'No key observations captured yet.',
    })),
  };
}

function attentionRollupResponse(sources: ChatSessionSource[]): ChatResponse {
  const sorted = [...sources].sort((a, b) => a.transcript.length - b.transcript.length);
  return {
    kind: 'rollup',
    intro: 'Sessions with the least transcript depth may need a closer look first:',
    items: sorted.map((source) => ({
      label: source.participantLabel,
      detail: `${source.transcript.length} transcript line${source.transcript.length === 1 ? '' : 's'} captured.`,
    })),
  };
}

function followUpQuestionsResponse(sources: ChatSessionSource[]): ChatResponse {
  const items = sources.flatMap((source) =>
    source.keyPoints.slice(0, 1).map((keyPoint) => `Ask ${source.participantLabel} to elaborate on: "${keyPoint}"`)
  );

  if (items.length === 0) {
    return { kind: 'list', intro: 'Not enough key observations yet to suggest follow-up questions.', items: [] };
  }

  return { kind: 'list', intro: 'Suggested follow-up questions:', items };
}

function studySummaryResponse(scope: ChatScope): ChatResponse | null {
  if (scope.kind === 'idi-session' || scope.kind === 'idi-collective') {
    const sessions = MOCK_MODERATED_WORKSPACE_SESSIONS.filter((session) => session.studyId === scope.studyId);
    if (sessions.length === 0) return null;
    return {
      kind: 'rollup',
      intro: `Study-level summary for ${scope.studyTitle} across ${sessions.length} session${sessions.length > 1 ? 's' : ''}:`,
      items: sessions.map((session) => ({ label: session.participantName, detail: session.summary })),
    };
  }

  if (scope.kind === 'fg-session' || scope.kind === 'fg-collective') {
    const session = MOCK_FOCUS_GROUP_SESSIONS.find((item) => item.focusGroupId === scope.focusGroupId);
    if (!session) return null;
    return {
      kind: 'rollup',
      intro: `Study-level summary for ${scope.focusGroupTitle}:`,
      items: [
        { label: session.participantRoster.join(', '), detail: session.summary },
        ...session.keyTakeaways.map((takeaway) => ({ label: 'Key takeaway', detail: takeaway })),
      ],
    };
  }

  return null;
}

function genericInsightsResponse(text: string, scope: Extract<ChatScope, { kind: 'generic' }>): ChatResponse | null {
  if (/attention/.test(text)) {
    const items = MOCK_STUDY_OPERATIONAL_OVERVIEWS.flatMap((overview) =>
      overview.attentionItems.map((item) => `${item.title} — ${item.description}`)
    );
    if (items.length === 0) return null;
    return { kind: 'list', intro: 'Here is what needs attention across your studies:', items: items.slice(0, 6) };
  }

  if (/how many.*(active|studies)|active studies/.test(text)) {
    const activeIdi = MOCK_IDI_STUDIES.filter((study) => study.status === 'active').length;
    const activeFg = MOCK_FOCUS_GROUPS.filter(
      (group) => group.status === 'confirmed' || group.status === 'scheduling'
    ).length;
    return {
      kind: 'list',
      intro: 'Active study counts:',
      items: [
        `${activeIdi} active interview stud${activeIdi === 1 ? 'y' : 'ies'}`,
        `${activeFg} focus group${activeFg === 1 ? '' : 's'} in progress or scheduling`,
      ],
    };
  }

  if (/summarize this (project|study|folder)/.test(text) && scope.project) {
    return {
      kind: 'text',
      text: `${scope.project.name}: ${scope.project.description} — status ${scope.project.status}, ${scope.project.responses} responses, owned by ${scope.project.owner}.`,
    };
  }

  if (/recently completed/.test(text)) {
    const completed = MOCK_STUDY_OPERATIONAL_OVERVIEWS.flatMap((overview) =>
      overview.sessions.filter((session) => session.status === 'completed')
    )
      .sort((a, b) => new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime())
      .slice(0, 5);
    if (completed.length === 0) return null;
    return {
      kind: 'list',
      intro: 'Most recently completed sessions:',
      items: completed.map((session) => `${session.participantName} — ${session.participantCompany}`),
    };
  }

  return null;
}

function fallbackResponse(scope: ChatScope): ChatResponse {
  return {
    kind: 'text',
    text: `I can help you explore ${scopeLabel(scope)}. Try one of the suggested prompts below, or ask about a specific topic, request a thematic analysis, tag suggestions, or a study-level summary.`,
  };
}

export function generateChatResponse(promptInput: string, scope: ChatScope): ChatResponse {
  const text = promptInput.toLowerCase();
  const sources = getSources(scope);

  if (isSavedItemsRequest(text)) return savedItemsResponse(scope);

  if (isStudySummaryRequest(text)) {
    const result = studySummaryResponse(scope);
    if (result) return result;
  }

  if (sources.length > 0) {
    if (isThematicRequest(text)) return thematicResponse(sources);
    if (isTagRequest(text)) return tagResponse(sources);
    if (isAnnotationRequest(text)) return annotationSuggestionResponse(sources, text);

    const topic = extractTopic(text);
    if (topic) return topicQuotesResponse(sources, topic);

    if (isWordFrequencyRequest(text)) return wordFrequencyResponse(sources);
    if (isKeyQuotesRequest(text)) return keyQuotesResponse(sources);
    if (isAttentionRequest(text)) return attentionRollupResponse(sources);
    if (isCompareThemesRequest(text) && sources.length > 1) return compareThemesResponse(sources);
    if (isFollowUpRequest(text)) return followUpQuestionsResponse(sources);
    if (isBulkSummaryRequest(text)) {
      return bulkSummaryResponse(
        sources,
        sources.length > 1
          ? `Here's a rollup across ${sources.length} sessions:`
          : `Summary for ${sources[0].participantLabel}:`
      );
    }
  }

  if (scope.kind === 'generic') {
    const genericAnswer = genericInsightsResponse(text, scope);
    if (genericAnswer) return genericAnswer;
  }

  return fallbackResponse(scope);
}
