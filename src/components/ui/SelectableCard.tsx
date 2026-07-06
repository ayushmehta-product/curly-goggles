'use client';

import { useState } from 'react';

// ---------------------------------------------------------------------------
// SelectableCard
// Reusable selectable card used in wizard steps (Study Type, Collection Type).
// All visual states handled via inline styles to avoid Tailwind JIT purging.
// ---------------------------------------------------------------------------

export interface SelectableCardProps {
  title: string;
  description: string;
  /** Pass an SVG using stroke="currentColor" — color is inherited from the wrapper */
  icon: React.ReactNode;
  isSelected: boolean;
  onClick: () => void;
}

export function SelectableCard({
  title,
  description,
  icon,
  isSelected,
  onClick,
}: SelectableCardProps) {
  const [hovered, setHovered] = useState(false);

  // ── Token values ──────────────────────────────────────────────────────────
  const BLUE       = '#2563EB';
  const BLUE_LIGHT = '#EFF6FF'; // blue-50
  const BLUE_HOVER = '#F5F8FF'; // subtler tint for hover
  const BLUE_RING  = '#93C5FD'; // blue-300 for hover border
  const GRAY_BORDER = '#D1D5DB'; // gray-300
  const GRAY_ICON  = '#9CA3AF'; // gray-400
  const ICON_BG_SELECTED   = '#DBEAFE'; // blue-100
  const ICON_BG_UNSELECTED = '#F3F4F6'; // gray-100

  const borderColor = isSelected ? BLUE : hovered ? BLUE_RING : GRAY_BORDER;
  const borderWidth = isSelected ? 2 : 1;
  const bgColor     = isSelected ? BLUE_LIGHT : hovered ? BLUE_HOVER : '#FFFFFF';
  const iconBg      = isSelected ? ICON_BG_SELECTED : ICON_BG_UNSELECTED;
  const iconColor   = isSelected ? BLUE : GRAY_ICON;
  const titleColor  = isSelected ? '#1E40AF' : '#111827'; // blue-800 : gray-900

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        width: '100%',
        textAlign: 'left',
        cursor: 'pointer',
        padding: '20px',
        borderRadius: 12,
        border: `${borderWidth}px solid ${borderColor}`,
        backgroundColor: bgColor,
        transition: 'border-color 0.15s ease, background-color 0.15s ease',
        outline: 'none',
        boxShadow: isSelected ? '0 0 0 0px transparent' : 'none',
      }}
    >
      {/* Radio indicator — top right */}
      <div style={{ position: 'absolute', top: 16, right: 16 }}>
        <div
          style={{
            width: 18,
            height: 18,
            borderRadius: '50%',
            border: `2px solid ${isSelected ? BLUE : GRAY_ICON}`,
            backgroundColor: isSelected ? BLUE : '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            transition: 'all 0.15s ease',
          }}
        >
          {isSelected && (
            <div
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                backgroundColor: '#FFFFFF',
              }}
            />
          )}
        </div>
      </div>

      {/* Icon box */}
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 8,
          backgroundColor: iconBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 14,
          color: iconColor,
          transition: 'background-color 0.15s ease, color 0.15s ease',
        }}
      >
        {icon}
      </div>

      {/* Title */}
      <p
        style={{
          fontSize: 14,
          fontWeight: 700,
          color: titleColor,
          marginBottom: 6,
          lineHeight: 1.4,
          paddingRight: 28, // avoid overlap with radio dot
          transition: 'color 0.15s ease',
        }}
      >
        {title}
      </p>

      {/* Description */}
      <p
        style={{
          fontSize: 13,
          color: '#6B7280',
          lineHeight: 1.55,
          margin: 0,
        }}
      >
        {description}
      </p>
    </button>
  );
}
