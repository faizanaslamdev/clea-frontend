import { Footer } from '@/components/footer';
import { Header } from '@/components/header';
import { cn } from '@/lib/utils';

interface PageLayoutProps {
  children: React.ReactNode;
  /** Extra classes on `<main>` */
  mainClassName?: string;
}

export function PageLayout({ children, mainClassName }: PageLayoutProps) {
  return (
    <>
      <Header />
      <main
        className={cn('min-h-screen bg-background', mainClassName)}
      >
        {children}
      </main>
      <Footer />
    </>
  );
}
