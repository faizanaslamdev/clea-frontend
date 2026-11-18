'use client';

import { useEffect, useRef } from 'react';
import { useSession } from '@/lib/auth/client';
import {
  fetchStyleProfile,
  isEmptyStyleProfile,
  writeLocalStyleProfile,
} from '@/lib/style-profile/style-profile';

/**
 * Once per signed-in user and page load, copies the account's style profile
 * into this browser so chat turns can send it (another device, new browser).
 */
export function StyleProfileSync() {
  const { data: session } = useSession();
  const syncedFor = useRef<string | null>(null);
  const userId = session?.user?.id ?? null;

  useEffect(() => {
    if (!userId || syncedFor.current === userId) return;
    syncedFor.current = userId;
    fetchStyleProfile()
      .then((profile) => {
        if (!isEmptyStyleProfile(profile)) writeLocalStyleProfile(profile);
      })
      .catch(() => undefined);
  }, [userId]);

  return null;
}
