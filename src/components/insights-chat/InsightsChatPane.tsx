'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import type { InsightScopeRef } from '@/data/mock-ai-insights';
import { AiLabel } from '@/components/ui/AiLabel';
import { ChatContextPicker } from './ChatContextPicker';
import { ChatMessageContent } from './ChatMessageContent';
import type { ChatThread, ContextOverride } from './chat-types';

const WuButton = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuButton })),
  { ssr: false }
);
const WuCard = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuCard })),
  { ssr: false }
);
const WuHeading = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuHeading })),
  { ssr: false }
);
const WuTextarea = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuTextarea })),
  { ssr: false }
);
const WuScrollArea = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuScrollArea })),
  { ssr: false }
);
const WuSubtext = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuSubtext })),
  { ssr: false }
);

interface InsightsChatPaneProps {
  scopeLabel: string;
  scopeRef?: InsightScopeRef | null;
  suggestedPrompts: string[];
  activeThread?: ChatThread;
  onSend: (promptLabel: string) => void;
  contextOverride?: ContextOverride;
  onContextOverrideChange?: (override: ContextOverride | undefined) => void;
}

/** Maps prompt keywords to a Material icon name for the prompt pills. */
const PROMPT_ICON_MAP: Array<{ test: RegExp; icon: string }> = [
  { test: /tag/i, icon: 'wm-sell' },
  { test: /summar/i, icon: 'wm-summarize' },
  { test: /attention|pain|need/i, icon: 'wm-warning' },
  { test: /theme|analys/i, icon: 'wm-auto-awesome' },
  { test: /quote|moment/i, icon: 'wm-format-quote' },
  { test: /word.frequen|wordcloud/i, icon: 'wm-bubble-chart' },
  { test: /follow.?up|question/i, icon: 'wm-help-outline' },
  { test: /saved|what have/i, icon: 'wm-bookmark' },
  { test: /active|stud/i, icon: 'wm-science' },
  { test: /complet/i, icon: 'wm-check-circle' },
];

function promptIcon(prompt: string): string {
  for (const { test, icon } of PROMPT_ICON_MAP) {
    if (test.test(prompt)) return icon;
  }
  return 'wm-chat';
}

function PromptPill({
  prompt,
  onSelect,
}: {
  prompt: string;
  onSelect: () => void;
}) {
  return (
    <WuButton
      variant="secondary"
      size="sm"
      className="h-auto text-left"
      onClick={onSelect}
      Icon={<span className={`${promptIcon(prompt)} text-[18px]`} aria-hidden="true" />}
    >
      {prompt}
    </WuButton>
  );
}

function EmptyState({
  scopeLabel,
  suggestedPrompts,
  onPromptSelect,
}: {
  scopeLabel: string;
  suggestedPrompts: string[];
  onPromptSelect: (prompt: string) => void;
}) {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-col items-center gap-8 py-8 text-center">
      <div className="space-y-2">
        <WuHeading size="md">
          <AiLabel>How can I help you?</AiLabel>
        </WuHeading>
        <WuSubtext size="sm">
          I&apos;m your AI research assistant, here to help you explore {scopeLabel} and uncover
          valuable insights.
        </WuSubtext>
      </div>

      <WuCard rounded className="w-full p-4 text-left">
        <p className="mb-3 text-sm font-semibold text-ink">How to get the best results</p>
        <ul className="flex flex-col gap-2">
          {[
            {
              icon: 'wm-adjust',
              label: 'Be specific',
              detail: 'Reference sessions, participants, or topics directly.',
            },
            {
              icon: 'wm-forum',
              label: 'Ask follow-up questions',
              detail: 'Drill into responses to surface richer insights.',
            },
            {
              icon: 'wm-filter-list',
              label: 'Limit requests',
              detail: 'One question at a time gives cleaner, more actionable answers.',
            },
          ].map(({ icon, label, detail }) => (
            <li key={label} className="flex items-start gap-1">
              <span className={`${icon} mt-0.5 shrink-0 text-[18px] text-accent`} aria-hidden="true" />
              <span className="text-sm text-ink">
                <span className="font-medium">{label}</span>
                {' — '}
                <span className="text-ink-muted">{detail}</span>
              </span>
            </li>
          ))}
        </ul>
      </WuCard>

      {suggestedPrompts.length > 0 && (
        <div className="flex w-full flex-col gap-2">
          {suggestedPrompts.map((prompt) => (
            <PromptPill key={prompt} prompt={prompt} onSelect={() => onPromptSelect(prompt)} />
          ))}
        </div>
      )}
    </div>
  );
}

function composerRowCount(value: string): number {
  if (!value) return 1;
  const lines = value.split('\n').reduce((sum, line) => sum + Math.max(1, Math.ceil(line.length / 52)), 0);
  return Math.min(5, Math.max(1, lines));
}

export function InsightsChatPane({
  scopeLabel,
  scopeRef = null,
  suggestedPrompts,
  activeThread,
  onSend,
  contextOverride,
  onContextOverrideChange,
}: InsightsChatPaneProps) {
  const [inputValue, setInputValue] = useState('');
  const messages = activeThread?.messages ?? [];
  const latestMessageAnchorRef = useRef<HTMLDivElement>(null);
  const messageCount = messages.length;

  useEffect(() => {
    latestMessageAnchorRef.current?.scrollIntoView({ block: 'end' });
  }, [messageCount]);

  function handleSend() {
    const trimmed = inputValue.trim();
    if (trimmed.length === 0) return;
    onSend(trimmed);
    setInputValue('');
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 bg-surface-sunken">
        <WuScrollArea className="h-full p-4">
          {messages.length === 0 ? (
            <EmptyState
              scopeLabel={scopeLabel}
              suggestedPrompts={suggestedPrompts}
              onPromptSelect={onSend}
            />
          ) : (
            <div className="flex flex-col gap-4">
              {messages.map((message) =>
                message.role === 'user' ? (
                  <div key={message.id} className="flex justify-end">
                    <div className="max-w-xl rounded-lg bg-accent px-4 py-3 text-sm text-inverse">
                      {message.promptLabel}
                    </div>
                  </div>
                ) : (
                  <div key={message.id} className="flex justify-start">
                    <WuCard rounded className="max-w-2xl p-4">
                      {message.response && (
                        <ChatMessageContent response={message.response} scope={scopeRef} />
                      )}
                    </WuCard>
                  </div>
                )
              )}
              <div ref={latestMessageAnchorRef} aria-hidden="true" />
            </div>
          )}
        </WuScrollArea>
      </div>

      <div className="shrink-0 border-t border-line bg-surface p-4">
        <div className="flex flex-col gap-2">
          {onContextOverrideChange && (
            <ChatContextPicker override={contextOverride} onChange={onContextOverrideChange} />
          )}
          <div className="flex items-end gap-2">
            <div className="min-w-0 flex-1">
              <WuTextarea
                variant="outlined"
                value={inputValue}
                rows={composerRowCount(inputValue)}
                onChange={(event) => setInputValue(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Ask InsightsHub anything"
                className="max-h-[7.5rem] w-full overflow-y-auto"
              />
            </div>
            <WuButton variant="primary" size="sm" onClick={handleSend} disabled={inputValue.trim().length === 0}>
              Send
            </WuButton>
          </div>
        </div>
      </div>
    </div>
  );
}
