import type { Metadata } from 'next';
import { AccountPageClient } from '@/components/auth/account-page-client';
import { getServerSession } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Min konto',
  robots: { index: false, follow: false },
};

export default async function AccountPage() {
  const session = await getServerSession();

  if (!session) {
    return null;
  }

  return <AccountPageClient user={session.user} />;
}
