'use client';

import dynamic from 'next/dynamic';
import { AiLabel } from '@/components/ui/AiLabel';
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
    <WuDrawer
      side="right"
      open={open}
      onOpenChange={onOpenChange}
      className="z-[20] flex h-full min-h-0 w-full flex-col p-0 sm:max-w-lg"
    >
      <div className="flex h-full min-h-0 flex-col bg-surface">
        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-line bg-surface p-4 pr-12">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-ink">
              <AiLabel>InsightsHub chat</AiLabel>
            </p>
            <p className="mt-1 truncate text-sm text-ink-muted">
              {activeThread ? activeThread.scopeLabel : scopeLabel}
            </p>
          </div>
          <WuMenu
            Trigger={
              <WuButton size="sm" variant="secondary" Icon={<span className="wm-history" />}>
                History
              </WuButton>
            }
            align="end"
          >
            <WuMenuItem onSelect={onNewThread}>
              <span className="inline-flex items-center gap-1">
                <span className="wm-add" aria-hidden="true" />
                New chat
              </span>
            </WuMenuItem>
            {sortedThreads.length > 0 && <WuMenuSeparatorItem />}
            <div className="max-h-[226px] overflow-y-auto">
              {sortedThreads.map((thread) => (
                <WuMenuItem key={thread.id} onSelect={() => onSelectThread(thread.id)}>
                  <span className="flex min-h-8 items-center truncate text-sm text-ink">
                    {thread.title}
                  </span>
                </WuMenuItem>
              ))}
            </div>
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
