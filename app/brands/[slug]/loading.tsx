import { PageLayout } from '@/components/layout/page-layout';

export default function BrandPageLoading() {
  return (
    <PageLayout>
      <div className="page-hero page-hero--brand" aria-hidden>
        <div className="absolute inset-0 animate-pulse bg-muted" />
      </div>
      <section className="section-container section-shell">
        <div className="mb-10 space-y-3">
          <div className="h-9 w-48 animate-pulse rounded bg-muted" />
          <div className="h-5 w-72 max-w-full animate-pulse rounded bg-muted" />
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }, (_, index) => (
            <div
              key={index}
              className="aspect-3/4 animate-pulse rounded-2xl bg-muted"
            />
          ))}
        </div>
      </section>
    </PageLayout>
  );
}
