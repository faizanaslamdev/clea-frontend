'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface LoadMoreButtonProps {
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  label?: string;
  loadingLabel?: string;
}

export function LoadMoreButton({
  onClick,
  loading = false,
  disabled = false,
  className,
  label = 'Vis flere produkter',
  loadingLabel = 'Laster…',
}: LoadMoreButtonProps) {
  return (
    <div className={cn('flex justify-center pt-10', className)}>
      <Button
        type="button"
        variant="outline"
        size="lg"
        onClick={onClick}
        disabled={disabled || loading}
      >
        {loading ? loadingLabel : label}
      </Button>
    </div>
  );
}
