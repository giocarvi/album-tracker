'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../src/lib/supabase';
import { useRouter } from 'next/navigation';
import { MessageSquare, Search } from 'lucide-react';

export default function Mercado() {
  const [oportunidades, setOportunidades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchOportunidades = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // 1. Obtener lo que me falta
      const { data: misFaltantes } = await supabase
        .from('user_stickers')
        .select('sticker_id')
        .eq('user_id', session.user.id)
        .eq('collected', false);

      const idsFaltantes = misFaltantes?.map(s => s.sticker_id) || [];

      // 2. Buscar quién tiene esas estampas como repetidas
      const { data: matches } = await supabase
        .from('user_stickers')
        .select(`
          user_id,
          sticker_id,
          stickers (number, team)
        `)
        .in('sticker_id', idsFaltantes)
        .neq('user_id', session.user.id)
        .gt('quantity', 1);

      setOportunidades(matches || []);
      setLoading(false);
    };

    fetchOportunidades();
  }, []);

  const iniciarNegociacion = async (otroUsuarioId: string) => {
    const { data: room } = await supabase
      .from('rooms')
      .insert({ })
      .select()
      .single();

    if (room) {
      router.push(`/chat/${room.id}`);
    }
  };

  return (
    <main className="min-h-screen bg-slate-900 p-6 font-sans italic">
      <header className="mb-8">
        <h1 className="text-4xl font-black text-white uppercase tracking-tighter">
          Mercado de <span className="text-cyan-400">Intercambios</span>
        </h1>
        <p className="text-slate-400 font-bold uppercase text-xs tracking-widest mt-1">
          Encuentra a tu pareja de fichajes perfecta
        </p>
      </header>

      {loading ? (
        <div className="text-center text-slate-500 py-20 font-bold uppercase animate-pulse">
          Buscando coincidencias...
        </div>
      ) : oportunidades.length === 0 ? (
        <div className="text-center text-slate-500 py-20 font-bold uppercase">
          No hay intercambios disponibles por ahora
        </div>
      ) : (
        <div className="grid gap-4">
          {oportunidades.map((opt, i) => (
            <div key={i} className="bg-slate-800 border border-slate-700 p-5 rounded-3xl flex items-center justify-between shadow-xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center font-black text-slate-900 text-xl shadow-inner">
                  {opt.stickers?.number}
                </div>
                <div>
                  <h3 className="text-white font-black uppercase text-lg leading-none">
                    {opt.stickers?.team}
                  </h3>
                  <p className="text-cyan-400 text-[10px] font-black uppercase tracking-tighter mt-1">
                    Disponible para cambio
                  </p>
                </div>
              </div>
              
              <button 
                onClick={() => iniciarNegociacion(opt.user_id)}
                className="bg-cyan-600 hover:bg-cyan-500 text-white p-4 rounded-2xl flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-cyan-900/20"
              >
                <MessageSquare size={18} />
                <span className="font-black uppercase text-[10px] tracking-widest">Negociar</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}