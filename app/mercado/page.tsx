'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../src/lib/supabase';
import Link from 'next/link';
import { ArrowLeftRight, MessageCircle, LogOut } from 'lucide-react';

export default function Mercado() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchMatches = async () => {
      // 1. Obtener sesión actual
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // 2. Llamar a la función SQL de Supabase para buscar coincidencias
        const { data, error } = await supabase.rpc('encontrar_matches_perfectos', {
          mi_usuario_id: session.user.id
        });

        if (!error && data) {
          setMatches(data);
        }
      }
      setLoading(false);
    };

    fetchMatches();

    // 3. Suscribirse a cambios de sesión
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        setMatches([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 p-8 font-sans">
      
      {/* Encabezado / Branding y Navegación */}
      <header className="max-w-5xl mx-auto mb-12 border-b border-slate-700 pb-6 flex flex-col md:flex-row justify-between items-center md:items-end gap-6">
        <div className="text-center md:text-left">
          <h1 className="text-4xl font-bold tracking-tight text-white mb-2">
            Full Fan <span className="text-cyan-400">Systems</span>
          </h1>
          <p className="text-rose-600 font-bold uppercase tracking-widest text-sm">
            Mercado de Cambios
          </p>
        </div>

        {/* Navegación Central */}
        <nav className="flex gap-8">
          <Link href="/" className="text-sm font-bold uppercase tracking-widest text-slate-400 hover:text-cyan-400 transition-all pb-1 border-b-2 border-transparent">
            Mi Álbum
          </Link>
          <Link href="/mercado" className="text-sm font-bold uppercase tracking-widest text-rose-500 border-b-2 border-rose-500 pb-1">
            Mercado
          </Link>
        </nav>

        {/* Zona de Usuario / Autenticación */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-500 font-medium hidden lg:block">
                {user.email}
              </span>
              <button 
                onClick={() => supabase.auth.signOut()}
                className="text-slate-400 hover:text-rose-500 transition-colors p-2 bg-slate-800 rounded-full border border-slate-700 shadow-lg"
                title="Cerrar sesión"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <Link href="/login" className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-6 rounded-lg transition-colors text-sm shadow-lg shadow-cyan-500/20">
              Entrar
            </Link>
          )}
        </div>
      </header>

      {/* Zona de Matches */}
      <section className="max-w-5xl mx-auto">
        {loading ? (
          <div className="text-center text-slate-400 py-12 flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
            Analizando inventarios globales...
          </div>
        ) : !user ? (
          <div className="bg-slate-800 border border-slate-700 p-8 rounded-xl text-center shadow-lg">
            <h3 className="text-xl font-bold text-white mb-2">Inicia sesión para ver tus matches</h3>
            <p className="text-slate-400 mb-6">Necesitamos saber qué estampas tienes para encontrar a tu compañero ideal.</p>
            <Link href="/login" className="bg-rose-600 hover:bg-rose-700 text-white font-bold py-2 px-6 rounded-lg transition-colors inline-block">
              Iniciar Sesión
            </Link>
          </div>
        ) : matches.length === 0 ? (
          <div className="bg-slate-800 border border-slate-700 p-8 rounded-xl text-center shadow-lg flex flex-col items-center">
            <div className="bg-slate-900 p-4 rounded-full mb-4">
              <ArrowLeftRight size={32} className="text-slate-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Aún no hay matches perfectos</h3>
            <p className="text-slate-400 max-w-md mx-auto">Sigue actualizando tu inventario marcando tus estampas repetidas y faltantes. Te avisaremos cuando alguien tenga exactamente lo que buscas.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matches.map((match, index) => (
              <div key={index} className="bg-slate-800 border border-slate-700 p-6 rounded-xl shadow-lg hover:border-rose-500 transition-all group">
                
                {/* Usuario con el que vas a intercambiar */}
                <div className="flex justify-between items-center mb-6 border-b border-slate-700 pb-4">
                  <span className="font-bold text-white flex items-center gap-2">
                    <span className="bg-cyan-900/50 text-cyan-400 p-1.5 rounded-md text-xs font-mono">@</span>
                    {match.partner_username.split('@')[0]}
                  </span>
                  
                  {/* Botón de Chat Actualizado */}
                  <Link 
                    href={`/chat/${match.partner_id}`} 
                    className="bg-slate-700 group-hover:bg-rose-600 p-2 rounded-lg transition-colors" 
                    title="Iniciar Chat"
                  >
                    <MessageCircle size={18} className="text-white" />
                  </Link>
                </div>
                
                {/* Detalle del Intercambio */}
                <div className="flex justify-between items-center text-center">
                  <div className="flex-1 bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
                    <div className="text-xs text-slate-400 mb-1">Recibes</div>
                    <div className="font-bold text-cyan-400 text-lg">{match.codigo_que_recibo}</div>
                  </div>
                  
                  <div className="px-3 text-slate-600 group-hover:text-rose-500 transition-colors">
                    <ArrowLeftRight size={20} />
                  </div>
                  
                  <div className="flex-1 bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
                    <div className="text-xs text-slate-400 mb-1">Entregas</div>
                    <div className="font-bold text-rose-500 text-lg">{match.codigo_que_doy}</div>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}