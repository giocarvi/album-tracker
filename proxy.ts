import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const url = request.nextUrl;
  const hostname = request.headers.get('host') || '';

  // CASO 1: Subdominio de la Quiniela (Redirección Externa)
  if (hostname.includes('quiniela.fullfan.net')) {
    // Mandamos al usuario directamente a penka.io
    return NextResponse.redirect('https://penka.io?id=C32207');
  }

  // CASO 2: Subdominio del Calendario (Manejo Interno)
  if (hostname.includes('calendario2026.fullfan.net') && url.pathname === '/') {
    url.pathname = '/calendario';
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.pdf|Logo.*).*)',
  ],
};