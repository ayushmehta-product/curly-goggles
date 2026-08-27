'use client';

import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import {
  buildContextPickerOptions,
  overrideFromSelectedOptions,
  selectedOptionsFromOverride,
  type ContextPickerOption,
} from './chat-scope';
import type { ContextOverride } from './chat-types';

const WuCombobox = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuCombobox })),
  { ssr: false }
);
const WuButton = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuButton })),
  { ssr: false }
);

interface ChatContextPickerProps {
  override: ContextOverride | undefined;
  onChange: (override: ContextOverride | undefined) => void;
}

export function ChatContextPicker({ override, onChange }: ChatContextPickerProps) {
  const options = useMemo(() => buildContextPickerOptions(), []);
  const selected = selectedOptionsFromOverride(override, options);
  const count = selected.length;

  return (
    <div className="flex items-center gap-3">
      <div className="min-w-0 flex-1">
        <WuCombobox
          data={options}
          accessorKey={{ value: 'value', label: 'label' }}
          multiple
          enableSearch
          variant="outlined"
          placeholder="Target specific studies, sessions, or focus groups..."
          value={selected}
          onSelect={(value) => {
            const nextSelection = (Array.isArray(value) ? value : value ? [value] : []) as ContextPickerOption[];
            const next = overrideFromSelectedOptions(nextSelection);
            onChange(next.idiSessionIds.length === 0 && next.fgFocusGroupIds.length === 0 ? undefined : next);
          }}
        />
      </div>
      {count > 0 && (
        <WuButton size="sm" variant="link" onClick={() => onChange(undefined)}>
          Clear ({count})
        </WuButton>
      )}
    </div>
  );
}
