'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const WuSidebarContent = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuSidebarContent })),
  { ssr: false }
);
const WuSidebarItem = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuSidebarItem })),
  { ssr: false }
);

const NAV_ITEMS = [
  {
    label: 'Interviews',
    href: '/idi-studies',
    icon: <span className="wm-forum" />,
    iconClass: 'wm-forum',
  },
  {
    label: 'Focus groups',
    href: '/focus-group-studies',
    icon: <span className="wm-groups" />,
    iconClass: 'wm-groups',
  },
  {
    label: 'Usability tests',
    href: '/usability-tests',
    icon: <span className="wm-touch-app" />,
    iconClass: 'wm-touch-app',
  },
  {
    label: 'Studies',
    href: '/projects',
    icon: <span className="wm-folder-data" />,
    iconClass: 'wm-folder-data',
  },
  {
    label: 'InsightsHub chats',
    href: '/insights-hub-chats',
    icon: <span className="wm-smart-toy" />,
    iconClass: 'wm-smart-toy',
  },
];

export { NAV_ITEMS };

export function SideNav() {
  const pathname = usePathname();

  return (
    <WuSidebarContent>
      {NAV_ITEMS.map((item) => (
        <WuSidebarItem
          key={item.href}
          Icon={item.icon}
          isActive={pathname.startsWith(item.href)}
        >
          <Link href={item.href}>{item.label}</Link>
        </WuSidebarItem>
      ))}
    </WuSidebarContent>
  );
}
