'use client';

import { useState } from 'react';
import Link from 'next/link';
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

export function FocusGroupSessionWorkspace({ focusGroup, workspace, session }: FocusGroupSessionWorkspaceProps) {
  const { showToast } = useWuShowToast();

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [ccEnabled, setCcEnabled] = useState(false);
  const [activeRailTab, setActiveRailTab] = useState<ReferencePanelTab>('index');
  const [selectedTranscriptId, setSelectedTranscriptId] = useState<string | undefined>(undefined);
  const [activeThemeId, setActiveThemeId] = useState<string | undefined>(undefined);
  const [annotations, setAnnotations] = useState<SessionAnnotation[]>(session.annotations);

  const canPlayback = session.recordingStatus === 'ready';

  function seekTo(seconds: number) {
    setCurrentTime(Math.min(session.durationSeconds, Math.max(0, seconds)));
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
              themes={session.themes}
              onTogglePlay={handleTogglePlay}
              onSeek={seekTo}
              onSkip={handleSkip}
              onToggleCc={() => setCcEnabled((current) => !current)}
              onAddAnnotation={handleAddAnnotation}
            />

            <SessionThemes themes={session.themes} activeThemeId={activeThemeId} onSelectTheme={handleSelectTheme} />

            <div className="mt-4 flex items-center gap-2 border-t border-gray-100 pt-4">
              <span className="text-xs font-medium text-gray-500">Participants:</span>
              <span className="text-xs text-gray-700">{session.participantRoster.join(' / ')}</span>
            </div>
          </div>

          <SessionReferencePanel
            session={session}
            annotations={annotations}
            activeTab={activeRailTab}
            selectedTranscriptId={selectedTranscriptId}
            onChangeTab={setActiveRailTab}
            onSelectTranscript={handleSelectTranscript}
            onSeekTo={seekTo}
            onClearAnnotations={handleClearAnnotations}
            onDeleteAnnotation={handleDeleteAnnotation}
          />
        </div>

        {/* Tier 2: full-width summary cards */}
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
