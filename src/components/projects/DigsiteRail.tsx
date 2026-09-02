'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV_ITEMS } from '@/components/SideNav';

const WuButton = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuButton })),
  { ssr: false }
);

interface DigsiteRailProps {
  expandable?: boolean;
}

export function DigsiteRail({ expandable = false }: DigsiteRailProps) {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(false);
  const showLabels = expandable && expanded;

  return (
    <nav className={`qp-rail ${showLabels ? 'qp-rail-expanded' : ''}`} aria-label="Product">
      {expandable && (
        <WuButton
          variant="iconOnly"
          aria-label={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
          Icon={<span className={expanded ? 'wm-close' : 'wm-menu'} />}
          onClick={() => setExpanded((open) => !open)}
        />
      )}
      {NAV_ITEMS.map((item) => {
        const active = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`qp-rail-item ${active ? 'qp-rail-item-active' : ''}`}
            aria-label={item.label}
            aria-current={active ? 'page' : undefined}
          >
            <span className={`${item.iconClass} text-xl`} />
            <span className="qp-rail-label">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
