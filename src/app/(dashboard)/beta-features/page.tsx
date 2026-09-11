'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function BetaFeaturesPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/beta-features/click-scroll-tracking');
  }, [router]);
  return null;
}
