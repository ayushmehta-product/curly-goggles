'use client';

import { ConfirmModal } from '@/components/ui/ConfirmModal';
import type { IdiStudy } from '@/data/mock-idi-studies';

interface DeleteStudyModalProps {
  study: IdiStudy | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function DeleteStudyModal({
  study,
  open,
  onOpenChange,
  onConfirm,
}: DeleteStudyModalProps) {
  return (
    <ConfirmModal
      open={open}
      onOpenChange={onOpenChange}
      title="Delete study?"
      description={
        study
          ? `"${study.title}" will be removed from this prototype workspace. This action cannot be undone.`
          : 'This study will be removed from this prototype workspace.'
      }
      confirmLabel="Delete"
      variant="critical"
      onConfirm={onConfirm}
    />
  );
}
