'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface TypewriterTextProps {
  phrases: readonly string[];
  className?: string;
  contentClassName?: string;
  cursorClassName?: string;
  showCursor?: boolean;
  /** Blinking caret only while characters are being typed (hidden when deleting or paused). */
  showCursorWhileTyping?: boolean;
  typingMs?: number;
  deletingMs?: number;
  pauseMs?: number;
}

export function TypewriterText({
  phrases,
  className,
  contentClassName,
  cursorClassName,
  showCursor = true,
  showCursorWhileTyping = false,
  typingMs = 52,
  deletingMs = 32,
  pauseMs = 2400,
}: TypewriterTextProps) {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [text, setText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (phrases.length === 0) return;

    const full = phrases[phraseIndex] ?? '';
    let timeoutId: number;

    if (!isDeleting && text === full) {
      timeoutId = window.setTimeout(() => setIsDeleting(true), pauseMs);
    } else if (isDeleting && text.length === 0) {
      setIsDeleting(false);
      setPhraseIndex((current) => (current + 1) % phrases.length);
    } else if (isDeleting) {
      timeoutId = window.setTimeout(
        () => setText(full.slice(0, text.length - 1)),
        deletingMs,
      );
    } else {
      timeoutId = window.setTimeout(
        () => setText(full.slice(0, text.length + 1)),
        typingMs,
      );
    }

    return () => window.clearTimeout(timeoutId);
  }, [text, isDeleting, phraseIndex, phrases, typingMs, deletingMs, pauseMs]);

  const full = phrases[phraseIndex] ?? '';
  const isTyping = !isDeleting && text.length < full.length;
  const showIndicator =
    showCursor || (showCursorWhileTyping && isTyping);
  const reserveCursorSlot = showCursor || showCursorWhileTyping;

  return (
    <span
      className={cn('typewriter-text', className)}
      aria-live={showIndicator ? 'polite' : 'off'}
    >
      <span className={cn('typewriter-text__content', contentClassName)}>
        <span className="typewriter-text__typed">{text}</span>
        {reserveCursorSlot ? (
          <span
            className={cn(
              'typewriter-text__cursor',
              cursorClassName,
              !showIndicator && 'typewriter-text__cursor--hidden',
            )}
            aria-hidden
          />
        ) : null}
      </span>
    </span>
  );
}
