export type RecruitmentMethod = 'panel' | 'own' | 'custom';

export type ScreenerType = 'technical' | 'verbal-response' | 'survey-question';

export interface ScreenerItem {
  id: string;
  type: ScreenerType;
  prompt: string;
}

export interface DemographicFilters {
  gender: string;
  age: string;
  country: string;
  income: string;
  education: string;
  employment: string;
  familyStatus: string;
  parentalStatus: string;
  communityType: string;
  socialNetwork: string;
}

export interface SelectOption {
  value: string;
  label: string;
}

export const RECRUITMENT_OPTIONS: Array<{
  value: RecruitmentMethod;
  title: string;
  description: string;
  icon: string;
}> = [
  {
    value: 'panel',
    title: 'QuestionPro UX panel',
    description: 'Let QuestionPro UX fulfil your test from our curated panel',
    icon: 'wm-groups',
  },
  {
    value: 'own',
    title: 'My own participants',
    description: 'Send a custom link to your own participants',
    icon: 'wm-link',
  },
  {
    value: 'custom',
    title: 'My custom panel',
    description: 'Onboard your own participants to a custom panel',
    icon: 'wm-person-add',
  },
];

export const RECRUITMENT_LABELS: Record<RecruitmentMethod, string> = {
  panel: 'QuestionPro UX panel',
  own: 'My own participants',
  custom: 'My custom panel',
};

export const SCREENER_TYPE_LABELS: Record<ScreenerType, string> = {
  technical: 'Technical check',
  'verbal-response': 'Verbal response',
  'survey-question': 'Survey question',
};

export const SCREENER_TYPE_DESCRIPTIONS: Record<ScreenerType, string> = {
  technical: 'Confirms device, browser, and connection quality before the test.',
  'verbal-response': 'Participant records a short spoken answer used to gauge articulateness.',
  'survey-question': 'A written multiple-choice or open text question used to qualify participants.',
};

function anyOption(label: string): SelectOption {
  return { value: 'any', label };
}

export const GENDER_OPTIONS: SelectOption[] = [
  anyOption('Any gender'),
  { value: 'woman', label: 'Woman' },
  { value: 'man', label: 'Man' },
  { value: 'non-binary', label: 'Non-binary' },
  { value: 'prefer-not', label: 'Prefer not to say' },
];

export const AGE_OPTIONS: SelectOption[] = [
  anyOption('Any age'),
  { value: '18-24', label: '18–24' },
  { value: '25-34', label: '25–34' },
  { value: '35-44', label: '35–44' },
  { value: '45-54', label: '45–54' },
  { value: '55+', label: '55+' },
];

export const COUNTRY_OPTIONS: SelectOption[] = [
  anyOption('Any country'),
  { value: 'us', label: 'United States' },
  { value: 'uk', label: 'United Kingdom' },
  { value: 'ca', label: 'Canada' },
  { value: 'in', label: 'India' },
  { value: 'de', label: 'Germany' },
  { value: 'au', label: 'Australia' },
];

export const INCOME_OPTIONS: SelectOption[] = [
  anyOption('Any income'),
  { value: 'under-40', label: 'Under $40,000' },
  { value: '40-80', label: '$40,000–$80,000' },
  { value: '80-120', label: '$80,000–$120,000' },
  { value: 'over-120', label: 'Over $120,000' },
];

export const EDUCATION_OPTIONS: SelectOption[] = [
  anyOption('Any education level'),
  { value: 'high-school', label: 'High school' },
  { value: 'bachelors', label: "Bachelor's" },
  { value: 'masters', label: "Master's or higher" },
];

export const EMPLOYMENT_OPTIONS: SelectOption[] = [
  anyOption('Any employment status'),
  { value: 'full-time', label: 'Full-time' },
  { value: 'part-time', label: 'Part-time' },
  { value: 'self-employed', label: 'Self-employed' },
  { value: 'student', label: 'Student' },
  { value: 'not-employed', label: 'Not employed' },
];

export const FAMILY_STATUS_OPTIONS: SelectOption[] = [
  anyOption('Any relationship status'),
  { value: 'single', label: 'Single' },
  { value: 'partnered', label: 'Partnered' },
  { value: 'married', label: 'Married' },
];

export const PARENTAL_STATUS_OPTIONS: SelectOption[] = [
  anyOption('Any parental status'),
  { value: 'has-children', label: 'Has children' },
  { value: 'no-children', label: 'No children' },
];

export const COMMUNITY_OPTIONS: SelectOption[] = [
  anyOption('Any community type'),
  { value: 'urban', label: 'Urban' },
  { value: 'suburban', label: 'Suburban' },
  { value: 'rural', label: 'Rural' },
];

export const SOCIAL_NETWORK_OPTIONS: SelectOption[] = [
  anyOption('Any level of usage'),
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'rarely', label: 'Rarely' },
];

export const DEMOGRAPHIC_FIELDS: Array<{
  key: keyof DemographicFilters;
  label: string;
  options: SelectOption[];
}> = [
  { key: 'gender', label: 'Gender', options: GENDER_OPTIONS },
  { key: 'age', label: 'Age', options: AGE_OPTIONS },
  { key: 'country', label: 'Country/region', options: COUNTRY_OPTIONS },
  { key: 'income', label: 'Income', options: INCOME_OPTIONS },
  { key: 'education', label: 'Education', options: EDUCATION_OPTIONS },
  { key: 'employment', label: 'Employment', options: EMPLOYMENT_OPTIONS },
  { key: 'familyStatus', label: 'Family status', options: FAMILY_STATUS_OPTIONS },
  { key: 'parentalStatus', label: 'Parental status', options: PARENTAL_STATUS_OPTIONS },
  { key: 'communityType', label: 'Community type', options: COMMUNITY_OPTIONS },
  { key: 'socialNetwork', label: 'Social network usage', options: SOCIAL_NETWORK_OPTIONS },
];

export const DEFAULT_DEMOGRAPHICS: DemographicFilters = {
  gender: 'any',
  age: 'any',
  country: 'any',
  income: 'any',
  education: 'any',
  employment: 'any',
  familyStatus: 'any',
  parentalStatus: 'any',
  communityType: 'any',
  socialNetwork: 'any',
};

export function demographicsEnabled(filters: DemographicFilters): boolean {
  return Object.values(filters).some((value) => value !== 'any');
}
