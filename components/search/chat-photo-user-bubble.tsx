import { Sparkles } from 'lucide-react';

/** The user's photo in the chat, with what Clea saw in it once she has read it. */
export function ChatPhotoUserBubble({
  url,
  summary,
  reading,
}: {
  url: string;
  summary?: string;
  /** True while the answer to this photo is still coming. */
  reading: boolean;
}) {
  return (
    <div className="chat-photo-bubble">
      <img src={url} alt="Bildet ditt" className="chat-photo-bubble__image" />
      <div className="chat-photo-bubble__seen" aria-live="polite">
        {summary || reading ? (
          <span className="chat-photo-bubble__label">
            <Sparkles aria-hidden className="size-3.5" strokeWidth={1.75} />
            {summary ? 'Clea ser' : 'Clea ser på bildet …'}
          </span>
        ) : null}
        {summary ? <p className="chat-photo-bubble__summary">{summary}</p> : null}
      </div>
    </div>
  );
}
