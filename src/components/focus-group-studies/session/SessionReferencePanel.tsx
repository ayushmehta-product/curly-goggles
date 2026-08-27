'use client';

import dynamic from 'next/dynamic';
import type { IWuTabItem } from '@npm-questionpro/wick-ui-lib';
import { useWuShowToast } from '@npm-questionpro/wick-ui-lib';
import type { AiAnnotation, AiTag } from '@/data/mock-ai-insights';
import type {
  FocusGroupSession,
  FocusGroupTranscriptLine,
  SessionAnnotation,
  SessionIndexEntry,
} from '@/data/mock-focus-group-session';

const WuTab = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuTab })),
  { ssr: false }
);
const WuButton = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuButton })),
  { ssr: false }
);
const WuTooltip = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuTooltip })),
  { ssr: false }
);
const WuMenu = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuMenu })),
  { ssr: false }
);
const WuMenuItem = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuMenuItem })),
  { ssr: false }
);
const WuChip = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuChip })),
  { ssr: false }
);

export type ReferencePanelTab = 'index' | 'transcript' | 'annotations' | 'tags';

const REFERENCE_PANEL_TABS: Array<{ value: ReferencePanelTab; label: string }> = [
  { value: 'index', label: 'Index' },
  { value: 'transcript', label: 'Transcript' },
  { value: 'annotations', label: 'Annotations' },
  { value: 'tags', label: 'Tags' },
];

function AiSourceBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2 py-0.5 text-[11px] font-medium text-purple-700">
      <span className="wm-auto-awesome text-[11px]" /> AI
    </span>
  );
}

function IndexRow({
  entry,
  onSeek,
}: {
  entry: SessionIndexEntry;
  onSeek: (seconds: number) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSeek(entry.timestampSeconds)}
      className="flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition hover:bg-gray-50"
    >
      <span className="w-10 shrink-0 pt-0.5 text-[11px] font-medium text-gray-400">{entry.timestampLabel}</span>
      <span className="text-sm leading-6 text-gray-800">{entry.label}</span>
    </button>
  );
}

function TranscriptRow({
  line,
  selected,
  onSelect,
}: {
  line: FocusGroupTranscriptLine;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full rounded-lg px-3 py-3 text-left transition ${selected ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
    >
      <div className="flex gap-3">
        <span className="w-10 shrink-0 pt-0.5 text-[11px] font-medium text-gray-400">{line.timestampLabel}</span>
        <div>
          <p className="text-xs font-semibold text-gray-700">{line.speaker}</p>
          <p className="mt-1 text-sm leading-6 text-gray-700">{line.text}</p>
        </div>
      </div>
    </button>
  );
}

function AnnotationsTabContent({
  annotations,
  aiAnnotations,
  onClearAll,
  onSeekTo,
  onDelete,
}: {
  annotations: SessionAnnotation[];
  aiAnnotations: AiAnnotation[];
  onClearAll: () => void;
  onSeekTo: (seconds: number) => void;
  onDelete: (annotationId: string) => void;
}) {
  const { showToast } = useWuShowToast();

  if (annotations.length === 0 && aiAnnotations.length === 0) {
    return <p className="text-sm text-gray-500">No annotations have been added to this session yet.</p>;
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <h2 className="text-sm font-semibold text-gray-950">Annotations</h2>
          <WuTooltip content="Timestamped notes moderators and observers left during the session.">
            <span className="wm-info text-xs text-gray-400" />
          </WuTooltip>
        </div>
        {annotations.length > 0 && (
          <WuButton size="sm" variant="link" onClick={onClearAll}>
            Clear all
          </WuButton>
        )}
      </div>
      <div className="space-y-3">
        {annotations.map((annotation) => (
          <article key={annotation.id} className="rounded-lg bg-gray-50 p-3">
            <div className="flex items-start justify-between gap-2">
              <button
                type="button"
                onClick={() => onSeekTo(annotation.timestampSeconds)}
                className="flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:underline"
              >
                <span className="wm-play-arrow text-sm" /> Play ({annotation.timestampLabel})
              </button>
              <WuMenu
                Trigger={
                  <button
                    type="button"
                    aria-label="Annotation actions"
                    className="rounded p-0.5 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
                  >
                    <span className="wm-more-vert text-sm" />
                  </button>
                }
                align="end"
              >
                <WuMenuItem onSelect={() => onDelete(annotation.id)}>Delete</WuMenuItem>
              </WuMenu>
            </div>
            <p className="mt-2 text-sm leading-6 text-gray-700">{annotation.note}</p>
            <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
              <button
                type="button"
                onClick={() => showToast({ message: 'Comment thread coming soon.', variant: 'success' })}
                className="font-medium text-gray-600 hover:underline"
              >
                Comment
              </button>
              <span>{annotation.author}</span>
            </div>
          </article>
        ))}
        {aiAnnotations.map((annotation) => (
          <article key={annotation.id} className="rounded-lg border border-purple-100 bg-purple-50/40 p-3">
            <div className="flex items-start justify-between gap-2">
              {annotation.excerpt.timestampSeconds !== undefined ? (
                <button
                  type="button"
                  onClick={() => onSeekTo(annotation.excerpt.timestampSeconds ?? 0)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:underline"
                >
                  <span className="wm-play-arrow text-sm" /> Play ({annotation.excerpt.timestamp})
                </button>
              ) : (
                <span className="text-xs font-semibold text-gray-500">{annotation.excerpt.timestamp}</span>
              )}
              <AiSourceBadge />
            </div>
            <p className="mt-2 text-sm leading-6 text-gray-700">{annotation.note}</p>
            <p className="mt-2 text-xs leading-5 text-gray-500">&ldquo;{annotation.excerpt.quote}&rdquo;</p>
          </article>
        ))}
      </div>
    </div>
  );
}

function TagsTabContent({ aiTags }: { aiTags: AiTag[] }) {
  if (aiTags.length === 0) {
    return (
      <p className="text-sm text-gray-500">
        No tags yet. Ask InsightsHub chat to &ldquo;suggest tags for this video&rdquo; and save the results here.
      </p>
    );
  }

  return (
    <div>
      <div className="mb-3 flex items-center gap-1.5">
        <h2 className="text-sm font-semibold text-gray-950">Tags</h2>
        <AiSourceBadge />
      </div>
      <div className="flex flex-wrap gap-2">
        {aiTags.map((tag) => (
          <WuChip key={tag.id} variant="secondary" size="sm" color={tag.status === 'validated' ? 'success' : undefined}>
            {tag.label}
          </WuChip>
        ))}
      </div>
    </div>
  );
}

interface SessionReferencePanelProps {
  session: FocusGroupSession;
  annotations: SessionAnnotation[];
  aiAnnotations: AiAnnotation[];
  aiTags: AiTag[];
  activeTab: ReferencePanelTab;
  selectedTranscriptId?: string;
  onChangeTab: (tab: ReferencePanelTab) => void;
  onSelectTranscript: (line: FocusGroupTranscriptLine) => void;
  onSeekTo: (seconds: number) => void;
  onClearAnnotations: () => void;
  onDeleteAnnotation: (annotationId: string) => void;
}

export function SessionReferencePanel({
  session,
  annotations,
  aiAnnotations,
  aiTags,
  activeTab,
  selectedTranscriptId,
  onChangeTab,
  onSelectTranscript,
  onSeekTo,
  onClearAnnotations,
  onDeleteAnnotation,
}: SessionReferencePanelProps) {
  const items: IWuTabItem[] = REFERENCE_PANEL_TABS.map((tab) => ({
    value: tab.value,
    Trigger: tab.label,
    Content: <span className="sr-only">{tab.label} selected</span>,
  }));

  return (
    <aside className="flex min-h-0 flex-col border-l border-gray-200 bg-white lg:max-h-[560px]">
      <div className="shrink-0 border-b border-gray-100 px-4 py-3">
        <WuTab items={items} value={activeTab} onValueChange={(value) => onChangeTab(value as ReferencePanelTab)} />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
        {activeTab === 'index' &&
          (session.index.length === 0 ? (
            <p className="text-sm text-gray-500">Chapter index will appear here once the session has been processed.</p>
          ) : (
            <div className="space-y-1">
              {session.index.map((entry) => (
                <IndexRow key={entry.id} entry={entry} onSeek={onSeekTo} />
              ))}
            </div>
          ))}
        {activeTab === 'transcript' && (
          <div className="space-y-2">
            {session.transcript.map((line) => (
              <TranscriptRow
                key={line.id}
                line={line}
                selected={selectedTranscriptId === line.id}
                onSelect={() => onSelectTranscript(line)}
              />
            ))}
          </div>
        )}
        {activeTab === 'annotations' && (
          <AnnotationsTabContent
            annotations={annotations}
            aiAnnotations={aiAnnotations}
            onClearAll={onClearAnnotations}
            onSeekTo={onSeekTo}
            onDelete={onDeleteAnnotation}
          />
        )}
        {activeTab === 'tags' && <TagsTabContent aiTags={aiTags} />}
      </div>
    </aside>
  );
}
