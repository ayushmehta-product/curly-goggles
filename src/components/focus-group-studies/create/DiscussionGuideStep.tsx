'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { INITIAL_DISCUSSION_TOPICS } from '@/data/mock-focus-group-script';

const WuButton = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuButton })),
  { ssr: false }
);
const WuModal = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuModal })),
  { ssr: false }
);
const WuModalHeader = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuModalHeader })),
  { ssr: false }
);
const WuModalContent = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuModalContent })),
  { ssr: false }
);
const WuModalFooter = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuModalFooter })),
  { ssr: false }
);
const WuModalClose = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuModalClose })),
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

interface DiscussionGuideStepProps {
  onBack: () => void;
  onSaveDraft: () => void;
  onContinue: () => void;
}

interface GuideQuestion {
  id: string;
  question: string;
  startMinutes: number;
}

interface TimestampOption {
  value: string;
  label: string;
}

interface QuestionFormState {
  mode: 'create' | 'edit';
  id?: string;
  question: string;
  startMinutes: number;
}

function createId() {
  return `fg-question-${Date.now()}-${Math.round(Math.random() * 1000)}`;
}

function formatTimestamp(minutes: number) {
  return `${String(minutes).padStart(2, '0')}:00`;
}

function createInitialQuestions(): GuideQuestion[] {
  let startMinutes = 0;
  const questions: GuideQuestion[] = [];

  for (const topic of INITIAL_DISCUSSION_TOPICS) {
    for (const q of topic.questions) {
      questions.push({ id: createId(), question: q, startMinutes });
      startMinutes += 10;
    }
  }

  return questions;
}

const TIMESTAMP_OPTIONS: TimestampOption[] = Array.from({ length: 121 }, (_, minutes) => ({
  value: String(minutes),
  label: formatTimestamp(minutes),
}));

function getNextStartMinutes(questions: GuideQuestion[]) {
  if (questions.length === 0) return 0;
  return Math.min(120, Math.max(...questions.map((q) => q.startMinutes)) + 10);
}

function getSortedQuestions(questions: GuideQuestion[]) {
  return [...questions].sort((a, b) => {
    if (a.startMinutes !== b.startMinutes) return a.startMinutes - b.startMinutes;
    return questions.indexOf(a) - questions.indexOf(b);
  });
}

function getSelectedTimestamp(startMinutes: number) {
  return TIMESTAMP_OPTIONS.find((o) => o.value === String(startMinutes)) ?? TIMESTAMP_OPTIONS[0];
}

function QuestionActions({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="flex items-center gap-1 opacity-0 transition group-hover/question:opacity-100 group-focus-within/question:opacity-100">
      <WuButton
        variant="iconOnly"
        size="sm"
        aria-label="Edit question"
        Icon={<span className="wm-edit text-sm" />}
        className="text-gray-400 hover:text-gray-700"
        onClick={onEdit}
      />
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
  );
}

function TimelineQuestionRow({
  question,
  onEdit,
  onDelete,
}: {
  question: GuideQuestion;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="group/question grid grid-cols-[72px_28px_minmax(0,1fr)_72px] gap-4 py-7">
      <div className="pt-0.5 text-xs font-medium tracking-wide text-gray-400">
        {formatTimestamp(question.startMinutes)}
      </div>
      <div className="relative flex justify-center">
        <span className="relative z-10 mt-1 h-3 w-3 rounded-full border-2 border-white bg-blue-500 shadow-sm" />
      </div>
      <p className="max-w-2xl text-xl font-normal leading-8 text-gray-900">{question.question}</p>
      <QuestionActions onEdit={onEdit} onDelete={onDelete} />
    </div>
  );
}

function QuestionEditorModal({
  form,
  onOpenChange,
  onChange,
  onSave,
}: {
  form: QuestionFormState | null;
  onOpenChange: (open: boolean) => void;
  onChange: (updates: Partial<QuestionFormState>) => void;
  onSave: () => void;
}) {
  const selectedTimestamp = getSelectedTimestamp(form?.startMinutes ?? 0);

  return (
    <WuModal open={Boolean(form)} onOpenChange={onOpenChange} size="sm">
      <WuModalHeader>{form?.mode === 'edit' ? 'Edit Question' : 'Add Question'}</WuModalHeader>
      <WuModalContent>
        <div className="space-y-4">
          <WuSelect
            Label="Timestamp"
            data={TIMESTAMP_OPTIONS}
            accessorKey={{ value: 'value', label: 'label' }}
            value={selectedTimestamp}
            onSelect={(value) => {
              const option = value as TimestampOption;
              onChange({ startMinutes: Number(option.value) });
            }}
            variant="outlined"
            maxHeight={260}
          />
          <WuTextarea
            Label="Discussion Question"
            value={form?.question ?? ''}
            onChange={(event) => onChange({ question: event.target.value })}
            rows={4}
          />
        </div>
      </WuModalContent>
      <WuModalFooter>
        <WuModalClose variant="secondary">Cancel</WuModalClose>
        <WuButton onClick={onSave}>{form?.mode === 'edit' ? 'Save Question' : 'Add Question'}</WuButton>
      </WuModalFooter>
    </WuModal>
  );
}

export function DiscussionGuideStep({ onBack, onSaveDraft, onContinue }: DiscussionGuideStepProps) {
  const [questions, setQuestions] = useState<GuideQuestion[]>(createInitialQuestions);
  const [questionForm, setQuestionForm] = useState<QuestionFormState | null>(null);

  const displayQuestions = getSortedQuestions(questions);

  function openCreateQuestion() {
    setQuestionForm({
      mode: 'create',
      question: '',
      startMinutes: getNextStartMinutes(questions),
    });
  }

  function openEditQuestion(question: GuideQuestion) {
    setQuestionForm({
      mode: 'edit',
      id: question.id,
      question: question.question,
      startMinutes: question.startMinutes,
    });
  }

  function saveQuestion() {
    if (!questionForm) return;
    const questionText = questionForm.question.trim() || 'Untitled discussion question.';

    if (questionForm.mode === 'edit' && questionForm.id) {
      setQuestions((current) =>
        current.map((q) =>
          q.id === questionForm.id
            ? { ...q, question: questionText, startMinutes: questionForm.startMinutes }
            : q
        )
      );
    } else {
      setQuestions((current) => [
        ...current,
        { id: createId(), question: questionText, startMinutes: questionForm.startMinutes },
      ]);
    }

    setQuestionForm(null);
  }

  function deleteQuestion(questionId: string) {
    setQuestions((current) => current.filter((q) => q.id !== questionId));
  }

  return (
    <div className="mx-auto w-full max-w-4xl">
      <section className="bg-white px-8 py-10">
        <div className="mb-10">
          <h2 className="text-2xl font-semibold tracking-tight text-gray-950">Discussion Guide</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
            A focused moderation outline for the group session. Moderators follow this guide live during the discussion.
          </p>
        </div>

        {questions.length === 0 ? (
          <div className="border-t border-gray-100 py-12">
            <p className="text-lg font-medium text-gray-900">No questions yet.</p>
            <p className="mt-2 text-sm text-gray-500">Start building your group discussion guide.</p>
            <div className="mt-6">
              <WuButton variant="link" onClick={openCreateQuestion}>
                + Add First Question
              </WuButton>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="relative">
              <div className="absolute bottom-7 left-[102px] top-7 w-px bg-gray-100" />
              <div>
                {displayQuestions.map((question) => (
                  <TimelineQuestionRow
                    key={question.id}
                    question={question}
                    onEdit={() => openEditQuestion(question)}
                    onDelete={() => deleteQuestion(question.id)}
                  />
                ))}
              </div>
            </div>
            <div className="border-t border-gray-100 pt-5">
              <WuButton variant="link" onClick={openCreateQuestion}>
                + Add Question
              </WuButton>
            </div>
          </div>
        )}
      </section>

      <div className="sticky bottom-0 z-20 mt-4 flex items-center justify-between border-t border-gray-100 bg-white px-8 py-5 shadow-[0_-8px_20px_rgba(15,23,42,0.06)]">
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

      <QuestionEditorModal
        form={questionForm}
        onOpenChange={(open) => {
          if (!open) setQuestionForm(null);
        }}
        onChange={(updates) => {
          setQuestionForm((current) => (current ? { ...current, ...updates } : current));
        }}
        onSave={saveQuestion}
      />
    </div>
  );
}
