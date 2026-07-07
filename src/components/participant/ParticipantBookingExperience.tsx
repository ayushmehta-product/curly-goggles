'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { format, parseISO } from 'date-fns';
import { BookingSummaryCard } from '@/components/participant/BookingSummaryCard';
import { ParticipantBookingHeader } from '@/components/participant/ParticipantBookingHeader';
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
      <WuIcon icon="wc-completion" className="text-6xl text-blue-600" aria-hidden />
      <WuDisplay size="md" className="mt-6 text-gray-900">
        You&apos;re all set
      </WuDisplay>
      <WuText size="md" className="mt-3 max-w-md text-gray-700">
        {summary}
      </WuText>
      <WuSubtext size="sm" className="mt-4 text-gray-500">
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
      <div className="flex min-h-screen flex-col bg-gray-50">
        <ParticipantBookingHeader studyTitle={config.studyTitle} />
        <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-6 py-8">
          <ConfirmationState summary={confirmationSummary} />
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <ParticipantBookingHeader studyTitle={config.studyTitle} />

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-10 px-6 py-8">
        <div className="max-w-sm">
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
        </div>

        <WuSubtext size="sm" className="text-gray-400">
          1. Pick a date · 2. Pick a time · 3. Confirm
        </WuSubtext>

        <section className="space-y-4">
          <WuHeading size="sm">Choose a date</WuHeading>

          {availableDates.length === 0 ? (
            <WuCard rounded className="border border-gray-200 bg-white p-6">
              <WuText size="sm">No interview dates available</WuText>
              <WuSubtext size="sm" className="mt-2">
                The research team has not opened any bookable dates yet
              </WuSubtext>
            </WuCard>
          ) : (
            <div className="max-w-xs">
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

        <fieldset disabled={!hasSelectedDate} className="space-y-4 border-0 p-0">
          <WuHeading size="sm">Choose a time</WuHeading>

          {!hasSelectedDate ? (
            <WuSubtext size="sm" className="text-gray-400">
              Select a date to see available times
            </WuSubtext>
          ) : timeSlots.length === 0 ? (
            <WuCard rounded className="border border-gray-200 bg-white p-6">
              <WuText size="sm">No time slots left on this date</WuText>
              <WuSubtext size="sm" className="mt-2">
                Try another interview day
              </WuSubtext>
            </WuCard>
          ) : (
            <div className="flex flex-wrap gap-2">
              {timeSlots.map((slot) => (
                <WuButton
                  key={slot.id}
                  variant="secondary"
                  selected={selectedTimeSlot?.id === slot.id}
                  onClick={() => setSelectedTimeSlot(slot)}
                >
                  {formatSlotChipLabel(slot.startTime)}
                </WuButton>
              ))}
            </div>
          )}
        </fieldset>

        <fieldset disabled={!hasSelectedTime} className="space-y-4 border-0 p-0">
          <WuHeading size="sm">Confirm your booking</WuHeading>

          <BookingSummaryCard
            studyTitle={config.studyTitle}
            dateLabel={selectedDate ? formatShortDate(selectedDate.date) : '—'}
            timeLabel={selectedTimeSlot?.label ?? '—'}
            durationMinutes={config.interviewDurationMinutes}
            timezoneLabel={participantTimezone.label}
          />

          <WuButton onClick={handleConfirmBooking}>Confirm booking</WuButton>
        </fieldset>
      </main>
    </div>
  );
}
