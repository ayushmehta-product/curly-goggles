'use client';

import dynamic from 'next/dynamic';
import { useWuShowToast } from '@npm-questionpro/wick-ui-lib';
import {
  THEME_PROGRESS_BAR_STYLES,
  type FocusGroupRecordingStatus,
  type SessionTheme,
} from '@/data/mock-focus-group-session';

const WuTooltip = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuTooltip })),
  { ssr: false }
);

const RECORDING_STATUS_LABELS: Record<FocusGroupRecordingStatus, string> = {
  ready: 'Recording ready',
  uploading: 'Uploading',
  'not-started': 'Not started',
};

function formatTime(totalSeconds: number) {
  const clamped = Math.max(0, Math.round(totalSeconds));
  const minutes = Math.floor(clamped / 60);
  const seconds = clamped % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function IconButton({
  icon,
  label,
  active,
  onClick,
}: {
  icon: string;
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <WuTooltip content={label}>
      <button
        type="button"
        aria-label={label}
        onClick={onClick}
        className={`flex h-8 w-8 items-center justify-center rounded-full text-white/80 transition hover:bg-white/10 hover:text-white ${
          active ? 'bg-white/20 text-white' : ''
        }`}
      >
        <span className={`${icon} text-lg`} />
      </button>
    </WuTooltip>
  );
}

interface FocusGroupVideoPlayerProps {
  moderatorName: string;
  durationSeconds: number;
  currentTime: number;
  isPlaying: boolean;
  ccEnabled: boolean;
  recordingStatus: FocusGroupRecordingStatus;
  recordedAt?: string;
  themes: SessionTheme[];
  onTogglePlay: () => void;
  onSeek: (seconds: number) => void;
  onSkip: (deltaSeconds: number) => void;
  onToggleCc: () => void;
  onAddAnnotation: () => void;
}

export function FocusGroupVideoPlayer({
  moderatorName,
  durationSeconds,
  currentTime,
  isPlaying,
  ccEnabled,
  recordingStatus,
  recordedAt,
  themes,
  onTogglePlay,
  onSeek,
  onSkip,
  onToggleCc,
  onAddAnnotation,
}: FocusGroupVideoPlayerProps) {
  const { showToast } = useWuShowToast();
  const progressPercent = durationSeconds > 0 ? Math.min(100, (currentTime / durationSeconds) * 100) : 0;

  function handleScrubberClick(event: React.MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    onSeek(ratio * durationSeconds);
  }

  function handleDownload() {
    showToast({ message: 'Downloading session recording\u2026', variant: 'success' });
  }

  function handleFullscreen() {
    showToast({ message: 'Opening fullscreen player\u2026', variant: 'success' });
  }

  return (
    <div>
      <div className="relative aspect-video min-h-[420px] overflow-hidden rounded-xl bg-black text-white shadow-sm">
        {!isPlaying && (
          <button
            type="button"
            onClick={onTogglePlay}
            aria-label="Play recording"
            className="absolute inset-0 flex flex-col items-center justify-center gap-3"
          >
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600/90 text-white shadow-lg transition hover:bg-blue-600">
              <span className="wm-play-arrow text-3xl" />
            </span>
            <span className="rounded-full bg-black/40 px-3 py-1 text-sm font-medium">
              {moderatorName} (Moderator)
            </span>
          </button>
        )}
        {isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm text-white/50">
              {recordingStatus === 'not-started' ? 'Session not started' : 'Recording preview'}
            </span>
          </div>
        )}

        <button
          type="button"
          onClick={onAddAnnotation}
          aria-label="Add annotation"
          className="absolute bottom-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition hover:bg-blue-700"
        >
          <span className="wm-add text-lg" />
        </button>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <IconButton icon="wm-replay-5" label="Back 5 seconds" onClick={() => onSkip(-5)} />
        <IconButton
          icon={isPlaying ? 'wm-pause' : 'wm-play-arrow'}
          label={isPlaying ? 'Pause' : 'Play'}
          onClick={onTogglePlay}
        />
        <IconButton icon="wm-forward-5" label="Forward 5 seconds" onClick={() => onSkip(5)} />

        <span className="w-[86px] shrink-0 text-xs text-gray-500">
          {formatTime(currentTime)} / {formatTime(durationSeconds)}
        </span>

        <div
          role="slider"
          aria-label="Seek"
          aria-valuemin={0}
          aria-valuemax={durationSeconds}
          aria-valuenow={currentTime}
          onClick={handleScrubberClick}
          className="relative h-2 flex-1 cursor-pointer rounded-full bg-gray-200"
        >
          {themes.map((theme) => (
            <div
              key={theme.id}
              className={`absolute top-0 h-2 rounded-full opacity-70 ${THEME_PROGRESS_BAR_STYLES[theme.color]}`}
              style={{
                left: `${(theme.startSeconds / durationSeconds) * 100}%`,
                width: `${((theme.endSeconds - theme.startSeconds) / durationSeconds) * 100}%`,
              }}
            />
          ))}
          <div
            className="absolute top-0 h-2 rounded-full bg-blue-600"
            style={{ width: `${progressPercent}%` }}
          />
          <div
            className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-blue-600 shadow"
            style={{ left: `calc(${progressPercent}% - 6px)` }}
          />
        </div>

        <div className="flex items-center gap-1 pl-1 text-gray-500">
          <span className="wm-volume-up text-lg" />
          <input
            type="range"
            min={0}
            max={100}
            defaultValue={80}
            aria-label="Volume"
            className="h-1 w-16 accent-gray-700"
          />
        </div>

        <button
          type="button"
          onClick={onToggleCc}
          aria-label="Toggle closed captions"
          aria-pressed={ccEnabled}
          className={`rounded-md border px-1.5 py-0.5 text-[11px] font-bold tracking-wide transition ${
            ccEnabled ? 'border-gray-700 bg-gray-800 text-white' : 'border-gray-300 text-gray-500 hover:bg-gray-50'
          }`}
        >
          CC
        </button>

        <button
          type="button"
          onClick={handleDownload}
          aria-label="Download recording"
          className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100"
        >
          <span className="wm-download text-lg" />
        </button>

        <button
          type="button"
          onClick={handleFullscreen}
          aria-label="Fullscreen"
          className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100"
        >
          <span className="wm-fullscreen text-lg" />
        </button>
      </div>

      {recordedAt && (
        <p className="mt-1.5 text-xs text-gray-400">
          {`Recorded ${new Date(recordedAt).toLocaleString()} \u00b7 ${RECORDING_STATUS_LABELS[recordingStatus]}`}
        </p>
      )}
    </div>
  );
}
