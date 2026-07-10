'use client';

import type { ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { format, parseISO } from 'date-fns';
import { INITIAL_MODERATOR_IDS, INITIAL_OBSERVER_IDS } from '@/data/mock-study-team';
import { INITIAL_SCREENER_ITEMS } from '@/data/mock-focus-group-audience';
import { INITIAL_DISCUSSION_TOPICS } from '@/data/mock-focus-group-script';
import { INITIAL_POST_SESSION_QUESTIONS } from '@/data/mock-focus-group-post-session';
import { formatSlotLabel } from '@/data/focus-group-scheduling-utils';
import type { SchedulingSnapshot } from '@/components/focus-group-studies/create/SchedulingStep';
import type { BasicsFormState } from '@/components/focus-group-studies/create/BasicsStep';

const WuButton = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuButton })),
  { ssr: false }
);

interface ReviewStepProps {
  basics: BasicsFormState;
  scheduling: SchedulingSnapshot;
  onBack: () => void;
  onSaveDraft: () => void;
  onPublish: () => void;
}

type ReadinessState = 'success' | 'warning';

function SectionShell({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-5">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-gray-900">{title}</h2>
        {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
      </div>
      {children}
    </section>
  );
}

function ReadinessIcon({ state }: { state: ReadinessState }) {
  const styles =
    state === 'success'
      ? 'bg-green-50 text-green-700 ring-green-100'
      : 'bg-amber-50 text-amber-700 ring-amber-100';

  return (
    <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ring-4 ${styles}`}>
      <span className={state === 'success' ? 'wm-check text-sm' : 'wm-warning text-sm'} />
    </span>
  );
}

function formatDateLabel(date: string) {
  try {
    return format(parseISO(date), 'EEEE, MMM d');
  } catch {
    return date;
  }
}

export function ReviewStep({ basics, scheduling, onBack, onSaveDraft, onPublish }: ReviewStepProps) {
  const topicCount = INITIAL_DISCUSSION_TOPICS.length;
  const questionCount = INITIAL_DISCUSSION_TOPICS.reduce((total, topic) => total + topic.questions.length, 0);

  const readinessItems: Array<{ label: string; description: string; state: ReadinessState }> = [
    {
      label: 'Moderator assigned',
      description: `${INITIAL_MODERATOR_IDS.slice(0, 1).length} moderator is available to run the session.`,
      state: 'success',
    },
    {
      label: 'Scheduling mode configured',
      description:
        scheduling.mode === 'fixed'
          ? `Fixed time proposed for ${formatDateLabel(scheduling.fixedSlot.date)}.`
          : `Poll configured with ${scheduling.pollSlots.length} candidate slots.`,
      state: 'success',
    },
    {
      label: 'Discussion guide completed',
      description: `${topicCount} topics with ${questionCount} guiding questions are ready for moderation.`,
      state: 'success',
    },
    {
      label: 'Screener questions added',
      description: `${INITIAL_SCREENER_ITEMS.length} screener questions will qualify participants before scheduling.`,
      state: INITIAL_SCREENER_ITEMS.length > 0 ? 'success' : 'warning',
    },
    {
      label: 'Quorum depends on final invite list',
      description: `Quorum is set to ${basics.targetParticipants}. Make sure enough participants are invited to realistically reach it.`,
      state: 'warning',
    },
  ];

  const configurationGroups = [
    {
      title: 'Basics',
      items: [
        basics.studyName || 'Untitled focus group',
        `${basics.targetParticipants} participants (quorum)`,
        basics.sessionDuration?.label ?? 'Duration not set',
      ],
    },
    {
      title: 'Audience',
      items: ['Recruitment: My own participants (custom link)', `${INITIAL_SCREENER_ITEMS.length} screener questions`],
    },
    {
      title: 'Script',
      items: [`${topicCount} topics`, `${questionCount} guiding questions`],
    },
    {
      title: 'Post-session',
      items: [`${INITIAL_POST_SESSION_QUESTIONS.length} survey questions`, 'Does not count towards session time limit'],
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-5">
        <SectionShell title="Focus Group Overview">
          <div className="grid gap-3 md:grid-cols-3">
            <div>
              <p className="text-xs font-medium text-gray-500">Study name</p>
              <p className="mt-1 text-sm font-semibold text-gray-900">
                {basics.studyName || 'Untitled focus group'}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Group size</p>
              <p className="mt-1 text-sm font-semibold text-gray-900">{basics.targetParticipants} participants</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Session duration</p>
              <p className="mt-1 text-sm font-semibold text-gray-900">{basics.sessionDuration?.label ?? 'Not set'}</p>
            </div>
          </div>
          <span className="mt-4 inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
            Focus Group — single shared session
          </span>
        </SectionShell>

        <SectionShell
          title="Operational Readiness Checklist"
          description="Key launch checks before inviting participants."
        >
          <div className="divide-y divide-gray-100">
            {readinessItems.map((item) => (
              <div key={item.label} className="flex gap-3 py-3 first:pt-0 last:pb-0">
                <ReadinessIcon state={item.state} />
                <div>
                  <p className="text-sm font-semibold text-gray-900">{item.label}</p>
                  <p className="mt-0.5 text-sm text-gray-500">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </SectionShell>

        <SectionShell title="Lightweight Configuration Summary">
          <div className="grid gap-4 md:grid-cols-2">
            {configurationGroups.map((group) => (
              <div key={group.title} className="rounded-md bg-gray-50 p-4">
                <p className="text-sm font-semibold text-gray-900">{group.title}</p>
                <ul className="mt-2 space-y-1">
                  {group.items.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="h-1.5 w-1.5 rounded-full bg-gray-300" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </SectionShell>
      </div>

      <aside className="space-y-5 xl:sticky xl:top-4 xl:self-start">
        <SectionShell title="Scheduling Preview">
          <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              {scheduling.mode === 'fixed' ? 'Proposed time' : 'Candidate slots'}
            </p>

            {scheduling.mode === 'fixed' ? (
              <>
                <p className="mt-2 text-lg font-semibold text-gray-900">{formatDateLabel(scheduling.fixedSlot.date)}</p>
                <p className="mt-1 text-sm text-gray-500">
                  {scheduling.fixedSlot.startTime}–{scheduling.fixedSlot.endTime}
                </p>
                <div className="mt-3 inline-flex rounded-full bg-white px-2.5 py-1 text-xs font-medium text-gray-700">
                  {scheduling.requireRsvp ? 'RSVP required' : 'No RSVP required'}
                </div>
              </>
            ) : (
              <ul className="mt-2 space-y-2">
                {scheduling.pollSlots.map((slot, index) => (
                  <li key={slot.id} className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800">
                    <span className="mr-2 text-xs font-semibold text-gray-400">Slot {index + 1}</span>
                    {formatSlotLabel(slot)}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <p className="mt-3 text-xs leading-5 text-gray-500">
            The session locks automatically once {basics.targetParticipants} participants
            {scheduling.mode === 'fixed' ? ' confirm this time' : ' pick the same slot'}. Moderators can
            also lock manually at any point before quorum is reached.
          </p>
        </SectionShell>

        <SectionShell title="Launch Readiness">
          <div className="rounded-lg bg-green-50 p-4">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-green-600 text-white">
                <span className="wm-check text-sm" />
              </span>
              <div>
                <p className="text-sm font-semibold text-green-900">Ready to launch</p>
                <p className="text-xs text-green-700">Scheduling is configured for this focus group.</p>
              </div>
            </div>
          </div>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between gap-3 border-b border-gray-100 pb-3 last:border-0 last:pb-0">
              <span className="text-sm text-gray-500">Moderators available</span>
              <span className="text-sm font-semibold text-gray-900">{INITIAL_MODERATOR_IDS.slice(0, 1).length}</span>
            </div>
            <div className="flex items-center justify-between gap-3 border-b border-gray-100 pb-3 last:border-0 last:pb-0">
              <span className="text-sm text-gray-500">Observers available</span>
              <span className="text-sm font-semibold text-gray-900">{INITIAL_OBSERVER_IDS.slice(0, 1).length}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-gray-500">Quorum target</span>
              <span className="text-sm font-semibold text-gray-900">{basics.targetParticipants}</span>
            </div>
          </div>
        </SectionShell>
      </aside>

      <div className="sticky bottom-0 z-20 flex items-center justify-between rounded-lg border border-gray-200 bg-white px-5 py-3 shadow-[0_-8px_20px_rgba(15,23,42,0.06)] xl:col-span-2">
        <WuButton variant="secondary" onClick={onBack}>
          Back
        </WuButton>
        <div className="flex items-center gap-2">
          <WuButton variant="secondary" onClick={onSaveDraft}>
            Save Draft
          </WuButton>
          <WuButton Icon={<span className="wm-rocket" />} iconPosition="right" onClick={onPublish}>
            Launch Focus Group
          </WuButton>
        </div>
      </div>
    </div>
  );
}
