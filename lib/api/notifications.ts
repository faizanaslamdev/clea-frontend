import { apiFetch } from './backend-client';

export type UnsubscribeResponse = {
  ok: true;
  status: 'stopped' | 'already_stopped';
  trackId: string;
  message: string;
};

export async function unsubscribeFromTrack(
  token: string,
): Promise<UnsubscribeResponse> {
  return apiFetch<UnsubscribeResponse>('/notifications/unsubscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  });
}
