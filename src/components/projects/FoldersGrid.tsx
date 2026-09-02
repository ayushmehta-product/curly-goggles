'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import type { StudyFolder } from '@/data/mock-projects';
import { getFolderStudyCount } from '@/data/mock-projects';
import { formatDate, truncate } from '@/data/mock-utils';

const WuCard = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuCard })),
  { ssr: false }
);
const WuCheckbox = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuCheckbox })),
  { ssr: false }
);

interface FoldersGridProps {
  folders: StudyFolder[];
  selectedIds: string[];
  onToggle: (folder: StudyFolder) => void;
}

export function FoldersGrid({ folders, selectedIds, onToggle }: FoldersGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {folders.map((folder) => {
        const count = getFolderStudyCount(folder.id);
        const selected = selectedIds.includes(folder.id);
        return (
          <WuCard
            key={folder.id}
            rounded
            className={`qp-card-hover qp-card-depth p-4 ${selected ? 'qp-row-selected' : ''}`}
          >
            <div className="flex items-start gap-2">
              <WuCheckbox checked={selected} onChange={() => onToggle(folder)} />
              <span className="wm-folder text-2xl text-accent" />
              <div className="min-w-0 flex-1">
                <Link href={`/projects/${folder.id}`} className="qp-link font-medium">
                  {truncate(folder.name, 64)}
                </Link>
                <p className="mt-1 text-sm text-ink-muted">
                  {count} {count === 1 ? 'study' : 'studies'}
                </p>
                <p className="mt-2 text-xs text-ink-muted">Last modified {formatDate(folder.updatedAt)}</p>
              </div>
            </div>
          </WuCard>
        );
      })}
    </div>
  );
}
