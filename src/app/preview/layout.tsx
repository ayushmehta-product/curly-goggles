'use client';

import dynamic from 'next/dynamic';

const WuToast = dynamic(
  () => import('@npm-questionpro/wick-ui-lib').then((m) => ({ default: m.WuToast })),
  { ssr: false }
);

export default function PreviewLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <WuToast />
      {children}
    </>
  );
}
