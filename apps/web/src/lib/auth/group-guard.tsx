'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from './auth-context';
import { getMyGroup } from '../api/groups';
import { ApiError } from '../api/client';

const PUBLIC_ROUTES = ['/login', '/onboarding'];

function isPublicRoute(pathname: string) {
  if (PUBLIC_ROUTES.includes(pathname)) return true;
  if (pathname.startsWith('/convite/')) return true;
  return false;
}

export function GroupGuard({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Once the group check passes for a user, we remember it to avoid
  // re-checking on every client-side navigation between protected pages.
  const groupConfirmedRef = useRef(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Public routes never need a group check
    if (isPublicRoute(pathname)) {
      setReady(true);
      return;
    }

    // Wait for Supabase session to hydrate
    if (authLoading) return;

    // No user on a protected route — redirect to login.
    // Covers client-side logout (signOut()) and cross-tab logout via onAuthStateChange.
    if (!user) {
      router.replace('/login');
      return;
    }

    // Group already confirmed for this session — skip the API call
    if (groupConfirmedRef.current) {
      setReady(true);
      return;
    }

    setReady(false);

    getMyGroup()
      .then((group) => {
        if (!group) {
          router.replace('/onboarding');
        } else {
          groupConfirmedRef.current = true;
          setReady(true);
        }
      })
      .catch((err) => {
        // 403 = authenticated but no group (backend guard)
        if (err instanceof ApiError && err.status === 403) {
          router.replace('/onboarding');
        } else {
          // Unexpected error — unblock render and let the page handle it
          setReady(true);
        }
      });
  // pathname intentionally omitted: group check only needs to run once per
  // session. Re-running on every navigation would cause unnecessary API calls
  // and flash of blank screen. groupConfirmedRef guards against stale state.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  // Block render until we know the user has a group
  if (!ready) return null;

  return <>{children}</>;
}
