'use client';

import { useState, type ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { SelectableCard } from '@/components/ui/SelectableCard';

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
const WuButton = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuButton })),
  { ssr: false }
);

type StudyMode = 'moderated' | 'ai-moderated';

interface CreateStudyModeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectMode: (mode: StudyMode) => void;
}

const STUDY_MODE_OPTIONS: {
  value: StudyMode;
  title: string;
  description: string;
  icon: ReactNode;
}[] = [
  {
    value: 'moderated',
    title: 'Moderated Study',
    description: 'Schedule and run interviews, then turn transcripts into insights',
    icon: <span className="wm-record-voice-over text-xl" />,
  },
  {
    value: 'ai-moderated',
    title: 'AI-moderated Study',
    description: 'Use AI to guide voice interactions based on a script you define',
    icon: <span className="wm-auto-awesome text-xl" />,
  },
];

export function CreateStudyModeModal({
  open,
  onOpenChange,
  onSelectMode,
}: CreateStudyModeModalProps) {
  const [selectedMode, setSelectedMode] = useState<StudyMode | null>(null);

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) setSelectedMode(null);
    onOpenChange(nextOpen);
  }

  function handleContinue() {
    if (!selectedMode) return;
    onSelectMode(selectedMode);
    setSelectedMode(null);
  }

  return (
    <WuModal open={open} onOpenChange={handleOpenChange} size="md">
      <WuModalHeader>Create Study</WuModalHeader>
      <WuModalContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            {STUDY_MODE_OPTIONS.map((option) => (
              <SelectableCard
                key={option.value}
                title={option.title}
                description={option.description}
                icon={option.icon}
                isSelected={selectedMode === option.value}
                onClick={() => setSelectedMode(option.value)}
              />
            ))}
          </div>
        </div>
      </WuModalContent>
      <WuModalFooter>
        <WuModalClose variant="secondary">Cancel</WuModalClose>
        <WuButton disabled={!selectedMode} onClick={handleContinue}>
          Continue
        </WuButton>
      </WuModalFooter>
    </WuModal>
  );
}
