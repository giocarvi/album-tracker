import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  
  // Obtenemos el dominio desde el cual nos están visitando
  const hostname = request.headers.get('host') || '';

  // Si visitan el subdominio del calendario y están en la ruta principal "/"
  if (hostname.includes('calendario2026.fullfan.net') && url.pathname === '/') {
    
    // Inyectamos silenciosamente la página del calendario
    url.pathname = '/calendario';
    return NextResponse.rewrite(url);
  }

  // Si no es el subdominio, dejamos que todo fluya normal
  return NextResponse.next();
}

// Configuración para que el middleware actúe de forma súper rápida
export const config = {
  matcher: [
    // Evitamos que intercepte imágenes, PDFs o archivos internos del sistema
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.pdf|Logo.*).*)',
  ],
};