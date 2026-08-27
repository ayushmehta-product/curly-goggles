import type { ChatThread } from './chat-types';

export const INSIGHTS_CHAT_STORAGE_KEY = 'ux-insights-chat-threads';

export function loadChatThreads(): ChatThread[] | null {
  if (typeof window === 'undefined') return null;

  const storedValue = window.localStorage.getItem(INSIGHTS_CHAT_STORAGE_KEY);
  if (!storedValue) return null;

  try {
    return JSON.parse(storedValue) as ChatThread[];
  } catch {
    return null;
  }
}

export function saveChatThreads(threads: ChatThread[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(INSIGHTS_CHAT_STORAGE_KEY, JSON.stringify(threads));
}
