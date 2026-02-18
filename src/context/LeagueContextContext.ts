import { createContext } from 'react';
import { Player, Match, FilterMode } from '@/types';

export interface LeagueContextType {
  players: Player[];
  matches: Match[];
  filterMode: FilterMode;
  setFilterMode: (mode: FilterMode) => void;
  addMatch: (match: Match) => void;
  updateMatch: (id: string, updates: Partial<Match>) => void;
  deleteMatch: (id: string) => void;
  addPlayer: (player: Omit<Player, 'id'>) => void;
  updatePlayer: (id: string, updates: Partial<Player>) => void;
  deletePlayer: (id: string) => void;
  resetSeason: () => void;
  isAdmin: boolean;
  login: (password: string) => boolean;
  logout: () => void;
  loading: boolean;
}

export const LeagueContext = createContext<LeagueContextType | null>(null);