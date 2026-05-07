import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { LayoutGrid, Search, MessageCircle } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Full Fan Album Tracker",
  description: "Gestiona tu colección y encuentra intercambios con Full Fan.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={`${inter.className} bg-[#0f172a] text-white pb-24`}>
        {/* Contenido principal de la página */}
        {children}

        {/* Menú de Navegación Inferior (Sticky Navbar) */}
        <nav className="fixed bottom-0 left-0 right-0 bg-[#1e293b]/90 backdrop-blur-lg border-t border-slate-700 px-6 py-3 z-50 shadow-2xl">
          <div className="max-w-md mx-auto flex justify-between items-center">
            
            {/* Botón: Mi Álbum */}
            <Link 
              href="/" 
              className="flex flex-col items-center gap-1 group transition-all"
            >
              <div className="p-2 rounded-xl group-hover:bg-slate-700 transition-colors">
                <LayoutGrid size={24} className="text-slate-400 group-hover:text-cyan-400" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-cyan-400">
                Mi Álbum
              </span>
            </Link>

            {/* Botón: Mercado (Nuevo) */}
            <Link 
              href="/mercado" 
              className="flex flex-col items-center gap-1 group transition-all"
            >
              <div className="p-2 rounded-xl group-hover:bg-slate-700 transition-colors">
                <Search size={24} className="text-slate-400 group-hover:text-cyan-400" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-cyan-400">
                Mercado
              </span>
            </Link>

            {/* Botón: Soporte / WhatsApp */}
            <a 
              href="https://wa.me/tu_numero" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-1 group transition-all"
            >
              <div className="p-2 rounded-xl group-hover:bg-slate-700 transition-colors">
                <MessageCircle size={24} className="text-slate-400 group-hover:text-emerald-400" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-emerald-400">
                Soporte
              </span>
            </a>

          </div>
        </nav>
      </body>
    </html>
  );
}