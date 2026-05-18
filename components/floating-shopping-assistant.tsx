'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles, X, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  ASSISTANT_GREETING,
  ASSISTANT_NAME,
  AssistantMessage,
  getAssistantReply,
  QUICK_PROMPTS,
} from '@/lib/shopping-assistant';

function NoraAvatar({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'relative flex h-full w-full items-center justify-center',
        className
      )}
    >
      <span className="text-xl" role="img" aria-hidden>
        🌿
      </span>
      <Sparkles
        className="absolute -right-0.5 -top-0.5 h-3 w-3 text-primary-foreground/90"
        aria-hidden
      />
    </div>
  );
}

function MessageBubble({ message }: { message: AssistantMessage }) {
  const isUser = message.role === 'user';

  return (
    <div
      className={cn(
        'max-w-[92%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm',
        isUser
          ? 'ml-auto rounded-br-md bg-primary text-primary-foreground'
          : 'mr-auto rounded-bl-md border border-border/80 bg-card text-foreground'
      )}
    >
      <p className="whitespace-pre-wrap">{message.content}</p>
      {message.links && message.links.length > 0 && (
        <ul className="mt-2 space-y-1.5 border-t border-border/50 pt-2">
          {message.links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="block text-xs font-medium text-primary underline-offset-2 hover:underline"
              >
                → {link.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function FloatingShoppingAssistant() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<AssistantMessage[]>([
    { id: 'welcome', role: 'assistant', content: ASSISTANT_GREETING },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const contextProductId = pathname?.match(/^\/product\/([^/]+)/)?.[1];

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    });
  }, []);

  useEffect(() => {
    if (open) scrollToBottom();
  }, [open, messages, scrollToBottom]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const sendMessage = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      const userMsg: AssistantMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: trimmed,
      };
      const reply = getAssistantReply(trimmed, contextProductId);
      setMessages((prev) => [...prev, userMsg, reply]);
      setInput('');
    },
    [contextProductId]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="pointer-events-none fixed right-4 top-24 z-50 flex flex-col items-end gap-3 sm:right-6 sm:top-28">
      {open && (
        <div
          className="pointer-events-auto w-[min(100vw-2rem,22rem)] duration-300 animate-in fade-in slide-in-from-bottom-4 zoom-in-95"
          role="dialog"
          aria-label={`${ASSISTANT_NAME} shopping assistant`}
        >
          <div className="overflow-hidden rounded-3xl border border-primary/15 bg-card/95 shadow-2xl shadow-primary/10 backdrop-blur-md">
            <div className="relative flex items-center gap-3 bg-gradient-to-br from-primary via-primary/90 to-accent px-4 py-3.5 text-primary-foreground">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/20 ring-2 ring-white/30">
                <NoraAvatar />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold leading-tight">{ASSISTANT_NAME}</p>
                <p className="text-xs text-primary-foreground/85">Your Nordic shopping buddy</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 rounded-full text-primary-foreground hover:bg-white/20"
                onClick={() => setOpen(false)}
                aria-label="Close assistant"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div ref={scrollRef} className="h-72 overflow-y-auto px-3 py-3">
              <div className="flex flex-col gap-3">
                {messages.map((msg) => (
                  <MessageBubble key={msg.id} message={msg} />
                ))}
              </div>
            </div>
            <div className="border-t border-border/60 bg-muted/30 px-3 py-3">
              <div className="mb-2 flex flex-wrap gap-1.5">
                {QUICK_PROMPTS.map((prompt) => (
                  <button
                    key={prompt.query}
                    type="button"
                    onClick={() => {
                      setHasInteracted(true);
                      sendMessage(prompt.query);
                    }}
                    className="rounded-full border border-border bg-card px-2.5 py-1 text-[11px] font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-primary/5"
                  >
                    {prompt.label}
                  </button>
                ))}
              </div>
              <form onSubmit={handleSubmit} className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask Nora anything..."
                  className="h-9 flex-1 rounded-full border-border/80 bg-card text-sm"
                />
                <Button
                  type="submit"
                  size="icon"
                  className="h-9 w-9 shrink-0 rounded-full bg-primary shadow-md"
                  aria-label="Send message"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>
        </div>
      )}

      <Button
        type="button"
        onClick={() => {
          setHasInteracted(true);
          setOpen((v) => !v);
        }}
        className={cn(
          "pointer-events-auto group relative h-14 w-14 rounded-full border-2 border-white/40 bg-gradient-to-br from-primary to-accent p-0 shadow-lg shadow-primary/30 transition-all hover:scale-105 hover:shadow-xl focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          open && "ring-2 ring-accent/50"
        )}
        aria-label={open ? `Close ${ASSISTANT_NAME}` : "Open shopping assistant"}
        aria-expanded={open}
      >
        {!hasInteracted && (
          <span
            className="absolute -inset-1 -z-10 animate-ping rounded-full bg-accent/25 opacity-75"
            aria-hidden
          />
        )}
        <NoraAvatar className="text-lg" />
      </Button>

      {!open && !hasInteracted && (
        <span className="pointer-events-none hidden rounded-full bg-card px-3 py-1.5 text-xs font-medium text-foreground shadow-md ring-1 ring-border sm:block">
          Hi! I'm {ASSISTANT_NAME} ✨
        </span>
      )}
    </div>
  );
}
