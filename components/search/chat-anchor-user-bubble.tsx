'use client';

import Image from 'next/image';
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
    <div className="search-chat-bubble__anchor-preview">
      {preview.image ? (
        <div className="search-chat-bubble__anchor-image-wrap">
          <Image
            src={preview.image}
            alt=""
            fill
            className="search-chat-bubble__anchor-image"
            sizes="48px"
            unoptimized
          />
        </div>
      ) : null}
      <div className="search-chat-bubble__anchor-copy">
        <p className="search-chat-bubble__anchor-title">{preview.name}</p>
        <p className="search-chat-bubble__anchor-action">{actionLabel}</p>
      </div>
    </div>
  );
}
