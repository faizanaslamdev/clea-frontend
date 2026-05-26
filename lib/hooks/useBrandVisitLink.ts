'use client';

import { useMemo } from 'react';
import { buildBrandVisitLink } from '@/lib/domain/stores/visit-link';
import type { Store } from '@/lib/types';

export function useBrandVisitLink(
  store: Store,
  options?: { referrer?: string },
) {
  return useMemo(
    () => buildBrandVisitLink(store, options),
    [store, options],
  );
}
