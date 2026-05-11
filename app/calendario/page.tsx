'use client';

import React from 'react';
import { Download, ChevronLeft, Globe, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function CalendarioPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans">
      {/* Navbar Minimalista */}
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
            <ChevronLeft size={20} />
            <span className="text-sm font-bold uppercase tracking-tight">Volver al Álbum</span>
          </Link>
          <div className="flex items-center gap-2">
            <img src="/Logo FF.jpg" alt="Full Fan" className="w-8 h-8 rounded-lg" />
            <span className="font-black italic uppercase tracking-tighter">Full Fan</span>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto p-6 py-12">
        {/* Encabezado de la Landing */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-black italic uppercase tracking-tighter mb-4 leading-none">
            Calendario <span className="text-cyan-400">Mundial 2026</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto font-medium">
            Descarga y consulta la guía completa de partidos con el horario oficial de <span className="text-white">Guatemala (UTC-6)</span>.
          </p>
          
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <a 
              href="/calendario-mundial-2026.pdf" 
              download 
              className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 px-8 py-4 rounded-2xl font-black uppercase flex items-center gap-3 transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(34,211,238,0.3)]"
            >
              <Download size={20} /> Descargar PDF Oficial
            </a>
          </div>
        </div>

        {/* Visor de PDF */}
        <div className="bg-slate-800 rounded-3xl border-4 border-slate-700 overflow-hidden shadow-2xl mb-12 h-[600px] md:h-[800px]">
          <iframe 
            src="/calendario-mundial-2026.pdf" 
            className="w-full h-full"
            title="Calendario Mundial 2026 Full Fan"
          >
            <p>Tu navegador no puede mostrar el PDF. <a href="/calendario-mundial-2026.pdf" className="text-cyan-400 underline">Haz clic aquí para descargarlo.</a></p>
          </iframe>
        </div>

        {/* Banner de Conversión (Para atraer usuarios al álbum) */}
        <section className="bg-gradient-to-br from-cyan-600 to-blue-700 rounded-3xl p-8 md:p-12 text-center relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-black uppercase italic mb-4">¿Ya estás llenando tu álbum?</h2>
            <p className="text-cyan-100 mb-8 text-lg font-bold">Lleva el control de tus estampas faltantes y repetidas con nuestra App Digital.</p>
            <Link 
              href="/login" 
              className="bg-white text-blue-700 px-10 py-4 rounded-xl font-black uppercase hover:bg-slate-100 transition-colors shadow-xl"
            >
              Registrarme Gratis
            </Link>
          </div>
          {/* Decoración de fondo */}
          <div className="absolute top-0 right-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
             <Globe size={300} />
          </div>
        </section>
      </main>

      <footer className="py-12 border-t border-slate-800 text-center text-slate-500 text-sm font-bold uppercase tracking-widest">
        © 2026 Full Fan Systems • Guatemala City
      </footer>
    </div>
  );
}