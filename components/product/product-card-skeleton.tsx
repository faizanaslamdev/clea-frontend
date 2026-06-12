import { cn } from '@/lib/utils';

export function ProductCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('product-card-skeleton', className)}>
      <div className="product-card-skeleton__image" />
      <div className="product-card-skeleton__line product-card-skeleton__line--brand" />
      <div className="product-card-skeleton__line product-card-skeleton__line--title" />
      <div className="product-card-skeleton__line product-card-skeleton__line--price" />
    </div>
  );
}
