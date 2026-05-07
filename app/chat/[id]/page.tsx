'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '../../../src/lib/supabase';
import { Send, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ChatRoom() {
  const { id: roomId } = useParams();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [user, setUser] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 1. Obtener usuario actual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // 2. Cargar mensajes históricos
    const loadMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true });
      if (data) setMessages(data);
    };

    loadMessages();

    // 3. Escuchar nuevos mensajes en tiempo real (Realtime)
    const channel = supabase
      .channel(`room-${roomId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `room_id=eq.${roomId}` }, 
      (payload) => {
        setMessages((prev) => [...prev, payload.new]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [roomId]);

  // Auto-scroll al último mensaje
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    await supabase.from('messages').insert({
      room_id: roomId,
      sender_id: user.id,
      text: newMessage.trim(),
    });

    setNewMessage('');
  };

  return (
    <main className="min-h-screen bg-slate-900 flex flex-col italic font-sans">
      {/* Header del Chat */}
      <header className="bg-slate-800 p-4 border-b border-slate-700 flex items-center gap-4 sticky top-0 z-10">
        <Link href="/mercado" className="text-slate-400 hover:text-white"><ArrowLeft /></Link>
        <div className="w-10 h-10 bg-cyan-600 rounded-full flex items-center justify-center font-black text-white">FF</div>
        <div>
          <h2 className="text-white font-black uppercase tracking-tighter text-sm">Chat de Intercambio</h2>
          <p className="text-cyan-400 text-[10px] font-bold uppercase tracking-widest">En línea</p>
        </div>
      </header>

      {/* Área de Mensajes */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-2xl text-sm font-bold shadow-lg ${
              msg.sender_id === user?.id 
                ? 'bg-cyan-600 text-white rounded-tr-none' 
                : 'bg-slate-800 text-slate-100 rounded-tl-none border border-slate-700'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      {/* Input de Mensaje */}
      <form onSubmit={sendMessage} className="p-4 bg-slate-800 border-t border-slate-700 flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Escribe tu propuesta de intercambio..."
          className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
        />
        <button type="submit" className="bg-cyan-600 p-3 rounded-xl text-white hover:bg-cyan-500 transition-all active:scale-95">
          <Send size={20} />
        </button>
      </form>
    </main>
  );
}