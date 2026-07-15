'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import type { IWuTabItem } from '@npm-questionpro/wick-ui-lib';
import { useWuShowToast } from '@npm-questionpro/wick-ui-lib';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { DeleteFocusGroupModal } from '@/components/focus-group-studies/DeleteFocusGroupModal';
import { FocusGroupsTable } from '@/components/focus-group-studies/FocusGroupsTable';
import { StudyStats, type StudyStat } from '@/components/idi-studies/StudyStats';
import {
  FOCUS_GROUP_STATUS_LABELS,
  MOCK_FOCUS_GROUPS,
  type FocusGroup,
  type FocusGroupStatus,
} from '@/data/mock-focus-groups';

const WuButton = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuButton })),
  { ssr: false }
);
const WuInput = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuInput })),
  { ssr: false }
);
const WuTab = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuTab })),
  { ssr: false }
);

type TabValue = 'all' | FocusGroupStatus;

const TAB_ITEMS: { value: TabValue; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'draft', label: 'Drafts' },
  { value: 'scheduling', label: 'Scheduling' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'completed', label: 'Completed' },
  { value: 'archived', label: 'Archived' },
];

function getFocusGroupSearchText(focusGroup: FocusGroup) {
  return [focusGroup.title, focusGroup.tags?.join(' ') ?? ''].join(' ').toLowerCase();
}

export default function FocusGroupStudiesPage() {
  const router = useRouter();
  const { showToast } = useWuShowToast();
  const [focusGroups, setFocusGroups] = useState<FocusGroup[]>(MOCK_FOCUS_GROUPS);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<TabValue>('all');
  const [deleteTarget, setDeleteTarget] = useState<FocusGroup | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setIsLoading(false), 450);
    return () => window.clearTimeout(timeoutId);
  }, []);

  const stats: StudyStat[] = useMemo(() => {
    const schedulingCount = focusGroups.filter((focusGroup) => focusGroup.status === 'scheduling').length;
    const confirmedSessions = focusGroups.filter((focusGroup) => focusGroup.status === 'confirmed').length;
    const completedCount = focusGroups.filter((focusGroup) => focusGroup.status === 'completed').length;
    const draftCount = focusGroups.filter((focusGroup) => focusGroup.status === 'draft').length;

    return [
      {
        label: 'Total Focus Groups',
        value: focusGroups.length,
        helper: `${draftCount} drafts in setup`,
        icon: 'wm-groups',
      },
      {
        label: 'Awaiting Acknowledgment',
        value: schedulingCount,
        helper: 'Waiting on participant acknowledgments',
        icon: 'wm-mark-email-unread',
      },
      {
        label: 'Confirmed Sessions',
        value: confirmedSessions,
        helper: 'Enough participants have acknowledged',
        icon: 'wm-event-available',
      },
      {
        label: 'Completed Sessions',
        value: completedCount,
        helper: 'Session has already run',
        icon: 'wm-task-alt',
      },
    ];
  }, [focusGroups]);

  function getFilteredFocusGroups(tabValue: TabValue) {
    const query = search.trim().toLowerCase();
    return focusGroups
      .filter((focusGroup) => {
        const matchesTab = tabValue === 'all' || focusGroup.status === tabValue;
        const matchesSearch = query.length === 0 || getFocusGroupSearchText(focusGroup).includes(query);
        return matchesTab && matchesSearch;
      })
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  function handleDuplicate(focusGroup: FocusGroup) {
    const now = new Date().toISOString();
    const duplicated: FocusGroup = {
      ...focusGroup,
      id: `fg-${Date.now()}`,
      title: `Copy of ${focusGroup.title}`,
      status: 'draft',
      sessionAt: null,
      participantsConfirmed: 0,
      participantsTotal: 0,
      createdAt: now,
      updatedAt: now,
    };
    setFocusGroups((current) => [duplicated, ...current]);
    showToast({ message: `"${focusGroup.title}" duplicated as a draft`, variant: 'success' });
  }

  function handleArchive(focusGroup: FocusGroup) {
    setFocusGroups((current) =>
      current.map((item) =>
        item.id === focusGroup.id ? { ...item, status: 'archived', updatedAt: new Date().toISOString() } : item
      )
    );
    showToast({ message: `"${focusGroup.title}" archived`, variant: 'success' });
  }

  function handleDelete() {
    if (!deleteTarget) return;
    setFocusGroups((current) => current.filter((item) => item.id !== deleteTarget.id));
    showToast({ message: `"${deleteTarget.title}" deleted`, variant: 'success' });
    setDeleteTarget(null);
  }

  function renderNoDataContent(tabValue: TabValue) {
    if (focusGroups.length === 0) {
      return (
        <EmptyState
          icon="wm-groups"
          title="No focus groups yet"
          description="Create your first focus group to start scheduling a shared session with your participants."
          action={
            <WuButton onClick={() => router.push('/focus-group-studies/create')}>
              Create Your First Focus Group
            </WuButton>
          }
        />
      );
    }

    if (search.trim().length > 0) {
      return (
        <EmptyState
          icon="wm-search-off"
          title="No focus groups match your search"
          description="Try a broader search term."
          action={<WuButton onClick={() => setSearch('')}>Clear Search</WuButton>}
        />
      );
    }

    return (
      <EmptyState
        icon="wm-folder-open"
        title={`No ${tabValue === 'all' ? '' : FOCUS_GROUP_STATUS_LABELS[tabValue]} focus groups found`}
        description="Focus groups will appear here when they move into this workflow state."
      />
    );
  }

  const tabItems: IWuTabItem[] = TAB_ITEMS.map((tab) => {
    const count =
      tab.value === 'all' ? focusGroups.length : focusGroups.filter((item) => item.status === tab.value).length;
    return {
      value: tab.value,
      Trigger: `${tab.label} (${count})`,
      Content: <span className="sr-only">{tab.label} focus groups selected</span>,
    };
  });
  const visibleFocusGroups = getFilteredFocusGroups(activeTab);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <PageHeader
        title="Focus Groups"
        description="Create and manage shared-session focus group studies."
        action={
          <WuButton onClick={() => router.push('/focus-group-studies/create')}>
            <span className="wm-add" /> Create Focus Group
          </WuButton>
        }
      />

      <StudyStats stats={stats} />
      <WuTab
        items={tabItems}
        defaultValue="all"
        onValueChange={(value) => setActiveTab(value as TabValue)}
      />

      <div className="pt-4">
        <div className="mb-3 max-w-sm">
          <WuInput
            Icon={<span className="wm-search" />}
            iconPosition="left"
            variant="outlined"
            placeholder="Search focus groups"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <div className="mb-3 flex items-center justify-between text-xs text-gray-500">
          <span>
            Showing {isLoading ? '...' : visibleFocusGroups.length} of {focusGroups.length} focus groups
          </span>
        </div>
        <FocusGroupsTable
          focusGroups={visibleFocusGroups}
          isLoading={isLoading}
          noDataContent={renderNoDataContent(activeTab)}
          onDuplicate={handleDuplicate}
          onArchive={handleArchive}
          onDelete={setDeleteTarget}
        />
      </div>

      <DeleteFocusGroupModal
        focusGroup={deleteTarget}
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        onConfirm={handleDelete}
      />
    </div>
  );
}
