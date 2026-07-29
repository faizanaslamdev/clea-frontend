'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthModal } from '@/components/auth/auth-provider';
import type { AuthView } from '@/lib/auth/errors';
import { sanitizeSafeReturnTo, saveReturnTo } from '@/lib/auth/return-to';

function AuthQueryListenerInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { openAuthModal } = useAuthModal();

  useEffect(() => {
    const auth = searchParams.get('auth');
    if (!auth) {
      return;
    }

    const view = (['sign-in', 'sign-up', 'forgot-password', 'verify-email'].includes(
      auth,
    )
      ? auth
      : 'sign-in') as AuthView;

    const returnTo = sanitizeSafeReturnTo(
      searchParams.get('returnTo'),
      '/account',
    );
    saveReturnTo(returnTo);

    openAuthModal({ view });

    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.delete('auth');
    // Keep returnTo in the URL until auth completes; AuthResumeListener / sign-in navigate.
    const query = nextParams.toString();
    const path = typeof window !== 'undefined' ? window.location.pathname : '/';
    router.replace(query ? `${path}?${query}` : path, { scroll: false });
  }, [openAuthModal, router, searchParams]);

  return null;
}

export function AuthQueryListener() {
  return (
    <Suspense fallback={null}>
      <AuthQueryListenerInner />
    </Suspense>
  );
}
