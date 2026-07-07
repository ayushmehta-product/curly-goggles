import {
  BLACKOUT_DAYS,
  DEFAULT_WEEKLY_AVAILABILITY,
  INITIAL_SPECIFIC_SLOTS,
  TIMEZONE_OPTIONS,
} from '@/data/mock-scheduling';
import {
  buildDefaultParticipantBookingConfig,
  type ParticipantBookingConfig,
} from '@/data/scheduling-utils';

export const DEFAULT_PARTICIPANT_BOOKING_CONFIG: ParticipantBookingConfig =
  buildDefaultParticipantBookingConfig({
    availabilityMode: 'fixed-range',
    specificSlots: INITIAL_SPECIFIC_SLOTS,
    weeklyAvailability: DEFAULT_WEEKLY_AVAILABILITY,
    blackoutDays: BLACKOUT_DAYS,
    studyTimezone: TIMEZONE_OPTIONS[0].value,
    participantTimezone: TIMEZONE_OPTIONS[1].value,
  });
