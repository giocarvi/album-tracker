'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '../../../src/lib/supabase';
import { Send, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ChatRoom() {
  const { id: partnerId } = useParams();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [user, setUser] = useState<any>(null);
  const [partnerName, setPartnerName] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 1. Obtener sesión y datos del compañero
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadMessages(session.user.id);
        loadPartnerInfo();
      }
    });

    // 2. ESCUCHAR EN TIEMPO REAL
    const channel = supabase
      .channel('chat_realtime')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages' 
      }, (payload) => {
        setMessages((prev) => [...prev, payload.new]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [partnerId]);

  // Auto-scroll al último mensaje
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadPartnerInfo = async () => {
    const { data } = await supabase.from('profiles').select('username').eq('id', partnerId).single();
    if (data) setPartnerName(data.username.split('@')[0]);
  };

  const loadMessages = async (myId: string) => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${myId},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${myId})`)
      .order('created_at', { ascending: true });
    
    if (data) setMessages(data);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    const { error } = await supabase.from('messages').insert({
      sender_id: user.id,
      receiver_id: partnerId,
      content: newMessage
    });

    if (!error) setNewMessage('');
  };

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Header del Chat */}
      <header className="bg-slate-800 border-b border-slate-700 p-4 flex items-center gap-4 sticky top-0 z-10 shadow-lg">
        <Link href="/mercado" className="text-slate-400 hover:text-white transition-colors">
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h2 className="font-bold text-white leading-tight">Chat con @{partnerName}</h2>
          <p className="text-xs text-cyan-400 font-bold uppercase tracking-widest">Negociación de Intercambio</p>
        </div>
      </header>

      {/* Área de Mensajes */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-w-3xl mx-auto w-full">
        {messages.map((msg) => {
          const isMine = msg.sender_id === user?.id;
          return (
            <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] px-4 py-2 rounded-2xl shadow-sm ${
                isMine 
                  ? 'bg-rose-600 text-white rounded-tr-none' 
                  : 'bg-slate-800 border border-slate-700 text-slate-100 rounded-tl-none'
              }`}>
                <p className="text-sm">{msg.content}</p>
                <span className="text-[10px] opacity-50 block mt-1 text-right">
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={scrollRef} />
      </div>

      {/* Input de Mensaje */}
      <footer className="p-4 bg-slate-900 border-t border-slate-800 sticky bottom-0">
        <form onSubmit={sendMessage} className="max-w-3xl mx-auto flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Escribe tu propuesta de cambio..."
            className="flex-1 bg-slate-800 border border-slate-700 rounded-full px-6 py-3 text-white focus:outline-none focus:border-cyan-500 transition-all shadow-inner"
          />
          <button 
            type="submit"
            className="bg-cyan-600 hover:bg-cyan-500 p-3 rounded-full text-white transition-all shadow-lg active:scale-95"
          >
            <Send size={20} />
          </button>
        </form>
      </footer>
    </main>
  );
}