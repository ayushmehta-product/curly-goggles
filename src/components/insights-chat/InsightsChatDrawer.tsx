'use client';

import dynamic from 'next/dynamic';
import { formatRelativeDate } from '@/data/mock-utils';
import type { InsightScopeRef } from '@/data/mock-ai-insights';
import { InsightsChatPane } from './InsightsChatPane';
import type { ChatThread, ContextOverride } from './chat-types';

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

  return (
    <WuDrawer side="right" open={open} onOpenChange={onOpenChange} className="flex h-full min-h-0 w-full flex-col p-0 sm:max-w-lg wu-shadow-md">
      <div className="flex h-full min-h-0 flex-col bg-surface">
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-line bg-surface px-6 py-4 pr-12 wu-shadow-sm">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-ink">InsightsHub Chat</p>
            <p className="mt-1 truncate text-xs text-ink-muted">
              {activeThread ? activeThread.scopeLabel : scopeLabel}
            </p>
          </div>
          <WuMenu
            Trigger={
              <WuButton size="sm" variant="outline" Icon={<span className="wm-history" />}>
                History
              </WuButton>
            }
            align="end"
          >
            <WuMenuItem onSelect={onNewThread}>+ New chat</WuMenuItem>
            {sortedThreads.length > 0 && <WuMenuSeparatorItem />}
            {sortedThreads.map((thread) => (
              <WuMenuItem key={thread.id} onSelect={() => onSelectThread(thread.id)}>
                <div className="min-w-0">
                  <p className="truncate text-sm">{thread.title}</p>
                  <p className="text-xs text-ink-muted">{formatRelativeDate(thread.updatedAt)}</p>
                </div>
              </WuMenuItem>
            ))}
          </WuMenu>
        </div>

        <div className="flex min-h-0 flex-1 flex-col">
          <InsightsChatPane
            scopeLabel={scopeLabel}
            scopeRef={scopeRef}
            suggestedPrompts={suggestedPrompts}
            activeThread={activeThread}
            onSend={onSend}
            contextOverride={contextOverride}
            onContextOverrideChange={onContextOverrideChange}
          />
        </div>
      </div>
    </WuDrawer>
  );
}
