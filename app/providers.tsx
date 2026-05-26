'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { createQueryClient } from '@/lib/query/client';
import { ProductModalProvider } from '@/components/product';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(createQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      <ProductModalProvider>{children}</ProductModalProvider>
    </QueryClientProvider>
  );
}
