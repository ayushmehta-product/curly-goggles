'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { format, parseISO } from 'date-fns';
import { BookingSummaryCard } from '@/components/participant/BookingSummaryCard';
import { DEFAULT_PARTICIPANT_BOOKING_CONFIG } from '@/data/mock-participant-booking';
import { TIMEZONE_OPTIONS } from '@/data/mock-scheduling';
import {
  computeAvailableDates,
  computeTimeSlotsForDate,
  loadParticipantBookingPreview,
  type BookableDate,
  type BookableTimeSlot,
  type ParticipantBookingConfig,
} from '@/data/scheduling-utils';

const WuButton = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuButton })),
  { ssr: false }
);
const WuCard = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuCard })),
  { ssr: false }
);
const WuChip = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuChip })),
  { ssr: false }
);
const WuCombobox = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuCombobox })),
  { ssr: false }
);
const WuDatePicker = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuDatePicker })),
  { ssr: false }
);
const WuDisplay = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuDisplay })),
  { ssr: false }
);
const WuFooter = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuFooter })),
  { ssr: false }
);
const WuHeading = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuHeading })),
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

function formatShortDate(date: string) {
  return format(parseISO(date), 'EEE, MMM d');
}

function formatSlotChipLabel(startTime: string) {
  const [hours, minutes] = startTime.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 || 12;
  return `${hour12}:${String(minutes).padStart(2, '0')} ${period}`;
}

function formatConfirmationSummary(date: string, timeLabel: string) {
  const compactTime = timeLabel.replace(' – ', '–');
  return `Your interview is booked for ${formatShortDate(date)} · ${compactTime}`;
}

function ConfirmationState({ summary }: { summary: string }) {
  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center px-4 py-12 text-center">
      <span className="flex h-20 w-20 items-center justify-center rounded-full bg-success-surface">
        <WuIcon icon="wm-check" className="text-4xl text-success" aria-hidden />
      </span>
      <WuDisplay size="md" className="mt-6 text-ink">
        You&apos;re all set
      </WuDisplay>
      <WuText size="md" className="mt-3 max-w-md text-ink">
        {summary}
      </WuText>
      <WuSubtext size="sm" className="mt-4 text-ink-muted">
        We&apos;ve sent the details to your email.
      </WuSubtext>
    </div>
  );
}

export function ParticipantBookingExperience() {
  const [config, setConfig] = useState<ParticipantBookingConfig>(DEFAULT_PARTICIPANT_BOOKING_CONFIG);
  const [selectedDate, setSelectedDate] = useState<BookableDate | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<BookableTimeSlot | null>(null);
  const [participantTimezone, setParticipantTimezone] = useState(TIMEZONE_OPTIONS[1]);
  const [confirmationSummary, setConfirmationSummary] = useState('');
  const [isConfirmed, setIsConfirmed] = useState(false);

  useEffect(() => {
    const storedConfig = loadParticipantBookingPreview();
    if (storedConfig) {
      setConfig(storedConfig);
      setParticipantTimezone(
        TIMEZONE_OPTIONS.find((option) => option.value === storedConfig.participantTimezone) ??
          TIMEZONE_OPTIONS[1]
      );
    }
  }, []);

  const bookingConfig = useMemo(
    () => ({
      ...config,
      participantTimezone: participantTimezone.value,
    }),
    [config, participantTimezone]
  );

  const availableDates = useMemo(
    () => computeAvailableDates(bookingConfig),
    [bookingConfig]
  );

  const timeSlots = useMemo(
    () =>
      selectedDate ? computeTimeSlotsForDate(bookingConfig, selectedDate.date) : [],
    [bookingConfig, selectedDate]
  );

  const calendarRange = useMemo(() => {
    if (availableDates.length === 0) return null;

    return {
      start: parseISO(availableDates[0].date),
      end: parseISO(availableDates[availableDates.length - 1].date),
    };
  }, [availableDates]);

  const hasSelectedDate = selectedDate !== null;
  const hasSelectedTime = selectedTimeSlot !== null;

  function handleSelectDate(date?: Date) {
    if (!date) {
      setSelectedDate(null);
      setSelectedTimeSlot(null);
      return;
    }

    const dateKey = format(date, 'yyyy-MM-dd');
    const bookableDate = availableDates.find((item) => item.date === dateKey);
    if (!bookableDate) return;

    setSelectedDate(bookableDate);
    setSelectedTimeSlot(null);
  }

  function handleConfirmBooking() {
    if (!selectedDate || !selectedTimeSlot) return;

    setConfirmationSummary(
      formatConfirmationSummary(selectedDate.date, selectedTimeSlot.label)
    );
    setIsConfirmed(true);
  }

  if (isConfirmed) {
    return (
      <div className="flex min-h-screen flex-col bg-surface">
        <main className="flex-1 w-full p-6">
          <div className="mx-auto w-full max-w-[480px]">
            <ConfirmationState summary={confirmationSummary} />
          </div>
        </main>
        <WuFooter>QuestionPro UX</WuFooter>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <main className="flex-1 w-full p-6">
        <div className="mx-auto flex w-full max-w-[480px] flex-col gap-8">
          <header className="flex flex-col gap-1">
            <WuSubtext size="sm" className="font-semibold uppercase tracking-wide text-accent">
              Participant booking
            </WuSubtext>
            <WuHeading size="lg" className="font-semibold text-ink">
              {config.studyTitle}
            </WuHeading>
            <WuText size="md" className="text-ink-muted">
              You&apos;re booking a {config.interviewDurationMinutes}-minute interview for this study.
            </WuText>
          </header>

          <WuCombobox
            Label="Your timezone"
            data={TIMEZONE_OPTIONS}
            accessorKey={{ value: 'value', label: 'label' }}
            value={participantTimezone}
            onSelect={(value) => setParticipantTimezone(value as typeof participantTimezone)}
            enableSearch
            variant="outlined"
            placeholder="Search timezone"
          />

          <section className="flex flex-col gap-2">
            <WuHeading size="sm">Choose a date</WuHeading>

            {availableDates.length === 0 ? (
              <WuCard rounded className="bg-surface-sunken p-5">
                <WuText size="sm" className="text-ink">
                  No interview dates available
                </WuText>
                <WuSubtext size="sm" className="mt-2 text-ink-muted">
                  The research team has not opened any bookable dates yet
                </WuSubtext>
              </WuCard>
            ) : (
              <div className="date-field">
                <WuDatePicker
                  value={selectedDate ? parseISO(selectedDate.date) : undefined}
                  onChange={handleSelectDate}
                  minDate={calendarRange?.start}
                  maxDate={calendarRange?.end}
                  variant="outlined"
                  placeholder="Select date"
                  formatString="MMM d, yyyy"
                  showResetButton
                  onReset={() => handleSelectDate(undefined)}
                />
              </div>
            )}
          </section>

          <fieldset disabled={!hasSelectedDate} className="flex flex-col gap-2 border-0 p-0">
            <WuHeading size="sm">Choose a time</WuHeading>

            {!hasSelectedDate ? (
              <WuSubtext size="sm" className="text-ink-muted">
                Select a date to see available times
              </WuSubtext>
            ) : timeSlots.length === 0 ? (
              <WuCard rounded className="bg-surface-sunken p-5">
                <WuText size="sm" className="text-ink">
                  No time slots left on this date
                </WuText>
                <WuSubtext size="sm" className="mt-2 text-ink-muted">
                  Try another interview day
                </WuSubtext>
              </WuCard>
            ) : (
              <div className="flex flex-wrap gap-2">
                {timeSlots.map((slot) => (
                  <WuChip
                    key={slot.id}
                    variant="secondary"
                    size="md"
                    selected={selectedTimeSlot?.id === slot.id}
                    onClick={() => setSelectedTimeSlot(slot)}
                  >
                    {formatSlotChipLabel(slot.startTime)}
                  </WuChip>
                ))}
              </div>
            )}
          </fieldset>

          <fieldset disabled={!hasSelectedTime} className="flex flex-col gap-2 border-0 p-0">
            <WuHeading size="sm">Confirm your booking</WuHeading>

            <BookingSummaryCard
              studyTitle={config.studyTitle}
              dateLabel={selectedDate ? formatShortDate(selectedDate.date) : null}
              timeLabel={selectedTimeSlot?.label ?? null}
              durationMinutes={config.interviewDurationMinutes}
              timezoneLabel={participantTimezone.label}
            />

            <WuButton
              className={`w-full ${hasSelectedTime ? 'wu-shadow-sm' : ''}`}
              variant="primary"
              size="md"
              disabled={!hasSelectedTime}
              onClick={handleConfirmBooking}
            >
              Confirm booking
            </WuButton>
          </fieldset>
        </div>
      </main>
      <WuFooter>QuestionPro UX</WuFooter>
    </div>
  );
}
