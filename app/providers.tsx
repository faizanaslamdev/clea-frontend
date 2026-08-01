'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { createQueryClient } from '@/lib/query/client';
import { ProductModalProvider } from '@/components/product';
import { AuthProvider } from '@/components/auth/auth-provider';
import { AuthQueryListener } from '@/components/auth/auth-query-listener';
import { AuthResumeListener } from '@/components/auth/auth-resume-listener';
import { ScrollToTopOnNavigate } from '@/components/scroll-to-top-on-navigate';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(createQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      <ScrollToTopOnNavigate />
      <AuthProvider>
        <ProductModalProvider>
          <AuthQueryListener />
          <AuthResumeListener />
          {children}
        </ProductModalProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
