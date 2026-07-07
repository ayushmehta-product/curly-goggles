'use client';

import dynamic from 'next/dynamic';

const WuCard = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuCard })),
  { ssr: false }
);
const WuIcon = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuIcon })),
  { ssr: false }
);
const WuSubtext = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuSubtext })),
  { ssr: false }
);
const WuText = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuText })),
  { ssr: false }
);

type BookingSummaryIcon = 'wm-calendar-today' | 'wm-schedule' | 'wm-av-timer' | 'wm-language';

interface BookingSummaryRowProps {
  icon: BookingSummaryIcon;
  label: string;
  value: string;
}

function BookingSummaryRow({ icon, label, value }: BookingSummaryRowProps) {
  return (
    <div className="flex items-start gap-3 py-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50">
        <WuIcon icon={icon} className="text-base text-blue-700" aria-hidden />
      </div>
      <div className="min-w-0 flex-1">
        <WuSubtext size="sm" className="text-gray-500">
          {label}
        </WuSubtext>
        <WuText size="sm" className="mt-0.5 font-medium text-gray-900">
          {value}
        </WuText>
      </div>
    </div>
  );
}

interface BookingSummaryCardProps {
  studyTitle: string;
  dateLabel: string;
  timeLabel: string;
  durationMinutes: number;
  timezoneLabel: string;
}

export function BookingSummaryCard({
  studyTitle,
  dateLabel,
  timeLabel,
  durationMinutes,
  timezoneLabel,
}: BookingSummaryCardProps) {
  return (
    <WuCard rounded className="overflow-hidden border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-100 bg-gray-50 px-5 py-4">
        <WuSubtext size="sm" className="text-gray-500">
          Booking summary
        </WuSubtext>
        <WuText size="sm" className="mt-1 text-[13px] font-semibold text-gray-900">
          {studyTitle}
        </WuText>
      </div>

      <div className="divide-y divide-gray-100 px-5">
        <BookingSummaryRow icon="wm-calendar-today" label="Date" value={dateLabel} />
        <BookingSummaryRow icon="wm-schedule" label="Time" value={timeLabel} />
        <BookingSummaryRow
          icon="wm-av-timer"
          label="Duration"
          value={`${durationMinutes} minutes`}
        />
        <BookingSummaryRow icon="wm-language" label="Timezone" value={timezoneLabel} />
      </div>
    </WuCard>
  );
}
