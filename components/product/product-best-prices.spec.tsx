import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ProductBestPrices } from './product-best-prices';
import type { ProductOffer } from '@/lib/api/products';

const offers: ProductOffer[] = [
  {
    id: 'outnorth',
    merchant_id: '18620',
    merchant_name: 'Outnorth NO',
    name: 'Viking Boot',
    price: 880,
    old_price: null,
    currency: 'NOK',
    in_stock: true,
    deep_link: 'https://outnorth.example',
    size: '40',
    colour: 'Black',
    match_method: 'gtin',
    confidence: 0.95,
  },
  {
    id: 'viking',
    merchant_id: '336878',
    merchant_name: 'Viking Footwear',
    name: 'Viking Boot',
    price: 1600,
    old_price: null,
    currency: 'NOK',
    in_stock: true,
    deep_link: 'https://viking.example',
    size: '40',
    colour: 'Black',
    match_method: 'gtin',
    confidence: 0.95,
  },
];

describe('ProductBestPrices', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
  });

  it('renders sorted offers and marks the cheapest in-stock row', () => {
    act(() => {
      root.render(
        <ProductBestPrices
          offers={offers}
          currency="NOK"
          anchorProductId="outnorth"
        />,
      );
    });

    expect(container.textContent).toContain('Beste priser');
    expect(container.textContent).toContain('Laveste pris');
    expect(container.textContent).toContain('Outnorth NO');
    expect(container.textContent).toContain('valgt');
    const firstLink = container.querySelector('a[href="https://outnorth.example"]');
    expect(firstLink).not.toBeNull();
  });
});
