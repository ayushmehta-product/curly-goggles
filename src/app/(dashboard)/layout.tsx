'use client';

import { Suspense, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { SideNav } from '@/components/SideNav';
import { InsightsChatWidget } from '@/components/insights-chat/InsightsChatWidget';
import { loadChatThreads, saveChatThreads } from '@/components/insights-chat/chat-storage';
import { MOCK_INSIGHTS_CHAT_THREADS } from '@/data/mock-insights-chats';
import type { ChatThread } from '@/components/insights-chat/chat-types';

const WuAppHeader = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuAppHeader })),
  { ssr: false }
);
const WuSidebar = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuSidebar })),
  { ssr: false }
);
const WuToast = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuToast })),
  { ssr: false }
);

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [threads, setThreads] = useState<ChatThread[]>(() => loadChatThreads() ?? MOCK_INSIGHTS_CHAT_THREADS);
  const [activeThreadId, setActiveThreadId] = useState<string | undefined>(undefined);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [seenPathname, setSeenPathname] = useState(pathname);
  if (pathname !== seenPathname) {
    setSeenPathname(pathname);
    const stored = loadChatThreads();
    if (stored) setThreads(stored);
  }

  useEffect(() => {
    saveChatThreads(threads);
  }, [threads]);

  return (
    <div className="flex min-h-screen flex-col">
      <WuToast />
      <WuAppHeader productName="User_Experience" categories={[]} />
      <WuSidebar Sidebar={<SideNav />}>
        <main className="flex-1">{children}</main>
      </WuSidebar>
      <Suspense fallback={null}>
        <InsightsChatWidget
          threads={threads}
          onThreadsChange={setThreads}
          activeThreadId={activeThreadId}
          onActiveThreadChange={setActiveThreadId}
          isOpen={isChatOpen}
          onOpenChange={setIsChatOpen}
        />
      </Suspense>
    </div>
  );
}
