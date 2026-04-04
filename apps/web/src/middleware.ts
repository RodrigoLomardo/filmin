import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const PUBLIC_ROUTES = ['/login', '/onboarding'];

function isPublicRoute(pathname: string) {
  if (PUBLIC_ROUTES.includes(pathname)) return true;
  if (pathname.startsWith('/convite/')) return true;
  return false;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // IMPORTANT: getUser() contacts the Auth server to verify the token.
  // Do not use getSession() here — it reads from cookies without verification.
  // Always call getUser() even on public routes so session cookies are refreshed.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Public routes: always accessible.
  // Exception: authenticated user on /login → redirect home (GroupGuard resolves group there).
  if (isPublicRoute(pathname)) {
    if (user && pathname === '/login') {
      const homeUrl = request.nextUrl.clone();
      homeUrl.pathname = '/';
      return NextResponse.redirect(homeUrl);
    }
    return supabaseResponse;
  }

  // Protected routes: must be authenticated.
  if (!user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    return NextResponse.redirect(loginUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except Next.js internals and static assets.
     * Excludes: _next/ (all), favicon.ico, assets/, and common static extensions.
     */
    '/((?!_next/|favicon.ico|assets/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|otf)$).*)',
  ],
};
