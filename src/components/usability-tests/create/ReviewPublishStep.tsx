'use client';

import dynamic from 'next/dynamic';

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

const readinessItems: Array<{ label: string; description: string; state: ReadinessState }> = [
  {
    label: 'Testing surface configured',
    description: 'A surface has been selected and tracking is connected.',
    state: 'success',
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
    label: 'Task script completed',
    description: '3 tasks are defined with success criteria.',
    state: 'success',
  },
  {
    label: 'Observer passcode disabled',
    description: 'Observers can join approved sessions without an additional passcode.',
    state: 'warning',
  },
];

const configGroups = [
  {
    title: 'Study Setup',
    items: ['20-minute task sessions', 'Target: 12 participants'],
  },
  {
    title: 'Links',
    items: ['Website tracking', 'Snippet verified'],
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
    title: 'Discussion Guide',
    items: ['3 tasks defined', 'Success criteria set'],
  },
  {
    title: 'Post-Session',
    items: ['Thank-you message configured', 'Post-session survey enabled'],
  },
];

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

export function ReviewPublishStep({ onBack, onSaveDraft, onPublish }: ReviewPublishStepProps) {
  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-5">
        <SectionShell title="Test Overview">
          <div className="grid gap-3 md:grid-cols-3">
            <div>
              <p className="text-xs font-medium text-gray-500">Test name</p>
              <p className="mt-1 text-sm font-semibold text-gray-900">Greater Midland Community Onboarding Flow</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Task duration</p>
              <p className="mt-1 text-sm font-semibold text-gray-900">20 mins</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">Testing surface</p>
              <p className="mt-1 text-sm font-semibold text-gray-900">Figma Prototype</p>
            </div>
          </div>
          <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
            <span className="wm-touch-app text-sm" /> Usability Test
          </span>
        </SectionShell>

        <SectionShell title="Operational Readiness Checklist" description="Key launch checks before going live.">
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

        <SectionShell title="Configuration Summary">
          <div className="grid gap-4 md:grid-cols-3">
            {configGroups.map((group) => (
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
        <SectionShell title="Launch Readiness">
          <div className="rounded-lg bg-green-50 p-4">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-green-600 text-white">
                <span className="wm-check text-sm" />
              </span>
              <div>
                <p className="text-sm font-semibold text-green-900">Ready to launch</p>
                <p className="text-xs text-green-700">Tracking and scheduling are configured.</p>
              </div>
            </div>
          </div>
          <div className="mt-4 space-y-3">
            {[
              { label: 'Moderators available', value: '2' },
              { label: 'Booking sessions', value: '24' },
              { label: 'Behaviour tracking', value: 'Active' },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center justify-between gap-3 border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                <span className="text-sm text-gray-500">{stat.label}</span>
                <span className="text-sm font-semibold text-gray-900">{stat.value}</span>
              </div>
            ))}
          </div>
        </SectionShell>

        <SectionShell title="Analytics Preview">
          <p className="text-xs leading-5 text-gray-600">
            Once the study goes live and participants start sessions, the Behavior Analytics tab will show heatmaps, scroll depth, session replays, click paths, and rage-click reports automatically.
          </p>
        </SectionShell>
      </aside>

      <div className="sticky bottom-0 z-20 flex items-center justify-between rounded-lg border border-gray-200 bg-white px-5 py-3 shadow-[0_-8px_20px_rgba(15,23,42,0.06)] xl:col-span-2">
        <WuButton variant="secondary" onClick={onBack}>Back</WuButton>
        <div className="flex items-center gap-2">
          <WuButton variant="secondary" onClick={onSaveDraft}>Save Draft</WuButton>
          <WuButton Icon={<span className="wm-rocket" />} iconPosition="right" onClick={onPublish}>
            Launch Test
          </WuButton>
        </div>
      </div>
    </div>
  );
}
