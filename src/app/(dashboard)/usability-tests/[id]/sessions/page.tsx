'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useWuShowToast } from '@npm-questionpro/wick-ui-lib';
import type { IWuTableColumnDef } from '@npm-questionpro/wick-ui-lib';
import { UsabilityTestWorkspaceTabs } from '@/components/usability-tests/UsabilityTestWorkspaceTabs';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  MOCK_USABILITY_TESTS,
  TEST_STATUS_LABELS,
  type TestStatus,
} from '@/data/mock-usability-tests';
import { formatDate } from '@/data/mock-utils';
import { routeId } from '@/data/route-id';

const WuTable = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuTable })),
  { ssr: false }
);
const WuChip = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuChip })),
  { ssr: false }
);
const WuButton = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuButton })),
  { ssr: false }
);
const WuSelect = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuSelect })),
  { ssr: false }
);

type SessionStatus = 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
type FilterOption = { value: string; label: string };

interface UtSession {
  id: string;
  anonymousId: string;
  scheduledAt: string;
  duration: string;
  status: SessionStatus;
  misclicks: number;
  rageClicks: number;
  taskCompleted: boolean;
  device: 'Desktop' | 'Mobile' | 'Tablet';
  variantId?: string;
}

const MOCK_SESSIONS: UtSession[] = [
  { id: 's-001', anonymousId: 'Edgar V.', scheduledAt: '2026-05-12T10:00:00Z', duration: '8m 12s', status: 'completed', misclicks: 2, rageClicks: 0, taskCompleted: true, device: 'Desktop', variantId: 'current' },
  { id: 's-002', anonymousId: 'Testing A.', scheduledAt: '2026-05-12T11:30:00Z', duration: '7m 58s', status: 'completed', misclicks: 0, rageClicks: 0, taskCompleted: false, device: 'Mobile', variantId: 'current' },
  { id: 's-003', anonymousId: 'Test 2', scheduledAt: '2026-05-13T09:00:00Z', duration: '6m 40s', status: 'completed', misclicks: 1, rageClicks: 0, taskCompleted: true, device: 'Desktop', variantId: 'new' },
  { id: 's-004', anonymousId: 'Anon:626', scheduledAt: '2026-05-13T10:00:00Z', duration: '8m 33s', status: 'completed', misclicks: 4, rageClicks: 1, taskCompleted: false, device: 'Desktop', variantId: 'current' },
  { id: 's-005', anonymousId: 'Anon:891', scheduledAt: '2026-05-13T14:00:00Z', duration: '7m 01s', status: 'completed', misclicks: 1, rageClicks: 0, taskCompleted: true, device: 'Tablet', variantId: 'new' },
  { id: 's-006', anonymousId: 'Anon:412', scheduledAt: '2026-05-14T09:30:00Z', duration: '5m 22s', status: 'completed', misclicks: 0, rageClicks: 0, taskCompleted: true, device: 'Mobile', variantId: 'current' },
  { id: 's-007', anonymousId: 'Anon:118', scheduledAt: '2026-05-14T11:00:00Z', duration: '—', status: 'scheduled', misclicks: 0, rageClicks: 0, taskCompleted: false, device: 'Desktop', variantId: 'new' },
  { id: 's-008', anonymousId: 'Anon:215', scheduledAt: '2026-05-14T13:00:00Z', duration: '—', status: 'in-progress', misclicks: 0, rageClicks: 0, taskCompleted: false, device: 'Mobile', variantId: 'current' },
  { id: 's-009', anonymousId: 'Anon:340', scheduledAt: '2026-05-14T15:00:00Z', duration: '7m 05s', status: 'completed', misclicks: 2, rageClicks: 1, taskCompleted: true, device: 'Desktop', variantId: 'new' },
  { id: 's-010', anonymousId: 'Anon:906', scheduledAt: '2026-05-15T09:00:00Z', duration: '6m 12s', status: 'completed', misclicks: 0, rageClicks: 0, taskCompleted: true, device: 'Desktop', variantId: 'new' },
];

const SESSION_STATUS_STYLES: Record<SessionStatus, string> = {
  scheduled: 'bg-gray-100 text-gray-700',
  'in-progress': 'bg-green-50 text-green-700',
  completed: 'bg-blue-50 text-blue-700',
  cancelled: 'bg-amber-50 text-amber-700',
};

const SESSION_STATUS_LABELS: Record<SessionStatus, string> = {
  scheduled: 'Scheduled',
  'in-progress': 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

function StatusBadge({ status }: { status: TestStatus }) {
  const styles: Record<TestStatus, string> = {
    draft: 'bg-gray-100 text-gray-700',
    recruiting: 'bg-purple-50 text-purple-700',
    active: 'bg-green-50 text-green-700',
    completed: 'bg-blue-50 text-blue-700',
    archived: 'bg-amber-50 text-amber-700',
  };
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${styles[status]}`}>
      {TEST_STATUS_LABELS[status]}
    </span>
  );
}

export default function UsabilityTestSessionsPage() {
  const id = routeId(useParams<{ id: string }>().id);
  const router = useRouter();
  const { showToast } = useWuShowToast();
  const test = MOCK_USABILITY_TESTS.find((t) => t.id === id);
  const [variantFilter, setVariantFilter] = useState('all');

  const variants = test?.variants ?? [];
  const hasVariants = variants.length > 0;
  const filterOptions: FilterOption[] = [
    { value: 'all', label: 'All designs' },
    ...variants.map((variant) => ({ value: variant.id, label: variant.name })),
  ];
  const selectedFilter = filterOptions.find((option) => option.value === variantFilter) ?? filterOptions[0];

  const sessions = useMemo(() => {
    const rows = hasVariants ? MOCK_SESSIONS : MOCK_SESSIONS.map((session) => ({ ...session, variantId: undefined }));
    if (!hasVariants || variantFilter === 'all') return rows;
    return rows.filter((session) => session.variantId === variantFilter);
  }, [hasVariants, variantFilter]);

  if (!test) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <EmptyState
          icon="wm-error-outline"
          title="Usability test not found"
          action={<Link href="/usability-tests" className="text-sm font-medium text-blue-600 hover:underline">Back to usability tests</Link>}
        />
      </div>
    );
  }

  function showAction(msg: string) {
    showToast({ message: msg, variant: 'success' });
  }

  function variantName(variantId?: string) {
    return variants.find((variant) => variant.id === variantId)?.name ?? '—';
  }

  const columns: IWuTableColumnDef<UtSession>[] = [
    {
      accessorKey: 'anonymousId',
      header: 'Participant',
      size: 140,
      cell: ({ row }) => (
        <span className="font-mono text-sm text-gray-700">{row.original.anonymousId}</span>
      ),
    },
    ...(hasVariants
      ? [{
          accessorKey: 'variantId' as const,
          header: 'Variant',
          size: 160,
          cell: ({ row }: { row: { original: UtSession } }) => (
            <WuChip variant="secondary" size="sm">{variantName(row.original.variantId)}</WuChip>
          ),
        }]
      : []),
    {
      accessorKey: 'scheduledAt',
      header: 'Scheduled',
      size: 160,
      cell: ({ row }) => (
        <span className="text-sm text-gray-600">{formatDate(row.original.scheduledAt)}</span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      size: 120,
      cell: ({ row }) => (
        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${SESSION_STATUS_STYLES[row.original.status]}`}>
          {SESSION_STATUS_LABELS[row.original.status]}
        </span>
      ),
    },
    {
      accessorKey: 'device',
      header: 'Device',
      size: 100,
      cell: ({ row }) => (
        <span className="text-sm text-gray-600">{row.original.device}</span>
      ),
    },
    {
      accessorKey: 'duration',
      header: 'Duration',
      size: 110,
      cell: ({ row }) => (
        <span className="font-mono text-sm text-gray-700">{row.original.duration}</span>
      ),
    },
    {
      accessorKey: 'misclicks',
      header: 'Misclicks',
      headerAlign: 'right',
      cellAlign: 'right',
      size: 100,
      cell: ({ row }) => (
        <span className={`text-sm font-medium ${row.original.misclicks > 2 ? 'text-red-600' : 'text-gray-700'}`}>
          {row.original.status === 'completed' ? row.original.misclicks : '—'}
        </span>
      ),
    },
    {
      accessorKey: 'rageClicks',
      header: 'Rage clicks',
      headerAlign: 'right',
      cellAlign: 'right',
      size: 110,
      cell: ({ row }) => (
        <span className={`text-sm font-medium ${row.original.rageClicks > 0 ? 'text-orange-600' : 'text-gray-700'}`}>
          {row.original.status === 'completed' ? row.original.rageClicks : '—'}
        </span>
      ),
    },
    {
      accessorKey: 'taskCompleted',
      header: 'Task',
      size: 100,
      cell: ({ row }) => {
        if (row.original.status !== 'completed') return <span className="text-sm text-gray-400">—</span>;
        return row.original.taskCompleted
          ? <span className="inline-flex rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">Completed</span>
          : <WuChip variant="secondary" size="sm">Dropped off</WuChip>;
      },
    },
    {
      accessorKey: 'id',
      header: 'Replay',
      cellAlign: 'right',
      size: 90,
      cell: ({ row }) => {
        if (row.original.status !== 'completed') return null;
        return (
          <button
            type="button"
            className="text-sm font-medium text-blue-600 hover:underline"
            onClick={() => showAction(`Opening session replay for ${row.original.anonymousId}…`)}
          >
            <span className="wm-play-circle text-base" />
          </button>
        );
      },
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Link href="/usability-tests" className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
        <span className="wm-arrow-back text-base" /> Back to usability tests
      </Link>

      <div className="mb-1 flex flex-wrap items-start justify-between gap-3">
        <h1 className="text-2xl font-semibold text-gray-950">{test.title}</h1>
        <div className="flex items-center gap-2">
          <StatusBadge status={test.status} />
          <WuButton variant="secondary" onClick={() => router.push(`/usability-tests/${test.id}/analyze`)}>
            View Analytics
          </WuButton>
        </div>
      </div>

      <div className="mb-5 mt-4">
        <UsabilityTestWorkspaceTabs testId={test.id} activeTab="sessions" />
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Total sessions', value: sessions.length },
          { label: 'Completed', value: sessions.filter((s) => s.status === 'completed').length },
          { label: 'Task success rate', value: `${Math.round((sessions.filter((s) => s.taskCompleted).length / Math.max(1, sessions.filter((s) => s.status === 'completed').length)) * 100)}%` },
          { label: 'Avg misclicks', value: (sessions.filter((s) => s.status === 'completed').reduce((sum, s) => sum + s.misclicks, 0) / Math.max(1, sessions.filter((s) => s.status === 'completed').length)).toFixed(1) },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium text-gray-500">{label}</p>
            <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
          </div>
        ))}
      </div>

      {hasVariants && (
        <div className="mb-4 w-56">
          <WuSelect
            data={filterOptions}
            accessorKey={{ value: 'value', label: 'label' }}
            value={selectedFilter}
            Label="Design"
            variant="outlined"
            onSelect={(value) => setVariantFilter((value as FilterOption).value)}
          />
        </div>
      )}

      <div className="overflow-x-auto">
        <div className="min-w-[900px]">
          <WuTable
            data={sessions as unknown[]}
            columns={columns as unknown as IWuTableColumnDef<unknown>[]}
            variant="striped"
            sort={{ enabled: true }}
            NoDataContent={
              <EmptyState
                icon="wm-assignment"
                title="No sessions recorded yet"
                description="Sessions will appear here once participants start testing."
              />
            }
          />
        </div>
      </div>
    </div>
  );
}
