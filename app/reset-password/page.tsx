import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ResetPasswordPageClient } from '@/components/auth/reset-password-page-client';

export const metadata: Metadata = {
  title: 'Tilbakestill passord',
  robots: { index: false, follow: false },
};

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordPageClient />
    </Suspense>
  );
}
