import type { ReactNode } from 'react';
import { PageLayout } from '@/components/layout/page-layout';

interface LegalPageShellProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function LegalPageShell({
  title,
  description,
  children,
}: LegalPageShellProps) {
  return (
    <PageLayout>
      <article className="legal-page section-container section-shell">
        <header className="mb-10 md:mb-12">
          <h1 className="type-heading text-balance">{title}</h1>
          {description ? (
            <p className="type-subheading mt-4 max-w-2xl">{description}</p>
          ) : null}
        </header>
        <div className="legal-page__body">{children}</div>
      </article>
    </PageLayout>
  );
}
