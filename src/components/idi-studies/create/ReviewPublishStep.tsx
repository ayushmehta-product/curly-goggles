'use client';

import type { ReactNode } from 'react';
import dynamic from 'next/dynamic';
import {
  CONFIGURED_SESSION_DURATION_MINUTES,
  MOCK_DISCUSSION_GUIDE_SECTIONS,
} from '@/data/mock-discussion-guide';
import {
  DEFAULT_WEEKLY_AVAILABILITY,
  PREVIEW_DATES,
  TIMEZONE_OPTIONS,
} from '@/data/mock-scheduling';
import {
  INITIAL_MODERATOR_IDS,
  INITIAL_OBSERVER_IDS,
  MOCK_MODERATORS,
} from '@/data/mock-study-team';

const WuButton = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuButton })),
  { ssr: false }
);

interface ReviewPublishStepProps {
  onBack: () => void;
  onSaveDraft: () => void;
  onPublish: () => void;
}

type ReadinessState = 'success' | 'warning';

const STUDY_NAME = 'Enterprise Onboarding Friction Study';
const STUDY_TIMEZONE = TIMEZONE_OPTIONS[0].label;
const AVAILABLE_BOOKING_SESSIONS = 24;

const questionCount = MOCK_DISCUSSION_GUIDE_SECTIONS.reduce(
  (total, section) => total + section.questions.length,
  0
);
const enabledWeekdays = DEFAULT_WEEKLY_AVAILABILITY.filter((day) => day.enabled);
const primaryModerator = MOCK_MODERATORS.find((moderator) => moderator.id === INITIAL_MODERATOR_IDS[0]);
const nextPreviewDate = PREVIEW_DATES[0];

const readinessItems: Array<{ label: string; description: string; state: ReadinessState }> = [
  {
    label: 'Moderator assigned',
    description: `${INITIAL_MODERATOR_IDS.length} moderators are available for live interviews.`,
    state: 'success',
  },
  {
    label: 'Availability configured',
    description: `${enabledWeekdays.length} weekdays are open for participant booking.`,
    state: 'success',
  },
  {
    label: 'Discussion guide completed',
    description: `${questionCount} interview questions are ready for moderation.`,
    state: 'success',
  },
  {
    label: 'Limited Friday availability',
    description: 'Friday booking window closes at 3:00 PM.',
    state: 'warning',
  },
  {
    label: 'Observer passcode disabled',
    description: 'Observers can join approved sessions without an additional passcode.',
    state: 'warning',
  },
];

const configurationGroups = [
  {
    title: 'Study Setup',
    items: [
      `${CONFIGURED_SESSION_DURATION_MINUTES}-minute interviews`,
      'Waiting room enabled',
      'Observer access enabled',
    ],
  },
  {
    title: 'Team',
    items: [
      `${INITIAL_MODERATOR_IDS.length} moderators assigned`,
      `${INITIAL_OBSERVER_IDS.length} observers added`,
    ],
  },
  {
    title: 'Scheduling',
    items: ['Weekday availability configured', `${AVAILABLE_BOOKING_SESSIONS} available booking sessions`],
  },
  {
    title: 'Discussion Guide',
    items: [`${questionCount} interview questions`, `Estimated duration: ${CONFIGURED_SESSION_DURATION_MINUTES} mins`],
  },
];

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

function StudyOverview() {
  const overviewItems = [
    { label: 'Study name', value: STUDY_NAME },
    { label: 'Interview duration', value: `${CONFIGURED_SESSION_DURATION_MINUTES} mins` },
    { label: 'Study timezone', value: STUDY_TIMEZONE },
  ];

  return (
    <SectionShell title="Study Overview">
      <div className="grid gap-3 md:grid-cols-3">
        {overviewItems.map((item) => (
          <div key={item.label}>
            <p className="text-xs font-medium text-gray-500">{item.label}</p>
            <p className="mt-1 text-sm font-semibold text-gray-900">{item.value}</p>
          </div>
        ))}
      </div>
      <span className="mt-4 inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
        Moderated Study
      </span>
    </SectionShell>
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

function ReadinessChecklist() {
  return (
    <SectionShell
      title="Operational Readiness Checklist"
      description="Key launch checks for live moderated interviews."
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

function ConfigurationSummary() {
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

function BookingPreview() {
  return (
    <SectionShell title="Booking Preview Snapshot">
      <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Next available slot</p>
        <p className="mt-2 text-lg font-semibold text-gray-900">
          {nextPreviewDate.weekday}, {nextPreviewDate.month} {nextPreviewDate.day}
        </p>
        <p className="mt-1 text-sm text-gray-500">10:00 AM - 10:30 AM, {STUDY_TIMEZONE}</p>
        <div className="mt-4 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700">
          Book moderated interview
        </div>
      </div>
    </SectionShell>
  );
}

function LaunchReadinessCard() {
  const stats = [
    { label: 'Moderators available', value: String(INITIAL_MODERATOR_IDS.length) },
    { label: 'Booking sessions', value: String(AVAILABLE_BOOKING_SESSIONS) },
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
            <p className="text-xs text-green-700">Booking is configured for moderated sessions.</p>
          </div>
        </div>
      </div>
      <div className="mt-4 space-y-3">
        {stats.map((stat) => (
          <div key={stat.label} className="flex items-center justify-between gap-3 border-b border-gray-100 pb-3 last:border-0 last:pb-0">
            <span className="text-sm text-gray-500">{stat.label}</span>
            <span className="text-sm font-semibold text-gray-900">{stat.value}</span>
          </div>
        ))}
      </div>
      <p className="mt-4 text-sm text-gray-500">
        {primaryModerator?.fullName ?? 'Lead moderator'} will receive booking notifications when participants schedule sessions.
      </p>
    </SectionShell>
  );
}

export function ReviewPublishStep({ onBack, onSaveDraft, onPublish }: ReviewPublishStepProps) {
  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-5">
        <StudyOverview />
        <ReadinessChecklist />
        <ConfigurationSummary />
      </div>

      <aside className="space-y-5 xl:sticky xl:top-4 xl:self-start">
        <BookingPreview />
        <LaunchReadinessCard />
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
            Launch Study
          </WuButton>
        </div>
      </div>
    </div>
  );
}
