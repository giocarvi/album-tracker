'use client';

import { useState } from 'react';
import { supabase } from '../../src/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, ArrowLeft, Loader2 } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        router.push('/');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push('/');
      }
    } catch (err: any) {
      if (err.message.includes('Invalid login credentials')) {
        setError('Correo o contraseña incorrectos.');
      } else {
        setError('Ocurrió un error. Intenta nuevamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md bg-[#1e293b] p-8 rounded-3xl border border-slate-700 shadow-2xl">
        
        {/* Logo de Full Fan */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-24 h-24 bg-white rounded-2xl p-1 shadow-xl overflow-hidden mb-4 border border-slate-600">
            <img 
              src="/Logo FF.jpg" 
              alt="Logo Full Fan" 
              className="w-full h-full object-contain"
            />
          </div>
          
          {/* Título solicitado */}
          <h1 className="text-3xl font-black text-white text-center leading-tight">
            Full Fan <span className="text-cyan-400">Album Tracker</span>
          </h1>
          
          <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mt-2">
            {isSignUp ? 'Crear Cuenta' : 'Iniciar Sesión'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/50 text-rose-400 p-3 rounded-xl text-sm font-bold text-center italic">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Correo Electrónico</label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 text-slate-500" size={18} />
              <input
                type="email"
                placeholder="tu@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#0f172a] border border-slate-700 rounded-xl pl-12 py-3.5 text-white focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 text-slate-500" size={18} />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#0f172a] border border-slate-700 rounded-xl pl-12 py-3.5 text-white focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#e11d48] hover:bg-rose-500 text-white font-black uppercase tracking-widest py-4 rounded-xl transition-all shadow-lg active:scale-[0.98] mt-4 flex justify-center items-center"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : (isSignUp ? 'Registrarse' : 'Entrar')}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-slate-700 pt-6">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-cyan-400 font-bold hover:text-white transition-colors text-sm"
          >
            {isSignUp ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate aquí'}
          </button>
        </div>

      </div>
    </main>
  );
}