'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import type { IWuTabItem } from '@npm-questionpro/wick-ui-lib';
import { useWuShowToast } from '@npm-questionpro/wick-ui-lib';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { CreateStudyModeModal } from '@/components/idi-studies/CreateStudyModeModal';
import { DeleteStudyModal } from '@/components/idi-studies/DeleteStudyModal';
import { StudiesTable } from '@/components/idi-studies/StudiesTable';
import {
  StudyFilters,
  type StudyFilterState,
  type DateCreatedFilter,
} from '@/components/idi-studies/StudyFilters';
import { StudyStats, type StudyStat } from '@/components/idi-studies/StudyStats';
import {
  MOCK_IDI_STUDIES,
  STUDY_STATUS_LABELS,
  type IdiStudy,
  type StudyStatus,
} from '@/data/mock-idi-studies';

const WuButton = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuButton })),
  { ssr: false }
);
const WuTab = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuTab })),
  { ssr: false }
);

type TabValue = 'all' | StudyStatus;

const DEFAULT_FILTERS: StudyFilterState = {
  search: '',
  moderationMode: 'all',
  owner: 'all',
  dateCreated: 'all',
  status: 'all',
};

const TAB_ITEMS: { value: TabValue; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'draft', label: 'Drafts' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'archived', label: 'Archived' },
];

function isWithinDateFilter(createdAt: string, filter: DateCreatedFilter) {
  if (filter === 'all') return true;

  const createdDate = new Date(createdAt);
  const now = new Date();
  const diffInDays = Math.floor(
    (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (filter === 'last-7-days') return diffInDays <= 7;
  if (filter === 'last-30-days') return diffInDays <= 30;
  if (filter === 'older-than-90-days') return diffInDays > 90;

  const currentQuarter = Math.floor(now.getMonth() / 3);
  const createdQuarter = Math.floor(createdDate.getMonth() / 3);
  return (
    createdDate.getFullYear() === now.getFullYear() &&
    createdQuarter === currentQuarter
  );
}

function hasActiveFilters(filters: StudyFilterState) {
  return (
    filters.search.trim().length > 0 ||
    filters.moderationMode !== 'all' ||
    filters.owner !== 'all' ||
    filters.dateCreated !== 'all' ||
    filters.status !== 'all'
  );
}

function getStudySearchText(study: IdiStudy) {
  return [
    study.title,
    study.participantTarget ?? '',
    study.tags?.join(' ') ?? '',
    study.researchObjective ?? '',
  ]
    .join(' ')
    .toLowerCase();
}

export default function IdiStudiesPage() {
  const router = useRouter();
  const { showToast } = useWuShowToast();
  const [studies, setStudies] = useState<IdiStudy[]>(MOCK_IDI_STUDIES);
  const [filters, setFilters] = useState<StudyFilterState>(DEFAULT_FILTERS);
  const [activeTab, setActiveTab] = useState<TabValue>('all');
  const [isCreateModeOpen, setIsCreateModeOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<IdiStudy | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setIsLoading(false), 450);
    return () => window.clearTimeout(timeoutId);
  }, []);

  const ownerOptions = useMemo(() => {
    const owners = Array.from(new Set(studies.map((study) => study.createdBy.name))).sort();
    return owners.map((owner) => ({ value: owner, label: owner }));
  }, [studies]);

  const stats: StudyStat[] = useMemo(() => {
    const activeSessionCount = studies.reduce((sum, study) => sum + study.activeSessions, 0);
    const aiModeratedCount = studies.filter(
      (study) => study.moderationMode === 'AI Moderated'
    ).length;
    const pendingResponses = studies.reduce(
      (sum, study) => sum + study.pendingParticipantResponses,
      0
    );
    const draftCount = studies.filter((study) => study.status === 'draft').length;

    return [
      {
        label: 'Total Studies',
        value: studies.length,
        helper: `${draftCount} drafts in setup`,
        icon: 'wm-folder-data',
      },
      {
        label: 'Active Sessions',
        value: activeSessionCount,
        helper: 'Live or awaiting moderator review',
        icon: 'wm-videocam',
      },
      {
        label: 'AI Moderated Studies',
        value: aiModeratedCount,
        helper: 'Configured with structured guides',
        icon: 'wm-auto-awesome',
      },
      {
        label: 'Pending Participant Responses',
        value: pendingResponses,
        helper: 'Recruiting invitations and async sessions',
        icon: 'wm-mark-email-unread',
      },
    ];
  }, [studies]);

  function getFilteredStudies(tabValue: TabValue) {
    const query = filters.search.trim().toLowerCase();

    return studies
      .filter((study) => {
        const matchesTab = tabValue === 'all' || study.status === tabValue;
        const matchesStatus =
          filters.status === 'all' || study.status === filters.status;
        const matchesMode =
          filters.moderationMode === 'all' ||
          study.moderationMode === filters.moderationMode;
        const matchesOwner =
          filters.owner === 'all' || study.createdBy.name === filters.owner;
        const matchesDate = isWithinDateFilter(study.createdAt, filters.dateCreated);
        const matchesSearch =
          query.length === 0 || getStudySearchText(study).includes(query);

        return (
          matchesTab &&
          matchesStatus &&
          matchesMode &&
          matchesOwner &&
          matchesDate &&
          matchesSearch
        );
      })
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  function handleDuplicate(study: IdiStudy) {
    const now = new Date().toISOString();
    const duplicatedStudy: IdiStudy = {
      ...study,
      id: `idi-${Date.now()}`,
      title: `Copy of ${study.title}`,
      status: 'draft',
      participantsEnrolled: 0,
      sessionsCompleted: 0,
      sessionsTotal: 0,
      activeSessions: 0,
      pendingParticipantResponses: 0,
      createdAt: now,
      updatedAt: now,
    };

    setStudies((currentStudies) => [duplicatedStudy, ...currentStudies]);
    showToast({ message: `"${study.title}" duplicated as a draft`, variant: 'success' });
  }

  function handleArchive(study: IdiStudy) {
    setStudies((currentStudies) =>
      currentStudies.map((currentStudy) =>
        currentStudy.id === study.id
          ? {
              ...currentStudy,
              status: 'archived',
              activeSessions: 0,
              updatedAt: new Date().toISOString(),
            }
          : currentStudy
      )
    );
    showToast({ message: `"${study.title}" archived`, variant: 'success' });
  }

  function handleDelete() {
    if (!deleteTarget) return;

    setStudies((currentStudies) =>
      currentStudies.filter((study) => study.id !== deleteTarget.id)
    );
    showToast({ message: `"${deleteTarget.title}" deleted`, variant: 'success' });
    setDeleteTarget(null);
  }

  function handleSelectStudyMode(mode: 'moderated' | 'ai-moderated') {
    setIsCreateModeOpen(false);
    router.push(`/idi-studies/create?mode=${mode}`);
  }

  function renderNoDataContent(tabValue: TabValue) {
    if (studies.length === 0) {
      return (
        <EmptyState
          icon="wm-folder-open"
          title="No IDI studies yet"
          description="Create your first moderated qualitative research study to start recruiting participants and running sessions."
          action={
            <WuButton onClick={() => setIsCreateModeOpen(true)}>
              Create Your First Study
            </WuButton>
          }
        />
      );
    }

    if (hasActiveFilters(filters)) {
      return (
        <EmptyState
          icon="wm-search-off"
          title="No studies match your filters"
          description="Try a broader search term or remove one of the selected filters."
          action={<WuButton onClick={() => setFilters(DEFAULT_FILTERS)}>Reset Filters</WuButton>}
        />
      );
    }

    return (
      <EmptyState
        icon="wm-folder-open"
        title={`No ${tabValue === 'all' ? 'IDI' : STUDY_STATUS_LABELS[tabValue]} studies found`}
        description="Studies will appear here when they move into this workflow state."
      />
    );
  }

  const tabItems: IWuTabItem[] = TAB_ITEMS.map((tab) => {
    const count =
      tab.value === 'all'
        ? studies.length
        : studies.filter((study) => study.status === tab.value).length;

    return {
      value: tab.value,
      Trigger: `${tab.label} (${count})`,
      Content: <span className="sr-only">{tab.label} studies selected</span>,
    };
  });
  const visibleStudies = getFilteredStudies(activeTab);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <PageHeader
        title="IDI Studies"
        description="Create and manage moderated qualitative research studies."
        action={
          <WuButton onClick={() => setIsCreateModeOpen(true)}>
            <span className="wm-add" /> Create Study
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
        <StudyFilters
          filters={filters}
          ownerOptions={ownerOptions}
          onChange={setFilters}
        />
        <div className="mb-3 flex items-center justify-between text-xs text-gray-500">
          <span>
            Showing {isLoading ? '...' : visibleStudies.length} of {studies.length} studies
          </span>
          {hasActiveFilters(filters) && (
            <button
              type="button"
              className="font-medium text-blue-600 hover:underline"
              onClick={() => setFilters(DEFAULT_FILTERS)}
            >
              Clear filters
            </button>
          )}
        </div>
        <StudiesTable
          studies={visibleStudies}
          isLoading={isLoading}
          noDataContent={renderNoDataContent(activeTab)}
          onDuplicate={handleDuplicate}
          onArchive={handleArchive}
          onDelete={setDeleteTarget}
        />
      </div>

      <DeleteStudyModal
        study={deleteTarget}
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        onConfirm={handleDelete}
      />
      <CreateStudyModeModal
        open={isCreateModeOpen}
        onOpenChange={setIsCreateModeOpen}
        onSelectMode={handleSelectStudyMode}
      />
    </div>
  );
}
