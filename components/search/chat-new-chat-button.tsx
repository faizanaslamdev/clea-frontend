'use client';

import { Plus } from 'lucide-react';

interface ChatNewChatButtonProps {
  onNewChat: () => void;
  disabled?: boolean;
}

export function ChatNewChatButton({
  onNewChat,
  disabled = false,
}: ChatNewChatButtonProps) {
  return (
    <button
      type="button"
      className="chat-new-chat-btn"
      onClick={onNewChat}
      disabled={disabled}
      aria-label="Ny chat"
    >
      <Plus className="size-5.5" />
    </button>
  );
}
