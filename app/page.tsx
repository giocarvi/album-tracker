'use client';

import React from 'react';
import { LayoutGrid, Calendar, Trophy, Tv, Settings, ChevronRight } from 'lucide-react';

export default function FullFanHub() {
  const projects = [
    {
      title: 'Álbum Digital',
      desc: 'Gestiona tus estampas del Mundial 2026.',
      url: 'https://album.fullfan.net',
      icon: <LayoutGrid size={32} />,
      status: 'active',
      color: 'bg-cyan-500'
    },
    {
      title: 'Calendario 2026',
      desc: 'Horarios oficiales para Guatemala.',
      url: 'https://calendario2026.fullfan.net',
      icon: <Calendar size={32} />,
      status: 'active',
      color: 'bg-blue-600'
    },
    {
      title: 'Quiniela Oficial',
      desc: 'Compite y demuestra tus conocimientos.',
      url: 'https://quiniela.fullfan.net',
      icon: <Trophy size={32} />,
      status: 'active',
      color: 'bg-yellow-500'
    },
    {
      title: 'Full Fan Digital TV',
      desc: 'La experiencia definitiva en streaming.',
      url: '#',
      icon: <Tv size={32} />,
      status: 'construction',
      color: 'bg-slate-700'
    },
    {
      title: 'Systems CRM',
      desc: 'Software de gestión para academias.',
      url: '#',
      icon: <Settings size={32} />,
      status: 'construction',
      color: 'bg-slate-700'
    }
  ];

  return (
    <main className="min-h-screen bg-slate-950 text-white font-sans selection:bg-cyan-500/30">
      {/* Hero Section */}
      <div className="relative overflow-hidden pt-20 pb-16 px-6">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="flex justify-center mb-8">
            <div className="bg-white p-3 rounded-3xl shadow-[0_0_50px_rgba(255,255,255,0.1)]">
              <img src="/Logo FF.jpg" alt="Logo" className="w-24 h-24 rounded-2xl object-contain" />
            </div>
          </div>
          <h1 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter mb-4 leading-none">
            Full Fan <span className="text-cyan-500 text-stroke">Systems</span>
          </h1>
          <p className="text-slate-400 text-xl md:text-2xl font-bold uppercase tracking-widest italic">
            Guatemala City • Tech & Sports Ecosystem
          </p>
        </div>
        {/* Glow Decorativo */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-500/10 via-transparent to-transparent opacity-50 pointer-events-none"></div>
      </div>

      {/* Grid de Servicios */}
      <div className="max-w-6xl mx-auto px-6 pb-24">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((p, i) => (
            <a
              key={i}
              href={p.url}
              target={p.status === 'active' ? "_blank" : "_self"}
              className={`group relative p-8 rounded-[2.5rem] border-2 transition-all duration-500 overflow-hidden ${
                p.status === 'active' 
                ? 'bg-slate-900 border-slate-800 hover:border-cyan-500 hover:scale-[1.02] shadow-xl' 
                : 'bg-slate-900/50 border-slate-800 opacity-70 cursor-not-allowed'
              }`}
            >
              <div className={`${p.color} w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                {p.icon}
              </div>
              
              <h3 className="text-2xl font-black uppercase italic mb-2 flex items-center gap-2">
                {p.title}
                {p.status === 'active' && <ChevronRight className="text-cyan-500 group-hover:translate-x-2 transition-transform" />}
              </h3>
              
              <p className="text-slate-400 font-bold leading-tight">
                {p.desc}
              </p>

              {p.status === 'construction' && (
                <div className="mt-4 inline-block bg-slate-800 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-500">
                  En Construcción
                </div>
              )}

              {/* Efecto de luz al pasar el mouse */}
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/5 rounded-full blur-3xl group-hover:bg-cyan-500/10 transition-colors duration-500"></div>
            </a>
          ))}
        </div>
      </div>

      <footer className="py-12 border-t border-slate-900 text-center">
        <p className="text-slate-600 font-black uppercase text-xs tracking-[0.3em]">
          Full Fan Systems © 2026 • Innovación Digital
        </p>
      </footer>
    </main>
  );
}