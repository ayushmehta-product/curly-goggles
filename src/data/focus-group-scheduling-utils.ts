import type {
  CandidateSlot,
  FocusGroupParticipant,
  FocusGroupSchedulingConfig,
  FocusGroupSchedulingStatus,
} from '@/data/mock-focus-group-scheduling';

export function countConfirmed(participants: FocusGroupParticipant[]) {
  return participants.filter((participant) => participant.status === 'confirmed').length;
}

export function countVotesForSlot(participants: FocusGroupParticipant[], slotId: string) {
  return participants.filter(
    (participant) => participant.status === 'confirmed' && participant.pickedSlotId === slotId
  ).length;
}

/** The slot with the most confirmed votes right now (poll mode). Ties break on slot order. */
export function getLeadingSlot(
  slots: CandidateSlot[],
  participants: FocusGroupParticipant[]
): { slot: CandidateSlot; votes: number } | null {
  if (slots.length === 0) return null;

  let leading = { slot: slots[0], votes: countVotesForSlot(participants, slots[0].id) };

  for (const slot of slots.slice(1)) {
    const votes = countVotesForSlot(participants, slot.id);
    if (votes > leading.votes) {
      leading = { slot, votes };
    }
  }

  return leading;
}

/** First slot (in list order) whose vote count has reached quorum, if any. */
export function getFirstSlotAtQuorum(
  slots: CandidateSlot[],
  participants: FocusGroupParticipant[],
  quorumTarget: number
): CandidateSlot | null {
  for (const slot of slots) {
    if (countVotesForSlot(participants, slot.id) >= quorumTarget) {
      return slot;
    }
  }
  return null;
}

export function getSchedulingStatus(config: FocusGroupSchedulingConfig): FocusGroupSchedulingStatus {
  if (config.isLocked) return 'confirmed';

  const invitesSent = config.participants.some(
    (participant) => participant.invitationStatus === 'sent'
  );

  if (!invitesSent) return 'proposing';

  if (config.mode === 'fixed' && !config.requireRsvp) return 'confirmed';

  return 'awaiting-responses';
}

export function getActiveSlot(config: FocusGroupSchedulingConfig): CandidateSlot {
  if (config.mode === 'fixed') return config.fixedSlot;

  if (config.lockedSlotId) {
    const locked = config.pollSlots.find((slot) => slot.id === config.lockedSlotId);
    if (locked) return locked;
  }

  const leading = getLeadingSlot(config.pollSlots, config.participants);
  return leading?.slot ?? config.pollSlots[0];
}

export function formatSlotLabel(slot: CandidateSlot) {
  return `${slot.date} · ${slot.startTime}–${slot.endTime}`;
}
