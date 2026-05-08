'use client';

// Usando las columnas correctas: code, team y name
import { useEffect, useState } from 'react';
import { supabase } from '../../src/lib/supabase';
import { useRouter } from 'next/navigation';
import { MessageSquare } from 'lucide-react';

export default function Mercado() {
  const [oportunidades, setOportunidades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchOportunidades = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setLoading(false);
        return;
      }

      // 1. Obtener las estampas que YA TIENES (cantidad mayor a 0)
      const { data: misEstampas, error: errEstampas } = await supabase
        .from('user_inventory')
        .select('sticker_id')
        .eq('user_id', session.user.id)
        .gt('quantity', 0);

      if (errEstampas) {
        console.error("Error obteniendo mi inventario:", errEstampas);
        setLoading(false);
        return;
      }

      // Creamos una lista solo con los IDs de las estampas que ya posees
      const idsQueYaTengo = misEstampas?.map(s => s.sticker_id) || [];

      // 2. Buscar TODAS las repetidas de otros usuarios en la red
      const { data: allDuplicates, error: errMatches } = await supabase
        .from('user_inventory')
        .select(`
          user_id,
          sticker_id,
          stickers (
            code,
            team,
            name
          )
        `)
        .neq('user_id', session.user.id)
        .gt('quantity', 1);

      if (errMatches) {
        console.error("Error en búsqueda de repetidas:", errMatches);
        setLoading(false);
        return;
      }

      // 3. LA MAGIA: Filtramos para mostrarte SOLO las que NO tienes
      const matchesPerfectos = (allDuplicates || []).filter(
        (dup) => !idsQueYaTengo.includes(dup.sticker_id)
      );

      console.log("Intercambios listos para ti:", matchesPerfectos);
      setOportunidades(matchesPerfectos);
      setLoading(false);
    };

    fetchOportunidades();
  }, []);

  const iniciarNegociacion = async (otroUsuarioId: string) => {
    const { data: room, error } = await supabase
      .from('rooms')
      .insert({})
      .select()
      .single();

    if (error) {
      console.error("Error creando sala:", error);
      return;
    }

    if (room) {
      router.push(`/chat/${room.id}`);
    }
  };

  return (
    <main className="min-h-screen bg-slate-900 p-6 font-sans italic pb-32">
      <header className="mb-8">
        <h1 className="text-4xl font-black text-white uppercase tracking-tighter">
          Mercado de <span className="text-cyan-400">Intercambios</span>
        </h1>
        <p className="text-slate-400 font-bold uppercase text-xs tracking-widest mt-1">
          Buscando en tu inventario Full Fan
        </p>
      </header>

      {loading ? (
        <div className="text-center text-slate-500 py-20 font-bold uppercase animate-pulse">
          Sincronizando con la red...
        </div>
      ) : oportunidades.length === 0 ? (
        <div className="bg-slate-800/50 border border-slate-700 rounded-3xl p-10 text-center">
          <p className="text-slate-500 font-black uppercase text-sm tracking-widest">
            No hay intercambios disponibles por ahora
          </p>
          <p className="text-slate-600 text-[10px] mt-2 uppercase font-bold">
            Asegúrate de que otros usuarios tengan repetidas en su inventario
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {oportunidades.map((opt, i) => (
            <div key={i} className="bg-slate-800 border border-slate-700 p-5 rounded-3xl flex items-center justify-between shadow-xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center font-black text-slate-900 text-sm">
                  {opt.stickers?.code || '?'}
                </div>
                <div>
                  <h3 className="text-white font-black uppercase text-lg leading-none">
                    {opt.stickers?.name || 'Jugador'}
                  </h3>
                  <p className="text-cyan-400 text-[10px] font-black uppercase tracking-tighter mt-1">
                    {opt.stickers?.team || 'Equipo'} - Disponible
                  </p>
                </div>
              </div>
              
              <button 
                onClick={() => iniciarNegociacion(opt.user_id)}
                className="bg-cyan-600 hover:bg-cyan-500 text-white p-4 rounded-2xl flex items-center gap-2 transition-all active:scale-95"
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