'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import {
  DEFAULT_CHOICES,
  INITIAL_POST_SESSION_QUESTIONS,
  POST_SESSION_QUESTION_TYPE_OPTIONS,
  type PostSessionChoice,
  type PostSessionQuestion,
  type PostSessionQuestionType,
} from '@/data/mock-focus-group-post-session';

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
const WuStepper = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuStepper })),
  { ssr: false }
);
const WuTextarea = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuTextarea })),
  { ssr: false }
);

interface PostSessionStepProps {
  onBack: () => void;
  onSaveDraft: () => void;
  onContinue: () => void;
}

const CHOICE_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function createQuestionId() {
  return `post-question-${Date.now()}-${Math.round(Math.random() * 1000)}`;
}

function createChoiceId() {
  return `choice-${Date.now()}-${Math.round(Math.random() * 1000)}`;
}

function getDefaultForType(type: PostSessionQuestionType): Partial<PostSessionQuestion> {
  if (type === 'single-select' || type === 'multi-select') {
    return {
      choices: DEFAULT_CHOICES.map((c) => ({ ...c, id: createChoiceId() })),
    };
  }
  if (type === 'rating-scale') {
    return { ratingMin: 1, ratingMax: 5, ratingMinLabel: '', ratingMaxLabel: '' };
  }
  return {};
}

// ─── Choice rows for single/multi-select ─────────────────────────────────────

function ChoiceRows({
  choices,
  onChoiceChange,
  onChoiceDelete,
  onAddChoice,
}: {
  choices: PostSessionChoice[];
  onChoiceChange: (id: string, text: string) => void;
  onChoiceDelete: (id: string) => void;
  onAddChoice: () => void;
}) {
  return (
    <div className="mt-3 space-y-2">
      {choices.map((choice, index) => (
        <div key={choice.id} className="flex items-center gap-2">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-500">
            {CHOICE_LETTERS[index] ?? String(index + 1)}
          </span>
          <div className="flex-1">
            <WuInput
              variant="outlined"
              placeholder={`Option ${CHOICE_LETTERS[index] ?? index + 1}`}
              value={choice.text}
              onChange={(e) => onChoiceChange(choice.id, e.target.value)}
            />
          </div>
          {choices.length > 2 && (
            <button
              type="button"
              aria-label="Remove option"
              onClick={() => onChoiceDelete(choice.id)}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded text-gray-400 hover:bg-gray-100 hover:text-red-500"
            >
              <span className="wm-close text-sm" />
            </button>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={onAddChoice}
        className="mt-1 text-sm font-medium text-blue-600 hover:underline"
      >
        + Add a response
      </button>
    </div>
  );
}

// ─── Rating scale controls ────────────────────────────────────────────────────

function RatingScaleControls({
  min,
  max,
  minLabel,
  maxLabel,
  onMinChange,
  onMaxChange,
  onMinLabelChange,
  onMaxLabelChange,
}: {
  min: number;
  max: number;
  minLabel: string;
  maxLabel: string;
  onMinChange: (v: number) => void;
  onMaxChange: (v: number) => void;
  onMinLabelChange: (v: string) => void;
  onMaxLabelChange: (v: string) => void;
}) {
  return (
    <div className="mt-4 space-y-4">
      <p className="text-xs text-gray-500">
        Drag the handles to define the minimum and maximum values on a scale of 1 to 10.
      </p>

      <div className="flex items-center gap-4">
        <div className="w-24">
          <WuStepper
            Label="Min"
            min={1}
            max={max - 1}
            value={min}
            onChange={onMinChange}
          />
        </div>
        <div className="relative flex-1 pt-5">
          <div className="h-1.5 w-full rounded-full bg-gray-200">
            <div
              className="absolute h-1.5 rounded-full bg-blue-500"
              style={{
                left: `${((min - 1) / 9) * 100}%`,
                right: `${((10 - max) / 9) * 100}%`,
              }}
            />
            <div
              className="absolute -top-1.5 h-4 w-4 -translate-x-1/2 cursor-pointer rounded-full border-2 border-white bg-blue-600 shadow"
              style={{ left: `${((min - 1) / 9) * 100}%` }}
            />
            <div
              className="absolute -top-1.5 h-4 w-4 -translate-x-1/2 cursor-pointer rounded-full border-2 border-white bg-blue-600 shadow"
              style={{ left: `${((max - 1) / 9) * 100}%` }}
            />
          </div>
          <div className="mt-2 flex justify-between text-xs text-gray-400">
            <span>1</span>
            <span>10</span>
          </div>
        </div>
        <div className="w-24">
          <WuStepper
            Label="Max"
            min={min + 1}
            max={10}
            value={max}
            onChange={onMaxChange}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <WuInput
          Label="Label (optional)"
          variant="outlined"
          placeholder="Label (optional)"
          value={minLabel}
          onChange={(e) => onMinLabelChange(e.target.value)}
        />
        <WuInput
          Label="Label (optional)"
          variant="outlined"
          placeholder="Label (optional)"
          value={maxLabel}
          onChange={(e) => onMaxLabelChange(e.target.value)}
        />
      </div>
    </div>
  );
}

// ─── Single question card ─────────────────────────────────────────────────────

function QuestionCard({
  question,
  index,
  onChange,
  onDelete,
}: {
  question: PostSessionQuestion;
  index: number;
  onChange: (updated: PostSessionQuestion) => void;
  onDelete: () => void;
}) {
  const selectedType = POST_SESSION_QUESTION_TYPE_OPTIONS.find((o) => o.value === question.type);

  function setType(type: PostSessionQuestionType) {
    onChange({ ...question, type, ...getDefaultForType(type) });
  }

  function setPrompt(prompt: string) {
    onChange({ ...question, prompt });
  }

  function setChoice(id: string, text: string) {
    onChange({
      ...question,
      choices: (question.choices ?? []).map((c) => (c.id === id ? { ...c, text } : c)),
    });
  }

  function deleteChoice(id: string) {
    onChange({
      ...question,
      choices: (question.choices ?? []).filter((c) => c.id !== id),
    });
  }

  function addChoice() {
    onChange({
      ...question,
      choices: [...(question.choices ?? []), { id: createChoiceId(), text: '' }],
    });
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-2.5">
        <span className="text-sm font-semibold text-gray-700">Question {index + 1}</span>
        <div className="flex items-center gap-3">
          <div className="w-44">
            <WuSelect
              Label=""
              data={POST_SESSION_QUESTION_TYPE_OPTIONS}
              accessorKey={{ value: 'value', label: 'label' }}
              value={selectedType}
              onSelect={(value) => setType((value as { value: PostSessionQuestionType }).value)}
              variant="outlined"
            />
          </div>
          <WuButton
            variant="iconOnly"
            size="sm"
            color="error"
            aria-label="Delete question"
            Icon={<span className="wm-delete text-sm" />}
            className="text-gray-400 hover:text-red-600"
            onClick={onDelete}
          />
        </div>
      </div>

      <div className="p-4">
        <WuTextarea
          Label=""
          placeholder="Question"
          value={question.prompt}
          rows={3}
          onChange={(e) => setPrompt(e.target.value)}
        />

        {(question.type === 'single-select' || question.type === 'multi-select') && (
          <ChoiceRows
            choices={question.choices ?? []}
            onChoiceChange={setChoice}
            onChoiceDelete={deleteChoice}
            onAddChoice={addChoice}
          />
        )}

        {question.type === 'rating-scale' && (
          <RatingScaleControls
            min={question.ratingMin ?? 1}
            max={question.ratingMax ?? 5}
            minLabel={question.ratingMinLabel ?? ''}
            maxLabel={question.ratingMaxLabel ?? ''}
            onMinChange={(v) => onChange({ ...question, ratingMin: v })}
            onMaxChange={(v) => onChange({ ...question, ratingMax: v })}
            onMinLabelChange={(v) => onChange({ ...question, ratingMinLabel: v })}
            onMaxLabelChange={(v) => onChange({ ...question, ratingMaxLabel: v })}
          />
        )}

        {question.type === 'yes-no' && (
          <div className="mt-3 flex gap-3">
            {['Yes', 'No'].map((label) => (
              <div
                key={label}
                className="flex h-9 w-20 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-sm font-medium text-gray-600"
              >
                {label}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function PostSessionStep({ onBack, onSaveDraft, onContinue }: PostSessionStepProps) {
  const [questions, setQuestions] = useState<PostSessionQuestion[]>(INITIAL_POST_SESSION_QUESTIONS);
  const [enableRedirect, setEnableRedirect] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState('');

  function updateQuestion(updated: PostSessionQuestion) {
    setQuestions((current) => current.map((q) => (q.id === updated.id ? updated : q)));
  }

  function deleteQuestion(id: string) {
    setQuestions((current) => current.filter((q) => q.id !== id));
  }

  function addQuestion() {
    setQuestions((current) => [
      ...current,
      {
        id: createQuestionId(),
        type: 'free-response',
        prompt: '',
      },
    ]);
  }

  return (
    <div className="space-y-4">
      <section className="rounded-lg border border-gray-200 bg-white">
        <div className="border-b border-gray-100 px-5 py-3">
          <h2 className="text-base font-semibold text-gray-900">Post-Session Survey</h2>
          <p className="mt-1 text-sm text-gray-500">
            Ask participants a few quick questions right after the session ends.
          </p>
        </div>

        <div className="space-y-3 p-5">
          <div className="rounded-md border border-blue-100 bg-blue-50 px-3 py-2 text-xs leading-5 text-blue-800">
            The post-session survey does not count towards the session time limit.
          </div>

          {questions.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-5">
              <p className="text-sm font-semibold text-gray-800">No post-session questions yet</p>
              <p className="mt-1 text-sm text-gray-500">
                Add a question to collect feedback right after the session.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {questions.map((question, index) => (
                <QuestionCard
                  key={question.id}
                  question={question}
                  index={index}
                  onChange={updateQuestion}
                  onDelete={() => deleteQuestion(question.id)}
                />
              ))}
            </div>
          )}

          <div className="border-t border-gray-100 pt-3">
            <button
              type="button"
              onClick={addQuestion}
              className="text-sm font-medium text-blue-600 hover:underline"
            >
              + Add a question
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white">
        <div className="border-b border-gray-100 px-5 py-3">
          <h2 className="text-base font-semibold text-gray-900">End of session redirect</h2>
        </div>
        <div className="space-y-3 p-5">
          <label className="flex cursor-pointer items-start gap-3">
            <WuCheckbox checked={enableRedirect} onChange={setEnableRedirect} />
            <span>
              <span className="block text-sm font-medium text-gray-800">
                Add a redirect link to show participants once the session is complete
              </span>
              <span className="mt-0.5 block text-xs text-gray-500">
                Useful for sending participants to a rewards page or a thank-you screen.
              </span>
            </span>
          </label>
          {enableRedirect && (
            <div className="max-w-md pl-8">
              <WuInput
                Label="Redirect URL"
                variant="outlined"
                placeholder="https://"
                value={redirectUrl}
                onChange={(e) => setRedirectUrl(e.target.value)}
              />
            </div>
          )}
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
