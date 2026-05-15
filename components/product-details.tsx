'use client';

import { Product } from '@/lib/types';
import { formatPrice, getAllStores, getMatchTypeLabel } from '@/lib/services';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PriceComparison } from './price-comparison';

interface ProductDetailsProps {
  product: Product;
}

export function ProductDetails({ product }: ProductDetailsProps) {
  const stores = getAllStores();

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* Left Column - Image */}
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
          
          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4 text-center">
              <p className="text-sm text-muted-foreground">Lowest Price</p>
              <p className="text-xl font-bold text-primary">
                {formatPrice(product.lowestPrice)}
              </p>
            </Card>
            <Card className="p-4 text-center">
              <p className="text-sm text-muted-foreground">Average Price</p>
              <p className="text-xl font-bold text-foreground">
                {formatPrice(product.averagePrice)}
              </p>
            </Card>
          </div>
        </div>
      </div>

      {/* Right Column - Details */}
      <div className="space-y-8">
        {/* Header */}
        <div>
          <div className="mb-2 flex items-center gap-2">
            <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              {product.category}
            </p>
            {product.trending && (
              <Badge className="bg-accent text-accent-foreground">Trending</Badge>
            )}
          </div>
          <h1 className="mb-2 text-3xl font-bold text-foreground md:text-4xl">
            {product.name}
          </h1>
          <p className="text-lg text-muted-foreground">{product.brand}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            SKU: {product.sku}
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-primary">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
            {getMatchTypeLabel(product.matchType)}
          </p>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <span className="text-2xl font-bold text-foreground">
              {product.rating}
            </span>
            <span className="text-2xl text-primary">★</span>
          </div>
          <p className="text-muted-foreground">
            {product.reviewCount} customer reviews
          </p>
        </div>

        {/* Description */}
        <Card className="border-0 bg-muted/50 p-6">
          <h3 className="mb-2 font-semibold text-foreground">Description</h3>
          <p className="text-muted-foreground">{product.description}</p>
        </Card>

        {/* Price Stats */}
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
            <p className="text-lg font-bold text-accent">
              {product.savingsPercent}%
            </p>
          </div>
        </div>

        {/* Stock Info */}
        <div>
          <h3 className="mb-4 font-semibold text-foreground">Availability</h3>
          <div className="space-y-2">
            {stores.map((store) => (
              <div key={store.id} className="flex items-center justify-between">
                <span className="text-foreground">{store.name}</span>
                {product.inStock[store.id] ? (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    In Stock
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="bg-red-50 text-red-700 border-red-200">
                    Out of Stock
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Full Width - Price Comparison */}
      <div className="lg:col-span-2">
        <PriceComparison product={product} stores={stores} />
      </div>
    </div>
  );
}
