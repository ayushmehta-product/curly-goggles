'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useWuShowToast } from '@npm-questionpro/wick-ui-lib';
import { PageHeader } from '@/components/ui/PageHeader';
import { StudySetupStep } from '@/components/focus-group-studies/create/StudySetupStep';
import { TeamStep } from '@/components/idi-studies/create/TeamStep';
import {
  SchedulingStep,
  getDefaultSchedulingSnapshot,
  type SchedulingSnapshot,
} from '@/components/focus-group-studies/create/SchedulingStep';
import { DiscussionGuideStep } from '@/components/focus-group-studies/create/DiscussionGuideStep';
import { PostSessionStep } from '@/components/focus-group-studies/create/PostSessionStep';
import { ReviewStep } from '@/components/focus-group-studies/create/ReviewStep';
import {
  DEFAULT_BASICS_FORM,
  type BasicsFormState,
} from '@/components/focus-group-studies/create/BasicsStep';

const WIZARD_STEPS = [
  'Study Setup',
  'Team',
  'Scheduling',
  'Discussion Guide',
  'Post-Session',
  'Review & Publish',
];

const STEP_PARAM_TO_NUMBER: Record<string, number> = {
  team: 2,
  scheduling: 3,
  'discussion-guide': 4,
  'post-session': 5,
  review: 6,
};

const STEP_HEADERS: Record<number, { title: string; description: string }> = {
  1: {
    title: 'Create a New Focus Group',
    description: 'Set up the core configuration for this focus group.',
  },
  2: {
    title: 'Study Team',
    description: 'Assign moderators and observers for this focus group session.',
  },
  3: {
    title: 'Scheduling',
    description: 'Configure how the single shared session gets scheduled.',
  },
  4: {
    title: 'Discussion Guide',
    description: 'Build the discussion guide moderators will follow live.',
  },
  5: {
    title: 'Post-Session',
    description: 'Collect quick feedback and set the end-of-session experience.',
  },
  6: {
    title: 'Review & Publish',
    description: 'Confirm this focus group is ready to launch.',
  },
};

function getStepFromParam(param: string | null) {
  if (!param) return 1;
  return STEP_PARAM_TO_NUMBER[param] ?? 1;
}

function getHrefForStep(step: number) {
  const paramMap: Record<number, string | null> = {
    1: null,
    2: 'team',
    3: 'scheduling',
    4: 'discussion-guide',
    5: 'post-session',
    6: 'review',
  };
  const param = paramMap[step];
  return param ? `/focus-group-studies/create?step=${param}` : '/focus-group-studies/create';
}

function StepperProgress({ currentStep }: { currentStep: number }) {
  return (
    <div className="mb-4 rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        {WIZARD_STEPS.map((step, index) => {
          const stepNumber = index + 1;
          const isCurrent = stepNumber === currentStep;
          const isComplete = stepNumber < currentStep;
          const isFuture = stepNumber > currentStep;

          return (
            <div key={step} className="flex flex-1 items-center gap-3">
              <div
                className={`flex min-w-0 flex-1 items-center gap-3 rounded-md px-2 py-2 ${
                  isCurrent ? 'border border-blue-200 bg-blue-50' : ''
                }`}
              >
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                    isComplete
                      ? 'bg-blue-600 text-white'
                      : isCurrent
                        ? 'bg-blue-600 text-white shadow-sm ring-4 ring-blue-100'
                        : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {isComplete ? <span className="wm-check text-sm" /> : stepNumber}
                </span>
                <div className="min-w-0">
                  <p
                    className={`truncate text-sm font-semibold ${
                      isFuture ? 'text-gray-400' : isCurrent ? 'text-blue-800' : 'text-gray-800'
                    }`}
                  >
                    {step}
                  </p>
                  {(isCurrent || isComplete) && (
                    <p className={`text-xs ${isCurrent ? 'text-blue-600' : 'text-gray-500'}`}>
                      {isCurrent ? 'In progress' : 'Done'}
                    </p>
                  )}
                </div>
              </div>
              {index < WIZARD_STEPS.length - 1 && (
                <span
                  className={`hidden h-px w-8 shrink-0 md:block ${
                    isComplete ? 'bg-blue-300' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function CreateFocusGroupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useWuShowToast();

  const currentStep = getStepFromParam(searchParams.get('step'));
  const pageHeader = STEP_HEADERS[currentStep];

  const [basics, setBasics] = useState<BasicsFormState>(DEFAULT_BASICS_FORM);
  const [scheduling, setScheduling] = useState<SchedulingSnapshot>(getDefaultSchedulingSnapshot);

  function goToStep(step: number) {
    router.push(getHrefForStep(step));
  }

  function handleSaveDraft(section: string) {
    showToast({ message: `${section} draft saved`, variant: 'success' });
  }

  function handlePublish() {
    showToast({ message: 'Focus group published successfully.', variant: 'success' });
    router.push('/focus-group-studies/fg-001');
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Link
        href="/focus-group-studies"
        className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
      >
        <span className="wm-arrow-back text-base" /> Back to focus groups
      </Link>
      <PageHeader title={pageHeader.title} description={pageHeader.description} />

      <StepperProgress currentStep={currentStep} />

      {currentStep === 2 ? (
        <TeamStep
          onBack={() => goToStep(1)}
          onSaveDraft={() => handleSaveDraft('Team')}
          onContinue={() => goToStep(3)}
        />
      ) : currentStep === 3 ? (
        <SchedulingStep
          quorumTarget={basics.targetParticipants}
          onSchedulingChange={setScheduling}
          onBack={() => goToStep(2)}
          onSaveDraft={() => handleSaveDraft('Scheduling')}
          onContinue={() => goToStep(4)}
        />
      ) : currentStep === 4 ? (
        <DiscussionGuideStep
          onBack={() => goToStep(3)}
          onSaveDraft={() => handleSaveDraft('Discussion Guide')}
          onContinue={() => goToStep(5)}
        />
      ) : currentStep === 5 ? (
        <PostSessionStep
          onBack={() => goToStep(4)}
          onSaveDraft={() => handleSaveDraft('Post-session')}
          onContinue={() => goToStep(6)}
        />
      ) : currentStep === 6 ? (
        <ReviewStep
          basics={basics}
          scheduling={scheduling}
          onBack={() => goToStep(5)}
          onSaveDraft={() => handleSaveDraft('Review')}
          onPublish={handlePublish}
        />
      ) : (
        <StudySetupStep
          onCancel={() => router.push('/focus-group-studies')}
          onSaveDraft={() => handleSaveDraft('Study Setup')}
          onContinue={() => goToStep(2)}
        />
      )}
    </div>
  );
}
