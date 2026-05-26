'use client';

import { Product } from '@/lib/types';
import {
  formatPrice,
  getAllStores,
  getLowestPriceStore,
  getMatchTypeLabel,
} from '@/lib/services';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PriceComparison } from '@/components/price-comparison';
import { TrendingBadge } from '@/components/trending-badge';
import { LowestPriceBadge } from '@/components/lowest-price-badge';

interface ProductDetailsProps {
  product: Product;
  selectedStoreId: string | null;
  onSelectStore: (storeId: string) => void;
}

export function ProductDetails({
  product,
  selectedStoreId,
  onSelectStore,
}: ProductDetailsProps) {
  const stores = getAllStores();
  const best = getLowestPriceStore(product);

  const scrollToComparison = () => {
    document.getElementById('price-comparison')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div>
        <div className="sticky top-24 space-y-4">
          <div className="aspect-square overflow-hidden rounded-lg border border-border bg-muted">
            <img
              src={product.image}
              alt={product.name}
              className="h-full w-full object-cover"
              onError={(e) => {
                e.currentTarget.src = '/placeholder.svg';
              }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button type="button" onClick={scrollToComparison} className="text-left">
              <Card className="deal-highlight-card p-4 text-center">
                <LowestPriceBadge variant="label" className="mx-auto" />
                <p className="text-xl font-bold text-deal">
                  {formatPrice(product.lowestPrice)}
                </p>
                {best && (
                  <p className="mt-1 text-xs text-muted-foreground">at {best.store.name}</p>
                )}
              </Card>
            </button>
            <button type="button" onClick={scrollToComparison} className="text-left">
              <Card className="p-4 text-center transition-colors hover:border-primary/50 hover:bg-muted/50">
                <p className="text-sm text-muted-foreground">Average Price</p>
                <p className="text-xl font-bold text-foreground">
                  {formatPrice(product.averagePrice)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">across stores</p>
              </Card>
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              {product.category}
            </p>
            {product.trending && <TrendingBadge variant="inline" />}
          </div>
          <h1 className="mb-2 text-3xl font-bold text-foreground md:text-4xl">
            {product.name}
          </h1>
          <p className="text-lg text-muted-foreground">{product.brand}</p>
          <p className="mt-2 text-sm text-muted-foreground">SKU: {product.sku}</p>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-primary">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
            {getMatchTypeLabel(product.matchType)}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <span className="text-2xl font-bold text-foreground">{product.rating}</span>
            <span className="text-2xl text-primary">★</span>
          </div>
          <p className="text-muted-foreground">{product.reviewCount} customer reviews</p>
        </div>

        <Card className="border-0 bg-muted/50 p-6">
          <h3 className="mb-2 font-semibold text-foreground">Description</h3>
          <p className="text-muted-foreground">{product.description}</p>
        </Card>

        <div className="grid grid-cols-3 gap-4 border-t border-b border-border py-6">
          <div>
            <p className="text-xs text-muted-foreground">Highest Price</p>
            <p className="text-lg font-bold text-foreground">
              {formatPrice(product.highestPrice)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Price Range</p>
            <p className="text-lg font-bold text-foreground">
              {formatPrice(product.highestPrice - product.lowestPrice)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Max Savings</p>
            <p className="text-lg font-bold text-accent">{product.savingsPercent}%</p>
          </div>
        </div>

        <div>
          <h3 className="mb-4 font-semibold text-foreground">Availability</h3>
          <div className="space-y-2">
            {stores.map((store) => (
              <div key={store.id} className="flex items-center justify-between">
                <span className="text-foreground">{store.name}</span>
                {product.inStock[store.id] ? (
                  <Badge variant="outline" className="border-border bg-muted text-foreground">
                    In Stock
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="border-border bg-muted text-muted-foreground">
                    Out of Stock
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div id="price-comparison" className="lg:col-span-2">
        <PriceComparison
          product={product}
          stores={stores}
          selectedStoreId={selectedStoreId}
          onSelectStore={onSelectStore}
        />
      </div>
    </div>
  );
}
