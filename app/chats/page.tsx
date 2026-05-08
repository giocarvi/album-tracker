'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../src/lib/supabase';
import { useRouter } from 'next/navigation';
import { MessageSquare, ChevronRight, Loader2 } from 'lucide-react';

export default function ChatsList() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchRooms = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      // LA MAGIA: Buscamos todas las salas donde yo sea user_a (invité) o user_b (me invitaron)
      const { data: roomsData, error } = await supabase
        .from('rooms')
        .select(`
          id,
          created_at,
          user_a,
          user_b,
          messages (text, created_at)
        `)
        .or(`user_a.eq.${session.user.id},user_b.eq.${session.user.id}`)
        .order('created_at', { ascending: false });

      if (!error && roomsData) {
        setRooms(roomsData);
      }
      setLoading(false);
    };

    fetchRooms();
  }, [router]);

  return (
    <main className="min-h-screen bg-slate-900 p-6 font-sans italic pb-32">
      <header className="mb-8">
        <h1 className="text-4xl font-black text-white uppercase tracking-tighter">
          Mis <span className="text-cyan-400">Mensajes</span>
        </h1>
        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">
          Bandeja de negociación Full Fan
        </p>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="text-cyan-500 animate-spin" size={40} />
          <p className="text-slate-500 font-black uppercase text-xs">Cargando conversaciones...</p>
        </div>
      ) : rooms.length === 0 ? (
        <div className="bg-slate-800/50 border border-slate-700 rounded-3xl p-10 text-center shadow-lg">
          <MessageSquare className="mx-auto text-slate-600 mb-4" size={48} />
          <p className="text-slate-400 font-bold uppercase text-sm">No tienes chats activos todavía</p>
          <button 
            onClick={() => router.push('/mercado')}
            className="mt-6 bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-3 rounded-xl font-black uppercase text-xs tracking-widest transition-all active:scale-95"
          >
            Ir al Mercado
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {rooms.map((room) => {
            const lastMessage = room.messages?.[room.messages.length - 1];
            return (
              <button
                key={room.id}
                onClick={() => router.push(`/chat/${room.id}`)}
                className="w-full bg-slate-800 border border-slate-700 p-5 rounded-3xl flex items-center justify-between hover:bg-slate-750 transition-all active:scale-[0.98] text-left shadow-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-600 to-blue-700 rounded-2xl flex items-center justify-center font-black text-white shadow-lg">
                    FF
                  </div>
                  <div>
                    <h3 className="text-white font-black uppercase text-sm">
                      Negociación #{room.id.slice(0, 5)}
                    </h3>
                    <p className="text-slate-400 text-xs font-medium line-clamp-1 mt-1 italic">
                      {lastMessage?.text || "Toca para abrir el chat..."}
                    </p>
                  </div>
                </div>
                <ChevronRight className="text-slate-600" size={20} />
              </button>
            );
          })}
        </div>
      )}
    </main>
  );
}