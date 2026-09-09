'use client';

import { useEffect, useState } from 'react';
import { AiSparkIcon } from '@/components/icons/ai-spark-icon';

/**
 * Chat turns take several seconds server-side (intent parse + retrieval +
 * reply generation). A static "..." for that whole window reads as broken.
 * These stages give the wait a shape instead of dead air — timed to roughly
 * match observed p50/p90 turn latency, not tied to any real backend event.
 */
const STAGES: readonly string[] = [
  'Søker …',
  'Sjekker priser hos flere butikker …',
  'Snart klar …',
];

const STAGE_ADVANCE_DELAYS_MS = [2200, 6000] as const;

export function ChatTypingIndicator() {
  const [stageIndex, setStageIndex] = useState(0);

  useEffect(() => {
    const timers = STAGE_ADVANCE_DELAYS_MS.map((delay, i) =>
      setTimeout(() => setStageIndex(i + 1), delay),
    );
    return () => {
      timers.forEach(clearTimeout);
    };
  }, []);

  return (
    <span className="chat-typing-indicator" role="status">
      <AiSparkIcon className="chat-typing-indicator__icon" />
      <span key={stageIndex} className="chat-typing-indicator__label">
        {STAGES[stageIndex]}
      </span>
    </span>
  );
}
