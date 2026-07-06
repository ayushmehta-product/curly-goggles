export type TeamMemberRole = 'moderator' | 'observer';

export interface StudyTeamMember {
  id: string;
  fullName: string;
  email: string;
  initials: string;
  timezone: string;
  role: TeamMemberRole;
  functionalRole: string;
  availabilityStatus: string;
  timezoneOverlap: string;
  sessionOwnership?: string;
  accessStatus?: string;
}

export const MOCK_MODERATORS: StudyTeamMember[] = [
  {
    id: 'mod-amara-shah',
    fullName: 'Amara Shah',
    email: 'amara.shah@questionpro.com',
    initials: 'AS',
    timezone: 'Asia/Calcutta',
    role: 'moderator',
    functionalRole: 'Lead UX Researcher',
    availabilityStatus: 'Ready for interviews',
    timezoneOverlap: 'Strong APAC overlap',
    sessionOwnership: 'Owns onboarding and synthesis sessions',
  },
  {
    id: 'mod-lena-hoffman',
    fullName: 'Lena Hoffman',
    email: 'lena.hoffman@questionpro.com',
    initials: 'LH',
    timezone: 'Europe/Berlin',
    role: 'moderator',
    functionalRole: 'Senior Product Researcher',
    availabilityStatus: 'Availability confirmed',
    timezoneOverlap: 'Good EMEA overlap',
    sessionOwnership: 'Covers enterprise workflow interviews',
  },
  {
    id: 'mod-marcus-lee',
    fullName: 'Marcus Lee',
    email: 'marcus.lee@questionpro.com',
    initials: 'ML',
    timezone: 'America/Los_Angeles',
    role: 'moderator',
    functionalRole: 'Research Operations Partner',
    availabilityStatus: 'Needs schedule review',
    timezoneOverlap: 'Limited APAC overlap',
    sessionOwnership: 'Backup moderator for US sessions',
  },
  {
    id: 'mod-priya-nair',
    fullName: 'Priya Nair',
    email: 'priya.nair@questionpro.com',
    initials: 'PN',
    timezone: 'Asia/Singapore',
    role: 'moderator',
    functionalRole: 'Qualitative Researcher',
    availabilityStatus: 'Ready for interviews',
    timezoneOverlap: 'Strong APAC overlap',
    sessionOwnership: 'Owns mobile walkthrough interviews',
  },
  {
    id: 'mod-nathan-brooks',
    fullName: 'Nathan Brooks',
    email: 'nathan.brooks@questionpro.com',
    initials: 'NB',
    timezone: 'America/New_York',
    role: 'moderator',
    functionalRole: 'Customer Insights Researcher',
    availabilityStatus: 'Availability pending',
    timezoneOverlap: 'Good US overlap',
    sessionOwnership: 'Covers customer support workflow sessions',
  },
  {
    id: 'mod-sofia-alvarez',
    fullName: 'Sofia Alvarez',
    email: 'sofia.alvarez@questionpro.com',
    initials: 'SA',
    timezone: 'Europe/London',
    role: 'moderator',
    functionalRole: 'Principal UX Researcher',
    availabilityStatus: 'Ready for interviews',
    timezoneOverlap: 'Good EMEA overlap',
    sessionOwnership: 'Covers pricing and trust interviews',
  },
  {
    id: 'mod-kenji-watanabe',
    fullName: 'Kenji Watanabe',
    email: 'kenji.watanabe@questionpro.com',
    initials: 'KW',
    timezone: 'Asia/Tokyo',
    role: 'moderator',
    functionalRole: 'Product Researcher',
    availabilityStatus: 'Availability confirmed',
    timezoneOverlap: 'Strong APAC overlap',
    sessionOwnership: 'Covers mobile experience interviews',
  },
  {
    id: 'mod-olivia-hughes',
    fullName: 'Olivia Hughes',
    email: 'olivia.hughes@questionpro.com',
    initials: 'OH',
    timezone: 'America/New_York',
    role: 'moderator',
    functionalRole: 'Research Operations Lead',
    availabilityStatus: 'Ready for interviews',
    timezoneOverlap: 'Good US overlap',
    sessionOwnership: 'Covers procurement workflow sessions',
  },
  {
    id: 'mod-farhan-khan',
    fullName: 'Farhan Khan',
    email: 'farhan.khan@questionpro.com',
    initials: 'FK',
    timezone: 'Asia/Dubai',
    role: 'moderator',
    functionalRole: 'Qualitative Research Manager',
    availabilityStatus: 'Availability pending',
    timezoneOverlap: 'Partial EMEA overlap',
    sessionOwnership: 'Covers healthcare workflow sessions',
  },
];

export const MOCK_OBSERVERS: StudyTeamMember[] = [
  {
    id: 'obs-zoe-martin',
    fullName: 'Zoe Martin',
    email: 'zoe.martin@questionpro.com',
    initials: 'ZM',
    timezone: 'America/New_York',
    role: 'observer',
    functionalRole: 'Product Manager',
    availabilityStatus: 'Approved observer',
    timezoneOverlap: 'Good US overlap',
    accessStatus: 'Can join approved sessions',
  },
  {
    id: 'obs-ravi-menon',
    fullName: 'Ravi Menon',
    email: 'ravi.menon@questionpro.com',
    initials: 'RM',
    timezone: 'Asia/Calcutta',
    role: 'observer',
    functionalRole: 'Product Designer',
    availabilityStatus: 'Approved observer',
    timezoneOverlap: 'Strong APAC overlap',
    accessStatus: 'Can join approved sessions',
  },
  {
    id: 'obs-elena-rossi',
    fullName: 'Elena Rossi',
    email: 'elena.rossi@questionpro.com',
    initials: 'ER',
    timezone: 'Europe/London',
    role: 'observer',
    functionalRole: 'Executive Sponsor',
    availabilityStatus: 'Access review needed',
    timezoneOverlap: 'Good EMEA overlap',
    accessStatus: 'Pending final approval',
  },
  {
    id: 'obs-maya-chen',
    fullName: 'Maya Chen',
    email: 'maya.chen@questionpro.com',
    initials: 'MC',
    timezone: 'Asia/Singapore',
    role: 'observer',
    functionalRole: 'Customer Experience Lead',
    availabilityStatus: 'Approved observer',
    timezoneOverlap: 'Strong APAC overlap',
    accessStatus: 'Can join approved sessions',
  },
  {
    id: 'obs-daniel-price',
    fullName: 'Daniel Price',
    email: 'daniel.price@questionpro.com',
    initials: 'DP',
    timezone: 'America/Los_Angeles',
    role: 'observer',
    functionalRole: 'Design Director',
    availabilityStatus: 'Access review needed',
    timezoneOverlap: 'Limited APAC overlap',
    accessStatus: 'Pending final approval',
  },
];

export const INITIAL_MODERATOR_IDS = [
  'mod-amara-shah',
  'mod-lena-hoffman',
  'mod-marcus-lee',
  'mod-priya-nair',
];

export const INITIAL_OBSERVER_IDS = [
  'obs-zoe-martin',
  'obs-ravi-menon',
  'obs-elena-rossi',
  'obs-maya-chen',
];

export const INITIAL_PRIMARY_MODERATOR_ID = 'mod-amara-shah';
