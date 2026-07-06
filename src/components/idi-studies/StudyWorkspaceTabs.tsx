'use client';

import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import type { IWuTabItem } from '@npm-questionpro/wick-ui-lib';

const WuTab = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuTab })),
  { ssr: false }
);

export type StudyWorkspaceTab = 'overview' | 'sessions' | 'analyze';

interface StudyWorkspaceTabsProps {
  studyId: string;
  activeTab: StudyWorkspaceTab;
}

const STUDY_WORKSPACE_TABS: Array<{ value: StudyWorkspaceTab; label: string }> = [
  { value: 'overview', label: 'Overview' },
  { value: 'sessions', label: 'Sessions' },
  { value: 'analyze', label: 'Analyze' },
];

function getTabHref(studyId: string, tab: StudyWorkspaceTab) {
  if (tab === 'overview') return `/idi-studies/${studyId}`;
  return `/idi-studies/${studyId}/${tab}`;
}

export function StudyWorkspaceTabs({ studyId, activeTab }: StudyWorkspaceTabsProps) {
  const router = useRouter();
  const items: IWuTabItem[] = STUDY_WORKSPACE_TABS.map((tab) => ({
    value: tab.value,
    Trigger: tab.label,
    Content: <span className="sr-only">{tab.label} selected</span>,
  }));

  return (
    <WuTab
      items={items}
      value={activeTab}
      onValueChange={(value) => router.push(getTabHref(studyId, value as StudyWorkspaceTab))}
    />
  );
}
