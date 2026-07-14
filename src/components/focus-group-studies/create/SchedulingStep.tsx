'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { addDays, format, startOfDay } from 'date-fns';
import { useWuShowToast } from '@npm-questionpro/wick-ui-lib';
import { SelectableCard } from '@/components/ui/SelectableCard';
import type { CandidateSlot } from '@/data/mock-focus-group-scheduling';

const WuButton = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuButton })),
  { ssr: false }
);
const WuInput = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuInput })),
  { ssr: false }
);
const WuToggle = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuToggle })),
  { ssr: false }
);

export type SchedulingMode = 'fixed' | 'poll';

export interface SchedulingSnapshot {
  mode: SchedulingMode;
  requireRsvp: boolean;
  fixedSlot: CandidateSlot;
  pollSlots: CandidateSlot[];
}

interface DraftParticipant {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  invitationStatus: 'sent' | 'not_sent';
}

interface SchedulingStepProps {
  quorumTarget: number;
  onSchedulingChange: (snapshot: SchedulingSnapshot) => void;
  onBack: () => void;
  onSaveDraft: () => void;
  onContinue: () => void;
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function createSlotId() {
  return `slot-${Date.now()}-${Math.round(Math.random() * 1000)}`;
}

function createParticipantId() {
  return `participant-${Date.now()}-${Math.round(Math.random() * 1000)}`;
}

function getDefaultDates() {
  const today = startOfDay(new Date());
  return {
    fixedDate: format(addDays(today, 5), 'yyyy-MM-dd'),
    pollDates: [addDays(today, 4), addDays(today, 6), addDays(today, 8)].map((date) =>
      format(date, 'yyyy-MM-dd')
    ),
  };
}

export function getDefaultSchedulingSnapshot(): SchedulingSnapshot {
  const defaults = getDefaultDates();
  return {
    mode: 'poll',
    requireRsvp: true,
    fixedSlot: { id: 'fixed-slot', date: defaults.fixedDate, startTime: '15:00', endTime: '16:00' },
    pollSlots: defaults.pollDates.map((date, index) => ({
      id: `poll-slot-${index}`,
      date,
      startTime: index === 0 ? '17:00' : index === 1 ? '15:00' : '11:00',
      endTime: index === 0 ? '18:00' : index === 1 ? '16:00' : '12:00',
    })),
  };
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

// ---------------------------------------------------------------------------
// Poll slots — repeatable field row, same pattern as the IDI Scheduling
// step's "specific slots" editor (Availability Configuration section).
// ---------------------------------------------------------------------------

export function PollSlotRow({
  slot,
  index,
  canRemove,
  onChange,
  onRemove,
}: {
  slot: CandidateSlot;
  index: number;
  canRemove: boolean;
  onChange: (updates: Partial<CandidateSlot>) => void;
  onRemove: () => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 lg:grid-cols-[1.2fr_1fr_1fr_auto]">
      <WuInput
        Label={`Slot ${index + 1} date`}
        type="date"
        variant="outlined"
        value={slot.date}
        onChange={(event) => onChange({ date: event.target.value })}
      />
      <WuInput
        Label="Start time"
        type="time"
        variant="outlined"
        value={slot.startTime}
        onChange={(event) => onChange({ startTime: event.target.value })}
      />
      <WuInput
        Label="End time"
        type="time"
        variant="outlined"
        value={slot.endTime}
        onChange={(event) => onChange({ endTime: event.target.value })}
      />
      <div className="flex items-end">
        <WuButton variant="link" color="error" disabled={!canRemove} onClick={onRemove}>
          Remove
        </WuButton>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Participant invites — mirrors the IDI scheduling invite pattern, adapted
// for a single shared session instead of per-person 1:1 booking.
// ---------------------------------------------------------------------------

function ParticipantAvatar({ participant }: { participant: DraftParticipant }) {
  const initials = `${participant.firstName[0] ?? ''}${participant.lastName[0] ?? ''}`.toUpperCase();
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-semibold text-blue-700">
      {initials}
    </span>
  );
}

function Pill({ children, tone = 'gray' }: { children: ReactNode; tone?: 'blue' | 'green' | 'amber' | 'gray' }) {
  const styles = {
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700',
    amber: 'bg-amber-50 text-amber-700',
    gray: 'bg-gray-100 text-gray-700',
  };
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${styles[tone]}`}>{children}</span>
  );
}

export function SchedulingStep({
  quorumTarget,
  onSchedulingChange,
  onBack,
  onSaveDraft,
  onContinue,
}: SchedulingStepProps) {
  const { showToast } = useWuShowToast();
  const defaults = useMemo(() => getDefaultDates(), []);

  const [mode, setMode] = useState<SchedulingMode>('poll');
  const [requireRsvp, setRequireRsvp] = useState(true);
  const [fixedDate, setFixedDate] = useState(defaults.fixedDate);
  const [fixedStartTime, setFixedStartTime] = useState('15:00');
  const [fixedEndTime, setFixedEndTime] = useState('16:00');
  const [pollSlots, setPollSlots] = useState<CandidateSlot[]>(() =>
    defaults.pollDates.map((date, index) => ({
      id: `poll-slot-${index}`,
      date,
      startTime: index === 0 ? '17:00' : index === 1 ? '15:00' : '11:00',
      endTime: index === 0 ? '18:00' : index === 1 ? '16:00' : '12:00',
    }))
  );

  const [participants, setParticipants] = useState<DraftParticipant[]>([]);
  const [draftFirstName, setDraftFirstName] = useState('');
  const [draftLastName, setDraftLastName] = useState('');
  const [draftEmail, setDraftEmail] = useState('');

  function addSlot() {
    setPollSlots((current) => [
      ...current,
      { id: createSlotId(), date: defaults.fixedDate, startTime: '10:00', endTime: '11:00' },
    ]);
  }

  function updateSlot(slotId: string, updates: Partial<CandidateSlot>) {
    setPollSlots((current) => current.map((slot) => (slot.id === slotId ? { ...slot, ...updates } : slot)));
  }

  function removeSlot(slotId: string) {
    setPollSlots((current) => (current.length <= 2 ? current : current.filter((slot) => slot.id !== slotId)));
  }

  function addParticipant() {
    const firstName = draftFirstName.trim();
    const lastName = draftLastName.trim();
    const email = draftEmail.trim().toLowerCase();

    if (!firstName || !lastName || !isValidEmail(email)) {
      showToast({ message: 'Enter a first name, last name, and valid email address.', variant: 'error' });
      return;
    }
    if (participants.some((participant) => participant.email === email)) {
      showToast({ message: 'This participant email is already on the invite list.', variant: 'error' });
      return;
    }

    setParticipants((current) => [
      ...current,
      { id: createParticipantId(), firstName, lastName, email, invitationStatus: 'not_sent' },
    ]);
    setDraftFirstName('');
    setDraftLastName('');
    setDraftEmail('');
    showToast({ message: `${firstName} ${lastName} added to the invite list`, variant: 'success' });
  }

  function removeParticipant(id: string) {
    setParticipants((current) => current.filter((participant) => participant.id !== id));
  }

  function sendAllInvitations() {
    const pending = participants.filter((participant) => participant.invitationStatus === 'not_sent');
    if (pending.length === 0) return;
    setParticipants((current) => current.map((participant) => ({ ...participant, invitationStatus: 'sent' })));
    showToast({ message: `Scheduling link sent to ${pending.length} participants`, variant: 'success' });
  }

  const pendingInviteCount = participants.filter((p) => p.invitationStatus === 'not_sent').length;

  useEffect(() => {
    onSchedulingChange({
      mode,
      requireRsvp,
      fixedSlot: { id: 'fixed-slot', date: fixedDate, startTime: fixedStartTime, endTime: fixedEndTime },
      pollSlots,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, requireRsvp, fixedDate, fixedStartTime, fixedEndTime, pollSlots]);

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="space-y-4">
        <section className="rounded-lg border border-gray-200 bg-white">
          <SectionHeader
            title="Scheduling Mode"
            subtitle="Choose how the single shared session gets scheduled."
          />
          <div className="space-y-4 p-5">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <SelectableCard
                title="Fixed time"
                description="Propose one date and time for everyone. Optionally require participants to accept."
                icon={<span className="wm-event text-xl" />}
                isSelected={mode === 'fixed'}
                onClick={() => setMode('fixed')}
              />
              <SelectableCard
                title="Poll"
                description="Propose 2 or more candidate times. Participants vote for the slot that works best."
                icon={<span className="wm-how-to-vote text-xl" />}
                isSelected={mode === 'poll'}
                onClick={() => setMode('poll')}
              />
            </div>

            <div className="rounded-md border border-blue-100 bg-blue-50 px-3 py-2 text-xs leading-5 text-blue-800">
              This is a single shared session with every participant on one call — not individual 1:1 bookings.
              {mode === 'fixed'
                ? requireRsvp
                  ? ` Participants accept or decline the proposed time. Once ${quorumTarget} participants confirm, the session automatically locks to "Confirmed."`
                  : ' Participants simply see the confirmed date and time — no action is required from them.'
                : ` Participants pick one of the candidate slots below. As soon as ${quorumTarget} participants pick the same slot, that slot automatically locks and everyone else is notified of the final time.`}
            </div>

            {mode === 'fixed' ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <WuInput
                    Label="Date"
                    type="date"
                    variant="outlined"
                    value={fixedDate}
                    onChange={(event) => setFixedDate(event.target.value)}
                  />
                  <WuInput
                    Label="Start time"
                    type="time"
                    variant="outlined"
                    value={fixedStartTime}
                    onChange={(event) => setFixedStartTime(event.target.value)}
                  />
                  <WuInput
                    Label="End time"
                    type="time"
                    variant="outlined"
                    value={fixedEndTime}
                    onChange={(event) => setFixedEndTime(event.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 md:grid-cols-[1fr_auto] md:items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-800">Require RSVP from participants</p>
                    <p className="text-xs text-gray-500">
                      When on, participants get a simple Accept/Decline action on their scheduling link.
                    </p>
                  </div>
                  <WuToggle checked={requireRsvp} onChange={setRequireRsvp} />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">Add at least two candidate date/time slots.</p>
                  <WuButton onClick={addSlot}>Add Slot</WuButton>
                </div>
                <div className="space-y-2">
                  {pollSlots.map((slot, index) => (
                    <PollSlotRow
                      key={slot.id}
                      slot={slot}
                      index={index}
                      canRemove={pollSlots.length > 2}
                      onChange={(updates) => updateSlot(slot.id, updates)}
                      onRemove={() => removeSlot(slot.id)}
                    />
                  ))}
                </div>
                <p className="text-xs text-gray-500">
                  Participants can only choose among these slots — there is no free-text or custom time entry.
                </p>
              </div>
            )}
          </div>
        </section>

        <section className="rounded-lg border border-gray-200 bg-white">
          <SectionHeader
            title="Invite participants"
            subtitle="Add participants manually and send the scheduling link when you're ready."
          />
          <div className="space-y-4 p-5">
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <div className="grid grid-cols-[1fr_1fr_1.4fr_auto] gap-3 border-b border-gray-200 bg-gray-50 px-3 py-2">
                <p className="text-xs font-semibold text-gray-600">First name</p>
                <p className="text-xs font-semibold text-gray-600">Last name</p>
                <p className="text-xs font-semibold text-gray-600">Email</p>
                <span className="sr-only">Add participant</span>
              </div>
              <div className="grid grid-cols-1 gap-3 p-3 lg:grid-cols-[1fr_1fr_1.4fr_auto] lg:items-end">
                <WuInput
                  variant="outlined"
                  placeholder="Jane"
                  value={draftFirstName}
                  onChange={(event) => setDraftFirstName(event.target.value)}
                />
                <WuInput
                  variant="outlined"
                  placeholder="Doe"
                  value={draftLastName}
                  onChange={(event) => setDraftLastName(event.target.value)}
                />
                <WuInput
                  variant="outlined"
                  placeholder="janedoe@mail.com"
                  type="email"
                  value={draftEmail}
                  onChange={(event) => setDraftEmail(event.target.value)}
                />
                <WuButton
                  variant="secondary"
                  Icon={<span className="wm-add" />}
                  aria-label="Add participant"
                  onClick={addParticipant}
                />
              </div>
            </div>

            {participants.length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-5">
                <p className="text-sm font-semibold text-gray-800">No participants added yet</p>
                <p className="mt-1 text-sm text-gray-500">
                  Add participants to send them the scheduling link once you continue.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {participants.map((participant) => (
                  <div key={participant.id} className="rounded-lg border border-gray-200 bg-white px-4 py-3">
                    <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(220px,1fr)_auto_auto] lg:items-center">
                      <div className="flex min-w-0 items-center gap-3">
                        <ParticipantAvatar participant={participant} />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-gray-900">
                            {participant.firstName} {participant.lastName}
                          </p>
                          <p className="mt-0.5 truncate text-xs text-gray-500">{participant.email}</p>
                        </div>
                      </div>
                      <Pill tone={participant.invitationStatus === 'sent' ? 'green' : 'amber'}>
                        {participant.invitationStatus === 'sent' ? 'Link sent' : 'Not sent'}
                      </Pill>
                      <div className="flex items-center justify-end gap-2">
                        <WuButton variant="link" color="error" onClick={() => removeParticipant(participant.id)}>
                          Remove
                        </WuButton>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {pendingInviteCount > 0 && (
              <div className="flex justify-end">
                <WuButton
                  Icon={<span className="wm-mark-email-unread" />}
                  iconPosition="left"
                  onClick={sendAllInvitations}
                >
                  Send scheduling link ({pendingInviteCount})
                </WuButton>
              </div>
            )}
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
          <h3 className="text-sm font-semibold text-gray-900">Quorum</h3>
          <p className="mt-1 text-xs leading-5 text-gray-600">
            The session locks automatically once <strong>{quorumTarget}</strong> participants
            {mode === 'fixed' ? ' confirm the proposed time.' : ' pick the same slot.'}
          </p>
          <div className="mt-3 inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
            Quorum target: {quorumTarget}
          </div>
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900">Scheduling Summary</h3>
          <div className="mt-3">
            <SummaryRow label="Mode" value={mode === 'fixed' ? 'Fixed time' : 'Poll'} />
            {mode === 'fixed' ? (
              <>
                <SummaryRow label="Date" value={fixedDate || 'Not set'} />
                <SummaryRow label="Time" value={`${fixedStartTime}\u2013${fixedEndTime}`} />
                <SummaryRow label="RSVP" value={requireRsvp ? 'Required' : 'Not required'} />
              </>
            ) : (
              <SummaryRow label="Candidate slots" value={String(pollSlots.length)} />
            )}
            <SummaryRow label="Participants invited" value={String(participants.length)} />
          </div>
        </section>

        {mode === 'poll' && (
          <section className="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-start gap-2">
              <span className="wm-warning mt-0.5 text-amber-600" />
              <p className="text-xs leading-5 text-amber-800">
                Heads up: the first slot to reach quorum locks automatically, even if another slot is
                close behind or later overtakes it in votes. Review pending votes before relying on
                auto-lock for close calls.
              </p>
            </div>
          </section>
        )}
      </aside>
    </div>
  );
}
