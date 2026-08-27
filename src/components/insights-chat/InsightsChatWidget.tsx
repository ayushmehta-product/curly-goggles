'use client';

import { useMemo, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { scopeRefFromChatScope } from './chat-actions';
import { isChatWidgetHiddenRoute, resolveChatScope, scopeLabel as getScopeLabel } from './chat-scope';
import { appendChatTurn } from './chat-turns';
import { InsightsChatButton } from './InsightsChatButton';
import { InsightsChatDrawer } from './InsightsChatDrawer';
import type { ChatThread, ContextOverride } from './chat-types';

interface InsightsChatWidgetProps {
  threads: ChatThread[];
  onThreadsChange: (updater: ChatThread[] | ((current: ChatThread[]) => ChatThread[])) => void;
  activeThreadId: string | undefined;
  onActiveThreadChange: (id: string | undefined) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InsightsChatWidget({
  threads,
  onThreadsChange,
  activeThreadId,
  onActiveThreadChange,
  isOpen,
  onOpenChange,
}: InsightsChatWidgetProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeThread = threads.find((thread) => thread.id === activeThreadId);
  const [contextOverride, setContextOverride] = useState<ContextOverride | undefined>(undefined);

  const { scope, suggestedPrompts } = useMemo(
    () => resolveChatScope(pathname, searchParams, contextOverride),
    [pathname, searchParams, contextOverride]
  );
  const scopeRef = useMemo(() => scopeRefFromChatScope(scope), [scope]);

  if (isChatWidgetHiddenRoute(pathname)) return null;

  function handleContextOverrideChange(override: ContextOverride | undefined) {
    setContextOverride(override);
    if (activeThreadId) {
      onThreadsChange((current) =>
        current.map((thread) =>
          thread.id === activeThreadId ? { ...thread, contextOverride: override } : thread
        )
      );
    }
  }

  function handleSend(promptLabel: string) {
    const result = appendChatTurn(promptLabel, scope, threads, activeThreadId, contextOverride);
    onThreadsChange(result.threads);
    onActiveThreadChange(result.activeThreadId);
  }

  return (
    <>
      <InsightsChatButton onClick={() => onOpenChange(true)} />
      <InsightsChatDrawer
        open={isOpen}
        onOpenChange={onOpenChange}
        scopeLabel={getScopeLabel(scope)}
        scopeRef={scopeRef}
        suggestedPrompts={suggestedPrompts}
        activeThread={activeThread}
        threads={threads}
        onSelectThread={(threadId) => {
          onActiveThreadChange(threadId);
          setContextOverride(threads.find((thread) => thread.id === threadId)?.contextOverride);
        }}
        onNewThread={() => {
          onActiveThreadChange(undefined);
          setContextOverride(undefined);
        }}
        onSend={handleSend}
        contextOverride={contextOverride}
        onContextOverrideChange={handleContextOverrideChange}
      />
    </>
  );
}
