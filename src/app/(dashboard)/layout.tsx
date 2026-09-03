'use client';

import { Suspense, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { SideNav } from '@/components/SideNav';
import { StudySecondNav } from '@/components/projects/StudySecondNav';
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
const WuFooter = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuFooter })),
  { ssr: false }
);

function studyRouteParts(pathname: string): { folderId: string; studyId: string } | null {
  const parts = pathname.split('/').filter(Boolean);
  if (parts[0] !== 'projects' || parts.length < 3) return null;
  if (parts[1] === 'recycle-bin') return null;
  return { folderId: parts[1], studyId: parts[2] };
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [threads, setThreads] = useState<ChatThread[]>(() => loadChatThreads() ?? MOCK_INSIGHTS_CHAT_THREADS);
  const [activeThreadId, setActiveThreadId] = useState<string | undefined>(undefined);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [productOpen, setProductOpen] = useState(true);
  const [workspaceOpen, setWorkspaceOpen] = useState(true);
  const [seenPathname, setSeenPathname] = useState(pathname);
  if (pathname !== seenPathname) {
    setSeenPathname(pathname);
    const stored = loadChatThreads();
    if (stored) setThreads(stored);
  }

  useEffect(() => {
    saveChatThreads(threads);
  }, [threads]);

  const inStudies = pathname.startsWith('/projects');
  const study = studyRouteParts(pathname);

  const workarea = study ? (
    <Suspense fallback={null}>
      <WuSidebar
        className="qp-l2-sidebar"
        Sidebar={<StudySecondNav folderId={study.folderId} studyId={study.studyId} />}
        open={workspaceOpen}
        onOpenChange={setWorkspaceOpen}
      >
        {children}
      </WuSidebar>
    </Suspense>
  ) : (
    children
  );

  return (
    <div className="flex min-h-screen flex-col">
      <WuToast />
      <div className="relative z-[300]">
        <WuAppHeader productName="User Experience" categories={[]} />
      </div>
      <div
        className={study ? 'qp-study-shell min-h-0 flex-1' : 'min-h-0 flex-1'}
        data-l1={productOpen ? 'expanded' : 'collapsed'}
        data-l2={workspaceOpen ? 'expanded' : 'collapsed'}
      >
        <WuSidebar Sidebar={<SideNav />} open={productOpen} onOpenChange={setProductOpen}>
          {workarea}
        </WuSidebar>
      </div>
      {inStudies && (
        <div className="relative z-[60]">
          <WuFooter>QuestionPro Research Edition #QuestionPro UX</WuFooter>
        </div>
      )}
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
