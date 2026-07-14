'use client';

import { useMemo, useState, type ReactNode } from 'react';
import dynamic from 'next/dynamic';

const WuAccordion = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuAccordion })),
  { ssr: false }
);
const WuCheckbox = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuCheckbox })),
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

export interface FgStudySetupForm {
  studyName: string;
  description: string;
  targetGroupSize: number;
  sessionDuration: SelectOption | null;
  timezone: SelectOption | null;
  enableWaitingRoom: boolean;
  allowObservers: boolean;
  requireObserverPasscode: boolean;
  observerPasscode: string;
  attachNda: boolean;
}

interface StudySetupStepProps {
  onCancel: () => void;
  onSaveDraft: () => void;
  onContinue: () => void;
}

const SESSION_DURATION_OPTIONS: SelectOption[] = [
  { value: '30', label: '30 mins' },
  { value: '45', label: '45 mins' },
  { value: '60', label: '60 mins' },
  { value: '90', label: '90 mins' },
  { value: '120', label: '120 mins' },
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

const DEFAULT_FORM: FgStudySetupForm = {
  studyName: '',
  description: '',
  targetGroupSize: 6,
  sessionDuration: SESSION_DURATION_OPTIONS[2],
  timezone: TIMEZONE_OPTIONS[0],
  enableWaitingRoom: true,
  allowObservers: true,
  requireObserverPasscode: false,
  observerPasscode: 'observer-4729',
  attachNda: false,
};

type ValidationErrors = Partial<Record<'studyName' | 'sessionDuration' | 'timezone', string>>;

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-red-600">{message}</p>;
}

function getGroupSizeGuidance(size: number) {
  if (size <= 4) {
    return {
      label: 'Mini group',
      description: 'Smaller groups surface individual perspectives more clearly and are easier to moderate. Good for sensitive or complex topics.',
    };
  }
  if (size <= 7) {
    return {
      label: 'Standard focus group',
      description: 'A balanced size for lively discussion while still giving every participant room to speak and be heard.',
    };
  }
  return {
    label: 'Extended group',
    description: 'Larger groups generate more viewpoints but need firmer moderation to keep discussion focused and ensure equal participation.',
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

function SidebarCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      <div className="mt-3">{children}</div>
    </div>
  );
}

export function StudySetupStep({ onCancel, onSaveDraft, onContinue }: StudySetupStepProps) {
  const [form, setForm] = useState<FgStudySetupForm>(DEFAULT_FORM);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const guidance = getGroupSizeGuidance(form.targetGroupSize);

  function validateForm() {
    const nextErrors: ValidationErrors = {};
    if (!form.studyName.trim()) {
      nextErrors.studyName = 'Focus group name is required.';
    }
    if (!form.sessionDuration) {
      nextErrors.sessionDuration = 'Session duration is required.';
    }
    if (!form.timezone) {
      nextErrors.timezone = 'Timezone is required.';
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
        value: 'advanced-fg-settings',
        Summary: (
          <div className="w-full text-left">
            <p className="text-sm font-semibold text-gray-800">Advanced Settings</p>
            <p className="text-xs font-normal text-gray-500">
              Optional controls for session access, observers, and NDA.
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
                    Control how participants and observers enter the group session.
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
                      Hold participants in a lobby until the moderator is ready to start.
                    </p>
                  </div>
                  <WuToggle
                    defaultChecked={form.enableWaitingRoom}
                    onChange={(checked) =>
                      setForm((currentForm) => ({ ...currentForm, enableWaitingRoom: checked }))
                    }
                  />
                </div>

                <div className="grid grid-cols-1 gap-3 px-3 py-2.5 md:grid-cols-[1fr_auto] md:items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-800">Allow Observers</p>
                    <p className="text-xs text-gray-500">
                      Give stakeholders view-only access without interrupting the group.
                    </p>
                  </div>
                  <WuToggle
                    defaultChecked={form.allowObservers}
                    onChange={(checked) =>
                      setForm((currentForm) => ({ ...currentForm, allowObservers: checked }))
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
                          setForm((currentForm) => ({ ...currentForm, requireObserverPasscode: checked }))
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
                  <h3 className="text-sm font-semibold text-gray-900">Legal</h3>
                  <p className="text-xs text-gray-500">
                    Optionally require participants to sign an NDA before accessing the focus group.
                  </p>
                </div>
                <span className="rounded-full bg-white px-2 py-1 text-xs font-medium text-gray-500">
                  Optional
                </span>
              </div>
              <label className="flex cursor-pointer items-start gap-3 rounded-md border border-gray-200 bg-white px-3 py-2.5">
                <WuCheckbox
                  checked={form.attachNda}
                  onChange={(checked) =>
                    setForm((currentForm) => ({ ...currentForm, attachNda: checked }))
                  }
                />
                <span>
                  <span className="block text-sm font-medium text-gray-800">Attach NDA</span>
                  <span className="mt-0.5 block text-xs text-gray-500">
                    Participants must accept a non-disclosure agreement before joining or viewing study materials.
                  </span>
                </span>
              </label>
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
            Set the core configuration for this focus group study.
          </p>
        </div>

        <div className="space-y-4 p-5">
          <div>
            <WuInput
              Label="Focus Group Name"
              variant="outlined"
              placeholder="e.g. Checkout Redesign Reaction Group"
              value={form.studyName}
              invalid={Boolean(errors.studyName)}
              onChange={(event) => {
                setForm((currentForm) => ({ ...currentForm, studyName: event.target.value }));
                if (errors.studyName) {
                  setErrors((currentErrors) => ({ ...currentErrors, studyName: undefined }));
                }
              }}
            />
            <FieldError message={errors.studyName} />
            <p className="mt-1 text-xs text-gray-500">
              Use the title moderators and observers will recognize on the schedule.
            </p>
          </div>

          <div>
            <WuTextarea
              Label="Study Context"
              variant="outlined"
              placeholder="Summarize the discussion topic, participant profile, and research questions the moderator should keep in mind."
              value={form.description}
              rows={3}
              onChange={(event) =>
                setForm((currentForm) => ({ ...currentForm, description: event.target.value }))
              }
            />
            <p className="mt-1 text-xs text-gray-500">
              Optional. Helps moderators, operations, and observers understand the study intent.
            </p>
          </div>

          <div>
            <WuStepper
              Label="Target Group Size"
              min={3}
              max={15}
              value={form.targetGroupSize}
              onChange={(value) =>
                setForm((currentForm) => ({ ...currentForm, targetGroupSize: value }))
              }
            />
            <p className="mt-1 text-xs text-gray-500">
              Target number of participants per session. Also sets the quorum used to auto-lock scheduling once this many participants confirm.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <WuSelect
                Label="Session Duration"
                data={SESSION_DURATION_OPTIONS}
                accessorKey={{ value: 'value', label: 'label' }}
                value={form.sessionDuration}
                onSelect={(value) => {
                  setForm((currentForm) => ({
                    ...currentForm,
                    sessionDuration: value as SelectOption,
                  }));
                  if (errors.sessionDuration) {
                    setErrors((currentErrors) => ({ ...currentErrors, sessionDuration: undefined }));
                  }
                }}
                variant="outlined"
              />
              <FieldError message={errors.sessionDuration} />
              <p className="mt-1 text-xs text-gray-500">
                Length of the live group discussion. Post-session survey time is added separately.
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
            This is a single shared group session — scheduling will let participants confirm or vote on the session time.
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
        <SidebarCard title="Focus Group Summary">
          <SummaryRow label="Target group size" value={`${form.targetGroupSize} participants`} />
          <SummaryRow label="Session duration" value={form.sessionDuration?.label ?? 'Not set'} />
          <SummaryRow label="Waiting room" value={form.enableWaitingRoom ? 'Enabled' : 'Disabled'} />
          <SummaryRow label="Observer access" value={form.allowObservers ? 'Enabled' : 'Disabled'} />
          <SummaryRow label="NDA required" value={form.attachNda ? 'Yes' : 'No'} />
        </SidebarCard>

        <SidebarCard title="Group Size Guidance">
          <div className="inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
            {guidance.label}
          </div>
          <p className="mt-3 text-xs leading-5 text-gray-600">{guidance.description}</p>
        </SidebarCard>
      </aside>
    </div>
  );
}
