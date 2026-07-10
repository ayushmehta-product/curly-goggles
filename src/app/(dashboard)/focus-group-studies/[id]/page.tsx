'use client';

import { useMemo, useState, type ReactNode } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { format, parseISO } from 'date-fns';
import { useWuShowToast } from '@npm-questionpro/wick-ui-lib';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { PollSlotRow } from '@/components/focus-group-studies/create/SchedulingStep';
import { MOCK_FOCUS_GROUPS } from '@/data/mock-focus-groups';
import {
  MOCK_FOCUS_GROUP_SCHEDULING,
  getParticipantFullName,
  getParticipantInitials,
  type CandidateSlot,
  type FocusGroupParticipant,
  type FocusGroupSchedulingConfig,
  type FocusGroupSchedulingStatus,
  type ParticipantRsvpStatus,
} from '@/data/mock-focus-group-scheduling';
import {
  countConfirmed,
  countVotesForSlot,
  formatSlotLabel,
  getActiveSlot,
  getFirstSlotAtQuorum,
  getLeadingSlot,
  getSchedulingStatus,
} from '@/data/focus-group-scheduling-utils';
import { MOCK_MODERATORS, MOCK_OBSERVERS } from '@/data/mock-study-team';

const WuButton = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuButton })),
  { ssr: false }
);
const WuMenu = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuMenu })),
  { ssr: false }
);
const WuMenuItem = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuMenuItem })),
  { ssr: false }
);
const WuMenuSeparatorItem = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuMenuSeparatorItem })),
  { ssr: false }
);
const WuModal = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuModal })),
  { ssr: false }
);
const WuModalHeader = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuModalHeader })),
  { ssr: false }
);
const WuModalContent = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuModalContent })),
  { ssr: false }
);
const WuModalFooter = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuModalFooter })),
  { ssr: false }
);
const WuModalClose = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuModalClose })),
  { ssr: false }
);
const WuInput = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuInput })),
  { ssr: false }
);

function createSlotId() {
  return `slot-${Date.now()}-${Math.round(Math.random() * 1000)}`;
}

function cloneConfig(config: FocusGroupSchedulingConfig): FocusGroupSchedulingConfig {
  return {
    ...config,
    fixedSlot: { ...config.fixedSlot },
    pollSlots: config.pollSlots.map((slot) => ({ ...slot })),
    participants: config.participants.map((participant) => ({ ...participant })),
  };
}

function Pill({ children, className }: { children: ReactNode; className: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${className}`}>
      {children}
    </span>
  );
}

const SCHEDULING_STATUS_STYLES: Record<FocusGroupSchedulingStatus, string> = {
  proposing: 'bg-gray-100 text-gray-700',
  'awaiting-responses': 'bg-amber-50 text-amber-700',
  confirmed: 'bg-green-50 text-green-700',
};

const SCHEDULING_STATUS_LABELS: Record<FocusGroupSchedulingStatus, string> = {
  proposing: 'Proposing',
  'awaiting-responses': 'Awaiting responses',
  confirmed: 'Confirmed',
};

const PARTICIPANT_STATUS_STYLES: Record<ParticipantRsvpStatus, string> = {
  confirmed: 'bg-green-50 text-green-700',
  pending: 'bg-amber-50 text-amber-700',
  declined: 'bg-gray-100 text-gray-600',
};

const PARTICIPANT_STATUS_LABELS: Record<ParticipantRsvpStatus, string> = {
  confirmed: 'Confirmed',
  pending: 'Pending',
  declined: 'Declined',
};

function SchedulingStatusBadge({ status }: { status: FocusGroupSchedulingStatus }) {
  return <Pill className={SCHEDULING_STATUS_STYLES[status]}>{SCHEDULING_STATUS_LABELS[status]}</Pill>;
}

function ParticipantStatusBadge({ status }: { status: ParticipantRsvpStatus }) {
  return <Pill className={PARTICIPANT_STATUS_STYLES[status]}>{PARTICIPANT_STATUS_LABELS[status]}</Pill>;
}

function formatSlotDateTime(slot: CandidateSlot) {
  try {
    return `${format(parseISO(slot.date), 'EEEE, MMM d')} \u00b7 ${slot.startTime}\u2013${slot.endTime}`;
  } catch {
    return formatSlotLabel(slot);
  }
}

function SectionCard({ title, subtitle, action, children }: { title: string; subtitle?: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-gray-200 bg-white">
      <div className="flex items-start justify-between gap-3 border-b border-gray-100 px-5 py-3">
        <div>
          <h2 className="text-base font-semibold text-gray-900">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function ProgressBar({ ratio, tone = 'blue' }: { ratio: number; tone?: 'blue' | 'green' | 'gray' }) {
  const toneStyles = { blue: 'bg-blue-500', green: 'bg-green-500', gray: 'bg-gray-400' };
  const percent = Math.min(100, Math.max(0, Math.round(ratio * 100)));

  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
      <div className={`h-full rounded-full ${toneStyles[tone]} transition-all`} style={{ width: `${percent}%` }} />
    </div>
  );
}

function SlotVoteRow({
  slot,
  index,
  votes,
  quorumTarget,
  isLocked,
  isLeading,
}: {
  slot: CandidateSlot;
  index: number;
  votes: number;
  quorumTarget: number;
  isLocked: boolean;
  isLeading: boolean;
}) {
  return (
    <div className={`rounded-lg border p-3 ${isLocked ? 'border-green-300 bg-green-50' : isLeading ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-white'}`}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-gray-400">Slot {index + 1}</p>
          <p className="text-sm font-semibold text-gray-900">{formatSlotDateTime(slot)}</p>
        </div>
        <div className="flex items-center gap-2">
          {isLocked && <Pill className="bg-green-600 text-white">Locked</Pill>}
          {!isLocked && isLeading && <Pill className="bg-blue-100 text-blue-700">Leading</Pill>}
          <span className="text-sm font-semibold text-gray-700">
            {votes}/{quorumTarget}
          </span>
        </div>
      </div>
      <div className="mt-2">
        <ProgressBar ratio={votes / quorumTarget} tone={isLocked ? 'green' : 'blue'} />
      </div>
    </div>
  );
}

function RescheduleModal({
  open,
  mode,
  fixedSlot,
  pollSlots,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  mode: 'fixed' | 'poll';
  fixedSlot: CandidateSlot;
  pollSlots: CandidateSlot[];
  onOpenChange: (open: boolean) => void;
  onConfirm: (updates: { fixedSlot?: CandidateSlot; pollSlots?: CandidateSlot[] }) => void;
}) {
  const [draftFixedSlot, setDraftFixedSlot] = useState(fixedSlot);
  const [draftPollSlots, setDraftPollSlots] = useState(pollSlots);

  function addSlot() {
    setDraftPollSlots((current) => [
      ...current,
      { id: createSlotId(), date: draftFixedSlot.date, startTime: '10:00', endTime: '11:00' },
    ]);
  }

  function updateSlot(slotId: string, updates: Partial<CandidateSlot>) {
    setDraftPollSlots((current) => current.map((slot) => (slot.id === slotId ? { ...slot, ...updates } : slot)));
  }

  function removeSlot(slotId: string) {
    setDraftPollSlots((current) => (current.length <= 2 ? current : current.filter((slot) => slot.id !== slotId)));
  }

  return (
    <WuModal open={open} onOpenChange={onOpenChange} size="md">
      <WuModalHeader>{mode === 'fixed' ? 'Reschedule Session' : 'Reopen Poll'}</WuModalHeader>
      <WuModalContent>
        <div className="space-y-4">
          <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-800">
            Changing the {mode === 'fixed' ? 'time' : 'candidate slots'} resets every participant back to
            pending. Participants will be notified of the change.
          </div>

          {mode === 'fixed' ? (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <WuInput
                Label="Date"
                type="date"
                variant="outlined"
                value={draftFixedSlot.date}
                onChange={(event) => setDraftFixedSlot((current) => ({ ...current, date: event.target.value }))}
              />
              <WuInput
                Label="Start time"
                type="time"
                variant="outlined"
                value={draftFixedSlot.startTime}
                onChange={(event) => setDraftFixedSlot((current) => ({ ...current, startTime: event.target.value }))}
              />
              <WuInput
                Label="End time"
                type="time"
                variant="outlined"
                value={draftFixedSlot.endTime}
                onChange={(event) => setDraftFixedSlot((current) => ({ ...current, endTime: event.target.value }))}
              />
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex justify-end">
                <WuButton onClick={addSlot}>Add Slot</WuButton>
              </div>
              {draftPollSlots.map((slot, index) => (
                <PollSlotRow
                  key={slot.id}
                  slot={slot}
                  index={index}
                  canRemove={draftPollSlots.length > 2}
                  onChange={(updates) => updateSlot(slot.id, updates)}
                  onRemove={() => removeSlot(slot.id)}
                />
              ))}
            </div>
          )}
        </div>
      </WuModalContent>
      <WuModalFooter>
        <WuModalClose variant="secondary">Cancel</WuModalClose>
        <WuButton
          onClick={() =>
            onConfirm(
              mode === 'fixed' ? { fixedSlot: draftFixedSlot } : { pollSlots: draftPollSlots }
            )
          }
        >
          Save & Notify Participants
        </WuButton>
      </WuModalFooter>
    </WuModal>
  );
}

function ParticipantRow({
  participant,
  mode,
  pollSlots,
  onSetStatus,
  onSetVote,
}: {
  participant: FocusGroupParticipant;
  mode: 'fixed' | 'poll';
  pollSlots: CandidateSlot[];
  onSetStatus: (status: ParticipantRsvpStatus) => void;
  onSetVote: (slotId: string) => void;
}) {
  const pickedSlot = pollSlots.find((slot) => slot.id === participant.pickedSlotId);

  return (
    <div className="grid grid-cols-1 gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 lg:grid-cols-[minmax(220px,1fr)_140px_minmax(150px,1fr)_auto] lg:items-center">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-semibold text-blue-700">
          {getParticipantInitials(participant)}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-gray-900">{getParticipantFullName(participant)}</p>
          <p className="mt-0.5 truncate text-xs text-gray-500">{participant.email}</p>
        </div>
      </div>
      <ParticipantStatusBadge status={participant.status} />
      <p className="truncate text-sm text-gray-600">
        {mode === 'poll' ? (pickedSlot ? formatSlotLabel(pickedSlot) : '\u2014') : '\u2014'}
      </p>
      <div className="flex items-center justify-end">
        <WuMenu
          Trigger={
            <button
              type="button"
              aria-label={`Actions for ${getParticipantFullName(participant)}`}
              className="rounded-md border border-gray-200 p-2 text-gray-500 hover:bg-gray-50 hover:text-gray-700"
            >
              <span className="wm-more-horiz text-sm" />
            </button>
          }
          align="end"
        >
          {mode === 'poll' && (
            <>
              {pollSlots.map((slot) => (
                <WuMenuItem key={slot.id} onSelect={() => onSetVote(slot.id)}>
                  Vote: {formatSlotLabel(slot)}
                </WuMenuItem>
              ))}
              <WuMenuSeparatorItem />
            </>
          )}
          {mode === 'fixed' && (
            <>
              <WuMenuItem onSelect={() => onSetStatus('confirmed')}>Mark as confirmed</WuMenuItem>
              <WuMenuSeparatorItem />
            </>
          )}
          <WuMenuItem onSelect={() => onSetStatus('declined')}>Mark as declined</WuMenuItem>
          <WuMenuItem onSelect={() => onSetStatus('pending')}>Reset to pending</WuMenuItem>
        </WuMenu>
      </div>
    </div>
  );
}

export default function FocusGroupSessionPage() {
  const { id } = useParams<{ id: string }>();
  const { showToast } = useWuShowToast();

  const focusGroup = MOCK_FOCUS_GROUPS.find((item) => item.id === id);
  const seedConfig =
    MOCK_FOCUS_GROUP_SCHEDULING.find((item) => item.focusGroupId === id) ?? MOCK_FOCUS_GROUP_SCHEDULING[0];

  const [config, setConfig] = useState<FocusGroupSchedulingConfig>(() => cloneConfig(seedConfig));
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [rescheduleKey, setRescheduleKey] = useState(0);

  const schedulingStatus = useMemo(() => getSchedulingStatus(config), [config]);
  const activeSlot = useMemo(() => getActiveSlot(config), [config]);
  const leading = useMemo(
    () => (config.mode === 'poll' ? getLeadingSlot(config.pollSlots, config.participants) : null),
    [config]
  );
  const confirmedCount = useMemo(() => {
    if (config.mode === 'fixed') return countConfirmed(config.participants);
    return countVotesForSlot(config.participants, activeSlot.id);
  }, [config, activeSlot]);
  const quorumMet = confirmedCount >= config.quorumTarget;

  const moderators = MOCK_MODERATORS.filter((moderator) => config.moderatorIds.includes(moderator.id));
  const observers = MOCK_OBSERVERS.filter((observer) => config.observerIds.includes(observer.id));

  function applyQuorumAutoLock(next: FocusGroupSchedulingConfig): FocusGroupSchedulingConfig {
    if (next.isLocked) return next;

    if (next.mode === 'fixed') {
      if (!next.requireRsvp) return next;
      const confirmed = countConfirmed(next.participants);
      if (confirmed >= next.quorumTarget) {
        showToast({
          message: `Quorum reached \u2014 session locked to ${formatSlotDateTime(next.fixedSlot)}.`,
          variant: 'success',
        });
        return { ...next, isLocked: true, lockedSlotId: next.fixedSlot.id, lockedBy: 'quorum' };
      }
      return next;
    }

    const slotAtQuorum = getFirstSlotAtQuorum(next.pollSlots, next.participants, next.quorumTarget);
    if (slotAtQuorum) {
      showToast({
        message: `Quorum reached for ${formatSlotDateTime(slotAtQuorum)} \u2014 session locked. Remaining invitees will be notified.`,
        variant: 'success',
      });
      return { ...next, isLocked: true, lockedSlotId: slotAtQuorum.id, lockedBy: 'quorum' };
    }
    return next;
  }

  if (!focusGroup) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <EmptyState
          icon="wm-error-outline"
          title="Focus group not found"
          description="This focus group does not exist or has been removed from the prototype workspace."
          action={
            <Link href="/focus-group-studies" className="text-sm font-medium text-blue-600 hover:underline">
              Back to Focus Groups
            </Link>
          }
        />
      </div>
    );
  }

  function updateParticipant(participantId: string, updates: Partial<FocusGroupParticipant>) {
    setConfig((current) =>
      applyQuorumAutoLock({
        ...current,
        participants: current.participants.map((participant) =>
          participant.id === participantId ? { ...participant, ...updates } : participant
        ),
      })
    );
  }

  function handleSetStatus(participantId: string, status: ParticipantRsvpStatus) {
    updateParticipant(participantId, { status, ...(status !== 'confirmed' ? { pickedSlotId: null } : {}) });
  }

  function handleSetVote(participantId: string, slotId: string) {
    updateParticipant(participantId, { status: 'confirmed', pickedSlotId: slotId });
  }

  function lockNow() {
    if (config.mode === 'fixed') {
      setConfig((current) => ({ ...current, isLocked: true, lockedSlotId: current.fixedSlot.id, lockedBy: 'manual' }));
      showToast({ message: `Session locked to ${formatSlotDateTime(config.fixedSlot)}.`, variant: 'success' });
      return;
    }

    if (!leading) return;
    setConfig((current) => ({ ...current, isLocked: true, lockedSlotId: leading.slot.id, lockedBy: 'manual' }));
    showToast({ message: `Session locked to ${formatSlotDateTime(leading.slot)}.`, variant: 'success' });
  }

  function applyReschedule(updates: { fixedSlot?: CandidateSlot; pollSlots?: CandidateSlot[] }) {
    setConfig((current) => ({
      ...current,
      fixedSlot: updates.fixedSlot ?? current.fixedSlot,
      pollSlots: updates.pollSlots ?? current.pollSlots,
      isLocked: false,
      lockedSlotId: null,
      lockedBy: null,
      participants: current.participants.map((participant) => ({
        ...participant,
        status: 'pending' as ParticipantRsvpStatus,
        pickedSlotId: null,
      })),
    }));
    setIsRescheduleOpen(false);
    showToast({ message: 'Scheduling updated \u2014 participants will be notified of the change.', variant: 'success' });
  }

  async function copySchedulingLink() {
    try {
      await navigator.clipboard.writeText(config.schedulingLink);
      showToast({ message: 'Scheduling link copied.', variant: 'success' });
    } catch {
      showToast({ message: 'Unable to copy scheduling link.', variant: 'error' });
    }
  }

  function joinCallRoom() {
    showToast({ message: 'Opening call room\u2026', variant: 'success' });
    window.open(config.callRoomUrl, '_blank', 'noopener,noreferrer');
  }

  const confirmedParticipants = config.participants.filter((p) => p.status === 'confirmed').length;
  const declinedParticipants = config.participants.filter((p) => p.status === 'declined').length;
  const pendingParticipants = config.participants.filter((p) => p.status === 'pending').length;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Link
        href="/focus-group-studies"
        className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
      >
        <span className="wm-arrow-back text-base" /> Back to Focus Groups
      </Link>

      <PageHeader
        title={focusGroup.title}
        action={
          <>
            <SchedulingStatusBadge status={schedulingStatus} />
            <WuButton variant="secondary" Icon={<span className="wm-content-copy" />} onClick={copySchedulingLink}>
              Copy Scheduling Link
            </WuButton>
            <WuButton
              Icon={<span className="wm-videocam" />}
              disabled={schedulingStatus !== 'confirmed'}
              onClick={joinCallRoom}
            >
              Join Call Room
            </WuButton>
          </>
        }
      />

      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-xs font-medium text-gray-500">
            {config.isLocked ? 'Locked time' : 'Currently leading'}
          </p>
          <p className="mt-1 text-sm font-semibold text-gray-900">{formatSlotDateTime(activeSlot)}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-xs font-medium text-gray-500">Quorum progress</p>
          <p className="mt-1 text-sm font-semibold text-gray-900">
            {confirmedCount} of {config.quorumTarget} confirmed
          </p>
          <div className="mt-2">
            <ProgressBar ratio={confirmedCount / config.quorumTarget} tone={quorumMet ? 'green' : 'blue'} />
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-xs font-medium text-gray-500">Scheduling mode</p>
          <p className="mt-1 text-sm font-semibold text-gray-900">
            {config.mode === 'fixed' ? 'Fixed time' : 'Poll'}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            {config.mode === 'fixed'
              ? config.requireRsvp
                ? 'RSVP required'
                : 'No RSVP required'
              : `${config.pollSlots.length} candidate slots`}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-xs font-medium text-gray-500">Participants</p>
          <p className="mt-1 text-sm font-semibold text-gray-900">
            {confirmedParticipants} confirmed \u00b7 {pendingParticipants} pending \u00b7 {declinedParticipants} declined
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          {config.mode === 'poll' ? (
            <SectionCard
              title="Candidate Slots"
              subtitle="Participants vote for the slot that works best. The first slot to reach quorum locks automatically."
            >
              <div className="space-y-2">
                {config.pollSlots.map((slot, index) => (
                  <SlotVoteRow
                    key={slot.id}
                    slot={slot}
                    index={index}
                    votes={countVotesForSlot(config.participants, slot.id)}
                    quorumTarget={config.quorumTarget}
                    isLocked={config.isLocked && config.lockedSlotId === slot.id}
                    isLeading={!config.isLocked && leading?.slot.id === slot.id && leading.votes > 0}
                  />
                ))}
              </div>
            </SectionCard>
          ) : (
            <SectionCard title="Proposed Time" subtitle="Single shared session — everyone joins the same call.">
              <div className={`rounded-lg border p-4 ${config.isLocked ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-white'}`}>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-base font-semibold text-gray-900">{formatSlotDateTime(config.fixedSlot)}</p>
                  {config.isLocked && <Pill className="bg-green-600 text-white">Locked</Pill>}
                </div>
                {config.requireRsvp && (
                  <div className="mt-3">
                    <ProgressBar ratio={confirmedCount / config.quorumTarget} tone={quorumMet ? 'green' : 'blue'} />
                    <p className="mt-1 text-xs text-gray-500">
                      {confirmedCount} of {config.quorumTarget} accepted
                    </p>
                  </div>
                )}
              </div>
            </SectionCard>
          )}

          <SectionCard
            title="Participants"
            subtitle={
              config.mode === 'poll'
                ? 'Update status or slot vote to simulate participant responses.'
                : 'Update status to simulate participant Accept/Decline responses.'
            }
          >
            {config.participants.length === 0 ? (
              <EmptyState icon="wm-groups" title="No participants invited yet" description="Invite participants from Scheduling to start tracking responses." />
            ) : (
              <div className="space-y-2">
                {config.participants.map((participant) => (
                  <ParticipantRow
                    key={participant.id}
                    participant={participant}
                    mode={config.mode}
                    pollSlots={config.pollSlots}
                    onSetStatus={(status) => handleSetStatus(participant.id, status)}
                    onSetVote={(slotId) => handleSetVote(participant.id, slotId)}
                  />
                ))}
              </div>
            )}
          </SectionCard>
        </div>

        <aside className="space-y-4 xl:sticky xl:top-4 xl:self-start">
          <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900">Moderators</h3>
            {moderators.length === 0 ? (
              <p className="mt-2 text-xs text-gray-500">No moderator assigned.</p>
            ) : (
              <div className="mt-2 space-y-2">
                {moderators.map((moderator) => (
                  <div key={moderator.id} className="flex items-center gap-2">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[11px] font-semibold text-blue-700">
                      {moderator.initials}
                    </span>
                    <span className="text-sm text-gray-700">{moderator.fullName}</span>
                  </div>
                ))}
              </div>
            )}

            <h3 className="mt-4 text-sm font-semibold text-gray-900">Observers</h3>
            {observers.length === 0 ? (
              <p className="mt-2 text-xs text-gray-500">No observers assigned.</p>
            ) : (
              <div className="mt-2 space-y-2">
                {observers.map((observer) => (
                  <div key={observer.id} className="flex items-center gap-2">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 text-[11px] font-semibold text-gray-600">
                      {observer.initials}
                    </span>
                    <span className="text-sm text-gray-700">{observer.fullName}</span>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="space-y-2 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <h3 className="mb-1 text-sm font-semibold text-gray-900">Actions</h3>
            <WuButton
              className="w-full"
              variant="secondary"
              Icon={<span className="wm-lock" />}
              disabled={config.isLocked}
              onClick={lockNow}
            >
              Lock This Time
            </WuButton>
            <WuButton
              className="w-full"
              variant="secondary"
              Icon={<span className="wm-event-repeat" />}
              onClick={() => {
                setRescheduleKey((current) => current + 1);
                setIsRescheduleOpen(true);
              }}
            >
              {config.isLocked ? 'Reschedule / Reopen' : 'Edit Scheduling'}
            </WuButton>
          </section>

          {config.mode === 'poll' && !config.isLocked && (
            <section className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <div className="flex items-start gap-2">
                <span className="wm-warning mt-0.5 text-amber-600" />
                <p className="text-xs leading-5 text-amber-800">
                  The first slot to reach quorum locks automatically \u2014 even if another slot is only one
                  vote behind or would have overtaken it moments later. Consider reviewing near-ties
                  manually with &quot;Lock This Time&quot; instead of relying on auto-lock when votes are close.
                </p>
              </div>
            </section>
          )}
        </aside>
      </div>

      <RescheduleModal
        key={rescheduleKey}
        open={isRescheduleOpen}
        mode={config.mode}
        fixedSlot={config.fixedSlot}
        pollSlots={config.pollSlots}
        onOpenChange={setIsRescheduleOpen}
        onConfirm={applyReschedule}
      />
    </div>
  );
}
