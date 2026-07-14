'use client';

import type { ReactNode } from 'react';
import dynamic from 'next/dynamic';
import {
  INITIAL_DISCUSSION_TOPICS,
} from '@/data/mock-focus-group-script';
import {
  INITIAL_MODERATOR_IDS,
  INITIAL_OBSERVER_IDS,
  MOCK_MODERATORS,
} from '@/data/mock-study-team';
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

const primaryModerator = MOCK_MODERATORS.find((m) => m.id === INITIAL_MODERATOR_IDS[0]);
const totalQuestions = INITIAL_DISCUSSION_TOPICS.reduce((sum, topic) => sum + topic.questions.length, 0);

function SectionShell({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
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

function StudyOverview({ basics }: { basics: BasicsFormState }) {
  const overviewItems = [
    { label: 'Group name', value: basics.studyName || 'Untitled focus group' },
    { label: 'Group size', value: `${basics.targetParticipants} participants` },
    { label: 'Session duration', value: basics.sessionDuration?.label ?? 'Not set' },
  ];

  return (
    <SectionShell title="Focus Group Overview">
      <div className="grid gap-3 md:grid-cols-3">
        {overviewItems.map((item) => (
          <div key={item.label}>
            <p className="text-xs font-medium text-gray-500">{item.label}</p>
            <p className="mt-1 text-sm font-semibold text-gray-900">{item.value}</p>
          </div>
        ))}
      </div>
      <span className="mt-4 inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
        Focus Group
      </span>
    </SectionShell>
  );
}

function ReadinessChecklist({ scheduling }: { scheduling: SchedulingSnapshot }) {
  const readinessItems: Array<{ label: string; description: string; state: ReadinessState }> = [
    {
      label: 'Moderator assigned',
      description: `${INITIAL_MODERATOR_IDS.length} moderator${INITIAL_MODERATOR_IDS.length === 1 ? '' : 's'} available for the group session.`,
      state: 'success',
    },
    {
      label: 'Session scheduled',
      description:
        scheduling.mode === 'fixed'
          ? `Fixed session time proposed on ${scheduling.fixedSlot.date}.`
          : `${scheduling.pollSlots.length} candidate slots available for participant voting.`,
      state: 'success',
    },
    {
      label: 'Discussion guide ready',
      description: `${totalQuestions} discussion questions are prepared for live moderation.`,
      state: 'success',
    },
    {
      label: 'Observer passcode disabled',
      description: 'Observers can join the session without an additional passcode.',
      state: 'warning',
    },
  ];

  return (
    <SectionShell
      title="Operational Readiness Checklist"
      description="Key launch checks for the live group session."
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
  );
}

function ConfigurationSummary({ basics, scheduling }: { basics: BasicsFormState; scheduling: SchedulingSnapshot }) {
  const configurationGroups = [
    {
      title: 'Study Setup',
      items: [
        `${basics.targetParticipants} participants per session`,
        `${basics.sessionDuration?.label ?? 'Duration not set'}`,
        'Waiting room enabled',
      ],
    },
    {
      title: 'Team',
      items: [
        `${INITIAL_MODERATOR_IDS.length} moderator${INITIAL_MODERATOR_IDS.length === 1 ? '' : 's'} assigned`,
        `${INITIAL_OBSERVER_IDS.length} observer${INITIAL_OBSERVER_IDS.length === 1 ? '' : 's'} added`,
      ],
    },
    {
      title: 'Scheduling',
      items: [
        scheduling.mode === 'fixed' ? 'Fixed session time' : 'Poll — participants vote on time',
        `${scheduling.pollSlots.length} candidate slot${scheduling.pollSlots.length === 1 ? '' : 's'}`,
      ],
    },
    {
      title: 'Discussion Guide',
      items: [
        `${totalQuestions} discussion questions`,
        `${INITIAL_DISCUSSION_TOPICS.length} topic${INITIAL_DISCUSSION_TOPICS.length === 1 ? '' : 's'} covered`,
      ],
    },
  ];

  return (
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
  );
}

function SessionPreview({ scheduling }: { scheduling: SchedulingSnapshot }) {
  const previewSlot =
    scheduling.mode === 'fixed'
      ? scheduling.fixedSlot
      : scheduling.pollSlots[0];

  return (
    <SectionShell title="Session Preview">
      <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
          {scheduling.mode === 'fixed' ? 'Confirmed session' : 'Top candidate slot'}
        </p>
        <p className="mt-2 text-lg font-semibold text-gray-900">{previewSlot?.date ?? 'TBD'}</p>
        <p className="mt-1 text-sm text-gray-500">
          {previewSlot
            ? `${previewSlot.startTime} – ${previewSlot.endTime}`
            : 'Time not set'}
        </p>
        <div className="mt-4 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700">
          {scheduling.mode === 'fixed' ? 'Accept / Decline session invite' : 'Vote for preferred time'}
        </div>
      </div>
    </SectionShell>
  );
}

function LaunchReadinessCard({ basics }: { basics: BasicsFormState }) {
  const stats = [
    { label: 'Moderators available', value: String(INITIAL_MODERATOR_IDS.length) },
    { label: 'Target group size', value: `${basics.targetParticipants} participants` },
    { label: 'Scheduling', value: 'Active' },
  ];

  return (
    <SectionShell title="Launch Readiness">
      <div className="rounded-lg bg-green-50 p-4">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-green-600 text-white">
            <span className="wm-check text-sm" />
          </span>
          <div>
            <p className="text-sm font-semibold text-green-900">Ready to launch</p>
            <p className="text-xs text-green-700">Scheduling is configured for the group session.</p>
          </div>
        </div>
      </div>
      <div className="mt-4 space-y-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex items-center justify-between gap-3 border-b border-gray-100 pb-3 last:border-0 last:pb-0"
          >
            <span className="text-sm text-gray-500">{stat.label}</span>
            <span className="text-sm font-semibold text-gray-900">{stat.value}</span>
          </div>
        ))}
      </div>
      <p className="mt-4 text-sm text-gray-500">
        {primaryModerator?.fullName ?? 'Lead moderator'} will receive notifications when participants confirm or vote.
      </p>
    </SectionShell>
  );
}

export function ReviewStep({ basics, scheduling, onBack, onSaveDraft, onPublish }: ReviewStepProps) {
  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-5">
        <StudyOverview basics={basics} />
        <ReadinessChecklist scheduling={scheduling} />
        <ConfigurationSummary basics={basics} scheduling={scheduling} />
      </div>

      <aside className="space-y-5 xl:sticky xl:top-4 xl:self-start">
        <SessionPreview scheduling={scheduling} />
        <LaunchReadinessCard basics={basics} />
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
            Launch Group
          </WuButton>
        </div>
      </div>
    </div>
  );
}
