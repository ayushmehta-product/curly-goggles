'use client';

import dynamic from 'next/dynamic';

const WuAppHeader = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuAppHeader })),
  { ssr: false }
);

interface ParticipantBookingHeaderProps {
  studyTitle: string;
}

export function ParticipantBookingHeader({ studyTitle }: ParticipantBookingHeaderProps) {
  return (
    <div className="border-b border-gray-200 bg-white">
      <WuAppHeader productName="QuestionPro UX" categories={[]} />
      <div className="border-t border-gray-100 px-6 py-4">
        <h1 className="text-[13px] font-semibold text-gray-900">{studyTitle}</h1>
      </div>
    </div>
  );
}
