export interface FocusGroupStudyDetails {
  focusGroupId: string;
  /** Short numeric identifier shown on the overview card, e.g. "#190". */
  numericId: string;
  deviceType: string;
  demographics: string;
  /** When the focus group's participant order/booking was placed. */
  orderedAt: string;
}

export const MOCK_FOCUS_GROUP_STUDY_DETAILS: FocusGroupStudyDetails[] = [
  { focusGroupId: 'fg-001', numericId: '#181', deviceType: 'Desktop', demographics: 'Using private participants', orderedAt: '2026-07-09T09:05:00.000+05:30' },
  { focusGroupId: 'fg-002', numericId: '#182', deviceType: 'Desktop', demographics: 'Using QuestionPro UX panel', orderedAt: '2026-07-08T09:10:00.000+05:30' },
  { focusGroupId: 'fg-003', numericId: '#183', deviceType: 'Desktop', demographics: 'Using private participants', orderedAt: '2026-07-07T11:10:00.000+05:30' },
  { focusGroupId: 'fg-004', numericId: '#184', deviceType: 'Desktop', demographics: 'Using private participants', orderedAt: '2026-06-10T09:20:00.000+05:30' },
  { focusGroupId: 'fg-005', numericId: '#185', deviceType: 'Mobile', demographics: 'Using QuestionPro UX panel', orderedAt: '2026-07-01T12:15:00.000+05:30' },
  { focusGroupId: 'fg-006', numericId: '#186', deviceType: 'Desktop', demographics: 'Using private participants', orderedAt: '2026-01-21T17:20:00.000+05:30' },
  { focusGroupId: 'fg-007', numericId: '#187', deviceType: 'Desktop', demographics: 'Using private participants', orderedAt: '2026-07-05T20:45:00.000+05:30' },
  { focusGroupId: 'fg-008', numericId: '#188', deviceType: 'Mobile', demographics: 'Using QuestionPro UX panel', orderedAt: '2026-02-26T08:50:00.000+05:30' },
  { focusGroupId: 'fg-009', numericId: '#189', deviceType: 'Desktop', demographics: 'Using private participants', orderedAt: '2026-06-30T11:15:00.000+05:30' },
  { focusGroupId: 'fg-010', numericId: '#190', deviceType: 'Desktop', demographics: 'Using private participants', orderedAt: '2026-07-02T14:00:00.000+05:30' },
  { focusGroupId: 'fg-011', numericId: '#191', deviceType: 'Mobile', demographics: 'Using QuestionPro UX panel', orderedAt: '2026-02-03T16:45:00.000+05:30' },
  { focusGroupId: 'fg-012', numericId: '#192', deviceType: 'Desktop', demographics: 'Using private participants', orderedAt: '2025-12-12T10:25:00.000+05:30' },
];
