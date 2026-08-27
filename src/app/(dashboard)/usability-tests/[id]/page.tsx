'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useWuShowToast } from '@npm-questionpro/wick-ui-lib';
import dynamic from 'next/dynamic';
import { format } from 'date-fns';
import { UsabilityTestWorkspaceTabs } from '@/components/usability-tests/UsabilityTestWorkspaceTabs';
import { OverviewCard, OverviewDetailRow } from '@/components/ui/OverviewCards';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  MOCK_USABILITY_TESTS,
  TEST_STATUS_LABELS,
  TEST_SURFACE_LABELS,
  type TestStatus,
  type UsabilityTest,
} from '@/data/mock-usability-tests';

const WuButton = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuButton })),
  { ssr: false }
);

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

function TrackingStatusBadge({ test }: { test: UsabilityTest }) {
  const isReady =
    (test.tracking.surface === 'website' && test.tracking.snippetVerified) ||
    (test.tracking.surface === 'saas' && test.tracking.snippetVerified) ||
    (test.tracking.surface === 'figma' && !!test.tracking.connectedAccount);

  if (isReady) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700">
        <span className="wm-check-circle text-xs" /> Connected
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">
      <span className="wm-warning text-xs" /> Not verified
    </span>
  );
}

function getTrackingDetail(test: UsabilityTest): string {
  if (test.tracking.surface === 'website') return test.tracking.url;
  if (test.tracking.surface === 'saas') return `${test.tracking.appUrl} (${test.tracking.environment})`;
  if (test.tracking.surface === 'figma') return test.tracking.fileName;
  return '—';
}

export default function UsabilityTestOverviewPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { showToast } = useWuShowToast();
  const test = MOCK_USABILITY_TESTS.find((t) => t.id === id);

  if (!test) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <EmptyState
          icon="wm-error-outline"
          title="Usability test not found"
          description="This test does not exist or has been removed."
          action={<Link href="/usability-tests" className="text-sm font-medium text-blue-600 hover:underline">Back to Usability Tests</Link>}
        />
      </div>
    );
  }

  function showAction(msg: string) {
    showToast({ message: msg, variant: 'success' });
  }

  const progressPct = test.participantGoal > 0
    ? Math.round((test.sessionsCompleted / test.participantGoal) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Link href="/usability-tests" className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
        <span className="wm-arrow-back text-base" /> Back to Usability Tests
      </Link>

      <div className="mb-1 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-semibold text-gray-950">{test.title}</h1>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <StatusBadge status={test.status} />
          <WuButton variant="secondary" onClick={() => showAction('Booking link copied.')}>
            Share Booking Link
          </WuButton>
          <WuButton
            Icon={<span className="wm-play-arrow" />}
            onClick={() => router.push(`/usability-tests/${id}/sessions`)}
          >
            View Sessions
          </WuButton>
        </div>
      </div>

      <div className="mb-5 mt-4">
        <UsabilityTestWorkspaceTabs testId={id} activeTab="overview" />
      </div>

      <div className="mb-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <OverviewCard
          footer={
            <span className="text-xs text-gray-500">
              Created {format(new Date(test.createdAt), 'MMM d, yyyy')} by {test.createdBy.name}
            </span>
          }
        >
          <OverviewDetailRow label="Testing surface" value={TEST_SURFACE_LABELS[test.surface]} />
          <OverviewDetailRow label="Tracking target" value={getTrackingDetail(test)} />
          <OverviewDetailRow
            label="Tracking status"
            value={<TrackingStatusBadge test={test} />}
            action={
              !( (test.tracking.surface === 'website' && test.tracking.snippetVerified) ||
                 (test.tracking.surface === 'saas' && test.tracking.snippetVerified) ||
                 (test.tracking.surface === 'figma' && !!test.tracking.connectedAccount) ) && (
                <button
                  type="button"
                  className="text-sm font-medium text-blue-600 hover:underline"
                  onClick={() => router.push(`/usability-tests/create?step=links`)}
                >
                  Configure
                </button>
              )
            }
          />
          <OverviewDetailRow label="Task description" value={test.taskDescription ?? '—'} />
          <OverviewDetailRow label="Participant target" value={test.participantTarget ?? '—'} />
          {test.tags && test.tags.length > 0 && (
            <OverviewDetailRow
              label="Tags"
              value={
                <div className="flex flex-wrap gap-1">
                  {test.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">{tag}</span>
                  ))}
                </div>
              }
            />
          )}
        </OverviewCard>

        <OverviewCard
          footer={
            <button
              type="button"
              className="text-xs font-medium text-blue-600 hover:underline"
              onClick={() => showAction('Cancelling the study will halt all active sessions.')}
            >
              Cancel study
            </button>
          }
        >
          <div className="flex h-full flex-col gap-4 py-1">
            <p className="text-sm font-semibold uppercase tracking-wide text-gray-700">
              {test.status === 'completed' ? 'Completed' : 'In progress'}
            </p>

            <div className="flex items-center gap-4">
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex justify-between text-xs text-gray-500">
                  <span>Session progress</span>
                  <span>{progressPct}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-blue-600 transition-all"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>
              <span className="text-2xl font-bold text-gray-900">{test.sessionsCompleted}/{test.participantGoal}</span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Enrolled', value: String(test.participantsEnrolled) },
                { label: 'Active', value: String(test.activeSessions) },
                { label: 'Pending', value: String(test.pendingParticipantResponses) },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-lg bg-gray-50 p-3 text-center">
                  <p className="text-lg font-bold text-gray-900">{value}</p>
                  <p className="text-xs text-gray-500">{label}</p>
                </div>
              ))}
            </div>

            <WuButton
              Icon={<span className="wm-monitoring" />}
              variant="secondary"
              onClick={() => router.push(`/usability-tests/${id}/analyze`)}
            >
              View Behavior Analytics
            </WuButton>
          </div>
        </OverviewCard>
      </div>
    </div>
  );
}
