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
        router.push('/'); // Redirige al álbum automáticamente
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push('/'); // Redirige al álbum automáticamente
      }
    } catch (err: any) {
      // Personalizamos los mensajes de error al español
      if (err.message.includes('Invalid login credentials')) {
        setError('Correo o contraseña incorrectos.');
      } else if (err.message.includes('User already registered')) {
        setError('Este correo ya está registrado.');
      } else if (err.message.includes('Password should be at least')) {
        setError('La contraseña debe tener al menos 6 caracteres.');
      } else {
        setError('Ocurrió un error. Intenta nuevamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-900 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md bg-slate-800/50 p-8 rounded-3xl border border-slate-700 shadow-2xl backdrop-blur-sm">
        
        {/* Botón Volver */}
        <Link href="/" className="inline-flex items-center text-slate-400 hover:text-cyan-400 mb-6 transition-colors text-sm font-bold">
          <ArrowLeft size={16} className="mr-2" /> Volver al Álbum
        </Link>

        {/* Logo y Título */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-24 h-24 bg-white rounded-2xl p-1 shadow-xl border border-slate-700 overflow-hidden mb-4">
            <img src="/Logo FF.jpg" alt="Full Fan Logo" className="w-full h-full object-contain p-2 rounded-xl" />
          </div>
          <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter">Full Fan</h1>
          <p className="text-cyan-400 font-bold text-sm uppercase tracking-widest">Album Tracker</p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleAuth} className="space-y-4">
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/50 text-rose-400 p-3 rounded-xl text-sm font-bold text-center">
              {error}
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-4 top-3.5 text-slate-500" size={20} />
            <input
              type="email"
              placeholder="Tu correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-12 py-3 text-white focus:ring-2 focus:ring-cyan-500/50 outline-none transition-all placeholder:text-slate-600"
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-3.5 text-slate-500" size={20} />
            <input
              type="password"
              placeholder="Tu contraseña (mínimo 6 caracteres)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-12 py-3 text-white focus:ring-2 focus:ring-cyan-500/50 outline-none transition-all placeholder:text-slate-600"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-black uppercase tracking-widest py-3.5 rounded-xl transition-all shadow-lg shadow-cyan-900/40 flex justify-center items-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : (isSignUp ? 'Crear Cuenta' : 'Entrar al Álbum')}
          </button>
        </form>

        {/* Alternar entre Login y Registro */}
        <div className="mt-6 text-center">
          <p className="text-slate-400 text-sm">
            {isSignUp ? '¿Ya tienes una cuenta?' : '¿Aún no tienes cuenta?'}
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
              }}
              className="ml-2 text-cyan-400 font-bold hover:text-white transition-colors underline decoration-cyan-400/30"
            >
              {isSignUp ? 'Inicia Sesión' : 'Regístrate aquí'}
            </button>
          </p>
        </div>

      </div>
    </main>
  );
}