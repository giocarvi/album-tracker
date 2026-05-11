'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../src/lib/supabase'; // Ajusta la ruta si es necesario
import { useRouter } from 'next/navigation';
import { Trophy, Save, CalendarDays, AlertCircle } from 'lucide-react';

export default function Quiniela() {
  const [matches, setMatches] = useState<any[]>([]);
  const [predictions, setPredictions] = useState<Record<number, { a: string, b: string }>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const initData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }
      setUser(session.user);
      await fetchMatchesAndPredictions(session.user.id);
    };
    initData();
  }, [router]);

  const fetchMatchesAndPredictions = async (userId: string) => {
    // 1. Traer los partidos
    const { data: matchesData } = await supabase
      .from('matches')
      .select('*')
      .order('match_date', { ascending: true });

    if (matchesData) setMatches(matchesData);

    // 2. Traer las predicciones del usuario
    const { data: predsData } = await supabase
      .from('predictions')
      .select('*')
      .eq('user_id', userId);

    if (predsData) {
      const predsMap: Record<number, { a: string, b: string }> = {};
      predsData.forEach(p => {
        predsMap[p.match_id] = { a: p.predicted_score_a.toString(), b: p.predicted_score_b.toString() };
      });
      setPredictions(predsMap);
    }
    setLoading(false);
  };

  const handleScoreChange = (matchId: number, team: 'a' | 'b', value: string) => {
    // Solo permitimos números
    if (value !== '' && !/^\d+$/.test(value)) return;
    
    setPredictions(prev => ({
      ...prev,
      [matchId]: {
        ...prev[matchId] || { a: '', b: '' },
        [team]: value
      }
    }));
  };

  const guardarPronosticos = async () => {
    setSaving(true);
    const upserts = Object.keys(predictions).map(matchIdStr => {
      const matchId = parseInt(matchIdStr);
      const pred = predictions[matchId];
      
      // Solo guardamos si ambos campos tienen un número
      if (pred.a !== '' && pred.b !== '') {
        return {
          user_id: user.id,
          match_id: matchId,
          predicted_score_a: parseInt(pred.a),
          predicted_score_b: parseInt(pred.b)
        };
      }
      return null;
    }).filter(Boolean); // Filtramos los nulos

    if (upserts.length > 0) {
      const { error } = await supabase
        .from('predictions')
        .upsert(upserts, { onConflict: 'user_id, match_id' });

      if (error) {
        alert("Error al guardar: " + error.message);
      } else {
        alert("¡Pronósticos guardados con éxito!");
      }
    }
    setSaving(false);
  };

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 p-6 font-sans pb-32">
      <header className="mb-8 border-b border-slate-800 pb-6 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic flex items-center gap-3">
            <Trophy className="text-yellow-400" size={36} /> Quiniela
          </h1>
          <p className="text-cyan-400 font-bold text-xs uppercase tracking-widest mt-1">
            Pronósticos Full Fan 2026
          </p>
        </div>
        <button 
          onClick={guardarPronosticos}
          disabled={saving}
          className="bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-3 rounded-xl font-black uppercase text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(34,211,238,0.2)] transition-all active:scale-95 disabled:opacity-50"
        >
          <Save size={18} /> {saving ? 'Guardando...' : 'Guardar Todo'}
        </button>
      </header>

      {loading ? (
        <div className="text-center text-slate-500 py-20 font-bold uppercase animate-pulse">
          Cargando partidos...
        </div>
      ) : matches.length === 0 ? (
        <div className="bg-slate-800/50 border border-slate-700 rounded-3xl p-10 text-center flex flex-col items-center">
          <CalendarDays className="text-slate-600 mb-4" size={48} />
          <p className="text-slate-400 font-black uppercase tracking-widest">
            Aún no hay partidos habilitados
          </p>
        </div>
      ) : (
        <div className="grid gap-4 max-w-3xl mx-auto">
          {matches.map(match => (
            <div key={match.id} className="bg-slate-800 border-2 border-slate-700 p-5 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl transition-all hover:border-slate-600">
              
              {/* Equipo A */}
              <div className="flex-1 flex flex-col items-center md:items-end w-full">
                <span className="text-lg font-black uppercase tracking-tighter mb-2 text-center md:text-right">{match.team_a}</span>
                <input 
                  type="text" 
                  maxLength={2}
                  value={predictions[match.id]?.a ?? ''}
                  onChange={(e) => handleScoreChange(match.id, 'a', e.target.value)}
                  className="w-16 h-16 bg-slate-900 border-2 border-slate-700 rounded-xl text-center text-2xl font-black text-cyan-400 focus:border-cyan-500 focus:ring-0 outline-none"
                  placeholder="-"
                />
              </div>

              {/* VS */}
              <div className="text-slate-600 font-black italic text-xl">VS</div>

              {/* Equipo B */}
              <div className="flex-1 flex flex-col items-center md:items-start w-full">
                <span className="text-lg font-black uppercase tracking-tighter mb-2 text-center md:text-left">{match.team_b}</span>
                <input 
                  type="text" 
                  maxLength={2}
                  value={predictions[match.id]?.b ?? ''}
                  onChange={(e) => handleScoreChange(match.id, 'b', e.target.value)}
                  className="w-16 h-16 bg-slate-900 border-2 border-slate-700 rounded-xl text-center text-2xl font-black text-cyan-400 focus:border-cyan-500 focus:ring-0 outline-none"
                  placeholder="-"
                />
              </div>

            </div>
          ))}
        </div>
      )}
    </main>
  );
}