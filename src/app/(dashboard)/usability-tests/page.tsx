'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import type { IWuTabItem } from '@npm-questionpro/wick-ui-lib';
import { useWuShowToast } from '@npm-questionpro/wick-ui-lib';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { StudyStats, type StudyStat } from '@/components/idi-studies/StudyStats';
import { UsabilityTestsTable } from '@/components/usability-tests/UsabilityTestsTable';
import { DeleteUsabilityTestModal } from '@/components/usability-tests/DeleteUsabilityTestModal';
import {
  MOCK_USABILITY_TESTS,
  TEST_STATUS_LABELS,
  type UsabilityTest,
  type TestStatus,
} from '@/data/mock-usability-tests';
import { formatRelativeDate } from '@/data/mock-utils';

const WuButton = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuButton })),
  { ssr: false }
);
const WuTab = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuTab })),
  { ssr: false }
);
const WuInput = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuInput })),
  { ssr: false }
);

type TabValue = 'all' | TestStatus;

const TAB_ITEMS: { value: TabValue; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'draft', label: 'Drafts' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'archived', label: 'Archived' },
];

export default function UsabilityTestsPage() {
  const router = useRouter();
  const { showToast } = useWuShowToast();
  const [tests, setTests] = useState<UsabilityTest[]>(MOCK_USABILITY_TESTS);
  const [activeTab, setActiveTab] = useState<TabValue>('all');
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<UsabilityTest | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const id = window.setTimeout(() => setIsLoading(false), 400);
    return () => window.clearTimeout(id);
  }, []);

  const stats: StudyStat[] = useMemo(() => {
    const activeSessions = tests.reduce((sum, t) => sum + t.activeSessions, 0);
    const snippetVerifiedCount = tests.filter((t) => {
      if (t.tracking.surface === 'website') return t.tracking.snippetVerified;
      if (t.tracking.surface === 'saas') return t.tracking.snippetVerified;
      if (t.tracking.surface === 'figma') return !!t.tracking.connectedAccount;
      return false;
    }).length;
    const pendingResponses = tests.reduce((sum, t) => sum + t.pendingParticipantResponses, 0);
    const draftCount = tests.filter((t) => t.status === 'draft').length;

    return [
      {
        label: 'Total Tests',
        value: tests.length,
        helper: `${draftCount} drafts in setup`,
        icon: 'wm-touch-app',
      },
      {
        label: 'Active Sessions',
        value: activeSessions,
        helper: 'Live or awaiting review',
        icon: 'wm-videocam',
      },
      {
        label: 'Tracking Connected',
        value: snippetVerifiedCount,
        helper: 'Snippet verified or Figma linked',
        icon: 'wm-monitoring',
      },
      {
        label: 'Pending Responses',
        value: pendingResponses,
        helper: 'Recruiting invitations pending',
        icon: 'wm-mark-email-unread',
      },
    ];
  }, [tests]);

  function getVisibleTests() {
    const q = search.trim().toLowerCase();
    return tests
      .filter((t) => {
        const matchesTab = activeTab === 'all' || t.status === activeTab;
        const matchesSearch =
          q.length === 0 ||
          t.title.toLowerCase().includes(q) ||
          (t.participantTarget ?? '').toLowerCase().includes(q) ||
          (t.tags ?? []).join(' ').toLowerCase().includes(q);
        return matchesTab && matchesSearch;
      })
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  function handleDuplicate(test: UsabilityTest) {
    const now = new Date().toISOString();
    const copy: UsabilityTest = {
      ...test,
      id: `ut-${Date.now()}`,
      title: `Copy of ${test.title}`,
      status: 'draft',
      participantsEnrolled: 0,
      sessionsCompleted: 0,
      sessionsTotal: 0,
      activeSessions: 0,
      pendingParticipantResponses: 0,
      createdAt: now,
      updatedAt: now,
    };
    setTests((prev) => [copy, ...prev]);
    showToast({ message: `"${test.title}" duplicated as a draft`, variant: 'success' });
  }

  function handleArchive(test: UsabilityTest) {
    setTests((prev) =>
      prev.map((t) =>
        t.id === test.id
          ? { ...t, status: 'archived' as TestStatus, activeSessions: 0, updatedAt: new Date().toISOString() }
          : t
      )
    );
    showToast({ message: `"${test.title}" archived`, variant: 'success' });
  }

  function handleDelete() {
    if (!deleteTarget) return;
    setTests((prev) => prev.filter((t) => t.id !== deleteTarget.id));
    showToast({ message: `"${deleteTarget.title}" deleted`, variant: 'success' });
    setDeleteTarget(null);
  }

  const visibleTests = getVisibleTests();

  const tabItems: IWuTabItem[] = TAB_ITEMS.map((tab) => {
    const count =
      tab.value === 'all'
        ? tests.length
        : tests.filter((t) => t.status === tab.value).length;
    return {
      value: tab.value,
      Trigger: `${tab.label} (${count})`,
      Content: <span className="sr-only">{tab.label} selected</span>,
    };
  });

  function renderNoData() {
    if (tests.length === 0) {
      return (
        <EmptyState
          icon="wm-touch-app"
          title="No usability tests yet"
          description="Create your first usability test to start tracking participant behaviour on your website, SaaS product, or Figma prototype."
          action={
            <WuButton onClick={() => router.push('/usability-tests/create')}>
              Create Your First Test
            </WuButton>
          }
        />
      );
    }
    if (search.trim()) {
      return (
        <EmptyState
          icon="wm-search-off"
          title="No tests match your search"
          description="Try a broader search term."
          action={<WuButton onClick={() => setSearch('')}>Clear Search</WuButton>}
        />
      );
    }
    return (
      <EmptyState
        icon="wm-touch-app"
        title={`No ${activeTab === 'all' ? '' : TEST_STATUS_LABELS[activeTab] + ' '}tests found`}
        description="Tests will appear here when they move into this workflow state."
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <PageHeader
        title="Usability Tests"
        description="Create and manage behavioural tests on websites, SaaS products, and Figma prototypes."
        action={
          <WuButton onClick={() => router.push('/usability-tests/create')}>
            <span className="wm-add" /> Create Test
          </WuButton>
        }
      />

      <StudyStats stats={stats} />

      <WuTab
        items={tabItems}
        defaultValue="all"
        onValueChange={(v) => setActiveTab(v as TabValue)}
      />

      <div className="pt-4">
        <div className="mb-3 flex items-center gap-3">
          <div className="w-72">
            <WuInput
              variant="outlined"
              placeholder="Search tests…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <span className="ml-auto text-xs text-gray-500">
            Showing {isLoading ? '…' : visibleTests.length} of {tests.length} tests
            {search.trim() && (
              <> &middot; <button type="button" className="font-medium text-blue-600 hover:underline" onClick={() => setSearch('')}>Clear</button></>
            )}
          </span>
        </div>
        <UsabilityTestsTable
          tests={visibleTests}
          isLoading={isLoading}
          noDataContent={renderNoData()}
          onDuplicate={handleDuplicate}
          onArchive={handleArchive}
          onDelete={setDeleteTarget}
        />
      </div>

      <DeleteUsabilityTestModal
        test={deleteTarget}
        open={deleteTarget !== null}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        onConfirm={handleDelete}
      />
    </div>
  );
}
