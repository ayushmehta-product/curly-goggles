'use client';

import { useState, type ReactNode } from 'react';
import dynamic from 'next/dynamic';

const WuButton = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuButton })),
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

export interface SelectOption {
  value: string;
  label: string;
}

export interface BasicsFormState {
  studyName: string;
  targetParticipants: number;
  sessionDuration: SelectOption;
}

interface BasicsStepProps {
  value: BasicsFormState;
  onChange: (value: BasicsFormState) => void;
  onCancel: () => void;
  onSaveDraft: () => void;
  onContinue: () => void;
}

export const SESSION_DURATION_OPTIONS: SelectOption[] = [
  { value: '30', label: '30 mins' },
  { value: '45', label: '45 mins' },
  { value: '60', label: '60 mins' },
  { value: '90', label: '90 mins' },
  { value: '120', label: '120 mins' },
];

export const DEFAULT_BASICS_FORM: BasicsFormState = {
  studyName: '',
  targetParticipants: 6,
  sessionDuration: SESSION_DURATION_OPTIONS[2],
};

type ValidationErrors = Partial<Record<'studyName' | 'sessionDuration', string>>;

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-red-600">{message}</p>;
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

function getGroupSizeGuidance(size: number) {
  if (size <= 5) {
    return 'Smaller groups surface individual perspectives more clearly and are easier to moderate.';
  }
  if (size <= 8) {
    return 'A balanced size for lively discussion while still giving everyone room to speak.';
  }
  return 'Larger groups generate more viewpoints but need firmer moderation to keep discussion on track.';
}

export function BasicsStep({ value, onChange, onCancel, onSaveDraft, onContinue }: BasicsStepProps) {
  const [errors, setErrors] = useState<ValidationErrors>({});

  function validateForm() {
    const nextErrors: ValidationErrors = {};
    if (!value.studyName.trim()) {
      nextErrors.studyName = 'Focus group name is required.';
    }
    if (!value.sessionDuration) {
      nextErrors.sessionDuration = 'Session duration is required.';
    }
    setErrors(nextErrors);
    return nextErrors;
  }

  function handleContinue() {
    const nextErrors = validateForm();
    if (Object.keys(nextErrors).length > 0) return;
    onContinue();
  }

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="border-b border-gray-100 px-5 py-3">
          <h2 className="text-base font-semibold text-gray-900">Basics</h2>
          <p className="mt-1 text-sm text-gray-500">
            Set the foundational details for this focus group.
          </p>
        </div>

        <div className="space-y-4 p-5">
          <div>
            <WuInput
              Label="Study Name"
              variant="outlined"
              placeholder="e.g. Checkout Redesign Reaction Group"
              value={value.studyName}
              onChange={(event) => {
                onChange({ ...value, studyName: event.target.value });
                if (errors.studyName) setErrors((current) => ({ ...current, studyName: undefined }));
              }}
            />
            <FieldError message={errors.studyName} />
            <p className="mt-1 text-xs text-gray-500">
              Use the title moderators and observers will recognize on the schedule.
            </p>
          </div>

          <div>
            <WuStepper
              Label="Number of Participants"
              min={3}
              max={15}
              value={value.targetParticipants}
              onChange={(nextValue) => onChange({ ...value, targetParticipants: nextValue })}
            />
            <p className="mt-1 text-xs text-gray-500">
              Target group size for the shared session. Also sets the quorum used to auto-lock
              scheduling once this many participants confirm the same time or slot.
            </p>
          </div>

          <div>
            <WuSelect
              Label="Session Duration"
              data={SESSION_DURATION_OPTIONS}
              accessorKey={{ value: 'value', label: 'label' }}
              value={value.sessionDuration}
              onSelect={(nextValue) => {
                onChange({ ...value, sessionDuration: nextValue as SelectOption });
                if (errors.sessionDuration) setErrors((current) => ({ ...current, sessionDuration: undefined }));
              }}
              variant="outlined"
            />
            <FieldError message={errors.sessionDuration} />
            <p className="mt-1 text-xs text-gray-500">
              Length of the live group discussion. Post-session survey time is added separately.
            </p>
          </div>
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
          <SummaryRow label="Group size" value={`${value.targetParticipants} participants`} />
          <SummaryRow label="Session duration" value={value.sessionDuration?.label ?? 'Not set'} />
        </SidebarCard>

        <SidebarCard title="Group Size Guidance">
          <p className="text-xs leading-5 text-gray-600">{getGroupSizeGuidance(value.targetParticipants)}</p>
        </SidebarCard>
      </aside>
    </div>
  );
}
