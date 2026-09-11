'use client';

import dynamic from 'next/dynamic';
import {
  isTaskConfigured,
  taskSuccessSummary,
  type UsabilityCreateDraft,
} from '@/data/usability-create-storage';

const WuButton = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuButton })),
  { ssr: false }
);

interface ReviewPublishStepProps {
  draft: UsabilityCreateDraft;
  onBack: () => void;
  onSaveDraft: () => void;
  onPublish: () => void;
}

type ReadinessState = 'success' | 'warning';

function SectionShell({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
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
  const styles = state === 'success'
    ? 'bg-green-50 text-green-700 ring-green-100'
    : 'bg-amber-50 text-amber-700 ring-amber-100';
  return (
    <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ring-4 ${styles}`}>
      <span className={state === 'success' ? 'wm-check text-sm' : 'wm-warning text-sm'} />
    </span>
  );
}

const SURFACE_LABELS = {
  website: 'Website',
  saas: 'SaaS product',
  figma: 'Figma prototype',
} as const;

export function ReviewPublishStep({ draft, onBack, onSaveDraft, onPublish }: ReviewPublishStepProps) {
  const hasPages = draft.pages.length > 0;
  const configuredTasks = draft.tasks.filter((task) => isTaskConfigured(task, hasPages));
  const tasksReady = configuredTasks.length === draft.tasks.length && draft.tasks.length > 0;
  const surfaceLabel = draft.surface ? SURFACE_LABELS[draft.surface] : 'Not selected';
  const linksReady = draft.surface === 'figma'
    ? draft.figma.connected && !!draft.figma.file
    : draft.surface === 'saas'
      ? draft.saas.verified
      : draft.website.verified;
  const pageNote = draft.surface === 'figma'
    ? 'Prototype — people mark each task done'
    : hasPages
      ? `${draft.pages.length} page${draft.pages.length === 1 ? '' : 's'} listed`
      : 'No pages listed — add URLs or use “Participant marks done”';

  const readinessItems: Array<{ label: string; description: string; state: ReadinessState }> = [
    {
      label: 'Testing surface connected',
      description: linksReady
        ? `${surfaceLabel} is connected${draft.website.recordingOnly && draft.surface === 'website' ? ' (recording only)' : ''}.`
        : 'Connect a website, product, or prototype on Links.',
      state: linksReady ? 'success' : 'warning',
    },
    {
      label: 'Moderator assigned',
      description: '2 moderators are available for live interviews.',
      state: 'success',
    },
    {
      label: 'Scheduling availability configured',
      description: '5 weekdays are open for participant booking.',
      state: 'success',
    },
    {
      label: 'Observable success set',
      description: tasksReady
        ? `${configuredTasks.length} of ${draft.tasks.length} ${draft.tasks.length === 1 ? 'task has' : 'tasks have'} a start and a success.`
        : `${configuredTasks.length} of ${draft.tasks.length} ${draft.tasks.length === 1 ? 'task has' : 'tasks have'} a start and a success.`,
      state: tasksReady ? 'success' : 'warning',
    },
    {
      label: 'Observer passcode disabled',
      description: 'Observers can join approved sessions without an additional passcode.',
      state: 'warning',
    },
  ];

  const configGroups = [
    {
      title: 'Study setup',
      items: ['20-minute sessions', 'Target: 12 participants'],
    },
    {
      title: 'Links',
      items: [surfaceLabel, pageNote],
    },
    {
      title: 'Team',
      items: ['2 moderators assigned', '3 observers added'],
    },
    {
      title: 'Scheduling',
      items: ['Weekday availability configured', '24 available booking sessions'],
    },
    {
      title: 'Discussion guide',
      items: draft.tasks.map((task, index) => `Task ${index + 1}: ${taskSuccessSummary(task, draft.pages)}`),
    },
    {
      title: 'Post-session',
      items: ['Thank-you message configured', 'Post-session survey enabled'],
    },
  ];

  const readyToLaunch = linksReady && tasksReady;

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-5">
        <SectionShell title="Test overview">
          <div className="grid gap-3 md:grid-cols-3">
            <div>
              <p className="text-xs font-medium text-gray-500">Test name</p>
              <p className="mt-1 text-sm font-semibold text-gray-900">Greater Midland Community Onboarding Flow</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Session length</p>
              <p className="mt-1 text-sm font-semibold text-gray-900">20 mins</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Testing surface</p>
              <p className="mt-1 text-sm font-semibold text-gray-900">{surfaceLabel}</p>
            </div>
          </div>
          <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
            <span className="wm-touch-app text-sm" /> Usability test
          </span>
        </SectionShell>

        <SectionShell title="Launch checklist" description="Confirm start and success are set before you collect sessions.">
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

        <SectionShell title="Configuration summary">
          <div className="grid gap-4 md:grid-cols-3">
            {configGroups.map((group) => (
              <div key={group.title} className="rounded-md bg-gray-50 p-4">
                <p className="text-sm font-semibold text-gray-900">{group.title}</p>
                <ul className="mt-2 space-y-1">
                  {group.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gray-300" />
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
        <SectionShell title="Launch readiness">
          <div className={`rounded-lg p-4 ${readyToLaunch ? 'bg-green-50' : 'bg-amber-50'}`}>
            <div className="flex items-center gap-2">
              <span className={`flex h-7 w-7 items-center justify-center rounded-full text-white ${readyToLaunch ? 'bg-green-600' : 'bg-amber-500'}`}>
                <span className={readyToLaunch ? 'wm-check text-sm' : 'wm-warning text-sm'} />
              </span>
              <div>
                <p className={`text-sm font-semibold ${readyToLaunch ? 'text-green-900' : 'text-amber-900'}`}>
                  {readyToLaunch ? 'Ready to launch' : 'Finish start and success'}
                </p>
                <p className={`text-xs ${readyToLaunch ? 'text-green-700' : 'text-amber-800'}`}>
                  {readyToLaunch
                    ? 'Each task has an observable success. Analyze will score against that end state.'
                    : 'Set start and success on the discussion guide so results have a clear pass/fail.'}
                </p>
              </div>
            </div>
          </div>
          <div className="mt-4 space-y-3">
            {[
              { label: 'Moderators available', value: '2' },
              { label: 'Booking sessions', value: '24' },
              { label: 'Pages listed', value: draft.surface === 'figma' ? 'Prototype' : String(draft.pages.length) },
              { label: 'Tasks with success', value: `${configuredTasks.length}/${draft.tasks.length}` },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center justify-between gap-3 border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                <span className="text-sm text-gray-500">{stat.label}</span>
                <span className="text-sm font-semibold text-gray-900">{stat.value}</span>
              </div>
            ))}
          </div>
        </SectionShell>

        <SectionShell title="What analyze will show">
          <p className="text-xs leading-5 text-gray-600">
            After sessions start, Behavior analytics reports who reached the success you set, who recovered after a diversion, and who left before that end state. Heatmaps, scroll, and replays help explain the path — they are not the success score.
          </p>
        </SectionShell>
      </aside>

      <div className="sticky bottom-0 z-20 flex items-center justify-between rounded-lg border border-gray-200 bg-white px-5 py-3 shadow-[0_-8px_20px_rgba(15,23,42,0.06)] xl:col-span-2">
        <WuButton variant="secondary" onClick={onBack}>Back</WuButton>
        <div className="flex items-center gap-2">
          <WuButton variant="secondary" onClick={onSaveDraft}>Save draft</WuButton>
          <WuButton Icon={<span className="wm-rocket" />} iconPosition="right" onClick={onPublish}>
            Launch test
          </WuButton>
        </div>
      </div>
    </div>
  );
}
