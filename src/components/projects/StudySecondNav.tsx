'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

const WuSidebarContent = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuSidebarContent })),
  { ssr: false }
);
const WuSidebarGroup = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuSidebarGroup })),
  { ssr: false }
);
const WuSidebarItem = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuSidebarItem })),
  { ssr: false }
);
const WuSidebarFooter = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuSidebarFooter })),
  { ssr: false }
);
const WuSidebarMenu = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuSidebarMenu })),
  { ssr: false }
);

interface StudySecondNavProps {
  folderId: string;
  studyId: string;
}

const GROUPS: {
  heading: string;
  items: {
    label: string;
    icon: string;
    href: (base: string) => string;
    match: (path: string, view: string | null) => boolean;
  }[];
}[] = [
  {
    heading: 'Management',
    items: [
      {
        label: 'Moderation',
        icon: 'wc-responses',
        href: (base) => base,
        match: (path, view) => !path.includes('/analytics') && !view,
      },
      {
        label: 'Participants',
        icon: 'wc-audience',
        href: (base) => `${base}?view=participants`,
        match: (_p, view) => view === 'participants',
      },
      {
        label: 'Panel',
        icon: 'wc-members',
        href: (base) => `${base}?view=panel`,
        match: (_p, view) => view === 'panel',
      },
    ],
  },
  {
    heading: 'Data',
    items: [
      {
        label: 'Analytics',
        icon: 'wc-analytics',
        href: (base) => `${base}/analytics`,
        match: (path) => path.includes('/analytics'),
      },
      {
        label: 'My quotes',
        icon: 'wm-format-quote',
        href: (base) => `${base}?view=quotes`,
        match: (_p, view) => view === 'quotes',
      },
    ],
  },
  {
    heading: 'Documents',
    items: [
      {
        label: 'Media library',
        icon: 'wc-media-library',
        href: (base) => `${base}?view=media`,
        match: (_p, view) => view === 'media',
      },
      {
        label: 'Reports',
        icon: 'wc-reports',
        href: (base) => `${base}?view=reports`,
        match: (_p, view) => view === 'reports',
      },
      {
        label: 'Documents',
        icon: 'wc-document',
        href: (base) => `${base}?view=documents`,
        match: (_p, view) => view === 'documents',
      },
    ],
  },
];

const PINNED = [
  { label: 'Messages', view: 'messages', icon: 'wc-live-chat' },
  { label: 'Logs', view: 'logs', icon: 'wc-history' },
  { label: 'Admin', view: 'admin', icon: 'wc-admin' },
];

export function StudySecondNav({ folderId, studyId }: StudySecondNavProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const view = searchParams.get('view');
  const base = `/projects/${folderId}/${studyId}`;

  return (
    <>
      <WuSidebarContent>
        {GROUPS.map((group) => (
          <WuSidebarGroup key={group.heading} label={group.heading}>
            {group.items.map((item) => (
              <WuSidebarItem
                key={item.label}
                Icon={<span className={item.icon} />}
                isActive={item.match(pathname, view)}
              >
                <Link href={item.href(base)}>{item.label}</Link>
              </WuSidebarItem>
            ))}
          </WuSidebarGroup>
        ))}
      </WuSidebarContent>
      <WuSidebarFooter>
        <WuSidebarMenu>
          {PINNED.map((item) => (
            <WuSidebarItem
              key={item.view}
              Icon={<span className={item.icon} />}
              isActive={view === item.view}
            >
              <Link href={`${base}?view=${item.view}`}>{item.label}</Link>
            </WuSidebarItem>
          ))}
        </WuSidebarMenu>
      </WuSidebarFooter>
    </>
  );
}
