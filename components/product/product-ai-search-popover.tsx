'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { HeroSearchForm } from '@/components/hero-search-form';
import type { Product } from '@/lib/types';
import { cn } from '@/lib/utils';

const QUICK_ACTIONS = [
  {
    id: 'more-like',
    label: 'More Like This',
    buildQuery: (product: Product) =>
      `More like ${product.brand} ${product.name}`,
  },
  {
    id: 'lower-price',
    label: 'Lower Price',
    buildQuery: (product: Product) =>
      `Lower price alternatives to ${product.brand} ${product.name}`,
  },
  {
    id: 'casual',
    label: 'Casual',
    buildQuery: (product: Product) =>
      `Casual style like ${product.brand} ${product.name}`,
  },
] as const;

interface ProductAiSearchPopoverProps {
  id?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product;
  onNavigate?: () => void;
  className?: string;
}

export function ProductAiSearchPopover({
  id,
  open,
  onOpenChange,
  product,
  onNavigate,
  className,
}: ProductAiSearchPopoverProps) {
  const router = useRouter();
  const [draft, setDraft] = useState('');

  useEffect(() => {
    if (!open) setDraft('');
  }, [open, product.id]);

  useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(() => {
      const input = document.getElementById(
        'product-ai-search-query',
      ) as HTMLTextAreaElement | null;
      input?.focus();
    }, 0);
    return () => window.clearTimeout(id);
  }, [open, product.id]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onOpenChange]);

  const navigateToChat = useCallback(
    (query: string) => {
      const trimmed = query.trim();
      if (!trimmed) return;
      const params = new URLSearchParams({ q: trimmed });
      router.push(`/chat?${params.toString()}`);
      onOpenChange(false);
      onNavigate?.();
    },
    [router, onOpenChange, onNavigate],
  );

  const handleSubmitQuery = useCallback(
    (query: string) => navigateToChat(query),
    [navigateToChat],
  );

  const handleQuickAction = (buildQuery: (product: Product) => string) => {
    navigateToChat(buildQuery(product));
  };

  if (!open) return null;

  return (
    <>
      <button
        type="button"
        className="product-detail-modal__ai-dismiss"
        aria-label="Lukk AI-søk"
        onClick={() => onOpenChange(false)}
      />
      <div
        id={id}
        className={cn('product-detail-modal__ai-panel', className)}
        role="dialog"
        aria-label="AI-søk for produkt"
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div className="product-detail-modal__ai-panel-content">
          <div className="product-detail-modal__ai-actions-viewport">
            <ul
              className="product-detail-modal__ai-actions"
              aria-label="Hurtigvalg"
            >
              {QUICK_ACTIONS.map((action) => (
                <li key={action.id} className="shrink-0">
                  <button
                    type="button"
                    className="product-detail-modal__ai-action-btn"
                    onClick={() => handleQuickAction(action.buildQuery)}
                  >
                    {action.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <HeroSearchForm
            variant="compact"
            idPrefix="product-ai-search"
            className="product-detail-modal__ai-composer"
            value={draft}
            onValueChange={setDraft}
            onSubmitQuery={handleSubmitQuery}
            placeholder="Change something specific?"
            inputLabel="Change something specific"
          />
        </div>
      </div>
    </>
  );
}
