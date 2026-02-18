import React, { useState, useCallback, useEffect } from 'react';
import { Player, Match, FilterMode } from '@/types';
import { playersWithRealStats as initialPlayers, matches as initialMatches } from '@/data/mockData';
import { supabase } from '@/lib/supabase';
import { LeagueContext } from './LeagueContextContext';

export function LeagueProvider({ children }: { children: React.ReactNode }) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [filterMode, setFilterMode] = useState<FilterMode>('full');
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  // Cargar datos de Supabase y suscribirse a cambios en tiempo real
  useEffect(() => {
    setLoading(true);
    // Cargar jugadores
    const fetchPlayers = async () => {
      const { data, error } = await supabase.from('players').select('*').order('created_at', { ascending: true });
      if (error) {
        console.error('Error loading players from Supabase:', error);
        setPlayers([]);
      } else {
        setPlayers(data || []);
      }
      setLoading(false);
    };
    // Cargar partidos
    const fetchMatches = async () => {
      const { data, error } = await supabase.from('matches').select('*').order('date', { ascending: true });
      if (error) {
        console.error('Error loading matches from Supabase:', error);
        setMatches([]);
      } else {
        setMatches(data || []);
      }
    };
    fetchPlayers();
    fetchMatches();

    // Suscripción en tiempo real a jugadores
    const playersSub = supabase
      .channel('public:players')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'players' }, payload => {
        fetchPlayers();
      })
      .subscribe();
    // Suscripción en tiempo real a partidos
    const matchesSub = supabase
      .channel('public:matches')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'matches' }, payload => {
        fetchMatches();
      })
      .subscribe();

    // Cleanup
    return () => {
      supabase.removeChannel(playersSub);
      supabase.removeChannel(matchesSub);
    };
  }, []);

  const addMatch = useCallback(async (match: Match) => {
    try {
      // No enviar el campo id para que Supabase genere el uuid automáticamente
      const { id, ...matchWithoutId } = match;
      const { data, error } = await supabase.from('matches').insert([matchWithoutId]).select();
      if (error) throw error;
      if (data && data[0]) {
        setMatches(prev => [...prev, data[0]]);
      }
    } catch (error) {
      console.error('Error adding match:', error);
      setMatches(prev => [...prev, match]);
    }
  }, []);

  const updateMatch = useCallback(async (id: string, updates: Partial<Match>) => {
    try {
      const { error } = await supabase.from('matches').update(updates).eq('id', id);
      if (error) throw error;
      setMatches(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
    } catch (error) {
      console.error('Error updating match:', error);
      setMatches(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
    }
  }, []);

  const deleteMatch = useCallback(async (id: string) => {
    try {
      const { error } = await supabase.from('matches').delete().eq('id', id);
      if (error) throw error;
      setMatches(prev => prev.filter(m => m.id !== id));
    } catch (error) {
      console.error('Error deleting match:', error);
      setMatches(prev => prev.filter(m => m.id !== id));
    }
  }, []);

  const addPlayer = useCallback(async (player: Omit<Player, 'id'>) => {
    try {
      const { data, error } = await supabase.from('players').insert([player]).select();
      if (error) throw error;
      if (data && data[0]) {
        setPlayers(prev => [...prev, data[0]]);
      }
    } catch (error) {
      console.error('[addPlayer] Error al guardar jugador en Supabase:', error);
    }
  }, []);

  const updatePlayer = useCallback(async (id: string, updates: Partial<Player>) => {
    try {
      const { error } = await supabase.from('players').update(updates).eq('id', id);
      if (error) throw error;
      setPlayers(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    } catch (error) {
      console.error('Error updating player:', error);
      setPlayers(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    }
  }, []);

  const deletePlayer = useCallback(async (id: string) => {
    try {
      const { error } = await supabase.from('players').delete().eq('id', id);
      if (error) throw error;
      setPlayers(prev => prev.filter(p => p.id !== id));

      // También eliminar al jugador de los partidos
      const updatedMatches = matches.map(m => ({
        ...m,
        teamA: m.teamA.filter((pid: string) => pid !== id),
        teamB: m.teamB.filter((pid: string) => pid !== id),
        stats: m.stats ? Object.fromEntries(Object.entries(m.stats).filter(([pid]) => pid !== id)) : {}
      }));
      // Actualizar partidos en Supabase
      for (const match of updatedMatches) {
        if (match.id) {
          await supabase.from('matches').update({
            teamA: match.teamA,
            teamB: match.teamB,
            stats: match.stats
          }).eq('id', match.id);
        }
      }
      setMatches(updatedMatches);
    } catch (error) {
      console.error('[deletePlayer] Error al eliminar jugador:', error);
      setPlayers(prev => prev.filter(p => p.id !== id));
      setMatches(prev => prev.map(m => ({
        ...m,
        teamA: m.teamA.filter((pid: string) => pid !== id),
        teamB: m.teamB.filter((pid: string) => pid !== id),
        stats: m.stats ? Object.fromEntries(Object.entries(m.stats).filter(([pid]) => pid !== id)) : {}
      })));
    }
  }, [matches]);

  const resetSeason = useCallback(async () => {
    try {
      // Eliminar todos los partidos de Supabase
      const { error } = await supabase.from('matches').delete().neq('id', '');
      if (error) throw error;
      setMatches([]);
    } catch (error) {
      console.error('Error resetting season:', error);
      setMatches([]);
    }
  }, []);

  const login = useCallback((password: string) => {
    if (password === 'admin123') {
      setIsAdmin(true);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setIsAdmin(false);
  }, []);

  return (
    <LeagueContext.Provider value={{ players, matches, filterMode, setFilterMode, addMatch, updateMatch, deleteMatch, addPlayer, updatePlayer, deletePlayer, resetSeason, isAdmin, login, logout, loading }}>
      {children}
    </LeagueContext.Provider>
  );
}

