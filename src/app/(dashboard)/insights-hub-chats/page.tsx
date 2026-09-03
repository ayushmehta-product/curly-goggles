'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { useWuShowToast } from '@npm-questionpro/wick-ui-lib';
import { PageHeader } from '@/components/ui/PageHeader';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { AiLabel } from '@/components/ui/AiLabel';
import { InsightsChatPane } from '@/components/insights-chat/InsightsChatPane';
import { scopeRefFromChatScope } from '@/components/insights-chat/chat-actions';
import { INSIGHTS_HUB_CHATS_ROUTE, resolveChatScope, scopeLabel as getScopeLabel } from '@/components/insights-chat/chat-scope';
import { loadChatThreads, saveChatThreads } from '@/components/insights-chat/chat-storage';
import { appendChatTurn } from '@/components/insights-chat/chat-turns';
import type { ChatThread, ContextOverride } from '@/components/insights-chat/chat-types';
import { MOCK_INSIGHTS_CHAT_THREADS } from '@/data/mock-insights-chats';
import { formatRelativeDate } from '@/data/mock-utils';

const WuButton = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuButton })),
  { ssr: false }
);
const WuScrollArea = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuScrollArea })),
  { ssr: false }
);
const WuInput = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuInput })),
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
const WuText = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuText })),
  { ssr: false }
);
const WuSubtext = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuSubtext })),
  { ssr: false }
);

const EMPTY_SEARCH_PARAMS = new URLSearchParams();

export default function InsightsHubChatsPage() {
  const { showToast } = useWuShowToast();

  const [threads, setThreads] = useState<ChatThread[]>(() => loadChatThreads() ?? MOCK_INSIGHTS_CHAT_THREADS);
  const [activeThreadId, setActiveThreadId] = useState<string | undefined>(undefined);
  const activeThread = threads.find((thread) => thread.id === activeThreadId);
  const [contextOverride, setContextOverride] = useState<ContextOverride | undefined>(undefined);

  const [search, setSearch] = useState('');
  const [renamingId, setRenamingId] = useState<string | undefined>(undefined);
  const [renameValue, setRenameValue] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<ChatThread | undefined>(undefined);

  useEffect(() => {
    saveChatThreads(threads);
  }, [threads]);

  const sortedThreads = useMemo(
    () => [...threads].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
    [threads]
  );

  const filteredThreads = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return sortedThreads;
    return sortedThreads.filter(
      (t) => t.title.toLowerCase().includes(q) || t.scopeLabel.toLowerCase().includes(q)
    );
  }, [sortedThreads, search]);

  const { scope, suggestedPrompts } = useMemo(
    () => resolveChatScope(INSIGHTS_HUB_CHATS_ROUTE, EMPTY_SEARCH_PARAMS, contextOverride),
    [contextOverride]
  );
  const scopeRef = useMemo(() => scopeRefFromChatScope(scope), [scope]);

  function handleContextOverrideChange(override: ContextOverride | undefined) {
    setContextOverride(override);
    if (activeThreadId) {
      setThreads((current) =>
        current.map((thread) =>
          thread.id === activeThreadId ? { ...thread, contextOverride: override } : thread
        )
      );
    }
  }

  function handleSend(promptLabel: string) {
    const result = appendChatTurn(promptLabel, scope, threads, activeThreadId, contextOverride);
    setThreads(result.threads);
    setActiveThreadId(result.activeThreadId);
  }

  function commitRename(id: string) {
    const value = renameValue.trim();
    if (value) {
      setThreads((current) =>
        current.map((t) => (t.id === id ? { ...t, title: value } : t))
      );
    }
    setRenamingId(undefined);
    setRenameValue('');
  }

  function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setThreads((current) => current.filter((t) => t.id !== deleteTarget.id));
    if (activeThreadId === deleteTarget.id) {
      setActiveThreadId(undefined);
      setContextOverride(undefined);
    }
    showToast({ message: `"${deleteTarget.title}" deleted.`, variant: 'success' });
    setDeleteTarget(undefined);
  }

  return (
    <div className="flex h-[calc(100dvh-48px)] min-h-0 flex-col gap-8 overflow-hidden bg-surface px-4 py-8">
      <div className="shrink-0">
        <PageHeader
          title={<AiLabel>InsightsHub chats</AiLabel>}
          description="Review past conversations or start a new chat with InsightsHub."
        />
      </div>

      <div className="grid min-h-0 flex-1 overflow-hidden rounded-xl border border-line bg-surface lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="flex min-h-0 flex-col border-b border-line bg-[var(--qp-gray-20)] lg:border-b-0 lg:border-r">
          <div className="flex shrink-0 flex-col gap-2 p-4">
            <WuButton
              variant="primary"
              Icon={<span className="wm-add" />}
              className="w-full justify-center"
              onClick={() => {
                setActiveThreadId(undefined);
                setContextOverride(undefined);
                setRenamingId(undefined);
              }}
            >
              New chat
            </WuButton>
            <WuInput
              variant="outlined"
              placeholder="Search chats"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full"
            />
            {threads.length >= 3 && (
              <WuSubtext size="sm">
                {filteredThreads.length === sortedThreads.length
                  ? `${threads.length} conversations`
                  : `${filteredThreads.length} of ${threads.length} conversations`}
              </WuSubtext>
            )}
          </div>
          <div className="qp-cut-line shrink-0" />

          <div className="min-h-0 flex-1">
            <WuScrollArea className="h-full p-4 pt-2">
              {filteredThreads.length === 0 ? (
                <p className="px-2 py-8 text-center text-sm text-ink-muted">
                  {search.trim() ? 'No chats match your search' : 'No chats yet'}
                </p>
              ) : (
                <div className="flex flex-col">
                  {filteredThreads.map((thread) => {
                    const selected = thread.id === activeThreadId;
                    const isRenaming = renamingId === thread.id;
                    const turnCount = Math.ceil(thread.messages.length / 2);

                    return (
                      <div key={thread.id} className="relative">
                        <button
                          type="button"
                          aria-current={selected ? 'true' : undefined}
                          onClick={() => {
                            if (isRenaming) return;
                            setActiveThreadId(thread.id);
                            setContextOverride(thread.contextOverride);
                          }}
                          className={`w-full rounded p-4 text-left transition-colors hover:bg-[var(--qp-gray-40)] ${
                            selected
                              ? 'qp-row-selected shadow-[inset_4px_0_0_var(--qp-p-blue)]'
                              : ''
                          }`}
                        >
                          <div className="flex items-start gap-1 pr-6">
                            <span
                              className="wm-chat mt-0.5 shrink-0 text-[18px] text-ink-muted"
                              aria-hidden="true"
                            />
                            <div className="min-w-0 flex-1">
                              {isRenaming ? (
                                <div onClick={(e) => e.stopPropagation()}>
                                  <WuInput
                                    variant="outlined"
                                    value={renameValue}
                                    onChange={(e) => setRenameValue(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') commitRename(thread.id);
                                      if (e.key === 'Escape') {
                                        setRenamingId(undefined);
                                        setRenameValue('');
                                      }
                                    }}
                                    onBlur={() => commitRename(thread.id)}
                                    autoFocus
                                    className="w-full text-sm"
                                  />
                                </div>
                              ) : (
                                <WuText size="sm" as="div" className="truncate font-medium text-ink">
                                  {thread.title}
                                </WuText>
                              )}
                              <div className="mt-1 flex items-center gap-1 text-sm text-ink-muted">
                                <span>
                                  {turnCount} turn{turnCount === 1 ? '' : 's'}
                                </span>
                                <span aria-hidden="true">·</span>
                                <span className="truncate">{formatRelativeDate(thread.updatedAt)}</span>
                              </div>
                              {!isRenaming && (
                                <WuSubtext size="sm" as="div" className="mt-1 truncate">
                                  {thread.scopeLabel}
                                </WuSubtext>
                              )}
                            </div>
                          </div>
                        </button>
                        <div className="absolute right-2 top-2" onClick={(e) => e.stopPropagation()}>
                          <WuMenu
                            Trigger={
                              <WuButton
                                variant="iconOnly"
                                size="sm"
                                aria-label={`Actions for ${thread.title}`}
                                Icon={<span className="wm-more-vert" />}
                              />
                            }
                            align="end"
                          >
                            <WuMenuItem
                              onSelect={() => {
                                setRenamingId(thread.id);
                                setRenameValue(thread.title);
                                setActiveThreadId(thread.id);
                              }}
                            >
                              Rename
                            </WuMenuItem>
                            <WuMenuItem onSelect={() => setDeleteTarget(thread)}>
                              Delete
                            </WuMenuItem>
                          </WuMenu>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </WuScrollArea>
          </div>
        </aside>

        <section className="flex min-h-0 flex-col bg-surface-sunken">
          {activeThread && (
            <div className="shrink-0 border-b border-line bg-surface p-4">
              <p className="text-sm font-semibold text-ink">{activeThread.title}</p>
              <p className="mt-1 truncate text-sm text-ink-muted">{activeThread.scopeLabel}</p>
            </div>
          )}
          <InsightsChatPane
            key={activeThreadId ?? 'new'}
            scopeLabel={activeThread?.scopeLabel ?? getScopeLabel(scope)}
            scopeRef={scopeRef}
            suggestedPrompts={suggestedPrompts}
            activeThread={activeThread}
            onSend={handleSend}
            contextOverride={contextOverride}
            onContextOverrideChange={handleContextOverrideChange}
          />
        </section>
      </div>

      {/* Delete confirmation */}
      <ConfirmModal
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(undefined); }}
        title="Delete chat?"
        description={`"${deleteTarget?.title}" and all its messages will be permanently removed.`}
        confirmLabel="Delete"
        variant="critical"
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
