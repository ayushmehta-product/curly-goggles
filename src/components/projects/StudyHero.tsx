'use client';

import dynamic from 'next/dynamic';
import { useWuShowToast } from '@npm-questionpro/wick-ui-lib';

const WuButton = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuButton })),
  { ssr: false }
);

interface StudyHeroProps {
  title: string;
  imageSrc: string;
}

export function StudyHero({ title, imageSrc }: StudyHeroProps) {
  const { showToast } = useWuShowToast();

  return (
    <div className="relative mb-8 overflow-hidden rounded-lg qp-card-depth">
      <img src={imageSrc} alt="" className="h-56 w-full object-cover md:h-72" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      <div className="absolute left-4 top-4">
        <WuButton color="error" size="sm" onClick={() => showToast({ message: 'Logo added', variant: 'success' })}>
          Add logo
        </WuButton>
      </div>
      <div className="absolute right-4 top-4">
        <WuButton variant="secondary" size="sm" onClick={() => showToast({ message: 'Cover updated', variant: 'success' })}>
          Change cover
        </WuButton>
      </div>
      <h2 className="absolute bottom-0 left-0 right-0 bg-black/45 px-6 py-4 text-2xl font-semibold text-white md:text-3xl">
        {title}
      </h2>
    </div>
  );
}
