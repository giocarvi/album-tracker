'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../src/lib/supabase';
import { useRouter } from 'next/navigation';
import { MinusCircle, PlusCircle, LogOut, Search, Phone } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const [stickers, setStickers] = useState<any[]>([]);
  const [inventory, setInventory] = useState<Record<number, number>>({});
  const [user, setUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('Todas');
  
  // Agregamos el router aquí
  const router = useRouter();

  useEffect(() => {
    loadStickers();
    
    // Verificamos la sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        // Si no hay sesión, expulsamos al Login inmediatamente
        router.push('/login');
        return;
      }
      setUser(session.user);
      loadInventory(session.user.id);
    });

    // Escuchamos si el usuario cierra sesión para expulsarlo
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setUser(null);
        setInventory({});
        router.push('/login');
      } else {
        setUser(session.user);
        loadInventory(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const loadStickers = async () => {
    const { data, error } = await supabase.from('stickers').select('*').order('id');
    if (!error && data) setStickers(data);
  };

  const loadInventory = async (userId: string) => {
    const { data } = await supabase.from('user_inventory').select('sticker_id, quantity').eq('user_id', userId);
    if (data) {
      const invMap: Record<number, number> = {};
      data.forEach(item => { invMap[item.sticker_id] = item.quantity; });
      setInventory(invMap);
    }
  };

  const updateQuantity = async (stickerId: number, delta: number) => {
    if (!user) return alert('Inicia sesión para guardar tu progreso.');
    const currentQty = inventory[stickerId] || 0;
    const newQty = Math.max(0, currentQty + delta);
    setInventory(prev => ({ ...prev, [stickerId]: newQty }));
    await supabase.from('user_inventory').upsert(
      { user_id: user.id, sticker_id: stickerId, quantity: newQty }, 
      { onConflict: 'user_id, sticker_id' }
    );
  };

  const totalStickers = stickers.length;
  const ownedStickers = stickers.filter(s => (inventory[s.id] || 0) > 0).length;
  const progressPercentage = totalStickers > 0 ? Math.round((ownedStickers / totalStickers) * 100) : 0;

  // Filtrado y Agrupamiento
  const filteredStickers = stickers.filter(s => {
    const qty = inventory[s.id] || 0;
    const matchesSearch = s.code.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.team.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.name?.toLowerCase().includes(searchTerm.toLowerCase());
    if (filter === 'Faltantes') return matchesSearch && qty === 0;
    if (filter === 'Repetidas') return matchesSearch && qty > 1;
    return matchesSearch;
  });

  // Función para agrupar por selección (team)
  const groupedStickers = filteredStickers.reduce((groups: Record<string, any[]>, sticker) => {
    const groupName = sticker.team || 'Otras';
    if (!groups[groupName]) groups[groupName] = [];
    groups[groupName].push(sticker);
    return groups;
  }, {});

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 p-6 font-sans">
      
      {/* Header Personalizado */}
      <header className="max-w-7xl mx-auto mb-10 border-b border-slate-800 pb-8 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-5">
          <div className="relative w-20 h-20 bg-white rounded-2xl p-1 shadow-xl border border-slate-700 overflow-hidden">
            <img src="/Logo FF.jpg" alt="Full Fan Logo" className="w-full h-full object-contain p-2 rounded-xl" />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic leading-none">Full Fan</h1>
            <p className="text-cyan-400 font-bold text-lg uppercase tracking-tight">Album Tracker</p>
          </div>
        </div>

        <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 flex items-center gap-4 shadow-lg">
          <div className="bg-green-500/20 p-3 rounded-full text-green-400">
            <Phone size={24} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Contáctanos</span>
            <a href="https://wa.me/50241562336" target="_blank" rel="noopener noreferrer" className="text-xl font-black text-white hover:text-green-400 transition-colors">+502 41562336</a>
          </div>
        </div>
      </header>

      {/* Barra de Progreso */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row items-center justify-between gap-6 bg-slate-800/40 p-4 rounded-2xl border border-slate-700/50">
        <div className="flex-1 max-w-sm w-full bg-slate-900 p-4 rounded-xl border border-slate-800">
           <div className="flex justify-between text-[10px] font-black uppercase mb-2">
             <span className="text-slate-500 tracking-wider">Tu Colección</span>
             <span className="text-cyan-400 font-bold">{progressPercentage}% ({ownedStickers}/{totalStickers})</span>
           </div>
           <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden border border-slate-700/50">
             <div className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 transition-all duration-500" style={{ width: `${progressPercentage}%` }}></div>
           </div>
        </div>
        <nav className="flex gap-4">
          <Link href="/" className="px-5 py-2 rounded-lg text-xs font-bold bg-cyan-600 text-white shadow-lg">MI ÁLBUM</Link>
          {user && (
            <button onClick={() => supabase.auth.signOut()} className="bg-slate-800 p-2.5 rounded-xl border border-slate-700 text-slate-400 hover:text-rose-500">
              <LogOut size={18} />
            </button>
          )}
        </nav>
      </div>

      {/* Buscador */}
      <section className="max-w-7xl mx-auto mb-12 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-3.5 text-slate-500" size={18} />
          <input 
            type="text" 
            placeholder="Busca por código, equipo o jugador..." 
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-12 py-3 text-sm focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 bg-slate-800 p-1.5 rounded-xl border border-slate-700">
          {['Todas', 'Faltantes', 'Repetidas'].map(f => (
            <button 
              key={f} 
              onClick={() => setFilter(f)} 
              className={`px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${filter === f ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-700'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </section>

      {/* Listado Agrupado */}
      <div className="max-w-7xl mx-auto space-y-16 pb-20">
        {Object.entries(groupedStickers).map(([team, groupStickers]) => (
          <section key={team} className="animate-in fade-in duration-700">
            <div className="flex items-center gap-4 mb-6">
              <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic border-l-4 border-cyan-500 pl-4">
                {team}
              </h2>
              <div className="flex-1 h-px bg-slate-800"></div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-800 px-3 py-1 rounded-full">
                {groupStickers.length} Estampas
              </span>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
              {groupStickers.map(sticker => {
                const qty = inventory[sticker.id] || 0;
                return (
                  <div key={sticker.id} className={`p-4 rounded-2xl border-2 transition-all duration-300 ${qty > 0 ? 'bg-slate-800 border-cyan-500/40 shadow-xl' : 'bg-slate-800/30 border-slate-700 opacity-60'}`}>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[9px] font-black bg-slate-900 px-2 py-0.5 rounded text-slate-500 uppercase tracking-tighter truncate max-w-[70%]">{sticker.team}</span>
                      {qty > 1 && <span className="bg-rose-600 text-white text-[9px] px-1.5 rounded-full font-bold">x{qty}</span>}
                    </div>
                    <div className="text-2xl font-black text-white mb-0.5 tracking-tighter">{sticker.code}</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase truncate mb-4">{sticker.name}</div>
                    <div className="flex justify-between items-center bg-slate-900 rounded-xl p-1.5 border border-slate-700 shadow-inner">
                      <button onClick={() => updateQuantity(sticker.id, -1)} className="text-slate-600 hover:text-rose-500 transition-all active:scale-90"><MinusCircle size={22} /></button>
                      <span className="font-mono font-black text-lg text-cyan-400">{qty}</span>
                      <button onClick={() => updateQuantity(sticker.id, 1)} className="text-slate-600 hover:text-cyan-400 transition-all active:scale-90"><PlusCircle size={22} /></button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}