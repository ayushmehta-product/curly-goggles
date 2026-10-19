'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useWuShowToast } from '@npm-questionpro/wick-ui-lib';
import { PageHeader } from '@/components/ui/PageHeader';
import { StudySetupStep } from '@/components/usability-tests/create/StudySetupStep';
import { LinksStep } from '@/components/usability-tests/create/LinksStep';
import { AudienceStep } from '@/components/usability-tests/create/AudienceStep';
import { TeamStep } from '@/components/idi-studies/create/TeamStep';
import { SchedulingStep } from '@/components/idi-studies/create/SchedulingStep';
import { TaskScriptStep } from '@/components/usability-tests/create/TaskScriptStep';
import { PostSessionStep } from '@/components/focus-group-studies/create/PostSessionStep';
import { ReviewPublishStep } from '@/components/usability-tests/create/ReviewPublishStep';
import { pageFromUrl, type SitePage } from '@/data/site-page-utils';
import {
  applyDefaultStartPages,
  DEFAULT_CREATE_DRAFT,
  getTaskMapping,
  loadCreateDraft,
  pageCatalogUrl,
  saveCreateDraft,
  setTaskMapping,
  type UsabilityCreateDraft,
  type UsabilitySurface,
} from '@/data/usability-create-storage';

const WIZARD_STEPS = [
  'Study setup',
  'Links',
  'Audience',
  'Team',
  'Scheduling',
  'Discussion guide',
  'Post-session',
  'Review & publish',
];

function stepFromQuery(stepParam: string | null): number {
  if (stepParam === 'review') return 8;
  if (stepParam === 'post-session') return 7;
  if (stepParam === 'discussion-guide') return 6;
  if (stepParam === 'scheduling') return 5;
  if (stepParam === 'team') return 4;
  if (stepParam === 'audience') return 3;
  if (stepParam === 'links') return 2;
  return 1;
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
  const [draft, setDraft] = useState<UsabilityCreateDraft>(DEFAULT_CREATE_DRAFT);
  const [hydrated, setHydrated] = useState(false);
  const [fetchingVariantId, setFetchingVariantId] = useState<string | null>(null);

  useEffect(() => {
    setDraft(loadCreateDraft());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveCreateDraft(draft);
  }, [draft, hydrated]);

  const currentStep = stepFromQuery(searchParams.get('step'));

  const pageHeader =
    currentStep === 8
      ? { title: 'Review & publish', description: 'Check variants, the even split, and that each task has a start and an observable success.' }
      : currentStep === 7
        ? { title: 'Post-session', description: 'Ask how the task felt after people try to reach success.' }
        : currentStep === 6
          ? { title: 'Discussion guide', description: 'Give people a goal. Then mark where the task starts and what counts as success.' }
          : currentStep === 5
            ? { title: 'Scheduling', description: 'Configure participant booking availability.' }
            : currentStep === 4
              ? { title: 'Study team', description: 'Assign moderators and observers for this test.' }
              : currentStep === 3
                ? { title: 'Audience', description: 'Choose who joins, then see how testers are randomly assigned across designs.' }
                : currentStep === 2
                  ? { title: 'Links', description: 'Connect each design so we can list pages and record where people go.' }
                  : { title: 'Create usability test', description: 'Name the study and describe the goal people should try to complete.' };

  function nav(step?: string) {
    router.push(step ? `/usability-tests/create?step=${step}` : '/usability-tests/create');
  }

  function handlePublish() {
    showToast({ message: 'Usability test launched.', variant: 'success' });
    router.push('/usability-tests/ut-001');
  }

  function applySurfaceDefaults(next: UsabilityCreateDraft, surface: UsabilitySurface | null): UsabilityCreateDraft {
    if (surface !== 'figma') return next;
    return {
      ...next,
      variants: next.variants.map((variant) => ({
        ...variant,
        pages: [],
        fetchError: null,
        fetchBlocked: false,
      })),
      tasks: next.tasks.map((task) => {
        let updated = task;
        for (const variant of next.variants) {
          const mapping = getTaskMapping(updated, variant.id);
          updated = setTaskMapping(updated, variant.id, {
            ...mapping,
            successMode: 'participant-done',
            successPageId: null,
            successLandmarkId: null,
          });
        }
        return updated;
      }),
    };
  }

  function handleDraftChange(patch: Partial<UsabilityCreateDraft>) {
    setDraft((prev) => {
      const next = { ...prev, ...patch };
      if (patch.surface !== undefined && patch.surface !== prev.surface) {
        return applySurfaceDefaults(next, patch.surface);
      }
      return next;
    });
  }

  async function fetchSitePages(url: string, markVerified: boolean, variantId: string) {
    setFetchingVariantId(variantId);
    try {
      const response = await fetch('/api/site-pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const json = (await response.json()) as {
        pages?: SitePage[];
        error?: string;
        blocked?: boolean;
      };
      if (!response.ok || !json.pages) {
        let fallbackPages: SitePage[] = [];
        try {
          const parsed = new URL(/^https?:\/\//i.test(url) ? url : `https://${url}`);
          fallbackPages = [pageFromUrl(parsed)];
        } catch {
          fallbackPages = [];
        }
        setDraft((prev) => ({
          ...prev,
          variants: prev.variants.map((variant) =>
            variant.id === variantId
              ? {
                  ...variant,
                  pages: fallbackPages,
                  fetchError: json.error ?? 'Could not list pages from this website.',
                  fetchBlocked: true,
                  website: markVerified && prev.surface === 'website' ? { ...variant.website, verified: true } : variant.website,
                  saas: markVerified && prev.surface === 'saas' ? { ...variant.saas, verified: true } : variant.saas,
                }
              : variant
          ),
          tasks: applyDefaultStartPages(prev.tasks, fallbackPages, variantId),
        }));
        showToast({
          message: json.error ?? 'Could not list pages. You can add page URLs in the discussion guide.',
          variant: 'error',
        });
        return;
      }

      const pages = json.pages;
      setDraft((prev) => ({
        ...prev,
        variants: prev.variants.map((variant) =>
          variant.id === variantId
            ? {
                ...variant,
                pages,
                fetchError: json.error ?? null,
                fetchBlocked: Boolean(json.blocked),
                website: markVerified && prev.surface === 'website' ? { ...variant.website, verified: true } : variant.website,
                saas: markVerified && prev.surface === 'saas' ? { ...variant.saas, verified: true } : variant.saas,
              }
            : variant
        ),
        tasks: applyDefaultStartPages(prev.tasks, pages, variantId),
      }));
      if (json.blocked) {
        showToast({
          message: json.error ?? 'This website blocked the request. You can add page URLs by hand.',
          variant: 'error',
        });
      } else {
        showToast({
          message: `Listed ${pages.length} page${pages.length === 1 ? '' : 's'} from this site.`,
          variant: 'success',
        });
      }
    } catch {
      showToast({ message: 'Could not fetch that website.', variant: 'error' });
    } finally {
      setFetchingVariantId(null);
    }
  }

  async function handleVerifyLinks(variantId: string) {
    if (draft.surface === 'figma') return;
    const variant = draft.variants.find((item) => item.id === variantId);
    if (!variant) return;
    const url = pageCatalogUrl(variant, draft.surface);
    if (!url) {
      showToast({ message: 'Enter a website URL first.', variant: 'error' });
      return;
    }
    await fetchSitePages(url, true, variantId);
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
          onSaveDraft={() => showToast({ message: 'Draft saved', variant: 'success' })}
          onContinue={() => nav('links')}
        />
      )}
      {currentStep === 2 && (
        <LinksStep
          draft={draft}
          fetchingVariantId={fetchingVariantId}
          onDraftChange={handleDraftChange}
          onVerify={handleVerifyLinks}
          onBack={() => nav()}
          onSaveDraft={() => showToast({ message: 'Draft saved', variant: 'success' })}
          onContinue={() => nav('audience')}
        />
      )}
      {currentStep === 3 && (
        <AudienceStep
          draft={draft}
          onDraftChange={handleDraftChange}
          onBack={() => nav('links')}
          onSaveDraft={() => showToast({ message: 'Draft saved', variant: 'success' })}
          onContinue={() => nav('team')}
        />
      )}
      {currentStep === 4 && (
        <TeamStep
          onBack={() => nav('audience')}
          onSaveDraft={() => showToast({ message: 'Draft saved', variant: 'success' })}
          onContinue={() => nav('scheduling')}
        />
      )}
      {currentStep === 5 && (
        <SchedulingStep
          onBack={() => nav('team')}
          onSaveDraft={() => showToast({ message: 'Draft saved', variant: 'success' })}
          onContinue={() => nav('discussion-guide')}
        />
      )}
      {currentStep === 6 && (
        <TaskScriptStep
          draft={draft}
          fetchingPages={Boolean(fetchingVariantId)}
          onDraftChange={handleDraftChange}
          onRefreshPages={handleVerifyLinks}
          onBack={() => nav('scheduling')}
          onSaveDraft={() => showToast({ message: 'Draft saved', variant: 'success' })}
          onContinue={() => nav('post-session')}
        />
      )}
      {currentStep === 7 && (
        <PostSessionStep
          onBack={() => nav('discussion-guide')}
          onSaveDraft={() => showToast({ message: 'Draft saved', variant: 'success' })}
          onContinue={() => nav('review')}
        />
      )}
      {currentStep === 8 && (
        <ReviewPublishStep
          draft={draft}
          onBack={() => nav('post-session')}
          onSaveDraft={() => showToast({ message: 'Draft saved', variant: 'success' })}
          onPublish={handlePublish}
        />
      )}
    </div>
  );
}
