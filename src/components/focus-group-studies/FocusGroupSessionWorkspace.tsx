'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useWuShowToast } from '@npm-questionpro/wick-ui-lib';
import { PageHeader } from '@/components/ui/PageHeader';
import { FocusGroupWorkspaceTabs } from '@/components/focus-group-studies/FocusGroupWorkspaceTabs';
import { FocusGroupVideoPlayer } from '@/components/focus-group-studies/FocusGroupVideoPlayer';
import { SessionThemes } from '@/components/focus-group-studies/session/SessionThemes';
import {
  SessionReferencePanel,
  type ReferencePanelTab,
} from '@/components/focus-group-studies/session/SessionReferencePanel';
import { SessionSummaryPanel } from '@/components/focus-group-studies/session/SessionSummaryPanel';
import { annotationsForScope, tagsForScope, themesForScope, useAiInsights } from '@/components/insights-chat/ai-insights-store';
import type { AiTheme, InsightScopeRef } from '@/data/mock-ai-insights';
import type { FocusGroup } from '@/data/mock-focus-groups';
import type { FocusGroupWorkspace } from '@/data/mock-focus-group-scheduling';
import type {
  FocusGroupSession,
  FocusGroupTranscriptLine,
  SessionAnnotation,
  SessionTheme,
} from '@/data/mock-focus-group-session';

interface FocusGroupSessionWorkspaceProps {
  focusGroup: FocusGroup;
  workspace: FocusGroupWorkspace;
  session: FocusGroupSession;
}

export function FocusGroupSessionWorkspace({
  focusGroup,
  workspace,
  session,
}: FocusGroupSessionWorkspaceProps) {
  const { showToast } = useWuShowToast();
  const searchParams = useSearchParams();

  const timestampParam = searchParams.get('t');
  const urlSeconds =
    timestampParam !== null && timestampParam !== '' && !Number.isNaN(Number(timestampParam))
      ? Math.min(session.durationSeconds, Math.max(0, Number(timestampParam)))
      : null;

  const [isPlaying, setIsPlaying] = useState(false);
  const [manualTime, setManualTime] = useState<number | null>(null);
  const [seenTimestampParam, setSeenTimestampParam] = useState(timestampParam);
  if (timestampParam !== seenTimestampParam) {
    setSeenTimestampParam(timestampParam);
    setManualTime(null);
  }
  const currentTime = manualTime ?? urlSeconds ?? 0;
  const [ccEnabled, setCcEnabled] = useState(false);
  const [activeRailTab, setActiveRailTab] = useState<ReferencePanelTab>('index');
  const [selectedTranscriptId, setSelectedTranscriptId] = useState<string | undefined>(undefined);
  const [activeThemeId, setActiveThemeId] = useState<string | undefined>(undefined);
  const [annotations, setAnnotations] = useState<SessionAnnotation[]>(session.annotations);

  const aiInsights = useAiInsights();
  const scopeRef: InsightScopeRef = { kind: 'fg-session', focusGroupId: focusGroup.id };
  const aiThemes = themesForScope(aiInsights, scopeRef);
  const aiTags = tagsForScope(aiInsights, scopeRef);
  const aiAnnotations = annotationsForScope(aiInsights, scopeRef);

  const canPlayback = session.recordingStatus === 'ready';

  function seekTo(seconds: number) {
    setManualTime(Math.min(session.durationSeconds, Math.max(0, seconds)));
  }

  function handleTogglePlay() {
    if (!canPlayback) {
      showToast({ message: 'Recording is not available yet for this session.', variant: 'warning' });
      return;
    }
    setIsPlaying((current) => !current);
  }

  function handleSkip(deltaSeconds: number) {
    seekTo(currentTime + deltaSeconds);
  }

  function handleSelectTranscript(line: FocusGroupTranscriptLine) {
    setSelectedTranscriptId(line.id);
    seekTo(line.timestampSeconds);
  }

  function handleSelectTheme(theme: SessionTheme) {
    setActiveThemeId(theme.id);
    seekTo(theme.startSeconds);
  }

  function handleSelectAiTheme(theme: AiTheme) {
    setActiveThemeId(theme.id);
    const seconds = theme.excerpts.find((excerpt) => excerpt.timestampSeconds !== undefined)?.timestampSeconds;
    if (seconds !== undefined) seekTo(seconds);
  }

  function handleClearAnnotations() {
    setAnnotations([]);
    showToast({ message: 'All annotations cleared.', variant: 'success' });
  }

  function handleDeleteAnnotation(annotationId: string) {
    setAnnotations((current) => current.filter((annotation) => annotation.id !== annotationId));
    showToast({ message: 'Annotation deleted.', variant: 'success' });
  }

  function handleAddAnnotation() {
    showToast({
      message: `Annotation added at ${Math.floor(currentTime / 60)}:${Math.round(currentTime % 60).toString().padStart(2, '0')}.`,
      variant: 'success',
    });
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Link
        href="/focus-group-studies"
        className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
      >
        <span className="wm-arrow-back text-base" /> Back to Focus Groups
      </Link>

      <PageHeader title={focusGroup.title} description="Video, annotations, and analysis for this session." />

      <div className="mb-5">
        <FocusGroupWorkspaceTabs focusGroupId={focusGroup.id} activeTab="session" />
      </div>

      <section className="rounded-lg border border-gray-200 bg-white p-5">
        <h2 className="mb-4 text-base font-semibold text-gray-900">Video</h2>

        {/* Tier 1: video + reference panel */}
        <div className="grid grid-cols-1 gap-0 overflow-hidden rounded-xl border border-gray-200 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="flex min-h-0 flex-col p-4">
            <FocusGroupVideoPlayer
              moderatorName={session.moderator}
              durationSeconds={session.durationSeconds}
              currentTime={currentTime}
              isPlaying={isPlaying}
              ccEnabled={ccEnabled}
              recordingStatus={session.recordingStatus}
              recordedAt={session.recordedAt}
              themes={[
                ...session.themes,
                ...aiThemes.map((theme) => {
                  const seconds =
                    theme.excerpts.find((excerpt) => excerpt.timestampSeconds !== undefined)?.timestampSeconds ?? 0;
                  const startSeconds = Math.max(0, seconds - 15);
                  const endSeconds = Math.min(session.durationSeconds, seconds + 15);
                  return {
                    id: theme.id,
                    label: theme.label,
                    color: theme.color,
                    startSeconds,
                    endSeconds,
                  };
                }),
              ]}
              onTogglePlay={handleTogglePlay}
              onSeek={seekTo}
              onSkip={handleSkip}
              onToggleCc={() => setCcEnabled((current) => !current)}
              onAddAnnotation={handleAddAnnotation}
            />

            <SessionThemes
              themes={session.themes}
              aiThemes={aiThemes}
              activeThemeId={activeThemeId}
              onSelectTheme={handleSelectTheme}
              onSelectAiTheme={handleSelectAiTheme}
            />

            <div className="mt-4 flex items-center gap-2 border-t border-gray-100 pt-4">
              <span className="text-xs font-medium text-gray-500">Participants:</span>
              <span className="text-xs text-gray-700">{session.participantRoster.join(' / ')}</span>
            </div>
          </div>

          <SessionReferencePanel
            session={session}
            annotations={annotations}
            aiAnnotations={aiAnnotations}
            aiTags={aiTags}
            activeTab={activeRailTab}
            selectedTranscriptId={selectedTranscriptId}
            onChangeTab={setActiveRailTab}
            onSelectTranscript={handleSelectTranscript}
            onSeekTo={seekTo}
            onClearAnnotations={handleClearAnnotations}
            onDeleteAnnotation={handleDeleteAnnotation}
          />
        </div>

        <SessionSummaryPanel summary={session.summary} keyTakeaways={session.keyTakeaways} />
      </section>

      <p className="mt-3 text-xs text-gray-400">
        {`${workspace.participants.length} invited \u00b7 ${
          workspace.participants.filter((participant) => participant.attendanceStatus === 'attended').length
        } attended \u00b7 Moderated by ${session.moderator}`}
      </p>
    </div>
  );
}
