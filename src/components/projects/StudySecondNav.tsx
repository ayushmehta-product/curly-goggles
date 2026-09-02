'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

const WuButton = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuButton })),
  { ssr: false }
);

interface StudySecondNavProps {
  folderId: string;
  studyId: string;
}

const GROUPS: { heading: string; items: { label: string; href: (base: string) => string; match: (path: string, view: string | null) => boolean }[] }[] = [
  {
    heading: 'Management',
    items: [
      { label: 'Moderation', href: (base) => base, match: (path, view) => !path.includes('/analytics') && !view },
      { label: 'Participants', href: (base) => `${base}?view=participants`, match: (_p, view) => view === 'participants' },
      { label: 'Panel', href: (base) => `${base}?view=panel`, match: (_p, view) => view === 'panel' },
    ],
  },
  {
    heading: 'Data',
    items: [
      { label: 'Analytics', href: (base) => `${base}/analytics`, match: (path) => path.includes('/analytics') },
      { label: 'My quotes', href: (base) => `${base}?view=quotes`, match: (_p, view) => view === 'quotes' },
    ],
  },
  {
    heading: 'Documents',
    items: [
      { label: 'Media library', href: (base) => `${base}?view=media`, match: (_p, view) => view === 'media' },
      { label: 'Reports', href: (base) => `${base}?view=reports`, match: (_p, view) => view === 'reports' },
      { label: 'Documents', href: (base) => `${base}?view=documents`, match: (_p, view) => view === 'documents' },
    ],
  },
];

const PINNED = [
  { label: 'Messages', view: 'messages' },
  { label: 'Logs', view: 'logs' },
  { label: 'Admin', view: 'admin' },
];

export function StudySecondNav({ folderId, studyId }: StudySecondNavProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const view = searchParams.get('view');
  const base = `/projects/${folderId}/${studyId}`;
  const [collapsed, setCollapsed] = useState(false);

  if (collapsed) {
    return (
      <aside className="qp-l2 qp-l2-collapsed">
        <WuButton
          variant="iconOnly"
          aria-label="Expand workspace sidebar"
          Icon={<span className="wm-menu" />}
          onClick={() => setCollapsed(false)}
        />
      </aside>
    );
  }

  return (
    <aside className="qp-l2">
      <div className="mb-4 flex items-center justify-between gap-2">
        <p className="border-l-4 border-accent pl-3 text-sm font-semibold text-ink">Workspace</p>
        <WuButton
          variant="iconOnly"
          aria-label="Collapse workspace sidebar"
          Icon={<span className="wm-menu" />}
          onClick={() => setCollapsed(true)}
        />
      </div>
      {GROUPS.map((group) => (
        <div key={group.heading} className="mb-6">
          <p className="mb-1 px-3 text-xs text-ink-muted">{group.heading}</p>
          {group.items.map((item) => {
            const href = item.href(base);
            const active = item.match(pathname, view);
            return (
              <Link
                key={item.label}
                href={href}
                className={`qp-l2-item ${active ? 'qp-l2-item-active' : ''}`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      ))}
      <div className="mt-auto border-t border-[var(--qp-gray-40)] pt-3">
        {PINNED.map((item) => (
          <Link
            key={item.view}
            href={`${base}?view=${item.view}`}
            className={`qp-l2-item ${view === item.view ? 'qp-l2-item-active' : ''}`}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </aside>
  );
}
