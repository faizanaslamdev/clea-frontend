'use client';

import Image from 'next/image';
import { anchorDisplayLabel } from '@/lib/chat/anchor-display-label';
import type { AnchorPreview } from '@/lib/chat/anchor-preview';

interface ChatAnchorUserBubbleProps {
  preview: AnchorPreview;
  actionLabel: string;
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
        {anchorDisplayLabel(actionLabel)}
      </span>
    </div>
  );
}
