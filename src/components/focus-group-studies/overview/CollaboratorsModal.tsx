'use client';

import dynamic from 'next/dynamic';
import type { StudyTeamMember } from '@/data/mock-study-team';

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

function CollaboratorList({
  heading,
  members,
  emptyLabel,
  avatarClassName,
}: {
  heading: string;
  members: StudyTeamMember[];
  emptyLabel: string;
  avatarClassName: string;
}) {
  return (
    <div>
      <p className="text-sm font-medium text-gray-700">{heading}</p>
      {members.length === 0 ? (
        <p className="mt-1 text-sm text-gray-500">{emptyLabel}</p>
      ) : (
        <div className="mt-2 space-y-2">
          {members.map((member) => (
            <div key={member.id} className="flex items-center gap-3">
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${avatarClassName}`}
              >
                {member.initials}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-gray-900">{member.fullName}</p>
                <p className="truncate text-xs text-gray-500">{member.email}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface CollaboratorsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  moderators: StudyTeamMember[];
  observers: StudyTeamMember[];
}

export function CollaboratorsModal({ open, onOpenChange, moderators, observers }: CollaboratorsModalProps) {
  return (
    <WuModal open={open} onOpenChange={onOpenChange} size="sm">
      <WuModalHeader>Collaborators</WuModalHeader>
      <WuModalContent>
        <div className="space-y-4">
          <CollaboratorList
            heading="Moderators"
            members={moderators}
            emptyLabel="No moderator assigned."
            avatarClassName="bg-blue-50 text-blue-700"
          />
          <CollaboratorList
            heading="Observers"
            members={observers}
            emptyLabel="No observers assigned."
            avatarClassName="bg-gray-100 text-gray-600"
          />
        </div>
      </WuModalContent>
      <WuModalFooter>
        <WuModalClose variant="secondary">Close</WuModalClose>
      </WuModalFooter>
    </WuModal>
  );
}
