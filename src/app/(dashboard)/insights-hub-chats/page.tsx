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
const WuCard = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuCard })),
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
    <div className="flex h-[calc(100dvh-48px)] min-h-0 flex-col overflow-hidden bg-surface-sunken px-6 py-6">
      <div className="shrink-0">
        <PageHeader
          title={<AiLabel>InsightsHub chats</AiLabel>}
          description="Review past conversations or start a new chat with InsightsHub."
        />
      </div>

      <div className="grid min-h-0 flex-1 overflow-hidden rounded-xl border border-line bg-surface wu-shadow-md lg:grid-cols-[280px_minmax(0,1fr)]">
        {/* Left rail */}
        <aside className="flex min-h-0 flex-col border-b border-line bg-surface lg:border-b-0 lg:border-r">
          {/* New Chat button */}
          <div className="shrink-0 px-3 pt-4 pb-2">
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
          </div>

          {/* Search input */}
          <div className="relative shrink-0 px-3 pb-3">
            <span className="wm-search pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-sm text-ink-muted" aria-hidden="true" />
            <WuInput
              variant="outlined"
              placeholder="Search chats..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-7"
            />
          </div>

          {/* Thread count */}
          <div className="shrink-0 border-b border-line px-4 pb-2">
            <WuSubtext size="sm">
              {filteredThreads.length === sortedThreads.length
                ? `${threads.length} conversation${threads.length === 1 ? '' : 's'}`
                : `${filteredThreads.length} of ${threads.length} conversations`}
            </WuSubtext>
          </div>

          {/* Thread list */}
          <div className="min-h-0 flex-1">
            <WuScrollArea className="h-full px-2 py-3">
              {filteredThreads.length === 0 ? (
                <p className="px-2 py-6 text-center text-sm text-ink-muted">
                  {search.trim() ? 'No chats match your search' : 'No chats yet'}
                </p>
              ) : (
                <div className="space-y-1">
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
                          className="block w-full text-left"
                        >
                          <WuCard
                            rounded
                            className={`p-3 pr-8 transition ${
                              selected
                                ? 'border border-accent bg-surface-brand wu-shadow-sm'
                                : 'border border-transparent bg-surface wu-shadow-sm hover:bg-surface-sunken hover:wu-shadow-md'
                            }`}
                          >
                            <div className="flex items-start gap-2.5">
                              {/* Bot avatar */}
                              <div
                                className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                                  selected ? 'bg-accent' : 'bg-accent/10'
                                }`}
                              >
                                <span
                                  className={`wm-smart-toy text-base ${selected ? 'text-white' : 'text-accent'}`}
                                  aria-hidden="true"
                                />
                              </div>

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
                                  <WuText size="sm" as="div" className="truncate font-medium text-ink leading-snug">
                                    {thread.title}
                                  </WuText>
                                )}

                                <div className="mt-0.5 flex items-center gap-1.5 text-xs text-ink-muted">
                                  <span className="wm-chat text-xs" aria-hidden="true" />
                                  <span>{turnCount} turn{turnCount === 1 ? '' : 's'}</span>
                                  <span aria-hidden="true">·</span>
                                  <span className="truncate">{formatRelativeDate(thread.updatedAt)}</span>
                                </div>

                                {!isRenaming && (
                                  <WuSubtext size="sm" as="div" className="mt-0.5 truncate">
                                    {thread.scopeLabel}
                                  </WuSubtext>
                                )}
                              </div>
                            </div>
                          </WuCard>
                        </button>

                        {/* ⋮ Context menu — outside the button to avoid event conflicts */}
                        <div
                          className="absolute right-1.5 top-1.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <WuMenu
                            Trigger={
                              <button
                                type="button"
                                aria-label={`Actions for ${thread.title}`}
                                className="flex h-6 w-6 items-center justify-center rounded hover:bg-surface-sunken"
                              >
                                <span className="wm-more-vert text-sm text-ink-muted" aria-hidden="true" />
                              </button>
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

        {/* Chat pane */}
        <section className="flex min-h-0 flex-col bg-surface-sunken">
          {activeThread && (
            <div className="shrink-0 border-b border-line bg-surface px-6 py-4">
              <p className="text-sm font-semibold text-ink">{activeThread.title}</p>
              <p className="mt-1 truncate text-xs text-ink-muted">{activeThread.scopeLabel}</p>
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
