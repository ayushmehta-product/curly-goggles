'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';

const WuButton = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuButton })),
  { ssr: false }
);
const WuInput = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuInput })),
  { ssr: false }
);
const WuTextarea = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuTextarea })),
  { ssr: false }
);
const WuStepper = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuStepper })),
  { ssr: false }
);
const WuSelect = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuSelect })),
  { ssr: false }
);

interface StudySetupStepProps {
  onCancel: () => void;
  onSaveDraft: () => void;
  onContinue: () => void;
}

interface SelectOption { value: string; label: string; }

const SESSION_DURATION_OPTIONS: SelectOption[] = [
  { value: '10', label: '10 mins' },
  { value: '15', label: '15 mins' },
  { value: '20', label: '20 mins' },
  { value: '30', label: '30 mins' },
];

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-gray-100 py-2 last:border-0">
      <span className="text-xs text-gray-500">{label}</span>
      <span className="max-w-[160px] truncate text-right text-xs font-semibold text-gray-800">{value}</span>
    </div>
  );
}

export function StudySetupStep({ onCancel, onSaveDraft, onContinue }: StudySetupStepProps) {
  const [studyName, setStudyName] = useState('');
  const [context, setContext] = useState('');
  const [targetParticipants, setTargetParticipants] = useState(12);
  const [taskDuration, setTaskDuration] = useState<SelectOption | null>(SESSION_DURATION_OPTIONS[2]);
  const [nameError, setNameError] = useState('');

  function handleContinue() {
    if (!studyName.trim()) {
      setNameError('Test name is required.');
      return;
    }
    onContinue();
  }

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="border-b border-gray-100 px-5 py-3">
          <h2 className="text-base font-semibold text-gray-900">Study Setup</h2>
          <p className="mt-1 text-sm text-gray-500">
            Define the test name, task context, and participant goal.
          </p>
        </div>

        <div className="space-y-4 p-5">
          <div>
            <WuInput
              Label="Test Name"
              variant="outlined"
              placeholder="e.g. Checkout Redesign Usability Test"
              value={studyName}
              invalid={!!nameError}
              onChange={(e) => {
                setStudyName(e.target.value);
                if (nameError) setNameError('');
              }}
            />
            {nameError && <p className="mt-1 text-xs text-red-600">{nameError}</p>}
            <p className="mt-1 text-xs text-gray-500">
              Use a name researchers and stakeholders will recognise in reports and schedules.
            </p>
          </div>

          <div>
            <WuTextarea
              Label="Task Description"
              variant="outlined"
              placeholder="Describe what participants will be asked to do — e.g. 'Find and complete a purchase using the new checkout flow.'"
              value={context}
              rows={3}
              onChange={(e) => setContext(e.target.value)}
            />
            <p className="mt-1 text-xs text-gray-500">
              Optional. Shown to participants at the start of their session and used as a benchmark in analytics.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <WuStepper
                Label="Target Participants"
                min={1}
                max={200}
                value={targetParticipants}
                onChange={(v) => setTargetParticipants(v)}
              />
              <p className="mt-1 text-xs text-gray-500">
                Total number of completed sessions planned for this test.
              </p>
            </div>
            <div>
              <WuSelect
                Label="Expected Task Duration"
                data={SESSION_DURATION_OPTIONS}
                accessorKey={{ value: 'value', label: 'label' }}
                value={taskDuration}
                onSelect={(v) => setTaskDuration(v as SelectOption)}
                variant="outlined"
              />
              <p className="mt-1 text-xs text-gray-500">
                Helps with scheduling and analytics benchmarks.
              </p>
            </div>
          </div>

          <div className="rounded-md border border-blue-100 bg-blue-50 px-3 py-2 text-xs leading-5 text-blue-800">
            Next step: configure the testing surface (Website, SaaS, or Figma Prototype) and set up tracking in the <strong>Links</strong> step.
          </div>
        </div>

        <div className="sticky bottom-0 z-20 flex items-center justify-between border-t border-gray-100 bg-white px-5 py-3 shadow-[0_-8px_20px_rgba(15,23,42,0.06)]">
          <WuButton variant="link" onClick={onCancel}>Cancel</WuButton>
          <div className="flex items-center gap-2">
            <WuButton variant="secondary" onClick={onSaveDraft}>Save Draft</WuButton>
            <WuButton Icon={<span className="wm-arrow-forward" />} iconPosition="right" onClick={handleContinue}>
              Continue
            </WuButton>
          </div>
        </div>
      </div>

      <aside className="space-y-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900">Test Summary</h3>
          <div className="mt-3">
            <SummaryRow label="Target participants" value={String(targetParticipants)} />
            <SummaryRow label="Task duration" value={taskDuration?.label ?? 'Not set'} />
            <SummaryRow label="Testing surface" value="Not yet configured" />
            <SummaryRow label="Tracking status" value="Not connected" />
          </div>
        </div>
        <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
          <p className="text-sm font-semibold text-blue-900">Why usability tests?</p>
          <p className="mt-2 text-xs leading-5 text-blue-800">
            Usability tests reveal exactly where users struggle, click aimlessly, or abandon tasks — before you ship. Pair heatmaps and scroll depth with moderated insights for the richest picture.
          </p>
        </div>
      </aside>
    </div>
  );
}
