export interface IdiStudyDetails {
  studyId: string;
  /** Short numeric identifier shown on the overview card, e.g. "#184". */
  numericId: string;
  deviceType: string;
  demographics: string;
  /** When the study's participant order/booking was placed. */
  orderedAt: string;
}

export const MOCK_IDI_STUDY_DETAILS: IdiStudyDetails[] = [
  { studyId: 'idi-001', numericId: '#161', deviceType: 'Desktop', demographics: 'Using private participants', orderedAt: '2026-04-08T11:05:00.000Z' },
  { studyId: 'idi-002', numericId: '#162', deviceType: 'Mobile', demographics: 'Using QuestionPro UX panel', orderedAt: '2026-03-22T09:40:00.000Z' },
  { studyId: 'idi-003', numericId: '#163', deviceType: 'Desktop', demographics: 'Using private participants', orderedAt: '2026-04-15T14:20:00.000Z' },
  { studyId: 'idi-004', numericId: '#164', deviceType: 'Desktop', demographics: 'Using QuestionPro UX panel', orderedAt: '2026-02-18T10:10:00.000Z' },
  { studyId: 'idi-005', numericId: '#165', deviceType: 'Mobile', demographics: 'Using private participants', orderedAt: '2026-05-02T08:55:00.000Z' },
  { studyId: 'idi-006', numericId: '#166', deviceType: 'Desktop', demographics: 'Using private participants', orderedAt: '2026-01-27T16:30:00.000Z' },
  { studyId: 'idi-007', numericId: '#167', deviceType: 'Desktop', demographics: 'Using QuestionPro UX panel', orderedAt: '2026-03-05T12:45:00.000Z' },
  { studyId: 'idi-008', numericId: '#168', deviceType: 'Mobile', demographics: 'Using private participants', orderedAt: '2026-04-29T09:15:00.000Z' },
  { studyId: 'idi-009', numericId: '#169', deviceType: 'Desktop', demographics: 'Using private participants', orderedAt: '2026-02-09T13:05:00.000Z' },
  { studyId: 'idi-010', numericId: '#170', deviceType: 'Desktop', demographics: 'Using QuestionPro UX panel', orderedAt: '2026-05-11T10:50:00.000Z' },
  { studyId: 'idi-011', numericId: '#171', deviceType: 'Mobile', demographics: 'Using private participants', orderedAt: '2026-01-14T15:25:00.000Z' },
  { studyId: 'idi-012', numericId: '#172', deviceType: 'Desktop', demographics: 'Using private participants', orderedAt: '2025-12-19T11:35:00.000Z' },
  { studyId: 'idi-013', numericId: '#173', deviceType: 'Desktop', demographics: 'Using QuestionPro UX panel', orderedAt: '2026-03-30T09:00:00.000Z' },
];
