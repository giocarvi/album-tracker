'use client';

import './globals.css';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Grid, Search, MessageSquare, Trophy } from 'lucide-react'; // Ya no importamos 'HelpCircle'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // LA MAGIA: Si estamos en la página de login, ocultamos el menú
  const mostrarMenu = pathname !== '/login';

  return (
    <html lang="es">
      {/* Añadimos padding inferior solo si hay menú para que no tape contenido */}
      <body className={`bg-slate-900 text-white ${mostrarMenu ? 'pb-20' : ''}`}>
        
        {children}

        {mostrarMenu && (
          <nav className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 pb-safe z-50">
            <div className="flex justify-around items-center h-16">
              
              <Link href="/" className={`flex flex-col items-center justify-center w-full h-full ${pathname === '/' ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300 transition-colors'}`}>
                <Grid size={24} />
                <span className="text-[10px] font-black uppercase mt-1">Mi Álbum</span>
              </Link>

              <Link href="/mercado" className={`flex flex-col items-center justify-center w-full h-full ${pathname === '/mercado' ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300 transition-colors'}`}>
                <Search size={24} />
                <span className="text-[10px] font-black uppercase mt-1">Mercado</span>
              </Link>

              <a 
               href="https://penka.io?id=C32207" 
               target="_blank" 
              rel="noopener noreferrer" 
              className="flex flex-col items-center justify-center w-full h-full text-slate-500 hover:text-cyan-400 transition-colors"
              >
              <Trophy size={24} />
              <span className="text-[10px] font-black uppercase mt-1">Quiniela</span>
              </a>

              <Link href="/chats" className={`flex flex-col items-center justify-center w-full h-full ${pathname === '/chats' || pathname?.startsWith('/chat/') ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300 transition-colors'}`}>
                <MessageSquare size={24} />
                <span className="text-[10px] font-black uppercase mt-1">Mensajes</span>
              </Link>

            </div>
          </nav>
        )}
      </body>
    </html>
  );
}