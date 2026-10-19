'use client';

import dynamic from 'next/dynamic';

const WuButton = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuButton })),
  { ssr: false }
);
const WuIcon = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuIcon })),
  { ssr: false }
);

interface InsightsChatButtonProps {
  onClick: () => void;
}

export function InsightsChatButton({ onClick }: InsightsChatButtonProps) {
  return (
    <div className="fixed bottom-6 right-6 z-[90]">
      <WuButton
        variant="primary"
        color="primary"
        floating
        aria-label="Open InsightsHub chat"
        className="qp-insights-fab"
        Icon={<WuIcon icon="wc-ai" className="text-[22px] leading-none" aria-hidden />}
        onClick={onClick}
      />
    </div>
  );
}
