'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { Suspense, useState } from 'react';
import { createQueryClient } from '@/lib/query/client';
import { AuthProvider } from '@/components/auth/auth-provider';
import { AuthQueryListener } from '@/components/auth/auth-query-listener';
import { AuthResumeListener } from '@/components/auth/auth-resume-listener';
import { ProductDesktopModalProvider } from '@/components/product/product-desktop-modal-provider';
import { ScrollToTopOnNavigate } from '@/components/scroll-to-top-on-navigate';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(createQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={null}>
        <ScrollToTopOnNavigate />
      </Suspense>
      <AuthProvider>
        <ProductDesktopModalProvider>
          <AuthQueryListener />
          <AuthResumeListener />
          {children}
        </ProductDesktopModalProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
