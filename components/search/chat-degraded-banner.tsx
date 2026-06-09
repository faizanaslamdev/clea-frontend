'use client';

interface ChatDegradedBannerProps {
  visible: boolean;
}

export function ChatDegradedBanner({ visible }: ChatDegradedBannerProps) {
  if (!visible) {
    return null;
  }

  return (
    <div
      className="chat-degraded-banner"
      role="status"
      aria-live="polite"
    >
      Søket kjører i enkel modus akkurat nå. Resultatene kan være mindre presise.
    </div>
  );
}
