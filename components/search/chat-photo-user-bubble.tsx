import { Camera } from 'lucide-react';

/**
 * The user's photo in the chat: their message, shown like a sent picture,
 * with the words they typed beside it under the photo. Without the photo
 * (another browser, or the thumbnail is gone) a camera stands in.
 */
export function ChatPhotoUserBubble({ url, note }: { url: string; note?: string }) {
  return (
    <div className="chat-photo-bubble">
      {url ? (
        <img src={url} alt="Bildet ditt" className="chat-photo-bubble__image" />
      ) : (
        <div className="chat-photo-bubble__placeholder" aria-label="Bildesøk">
          <Camera aria-hidden className="size-6" strokeWidth={1.5} />
          <span>Bildesøk</span>
        </div>
      )}
      {note ? <p className="chat-photo-bubble__note">{note}</p> : null}
    </div>
  );
}
