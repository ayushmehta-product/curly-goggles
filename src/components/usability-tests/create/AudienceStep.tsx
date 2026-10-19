'use client';

import dynamic from 'next/dynamic';
import { SelectableCard } from '@/components/ui/SelectableCard';
import {
  DEMOGRAPHIC_FIELDS,
  RECRUITMENT_LABELS,
  RECRUITMENT_OPTIONS,
  SCREENER_TYPE_DESCRIPTIONS,
  SCREENER_TYPE_LABELS,
  type RecruitmentMethod,
  type ScreenerItem,
  type ScreenerType,
} from '@/data/mock-usability-audience';
import {
  evenSplit,
  formatEvenSplit,
  type AudienceDraft,
  type UsabilityCreateDraft,
} from '@/data/usability-create-storage';

const WuButton = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuButton })),
  { ssr: false }
);
const WuCheckbox = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuCheckbox })),
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
const WuTextarea = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuTextarea })),
  { ssr: false }
);

interface AudienceStepProps {
  draft: UsabilityCreateDraft;
  onDraftChange: (patch: Partial<UsabilityCreateDraft>) => void;
  onBack: () => void;
  onSaveDraft: () => void;
  onContinue: () => void;
}

const SCREENER_TYPE_BADGE_STYLES: Record<ScreenerType, string> = {
  technical: 'bg-blue-50 text-blue-700',
  'verbal-response': 'bg-purple-50 text-purple-700',
  'survey-question': 'bg-green-50 text-green-700',
};

function createScreenerId() {
  return `screener-${Date.now()}-${Math.round(Math.random() * 1000)}`;
}

function fulfillmentCopy(goal: number, method: RecruitmentMethod, filterCount: number): string {
  if (method === 'own') return 'You send the link — fulfillment is on your timeline.';
  if (method === 'custom') return 'Your panel members receive the invite as soon as you launch.';
  if (goal <= 10 && filterCount === 0) return 'Est. fulfillment time: 1–2 days';
  if (goal <= 20 && filterCount <= 2) return 'Est. fulfillment time: 2–4 days';
  if (filterCount >= 4) return 'Est. fulfillment time: 5–8 days';
  return 'Est. fulfillment time: 3–6 days';
}

function ScreenerRow({
  item,
  onChange,
  onDelete,
}: {
  item: ScreenerItem;
  onChange: (prompt: string) => void;
  onDelete: () => void;
}) {
  return (
    <div className="group/screener flex items-start gap-2 rounded-lg border border-gray-200 bg-white p-3">
      <div className="min-w-0 flex-1 space-y-2">
        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${SCREENER_TYPE_BADGE_STYLES[item.type]}`}>
          {SCREENER_TYPE_LABELS[item.type]}
        </span>
        <WuTextarea value={item.prompt} rows={2} onChange={(event) => onChange(event.target.value)} />
      </div>
      <WuButton
        variant="iconOnly"
        size="sm"
        color="error"
        aria-label="Delete screener"
        Icon={<span className="wm-delete text-sm" />}
        className="mt-1 shrink-0 text-gray-400 opacity-0 transition group-hover/screener:opacity-100 hover:text-red-600"
        onClick={onDelete}
      />
    </div>
  );
}

export function AudienceStep({ draft, onDraftChange, onBack, onSaveDraft, onContinue }: AudienceStepProps) {
  const audience = draft.audience;
  const method = audience.method;
  const showDemographics = method === 'panel';
  const filterCount = Object.values(audience.demographics).filter((value) => value !== 'any').length;
  const split = evenSplit(audience.participantGoal, draft.variants.length);
  const splitLabel = formatEvenSplit(split);
  const fulfillment = fulfillmentCopy(audience.participantGoal, method, filterCount);
  const gaugePct = Math.min(100, Math.round((audience.participantGoal / 30) * 100));

  function patchAudience(patch: Partial<AudienceDraft>) {
    onDraftChange({ audience: { ...audience, ...patch } });
  }

  function addScreener(type: ScreenerType) {
    patchAudience({
      screeners: [...audience.screeners, { id: createScreenerId(), type, prompt: '' }],
    });
  }

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="space-y-4">
        <section className="rounded-lg border border-gray-200 bg-white">
          <div className="border-b border-gray-100 px-5 py-3">
            <h2 className="text-base font-semibold text-gray-900">Recruitment</h2>
            <p className="mt-1 text-sm text-gray-500">Choose how testers join this usability test.</p>
          </div>
          <div className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-3">
            {RECRUITMENT_OPTIONS.map((option) => (
              <SelectableCard
                key={option.value}
                title={option.title}
                description={option.description}
                icon={<span className={`${option.icon} text-xl`} />}
                isSelected={method === option.value}
                onClick={() => patchAudience({ method: option.value })}
              />
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-gray-200 bg-white">
          <div className="border-b border-gray-100 px-5 py-3">
            <h2 className="text-base font-semibold text-gray-900">How many testers</h2>
            <p className="mt-1 text-sm text-gray-500">This is the total for the test. Design variants split this number evenly.</p>
          </div>
          <div className="p-5">
            <div className="max-w-xs">
              <WuInput
                Label="Participant goal"
                variant="outlined"
                type="number"
                value={String(audience.participantGoal)}
                onChange={(event) => {
                  const next = Number(event.target.value);
                  patchAudience({ participantGoal: Number.isFinite(next) ? Math.max(1, Math.floor(next)) : 1 });
                }}
              />
            </div>
          </div>
        </section>

        {draft.variants.length > 1 && (
          <section className="rounded-lg border border-gray-200 bg-white">
            <div className="border-b border-gray-100 px-5 py-3">
              <h2 className="text-base font-semibold text-gray-900">Design variants</h2>
              <p className="mt-1 text-sm text-gray-500">
                Testers are randomly assigned to one design. The split is even, with any remainder going to the first variants.
              </p>
            </div>
            <div className="space-y-3 p-5">
              <p className="text-sm text-gray-800">
                About <span className="font-semibold">{splitLabel}</span> will try each design.
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {draft.variants.map((variant, index) => (
                  <div key={variant.id} className="rounded-md bg-gray-50 px-3 py-2">
                    <p className="text-sm font-semibold text-gray-900">{variant.name || `Variant ${index + 1}`}</p>
                    <p className="text-xs text-gray-500">{split[index]} testers</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {showDemographics && (
          <section className="rounded-lg border border-gray-200 bg-white">
            <div className="border-b border-gray-100 px-5 py-3">
              <h2 className="text-base font-semibold text-gray-900">Demographics</h2>
              <p className="mt-1 text-sm text-gray-500">Optional filters for the QuestionPro UX panel. Leave as any to keep the audience broad.</p>
            </div>
            <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2">
              {DEMOGRAPHIC_FIELDS.map((field) => {
                const selected = field.options.find((option) => option.value === audience.demographics[field.key]) ?? field.options[0];
                return (
                  <WuSelect
                    key={field.key}
                    Label={field.label}
                    data={field.options}
                    accessorKey={{ value: 'value', label: 'label' }}
                    value={selected}
                    onSelect={(value) => {
                      const option = value as { value: string };
                      patchAudience({
                        demographics: { ...audience.demographics, [field.key]: option.value },
                      });
                    }}
                    variant="outlined"
                  />
                );
              })}
            </div>
          </section>
        )}

        <section className="rounded-lg border border-gray-200 bg-white">
          <div className="border-b border-gray-100 px-5 py-3">
            <h2 className="text-base font-semibold text-gray-900">Screeners</h2>
            <p className="mt-1 text-sm text-gray-500">Qualify testers before they start. Add only what you need.</p>
          </div>
          <div className="space-y-3 p-5">
            <div className="flex flex-wrap gap-2">
              {(Object.keys(SCREENER_TYPE_LABELS) as ScreenerType[]).map((type) => (
                <WuButton key={type} variant="secondary" size="sm" onClick={() => addScreener(type)}>
                  {SCREENER_TYPE_LABELS[type]}
                </WuButton>
              ))}
            </div>
            <div className="space-y-2 text-xs text-gray-500">
              {(Object.keys(SCREENER_TYPE_DESCRIPTIONS) as ScreenerType[]).map((type) => (
                <p key={type}>
                  <span className="font-medium text-gray-700">{SCREENER_TYPE_LABELS[type]}.</span> {SCREENER_TYPE_DESCRIPTIONS[type]}
                </p>
              ))}
            </div>
            {audience.screeners.length === 0 ? (
              <p className="rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-500">No screeners yet.</p>
            ) : (
              <div className="space-y-2">
                {audience.screeners.map((item) => (
                  <ScreenerRow
                    key={item.id}
                    item={item}
                    onChange={(prompt) =>
                      patchAudience({
                        screeners: audience.screeners.map((screener) =>
                          screener.id === item.id ? { ...screener, prompt } : screener
                        ),
                      })
                    }
                    onDelete={() =>
                      patchAudience({
                        screeners: audience.screeners.filter((screener) => screener.id !== item.id),
                      })
                    }
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="rounded-lg border border-gray-200 bg-white">
          <div className="border-b border-gray-100 px-5 py-3">
            <h2 className="text-base font-semibold text-gray-900">NDA</h2>
            <p className="mt-1 text-sm text-gray-500">Optional. Testers see this before the first task.</p>
          </div>
          <div className="space-y-3 p-5">
            <label className="flex cursor-pointer items-start gap-2">
              <WuCheckbox
                checked={audience.requireNda}
                onChange={(checked) => patchAudience({ requireNda: checked, ndaCommit: checked ? audience.ndaCommit : false })}
              />
              <span className="text-sm text-gray-700">Require testers to accept an NDA</span>
            </label>
            {audience.requireNda && (
              <label className="flex cursor-pointer items-start gap-2 rounded-md bg-gray-50 p-3">
                <WuCheckbox
                  checked={audience.ndaCommit}
                  onChange={(checked) => patchAudience({ ndaCommit: checked })}
                />
                <span className="text-sm text-gray-700">
                  Make testers commit that they will not share what they see, including screenshots or recordings.
                </span>
              </label>
            )}
          </div>
        </section>

        <div className="sticky bottom-0 z-20 flex items-center justify-between rounded-lg border border-gray-200 bg-white px-5 py-3 shadow-[0_-8px_20px_rgba(15,23,42,0.06)]">
          <WuButton variant="secondary" onClick={onBack}>Back</WuButton>
          <div className="flex items-center gap-2">
            <WuButton variant="secondary" onClick={onSaveDraft}>Save draft</WuButton>
            <WuButton Icon={<span className="wm-arrow-forward" />} iconPosition="right" onClick={onContinue}>
              Continue
            </WuButton>
          </div>
        </div>
      </div>

      <aside className="space-y-4 xl:sticky xl:top-4 xl:self-start">
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900">Audience summary</h3>
          <div className="mt-3 space-y-2 text-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="text-gray-500">Recruitment</span>
              <span className="font-semibold text-gray-900">{RECRUITMENT_LABELS[method]}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-gray-500">Testers</span>
              <span className="font-semibold text-gray-900">{audience.participantGoal}</span>
            </div>
            {draft.variants.length > 1 && (
              <div className="flex items-center justify-between gap-3">
                <span className="text-gray-500">Split</span>
                <span className="text-right font-semibold text-gray-900">{splitLabel}</span>
              </div>
            )}
            <div className="flex items-center justify-between gap-3">
              <span className="text-gray-500">Screeners</span>
              <span className="font-semibold text-gray-900">{audience.screeners.length}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-gray-500">NDA</span>
              <span className="font-semibold text-gray-900">{audience.requireNda ? 'Required' : 'Off'}</span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-gray-900">Est. fulfillment time</p>
          <p className="mt-1 text-xs text-gray-500">{fulfillment}</p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100">
            <div className="h-full rounded-full bg-blue-600" style={{ width: `${gaugePct}%` }} />
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Narrower filters take longer. A broader audience fills faster.
          </p>
        </div>
      </aside>
    </div>
  );
}
