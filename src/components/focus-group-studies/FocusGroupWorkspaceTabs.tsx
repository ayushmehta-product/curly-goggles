'use client';

import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import type { IWuTabItem } from '@npm-questionpro/wick-ui-lib';

const WuTab = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuTab })),
  { ssr: false }
);

export type FocusGroupWorkspaceTab = 'overview' | 'session' | 'analyze';

interface FocusGroupWorkspaceTabsProps {
  focusGroupId: string;
  activeTab: FocusGroupWorkspaceTab;
}

const FOCUS_GROUP_WORKSPACE_TABS: Array<{ value: FocusGroupWorkspaceTab; label: string }> = [
  { value: 'overview', label: 'Overview' },
  { value: 'session', label: 'Session' },
  { value: 'analyze', label: 'Analyze' },
];

function getTabHref(focusGroupId: string, tab: FocusGroupWorkspaceTab) {
  if (tab === 'overview') return `/focus-group-studies/${focusGroupId}`;
  return `/focus-group-studies/${focusGroupId}/${tab}`;
}

export function FocusGroupWorkspaceTabs({ focusGroupId, activeTab }: FocusGroupWorkspaceTabsProps) {
  const router = useRouter();
  const items: IWuTabItem[] = FOCUS_GROUP_WORKSPACE_TABS.map((tab) => ({
    value: tab.value,
    Trigger: tab.label,
    Content: <span className="sr-only">{tab.label} selected</span>,
  }));

  return (
    <WuTab
      items={items}
      value={activeTab}
      onValueChange={(value) => router.push(getTabHref(focusGroupId, value as FocusGroupWorkspaceTab))}
    />
  );
}
