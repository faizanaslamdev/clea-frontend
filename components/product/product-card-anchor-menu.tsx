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
import { AiSparkIcon } from '@/components/icons/ai-spark-icon';
import { HeroSearchForm } from '@/components/hero-search-form';
import { useChatAnchorConnection } from '@/components/chat/chat-anchor-provider';
import { anchorPreviewFromProduct } from '@/lib/chat/anchor-preview';
import {
  startProductChatAnchorAction,
  startProductChatFromAnchor,
} from '@/lib/chat/start-product-chat';
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
  const [draft, setDraft] = useState('');
  const [popoverLayout, setPopoverLayout] = useState<PopoverLayout | null>(
    null,
  );

  const close = useCallback(() => {
    setOpen(false);
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
    if (!open) {
      setPopoverLayout(null);
      return;
    }

    const frame = requestAnimationFrame(updatePopoverLayout);
    return () => cancelAnimationFrame(frame);
  }, [open, updatePopoverLayout, draft]);

  useEffect(() => {
    if (!open) {
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
  }, [open, updatePopoverLayout]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflowX = document.documentElement.style.overflowX;
    document.documentElement.style.overflowX = 'hidden';

    return () => {
      document.documentElement.style.overflowX = previousOverflowX;
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
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
  }, [close, open]);

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

  return (
    <div
      ref={rootRef}
      className={cn(
        'product-card-anchor-menu',
        open && 'product-card-anchor-menu--open',
        className,
      )}
    >
      <button
        type="button"
        className="product-card-anchor-menu__trigger"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-haspopup="dialog"
        aria-hidden={open}
        tabIndex={open ? -1 : 0}
        aria-disabled={actionsLocked}
        onClick={(event) => {
          event.stopPropagation();
          if (actionsLocked) return;
          setOpen((current) => !current);
        }}
      >
        <AiSparkIcon />
        <span className="sr-only">Åpne produktforslag</span>
      </button>

      {open ? (
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
                runQuickAction('similar');
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
                runQuickAction('cheaper');
              }}
            >
              Lavere pris
            </button>
          </div>

          <HeroSearchForm
            variant="compact"
            idPrefix={`product-anchor-${product.id}`}
            className="product-card-anchor-menu__composer"
            placeholder="Endre noe spesifikt?"
            value={draft}
            onValueChange={setDraft}
            onSubmitQuery={submitCustomRequest}
            submitLocked={actionsLocked}
          />
        </div>
      ) : null}
    </div>
  );
}
