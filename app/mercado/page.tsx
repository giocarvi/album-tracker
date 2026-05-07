'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../src/lib/supabase';
import { useRouter } from 'next/navigation';
import { MessageSquare, Search, ArrowRight } from 'lucide-react';

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
      // (Asumiendo que tienes una columna 'duplicates' o similar)
      const { data: matches } = await supabase
        .from('user_stickers')
        .select(`
          user_id,
          sticker_id,
          stickers (number, team)
        `)
        .in('sticker_id', idsFaltantes)
        .neq('user_id', session.user.id)
        .gt('quantity', 1); // Gente que tenga más de 1

      setOportunidades(matches || []);
      setLoading(false);
    };

    fetchOportunidades();
  }, []);

  const iniciarNegociacion = async (otroUsuarioId: string) => {
    // Lógica para crear o buscar una room de chat
    const { data: room } = await supabase
      .from('rooms')
      .insert({ type: 'private' })
      .select()
      .single();

    if (room) {
      router.push(`/chat/${room.id}`);
    }
  };

  return (
    <main className="min-h-screen bg-slate-900 p-6 font-sans italic">
      <header className="mb-8">
        <h1 className="text-4xl font-black text-white uppercase tracking-tighter">Mercado de <span className="text-cyan-400">Intercambios</span></h1>
        <p className="text-slate-400 font-bold">Encuentra a tu pareja de fichajes perfecta.</p>
      </header>

      <div className="grid gap-4">
        {oportunidades.map((opt, i) => (
          <div key={i} className="bg-slate-800 border border-slate-700 p-5 rounded-3xl flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center font-black text-slate-900 text-xl">
                {opt.stickers.number}
              </div>
              <div>
                <h3 className="text-white font-black uppercase text-lg">{opt.stickers.team}</h3>
                <p className="text-cyan-400 text-xs font-bold uppercase">Disponible para cambio</p>
              </div>
            </div>
            
            <button 
              onClick={() => iniciarNegociacion(opt.user_id)}
              className="bg-cyan-600 hover:bg-cyan-500 text-white p-4 rounded-2xl flex items-center gap-2 transition-all shadow-lg"
            >
              <MessageSquare size={20} />
              <span className="font-black uppercase text-xs tracking-widest">Negociar</span>
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}

### ¿Qué hace este código?
1. **Inteligencia de Negocio:** Mira qué estampas te faltan y busca en toda la base de datos quién las tiene marcadas como repetidas (`quantity > 1`).
2. **Interfaz Limpia:** Muestra una lista de tarjetas con el número de estampa, el equipo y el botón de acción.
3. **Conexión con el Chat:** Al darle a "Negociar", el sistema te redirige a la pantalla de chat que creamos anteriormente.

**Recuerda activar el Realtime en Supabase** para que los mensajes fluyan al instante. ¡Tu comunidad de coleccionistas está a punto de despegar! ¿Quieres que te ayude con el diseño de alguna otra parte del mercado?