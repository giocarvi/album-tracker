import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const url = request.nextUrl;
  const hostname = request.headers.get('host') || '';

  // 1. Dominio de la Quiniela -> Penka
  if (hostname.includes('quiniela.fullfan.net')) {
    return NextResponse.redirect('https://penka.io?id=C32207');
  }

  // 2. Subdominio del Álbum -> Ruta /album-tracker
  if (hostname.includes('album.fullfan.net') && url.pathname === '/') {
    url.pathname = '/album-tracker';
    return NextResponse.rewrite(url);
  }

  // 3. Subdominio del Calendario -> Ruta /calendario
  if (hostname.includes('calendario2026.fullfan.net') && url.pathname === '/') {
    url.pathname = '/calendario';
    return NextResponse.rewrite(url);
  }

  // Por defecto (fullfan.net), servimos la raíz "/" donde estará el Hub
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.pdf|Logo.*).*)'],
};