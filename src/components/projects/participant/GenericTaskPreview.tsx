'use client';

import dynamic from 'next/dynamic';

const WuButton = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuButton })),
  { ssr: false }
);

interface GenericTaskPreviewProps {
  title: string;
  description?: string;
  onContinue: () => void;
}

export function GenericTaskPreview({ title, description, onContinue }: GenericTaskPreviewProps) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-3xl font-semibold text-[var(--qp-q-blue)]">{title}</h2>
      <p className="text-ink">
        {description ?? 'Complete this task, then continue. This preview records a response locally.'}
      </p>
      <div className="flex justify-end">
        <WuButton onClick={onContinue}>Continue</WuButton>
      </div>
    </div>
  );
}
