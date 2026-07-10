'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import {
  DEFAULT_INTRO_GREETING,
  INITIAL_DISCUSSION_TOPICS,
  type DiscussionTopic,
} from '@/data/mock-focus-group-script';

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

interface ScriptStepProps {
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

function createTopicId() {
  return `topic-${Date.now()}-${Math.round(Math.random() * 1000)}`;
}

function TopicCard({
  topic,
  index,
  onTitleChange,
  onQuestionChange,
  onAddQuestion,
  onDeleteQuestion,
  onDeleteTopic,
}: {
  topic: DiscussionTopic;
  index: number;
  onTitleChange: (title: string) => void;
  onQuestionChange: (questionIndex: number, value: string) => void;
  onAddQuestion: () => void;
  onDeleteQuestion: (questionIndex: number) => void;
  onDeleteTopic: () => void;
}) {
  return (
    <div className="group/topic rounded-lg border border-gray-200 bg-white">
      <div className="flex items-start gap-2 border-b border-gray-100 bg-gray-50/60 px-3 py-2.5">
        <div className="flex-1">
          <WuInput
            Label={`Topic ${index + 1}`}
            variant="outlined"
            placeholder="e.g. First impressions of the new checkout flow"
            value={topic.title}
            onChange={(event) => onTitleChange(event.target.value)}
          />
        </div>
        <WuButton
          variant="iconOnly"
          size="sm"
          color="error"
          aria-label="Delete topic"
          Icon={<span className="wm-delete text-sm" />}
          className="mt-1 shrink-0 text-gray-400 opacity-0 transition group-hover/topic:opacity-100 hover:text-red-600"
          onClick={onDeleteTopic}
        />
      </div>

      <div className="space-y-2 p-3">
        {topic.questions.map((question, questionIndex) => (
          <div key={questionIndex} className="group/question flex items-start gap-2">
            <WuTextarea
              value={question}
              rows={1}
              placeholder="Ask a guiding question for this topic"
              onChange={(event) => onQuestionChange(questionIndex, event.target.value)}
            />
            <WuButton
              variant="iconOnly"
              size="sm"
              color="error"
              aria-label="Delete question"
              Icon={<span className="wm-delete text-sm" />}
              className="mt-1 shrink-0 text-gray-400 opacity-0 transition group-hover/question:opacity-100 hover:text-red-600"
              onClick={() => onDeleteQuestion(questionIndex)}
            />
          </div>
        ))}

        <WuButton variant="link" onClick={onAddQuestion}>
          + Add a question
        </WuButton>
      </div>
    </div>
  );
}

export function ScriptStep({ onBack, onSaveDraft, onContinue }: ScriptStepProps) {
  const [introGreeting, setIntroGreeting] = useState(DEFAULT_INTRO_GREETING);
  const [topics, setTopics] = useState<DiscussionTopic[]>(INITIAL_DISCUSSION_TOPICS);

  function addTopic() {
    setTopics((current) => [...current, { id: createTopicId(), title: '', questions: [] }]);
  }

  function updateTopicTitle(topicId: string, title: string) {
    setTopics((current) => current.map((topic) => (topic.id === topicId ? { ...topic, title } : topic)));
  }

  function deleteTopic(topicId: string) {
    setTopics((current) => current.filter((topic) => topic.id !== topicId));
  }

  function addQuestion(topicId: string) {
    setTopics((current) =>
      current.map((topic) =>
        topic.id === topicId ? { ...topic, questions: [...topic.questions, ''] } : topic
      )
    );
  }

  function updateQuestion(topicId: string, questionIndex: number, value: string) {
    setTopics((current) =>
      current.map((topic) =>
        topic.id === topicId
          ? {
              ...topic,
              questions: topic.questions.map((question, index) =>
                index === questionIndex ? value : question
              ),
            }
          : topic
      )
    );
  }

  function deleteQuestion(topicId: string, questionIndex: number) {
    setTopics((current) =>
      current.map((topic) =>
        topic.id === topicId
          ? { ...topic, questions: topic.questions.filter((_, index) => index !== questionIndex) }
          : topic
      )
    );
  }

  return (
    <div className="space-y-4">
      <section className="rounded-lg border border-gray-200 bg-white">
        <SectionHeader
          title="Introduction & Greeting"
          subtitle="Optional. Read aloud by the moderator to open the session."
        />
        <div className="p-5">
          <WuTextarea
            Label="Intro / Greeting"
            value={introGreeting}
            rows={4}
            onChange={(event) => setIntroGreeting(event.target.value)}
          />
          <p className="mt-1 text-xs text-gray-500">
            Optional. Sets expectations, covers recording consent, and puts participants at ease.
          </p>
        </div>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white">
        <SectionHeader
          title="Topics & Questions"
          subtitle="Organize the discussion into topics, each with guiding questions for the moderator."
        />
        <div className="space-y-3 p-5">
          {topics.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-5">
              <p className="text-sm font-semibold text-gray-800">No topics yet</p>
              <p className="mt-1 text-sm text-gray-500">Add a topic to start building the discussion guide.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {topics.map((topic, index) => (
                <TopicCard
                  key={topic.id}
                  topic={topic}
                  index={index}
                  onTitleChange={(title) => updateTopicTitle(topic.id, title)}
                  onQuestionChange={(questionIndex, value) => updateQuestion(topic.id, questionIndex, value)}
                  onAddQuestion={() => addQuestion(topic.id)}
                  onDeleteQuestion={(questionIndex) => deleteQuestion(topic.id, questionIndex)}
                  onDeleteTopic={() => deleteTopic(topic.id)}
                />
              ))}
            </div>
          )}

          <div className="border-t border-gray-100 pt-3">
            <WuButton variant="link" onClick={addTopic}>
              + Add a topic
            </WuButton>
          </div>
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
