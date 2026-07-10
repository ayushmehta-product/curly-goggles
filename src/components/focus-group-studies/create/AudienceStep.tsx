'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { SelectableCard } from '@/components/ui/SelectableCard';
import {
  INITIAL_SCREENER_ITEMS,
  SCREENER_TYPE_DESCRIPTIONS,
  SCREENER_TYPE_LABELS,
  type ScreenerItem,
  type ScreenerType,
} from '@/data/mock-focus-group-audience';

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
const WuTextarea = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuTextarea })),
  { ssr: false }
);

interface AudienceStepProps {
  onBack: () => void;
  onSaveDraft: () => void;
  onContinue: () => void;
}

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="border-b border-gray-100 px-5 py-3">
      <h2 className="text-base font-semibold text-gray-900">{title}</h2>
      {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
    </div>
  );
}

const SCREENER_TYPE_BADGE_STYLES: Record<ScreenerType, string> = {
  technical: 'bg-blue-50 text-blue-700',
  'verbal-response': 'bg-purple-50 text-purple-700',
  'survey-question': 'bg-green-50 text-green-700',
};

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
        <span
          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${SCREENER_TYPE_BADGE_STYLES[item.type]}`}
        >
          {SCREENER_TYPE_LABELS[item.type]}
        </span>
        <WuTextarea
          value={item.prompt}
          rows={2}
          onChange={(event) => onChange(event.target.value)}
        />
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

function createScreenerId() {
  return `screener-${Date.now()}-${Math.round(Math.random() * 1000)}`;
}

export function AudienceStep({ onBack, onSaveDraft, onContinue }: AudienceStepProps) {
  const [landingPageTitle, setLandingPageTitle] = useState(
    'Join a paid research session about your recent shopping experience'
  );
  const [screeners, setScreeners] = useState<ScreenerItem[]>(INITIAL_SCREENER_ITEMS);
  const [requireNda, setRequireNda] = useState(false);

  function addScreener(type: ScreenerType) {
    setScreeners((current) => [
      ...current,
      { id: createScreenerId(), type, prompt: '' },
    ]);
  }

  function updateScreener(id: string, prompt: string) {
    setScreeners((current) => current.map((item) => (item.id === id ? { ...item, prompt } : item)));
  }

  function deleteScreener(id: string) {
    setScreeners((current) => current.filter((item) => item.id !== id));
  }

  return (
    <div className="space-y-4">
      <section className="rounded-lg border border-gray-200 bg-white">
        <SectionHeader
          title="Recruitment Method"
          subtitle="Invite participants you've already recruited using a custom scheduling link."
        />
        <div className="p-5">
          <div className="max-w-sm">
            <SelectableCard
              title="My own participants"
              description="Share a custom link so participants you've recruited yourself can join this focus group."
              icon={<span className="wm-link text-xl" />}
              isSelected
              onClick={() => undefined}
            />
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white">
        <SectionHeader
          title="Recruitment Landing Page"
          subtitle="Shown to participants before they open the scheduling link."
        />
        <div className="space-y-4 p-5">
          <div>
            <WuInput
              Label="Landing Page Title"
              variant="outlined"
              placeholder="e.g. Join a paid research session about your recent shopping experience"
              value={landingPageTitle}
              onChange={(event) => setLandingPageTitle(event.target.value)}
            />
            <p className="mt-1 text-xs text-gray-500">
              The headline participants see before scheduling their session.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white">
        <SectionHeader
          title="Screener Questions"
          subtitle="Qualify participants before they can access the scheduling link."
        />
        <div className="space-y-3 p-5">
          {screeners.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-5">
              <p className="text-sm font-semibold text-gray-800">No screener questions yet</p>
              <p className="mt-1 text-sm text-gray-500">
                Add a screener below to start qualifying participants.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {screeners.map((item) => (
                <ScreenerRow
                  key={item.id}
                  item={item}
                  onChange={(prompt) => updateScreener(item.id, prompt)}
                  onDelete={() => deleteScreener(item.id)}
                />
              ))}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-4 border-t border-gray-100 pt-4">
            <WuButton variant="link" onClick={() => addScreener('technical')}>
              + Add technical screener
            </WuButton>
            <WuButton variant="link" onClick={() => addScreener('verbal-response')}>
              + Add verbal response screener
            </WuButton>
            <WuButton variant="link" onClick={() => addScreener('survey-question')}>
              + Add screener survey question
            </WuButton>
          </div>
          <p className="text-xs text-gray-500">
            {SCREENER_TYPE_DESCRIPTIONS.technical} {SCREENER_TYPE_DESCRIPTIONS['verbal-response']}
          </p>
        </div>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white">
        <SectionHeader title="Confidentiality" />
        <div className="p-5">
          <label className="flex items-start gap-3">
            <WuCheckbox checked={requireNda} onChange={setRequireNda} />
            <span>
              <span className="block text-sm font-medium text-gray-800">
                Make participants sign a non-disclosure agreement
              </span>
              <span className="mt-0.5 block text-xs text-gray-500">
                Participants must accept an NDA before they can view topics or join the session.
              </span>
            </span>
          </label>
        </div>
      </section>

      <div className="sticky bottom-0 z-20 flex items-center justify-between rounded-lg border border-gray-200 bg-white px-5 py-3 shadow-[0_-8px_20px_rgba(15,23,42,0.06)]">
        <WuButton variant="secondary" onClick={onBack}>
          Back
        </WuButton>
        <div className="flex items-center gap-2">
          <WuButton variant="secondary" onClick={onSaveDraft}>
            Save Draft
          </WuButton>
          <WuButton Icon={<span className="wm-arrow-forward" />} iconPosition="right" onClick={onContinue}>
            Continue
          </WuButton>
        </div>
      </div>
    </div>
  );
}
