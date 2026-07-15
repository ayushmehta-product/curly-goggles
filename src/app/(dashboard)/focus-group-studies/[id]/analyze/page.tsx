'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { FocusGroupWorkspaceTabs } from '@/components/focus-group-studies/FocusGroupWorkspaceTabs';
import { MOCK_FOCUS_GROUPS } from '@/data/mock-focus-groups';
import { MOCK_FOCUS_GROUP_SESSION_ANALYSIS } from '@/data/mock-focus-group-session-analysis';

export default function FocusGroupAnalyzePage() {
  const { id } = useParams<{ id: string }>();

  const focusGroup = MOCK_FOCUS_GROUPS.find((item) => item.id === id);
  const analysis =
    MOCK_FOCUS_GROUP_SESSION_ANALYSIS.find((item) => item.focusGroupId === id) ?? MOCK_FOCUS_GROUP_SESSION_ANALYSIS[0];

  if (!focusGroup) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <EmptyState
          icon="wm-error-outline"
          title="Focus group not found"
          description="This focus group does not exist or has been removed from the prototype workspace."
          action={
            <Link href="/focus-group-studies" className="text-sm font-medium text-blue-600 hover:underline">
              Back to Focus Groups
            </Link>
          }
        />
      </div>
    );
  }

  const hasAnalysis = analysis.recordingStatus === 'ready';

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Link
        href="/focus-group-studies"
        className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
      >
        <span className="wm-arrow-back text-base" /> Back to Focus Groups
      </Link>

      <PageHeader title={focusGroup.title} description="Highlights and key takeaways surfaced from this session." />

      <div className="mb-5">
        <FocusGroupWorkspaceTabs focusGroupId={focusGroup.id} activeTab="analyze" />
      </div>

      {!hasAnalysis ? (
        <EmptyState
          icon="wm-insights"
          title="No analysis yet"
          description="Highlights will appear here once this session has run and been processed."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
          <section className="rounded-lg border border-gray-200 bg-white p-5">
            <h2 className="text-base font-semibold text-gray-900">Highlights</h2>
            <p className="mt-1 text-sm text-gray-500">
              Timestamped moments moderators and observers flagged as noteworthy during this session.
            </p>
            <div className="mt-4 space-y-3">
              {analysis.annotations.map((annotation) => (
                <article key={annotation.id} className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-blue-700">{annotation.timestampLabel}</span>
                    <span className="text-xs text-gray-500">{annotation.author}</span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-gray-700">{annotation.note}</p>
                </article>
              ))}
            </div>
          </section>

          <aside className="space-y-4">
            <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900">Key takeaways</h3>
              <div className="mt-2 space-y-2">
                {analysis.keyTakeaways.map((takeaway) => (
                  <div key={takeaway} className="flex gap-2 text-sm leading-6 text-gray-700">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                    <span>{takeaway}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900">Themes</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {analysis.themes.map((theme) => (
                  <span
                    key={theme.id}
                    className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-700"
                  >
                    {theme.label}
                  </span>
                ))}
              </div>
            </section>
          </aside>
        </div>
      )}
    </div>
  );
}
