'use client';

import dynamic from 'next/dynamic';
import type {
  AcknowledgmentStatus,
  AttendanceStatus,
} from '@/data/mock-focus-group-scheduling';
import type { FocusGroupWorkspacePhase } from '@/data/focus-group-workspace-utils';

const WuChip = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuChip })),
  { ssr: false }
);

const PHASE_LABELS: Record<FocusGroupWorkspacePhase, string> = {
  scheduling: 'Scheduling',
  ready: 'Ready',
  live: 'Live',
  completed: 'Completed',
};

const ACKNOWLEDGMENT_LABELS: Record<AcknowledgmentStatus, string> = {
  acknowledged: 'Acknowledged',
  pending: 'Pending',
  declined: 'Declined',
};

const ATTENDANCE_LABELS: Record<AttendanceStatus, string> = {
  attended: 'Attended',
  'no-show': 'No-show',
  declined: 'Declined',
};

function acknowledgmentColor(status: AcknowledgmentStatus): 'success' | 'warning' | 'danger' {
  if (status === 'acknowledged') return 'success';
  if (status === 'pending') return 'warning';
  return 'danger';
}

function attendanceColor(status: AttendanceStatus): 'success' | 'warning' | 'danger' {
  if (status === 'attended') return 'success';
  if (status === 'no-show') return 'warning';
  return 'danger';
}

export function PhaseStatusChip({ phase }: { phase: FocusGroupWorkspacePhase }) {
  return (
    <WuChip variant="secondary" size="sm">
      {PHASE_LABELS[phase]}
    </WuChip>
  );
}

export function AcknowledgmentStatusChip({ status }: { status: AcknowledgmentStatus }) {
  return (
    <WuChip variant="secondary" size="sm" color={acknowledgmentColor(status)}>
      {ACKNOWLEDGMENT_LABELS[status]}
    </WuChip>
  );
}

export function AttendanceStatusChip({ status }: { status: AttendanceStatus }) {
  return (
    <WuChip variant="secondary" size="sm" color={attendanceColor(status)}>
      {ATTENDANCE_LABELS[status]}
    </WuChip>
  );
}
