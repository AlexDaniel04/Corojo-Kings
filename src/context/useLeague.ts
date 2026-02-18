import { useContext } from 'react';
import { LeagueContext } from './LeagueContextContext';

export function useLeague() {
  const ctx = useContext(LeagueContext);
  if (!ctx) throw new Error('useLeague must be used within LeagueProvider');
  return ctx;
}