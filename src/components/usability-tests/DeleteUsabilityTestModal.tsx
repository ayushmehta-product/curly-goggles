'use client';

import { ConfirmModal } from '@/components/ui/ConfirmModal';
import type { UsabilityTest } from '@/data/mock-usability-tests';

interface DeleteUsabilityTestModalProps {
  test: UsabilityTest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function DeleteUsabilityTestModal({
  test,
  open,
  onOpenChange,
  onConfirm,
}: DeleteUsabilityTestModalProps) {
  return (
    <ConfirmModal
      open={open}
      onOpenChange={onOpenChange}
      title="Delete usability test?"
      description={
        test
          ? `"${test.title}" will be removed from this prototype workspace. This action cannot be undone.`
          : 'This usability test will be removed from this prototype workspace.'
      }
      confirmLabel="Delete"
      variant="critical"
      onConfirm={onConfirm}
    />
  );
}
