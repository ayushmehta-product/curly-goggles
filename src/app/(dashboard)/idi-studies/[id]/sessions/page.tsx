'use client';

import { useMemo, useState, type ReactNode } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { format } from 'date-fns';
import { useWuShowToast } from '@npm-questionpro/wick-ui-lib';
import { StudyWorkspaceTabs } from '@/components/idi-studies/StudyWorkspaceTabs';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';
import { annotationsForScope, tagsForScope, themesForScope, useAiInsights } from '@/components/insights-chat/ai-insights-store';
import type { AiAnnotation, AiTag, AiTheme, InsightScopeRef } from '@/data/mock-ai-insights';
import { MOCK_IDI_STUDIES } from '@/data/mock-idi-studies';
import { MOCK_STUDY_OPERATIONAL_OVERVIEWS } from '@/data/mock-study-overview';
import {
  MOCK_MODERATED_WORKSPACE_SESSIONS,
  WORKSPACE_RECORDING_STATUS_LABELS,
  WORKSPACE_SESSION_STATUS_LABELS,
  type ModeratedWorkspaceSession,
  type WorkspaceRecordingStatus,
  type WorkspaceSessionStatus,
  type WorkspaceTranscriptLine,
} from '@/data/mock-moderated-sessions';

const WuButton = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuButton })),
  { ssr: false }
);
const WuChip = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuChip })),
  { ssr: false }
);
type ContextTab = 'transcript' | 'highlights' | 'notes' | 'themes' | 'tags';

const SESSION_STATUS_STYLES: Record<WorkspaceSessionStatus, string> = {
  scheduled: 'bg-gray-100 text-gray-700',
  live: 'bg-green-50 text-green-700',
  completed: 'bg-blue-50 text-blue-700',
  processing: 'bg-amber-50 text-amber-700',
  cancelled: 'bg-gray-100 text-gray-500',
};

const RECORDING_STATUS_STYLES: Record<WorkspaceRecordingStatus, string> = {
  ready: 'text-green-700',
  uploading: 'text-amber-700',
  'not-started': 'text-gray-500',
};

const CONTEXT_TABS: Array<{ value: ContextTab; label: string }> = [
  { value: 'transcript', label: 'Transcript' },
  { value: 'highlights', label: 'Highlights' },
  { value: 'notes', label: 'Notes' },
  { value: 'themes', label: 'Themes' },
  { value: 'tags', label: 'Tags' },
];

function AiSourceBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2 py-0.5 text-[11px] font-medium text-purple-700">
      <span className="wm-auto-awesome text-[11px]" /> AI
    </span>
  );
}

function Badge({ children, className }: { children: ReactNode; className: string }) {
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${className}`}>{children}</span>;
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function formatSessionDate(startsAt: string) {
  return `${format(new Date(startsAt), 'EEE, MMM d')} - ${format(new Date(startsAt), 'h:mm a')}`;
}

function formatShortSessionMeta(session: ModeratedWorkspaceSession) {
  return `${format(new Date(session.scheduledAt), 'MMM d, h:mm a')} - ${session.moderator}`;
}

function parseTimestampToSeconds(timestamp: string): number | null {
  const parts = timestamp.split(':').map((part) => Number(part));
  if (parts.some((part) => Number.isNaN(part))) return null;
  return parts.reduce((total, part) => total * 60 + part, 0);
}

function findClosestTranscriptLine(session: ModeratedWorkspaceSession, targetSeconds: number): WorkspaceTranscriptLine | null {
  let closest: { line: WorkspaceTranscriptLine; diff: number } | null = null;
  for (const line of session.transcript) {
    const seconds = parseTimestampToSeconds(line.timestamp);
    if (seconds === null) continue;
    const diff = Math.abs(seconds - targetSeconds);
    if (!closest || diff < closest.diff) closest = { line, diff };
  }
  return closest?.line ?? null;
}

function resolveDeepLinkedSessionId(
  studyId: string,
  overviewSessionId: string | null,
  sessions: ModeratedWorkspaceSession[]
): string | undefined {
  if (!overviewSessionId) return undefined;
  const overview = MOCK_STUDY_OPERATIONAL_OVERVIEWS.find((item) => item.studyId === studyId);
  const overviewSession = overview?.sessions.find((item) => item.id === overviewSessionId);
  if (!overviewSession) return undefined;
  return sessions.find((session) => session.participantName === overviewSession.participantName)?.id;
}

function SessionNavItem({
  session,
  active,
  onSelect,
}: {
  session: ModeratedWorkspaceSession;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full rounded-lg border px-3 py-2.5 text-left transition`}
    >
      <div
        className={`my-1 flex items-center gap-3 rounded-lg border p-3 transition ${
          active
            ? 'border-blue-600 bg-blue-50 text-blue-950 shadow-sm ring-2 ring-blue-100'
            : 'border-transparent bg-white hover:border-gray-100 hover:bg-gray-50'
        }`}
      >
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${
            active ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'
          }`}
        >
          {getInitials(session.participantName)}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-semibold text-gray-950">{session.participantName}</p>
            <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${session.status === 'live' ? 'bg-green-500' : 'bg-gray-300'}`} />
          </div>
          <p className="mt-0.5 truncate text-xs text-gray-500">{formatShortSessionMeta(session)}</p>
        </div>
        <div className="sr-only">
          <span className={RECORDING_STATUS_STYLES[session.recordingStatus]}>
            {WORKSPACE_RECORDING_STATUS_LABELS[session.recordingStatus]}
          </span>
        </div>
      </div>
    </button>
  );
}

function getNavigatorGroups(sessions: ModeratedWorkspaceSession[]) {
  return [
    {
      label: 'In Progress',
      sessions: sessions.filter((session) => session.status === 'processing' || session.recordingStatus === 'uploading'),
    },
    {
      label: 'Ready',
      sessions: sessions.filter(
        (session) =>
          session.status !== 'completed' &&
          session.status !== 'processing' &&
          session.recordingStatus !== 'uploading'
      ),
    },
    {
      label: 'Completed',
      sessions: sessions.filter((session) => session.status === 'completed'),
    },
  ].filter((group) => group.sessions.length > 0);
}

function SessionNavigator({
  sessions,
  activeSessionId,
  onSelectSession,
  onCreateSession,
}: {
  sessions: ModeratedWorkspaceSession[];
  activeSessionId: string;
  onSelectSession: (sessionId: string) => void;
  onCreateSession: () => void;
}) {
  const groupedSessions = getNavigatorGroups(sessions);

  return (
    <aside className="flex min-h-[calc(100vh-194px)] flex-col border-r border-gray-200">
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold text-gray-950">Sessions</h2>
          <p className="mt-0.5 text-xs text-gray-500">{sessions.length} interviews</p>
        </div>
        <WuButton size="sm" variant="link" Icon={<span className="wm-add" />} onClick={onCreateSession}>
          Create
        </WuButton>
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-4">
        <div className="space-y-5">
          {groupedSessions.map((group) => (
            <section key={group.label}>
              <h3 className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wide text-gray-400">{group.label}</h3>
              <div className="space-y-1">
                {group.sessions.map((session) => (
                  <SessionNavItem
                    key={session.id}
                    session={session}
                    active={session.id === activeSessionId}
                    onSelect={() => onSelectSession(session.id)}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </aside>
  );
}

function SessionVideo({ session }: { session: ModeratedWorkspaceSession }) {
  return (
    <div>
      <div className="flex aspect-video min-h-[420px] flex-col items-center justify-center rounded-xl bg-black text-white shadow-sm">
        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-white/10 text-lg font-semibold ring-1 ring-white/20">
          {getInitials(session.participantName)}
        </span>
        <p className="mt-4 text-sm text-white/70">{session.recordingStatus === 'not-started' ? 'Session not started' : 'Recording preview'}</p>
      </div>
      <div className="mt-3 flex items-center gap-3 text-xs text-gray-500">
        <button type="button" className="rounded-full bg-gray-900 p-2 text-white hover:bg-gray-800" aria-label="Play recording">
          <span className="wm-play-arrow text-sm" />
        </button>
        <span>0:00</span>
        <div className="h-1 flex-1 rounded-full bg-gray-200">
          <div className="h-1 w-1/3 rounded-full bg-gray-900" />
        </div>
        <span>{session.duration}</span>
        <span className="ml-2">1x</span>
      </div>
    </div>
  );
}

function SessionSummary({ session }: { session: ModeratedWorkspaceSession }) {
  return (
    <section className="space-y-6">
      <div>
        <div className="mb-3 flex items-center gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Summary</h2>
          <span className="rounded-full bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-700">AI</span>
        </div>
        <p className="max-w-3xl text-base leading-7 text-gray-800">{session.summary}</p>
      </div>
      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">Key observations</h3>
        <div className="grid gap-2">
          {session.keyObservations.map((observation) => (
            <div key={observation} className="flex gap-3 rounded-lg bg-gray-50 px-3 py-2.5 text-sm leading-6 text-gray-700">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
              <span>{observation}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CenterWorkspace({
  session,
  onMarkComplete,
}: {
  session: ModeratedWorkspaceSession;
  onMarkComplete: () => void;
}) {
  return (
    <main className="min-h-[calc(100vh-194px)] overflow-y-auto bg-white px-8 py-7">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <h1 className="text-2xl font-semibold text-gray-950">{session.participantName}</h1>
              <Badge className={SESSION_STATUS_STYLES[session.status]}>{WORKSPACE_SESSION_STATUS_LABELS[session.status]}</Badge>
            </div>
            <p className="text-sm text-gray-500">
              {session.participantRole} at {session.participantCompany}
            </p>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-gray-500">
              <span>{formatSessionDate(session.scheduledAt)}</span>
              <span>Moderator: {session.moderator}</span>
            </div>
          </div>
          <WuButton size="sm" variant="secondary" onClick={onMarkComplete} disabled={session.status === 'completed'}>
            Mark Complete
          </WuButton>
        </div>

        <SessionVideo session={session} />
        <div className="mt-8 border-t border-gray-100 pt-7">
          <SessionSummary session={session} />
        </div>
      </div>
    </main>
  );
}

function TranscriptLine({
  line,
  selected,
  onSelect,
}: {
  line: WorkspaceTranscriptLine;
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
        <span className="w-10 shrink-0 pt-0.5 text-[11px] font-medium text-gray-400">{line.timestamp}</span>
        <div>
          <p className="text-xs font-semibold text-gray-700">{line.speaker}</p>
          <p className="mt-1 text-sm leading-6 text-gray-700">{line.text}</p>
        </div>
      </div>
    </button>
  );
}

function TranscriptTab({
  session,
  selectedTranscriptId,
  onSelectTranscript,
}: {
  session: ModeratedWorkspaceSession;
  selectedTranscriptId?: string;
  onSelectTranscript: (line: WorkspaceTranscriptLine) => void;
}) {
  return (
    <div className="space-y-2">
      {session.transcript.map((line) => (
        <TranscriptLine
          key={line.id}
          line={line}
          selected={selectedTranscriptId === line.id}
          onSelect={() => onSelectTranscript(line)}
        />
      ))}
    </div>
  );
}

function HighlightsTab({ session, aiAnnotations }: { session: ModeratedWorkspaceSession; aiAnnotations: AiAnnotation[] }) {
  if (session.highlights.length === 0 && aiAnnotations.length === 0) {
    return <p className="text-sm text-gray-500">No highlights have been captured for this session yet.</p>;
  }

  return (
    <div className="space-y-3">
      {session.highlights.map((highlight) => (
        <article key={highlight.id} className="rounded-xl bg-gray-50 p-4">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-sm font-semibold leading-5 text-gray-950">{highlight.title}</h3>
            <span className="shrink-0 text-xs font-medium text-gray-400">{highlight.timestamp}</span>
          </div>
          <p className="mt-3 text-sm leading-6 text-gray-700">&ldquo;{highlight.quote}&rdquo;</p>
          <p className="mt-3 border-l-2 border-blue-200 pl-3 text-xs leading-5 text-gray-600">{highlight.observation}</p>
        </article>
      ))}
      {aiAnnotations.map((annotation) => (
        <article key={annotation.id} className="rounded-xl border border-purple-100 bg-purple-50/40 p-4">
          <div className="flex items-start justify-between gap-3">
            <AiSourceBadge />
            <span className="shrink-0 text-xs font-medium text-gray-400">{annotation.excerpt.timestamp}</span>
          </div>
          <p className="mt-3 text-sm leading-6 text-gray-700">&ldquo;{annotation.excerpt.quote}&rdquo;</p>
          <p className="mt-3 border-l-2 border-purple-200 pl-3 text-xs leading-5 text-gray-600">{annotation.note}</p>
        </article>
      ))}
    </div>
  );
}

function NotesTab({
  notes,
  noteDraft,
  onChangeNoteDraft,
  onAddNote,
}: {
  notes: string[];
  noteDraft: string;
  onChangeNoteDraft: (value: string) => void;
  onAddNote: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-gray-200 bg-white p-3">
        <textarea
          value={noteDraft}
          onChange={(event) => onChangeNoteDraft(event.target.value)}
          placeholder="Write a note..."
          className="min-h-24 w-full resize-none bg-transparent text-sm leading-6 text-gray-800 outline-none placeholder:text-gray-400"
        />
        <div className="mt-2 flex justify-end">
          <WuButton size="sm" onClick={onAddNote} disabled={noteDraft.trim().length === 0}>
            Add note
          </WuButton>
        </div>
      </div>
      {notes.map((note) => (
        <div key={note} className="rounded-lg bg-gray-50 p-3 text-sm leading-6 text-gray-700">
          {note}
        </div>
      ))}
    </div>
  );
}

function ThemesTab({ aiThemes }: { aiThemes: AiTheme[] }) {
  if (aiThemes.length === 0) {
    return (
      <p className="text-sm text-gray-500">
        No themes yet. Ask InsightsHub chat to &ldquo;do a thematic analysis of this video&rdquo; and save the results here.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {aiThemes.map((theme) => (
        <div key={theme.id} className="rounded-xl border border-purple-100 bg-purple-50/40 p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-gray-950">{theme.label}</p>
            <AiSourceBadge />
          </div>
          {theme.excerpts.map((excerpt, index) => (
            <p key={index} className="mt-2 text-xs leading-5 text-gray-600">
              &ldquo;{excerpt.quote}&rdquo; <span className="text-gray-400">— {excerpt.speaker}</span>
            </p>
          ))}
        </div>
      ))}
    </div>
  );
}

function TagsTab({ aiTags }: { aiTags: AiTag[] }) {
  if (aiTags.length === 0) {
    return (
      <p className="text-sm text-gray-500">
        No tags yet. Ask InsightsHub chat to &ldquo;suggest tags for this video&rdquo; and save the results here.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {aiTags.map((tag) => (
        <WuChip key={tag.id} variant="secondary" size="sm" color={tag.status === 'validated' ? 'success' : undefined}>
          {tag.label}
        </WuChip>
      ))}
    </div>
  );
}

function ContextRail({
  session,
  activeTab,
  selectedTranscriptId,
  notes,
  noteDraft,
  aiThemes,
  aiTags,
  aiAnnotations,
  onChangeTab,
  onSelectTranscript,
  onChangeNoteDraft,
  onAddNote,
}: {
  session: ModeratedWorkspaceSession;
  activeTab: ContextTab;
  selectedTranscriptId?: string;
  notes: string[];
  noteDraft: string;
  aiThemes: AiTheme[];
  aiTags: AiTag[];
  aiAnnotations: AiAnnotation[];
  onChangeTab: (tab: ContextTab) => void;
  onSelectTranscript: (line: WorkspaceTranscriptLine) => void;
  onChangeNoteDraft: (value: string) => void;
  onAddNote: () => void;
}) {
  return (
    <aside className="flex min-h-[calc(100vh-194px)] flex-col border-l border-gray-200 bg-white">
      <div className="border-b border-gray-100 px-5 py-4">
        <div className="rounded-lg bg-gray-100 p-1">
          <div className="grid grid-cols-5 gap-1">
            {CONTEXT_TABS.map((tab) => {
              const selected = activeTab === tab.value;

              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => onChangeTab(tab.value)}
                  className={`rounded-md px-2 py-1.5 text-xs transition ${
                    selected ? 'bg-white text-gray-950 shadow-sm' : 'text-gray-500 hover:text-gray-800'
                  }`}
                  style={{ fontWeight: selected ? 800 : 400 }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-5">
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-gray-950">
            {CONTEXT_TABS.find((tab) => tab.value === activeTab)?.label}
          </h2>
          <p className="mt-1 text-xs text-gray-500">
            {activeTab === 'transcript' && 'Review participant language and jump to moments.'}
            {activeTab === 'highlights' && 'Synthesis-ready moments from this interview.'}
            {activeTab === 'notes' && 'Private research notes for this session.'}
            {activeTab === 'themes' && 'Emerging patterns tied to this participant.'}
            {activeTab === 'tags' && 'Tags saved from the InsightsHub chat for this session.'}
          </p>
        </div>
        <div>
          {activeTab === 'transcript' && (
            <TranscriptTab
              session={session}
              selectedTranscriptId={selectedTranscriptId}
              onSelectTranscript={onSelectTranscript}
            />
          )}
          {activeTab === 'highlights' && <HighlightsTab session={session} aiAnnotations={aiAnnotations} />}
          {activeTab === 'notes' && (
            <NotesTab
              notes={notes}
              noteDraft={noteDraft}
              onChangeNoteDraft={onChangeNoteDraft}
              onAddNote={onAddNote}
            />
          )}
          {activeTab === 'themes' && <ThemesTab aiThemes={aiThemes} />}
          {activeTab === 'tags' && <TagsTab aiTags={aiTags} />}
        </div>
      </div>
    </aside>
  );
}

export default function ModeratedStudySessionsPage() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const { showToast } = useWuShowToast();
  const study = MOCK_IDI_STUDIES.find((item) => item.id === id);
  const initialSessions = MOCK_MODERATED_WORKSPACE_SESSIONS.filter((session) => session.studyId === id);
  const fallbackSessions = MOCK_MODERATED_WORKSPACE_SESSIONS.filter((session) => session.studyId === 'idi-001');
  const [sessions, setSessions] = useState<ModeratedWorkspaceSession[]>(
    initialSessions.length > 0 ? initialSessions : fallbackSessions
  );
  const [activeSessionId, setActiveSessionId] = useState(() => {
    const deepLinkedId = resolveDeepLinkedSessionId(
      id,
      searchParams.get('session'),
      initialSessions.length > 0 ? initialSessions : fallbackSessions
    );
    return deepLinkedId ?? (initialSessions[0] ?? fallbackSessions[0])?.id ?? '';
  });
  const [activeTab, setActiveTab] = useState<ContextTab>('transcript');
  const [selectedTranscriptId, setSelectedTranscriptId] = useState<string | undefined>(() => {
    const timestampParam = searchParams.get('t');
    const sessionList = initialSessions.length > 0 ? initialSessions : fallbackSessions;
    const deepLinkedId = resolveDeepLinkedSessionId(id, searchParams.get('session'), sessionList);
    const initialSession = sessionList.find((session) => session.id === deepLinkedId) ?? sessionList[0];
    if (!timestampParam || !initialSession) return undefined;
    const seconds = Number(timestampParam);
    if (Number.isNaN(seconds)) return undefined;
    return findClosestTranscriptLine(initialSession, seconds)?.id;
  });
  const [noteDraft, setNoteDraft] = useState('');
  const [notes, setNotes] = useState<string[]>([
    'Probe whether the participant needs a preview before applying recommendations globally.',
  ]);

  const activeSession = useMemo(
    () => sessions.find((session) => session.id === activeSessionId) ?? sessions[0],
    [activeSessionId, sessions]
  );

  const timestampParam = searchParams.get('t');
  const seekKey = `${timestampParam ?? ''}:${activeSession?.id ?? ''}`;
  const [appliedSeekKey, setAppliedSeekKey] = useState(seekKey);
  if (seekKey !== appliedSeekKey) {
    setAppliedSeekKey(seekKey);
    if (timestampParam && activeSession && !Number.isNaN(Number(timestampParam))) {
      const closestLine = findClosestTranscriptLine(activeSession, Number(timestampParam));
      if (closestLine) {
        setSelectedTranscriptId(closestLine.id);
        setActiveTab('transcript');
      }
    }
  }

  const aiInsights = useAiInsights();
  const sessionScopeRef: InsightScopeRef | null = activeSession
    ? { kind: 'idi-session', studyId: id, sessionId: activeSession.id }
    : null;
  const aiThemes = sessionScopeRef ? themesForScope(aiInsights, sessionScopeRef) : [];
  const aiTags = sessionScopeRef ? tagsForScope(aiInsights, sessionScopeRef) : [];
  const aiAnnotations = sessionScopeRef ? annotationsForScope(aiInsights, sessionScopeRef) : [];

  if (!study || !activeSession) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <EmptyState
          icon="wm-error-outline"
          title="Sessions workspace not found"
          description="This study does not exist or has no moderated sessions in the prototype workspace."
          action={<Link href="/idi-studies" className="text-sm font-medium text-blue-600 hover:underline">Back to IDI Studies</Link>}
        />
      </div>
    );
  }

  function showActionToast(message: string) {
    showToast({ message, variant: 'success' });
  }

  function createSession() {
    const newSession: ModeratedWorkspaceSession = {
      ...activeSession,
      id: `ws-session-${Date.now()}`,
      participantName: 'New participant',
      participantRole: 'Participant details pending',
      participantCompany: 'Pending booking',
      scheduledAt: '2026-05-18T10:00:00.000+05:30',
      moderator: 'Amara Shah',
      observerCount: 0,
      duration: '30:00',
      status: 'scheduled',
      recordingStatus: 'not-started',
      summary: 'Session summary will appear here after the interview is recorded and processed.',
      participantOverview: 'Participant details will be captured once the session is confirmed.',
      keyObservations: ['Use this session to capture onboarding expectations and decision confidence.'],
      transcript: [
        {
          id: `tr-${Date.now()}`,
          timestamp: '00:00',
          speaker: 'Moderator',
          text: 'Transcript will appear here after the session recording is processed.',
        },
      ],
      highlights: [],
    };

    setSessions((currentSessions) => [newSession, ...currentSessions]);
    setActiveSessionId(newSession.id);
    setActiveTab('transcript');
    setSelectedTranscriptId(undefined);
    showActionToast('Session created.');
  }

  function markSessionComplete() {
    setSessions((currentSessions) =>
      currentSessions.map((session) =>
        session.id === activeSession.id
          ? { ...session, status: 'completed', recordingStatus: 'ready' }
          : session
      )
    );
    showActionToast(`${activeSession.participantName} marked complete.`);
  }

  function selectTranscriptLine(line: WorkspaceTranscriptLine) {
    setSelectedTranscriptId(line.id);
    showActionToast(`Jumped to ${line.timestamp}.`);
  }

  function addNote() {
    if (noteDraft.trim().length === 0) return;
    setNotes((currentNotes) => [noteDraft.trim(), ...currentNotes]);
    setNoteDraft('');
    showActionToast('Note added.');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-6 pt-6">
        <Link href={`/idi-studies/${study.id}`} className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
          <span className="wm-arrow-back text-base" /> Back to overview
        </Link>
        <PageHeader
          title={study.title}
          action={
            <>
            <WuButton size="sm" variant="secondary" onClick={() => showActionToast('Share session link copied.')}>
              Share session
            </WuButton>
            <WuButton size="sm" variant="secondary" onClick={createSession} Icon={<span className="wm-add" />}>
              Create session
            </WuButton>
            </>
          }
        />
        <div className="mb-5">
          <StudyWorkspaceTabs studyId={study.id} activeTab="sessions" />
        </div>
      </div>

      <div className="grid min-h-[calc(100vh-194px)] grid-cols-1 border-t border-gray-200 xl:grid-cols-[300px_minmax(0,1fr)_390px]">
        <SessionNavigator
          sessions={sessions}
          activeSessionId={activeSession.id}
          onSelectSession={(sessionId) => {
            setActiveSessionId(sessionId);
            setSelectedTranscriptId(undefined);
          }}
          onCreateSession={createSession}
        />

        <CenterWorkspace session={activeSession} onMarkComplete={markSessionComplete} />

        <ContextRail
          session={activeSession}
          activeTab={activeTab}
          selectedTranscriptId={selectedTranscriptId}
          notes={notes}
          noteDraft={noteDraft}
          aiThemes={aiThemes}
          aiTags={aiTags}
          aiAnnotations={aiAnnotations}
          onChangeTab={setActiveTab}
          onSelectTranscript={selectTranscriptLine}
          onChangeNoteDraft={setNoteDraft}
          onAddNote={addNote}
        />
      </div>
    </div>
  );
}
