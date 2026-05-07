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
  const [partnerName, setPartnerName] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 1. Obtener sesión y datos del compañero
    const setupChat = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);

      // Intentar obtener el nombre del compañero (opcional)
      const { data: roomData } = await supabase
        .from('rooms')
        .select('id')
        .eq('id', roomId)
        .single();
      
      if (roomData) {
        setPartnerName('Coleccionista Full Fan');
      }
    };

    setupChat();

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

    // 3. Suscripción en tiempo real (Realtime)
    const channel = supabase
      .channel(`room-${roomId}`)
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages', 
          filter: `room_id=eq.${roomId}` 
        }, 
        (payload) => {
          setMessages((prev) => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => { 
      supabase.removeChannel(channel); 
    };
  }, [roomId]);

  // Scroll automático al recibir mensajes
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    const messageText = newMessage.trim();
    setNewMessage(''); // Limpiar input inmediatamente para mejor UX

    const { error } = await supabase.from('messages').insert({
      room_id: roomId,
      sender_id: user.id,
      text: messageText,
    });

    if (error) {
      console.error("Error enviando mensaje:", error);
      // Podrías devolver el texto al input si falla
    }
  };

  return (
    <main className="min-h-screen bg-slate-900 flex flex-col italic font-sans overflow-hidden">
      {/* Header del Chat */}
      <header className="bg-slate-800 p-4 border-b border-slate-700 flex items-center gap-4 sticky top-0 z-10 shadow-lg">
        <Link href="/chats" className="text-slate-400 hover:text-cyan-400 transition-colors">
          <ArrowLeft size={24} />
        </Link>
        
        <div className="w-10 h-10 bg-cyan-600 rounded-full flex items-center justify-center font-black text-white shadow-inner">
          FF
        </div>
        
        <div className="flex-1">
          <h2 className="text-white font-black uppercase tracking-tighter text-sm leading-none">
            {partnerName}
          </h2>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            <p className="text-cyan-400 text-[10px] font-black uppercase tracking-widest">
              Chat Activo
            </p>
          </div>
        </div>
      </header>

      {/* Área de Mensajes */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
        {messages.length === 0 && (
          <div className="text-center py-10">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">
              Inicia la conversación para el intercambio
            </p>
          </div>
        )}
        
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] p-3.5 rounded-2xl text-sm font-bold shadow-md ${
              msg.sender_id === user?.id 
                ? 'bg-cyan-600 text-white rounded-tr-none' 
                : 'bg-slate-800 text-slate-100 rounded-tl-none border border-slate-700'
            }`}>
              {msg.text}
              <p className="text-[9px] opacity-50 mt-1 text-right">
                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      {/* Input de Mensaje */}
      <form 
        onSubmit={sendMessage} 
        className="p-4 bg-slate-800 border-t border-slate-700 flex gap-2 pb-28 md:pb-6"
      >
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Escribe tu propuesta..."
          className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:ring-2 focus:ring-cyan-500 outline-none transition-all placeholder:text-slate-600"
        />
        <button 
          type="submit" 
          disabled={!newMessage.trim()}
          className="bg-cyan-600 p-3.5 rounded-xl text-white hover:bg-cyan-500 transition-all active:scale-95 disabled:opacity-50 disabled:grayscale"
        >
          <Send size={20} />
        </button>
      </form>
    </main>
  );
}