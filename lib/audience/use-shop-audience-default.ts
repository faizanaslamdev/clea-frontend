'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { audienceGenderParam, getAudience, setAudience } from '@/lib/audience/audience';
import type { SuitableFor } from '@/lib/api/chat-types';

/**
 * Shop pages read Dame/Herre from the URL (no `gender` means dame). A
 * visitor who chose Herre lands on /shop without the param, so the first
 * client render adds it; a visitor who picks a gender on the shop page
 * has that remembered for the rest of the site.
 */
export function useShopAudienceDefault(pathname: string, query: string): void {
  const router = useRouter();
  useEffect(() => {
    const params = new URLSearchParams(query);
    if (params.has('gender')) return;
    const gender = audienceGenderParam(getAudience());
    if (!gender || gender === 'dame') return;
    params.set('gender', gender);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [pathname, query, router]);
}

export function rememberShopAudience(value: SuitableFor): void {
  if (value === 'male') setAudience('mens');
  else if (value === 'female') setAudience('womens');
}
