'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import type { InsightScopeRef } from '@/data/mock-ai-insights';
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
const WuInput = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuInput })),
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
  pending,
  onSelect,
}: {
  prompt: string;
  pending: boolean;
  onSelect: () => void;
}) {
  return (
    <WuButton
      variant="rounded"
      size="sm"
      color="neutral"
      selected={pending}
      loading={pending}
      disabled={pending}
      className="wu-shadow-sm h-auto text-left"
      onClick={onSelect}
      Icon={<span className={`${promptIcon(prompt)} text-sm`} aria-hidden="true" />}
    >
      {prompt}
    </WuButton>
  );
}

function EmptyState({
  scopeLabel,
  suggestedPrompts,
  pendingPrompt,
  onPromptSelect,
}: {
  scopeLabel: string;
  suggestedPrompts: string[];
  pendingPrompt: string | undefined;
  onPromptSelect: (prompt: string) => void;
}) {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-col items-center gap-6 py-10 text-center">
      {/* Bot avatar */}
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
        <span className="wm-smart-toy text-3xl text-accent" aria-hidden="true" />
      </div>

      {/* Heading */}
      <div className="space-y-1.5">
        <WuHeading size="md">How can I help you?</WuHeading>
        <WuSubtext size="sm" className="text-ink-muted">
          I&apos;m your AI research assistant, here to help you explore {scopeLabel} and uncover valuable insights.
        </WuSubtext>
      </div>

      {/* Tips card */}
      <WuCard rounded className="w-full bg-surface-sunken p-4 text-left wu-shadow-sm">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-muted">
          How to Get the Best Results
        </p>
        <ul className="space-y-2.5">
          {[
            { icon: 'wm-adjust', label: 'Be Specific', detail: 'Reference sessions, participants, or topics directly.' },
            { icon: 'wm-forum', label: 'Ask Follow-up Questions', detail: 'Drill into responses to surface richer insights.' },
            { icon: 'wm-filter-list', label: 'Limit Requests', detail: 'One question at a time gives cleaner, more actionable answers.' },
          ].map(({ icon, label, detail }) => (
            <li key={label} className="flex items-start gap-2.5">
              <span className={`${icon} mt-0.5 shrink-0 text-base text-accent`} aria-hidden="true" />
              <span className="text-sm text-ink">
                <span className="font-medium">{label}</span>
                {' — '}
                <span className="text-ink-muted">{detail}</span>
              </span>
            </li>
          ))}
        </ul>
      </WuCard>

      {/* Prompt pills */}
      {suggestedPrompts.length > 0 && (
        <div className="flex w-full flex-col gap-2">
          {suggestedPrompts.map((prompt) => (
            <PromptPill
              key={prompt}
              prompt={prompt}
              pending={pendingPrompt === prompt}
              onSelect={() => onPromptSelect(prompt)}
            />
          ))}
        </div>
      )}
    </div>
  );
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
  const [pendingPrompt, setPendingPrompt] = useState<string | undefined>(undefined);
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

  function handlePromptSelect(prompt: string) {
    setPendingPrompt(prompt);
    onSend(prompt);
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 bg-surface-sunken">
        <WuScrollArea className="h-full px-6 py-4">
          {messages.length === 0 ? (
            <EmptyState
              scopeLabel={scopeLabel}
              suggestedPrompts={suggestedPrompts}
              pendingPrompt={pendingPrompt}
              onPromptSelect={handlePromptSelect}
            />
          ) : (
            <div className="space-y-4">
              {messages.map((message) =>
                message.role === 'user' ? (
                  <div key={message.id} className="flex justify-end">
                    <div className="max-w-xl rounded-xl rounded-tr-sm bg-accent px-4 py-3 text-sm leading-6 text-inverse">
                      {message.promptLabel}
                    </div>
                  </div>
                ) : (
                  <div key={message.id} className="flex justify-start">
                    <WuCard rounded className="max-w-2xl p-4 wu-shadow-sm">
                      {message.response && <ChatMessageContent response={message.response} scope={scopeRef} />}
                    </WuCard>
                  </div>
                )
              )}
              <div ref={latestMessageAnchorRef} aria-hidden="true" />
            </div>
          )}
        </WuScrollArea>
      </div>

      <div className="shrink-0 border-t border-line bg-surface px-6 py-4">
        <div className="flex flex-col gap-3">
          {onContextOverrideChange && (
            <ChatContextPicker override={contextOverride} onChange={onContextOverrideChange} />
          )}
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <WuInput
                variant="outlined"
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') handleSend();
                }}
                placeholder="Ask InsightsHub anything..."
                className="w-full"
              />
            </div>
            <WuButton
              variant="primary"
              size="sm"
              onClick={handleSend}
              disabled={inputValue.trim().length === 0}
            >
              Send
            </WuButton>
          </div>
        </div>
      </div>
    </div>
  );
}
