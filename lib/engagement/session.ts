const SESSION_STORAGE_KEY = 'clea_engagement_session_v1';

export function getOrCreateEngagementSessionKey(): string {
  if (typeof window === 'undefined') {
    return 'server-render';
  }

  const existing = window.localStorage.getItem(SESSION_STORAGE_KEY);
  if (existing?.trim()) {
    return existing;
  }

  const created =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  window.localStorage.setItem(SESSION_STORAGE_KEY, created);
  return created;
}
