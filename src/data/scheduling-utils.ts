import { addDays, format, isAfter, isBefore, isSameDay, parseISO, startOfDay } from 'date-fns';
import type {
  AvailabilityMode,
  SelectOption,
  SpecificTimeSlot,
  WeeklyAvailabilityDay,
} from '@/data/mock-scheduling';

export const PARTICIPANT_BOOKING_STORAGE_KEY = 'ux-participant-booking-preview';
export const DEFAULT_INTERVIEW_DURATION_MINUTES = 30;

export interface BlackoutDayConfig {
  id: string;
  label: string;
  date: string;
}

export interface ParticipantBookingConfig {
  studyTitle: string;
  interviewDurationMinutes: number;
  availabilityMode: AvailabilityMode;
  specificSlots: SpecificTimeSlot[];
  startDate: string;
  endDate: string;
  weeklyAvailability: WeeklyAvailabilityDay[];
  rollingWindowDays: number;
  blackoutDays: BlackoutDayConfig[];
  studyTimezone: string;
  participantTimezone: string;
  bufferMinutes: number;
  minimumNoticeHours: number;
  startIncrementMinutes: number;
  bookingWindowDays: number;
}

export interface BookableDate {
  id: string;
  date: string;
  weekday: string;
  day: string;
  month: string;
  availability: 'high' | 'medium' | 'low';
  slotCount: number;
}

export interface BookableTimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  label: string;
}

const DAY_IDS = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
] as const;

function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function formatTimeLabel(time: string) {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 || 12;
  return `${hour12}:${String(minutes).padStart(2, '0')} ${period}`;
}

function getWeeklyDayForDate(date: Date, weeklyAvailability: WeeklyAvailabilityDay[]) {
  const dayId = DAY_IDS[date.getDay()];
  return weeklyAvailability.find((day) => day.id === dayId);
}

function isBlackoutDate(date: Date, blackoutDays: BlackoutDayConfig[]) {
  return blackoutDays.some((day) => isSameDay(parseISO(day.date), date));
}

function isWithinBookingWindow(date: Date, referenceDate: Date, bookingWindowDays: number) {
  const windowEnd = addDays(startOfDay(referenceDate), bookingWindowDays);
  return !isBefore(date, startOfDay(referenceDate)) && !isAfter(date, windowEnd);
}

function meetsMinimumNotice(
  date: string,
  startTime: string,
  minimumNoticeHours: number,
  referenceDate: Date
) {
  const slotDateTime = parseISO(`${date}T${startTime}`);
  const earliestBookable = new Date(referenceDate.getTime() + minimumNoticeHours * 60 * 60 * 1000);
  return isAfter(slotDateTime, earliestBookable);
}

export function generateTimeSlotsForWindow(
  startTime: string,
  endTime: string,
  durationMinutes: number,
  bufferMinutes: number,
  incrementMinutes: number
): { startTime: string; endTime: string }[] {
  const windowStart = timeToMinutes(startTime);
  const windowEnd = timeToMinutes(endTime);
  const sessionLength = durationMinutes + bufferMinutes;
  const slots: { startTime: string; endTime: string }[] = [];

  for (
    let cursor = windowStart;
    cursor + durationMinutes <= windowEnd;
    cursor += Math.max(incrementMinutes, sessionLength)
  ) {
    slots.push({
      startTime: minutesToTime(cursor),
      endTime: minutesToTime(cursor + durationMinutes),
    });
  }

  return slots;
}

function getAvailabilityLevel(slotCount: number): BookableDate['availability'] {
  if (slotCount >= 6) return 'high';
  if (slotCount >= 3) return 'medium';
  return 'low';
}

function buildBookableDate(date: Date, slotCount: number): BookableDate {
  return {
    id: format(date, 'yyyy-MM-dd'),
    date: format(date, 'yyyy-MM-dd'),
    weekday: format(date, 'EEE'),
    day: format(date, 'd'),
    month: format(date, 'MMM'),
    availability: getAvailabilityLevel(slotCount),
    slotCount,
  };
}

export function computeAvailableDates(
  config: ParticipantBookingConfig,
  referenceDate = new Date()
): BookableDate[] {
  const dates: BookableDate[] = [];

  if (config.availabilityMode === 'specific-slots') {
    const uniqueDates = [...new Set(config.specificSlots.map((slot) => slot.date))].sort();

    uniqueDates.forEach((dateValue) => {
      const date = parseISO(dateValue);
      if (isBlackoutDate(date, config.blackoutDays)) return;

      const slotCount = computeTimeSlotsForDate(config, dateValue, referenceDate).length;
      if (slotCount === 0) return;

      dates.push(buildBookableDate(date, slotCount));
    });

    return dates;
  }

  const rangeStart =
    config.availabilityMode === 'rolling-period'
      ? startOfDay(referenceDate)
      : startOfDay(parseISO(config.startDate));
  const rangeEnd =
    config.availabilityMode === 'rolling-period'
      ? addDays(startOfDay(referenceDate), config.rollingWindowDays)
      : startOfDay(parseISO(config.endDate));

  for (let cursor = rangeStart; !isAfter(cursor, rangeEnd); cursor = addDays(cursor, 1)) {
    if (isBlackoutDate(cursor, config.blackoutDays)) continue;
    if (!isWithinBookingWindow(cursor, referenceDate, config.bookingWindowDays)) continue;

    const weeklyDay = getWeeklyDayForDate(cursor, config.weeklyAvailability);
    if (!weeklyDay?.enabled) continue;

    const slotCount = computeTimeSlotsForDate(config, format(cursor, 'yyyy-MM-dd'), referenceDate).length;
    if (slotCount === 0) continue;

    dates.push(buildBookableDate(cursor, slotCount));
  }

  return dates;
}

export function computeTimeSlotsForDate(
  config: ParticipantBookingConfig,
  date: string,
  referenceDate = new Date()
): BookableTimeSlot[] {
  const slots: BookableTimeSlot[] = [];

  if (config.availabilityMode === 'specific-slots') {
    config.specificSlots
      .filter((slot) => slot.date === date)
      .forEach((slot) => {
        generateTimeSlotsForWindow(
          slot.startTime,
          slot.endTime,
          config.interviewDurationMinutes,
          config.bufferMinutes,
          config.startIncrementMinutes
        ).forEach((generatedSlot, index) => {
          if (!meetsMinimumNotice(date, generatedSlot.startTime, config.minimumNoticeHours, referenceDate)) {
            return;
          }

          slots.push({
            id: `${date}-${generatedSlot.startTime}-${index}`,
            startTime: generatedSlot.startTime,
            endTime: generatedSlot.endTime,
            label: `${formatTimeLabel(generatedSlot.startTime)} – ${formatTimeLabel(generatedSlot.endTime)}`,
          });
        });
      });
  } else {
    const weeklyDay = getWeeklyDayForDate(parseISO(date), config.weeklyAvailability);
    if (!weeklyDay?.enabled) return [];

    generateTimeSlotsForWindow(
      weeklyDay.startTime,
      weeklyDay.endTime,
      config.interviewDurationMinutes,
      config.bufferMinutes,
      config.startIncrementMinutes
    ).forEach((generatedSlot, index) => {
      if (!meetsMinimumNotice(date, generatedSlot.startTime, config.minimumNoticeHours, referenceDate)) {
        return;
      }

      slots.push({
        id: `${date}-${generatedSlot.startTime}-${index}`,
        startTime: generatedSlot.startTime,
        endTime: generatedSlot.endTime,
        label: `${formatTimeLabel(generatedSlot.startTime)} – ${formatTimeLabel(generatedSlot.endTime)}`,
      });
    });
  }

  return slots.sort((firstSlot, secondSlot) =>
    firstSlot.startTime.localeCompare(secondSlot.startTime)
  );
}

export function saveParticipantBookingPreview(config: ParticipantBookingConfig) {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(PARTICIPANT_BOOKING_STORAGE_KEY, JSON.stringify(config));
}

export function loadParticipantBookingPreview(): ParticipantBookingConfig | null {
  if (typeof window === 'undefined') return null;

  const storedValue = window.sessionStorage.getItem(PARTICIPANT_BOOKING_STORAGE_KEY);
  if (!storedValue) return null;

  try {
    return JSON.parse(storedValue) as ParticipantBookingConfig;
  } catch {
    return null;
  }
}

export function buildDefaultParticipantBookingConfig(
  overrides: Partial<ParticipantBookingConfig> = {}
): ParticipantBookingConfig {
  const today = startOfDay(new Date());

  return {
    studyTitle: 'Enterprise Admin Onboarding Study',
    interviewDurationMinutes: DEFAULT_INTERVIEW_DURATION_MINUTES,
    availabilityMode: 'fixed-range',
    specificSlots: [],
    startDate: format(today, 'yyyy-MM-dd'),
    endDate: format(addDays(today, 21), 'yyyy-MM-dd'),
    weeklyAvailability: [],
    rollingWindowDays: 21,
    blackoutDays: [],
    studyTimezone: 'Asia/Calcutta',
    participantTimezone: 'America/New_York',
    bufferMinutes: 15,
    minimumNoticeHours: 24,
    startIncrementMinutes: 30,
    bookingWindowDays: 14,
    ...overrides,
  };
}

export function getTimezoneLabel(timezone: string, options: SelectOption[]) {
  return options.find((option) => option.value === timezone)?.label ?? timezone;
}

export function buildParticipantBookingConfig(input: {
  studyTitle?: string;
  availabilityMode: AvailabilityMode;
  specificSlots: SpecificTimeSlot[];
  startDate: string;
  endDate: string;
  weeklyAvailability: WeeklyAvailabilityDay[];
  rollingWindowDays: number;
  blackoutDays: BlackoutDayConfig[];
  studyTimezone: string;
  participantTimezone: string;
  bufferMinutes: number;
  minimumNoticeHours: number;
  startIncrementMinutes: number;
  bookingWindowDays: number;
  interviewDurationMinutes?: number;
}): ParticipantBookingConfig {
  return {
    studyTitle: input.studyTitle ?? 'New Moderated Study',
    interviewDurationMinutes: input.interviewDurationMinutes ?? DEFAULT_INTERVIEW_DURATION_MINUTES,
    availabilityMode: input.availabilityMode,
    specificSlots: input.specificSlots,
    startDate: input.startDate,
    endDate: input.endDate,
    weeklyAvailability: input.weeklyAvailability,
    rollingWindowDays: input.rollingWindowDays,
    blackoutDays: input.blackoutDays,
    studyTimezone: input.studyTimezone,
    participantTimezone: input.participantTimezone,
    bufferMinutes: input.bufferMinutes,
    minimumNoticeHours: input.minimumNoticeHours,
    startIncrementMinutes: input.startIncrementMinutes,
    bookingWindowDays: input.bookingWindowDays,
  };
}
