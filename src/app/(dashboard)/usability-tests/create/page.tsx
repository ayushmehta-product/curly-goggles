'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useWuShowToast } from '@npm-questionpro/wick-ui-lib';
import { PageHeader } from '@/components/ui/PageHeader';
import { StudySetupStep } from '@/components/usability-tests/create/StudySetupStep';
import { LinksStep } from '@/components/usability-tests/create/LinksStep';
import { TeamStep } from '@/components/idi-studies/create/TeamStep';
import { SchedulingStep } from '@/components/idi-studies/create/SchedulingStep';
import { TaskScriptStep } from '@/components/usability-tests/create/TaskScriptStep';
import { PostSessionStep } from '@/components/focus-group-studies/create/PostSessionStep';
import { ReviewPublishStep } from '@/components/usability-tests/create/ReviewPublishStep';

const WIZARD_STEPS = [
  'Study Setup',
  'Links',
  'Team',
  'Scheduling',
  'Discussion Guide',
  'Post-Session',
  'Review & Publish',
];

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
                  className={`hidden h-px w-6 shrink-0 md:block ${
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

export default function CreateUsabilityTestPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useWuShowToast();

  const stepParam = searchParams.get('step');
  const currentStep =
    stepParam === 'review'
      ? 7
      : stepParam === 'post-session'
        ? 6
        : stepParam === 'discussion-guide'
          ? 5
          : stepParam === 'scheduling'
            ? 4
            : stepParam === 'team'
              ? 3
              : stepParam === 'links'
                ? 2
                : 1;

  const pageHeader =
    currentStep === 7
      ? { title: 'Review & Publish', description: 'Confirm your usability test is ready to launch.' }
      : currentStep === 6
        ? { title: 'Post-Session', description: 'Collect quick feedback and set the end-of-session experience.' }
        : currentStep === 5
          ? { title: 'Discussion Guide', description: 'Define the tasks participants will complete during the test.' }
          : currentStep === 4
            ? { title: 'Scheduling', description: 'Configure participant booking availability.' }
            : currentStep === 3
              ? { title: 'Study Team', description: 'Assign moderators and observers for this test.' }
              : currentStep === 2
                ? { title: 'Links', description: 'Choose your testing surface and set up behaviour tracking.' }
                : { title: 'Create Usability Test', description: 'Set up the core configuration for your usability test.' };

  function nav(step?: string) {
    router.push(step ? `/usability-tests/create?step=${step}` : '/usability-tests/create');
  }

  function handlePublish() {
    showToast({ message: 'Usability test launched successfully.', variant: 'success' });
    router.push('/usability-tests/ut-001');
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Link
        href="/usability-tests"
        className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
      >
        <span className="wm-arrow-back text-base" /> Back to usability tests
      </Link>
      <PageHeader title={pageHeader.title} description={pageHeader.description} />
      <StepperProgress currentStep={currentStep} />

      {currentStep === 1 && (
        <StudySetupStep
          onCancel={() => router.push('/usability-tests')}
          onSaveDraft={() => showToast({ message: 'Usability test draft saved', variant: 'success' })}
          onContinue={() => nav('links')}
        />
      )}
      {currentStep === 2 && (
        <LinksStep
          onBack={() => nav()}
          onSaveDraft={() => showToast({ message: 'Links draft saved', variant: 'success' })}
          onContinue={() => nav('team')}
        />
      )}
      {currentStep === 3 && (
        <TeamStep
          onBack={() => nav('links')}
          onSaveDraft={() => showToast({ message: 'Team draft saved', variant: 'success' })}
          onContinue={() => nav('scheduling')}
        />
      )}
      {currentStep === 4 && (
        <SchedulingStep
          onBack={() => nav('team')}
          onSaveDraft={() => showToast({ message: 'Scheduling draft saved', variant: 'success' })}
          onContinue={() => nav('discussion-guide')}
        />
      )}
      {currentStep === 5 && (
        <TaskScriptStep
          onBack={() => nav('scheduling')}
          onSaveDraft={() => showToast({ message: 'Discussion guide draft saved', variant: 'success' })}
          onContinue={() => nav('post-session')}
        />
      )}
      {currentStep === 6 && (
        <PostSessionStep
          onBack={() => nav('discussion-guide')}
          onSaveDraft={() => showToast({ message: 'Post-session draft saved', variant: 'success' })}
          onContinue={() => nav('review')}
        />
      )}
      {currentStep === 7 && (
        <ReviewPublishStep
          onBack={() => nav('post-session')}
          onSaveDraft={() => showToast({ message: 'Review draft saved', variant: 'success' })}
          onPublish={handlePublish}
        />
      )}
    </div>
  );
}
