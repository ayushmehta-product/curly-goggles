'use client';

import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { SelectableCard } from '@/components/ui/SelectableCard';
import {
  AVAILABILITY_MODES,
  BLACKOUT_DAYS,
  DEFAULT_WEEKLY_AVAILABILITY,
  INITIAL_SPECIFIC_SLOTS,
  MODERATOR_ASSIGNMENT_OPTIONS,
  PREVIEW_DATES,
  START_INCREMENT_OPTIONS,
  TIMEZONE_OPTIONS,
  type AvailabilityMode,
  type PreviewDate,
  type SelectOption,
  type SpecificTimeSlot,
  type WeeklyAvailabilityDay,
} from '@/data/mock-scheduling';

const WuButton = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuButton })),
  { ssr: false }
);
const WuCombobox = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuCombobox })),
  { ssr: false }
);
const WuInput = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuInput })),
  { ssr: false }
);
const WuSelect = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuSelect })),
  { ssr: false }
);
const WuStepper = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuStepper })),
  { ssr: false }
);
const WuToggle = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuToggle })),
  { ssr: false }
);

interface SchedulingStepProps {
  onBack: () => void;
  onSaveDraft: () => void;
  onContinue: () => void;
}

interface BlackoutDay {
  id: string;
  label: string;
  date: string;
}

function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function calculateWindowSessions(startTime: string, endTime: string, bufferMinutes: number) {
  const interviewMinutes = 30;
  const windowMinutes = Math.max(timeToMinutes(endTime) - timeToMinutes(startTime), 0);
  return Math.max(Math.floor(windowMinutes / (interviewMinutes + bufferMinutes)), 0);
}

function Pill({ children, tone = 'gray' }: { children: ReactNode; tone?: 'blue' | 'green' | 'amber' | 'gray' }) {
  const styles = {
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700',
    amber: 'bg-amber-50 text-amber-700',
    gray: 'bg-gray-100 text-gray-700',
  };

  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${styles[tone]}`}>
      {children}
    </span>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="border-b border-gray-100 px-5 py-3">
      <h2 className="text-base font-semibold text-gray-900">{title}</h2>
      {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-gray-100 py-2 last:border-0">
      <span className="text-xs text-gray-500">{label}</span>
      <span className="max-w-[170px] truncate text-right text-xs font-semibold text-gray-800">
        {value}
      </span>
    </div>
  );
}

function getAvailabilityHealth(enabledDays: number, estimatedSessions: number) {
  if (estimatedSessions >= 24 && enabledDays >= 4) return { label: 'Excellent availability', tone: 'green' as const };
  if (estimatedSessions >= 10 && enabledDays >= 3) return { label: 'Good availability', tone: 'blue' as const };
  return { label: 'Low availability', tone: 'amber' as const };
}

function getAvailabilityModeIcon(mode: AvailabilityMode) {
  const modeIcons: Record<AvailabilityMode, ReactNode> = {
    'specific-slots': <span className="text-[10px] font-bold">SLOT</span>,
    'fixed-range': <span className="text-[10px] font-bold">DATE</span>,
    'rolling-period': <span className="text-[10px] font-bold">ROLL</span>,
  };

  return modeIcons[mode];
}

export function SchedulingStep({ onBack, onSaveDraft, onContinue }: SchedulingStepProps) {
  const [availabilityMode, setAvailabilityMode] = useState<AvailabilityMode>('fixed-range');
  const [specificSlots, setSpecificSlots] = useState<SpecificTimeSlot[]>(INITIAL_SPECIFIC_SLOTS);
  const [startDate, setStartDate] = useState('2026-05-18');
  const [endDate, setEndDate] = useState('2026-06-05');
  const [weeklyAvailability, setWeeklyAvailability] = useState<WeeklyAvailabilityDay[]>(
    DEFAULT_WEEKLY_AVAILABILITY
  );
  const [rollingWindowDays, setRollingWindowDays] = useState(21);
  const [blackoutDays, setBlackoutDays] = useState<BlackoutDay[]>(BLACKOUT_DAYS);
  const [newBlackoutDate, setNewBlackoutDate] = useState('2026-06-09');
  const [studyTimezone, setStudyTimezone] = useState<SelectOption>(TIMEZONE_OPTIONS[0]);
  const [previewTimezone, setPreviewTimezone] = useState<SelectOption>(TIMEZONE_OPTIONS[1]);
  const [bufferMinutes, setBufferMinutes] = useState(15);
  const [minimumNoticeHours, setMinimumNoticeHours] = useState(24);
  const [startIncrement, setStartIncrement] = useState<SelectOption>(START_INCREMENT_OPTIONS[1]);
  const [bookingWindowDays, setBookingWindowDays] = useState(14);
  const [moderatorAssignment, setModeratorAssignment] = useState<SelectOption>(
    MODERATOR_ASSIGNMENT_OPTIONS[0]
  );
  const [selectedPreviewDateId, setSelectedPreviewDateId] = useState(PREVIEW_DATES[0].id);

  const enabledDays = weeklyAvailability.filter((day) => day.enabled);
  const estimatedSessionsPerWeek = useMemo(
    () =>
      enabledDays.reduce(
        (total, day) => total + calculateWindowSessions(day.startTime, day.endTime, bufferMinutes),
        0
      ),
    [enabledDays, bufferMinutes]
  );
  const specificSlotSessions = specificSlots.reduce(
    (total, slot) => total + calculateWindowSessions(slot.startTime, slot.endTime, bufferMinutes),
    0
  );
  const estimatedTotalSessions =
    availabilityMode === 'specific-slots'
      ? specificSlotSessions
      : availabilityMode === 'rolling-period'
        ? Math.max(Math.round((estimatedSessionsPerWeek / 7) * rollingWindowDays), 0)
        : estimatedSessionsPerWeek * 3;
  const estimatedSessionsPerDay =
    enabledDays.length > 0 ? Math.max(Math.round(estimatedSessionsPerWeek / enabledDays.length), 1) : 0;
  const completionPace =
    estimatedSessionsPerDay > 0
      ? `${Math.max(Math.ceil(24 / estimatedSessionsPerDay), 1)} active interview days`
      : 'Add availability to estimate pace';
  const health = getAvailabilityHealth(enabledDays.length, estimatedTotalSessions);
  const selectedPreviewDate = PREVIEW_DATES.find((date) => date.id === selectedPreviewDateId) ?? PREVIEW_DATES[0];
  const selectedPreviewDateLabel = `${selectedPreviewDate.weekday}, ${selectedPreviewDate.month} ${selectedPreviewDate.day}`;

  function updateWeeklyDay(dayId: string, updates: Partial<WeeklyAvailabilityDay>) {
    setWeeklyAvailability((currentDays) =>
      currentDays.map((day) => (day.id === dayId ? { ...day, ...updates } : day))
    );
  }

  function addSpecificSlot() {
    setSpecificSlots((currentSlots) => [
      ...currentSlots,
      {
        id: `slot-${Date.now()}`,
        date: '2026-05-23',
        startTime: '10:00',
        endTime: '12:00',
      },
    ]);
  }

  function updateSpecificSlot(slotId: string, updates: Partial<SpecificTimeSlot>) {
    setSpecificSlots((currentSlots) =>
      currentSlots.map((slot) => (slot.id === slotId ? { ...slot, ...updates } : slot))
    );
  }

  function duplicateSpecificSlot(slot: SpecificTimeSlot) {
    setSpecificSlots((currentSlots) => [
      ...currentSlots,
      { ...slot, id: `slot-${Date.now()}` },
    ]);
  }

  function sortSpecificSlots() {
    setSpecificSlots((currentSlots) =>
      [...currentSlots].sort(
        (firstSlot, secondSlot) =>
          `${firstSlot.date}-${firstSlot.startTime}`.localeCompare(`${secondSlot.date}-${secondSlot.startTime}`)
      )
    );
  }

  function removeSpecificSlot(slotId: string) {
    setSpecificSlots((currentSlots) => currentSlots.filter((slot) => slot.id !== slotId));
  }

  function addBlackoutDay() {
    if (!newBlackoutDate) return;

    setBlackoutDays((currentDays) => [
      ...currentDays,
      { id: `blackout-${Date.now()}`, date: newBlackoutDate, label: 'Blackout day' },
    ]);
  }

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-4">
        <section className="rounded-lg border border-gray-200 bg-white">
          <SectionHeader
            title="Availability"
            subtitle="Configure when participants can book interview sessions."
          />
          <div className="space-y-4 p-5">
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
              {AVAILABILITY_MODES.map((mode) => (
                <SelectableCard
                  key={mode.value}
                  title={mode.title}
                  description={`${mode.description} Best for ${mode.bestFor.join(', ')}.`}
                  icon={getAvailabilityModeIcon(mode.value)}
                  isSelected={availabilityMode === mode.value}
                  onClick={() => setAvailabilityMode(mode.value)}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-gray-200 bg-white">
          <SectionHeader title="Availability Configuration" />
          <div className="space-y-4 p-5">
            {availabilityMode === 'specific-slots' && (
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm text-gray-600">
                    Manually add participant booking windows for specific interview dates.
                  </p>
                  <div className="flex gap-2">
                    <WuButton variant="secondary" onClick={sortSpecificSlots}>
                      Sort by date/time
                    </WuButton>
                    <WuButton onClick={addSpecificSlot}>Add Date</WuButton>
                  </div>
                </div>

                <div className="space-y-2">
                  {specificSlots.map((slot) => (
                    <div
                      key={slot.id}
                      className="grid grid-cols-1 gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 lg:grid-cols-[1.2fr_1fr_1fr_auto]"
                    >
                      <WuInput
                        Label="Date"
                        type="date"
                        variant="outlined"
                        value={slot.date}
                        onChange={(event) => updateSpecificSlot(slot.id, { date: event.target.value })}
                      />
                      <WuInput
                        Label="Start time"
                        type="time"
                        variant="outlined"
                        value={slot.startTime}
                        onChange={(event) =>
                          updateSpecificSlot(slot.id, { startTime: event.target.value })
                        }
                      />
                      <WuInput
                        Label="End time"
                        type="time"
                        variant="outlined"
                        value={slot.endTime}
                        onChange={(event) =>
                          updateSpecificSlot(slot.id, { endTime: event.target.value })
                        }
                      />
                      <div className="flex items-end gap-2">
                        <WuButton variant="secondary" onClick={() => duplicateSpecificSlot(slot)}>
                          Duplicate
                        </WuButton>
                        <WuButton variant="link" color="error" onClick={() => removeSpecificSlot(slot.id)}>
                          Remove
                        </WuButton>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {availabilityMode === 'fixed-range' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <WuInput
                    Label="Start date"
                    type="date"
                    variant="outlined"
                    value={startDate}
                    onChange={(event) => setStartDate(event.target.value)}
                  />
                  <WuInput
                    Label="End date"
                    type="date"
                    variant="outlined"
                    value={endDate}
                    onChange={(event) => setEndDate(event.target.value)}
                  />
                </div>
                <WeeklyAvailabilityEditor days={weeklyAvailability} onChange={updateWeeklyDay} />
              </div>
            )}

            {availabilityMode === 'rolling-period' && (
              <div className="space-y-4">
                <div className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-sm text-blue-800">
                  Availability automatically rolls forward so participants always see bookable
                  interview windows.
                </div>
                <div className="max-w-xs">
                  <WuStepper
                    Label="Rolling window length"
                    min={7}
                    max={90}
                    value={rollingWindowDays}
                    onChange={setRollingWindowDays}
                  />
                  <p className="mt-1 text-xs text-gray-500">Days shown to participants at any time.</p>
                </div>
                <WeeklyAvailabilityEditor days={weeklyAvailability} onChange={updateWeeklyDay} />
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                  <div className="mb-3 flex flex-wrap items-end gap-3">
                    <div className="w-56">
                      <WuInput
                        Label="Optional blackout day"
                        type="date"
                        variant="outlined"
                        value={newBlackoutDate}
                        onChange={(event) => setNewBlackoutDate(event.target.value)}
                      />
                    </div>
                    <WuButton variant="secondary" onClick={addBlackoutDay}>
                      Add blackout day
                    </WuButton>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {blackoutDays.map((day) => (
                      <span
                        key={day.id}
                        className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs text-gray-700"
                      >
                        {day.date}
                        <button
                          type="button"
                          className="text-gray-400 hover:text-red-600"
                          onClick={() =>
                            setBlackoutDays((currentDays) =>
                              currentDays.filter((currentDay) => currentDay.id !== day.id)
                            )
                          }
                        >
                          remove
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="rounded-lg border border-gray-200 bg-white">
          <SectionHeader title="Scheduling Rules" />
          <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2">
            <WuCombobox
              Label="Study Timezone"
              data={TIMEZONE_OPTIONS}
              accessorKey={{ value: 'value', label: 'label' }}
              value={studyTimezone}
              onSelect={(value) => setStudyTimezone(value as SelectOption)}
              enableSearch
              variant="outlined"
              placeholder="Search timezone"
            />
            <div>
              <WuStepper
                Label="Buffer Between Events"
                min={0}
                max={90}
                value={bufferMinutes}
                onChange={setBufferMinutes}
              />
              <p className="mt-1 text-xs text-gray-500">Minutes between interviews.</p>
            </div>
            <div>
              <WuStepper
                Label="Minimum Notice"
                min={1}
                max={168}
                value={minimumNoticeHours}
                onChange={setMinimumNoticeHours}
              />
              <p className="mt-1 text-xs text-gray-500">Hours before a participant can book.</p>
            </div>
            <WuSelect
              Label="Start Time Increments"
              data={START_INCREMENT_OPTIONS}
              accessorKey={{ value: 'value', label: 'label' }}
              value={startIncrement}
              onSelect={(value) => setStartIncrement(value as SelectOption)}
              variant="outlined"
            />
            <div>
              <WuStepper
                Label="Booking Window"
                min={1}
                max={90}
                value={bookingWindowDays}
                onChange={setBookingWindowDays}
              />
              <p className="mt-1 text-xs text-gray-500">
                Participants can only book up to {bookingWindowDays} days ahead.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-gray-200 bg-white">
          <SectionHeader title="Booking Behavior" />
          <div className="space-y-3 p-5">
            <div className="grid grid-cols-1 gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <p className="text-sm font-medium text-gray-800">Auto-confirm Bookings</p>
                <p className="text-xs text-gray-500">Participants receive confirmation immediately after booking.</p>
              </div>
              <WuToggle defaultChecked onChange={() => undefined} />
            </div>
            <div className="grid grid-cols-1 gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <p className="text-sm font-medium text-gray-800">Require Moderator Approval</p>
                <p className="text-xs text-gray-500">Review booking requests before confirming interview slots.</p>
              </div>
              <WuToggle onChange={() => undefined} />
            </div>
            <WuSelect
              Label="Moderator Assignment"
              data={MODERATOR_ASSIGNMENT_OPTIONS}
              accessorKey={{ value: 'value', label: 'label' }}
              value={moderatorAssignment}
              onSelect={(value) => setModeratorAssignment(value as SelectOption)}
              variant="outlined"
            />
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

      <aside className="space-y-4 xl:sticky xl:top-4 xl:self-start">
        <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Preview</h2>
              <p className="mt-1 text-sm text-gray-500">Participant booking experience</p>
            </div>
            <Pill tone={health.tone}>{health.label}</Pill>
          </div>

          <div className="mt-4 space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-3">
            <WuCombobox
              Label="Participant timezone"
              data={TIMEZONE_OPTIONS}
              accessorKey={{ value: 'value', label: 'label' }}
              value={previewTimezone}
              onSelect={(value) => setPreviewTimezone(value as SelectOption)}
              enableSearch
              variant="outlined"
            />
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Available interview days
              </p>
              <div className="grid grid-cols-5 gap-2">
                {PREVIEW_DATES.map((date) => (
                  <PreviewDateButton
                    key={date.id}
                    date={date}
                    isSelected={date.id === selectedPreviewDateId}
                    onClick={() => setSelectedPreviewDateId(date.id)}
                  />
                ))}
              </div>
            </div>
            <div className="rounded-lg bg-white p-3">
              <p className="text-sm font-semibold text-gray-900">{selectedPreviewDateLabel}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Pill tone="blue">10:00 AM</Pill>
                <Pill tone="blue">11:30 AM</Pill>
                <Pill tone="blue">2:00 PM</Pill>
              </div>
            </div>
            <WuButton className="w-full">Book Interview</WuButton>
          </div>
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900">Scheduling Capacity</h3>
          <div className="mt-3">
            <SummaryRow label="Estimated sessions" value={String(estimatedTotalSessions)} />
            <SummaryRow label="Sessions/day" value={String(estimatedSessionsPerDay)} />
            <SummaryRow label="Completion pace" value={completionPace} />
          </div>
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900">Scheduling Intelligence</h3>
          <div className="mt-3 space-y-2 text-xs leading-5 text-gray-600">
            <p className="rounded-md bg-blue-50 px-3 py-2 text-blue-800">
              Availability overlaps well across US and APAC timezones.
            </p>
            {enabledDays.some((day) => day.id === 'friday' && !day.enabled) && (
              <p className="rounded-md bg-amber-50 px-3 py-2 text-amber-800">
                Limited Friday availability may slow recruitment.
              </p>
            )}
            <p className="rounded-md bg-green-50 px-3 py-2 text-green-800">
              30-minute interviews maximize participant throughput for usability studies.
            </p>
          </div>
        </section>
      </aside>
    </div>
  );
}

function WeeklyAvailabilityEditor({
  days,
  onChange,
}: {
  days: WeeklyAvailabilityDay[];
  onChange: (dayId: string, updates: Partial<WeeklyAvailabilityDay>) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-gray-900">Weekly Study Availability</p>
      <div className="space-y-2">
        {days.map((day) => (
          <div
            key={day.id}
            className={`rounded-xl border p-3 transition ${
              day.enabled ? 'border-blue-200 bg-white shadow-sm' : 'border-gray-200 bg-gray-50'
            }`}
          >
            <div className="grid grid-cols-1 gap-3 md:grid-cols-[auto_120px_minmax(0,1fr)_minmax(0,1fr)] md:items-center">
              <label className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-gray-200 bg-white">
                <input
                  type="checkbox"
                  checked={day.enabled}
                  onChange={(event) => onChange(day.id, { enabled: event.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  aria-label={`Enable ${day.label}`}
                />
              </label>
              <div>
                <p className={`text-sm font-semibold ${day.enabled ? 'text-gray-900' : 'text-gray-400'}`}>
                  {day.label}
                </p>
                <p className="text-xs text-gray-400">{day.enabled ? 'Available' : 'Not available'}</p>
              </div>
              <WuInput
                Label="Start"
                type="time"
                variant="outlined"
                value={day.startTime}
                disabled={!day.enabled}
                onChange={(event) => onChange(day.id, { startTime: event.target.value })}
              />
              <WuInput
                Label="End"
                type="time"
                variant="outlined"
                value={day.endTime}
                disabled={!day.enabled}
                onChange={(event) => onChange(day.id, { endTime: event.target.value })}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PreviewDateButton({
  date,
  isSelected,
  onClick,
}: {
  date: PreviewDate;
  isSelected: boolean;
  onClick: () => void;
}) {
  const availabilityStyles = {
    high: 'text-green-600',
    medium: 'text-blue-600',
    low: 'text-amber-600',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg border px-2 py-2 text-center ${
        isSelected ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-white hover:bg-gray-50'
      }`}
    >
      <p className="text-xs font-medium text-gray-500">{date.weekday}</p>
      <p className="text-sm font-semibold text-gray-900">{date.day}</p>
      <p className={`text-[11px] font-medium ${availabilityStyles[date.availability]}`}>
        {date.availability}
      </p>
    </button>
  );
}
