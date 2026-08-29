import { apiFetch } from '@/lib/api/backend-client';
import { getOrCreateEngagementSessionKey } from '@/lib/engagement/session';

export type EngagementEventType =
  | 'impression'
  | 'card_click'
  | 'detail_view'
  | 'outbound_click'
  | 'search_result_click'
  | 'price_alert_create';

export type EngagementSurface =
  | 'popular_now'
  | 'search'
  | 'product_page'
  | 'chat'
  | 'catalog';

export interface EngagementEventInput {
  productId: string;
  eventType: EngagementEventType;
  surface: EngagementSurface;
}

const pendingEvents: EngagementEventInput[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;

async function flushEngagementEvents(): Promise<void> {
  if (pendingEvents.length === 0) {
    return;
  }

  const batch = pendingEvents.splice(0, 20);
  const sessionKey = getOrCreateEngagementSessionKey();

  try {
    await apiFetch('/engagement/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        events: batch.map((event) => ({
          productId: event.productId,
          eventType: event.eventType,
          surface: event.surface,
          sessionKey,
        })),
      }),
    });
  } catch {
    // Best-effort analytics — never block UX.
  }

  if (pendingEvents.length > 0) {
    void flushEngagementEvents();
  }
}

export function queueEngagementEvent(event: EngagementEventInput): void {
  if (typeof window === 'undefined') {
    return;
  }

  pendingEvents.push(event);

  if (flushTimer != null) {
    return;
  }

  flushTimer = setTimeout(() => {
    flushTimer = null;
    void flushEngagementEvents();
  }, 400);
}

export async function flushEngagementEventsNow(): Promise<void> {
  if (flushTimer != null) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }
  await flushEngagementEvents();
}
