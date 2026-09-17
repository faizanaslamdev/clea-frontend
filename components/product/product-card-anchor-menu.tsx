'use client';

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { useRouter } from 'next/navigation';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { XIcon } from 'lucide-react';
import { AiSparkIcon } from '@/components/icons/ai-spark-icon';
import { HeroSearchForm } from '@/components/hero-search-form';
import { ProductAnchorContextCard } from '@/components/product/product-anchor-context-card';
import { useChatAnchorConnection } from '@/components/chat/chat-anchor-provider';
import {
  Dialog,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from '@/components/ui/dialog';
import { anchorPreviewFromProduct } from '@/lib/chat/anchor-preview';
import {
  startProductChatAnchorAction,
  startProductChatFromAnchor,
} from '@/lib/chat/start-product-chat';
import {
  AI_ANCHOR_DESKTOP_MIN_WIDTH_PX,
  resolveAiAnchorSurface,
  type AiAnchorSurface,
} from '@/lib/navigation/ai-anchor-surface';
import type { Product } from '@/lib/types';
import { cn } from '@/lib/utils';

const POPOVER_VIEWPORT_MARGIN_PX = 12;
const POPOVER_MAX_WIDTH_PX = 352;
const POPOVER_ANCHOR_GAP_PX = 10;

type PopoverLayout = {
  top: number;
  left: number;
  width: number;
};

function clampPopoverLayout(
  anchor: DOMRect,
  popoverHeight: number,
): PopoverLayout {
  const width = Math.min(
    POPOVER_MAX_WIDTH_PX,
    window.innerWidth - POPOVER_VIEWPORT_MARGIN_PX * 2,
  );

  let left = anchor.left;
  left = Math.min(
    left,
    window.innerWidth - POPOVER_VIEWPORT_MARGIN_PX - width,
  );
  left = Math.max(POPOVER_VIEWPORT_MARGIN_PX, left);

  const maxTop =
    window.innerHeight - POPOVER_VIEWPORT_MARGIN_PX - popoverHeight;
  let top = anchor.top - popoverHeight - POPOVER_ANCHOR_GAP_PX;

  if (top < POPOVER_VIEWPORT_MARGIN_PX) {
    top = anchor.bottom + POPOVER_ANCHOR_GAP_PX;
  }

  top = Math.max(POPOVER_VIEWPORT_MARGIN_PX, Math.min(top, maxTop));

  return { top, left, width };
}

interface ProductCardAnchorMenuProps {
  product: Product;
  disabled?: boolean;
  className?: string;
  onActionComplete?: () => void;
}

interface AnchorAiPanelProps {
  productId: string;
  preview: ReturnType<typeof anchorPreviewFromProduct>;
  draft: string;
  onDraftChange: (value: string) => void;
  actionsLocked: boolean;
  onSimilar: () => void;
  onCheaper: () => void;
  onSubmitCustom: (query: string) => void;
  /** Sheet shows product context; desktop popover keeps the existing compact layout. */
  showProductContext: boolean;
}

function AnchorAiPanel({
  productId,
  preview,
  draft,
  onDraftChange,
  actionsLocked,
  onSimilar,
  onCheaper,
  onSubmitCustom,
  showProductContext,
}: AnchorAiPanelProps) {
  return (
    <>
      {showProductContext ? (
        <ProductAnchorContextCard preview={preview} />
      ) : null}

      <div
        className="product-card-anchor-menu__quick-actions"
        role="group"
        aria-label="Hurtighandlinger"
      >
        <button
          type="button"
          className="product-card-anchor-menu__pill"
          aria-disabled={actionsLocked}
          onClick={() => {
            if (actionsLocked) return;
            onSimilar();
          }}
        >
          Vis lignende
        </button>
        <button
          type="button"
          className="product-card-anchor-menu__pill"
          aria-disabled={actionsLocked}
          onClick={() => {
            if (actionsLocked) return;
            onCheaper();
          }}
        >
          Lavere pris
        </button>
      </div>

      <HeroSearchForm
        variant="compact"
        idPrefix={`product-anchor-${productId}`}
        className="product-card-anchor-menu__composer"
        placeholder="Endre noe spesifikt?"
        value={draft}
        onValueChange={onDraftChange}
        onSubmitQuery={onSubmitCustom}
        submitLocked={actionsLocked}
      />
    </>
  );
}

export function ProductCardAnchorMenu({
  product,
  disabled = false,
  className,
  onActionComplete,
}: ProductCardAnchorMenuProps) {
  const router = useRouter();
  const chatAnchor = useChatAnchorConnection();
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [surface, setSurface] = useState<AiAnchorSurface>('popover');
  const [draft, setDraft] = useState('');
  const [popoverLayout, setPopoverLayout] = useState<PopoverLayout | null>(
    null,
  );
  const [keyboardInsetPx, setKeyboardInsetPx] = useState(0);

  const close = useCallback(() => {
    setOpen(false);
    setKeyboardInsetPx(0);
  }, []);

  const updatePopoverLayout = useCallback(() => {
    const root = rootRef.current;
    const popover = popoverRef.current;
    if (!root || !popover) {
      return;
    }

    setPopoverLayout(
      clampPopoverLayout(root.getBoundingClientRect(), popover.offsetHeight),
    );
  }, []);

  useLayoutEffect(() => {
    if (!open || surface !== 'popover') {
      setPopoverLayout(null);
      return;
    }

    const frame = requestAnimationFrame(updatePopoverLayout);
    return () => cancelAnimationFrame(frame);
  }, [open, surface, updatePopoverLayout, draft]);

  useEffect(() => {
    if (!open || surface !== 'popover') {
      return;
    }

    const handleViewportChange = () => {
      updatePopoverLayout();
    };

    window.addEventListener('resize', handleViewportChange);
    window.addEventListener('scroll', handleViewportChange, true);

    return () => {
      window.removeEventListener('resize', handleViewportChange);
      window.removeEventListener('scroll', handleViewportChange, true);
    };
  }, [open, surface, updatePopoverLayout]);

  useEffect(() => {
    if (!open || surface !== 'popover') {
      return;
    }

    const previousOverflowX = document.documentElement.style.overflowX;
    document.documentElement.style.overflowX = 'hidden';

    return () => {
      document.documentElement.style.overflowX = previousOverflowX;
    };
  }, [open, surface]);

  useEffect(() => {
    if (!open || surface !== 'popover') {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        close();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        close();
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [close, open, surface]);

  // Keep sheet above the software keyboard without zooming the page.
  useEffect(() => {
    if (!open || surface !== 'sheet') {
      setKeyboardInsetPx(0);
      return;
    }

    const updateKeyboardInset = () => {
      const viewport = window.visualViewport;
      if (!viewport) {
        setKeyboardInsetPx(0);
        return;
      }
      setKeyboardInsetPx(
        Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop),
      );
    };

    updateKeyboardInset();
    const viewport = window.visualViewport;
    viewport?.addEventListener('resize', updateKeyboardInset);
    viewport?.addEventListener('scroll', updateKeyboardInset);
    window.addEventListener('resize', updateKeyboardInset);

    return () => {
      viewport?.removeEventListener('resize', updateKeyboardInset);
      viewport?.removeEventListener('scroll', updateKeyboardInset);
      window.removeEventListener('resize', updateKeyboardInset);
    };
  }, [open, surface]);

  // If the viewport crosses the presentation breakpoint while open, remount
  // into the matching surface without dropping draft/product context.
  useEffect(() => {
    if (!open) {
      return;
    }

    const syncSurface = () => {
      const next = resolveAiAnchorSurface();
      setSurface((current) => (current === next ? current : next));
    };

    syncSurface();
    const mq = window.matchMedia(
      `(min-width: ${AI_ANCHOR_DESKTOP_MIN_WIDTH_PX}px)`,
    );
    mq.addEventListener('change', syncSurface);
    return () => mq.removeEventListener('change', syncSurface);
  }, [open]);

  const actionsLocked = disabled || (chatAnchor?.isAnchorLoading ?? false);
  const preview = anchorPreviewFromProduct(product);

  const runQuickAction = (kind: 'similar' | 'cheaper') => {
    if (actionsLocked) {
      return;
    }

    setDraft('');
    close();

    if (chatAnchor) {
      chatAnchor.setActiveProductId(product.id);
      void chatAnchor.runAnchorAction(product.id, kind, preview);
      onActionComplete?.();
      return;
    }

    startProductChatAnchorAction(
      router,
      product.id,
      kind,
      preview,
      onActionComplete,
    );
  };

  const submitCustomRequest = (query: string) => {
    if (actionsLocked) {
      return;
    }

    setDraft('');
    close();

    if (chatAnchor) {
      chatAnchor.setActiveProductId(product.id);
      void chatAnchor.sendProductMessage(query, product.id, preview);
      onActionComplete?.();
      return;
    }

    startProductChatFromAnchor(router, {
      productId: product.id,
      query,
      preview,
      onComplete: onActionComplete,
    });
  };

  const openMenu = () => {
    if (actionsLocked) return;
    setSurface(resolveAiAnchorSurface());
    setOpen(true);
  };

  const renderPanel = (showProductContext: boolean) => (
    <AnchorAiPanel
      productId={product.id}
      preview={preview}
      draft={draft}
      onDraftChange={setDraft}
      actionsLocked={actionsLocked}
      onSimilar={() => runQuickAction('similar')}
      onCheaper={() => runQuickAction('cheaper')}
      onSubmitCustom={submitCustomRequest}
      showProductContext={showProductContext}
    />
  );

  return (
    <div
      ref={rootRef}
      className={cn(
        'product-card-anchor-menu',
        open && 'product-card-anchor-menu--open',
        open && surface === 'sheet' && 'product-card-anchor-menu--sheet',
        className,
      )}
    >
      <button
        type="button"
        className="product-card-anchor-menu__trigger"
        title="Åpne produktforslag"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-haspopup="dialog"
        aria-hidden={open}
        tabIndex={open ? -1 : 0}
        aria-disabled={actionsLocked}
        onClick={(event) => {
          event.stopPropagation();
          if (actionsLocked) return;
          if (open) {
            close();
            return;
          }
          openMenu();
        }}
      >
        <AiSparkIcon />
        <span className="sr-only">Åpne produktforslag</span>
      </button>

      {open && surface === 'popover' ? (
        <div
          ref={popoverRef}
          id={menuId}
          role="dialog"
          aria-label="Produktforslag"
          className="product-card-anchor-menu__popover"
          style={
            popoverLayout
              ? {
                  top: popoverLayout.top,
                  left: popoverLayout.left,
                  width: popoverLayout.width,
                  visibility: 'visible',
                }
              : { visibility: 'hidden' }
          }
          onClick={(event) => event.stopPropagation()}
        >
          {renderPanel(false)}
        </div>
      ) : null}

      <Dialog
        open={open && surface === 'sheet'}
        onOpenChange={(next) => {
          if (!next) close();
        }}
      >
        <DialogPortal>
          <DialogOverlay className="product-card-anchor-menu__sheet-overlay" />
          <DialogPrimitive.Content
            id={menuId}
            aria-describedby={undefined}
            className="product-card-anchor-menu__sheet"
            style={{
              bottom: keyboardInsetPx,
              // Keep the sheet within the visible viewport when the keyboard is up.
              maxHeight: `min(92dvh, calc(100dvh - ${keyboardInsetPx}px - 0.75rem))`,
            }}
            onOpenAutoFocus={(event) => {
              // Avoid auto-focusing the textarea (which can trigger iOS zoom
              // races); let the shopper tap the field intentionally.
              event.preventDefault();
            }}
            onCloseAutoFocus={(event) => {
              event.preventDefault();
              rootRef.current
                ?.querySelector<HTMLButtonElement>(
                  '.product-card-anchor-menu__trigger',
                )
                ?.focus();
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="product-card-anchor-menu__sheet-header">
              <DialogTitle className="product-card-anchor-menu__sheet-title">
                Produktforslag
              </DialogTitle>
              <DialogDescription className="sr-only">
                Hurtighandlinger og eget spørsmål for dette produktet.
              </DialogDescription>
              <DialogPrimitive.Close
                type="button"
                className="product-card-anchor-menu__sheet-close"
                aria-label="Lukk"
              >
                <XIcon className="size-5" aria-hidden />
              </DialogPrimitive.Close>
            </div>

            <div className="product-card-anchor-menu__sheet-body">
              {renderPanel(true)}
            </div>
          </DialogPrimitive.Content>
        </DialogPortal>
      </Dialog>
    </div>
  );
}
