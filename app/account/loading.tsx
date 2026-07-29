import { PageLayout } from '@/components/layout/page-layout';

export default function AccountLoading() {
  return (
    <PageLayout mainClassName="section-container section-shell py-12 md:py-16">
      <div
        className="account-page mx-auto max-w-5xl animate-pulse"
        aria-label="Laster konto"
        aria-busy
      >
        <div className="space-y-3">
          <div className="h-3 w-20 rounded bg-muted" />
          <div className="h-10 w-56 rounded bg-muted" />
          <div className="h-5 w-64 max-w-full rounded bg-muted" />
        </div>
        <div className="mt-8 h-12 rounded-xl bg-muted" />
        <div className="account-page__card">
          <div className="h-12 w-56 max-w-full rounded bg-muted" />
          <div className="mt-8 grid gap-5 sm:grid-cols-3">
            {[0, 1, 2].map((item) => (
              <div key={item} className="space-y-2">
                <div className="h-3 w-16 rounded bg-muted" />
                <div className="h-5 w-32 max-w-full rounded bg-muted" />
              </div>
            ))}
          </div>
        </div>
        <div className="account-page__card">
          <div className="h-12 w-64 max-w-full rounded bg-muted" />
          <div className="mt-8 grid gap-4 rounded-xl border border-border p-4 sm:grid-cols-[144px_1fr]">
            <div className="aspect-4/5 rounded-lg bg-muted" />
            <div className="space-y-3 py-1">
              <div className="h-3 w-1/4 rounded bg-muted" />
              <div className="h-5 w-3/4 rounded bg-muted" />
              <div className="mt-6 h-4 w-1/2 rounded bg-muted" />
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
