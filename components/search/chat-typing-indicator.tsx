export function ChatTypingIndicator() {
  return (
    <span className="chat-typing-indicator" role="status" aria-label="Svarer">
      <span className="chat-typing-indicator__dot" aria-hidden />
      <span className="chat-typing-indicator__dot" aria-hidden />
      <span className="chat-typing-indicator__dot" aria-hidden />
    </span>
  );
}
