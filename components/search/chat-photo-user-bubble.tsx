/** The user's photo in the chat: their message, shown like a sent picture. */
export function ChatPhotoUserBubble({ url }: { url: string }) {
  return (
    <div className="chat-photo-bubble">
      <img src={url} alt="Bildet ditt" className="chat-photo-bubble__image" />
    </div>
  );
}
