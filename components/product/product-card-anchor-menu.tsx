'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
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
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');

  const close = useCallback(() => {
    setOpen(false);
  }, []);

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
          id={menuId}
          role="dialog"
          aria-label="Produktforslag"
          className="product-card-anchor-menu__popover"
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
