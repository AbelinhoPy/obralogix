import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Recursos estáticos y endpoints de API públicos
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname.includes('favicon.ico') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // 2. Verificar presencia de sesión activa (Appwrite o ObraLogix session cookie)
  const hasAppwriteCookie = req.cookies.getAll().some(c => c.name.startsWith('a_session_'));
  const hasObraLogixCookie = !!req.cookies.get('obralogix_session')?.value;
  const isAuthenticated = hasAppwriteCookie || hasObraLogixCookie;

  // 3. Rutas públicas de autenticación y landing
  const isPublicRoute = pathname === '/' || pathname === '/login' || pathname === '/registro';

  // Si ya está autenticado y entra a /login o /registro, llevar a /dashboard
  if (isAuthenticated && (pathname === '/login' || pathname === '/registro')) {
    const dashboardUrl = req.nextUrl.clone();
    dashboardUrl.pathname = '/dashboard';
    return NextResponse.redirect(dashboardUrl);
  }

  // Si no está autenticado e intenta acceder a cualquier ruta del sistema, redirigir a /login
  if (!isAuthenticated && !isPublicRoute) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = '/login';
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};