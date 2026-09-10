import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  // Por ahora, desactivamos el middleware para facilitar la configuración
  // Una vez configurado Appwrite, podemos reactivar la protección de rutas
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};