'use client';

import { PillSearchBar, type PillSearchBarProps } from '@/components/shared/pill-search-bar';
import { cn } from '@/lib/utils';

export interface PageSearchSectionProps extends PillSearchBarProps {
  title: string;
  description?: string;
  className?: string;
  headerClassName?: string;
}

export function PageSearchSection({
  title,
  description,
  className,
  headerClassName,
  ...searchProps
}: PageSearchSectionProps) {
  return (
    <section className={cn('page-search-section', className)}>
      <header className={cn('page-search-section__header', headerClassName)}>
        <h1 className="type-heading">{title}</h1>
        {description ? (
          <p className="type-subheading mt-2 max-w-2xl">{description}</p>
        ) : null}
      </header>
      <PillSearchBar className="page-search-section__bar" {...searchProps} />
    </section>
  );
}
