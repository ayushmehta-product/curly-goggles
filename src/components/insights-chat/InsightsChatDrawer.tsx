'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { AiLabel } from '@/components/ui/AiLabel';
import type { InsightScopeRef } from '@/data/mock-ai-insights';
import { InsightsChatPane } from './InsightsChatPane';
import {
  InsightsHubStudyPicker,
  selectionFromOverride,
  selectionToOverride,
} from './InsightsHubStudyPicker';
import type { ChatThread, ContextOverride, InsightsStudySelection } from './chat-types';

const WuDrawer = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuDrawer })),
  { ssr: false }
);
const WuButton = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuButton })),
  { ssr: false }
);
const WuMenu = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuMenu })),
  { ssr: false }
);
const WuMenuItem = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuMenuItem })),
  { ssr: false }
);
const WuMenuSeparatorItem = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuMenuSeparatorItem })),
  { ssr: false }
);

interface InsightsChatDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scopeLabel: string;
  scopeRef?: InsightScopeRef | null;
  suggestedPrompts: string[];
  activeThread?: ChatThread;
  threads: ChatThread[];
  onSelectThread: (threadId: string) => void;
  onNewThread: () => void;
  onSend: (promptLabel: string) => void;
  contextOverride?: ContextOverride;
  onContextOverrideChange?: (override: ContextOverride | undefined) => void;
}

export function InsightsChatDrawer({
  open,
  onOpenChange,
  scopeLabel,
  scopeRef,
  suggestedPrompts,
  activeThread,
  threads,
  onSelectThread,
  onNewThread,
  onSend,
  contextOverride,
  onContextOverrideChange,
}: InsightsChatDrawerProps) {
  const sortedThreads = [...threads].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
  const [step, setStep] = useState<'select' | 'chat'>(activeThread ? 'chat' : 'select');
  const [editingSelection, setEditingSelection] = useState(false);
  const [selectedStudies, setSelectedStudies] = useState<InsightsStudySelection[]>([]);

  useEffect(() => {
    if (!open) {
      setEditingSelection(false);
      return;
    }
    if (activeThread && !editingSelection) setStep('chat');
  }, [open, activeThread?.id, editingSelection]);

  function handleNewChat() {
    setSelectedStudies([]);
    setEditingSelection(false);
    setStep('select');
    onNewThread();
  }

  function handleAddStudies() {
    if (selectedStudies.length === 0) {
      setSelectedStudies(selectionFromOverride(contextOverride ?? activeThread?.contextOverride));
    }
    setEditingSelection(true);
    setStep('select');
  }

  function handleContinue() {
    onContextOverrideChange?.(selectionToOverride(selectedStudies));
    setEditingSelection(false);
    setStep('chat');
  }

  function handleSelectThread(threadId: string) {
    const thread = threads.find((item) => item.id === threadId);
    setSelectedStudies(selectionFromOverride(thread?.contextOverride));
    setEditingSelection(false);
    setStep('chat');
    onSelectThread(threadId);
  }

  const fromChat = Boolean(editingSelection && (activeThread || contextOverride));

  return (
    <WuDrawer
      side="right"
      open={open}
      onOpenChange={onOpenChange}
      overlayClassName="qp-insights-drawer-overlay"
      className="z-[1000] flex h-full min-h-0 w-full flex-col overflow-hidden p-0 sm:max-w-lg [&>div]:flex [&>div]:h-full [&>div]:min-h-0 [&>div]:flex-col [&>div]:overflow-hidden"
    >
      <div className="flex h-full min-h-0 flex-col overflow-hidden bg-surface">
        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-line bg-surface p-4 pr-12">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-ink">
              <AiLabel>InsightsHub chat</AiLabel>
            </p>
            <p className="mt-1 truncate text-sm text-ink-muted">
              {step === 'select'
                ? fromChat
                  ? 'Add more studies'
                  : 'Import studies first'
                : scopeLabel}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {step === 'chat' && (
              <WuButton size="sm" variant="secondary" onClick={handleAddStudies}>
                Add studies
              </WuButton>
            )}
            <WuMenu
              Trigger={
                <WuButton size="sm" variant="secondary" Icon={<span className="wm-history" />}>
                  History
                </WuButton>
              }
              align="end"
              slots={{ positioner: { zIndex: 1100 } }}
            >
              <WuMenuItem onSelect={handleNewChat}>
                <span className="inline-flex items-center gap-1">
                  <span className="wm-add" aria-hidden="true" />
                  New chat
                </span>
              </WuMenuItem>
              {sortedThreads.length > 0 && <WuMenuSeparatorItem />}
              <div className="max-h-[226px] overflow-y-auto">
                {sortedThreads.map((thread) => (
                  <WuMenuItem key={thread.id} onSelect={() => handleSelectThread(thread.id)}>
                    <span className="flex min-h-8 items-center truncate text-sm text-ink">
                      {thread.title}
                    </span>
                  </WuMenuItem>
                ))}
              </div>
            </WuMenu>
          </div>
        </div>

        <div className="flex h-0 min-h-0 flex-1 flex-col overflow-hidden">
          {step === 'select' ? (
            <InsightsHubStudyPicker
              selected={selectedStudies}
              onChange={setSelectedStudies}
              onContinue={handleContinue}
              continueLabel={fromChat ? 'Add to chat' : 'Continue'}
              onBack={fromChat ? () => {
                setEditingSelection(false);
                setStep('chat');
              } : undefined}
            />
          ) : (
            <InsightsChatPane
              scopeLabel={scopeLabel}
              scopeRef={scopeRef}
              suggestedPrompts={suggestedPrompts}
              activeThread={activeThread}
              onSend={onSend}
            />
          )}
        </div>
      </div>
    </WuDrawer>
  );
}
