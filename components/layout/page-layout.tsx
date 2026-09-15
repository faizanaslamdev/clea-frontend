import { Footer } from '@/components/footer';
import { Header } from '@/components/header';
import { cn } from '@/lib/utils';

interface PageLayoutProps {
  children: React.ReactNode;
  /** Extra classes on `<main>` */
  mainClassName?: string;
  /** Site footer (default on). Product detail pages omit it. */
  showFooter?: boolean;
}

export function PageLayout({
  children,
  mainClassName,
  showFooter = true,
}: PageLayoutProps) {
  return (
    <>
      <Header />
      <main className={cn('min-h-screen bg-background', mainClassName)}>
        {children}
      </main>
      {showFooter ? <Footer /> : null}
    </>
  );
}
