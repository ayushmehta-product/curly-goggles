import type { Metadata } from 'next';
import type { CSSProperties } from 'react';
import { MOCK_FOCUS_GROUP_INVITATION as invite } from '@/data/mock-email-invitation';

export const metadata: Metadata = {
  title: 'Focus group invitation · Email preview',
};

const COLOR = {
  lead: '#545E6B',
  subtle: '#9B9B9B',
  pBlue: '#1B87E6',
  qBlue: '#1B3380',
  canvas: '#F5F5F5',
  border: '#E8E8E8',
  titleLine: '#EEF3FB',
  white: '#FFFFFF',
};

const FONT = "'Fira Sans', Arial, Helvetica, sans-serif";

const text = {
  heading2: { fontSize: 24, lineHeight: '32px', fontWeight: 400, color: COLOR.lead, margin: 0 },
  heading4: { fontSize: 16, lineHeight: '24px', fontWeight: 500, color: COLOR.lead, margin: 0 },
  body1: { fontSize: 16, lineHeight: '24px', fontWeight: 400, color: COLOR.lead, margin: 0 },
  body2: { fontSize: 14, lineHeight: '21px', fontWeight: 400, color: COLOR.lead, margin: 0 },
  caption: { fontSize: 12, lineHeight: '16px', fontWeight: 400, color: COLOR.subtle, margin: 0 },
} satisfies Record<string, CSSProperties>;

const link: CSSProperties = { color: COLOR.pBlue, textDecoration: 'none' };

const EMAIL_CSS = `
  .qp-email-btn-primary:hover { background-color: ${COLOR.qBlue} !important; border-color: ${COLOR.qBlue} !important; }
  .qp-email-btn-outlined:hover { border-color: ${COLOR.qBlue} !important; color: ${COLOR.qBlue} !important; }
  .qp-email-link:hover { color: ${COLOR.qBlue} !important; text-decoration: underline !important; }
  @media only screen and (max-width: 620px) {
    .qp-email-canvas { padding: 16px 0 !important; }
    .qp-email-card { border-radius: 0 !important; border-left: 0 !important; border-right: 0 !important; }
    .qp-email-pad { padding-left: 16px !important; padding-right: 16px !important; }
    .qp-email-cta-cell { display: block !important; width: 100% !important; padding: 0 0 8px 0 !important; }
    .qp-email-btn { display: block !important; width: 100% !important; box-sizing: border-box !important; border-radius: 8px !important; text-align: center !important; }
  }
`;

function formatInUtc(iso: string, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', ...options }).format(new Date(iso));
}

function toCalendarStamp(iso: string) {
  return iso.replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

function buildCalendarLinks() {
  const title = `Focus group: ${invite.studyTitle}`;
  const details = `Focus group invitation from ${invite.fromName}.`;
  const start = toCalendarStamp(invite.startsAt);
  const end = toCalendarStamp(invite.endsAt);

  const google = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${start}/${end}&details=${encodeURIComponent(details)}`;
  const outlook = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(title)}&startdt=${invite.startsAt}&enddt=${invite.endsAt}&body=${encodeURIComponent(details)}`;
  const ics = `data:text/calendar;charset=utf-8,${encodeURIComponent(
    [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//QuestionPro UX//Focus group//EN',
      'BEGIN:VEVENT',
      `UID:${invite.focusGroupId}-${invite.participant.email}`,
      `DTSTAMP:${start}`,
      `DTSTART:${start}`,
      `DTEND:${end}`,
      `SUMMARY:${title}`,
      `DESCRIPTION:${details}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n')
  )}`;

  return { google, outlook, ics };
}

function DetailRow({ label, value, isLast }: { label: string; value: string; isLast?: boolean }) {
  return (
    <tr>
      <td style={{ padding: isLast ? '0' : '0 0 12px 0', verticalAlign: 'top', width: 96 }}>
        <p style={{ ...text.caption, lineHeight: '24px' }}>{label}</p>
      </td>
      <td style={{ padding: isLast ? '0' : '0 0 12px 0', verticalAlign: 'top' }}>
        <p style={{ ...text.body1, fontWeight: 500 }}>{value}</p>
      </td>
    </tr>
  );
}

export default function FocusGroupInvitationEmailPage() {
  const durationMinutes = Math.round((new Date(invite.endsAt).getTime() - new Date(invite.startsAt).getTime()) / 60000);
  const dateLabel = formatInUtc(invite.startsAt, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  const timeLabel = `${formatInUtc(invite.startsAt, { hour: 'numeric', minute: '2-digit' })} – ${formatInUtc(invite.endsAt, { hour: 'numeric', minute: '2-digit' })} (${invite.timeZoneLabel})`;
  const participantName = `${invite.participant.firstName} ${invite.participant.lastName}`;
  const calendar = buildCalendarLinks();

  return (
    <div style={{ backgroundColor: COLOR.canvas, minHeight: '100vh', fontFamily: FONT }}>
      <style>{EMAIL_CSS}</style>

      <div style={{ display: 'none', maxHeight: 0, overflow: 'hidden' }}>
        {`${dateLabel}, ${timeLabel}.`}
      </div>

      <table role="presentation" width="100%" cellPadding={0} cellSpacing={0} style={{ borderCollapse: 'collapse' }}>
        <tbody>
          <tr>
            <td className="qp-email-canvas" align="center" style={{ padding: '32px 16px' }}>
              <table role="presentation" width="100%" cellPadding={0} cellSpacing={0} style={{ maxWidth: 600 }}>
                <tbody>
                  <tr>
                    <td className="qp-email-pad" style={{ padding: '0 0 12px 0' }}>
                      <p style={text.caption}>
                        From <span style={{ color: COLOR.lead, fontWeight: 500 }}>{invite.fromName}</span>
                      </p>
                    </td>
                  </tr>
                </tbody>
              </table>

              <table
                role="presentation"
                className="qp-email-card"
                width="100%"
                cellPadding={0}
                cellSpacing={0}
                style={{
                  maxWidth: 600,
                  backgroundColor: COLOR.white,
                  border: `1px solid ${COLOR.border}`,
                  borderRadius: 8,
                  borderCollapse: 'separate',
                  overflow: 'hidden',
                }}
              >
                <tbody>
                  <tr>
                    <td
                      className="qp-email-pad"
                      style={{ padding: '20px 32px', borderBottom: `2px solid ${COLOR.titleLine}` }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element -- email markup needs a plain img */}
                      <img src="/questionpro-logo.svg" alt="QuestionPro" width={125} height={24} style={{ display: 'block', border: 0 }} />
                    </td>
                  </tr>

                  <tr>
                    <td className="qp-email-pad" style={{ padding: '32px 32px 0 32px' }}>
                      <p style={{ ...text.caption, marginBottom: 8 }}>Focus group invitation</p>
                      <h1 style={text.heading2}>Your session details are ready.</h1>
                      <p style={{ ...text.body1, marginTop: 24 }}>{participantName},</p>
                      <p style={{ ...text.body1, marginTop: 16 }}>
                        You&rsquo;re scheduled to take part in a focus group to test the {invite.studyTitle.toLowerCase()}. Here&rsquo;s what you need to know:
                      </p>
                    </td>
                  </tr>

                  <tr>
                    <td className="qp-email-pad" style={{ padding: '24px 32px 0 32px' }}>
                      <table role="presentation" cellPadding={0} cellSpacing={0} width="100%">
                        <tbody>
                          <tr>
                            <td className="qp-email-cta-cell" style={{ padding: '0 8px 0 0', width: '1%', whiteSpace: 'nowrap' }}>
                              <a
                                className="qp-email-btn qp-email-btn-primary"
                                href="/participant/book"
                                style={{
                                  display: 'inline-block',
                                  backgroundColor: COLOR.pBlue,
                                  border: `1px solid ${COLOR.pBlue}`,
                                  borderRadius: 4,
                                  color: COLOR.white,
                                  fontFamily: FONT,
                                  fontSize: 16,
                                  fontWeight: 500,
                                  lineHeight: '42px',
                                  padding: '0 24px',
                                  textDecoration: 'none',
                                }}
                              >
                                Confirm your availability
                              </a>
                            </td>
                            <td className="qp-email-cta-cell" style={{ padding: 0 }}>
                              <a
                                className="qp-email-btn qp-email-btn-outlined"
                                href={`/focus-group-studies/${invite.focusGroupId}/session`}
                                style={{
                                  display: 'inline-block',
                                  backgroundColor: COLOR.white,
                                  border: `1px solid ${COLOR.pBlue}`,
                                  borderRadius: 4,
                                  color: COLOR.pBlue,
                                  fontFamily: FONT,
                                  fontSize: 16,
                                  fontWeight: 500,
                                  lineHeight: '42px',
                                  padding: '0 24px',
                                  textDecoration: 'none',
                                }}
                              >
                                Join as participant
                              </a>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>

                  <tr>
                    <td className="qp-email-pad" style={{ padding: '24px 32px 0 32px' }}>
                      <table
                        role="presentation"
                        width="100%"
                        cellPadding={0}
                        cellSpacing={0}
                        style={{ backgroundColor: COLOR.titleLine, borderRadius: 4, borderCollapse: 'separate' }}
                      >
                        <tbody>
                          <tr>
                            <td style={{ padding: 16 }}>
                              <table role="presentation" width="100%" cellPadding={0} cellSpacing={0}>
                                <tbody>
                                  <DetailRow label="Date" value={dateLabel} />
                                  <DetailRow label="Time" value={timeLabel} />
                                  <DetailRow label="Duration" value={`${durationMinutes} minutes`} isLast />
                                </tbody>
                              </table>
                              <p style={{ ...text.body2, marginTop: 16 }}>
                                <span style={{ color: COLOR.subtle }}>Add to calendar: </span>
                                <a className="qp-email-link" href={calendar.google} target="_blank" rel="noreferrer" style={link}>Google</a>
                                <span style={{ color: COLOR.subtle }}> · </span>
                                <a className="qp-email-link" href={calendar.outlook} target="_blank" rel="noreferrer" style={link}>Outlook</a>
                                <span style={{ color: COLOR.subtle }}> · </span>
                                <a className="qp-email-link" href={calendar.ics} download="focus-group.ics" style={link}>Apple (.ics)</a>
                              </p>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>

                  <tr>
                    <td className="qp-email-pad" style={{ padding: '32px 32px 0 32px' }}>
                      <div style={{ borderTop: `1px solid ${COLOR.border}`, paddingTop: 24 }}>
                        <h2 style={text.heading4}>Before the session</h2>
                        <ul style={{ ...text.body2, margin: '8px 0 0 0', paddingLeft: 20, listStyleType: 'disc' }}>
                          {invite.preparation.map((item) => (
                            <li key={item} style={{ marginTop: 4 }}>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </td>
                  </tr>

                  <tr>
                    <td className="qp-email-pad" style={{ padding: '24px 32px 32px 32px' }}>
                      <p style={text.body1}>Thanks,</p>
                      <p style={{ ...text.body1, fontWeight: 500, marginTop: 4 }}>{invite.fromName}</p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
