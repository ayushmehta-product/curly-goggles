'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import {
  INITIAL_POST_SESSION_QUESTIONS,
  POST_SESSION_QUESTION_TYPE_OPTIONS,
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
const WuTextarea = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuTextarea })),
  { ssr: false }
);

interface PostSessionStepProps {
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

function createQuestionId() {
  return `post-question-${Date.now()}-${Math.round(Math.random() * 1000)}`;
}

function PostSessionQuestionRow({
  question,
  onTypeChange,
  onPromptChange,
  onDelete,
}: {
  question: PostSessionQuestion;
  onTypeChange: (type: PostSessionQuestionType) => void;
  onPromptChange: (prompt: string) => void;
  onDelete: () => void;
}) {
  const selectedType = POST_SESSION_QUESTION_TYPE_OPTIONS.find(
    (option) => option.value === question.type
  );

  return (
    <div className="group/post-question flex items-start gap-2 rounded-lg border border-gray-200 bg-white p-3">
      <div className="min-w-0 flex-1 space-y-2">
        <div className="max-w-[220px]">
          <WuSelect
            Label="Type"
            data={POST_SESSION_QUESTION_TYPE_OPTIONS}
            accessorKey={{ value: 'value', label: 'label' }}
            value={selectedType}
            onSelect={(value) =>
              onTypeChange((value as { value: PostSessionQuestionType }).value)
            }
            variant="outlined"
          />
        </div>
        <WuTextarea
          Label="Question"
          value={question.prompt}
          rows={2}
          onChange={(event) => onPromptChange(event.target.value)}
        />
      </div>
      <WuButton
        variant="iconOnly"
        size="sm"
        color="error"
        aria-label="Delete question"
        Icon={<span className="wm-delete text-sm" />}
        className="mt-1 shrink-0 text-gray-400 opacity-0 transition group-hover/post-question:opacity-100 hover:text-red-600"
        onClick={onDelete}
      />
    </div>
  );
}

export function PostSessionStep({ onBack, onSaveDraft, onContinue }: PostSessionStepProps) {
  const [questions, setQuestions] = useState<PostSessionQuestion[]>(INITIAL_POST_SESSION_QUESTIONS);
  const [enableRedirect, setEnableRedirect] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState('');

  function addQuestion() {
    setQuestions((current) => [
      ...current,
      { id: createQuestionId(), type: 'free-response', prompt: '' },
    ]);
  }

  function updateQuestionType(id: string, type: PostSessionQuestionType) {
    setQuestions((current) => current.map((question) => (question.id === id ? { ...question, type } : question)));
  }

  function updateQuestionPrompt(id: string, prompt: string) {
    setQuestions((current) =>
      current.map((question) => (question.id === id ? { ...question, prompt } : question))
    );
  }

  function deleteQuestion(id: string) {
    setQuestions((current) => current.filter((question) => question.id !== id));
  }

  return (
    <div className="space-y-4">
      <section className="rounded-lg border border-gray-200 bg-white">
        <SectionHeader
          title="Post-Session Survey"
          subtitle="Ask participants a few quick questions right after the group discussion ends."
        />
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
            <div className="space-y-2">
              {questions.map((question) => (
                <PostSessionQuestionRow
                  key={question.id}
                  question={question}
                  onTypeChange={(type) => updateQuestionType(question.id, type)}
                  onPromptChange={(prompt) => updateQuestionPrompt(question.id, prompt)}
                  onDelete={() => deleteQuestion(question.id)}
                />
              ))}
            </div>
          )}

          <div className="border-t border-gray-100 pt-3">
            <WuButton variant="link" onClick={addQuestion}>
              + Add a question
            </WuButton>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white">
        <SectionHeader title="End of Session" />
        <div className="space-y-3 p-5">
          <label className="flex items-start gap-3">
            <WuCheckbox checked={enableRedirect} onChange={setEnableRedirect} />
            <span>
              <span className="block text-sm font-medium text-gray-800">
                Redirect participants to a URL after the session
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
                onChange={(event) => setRedirectUrl(event.target.value)}
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
