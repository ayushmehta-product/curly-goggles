'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { StudyWorkspaceTabs } from '@/components/idi-studies/StudyWorkspaceTabs';
import { EmptyState } from '@/components/ui/EmptyState';
import { MOCK_IDI_STUDIES } from '@/data/mock-idi-studies';
import { MOCK_MODERATED_WORKSPACE_SESSIONS } from '@/data/mock-moderated-sessions';

export default function StudyAnalyzePage() {
  const { id } = useParams<{ id: string }>();
  const study = MOCK_IDI_STUDIES.find((item) => item.id === id);
  const sessions = MOCK_MODERATED_WORKSPACE_SESSIONS.filter((session) => session.studyId === id);
  const highlights = sessions.flatMap((session) =>
    session.highlights.map((highlight) => ({
      ...highlight,
      participantName: session.participantName,
    }))
  );

  if (!study) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <EmptyState
          icon="wm-error-outline"
          title="Analyze workspace not found"
          action={<Link href="/idi-studies" className="text-sm font-medium text-blue-600 hover:underline">Back to IDI Studies</Link>}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Link href="/idi-studies" className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
        <span className="wm-arrow-back text-base" /> Back to IDI Studies
      </Link>

      <div className="mb-5">
        <h1 className="text-2xl font-semibold text-gray-950">{study.title}</h1>
      </div>

      <div className="mb-5">
        <StudyWorkspaceTabs studyId={study.id} activeTab="analyze" />
      </div>

      <section className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="mb-4">
          <h2 className="text-base font-semibold text-gray-900">Session Highlights</h2>
          <p className="mt-1 text-sm text-gray-500">Pinned quotes and observations collected across completed interviews.</p>
        </div>

        <div className="space-y-4">
          {highlights.map((highlight) => (
            <div key={highlight.id} className="rounded-lg border border-gray-100 bg-gray-50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-gray-900">{highlight.title}</p>
                <span className="text-xs font-medium text-gray-400">{highlight.participantName} - {highlight.timestamp}</span>
              </div>
              <p className="mt-3 text-sm leading-6 text-gray-700">&ldquo;{highlight.quote}&rdquo;</p>
              <p className="mt-3 text-xs leading-5 text-gray-500">{highlight.observation}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
