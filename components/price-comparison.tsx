'use client';

import { Product, Store } from '@/lib/types';
import { formatPrice } from '@/lib/services';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LowestPriceBadge } from '@/components/lowest-price-badge';
import { HighestPriceBadge } from '@/components/highest-price-badge';
import { cn } from '@/lib/utils';

interface PriceComparisonProps {
  product: Product;
  stores: Store[];
  selectedStoreId?: string | null;
  onSelectStore?: (storeId: string) => void;
}

export function PriceComparison({
  product,
  stores,
  selectedStoreId,
  onSelectStore,
}: PriceComparisonProps) {
  const sortedStores = stores
    .map((store) => ({
      store,
      price: product.prices[store.id],
      inStock: product.inStock[store.id],
    }))
    .filter((item) => item.price !== undefined)
    .sort((a, b) => (a.price || Infinity) - (b.price || Infinity));

  const minPrice = Math.min(...sortedStores.map((s) => s.price || Infinity));
  const maxPrice = Math.max(...sortedStores.map((s) => s.price || 0));

  return (
    <div className="space-y-3">
      <div className="flex items-end justify-between gap-4">
        <h3 className="font-semibold text-foreground">Price Comparison</h3>
        <p className="text-xs text-muted-foreground">
          Same product · tap a store price to view that offer
        </p>
      </div>
      {sortedStores.map(({ store, price, inStock }) => {
        const isLowest = price === minPrice;
        const isHighest = price === maxPrice && sortedStores.length > 1;
        const isSelected = selectedStoreId === store.id;

        return (
          <button
            key={store.id}
            type="button"
            onClick={() => onSelectStore?.(store.id)}
            className="w-full text-left"
          >
            <Card
              className={cn(
                'gap-0 p-4 py-4 transition-all hover:shadow-md',
                isSelected && 'border-primary ring-2 ring-primary/25',
                !isSelected &&
                  isLowest &&
                  'border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20',
                !isSelected && isHighest && !isLowest && 'border-border bg-muted/30'
              )}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <div className="relative h-14 w-14 shrink-0">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-14 w-14 rounded-lg border border-border object-cover bg-muted"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder.svg';
                      }}
                    />
                    <span
                      className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-card bg-primary text-[10px] font-bold text-primary-foreground shadow-sm"
                      aria-hidden
                    >
                      {store.name.substring(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground">{store.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{product.name}</p>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {inStock ? (
                        <Badge variant="outline" className="h-5 text-xs">
                          In Stock
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="h-5 text-xs">
                          Out of Stock
                        </Badge>
                      )}
                      {isHighest && !isLowest && <HighestPriceBadge />}
                    </div>
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5 text-right">
                  {isLowest && <LowestPriceBadge variant="mini" />}
                  <p
                    className={cn(
                      'text-xl font-bold',
                      isLowest ? 'text-emerald-600 dark:text-emerald-400' : 'text-primary'
                    )}
                  >
                    {price ? formatPrice(price) : 'N/A'}
                  </p>
                </div>
              </div>
            </Card>
          </button>
        );
      })}
    </div>
  );
}
