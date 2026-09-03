'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useWuShowToast } from '@npm-questionpro/wick-ui-lib';
import { studyPreviewPath } from '@/components/projects/participant/preview-routes';

const WuButton = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuButton })),
  { ssr: false }
);
const WuMenu = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuMenu })),
  { ssr: false }
);
const WuMenuItem = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuMenuItem })),
  { ssr: false }
);

interface ParticipantStudyShellProps {
  folderId: string;
  studyId: string;
  studyName: string;
  heroImage: string;
  children: React.ReactNode;
}

export function ParticipantStudyShell({
  folderId,
  studyId,
  studyName,
  heroImage,
  children,
}: ParticipantStudyShellProps) {
  const { showToast } = useWuShowToast();
  const router = useRouter();
  const homeHref = studyPreviewPath(folderId, studyId);

  return (
    <div className="min-h-screen bg-[var(--qp-gray-20)]">
      <div className="flex items-center justify-between gap-3 bg-[var(--qp-warning-soft)] px-4 py-2">
        <p className="text-sm text-ink">Preview — this is how participants see this study.</p>
        <WuButton
          size="sm"
          variant="secondary"
          onClick={() => {
            window.close();
            showToast({ message: 'You can close this tab to return to the study', variant: 'success' });
          }}
        >
          Close preview
        </WuButton>
      </div>
      <div className="flex min-h-[calc(100vh-40px)]">
        <aside className="flex w-14 shrink-0 flex-col items-center gap-2 border-r border-line bg-surface py-3">
          <WuMenu
            Trigger={
              <WuButton variant="iconOnly" aria-label="Study menu" Icon={<span className="wm-menu" />} />
            }
          >
            <WuMenuItem onSelect={() => router.push(homeHref)}>My quests</WuMenuItem>
          </WuMenu>
          <Link
            href={homeHref}
            aria-label="Home"
            className="flex h-10 w-10 items-center justify-center rounded bg-accent text-white"
          >
            <span className="wm-home text-xl" />
          </Link>
        </aside>
        <div className="min-w-0 flex-1">
          <header className="flex h-12 items-center justify-end bg-[var(--qp-q-blue)] px-4">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-xs font-semibold text-[var(--qp-q-blue)]"
              aria-label="QuestionPro"
            >
              QP
            </div>
          </header>
          <div className="relative">
            <img src={heroImage} alt="" className="h-56 w-full object-cover md:h-72" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
            <h1 className="absolute bottom-4 left-6 right-6 text-3xl font-semibold text-white md:text-4xl">
              {studyName}
            </h1>
          </div>
          <div className="px-4 py-8">{children}</div>
        </div>
      </div>
    </div>
  );
}

export function ParticipantBreadcrumb({
  items,
}: {
  items: { href?: string; label: string }[];
}) {
  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-sm">
      {items.map((item, index) => (
        <span key={`${item.label}-${index}`} className="inline-flex items-center gap-1">
          {index > 0 && <span className="text-ink-muted">›</span>}
          {item.href ? (
            <Link href={item.href} className="qp-link">
              {item.label}
            </Link>
          ) : (
            <span className="text-accent">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
