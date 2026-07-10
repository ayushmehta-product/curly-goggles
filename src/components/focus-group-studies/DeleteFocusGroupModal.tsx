'use client';

import { ConfirmModal } from '@/components/ui/ConfirmModal';
import type { FocusGroup } from '@/data/mock-focus-groups';

interface DeleteFocusGroupModalProps {
  focusGroup: FocusGroup | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function DeleteFocusGroupModal({
  focusGroup,
  open,
  onOpenChange,
  onConfirm,
}: DeleteFocusGroupModalProps) {
  return (
    <ConfirmModal
      open={open}
      onOpenChange={onOpenChange}
      title="Delete focus group?"
      description={
        focusGroup
          ? `"${focusGroup.title}" will be removed from this prototype workspace. This action cannot be undone.`
          : 'This focus group will be removed from this prototype workspace.'
      }
      confirmLabel="Delete"
      variant="critical"
      onConfirm={onConfirm}
    />
  );
}
