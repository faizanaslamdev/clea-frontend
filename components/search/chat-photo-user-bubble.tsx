/**
 * The user's photo in the chat: their message, shown like a sent picture,
 * with the words they typed beside it under the photo.
 */
export function ChatPhotoUserBubble({ url, note }: { url: string; note?: string }) {
  return (
    <div className="chat-photo-bubble">
      <img src={url} alt="Bildet ditt" className="chat-photo-bubble__image" />
      {note ? <p className="chat-photo-bubble__note">{note}</p> : null}
    </div>
  );
}
