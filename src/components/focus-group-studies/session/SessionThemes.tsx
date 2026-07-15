'use client';

import { THEME_BAR_STYLES, type SessionTheme } from '@/data/mock-focus-group-session';

interface SessionThemesProps {
  themes: SessionTheme[];
  activeThemeId?: string;
  onSelectTheme: (theme: SessionTheme) => void;
}

export function SessionThemes({ themes, activeThemeId, onSelectTheme }: SessionThemesProps) {
  if (themes.length === 0) return null;

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
    </div>
  );
}
