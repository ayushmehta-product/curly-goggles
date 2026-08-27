'use client';

import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import type { IWuTabItem } from '@npm-questionpro/wick-ui-lib';

const WuTab = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuTab })),
  { ssr: false }
);

export type UtWorkspaceTab = 'overview' | 'sessions' | 'analyze';

interface UsabilityTestWorkspaceTabsProps {
  testId: string;
  activeTab: UtWorkspaceTab;
}

const TABS: Array<{ value: UtWorkspaceTab; label: string }> = [
  { value: 'overview', label: 'Overview' },
  { value: 'sessions', label: 'Sessions' },
  { value: 'analyze', label: 'Analyze' },
];

function tabHref(testId: string, tab: UtWorkspaceTab) {
  if (tab === 'overview') return `/usability-tests/${testId}`;
  return `/usability-tests/${testId}/${tab}`;
}

export function UsabilityTestWorkspaceTabs({ testId, activeTab }: UsabilityTestWorkspaceTabsProps) {
  const router = useRouter();
  const items: IWuTabItem[] = TABS.map((tab) => ({
    value: tab.value,
    Trigger: tab.label,
    Content: <span className="sr-only">{tab.label} selected</span>,
  }));

  return (
    <WuTab
      items={items}
      value={activeTab}
      onValueChange={(v) => router.push(tabHref(testId, v as UtWorkspaceTab))}
    />
  );
}
