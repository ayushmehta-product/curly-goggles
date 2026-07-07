'use client';

import dynamic from 'next/dynamic';

const WuCard = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuCard })),
  { ssr: false }
);
const WuCardHeader = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuCardHeader })),
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

type BookingSummaryIcon = 'wm-calendar-today' | 'wm-schedule' | 'wm-hourglass' | 'wm-globe';

interface BookingSummaryRowProps {
  icon: BookingSummaryIcon;
  label: string;
  value: string | null;
}

function BookingSummaryRow({ icon, label, value }: BookingSummaryRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <span className="flex items-center gap-2">
        <WuIcon icon={icon} className="text-base text-accent" aria-hidden />
        <WuSubtext size="sm" className="text-ink-muted">
          {label}
        </WuSubtext>
      </span>
      {value ? (
        <WuText size="md" className="text-right font-medium text-ink">
          {value}
        </WuText>
      ) : (
        <WuText size="md" className="text-right italic text-ink-muted">
          Not selected yet
        </WuText>
      )}
    </div>
  );
}

interface BookingSummaryCardProps {
  studyTitle: string;
  dateLabel: string | null;
  timeLabel: string | null;
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
    <WuCard rounded className="overflow-hidden bg-surface-sunken p-0 wu-shadow-md">
      <WuCardHeader className="flex flex-col gap-0.5 px-5 py-4">
        <WuSubtext size="sm" className="text-ink-muted">
          Booking summary
        </WuSubtext>
        <WuText size="md" className="font-semibold text-ink">
          {studyTitle}
        </WuText>
      </WuCardHeader>

      <div className="divide-y divide-line px-5 py-1">
        <BookingSummaryRow icon="wm-calendar-today" label="Date" value={dateLabel} />
        <BookingSummaryRow icon="wm-schedule" label="Time" value={timeLabel} />
        <BookingSummaryRow
          icon="wm-hourglass"
          label="Duration"
          value={`${durationMinutes} minutes`}
        />
        <BookingSummaryRow icon="wm-globe" label="Timezone" value={timezoneLabel} />
      </div>
    </WuCard>
  );
}
