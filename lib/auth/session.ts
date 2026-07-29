import { headers } from 'next/headers';
import { getAuth, type Session } from '@/lib/auth/server';

export async function getServerSession(): Promise<Session | null> {
  const session = await getAuth().api.getSession({
    headers: await headers(),
  });

  return session;
}
