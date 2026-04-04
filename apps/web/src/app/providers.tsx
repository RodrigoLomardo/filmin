'use client';

import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';
import { AuthProvider } from '../lib/auth/auth-context';
import { ApiError } from '../lib/api/client';

type ProvidersProps = {
  children: ReactNode;
};

function on401() {
  if (typeof window !== 'undefined') {
    window.location.replace('/login');
  }
}

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError(error) {
            if (error instanceof ApiError && error.status === 401) on401();
          },
        }),
        mutationCache: new MutationCache({
          onError(error) {
            if (error instanceof ApiError && error.status === 401) on401();
          },
        }),
        defaultOptions: {
          queries: {
            staleTime: 1000 * 30,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </AuthProvider>
  );
}