'use client';

import dynamic from 'next/dynamic';

const WuButton = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuButton })),
  { ssr: false }
);

interface InsightsChatButtonProps {
  onClick: () => void;
}

export function InsightsChatButton({ onClick }: InsightsChatButtonProps) {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <WuButton
        variant="iconOnly"
        color="primary"
        floating
        aria-label="Open InsightsHub chat"
        Icon={<span className="wm-smart-toy" />}
        onClick={onClick}
      />
    </div>
  );
}
