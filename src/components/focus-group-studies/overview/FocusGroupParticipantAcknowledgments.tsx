'use client';

import { EmptyState } from '@/components/ui/EmptyState';
import {
  type AcknowledgmentStatus,
  type FocusGroupParticipant,
} from '@/data/mock-focus-group-scheduling';
import type { FocusGroupWorkspacePhase } from '@/data/focus-group-workspace-utils';
import { FocusGroupParticipantRow } from '@/components/focus-group-studies/overview/FocusGroupParticipantRow';

interface FocusGroupParticipantAcknowledgmentsProps {
  participants: FocusGroupParticipant[];
  phase: FocusGroupWorkspacePhase;
  onSetAcknowledgment: (participantId: string, status: AcknowledgmentStatus) => void;
  onResendInvitation: (participant: FocusGroupParticipant) => void;
  onCopyParticipantLink: (participant: FocusGroupParticipant) => void;
}

export function FocusGroupParticipantAcknowledgments({
  participants,
  phase,
  onSetAcknowledgment,
  onResendInvitation,
  onCopyParticipantLink,
}: FocusGroupParticipantAcknowledgmentsProps) {
  const showAttendance = phase === 'completed';

  const sectionTitle = showAttendance ? 'Participant attendance' : 'Participant acknowledgments';
  const sectionDescription = showAttendance
    ? 'Who joined the session and who did not.'
    : 'Participants receive the decided session time and confirm they can make it.';

  return (
    <section>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-950">{sectionTitle}</h2>
        <p className="mt-1 text-sm text-gray-500">{sectionDescription}</p>
      </div>

      {participants.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8">
          <EmptyState
            icon="wm-groups"
            title="No participants invited yet"
            description="Invite participants from Scheduling to start tracking responses."
          />
        </div>
      ) : (
        <div className="space-y-3">
          {participants.map((participant) => (
            <FocusGroupParticipantRow
              key={participant.id}
              participant={participant}
              showAttendance={showAttendance}
              onSetAcknowledgment={(status) => onSetAcknowledgment(participant.id, status)}
              onResendInvitation={() => onResendInvitation(participant)}
              onCopyParticipantLink={() => onCopyParticipantLink(participant)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
