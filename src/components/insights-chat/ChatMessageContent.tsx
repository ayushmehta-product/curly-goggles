'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useWuShowToast } from '@npm-questionpro/wick-ui-lib';
import type { AiAnnotation, AiTag, AiTheme, InsightScopeRef } from '@/data/mock-ai-insights';
import {
  deleteInsight,
  saveAnnotationFromQuote,
  saveTagsFromResponse,
  saveThemeFromResponse,
  updateInsight,
  validateInsight,
} from './chat-actions';
import { resolveOverviewSessionId } from './chat-scope';
import type { ChatQuote, ChatResponse } from './chat-types';

const WuButton = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuButton })),
  { ssr: false }
);
const WuChip = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuChip })),
  { ssr: false }
);
const WuInput = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuInput })),
  { ssr: false }
);
const WuTextarea = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuTextarea })),
  { ssr: false }
);
const WuTooltip = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuTooltip })),
  { ssr: false }
);
const WuCard = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuCard })),
  { ssr: false }
);

function parseDisplayTimestamp(timestamp: string): number | undefined {
  const parts = timestamp.split(':').map((part) => Number(part));
  if (parts.length < 2 || parts.some((part) => Number.isNaN(part))) return undefined;
  return parts.reduce((total, part) => total * 60 + part, 0);
}

function QuoteCard({ quote, scope }: { quote: ChatQuote; scope?: InsightScopeRef | null }) {
  const router = useRouter();
  function handlePlay() {
    if (!scope) return;
    const seconds = quote.timestampSeconds ?? parseDisplayTimestamp(quote.timestamp);
    if (seconds === undefined) return;
    const rounded = Math.round(seconds);
    if (scope.kind === 'fg-session') {
      router.push(`/focus-group-studies/${scope.focusGroupId}/session?t=${rounded}`);
    } else if (scope.kind === 'idi-session') {
      const overviewSessionId = resolveOverviewSessionId(scope.studyId, scope.sessionId);
      const sessionParam = overviewSessionId ? `session=${overviewSessionId}&` : '';
      router.push(`/idi-studies/${scope.studyId}/sessions?${sessionParam}t=${rounded}`);
    }
  }

  const seekSeconds = quote.timestampSeconds ?? parseDisplayTimestamp(quote.timestamp);
  const canSeek = seekSeconds !== undefined && (scope?.kind === 'idi-session' || scope?.kind === 'fg-session');

  return (
    <WuCard rounded className="bg-surface-sunken p-4 wu-shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold text-ink-muted">
          {quote.speaker} &middot; {quote.timestamp}
        </p>
        {canSeek && (
          <WuButton size="sm" variant="link" Icon={<span className="wm-play-arrow" />} onClick={handlePlay}>
            Play at {quote.timestamp}
          </WuButton>
        )}
      </div>
      <p className="mt-2 text-sm leading-6 text-ink">&ldquo;{quote.text}&rdquo;</p>
    </WuCard>
  );
}

function NoScopeHint() {
  return (
    <WuTooltip content="Open a study or session, or pick one from the context picker, to save this here.">
      <span className="wm-info text-sm text-ink-muted" />
    </WuTooltip>
  );
}

function ThemeBlock({ theme, scope }: { theme: { title: string; quotes: ChatQuote[] }; scope: InsightScopeRef | null }) {
  const { showToast } = useWuShowToast();
  const [saved, setSaved] = useState(false);

  function handleSave() {
    if (!scope) return;
    saveThemeFromResponse(theme, scope);
    setSaved(true);
    showToast({ message: `"${theme.title}" saved as a theme.`, variant: 'success' });
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">{theme.title}</p>
        <div className="flex items-center gap-2">
          {!scope && <NoScopeHint />}
          <WuButton
            size="sm"
            variant={saved ? 'secondary' : 'outline'}
            Icon={<span className={saved ? 'wm-bookmark-check' : 'wm-bookmark-add'} />}
            disabled={!scope || saved}
            onClick={handleSave}
          >
            {saved ? 'Saved' : 'Save theme'}
          </WuButton>
        </div>
      </div>
      <div className="mt-2 space-y-2">
        {theme.quotes.map((quote, index) => (
          <QuoteCard key={index} quote={quote} scope={scope} />
        ))}
      </div>
    </div>
  );
}

function TagsBlock({ tags: initialTags, note, scope }: { tags: string[]; note?: string; scope: InsightScopeRef | null }) {
  const { showToast } = useWuShowToast();
  const [workingTags, setWorkingTags] = useState<string[]>(initialTags);
  const [addValue, setAddValue] = useState('');
  const [saved, setSaved] = useState(false);

  function handleRemove(tag: string) {
    if (saved) return;
    setWorkingTags((prev) => prev.filter((t) => t !== tag));
  }

  function handleAdd() {
    const value = addValue.trim();
    if (!value || workingTags.includes(value)) return;
    setWorkingTags((prev) => [...prev, value]);
    setAddValue('');
  }

  function handleSave() {
    if (!scope || workingTags.length === 0) return;
    saveTagsFromResponse(workingTags, scope);
    setSaved(true);
    showToast({ message: `${workingTags.length} tag${workingTags.length === 1 ? '' : 's'} saved.`, variant: 'success' });
  }

  return (
    <div className="mt-3 space-y-3">
      {/* Removable chips */}
      <div className="flex flex-wrap gap-2">
        {workingTags.map((tag) => (
          <span
            key={tag}
            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition ${
              saved
                ? 'border-green-200 bg-green-50 text-green-700'
                : 'border-line bg-surface text-ink hover:border-ink-muted'
            }`}
          >
            {tag}
            {!saved && (
              <button
                type="button"
                aria-label={`Remove tag ${tag}`}
                className="ml-0.5 flex items-center text-ink-muted hover:text-error"
                onClick={() => handleRemove(tag)}
              >
                <span className="wm-close text-xs" aria-hidden="true" />
              </button>
            )}
          </span>
        ))}
        {workingTags.length === 0 && !saved && (
          <p className="text-sm text-ink-muted">All tags removed. Add custom tags below.</p>
        )}
      </div>

      {/* Add Tags input */}
      {!saved && (
        <div className="flex items-center gap-2">
          <div className="min-w-0 flex-1">
            <WuInput
              variant="outlined"
              placeholder="Add a custom tag..."
              value={addValue}
              onChange={(e) => setAddValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAdd();
              }}
              className="w-full"
            />
          </div>
          <WuButton
            size="sm"
            variant="secondary"
            Icon={<span className="wm-add" />}
            onClick={handleAdd}
            disabled={!addValue.trim() || workingTags.includes(addValue.trim())}
          >
            Add
          </WuButton>
        </div>
      )}

      {/* AI explanatory note */}
      {note && (
        <WuCard rounded className="flex gap-2.5 bg-surface-sunken p-3 wu-shadow-sm">
          <span className="wm-auto-awesome mt-0.5 shrink-0 text-sm text-accent" aria-hidden="true" />
          <p className="text-xs leading-5 text-ink-muted">{note}</p>
        </WuCard>
      )}

      {/* Save button */}
      <div className="flex items-center gap-2">
        {!scope && <NoScopeHint />}
        <WuButton
          size="sm"
          variant={saved ? 'secondary' : 'primary'}
          Icon={<span className={saved ? 'wm-bookmark-check' : 'wm-bookmark-add'} />}
          disabled={!scope || saved || workingTags.length === 0}
          onClick={handleSave}
        >
          {saved
            ? `${workingTags.length} tag${workingTags.length === 1 ? '' : 's'} saved`
            : `Save ${workingTags.length} tag${workingTags.length === 1 ? '' : 's'}`}
        </WuButton>
      </div>
    </div>
  );
}

function AnnotationSuggestionBlock({
  excerpt,
  noteDraft,
  scope,
}: {
  excerpt: ChatQuote;
  noteDraft: string;
  scope: InsightScopeRef | null;
}) {
  const { showToast } = useWuShowToast();
  const [note, setNote] = useState(noteDraft);
  const [saved, setSaved] = useState(false);

  function handleSave() {
    if (!scope) return;
    saveAnnotationFromQuote(excerpt, note.trim().length > 0 ? note.trim() : noteDraft, scope);
    setSaved(true);
    showToast({ message: 'Annotation saved.', variant: 'success' });
  }

  return (
    <div>
      <QuoteCard quote={excerpt} scope={scope} />
      <div className="mt-3">
        <WuTextarea
          Label="Annotation note"
          labelPosition="top"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          disabled={saved}
          rows={2}
        />
      </div>
      <div className="mt-2 flex items-center gap-2">
        {!scope && <NoScopeHint />}
        <WuButton
          size="sm"
          variant={saved ? 'secondary' : 'outline'}
          Icon={<span className={saved ? 'wm-bookmark-check' : 'wm-bookmark-add'} />}
          disabled={!scope || saved}
          onClick={handleSave}
        >
          {saved ? 'Annotation saved' : 'Save annotation'}
        </WuButton>
      </div>
    </div>
  );
}

function WordFrequencyExportButton() {
  const { showToast } = useWuShowToast();
  return (
    <WuButton
      size="sm"
      variant="secondary"
      Icon={<span className="wm-download" />}
      onClick={() => showToast({ message: 'Wordcloud exported.', variant: 'success' })}
    >
      Export wordcloud
    </WuButton>
  );
}

function SavedItemRow({
  id,
  primaryText,
  secondaryText,
  status,
  onValidate,
  onDelete,
  onRename,
}: {
  id: string;
  primaryText: string;
  secondaryText?: string;
  status: string;
  onValidate: () => void;
  onDelete: () => void;
  onRename: (value: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(primaryText);

  return (
    <WuCard rounded className="p-4 wu-shadow-sm">
      {editing ? (
        <div className="flex items-center gap-2">
          <WuInput
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            className="min-w-0 flex-1"
          />
          <WuButton
            size="sm"
            variant="secondary"
            onClick={() => {
              onRename(draft);
              setEditing(false);
            }}
          >
            Save
          </WuButton>
          <WuButton size="sm" variant="link" onClick={() => setEditing(false)}>
            Cancel
          </WuButton>
        </div>
      ) : (
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-medium text-ink">{primaryText}</p>
            {secondaryText && <p className="mt-1 text-xs leading-5 text-ink-muted">&ldquo;{secondaryText}&rdquo;</p>}
          </div>
          <WuChip size="sm" variant="secondary" color={status === 'validated' ? 'success' : undefined}>
            {status}
          </WuChip>
        </div>
      )}
      {!editing && (
        <div className="mt-2 flex items-center gap-2">
          <WuButton size="sm" variant="link" Icon={<span className="wm-edit" />} onClick={() => setEditing(true)}>
            Edit
          </WuButton>
          {status !== 'validated' && (
            <WuButton size="sm" variant="link" Icon={<span className="wm-check-circle" />} onClick={onValidate}>
              Validate
            </WuButton>
          )}
          <WuButton size="sm" variant="link" color="error" Icon={<span className="wm-delete-outline" />} onClick={onDelete}>
            Delete
          </WuButton>
        </div>
      )}
      <span data-row-id={id} className="hidden" />
    </WuCard>
  );
}

function SavedItemsBlock({ themes, tags, annotations }: { themes: AiTheme[]; tags: AiTag[]; annotations: AiAnnotation[] }) {
  const { showToast } = useWuShowToast();
  const [, forceRerender] = useState(0);

  function refresh() {
    forceRerender((value) => value + 1);
  }

  return (
    <div className="space-y-4">
      {themes.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">Themes</p>
          <div className="space-y-2">
            {themes.map((theme) => (
              <SavedItemRow
                key={theme.id}
                id={theme.id}
                primaryText={theme.label}
                secondaryText={theme.excerpts[0]?.quote}
                status={theme.status}
                onRename={(value) => {
                  updateInsight('theme', theme.id, { label: value });
                  refresh();
                }}
                onValidate={() => {
                  validateInsight('theme', theme.id);
                  refresh();
                  showToast({ message: 'Theme validated.', variant: 'success' });
                }}
                onDelete={() => {
                  deleteInsight('theme', theme.id);
                  refresh();
                  showToast({ message: 'Theme deleted.', variant: 'success' });
                }}
              />
            ))}
          </div>
        </div>
      )}
      {tags.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">Tags</p>
          <div className="space-y-2">
            {tags.map((tag) => (
              <SavedItemRow
                key={tag.id}
                id={tag.id}
                primaryText={tag.label}
                status={tag.status}
                onRename={(value) => {
                  updateInsight('tag', tag.id, { label: value });
                  refresh();
                }}
                onValidate={() => {
                  validateInsight('tag', tag.id);
                  refresh();
                  showToast({ message: 'Tag validated.', variant: 'success' });
                }}
                onDelete={() => {
                  deleteInsight('tag', tag.id);
                  refresh();
                  showToast({ message: 'Tag deleted.', variant: 'success' });
                }}
              />
            ))}
          </div>
        </div>
      )}
      {annotations.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">Annotations</p>
          <div className="space-y-2">
            {annotations.map((annotation) => (
              <SavedItemRow
                key={annotation.id}
                id={annotation.id}
                primaryText={annotation.note}
                secondaryText={annotation.excerpt.quote}
                status={annotation.status}
                onRename={(value) => {
                  updateInsight('annotation', annotation.id, { note: value });
                  refresh();
                }}
                onValidate={() => {
                  validateInsight('annotation', annotation.id);
                  refresh();
                  showToast({ message: 'Annotation validated.', variant: 'success' });
                }}
                onDelete={() => {
                  deleteInsight('annotation', annotation.id);
                  refresh();
                  showToast({ message: 'Annotation deleted.', variant: 'success' });
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function ChatMessageContent({ response, scope = null }: { response: ChatResponse; scope?: InsightScopeRef | null }) {
  if (response.kind === 'text') {
    return <p className="text-sm leading-6 text-ink">{response.text}</p>;
  }

  if (response.kind === 'list') {
    return (
      <div>
        <p className="text-sm leading-6 text-ink">{response.intro}</p>
        {response.items.length > 0 && (
          <ul className="mt-2.5 space-y-1.5">
            {response.items.map((item, index) => (
              <li key={index} className="flex gap-2 text-sm leading-6 text-ink">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  if (response.kind === 'rollup') {
    return (
      <div>
        <p className="text-sm leading-6 text-ink">{response.intro}</p>
        <div className="mt-3 space-y-2">
          {response.items.map((item, index) => (
            <WuCard key={index} rounded className="bg-surface-sunken p-4 wu-shadow-sm">
              <p className="text-xs font-semibold text-ink">{item.label}</p>
              <p className="mt-1 text-sm leading-6 text-ink">{item.detail}</p>
            </WuCard>
          ))}
        </div>
      </div>
    );
  }

  if (response.kind === 'quotes') {
    return (
      <div>
        <p className="text-sm leading-6 text-ink">{response.intro}</p>
        {response.quotes.length > 0 && (
          <div className="mt-3 space-y-2">
            {response.quotes.map((quote, index) => (
              <QuoteCard key={index} quote={quote} scope={scope} />
            ))}
          </div>
        )}
      </div>
    );
  }

  if (response.kind === 'thematic') {
    return (
      <div>
        <p className="text-sm leading-6 text-ink">{response.intro}</p>
        <div className="mt-3 space-y-4">
          {response.themes.map((theme) => (
            <ThemeBlock key={theme.title} theme={theme} scope={scope} />
          ))}
        </div>
      </div>
    );
  }

  if (response.kind === 'tags') {
    return (
      <div>
        <p className="text-sm leading-6 text-ink">{response.intro}</p>
        <TagsBlock tags={response.tags} note={response.note} scope={scope} />
      </div>
    );
  }

  if (response.kind === 'annotation-suggestion') {
    return (
      <div>
        <p className="text-sm leading-6 text-ink">{response.intro}</p>
        <div className="mt-3">
          <AnnotationSuggestionBlock excerpt={response.excerpt} noteDraft={response.noteDraft} scope={scope} />
        </div>
      </div>
    );
  }

  if (response.kind === 'saved-items') {
    return (
      <div>
        <p className="text-sm leading-6 text-ink">{response.intro}</p>
        <div className="mt-3">
          <SavedItemsBlock themes={response.themes} tags={response.tags} annotations={response.annotations} />
        </div>
      </div>
    );
  }

  if (response.kind === 'word-frequency') {
    const maxCount = response.entries[0]?.count ?? 1;

    return (
      <div>
        <p className="text-sm leading-6 text-ink">{response.intro}</p>
        {response.entries.length === 0 ? (
          <p className="mt-2 text-sm text-ink-muted">Not enough transcript text to analyze yet.</p>
        ) : (
          <>
            <WuCard rounded className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-2 bg-surface-sunken p-4 wu-shadow-sm">
              {response.entries.map((entry) => (
                <span
                  key={entry.word}
                  className="font-semibold text-accent"
                  style={{ fontSize: `${12 + (entry.count / maxCount) * 16}px` }}
                >
                  {entry.word}
                </span>
              ))}
            </WuCard>
            <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-ink-muted sm:grid-cols-3">
              {response.entries.map((entry) => (
                <li key={entry.word} className="flex items-center justify-between gap-2">
                  <span className="truncate">{entry.word}</span>
                  <span className="font-medium text-ink-muted">{entry.count}</span>
                </li>
              ))}
            </ul>
            <div className="mt-3">
              <WordFrequencyExportButton />
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm leading-6 text-ink">{response.intro}</p>
      <div className="mt-3 space-y-3">
        {response.matches.map(({ keyPoint, quote }, index) => (
          <div key={index}>
            <div className="flex gap-2 text-sm leading-6 text-ink">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
              <span>{keyPoint}</span>
            </div>
            <div className="ml-3.5 mt-1.5">
              {quote ? <QuoteCard quote={quote} scope={scope} /> : <p className="text-xs text-ink-muted">No direct quote found for this observation.</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
