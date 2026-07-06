'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useWuShowToast } from '@npm-questionpro/wick-ui-lib';
import { PageHeader } from '@/components/ui/PageHeader';
import { StudySetupStep } from '@/components/idi-studies/create/StudySetupStep';
import { TeamStep } from '@/components/idi-studies/create/TeamStep';
import { SchedulingStep } from '@/components/idi-studies/create/SchedulingStep';
import { DiscussionGuideStep } from '@/components/idi-studies/create/DiscussionGuideStep';
import { ReviewPublishStep } from '@/components/idi-studies/create/ReviewPublishStep';

const WIZARD_STEPS = [
  'Study Setup',
  'Team',
  'Scheduling',
  'Discussion Guide',
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

export default function CreateStudyPlaceholderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useWuShowToast();
  const currentStepParam = searchParams.get('step');
  const currentStep =
    currentStepParam === 'review'
      ? 5
      : currentStepParam === 'discussion-guide'
        ? 4
        : currentStepParam === 'scheduling'
          ? 3
          : currentStepParam === 'team'
            ? 2
            : 1;
  const pageHeader =
    currentStep === 5
      ? {
          title: 'Review & Publish',
          description: 'Confirm this moderated study is operationally ready to launch.',
        }
      : currentStep === 4
      ? {
          title: 'Discussion Guide',
          description: 'Build a structured interview guide for live moderated sessions.',
        }
      : currentStep === 3
        ? {
            title: 'Scheduling',
            description: 'Configure participant booking availability for moderated interviews.',
          }
        : currentStep === 2
      ? {
          title: 'Study Team',
          description: 'Assign moderators and observers for this moderated study.',
        }
        : {
            title: 'Create Moderated Study',
            description: 'Set up the core configuration for your moderated research study.',
          };

  function handleSaveDraft() {
    showToast({ message: 'Moderated study draft saved', variant: 'success' });
  }

  function handleSaveTeamDraft() {
    showToast({ message: 'Study team draft saved', variant: 'success' });
  }

  function handleSaveSchedulingDraft() {
    showToast({ message: 'Scheduling draft saved', variant: 'success' });
  }

  function handleSaveDiscussionGuideDraft() {
    showToast({ message: 'Discussion guide draft saved', variant: 'success' });
  }

  function handleSaveReviewDraft() {
    showToast({ message: 'Review draft saved', variant: 'success' });
  }

  function handlePublishStudy() {
    showToast({ message: 'Moderated Study published successfully.', variant: 'success' });
    router.push('/idi-studies/idi-001');
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Link
        href="/idi-studies"
        className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
      >
        <span className="wm-arrow-back text-base" /> Back to IDI Studies
      </Link>
      <PageHeader title={pageHeader.title} description={pageHeader.description} />

      <StepperProgress currentStep={currentStep} />

      {currentStep === 2 ? (
        <TeamStep
          onBack={() => router.push('/idi-studies/create')}
          onSaveDraft={handleSaveTeamDraft}
          onContinue={() => router.push('/idi-studies/create?step=scheduling')}
        />
      ) : currentStep === 3 ? (
        <SchedulingStep
          onBack={() => router.push('/idi-studies/create?step=team')}
          onSaveDraft={handleSaveSchedulingDraft}
          onContinue={() => router.push('/idi-studies/create?step=discussion-guide')}
        />
      ) : currentStep === 4 ? (
        <DiscussionGuideStep
          onBack={() => router.push('/idi-studies/create?step=scheduling')}
          onSaveDraft={handleSaveDiscussionGuideDraft}
          onContinue={() => router.push('/idi-studies/create?step=review')}
        />
      ) : currentStep === 5 ? (
        <ReviewPublishStep
          onBack={() => router.push('/idi-studies/create?step=discussion-guide')}
          onSaveDraft={handleSaveReviewDraft}
          onPublish={handlePublishStudy}
        />
      ) : (
        <StudySetupStep
          onCancel={() => router.push('/idi-studies')}
          onSaveDraft={handleSaveDraft}
          onContinue={() => router.push('/idi-studies/create?step=team')}
        />
      )}
    </div>
  );
}
