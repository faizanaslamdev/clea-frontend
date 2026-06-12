'use client';

import Image from 'next/image';
import {
  ANCHOR_CHEAPER_MESSAGE,
  ANCHOR_SIMILAR_MESSAGE,
} from '@/lib/chat/anchor-actions';
import type { AnchorPreview } from '@/lib/chat/anchor-preview';

interface ChatAnchorUserBubbleProps {
  preview: AnchorPreview;
  actionLabel: string;
}

function anchorActionDisplayLabel(actionLabel: string): string {
  if (actionLabel === ANCHOR_SIMILAR_MESSAGE) {
    return 'Vis lignende';
  }

  if (actionLabel === ANCHOR_CHEAPER_MESSAGE) {
    return 'Finn billigere';
  }

  return actionLabel;
}

export function ChatAnchorUserBubble({
  preview,
  actionLabel,
}: ChatAnchorUserBubbleProps) {
  return (
    <div className="search-chat-anchor-ref">
      {preview.image ? (
        <div className="search-chat-anchor-ref__image-card">
          <Image
            src={preview.image}
            alt=""
            fill
            className="search-chat-anchor-ref__image"
            sizes="(max-width: 768px) 176px, 200px"
            unoptimized
          />
        </div>
      ) : null}
      <span className="search-chat-anchor-ref__pill" title={actionLabel}>
        {anchorActionDisplayLabel(actionLabel)}
      </span>
    </div>
  );
}
