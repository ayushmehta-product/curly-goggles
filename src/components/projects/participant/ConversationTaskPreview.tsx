'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useWuShowToast } from '@npm-questionpro/wick-ui-lib';

const WuButton = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuButton })),
  { ssr: false }
);
const WuTextarea = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuTextarea })),
  { ssr: false }
);

interface ConversationTaskPreviewProps {
  title: string;
  description?: string;
}

function emphasizeLastSentence(text: string) {
  const match = text.match(/^(.*?)([^.?!]*[?].*)$/);
  if (!match || !match[2]) return text;
  return (
    <>
      {match[1]}
      <strong>{match[2].trim()}</strong>
    </>
  );
}

export function ConversationTaskPreview({ title, description }: ConversationTaskPreviewProps) {
  const { showToast } = useWuShowToast();
  const [response, setResponse] = useState('');

  function wrapSelection(before: string, after = before) {
    setResponse((current) => (current ? `${before}${current}${after}` : `${before}${after}`));
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-3xl font-semibold text-[var(--qp-q-blue)]">{title}</h2>
      {description ? <p className="text-ink">{emphasizeLastSentence(description)}</p> : null}
      <div className="overflow-hidden rounded-lg border border-line bg-surface">
        <div className="flex items-center gap-1 border-b border-line px-2 py-1">
          <WuButton variant="iconOnly" aria-label="Bold" Icon={<span className="font-bold">B</span>} onClick={() => wrapSelection('**')} />
          <WuButton variant="iconOnly" aria-label="Italic" Icon={<span className="italic">I</span>} onClick={() => wrapSelection('_')} />
          <WuButton variant="iconOnly" aria-label="Underline" Icon={<span className="underline">U</span>} onClick={() => wrapSelection('<u>', '</u>')} />
          <WuButton
            variant="iconOnly"
            aria-label="Bulleted list"
            Icon={<span className="wm-format-list-bulleted" />}
            onClick={() => setResponse((current) => `${current}${current ? '\n' : ''}- `)}
          />
          <WuButton
            variant="iconOnly"
            aria-label="Align text"
            Icon={<span className="wm-format-align-left" />}
            onClick={() => showToast({ message: 'Alignment applied', variant: 'success' })}
          />
          <span className="ml-auto">
            <WuButton
              variant="iconOnly"
              aria-label="Add image"
              Icon={<span className="wm-photo-camera" />}
              onClick={() => showToast({ message: 'Image attached (preview)', variant: 'success' })}
            />
          </span>
        </div>
        <div className="bg-[var(--qp-gray-20)] p-3">
          <WuTextarea
            variant="outlined"
            placeholder="Write your response"
            value={response}
            rows={8}
            onChange={(event) => setResponse(event.target.value)}
          />
        </div>
      </div>
      <div className="flex justify-end">
        <WuButton
          disabled={!response.trim()}
          onClick={() => {
            setResponse('');
            showToast({ message: 'Response submitted (preview)', variant: 'success' });
          }}
        >
          Submit
        </WuButton>
      </div>
    </div>
  );
}
