'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { StudyWorkspaceTabs } from '@/components/idi-studies/StudyWorkspaceTabs';
import { EmptyState } from '@/components/ui/EmptyState';
import { annotationsForScope, tagsForScope, themesForScope, useAiInsights } from '@/components/insights-chat/ai-insights-store';
import { MOCK_IDI_STUDIES } from '@/data/mock-idi-studies';
import { MOCK_MODERATED_WORKSPACE_SESSIONS } from '@/data/mock-moderated-sessions';

const WuChip = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuChip })),
  { ssr: false }
);
const WuCard = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuCard })),
  { ssr: false }
);

function AiSourceBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2 py-0.5 text-[11px] font-medium text-purple-700">
      <span className="wm-auto-awesome text-[11px]" /> AI
    </span>
  );
}

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

  const aiInsights = useAiInsights();
  const aiAnnotations = sessions.flatMap((session) =>
    annotationsForScope(aiInsights, { kind: 'idi-session', studyId: id, sessionId: session.id }).map((annotation) => ({
      ...annotation,
      participantName: session.participantName,
    }))
  );
  const studyThemes = [
    ...themesForScope(aiInsights, { kind: 'idi-study', studyId: id }),
    ...sessions.flatMap((session) =>
      themesForScope(aiInsights, { kind: 'idi-session', studyId: id, sessionId: session.id })
    ),
  ];
  const studyTags = [
    ...tagsForScope(aiInsights, { kind: 'idi-study', studyId: id }),
    ...sessions.flatMap((session) =>
      tagsForScope(aiInsights, { kind: 'idi-session', studyId: id, sessionId: session.id })
    ),
  ];

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

      {(studyThemes.length > 0 || studyTags.length > 0) && (
        <section className="mb-5 rounded-xl border border-gray-200 bg-white p-5">
          <div className="mb-4 flex items-center gap-2">
            <h2 className="text-base font-semibold text-gray-900">Study Themes &amp; Tags</h2>
            <AiSourceBadge />
          </div>
          {studyThemes.length > 0 && (
            <div className="mb-4 grid gap-3 sm:grid-cols-2">
              {studyThemes.map((theme) => (
                <WuCard key={theme.id} rounded className="p-4 wu-shadow-sm">
                  <p className="text-sm font-semibold text-gray-900">{theme.label}</p>
                  {theme.excerpts.slice(0, 2).map((excerpt, index) => (
                    <p key={index} className="mt-2 text-xs leading-5 text-gray-600">
                      &ldquo;{excerpt.quote}&rdquo; <span className="text-gray-400">— {excerpt.speaker}</span>
                    </p>
                  ))}
                </WuCard>
              ))}
            </div>
          )}
          {studyTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {studyTags.map((tag) => (
                <WuChip key={tag.id} variant="secondary" size="sm" color={tag.status === 'validated' ? 'success' : undefined}>
                  {tag.label}
                </WuChip>
              ))}
            </div>
          )}
        </section>
      )}

      <section className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="mb-4">
          <h2 className="text-base font-semibold text-gray-900">Session Highlights</h2>
          <p className="mt-1 text-sm text-gray-500">Pinned quotes and observations collected across completed interviews.</p>
        </div>

        <div className="space-y-4">
          {highlights.map((highlight) => (
            <WuCard key={highlight.id} rounded className="p-4 wu-shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-gray-900">{highlight.title}</p>
                <span className="text-xs font-medium text-gray-400">{highlight.participantName} - {highlight.timestamp}</span>
              </div>
              <p className="mt-3 text-sm leading-6 text-gray-700">&ldquo;{highlight.quote}&rdquo;</p>
              <p className="mt-3 text-xs leading-5 text-gray-500">{highlight.observation}</p>
            </WuCard>
          ))}
          {aiAnnotations.map((annotation) => (
            <WuCard key={annotation.id} rounded className="p-4 wu-shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <AiSourceBadge />
                <span className="text-xs font-medium text-gray-400">
                  {annotation.participantName} - {annotation.excerpt.timestamp}
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-gray-700">&ldquo;{annotation.excerpt.quote}&rdquo;</p>
              <p className="mt-3 text-xs leading-5 text-gray-500">{annotation.note}</p>
            </WuCard>
          ))}
          {highlights.length === 0 && aiAnnotations.length === 0 && (
            <p className="text-sm text-gray-500">No highlights have been captured for this study yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}
