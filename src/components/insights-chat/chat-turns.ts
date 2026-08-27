import { truncate } from '@/data/mock-utils';
import { generateChatResponse } from './chat-engine';
import { scopeLabel } from './chat-scope';
import type { ChatMessage, ChatScope, ChatThread, ContextOverride } from './chat-types';

let messageSeq = 0;
let threadSeq = 0;

export function appendChatTurn(
  promptLabel: string,
  scope: ChatScope,
  threads: ChatThread[],
  activeThreadId: string | undefined,
  contextOverride?: ContextOverride
): { threads: ChatThread[]; activeThreadId: string } {
  const response = generateChatResponse(promptLabel, scope);
  const nowIso = new Date().toISOString();

  messageSeq += 1;
  const userMessage: ChatMessage = { id: `msg-${messageSeq}-u`, role: 'user', promptLabel };
  messageSeq += 1;
  const assistantMessage: ChatMessage = { id: `msg-${messageSeq}-a`, role: 'assistant', response };

  const activeThread = threads.find((thread) => thread.id === activeThreadId);
  if (activeThread) {
    return {
      threads: threads.map((thread) =>
        thread.id === activeThread.id
          ? {
              ...thread,
              messages: [...thread.messages, userMessage, assistantMessage],
              updatedAt: nowIso,
              contextOverride: contextOverride ?? thread.contextOverride,
            }
          : thread
      ),
      activeThreadId: activeThread.id,
    };
  }

  threadSeq += 1;
  const newThread: ChatThread = {
    id: `thread-live-${threadSeq}`,
    title: truncate(promptLabel, 48),
    scopeLabel: scopeLabel(scope),
    createdAt: nowIso,
    updatedAt: nowIso,
    messages: [userMessage, assistantMessage],
    contextOverride,
  };

  return { threads: [newThread, ...threads], activeThreadId: newThread.id };
}
