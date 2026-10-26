export interface FocusGroupInvitationEmail {
  fromName: string;
  focusGroupId: string;
  studyTitle: string;
  participant: { firstName: string; lastName: string; email: string };
  startsAt: string;
  endsAt: string;
  timeZoneLabel: string;
  preparation: string[];
}

export const MOCK_FOCUS_GROUP_INVITATION: FocusGroupInvitationEmail = {
  fromName: 'QuestionPro UX',
  focusGroupId: 'fg-001',
  studyTitle: 'Moderators room',
  participant: { firstName: 'Edgar', lastName: 'Vardanyan', email: 'edgar.vardanyan@mail.com' },
  startsAt: '2026-10-31T15:00:00.000Z',
  endsAt: '2026-10-31T15:30:00.000Z',
  timeZoneLabel: 'UTC',
  preparation: [
    'Join from a quiet place with a stable internet connection.',
    'Use a laptop or desktop with a working camera and microphone.',
    'Use the latest version of Chrome, Edge, or Safari.',
  ],
};
