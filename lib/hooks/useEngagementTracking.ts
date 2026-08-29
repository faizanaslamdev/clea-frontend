'use client';

import { useCallback, useEffect, useRef } from 'react';
import {
  queueEngagementEvent,
  type EngagementEventType,
  type EngagementSurface,
} from '@/lib/api/engagement';

export function useEngagementTracking(surface: EngagementSurface) {
  const trackedImpressions = useRef(new Set<string>());

  const track = useCallback(
    (productId: string, eventType: EngagementEventType) => {
      queueEngagementEvent({ productId, eventType, surface });
    },
    [surface],
  );

  const trackImpression = useCallback(
    (productId: string) => {
      if (trackedImpressions.current.has(productId)) {
        return;
      }
      trackedImpressions.current.add(productId);
      track(productId, 'impression');
    },
    [track],
  );

  useEffect(() => {
    trackedImpressions.current.clear();
  }, [surface]);

  return {
    trackCardClick: (productId: string) => track(productId, 'card_click'),
    trackDetailView: (productId: string) => track(productId, 'detail_view'),
    trackOutboundClick: (productId: string) =>
      track(productId, 'outbound_click'),
    trackSearchResultClick: (productId: string) =>
      track(productId, 'search_result_click'),
    trackImpression,
  };
}
