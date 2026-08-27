'use client';

import type { AiTheme } from '@/data/mock-ai-insights';
import { THEME_BAR_STYLES, type SessionTheme } from '@/data/mock-focus-group-session';

interface SessionThemesProps {
  themes: SessionTheme[];
  aiThemes: AiTheme[];
  activeThemeId?: string;
  onSelectTheme: (theme: SessionTheme) => void;
  onSelectAiTheme: (theme: AiTheme) => void;
}

export function SessionThemes({ themes, aiThemes, activeThemeId, onSelectTheme, onSelectAiTheme }: SessionThemesProps) {
  if (themes.length === 0 && aiThemes.length === 0) return null;

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      {themes.map((theme) => (
        <button
          key={theme.id}
          type="button"
          onClick={() => onSelectTheme(theme)}
          className={`inline-flex items-stretch overflow-hidden rounded-md bg-gray-100 text-sm font-medium text-gray-700 transition hover:bg-gray-200 ${
            activeThemeId === theme.id ? 'ring-2 ring-blue-400 ring-offset-1' : ''
          }`}
        >
          <span className={`w-1 shrink-0 ${THEME_BAR_STYLES[theme.color]}`} aria-hidden />
          <span className="px-3 py-1.5">{theme.label}</span>
        </button>
      ))}
      {aiThemes.map((theme) => (
        <button
          key={theme.id}
          type="button"
          onClick={() => onSelectAiTheme(theme)}
          className={`inline-flex items-stretch overflow-hidden rounded-md border border-purple-200 bg-purple-50/60 text-sm font-medium text-purple-800 transition hover:bg-purple-100 ${
            activeThemeId === theme.id ? 'ring-2 ring-blue-400 ring-offset-1' : ''
          }`}
        >
          <span className={`w-1 shrink-0 ${THEME_BAR_STYLES[theme.color]}`} aria-hidden />
          <span className="flex items-center gap-1 px-3 py-1.5">
            <span className="wm-auto-awesome text-[11px]" />
            {theme.label}
          </span>
        </button>
      ))}
    </div>
  );
}
