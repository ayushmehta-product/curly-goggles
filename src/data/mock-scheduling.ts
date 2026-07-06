export type AvailabilityMode = 'specific-slots' | 'fixed-range' | 'rolling-period';
export type ModeratorAssignmentMode = 'auto-assign' | 'manual-later';

export interface SelectOption {
  value: string;
  label: string;
}

export interface AvailabilityModeOption {
  value: AvailabilityMode;
  title: string;
  description: string;
  bestFor: string[];
}

export interface WeeklyAvailabilityDay {
  id: string;
  label: string;
  shortLabel: string;
  enabled: boolean;
  startTime: string;
  endTime: string;
}

export interface SpecificTimeSlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
}

export interface AvailabilityTemplate {
  id: string;
  label: string;
  description: string;
  days: WeeklyAvailabilityDay[];
}

export interface PreviewDate {
  id: string;
  weekday: string;
  day: string;
  month: string;
  availability: 'high' | 'medium' | 'low';
}

export const AVAILABILITY_MODES: AvailabilityModeOption[] = [
  {
    value: 'specific-slots',
    title: 'Specific Time Slots',
    description: 'Manually select specific dates and interview windows.',
    bestFor: ['executive interviews', 'limited availability', 'curated scheduling'],
  },
  {
    value: 'fixed-range',
    title: 'Fixed Date Range',
    description: 'Define a scheduling window with recurring weekly availability.',
    bestFor: ['active usability studies', 'sprint-based research', 'recruitment waves'],
  },
  {
    value: 'rolling-period',
    title: 'Rolling Availability Period',
    description: 'Keep interview availability continuously open into the future.',
    bestFor: ['continuous discovery', 'ongoing customer research', 'research panels'],
  },
];

export const TIMEZONE_OPTIONS: SelectOption[] = [
  { value: 'Asia/Calcutta', label: 'Asia/Calcutta' },
  { value: 'America/New_York', label: 'America/New_York' },
  { value: 'America/Los_Angeles', label: 'America/Los_Angeles' },
  { value: 'Europe/London', label: 'Europe/London' },
  { value: 'Europe/Berlin', label: 'Europe/Berlin' },
  { value: 'Asia/Singapore', label: 'Asia/Singapore' },
  { value: 'Asia/Tokyo', label: 'Asia/Tokyo' },
  { value: 'Australia/Sydney', label: 'Australia/Sydney' },
];

export const START_INCREMENT_OPTIONS: SelectOption[] = [
  { value: '15', label: '15 mins' },
  { value: '30', label: '30 mins' },
  { value: '60', label: '60 mins' },
];

export const MODERATOR_ASSIGNMENT_OPTIONS: SelectOption[] = [
  { value: 'auto-assign', label: 'Auto assign available moderator' },
  { value: 'manual-later', label: 'Assign later manually' },
];

export const DEFAULT_WEEKLY_AVAILABILITY: WeeklyAvailabilityDay[] = [
  { id: 'monday', label: 'Monday', shortLabel: 'Mon', enabled: true, startTime: '09:00', endTime: '17:00' },
  { id: 'tuesday', label: 'Tuesday', shortLabel: 'Tue', enabled: true, startTime: '09:00', endTime: '17:00' },
  { id: 'wednesday', label: 'Wednesday', shortLabel: 'Wed', enabled: true, startTime: '09:00', endTime: '17:00' },
  { id: 'thursday', label: 'Thursday', shortLabel: 'Thu', enabled: true, startTime: '09:00', endTime: '17:00' },
  { id: 'friday', label: 'Friday', shortLabel: 'Fri', enabled: true, startTime: '09:00', endTime: '15:00' },
  { id: 'saturday', label: 'Saturday', shortLabel: 'Sat', enabled: false, startTime: '10:00', endTime: '13:00' },
  { id: 'sunday', label: 'Sunday', shortLabel: 'Sun', enabled: false, startTime: '10:00', endTime: '13:00' },
];

export const AVAILABILITY_TEMPLATES: AvailabilityTemplate[] = [
  {
    id: 'standard',
    label: 'Standard business hours',
    description: 'Mon-Fri, 9:00 AM to 5:00 PM',
    days: DEFAULT_WEEKLY_AVAILABILITY,
  },
  {
    id: 'afternoons',
    label: 'Weekday afternoons',
    description: 'Mon-Fri, 1:00 PM to 6:00 PM',
    days: DEFAULT_WEEKLY_AVAILABILITY.map((day) => ({
      ...day,
      enabled: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].includes(day.id),
      startTime: '13:00',
      endTime: '18:00',
    })),
  },
  {
    id: 'evenings',
    label: 'Evenings only',
    description: 'Tue-Thu, 5:00 PM to 9:00 PM',
    days: DEFAULT_WEEKLY_AVAILABILITY.map((day) => ({
      ...day,
      enabled: ['tuesday', 'wednesday', 'thursday'].includes(day.id),
      startTime: '17:00',
      endTime: '21:00',
    })),
  },
  {
    id: 'global',
    label: 'Global coverage',
    description: 'Split windows for US, EMEA, and APAC overlap',
    days: DEFAULT_WEEKLY_AVAILABILITY.map((day) => ({
      ...day,
      enabled: ['monday', 'tuesday', 'wednesday', 'thursday'].includes(day.id),
      startTime: '07:00',
      endTime: '19:00',
    })),
  },
  {
    id: 'custom',
    label: 'Custom',
    description: 'Use manually adjusted availability',
    days: DEFAULT_WEEKLY_AVAILABILITY,
  },
];

export const INITIAL_SPECIFIC_SLOTS: SpecificTimeSlot[] = [
  { id: 'slot-1', date: '2026-05-18', startTime: '10:00', endTime: '12:00' },
  { id: 'slot-2', date: '2026-05-20', startTime: '14:00', endTime: '17:00' },
];

export const PREVIEW_DATES: PreviewDate[] = [
  { id: 'preview-1', weekday: 'Mon', day: '18', month: 'May', availability: 'high' },
  { id: 'preview-2', weekday: 'Tue', day: '19', month: 'May', availability: 'medium' },
  { id: 'preview-3', weekday: 'Wed', day: '20', month: 'May', availability: 'high' },
  { id: 'preview-4', weekday: 'Thu', day: '21', month: 'May', availability: 'medium' },
  { id: 'preview-5', weekday: 'Fri', day: '22', month: 'May', availability: 'low' },
];

export const BLACKOUT_DAYS = [
  { id: 'blackout-1', label: 'Company holiday', date: '2026-05-25' },
  { id: 'blackout-2', label: 'Research offsite', date: '2026-06-02' },
];
