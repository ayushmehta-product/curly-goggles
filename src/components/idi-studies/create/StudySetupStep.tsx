'use client';

import { useMemo, useState, type ReactNode } from 'react';
import dynamic from 'next/dynamic';

const WuAccordion = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuAccordion })),
  { ssr: false }
);
const WuButton = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuButton })),
  { ssr: false }
);
const WuCombobox = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuCombobox })),
  { ssr: false }
);
const WuInput = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuInput })),
  { ssr: false }
);
const WuSelect = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuSelect })),
  { ssr: false }
);
const WuStepper = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuStepper })),
  { ssr: false }
);
const WuTextarea = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuTextarea })),
  { ssr: false }
);
const WuToggle = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuToggle })),
  { ssr: false }
);

interface SelectOption {
  value: string;
  label: string;
}

interface StudySetupForm {
  studyName: string;
  description: string;
  sessionDuration: SelectOption | null;
  timezone: SelectOption | null;
  enableWaitingRoom: boolean;
  allowObservers: boolean;
  requireObserverPasscode: boolean;
  observerPasscode: string;
  enableSessionsPerDayLimit: boolean;
  sessionsPerDayLimit: number;
  enableTotalSessionLimit: boolean;
  totalSessionLimit: number;
}

interface StudySetupStepProps {
  onCancel: () => void;
  onSaveDraft: () => void;
  onContinue: () => void;
}

const SESSION_DURATION_OPTIONS: SelectOption[] = [
  { value: '15', label: '15 mins' },
  { value: '30', label: '30 mins' },
  { value: '45', label: '45 mins' },
  { value: '60', label: '60 mins' },
  { value: '90', label: '90 mins' },
];

const TIMEZONE_OPTIONS: SelectOption[] = [
  { value: 'Asia/Calcutta', label: 'Asia/Calcutta' },
  { value: 'America/New_York', label: 'America/New_York' },
  { value: 'America/Los_Angeles', label: 'America/Los_Angeles' },
  { value: 'Europe/London', label: 'Europe/London' },
  { value: 'Europe/Berlin', label: 'Europe/Berlin' },
  { value: 'Asia/Singapore', label: 'Asia/Singapore' },
  { value: 'Asia/Tokyo', label: 'Asia/Tokyo' },
  { value: 'Australia/Sydney', label: 'Australia/Sydney' },
];

const DEFAULT_FORM: StudySetupForm = {
  studyName: '',
  description: '',
  sessionDuration: SESSION_DURATION_OPTIONS[1],
  timezone: TIMEZONE_OPTIONS[0],
  enableWaitingRoom: true,
  allowObservers: true,
  requireObserverPasscode: false,
  observerPasscode: 'observer-4729',
  enableSessionsPerDayLimit: false,
  sessionsPerDayLimit: 6,
  enableTotalSessionLimit: false,
  totalSessionLimit: 24,
};

type ValidationErrors = Partial<Record<'studyName' | 'sessionDuration' | 'timezone', string>>;

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-red-600">{message}</p>;
}

function getInterviewRecommendation(duration: SelectOption | null) {
  const minutes = Number(duration?.value ?? 0);

  if (minutes <= 15) {
    return {
      label: 'Quick validation',
      description: 'Best for short concept reactions or targeted follow-up interviews.',
    };
  }

  if (minutes <= 30) {
    return {
      label: 'Usability walkthrough',
      description: 'Recommended for task-based usability walkthroughs with focused probing.',
    };
  }

  if (minutes <= 45) {
    return {
      label: 'Discovery interview',
      description: 'Recommended for discovery interviews with room for context and follow-ups.',
    };
  }

  return {
    label: 'Deep exploratory research',
    description: 'Use for complex workflows, sensitive topics, or multi-stage discussion guides.',
  };
}

function getCapacityInsight(form: StudySetupForm) {
  const dailyLimit = form.enableSessionsPerDayLimit ? form.sessionsPerDayLimit : null;
  const totalLimit = form.enableTotalSessionLimit ? form.totalSessionLimit : null;
  const durationMinutes = Number(form.sessionDuration?.value ?? 0);

  if (dailyLimit && totalLimit) {
    const activeDays = Math.ceil(totalLimit / dailyLimit);
    return {
      headline: `${activeDays} active interview day${activeDays === 1 ? '' : 's'}`,
      description: `With ${dailyLimit} sessions/day and ${totalLimit} total sessions, this study can be completed in approximately ${activeDays} active interview day${activeDays === 1 ? '' : 's'}.`,
      workload:
        dailyLimit * durationMinutes >= 300
          ? 'Heavy moderator load'
          : dailyLimit * durationMinutes >= 180
            ? 'Moderate moderator load'
            : 'Light moderator load',
    };
  }

  if (dailyLimit) {
    return {
      headline: `${dailyLimit} sessions per interview day`,
      description: `Daily throughput is capped at ${dailyLimit} moderated interviews. Add a total session limit to estimate completion pace.`,
      workload:
        dailyLimit * durationMinutes >= 300
          ? 'Heavy moderator load'
          : dailyLimit * durationMinutes >= 180
            ? 'Moderate moderator load'
            : 'Light moderator load',
    };
  }

  if (totalLimit) {
    return {
      headline: `${totalLimit} total interviews planned`,
      description:
        'This study has an overall interview cap. Add a daily limit to understand moderator workload and active interview days.',
      workload: 'Daily workload not capped',
    };
  }

  return {
    headline: 'Capacity limits are off',
    description:
      'Turn on capacity limits when recruiting volume needs pacing or moderator availability is constrained.',
    workload: 'Unbounded scheduling',
  };
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-gray-100 py-2 last:border-0">
      <span className="text-xs text-gray-500">{label}</span>
      <span className="max-w-[150px] truncate text-right text-xs font-semibold text-gray-800">
        {value}
      </span>
    </div>
  );
}

function SidebarCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      <div className="mt-3">{children}</div>
    </div>
  );
}

export function StudySetupStep({
  onCancel,
  onSaveDraft,
  onContinue,
}: StudySetupStepProps) {
  const [form, setForm] = useState<StudySetupForm>(DEFAULT_FORM);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const recommendation = getInterviewRecommendation(form.sessionDuration);
  const capacityInsight = getCapacityInsight(form);

  function validateForm() {
    const nextErrors: ValidationErrors = {};

    if (!form.studyName.trim()) {
      nextErrors.studyName = 'Study Name is required.';
    }

    if (!form.sessionDuration) {
      nextErrors.sessionDuration = 'Interview Duration is required.';
    }

    if (!form.timezone) {
      nextErrors.timezone = 'Study Timezone is required.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleContinue() {
    if (!validateForm()) return;
    onContinue();
  }

  const advancedSettingsItems = useMemo(
    () => [
      {
        value: 'advanced-study-settings',
        Summary: (
          <div className="w-full text-left">
            <p className="text-sm font-semibold text-gray-800">Advanced Settings</p>
            <p className="text-xs font-normal text-gray-500">
              Optional controls for observer access and interview capacity.
            </p>
          </div>
        ),
        Details: (
          <div className="space-y-4 pt-1">
            <section className="rounded-lg border border-gray-200 bg-gray-50/60 p-3">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Session Access</h3>
                  <p className="text-xs text-gray-500">
                    Control how participants and observers enter moderated interviews.
                  </p>
                </div>
                <span className="rounded-full bg-white px-2 py-1 text-xs font-medium text-gray-500">
                  Optional
                </span>
              </div>

              <div className="divide-y divide-gray-200 rounded-md border border-gray-200 bg-white">
                <div className="grid grid-cols-1 gap-3 px-3 py-2.5 md:grid-cols-[1fr_auto] md:items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-800">Enable Waiting Room</p>
                    <p className="text-xs text-gray-500">
                      Let moderators admit participants when the interview team is ready.
                    </p>
                  </div>
                  <WuToggle
                    defaultChecked={form.enableWaitingRoom}
                    onChange={(checked) =>
                      setForm((currentForm) => ({
                        ...currentForm,
                        enableWaitingRoom: checked,
                      }))
                    }
                  />
                </div>

                <div className="grid grid-cols-1 gap-3 px-3 py-2.5 md:grid-cols-[1fr_auto] md:items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-800">Allow Observers</p>
                    <p className="text-xs text-gray-500">
                      Give stakeholders view-only access without interrupting moderation.
                    </p>
                  </div>
                  <WuToggle
                    defaultChecked={form.allowObservers}
                    onChange={(checked) =>
                      setForm((currentForm) => ({
                        ...currentForm,
                        allowObservers: checked,
                      }))
                    }
                  />
                </div>

                {form.allowObservers && (
                  <div className="px-3 py-2.5">
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto] md:items-center">
                      <div>
                        <p className="text-sm font-medium text-gray-800">Observer Passcode</p>
                        <p className="text-xs text-gray-500">
                          Off by default. Add only when observer access needs an extra gate.
                        </p>
                      </div>
                      <WuToggle
                        defaultChecked={form.requireObserverPasscode}
                        onChange={(checked) =>
                          setForm((currentForm) => ({
                            ...currentForm,
                            requireObserverPasscode: checked,
                          }))
                        }
                      />
                    </div>
                    {form.requireObserverPasscode && (
                      <div className="mt-3 max-w-sm">
                        <WuInput
                          Label="Passcode"
                          type="password"
                          variant="outlined"
                          value={form.observerPasscode}
                          onChange={(event) =>
                            setForm((currentForm) => ({
                              ...currentForm,
                              observerPasscode: event.target.value,
                            }))
                          }
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-lg border border-gray-200 bg-gray-50/60 p-3">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Study Capacity</h3>
                  <p className="text-xs text-gray-500">
                    Pace interviews around moderator availability and recruitment volume.
                  </p>
                </div>
                <span className="rounded-full bg-white px-2 py-1 text-xs font-medium text-gray-500">
                  Off by default
                </span>
              </div>

              <div className="divide-y divide-gray-200 rounded-md border border-gray-200 bg-white">
                <div className="px-3 py-2.5">
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto] md:items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-800">Limit Sessions Per Day</p>
                      <p className="text-xs text-gray-500">
                        Cap daily interview volume to protect moderator focus and note quality.
                      </p>
                    </div>
                    <WuToggle
                      defaultChecked={form.enableSessionsPerDayLimit}
                      onChange={(checked) =>
                        setForm((currentForm) => ({
                          ...currentForm,
                          enableSessionsPerDayLimit: checked,
                        }))
                      }
                    />
                  </div>
                  {form.enableSessionsPerDayLimit && (
                    <div className="mt-3 max-w-xs">
                      <WuStepper
                        Label="Sessions per day"
                        min={1}
                        max={20}
                        value={form.sessionsPerDayLimit}
                        onChange={(value) =>
                          setForm((currentForm) => ({
                            ...currentForm,
                            sessionsPerDayLimit: value,
                          }))
                        }
                      />
                    </div>
                  )}
                </div>

                <div className="px-3 py-2.5">
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto] md:items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        Limit Total Sessions For This Study
                      </p>
                      <p className="text-xs text-gray-500">
                        Set the planned interview cap for synthesis and recruitment tracking.
                      </p>
                    </div>
                    <WuToggle
                      defaultChecked={form.enableTotalSessionLimit}
                      onChange={(checked) =>
                        setForm((currentForm) => ({
                          ...currentForm,
                          enableTotalSessionLimit: checked,
                        }))
                      }
                    />
                  </div>
                  {form.enableTotalSessionLimit && (
                    <div className="mt-3 max-w-xs">
                      <WuStepper
                        Label="Total sessions"
                        min={1}
                        max={100}
                        value={form.totalSessionLimit}
                        onChange={(value) =>
                          setForm((currentForm) => ({
                            ...currentForm,
                            totalSessionLimit: value,
                          }))
                        }
                      />
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>
        ),
      },
    ],
    [form]
  );

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="border-b border-gray-100 px-5 py-3">
          <h2 className="text-base font-semibold text-gray-900">Study Setup</h2>
          <p className="mt-1 text-sm text-gray-500">
            Capture the research context and baseline interview operating rules.
          </p>
        </div>

        <div className="space-y-4 p-5">
          <div>
            <WuInput
              Label="Study Name"
              variant="outlined"
              placeholder="e.g. Mobile Banking Onboarding Interviews"
              value={form.studyName}
              invalid={Boolean(errors.studyName)}
              onChange={(event) => {
                setForm((currentForm) => ({
                  ...currentForm,
                  studyName: event.target.value,
                }));
                if (errors.studyName) {
                  setErrors((currentErrors) => ({ ...currentErrors, studyName: undefined }));
                }
              }}
            />
            <FieldError message={errors.studyName} />
            <p className="mt-1 text-xs text-gray-500">
              Use the title researchers and observers will recognize in schedules and study notes.
            </p>
          </div>

          <div>
            <WuTextarea
              Label="Study Context"
              variant="outlined"
              placeholder="Summarize the product area, participant context, and research questions the moderator should keep in mind."
              value={form.description}
              rows={3}
              onChange={(event) =>
                setForm((currentForm) => ({
                  ...currentForm,
                  description: event.target.value,
                }))
              }
            />
            <p className="mt-1 text-xs text-gray-500">
              Optional. Add enough context for moderators, research operations, and observers to understand the study intent.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <WuSelect
                Label="Interview Duration"
                data={SESSION_DURATION_OPTIONS}
                accessorKey={{ value: 'value', label: 'label' }}
                value={form.sessionDuration}
                onSelect={(value) => {
                  setForm((currentForm) => ({
                    ...currentForm,
                    sessionDuration: value as SelectOption,
                  }));
                  if (errors.sessionDuration) {
                    setErrors((currentErrors) => ({
                      ...currentErrors,
                      sessionDuration: undefined,
                    }));
                  }
                }}
                variant="outlined"
              />
              <FieldError message={errors.sessionDuration} />
              <p className="mt-1 text-xs text-gray-500">
                Choose a length that leaves room for probing without exhausting participants.
              </p>
            </div>

            <div>
              <WuCombobox
                Label="Study Timezone"
                data={TIMEZONE_OPTIONS}
                accessorKey={{ value: 'value', label: 'label' }}
                value={form.timezone}
                onSelect={(value) => {
                  setForm((currentForm) => ({
                    ...currentForm,
                    timezone: value as SelectOption,
                  }));
                  if (errors.timezone) {
                    setErrors((currentErrors) => ({ ...currentErrors, timezone: undefined }));
                  }
                }}
                enableSearch
                variant="outlined"
                placeholder="Search timezone"
              />
              <FieldError message={errors.timezone} />
              <p className="mt-1 text-xs text-gray-500">
                Anchors moderator availability before participants book in their local timezone.
              </p>
            </div>
          </div>

          <div className="rounded-md border border-blue-100 bg-blue-50 px-3 py-2 text-xs leading-5 text-blue-800">
            Participants will book available interview slots in their local timezone during
            Scheduling setup.
          </div>

          <WuAccordion items={advancedSettingsItems} />
        </div>

        <div className="sticky bottom-0 z-20 flex items-center justify-between border-t border-gray-100 bg-white px-5 py-3 shadow-[0_-8px_20px_rgba(15,23,42,0.06)]">
          <WuButton variant="link" onClick={onCancel}>
            Cancel
          </WuButton>
          <div className="flex items-center gap-2">
            <WuButton variant="secondary" onClick={onSaveDraft}>
              Save Draft
            </WuButton>
            <WuButton Icon={<span className="wm-arrow-forward" />} iconPosition="right" onClick={handleContinue}>
              Continue
            </WuButton>
          </div>
        </div>
      </div>

      <aside className="space-y-4">
        <SidebarCard title="Study Summary">
          <SummaryRow label="Interview duration" value={form.sessionDuration?.label ?? 'Not set'} />
          <SummaryRow label="Waiting room" value={form.enableWaitingRoom ? 'Enabled' : 'Disabled'} />
          <SummaryRow label="Observer access" value={form.allowObservers ? 'Enabled' : 'Disabled'} />
          <SummaryRow
            label="Sessions/day limit"
            value={form.enableSessionsPerDayLimit ? String(form.sessionsPerDayLimit) : 'Off'}
          />
          <SummaryRow
            label="Total session limit"
            value={form.enableTotalSessionLimit ? String(form.totalSessionLimit) : 'Off'}
          />
        </SidebarCard>

        <SidebarCard title="Operational Capacity">
          <div className="rounded-md bg-gray-50 p-3">
            <p className="text-sm font-semibold text-gray-900">{capacityInsight.headline}</p>
            <p className="mt-1 text-xs leading-5 text-gray-600">{capacityInsight.description}</p>
          </div>
          <div className="mt-3 inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
            {capacityInsight.workload}
          </div>
        </SidebarCard>

        <SidebarCard title="Research Recommendation">
          <div className="inline-flex rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
            {recommendation.label}
          </div>
          <p className="mt-3 text-xs leading-5 text-gray-600">{recommendation.description}</p>
        </SidebarCard>
      </aside>
    </div>
  );
}
