export interface Player {
  id: string;
  name: string;
  avatar?: string;
  stats: {
    goals: number;
    assists: number;
    wins: number;
    losses: number;
    streak: number; // positive for wins, negative for losses
  };
}

export interface Match {
  id: string;
  date: string;
  teamA: string[]; // player ids
  teamB: string[]; // player ids
  scoreA: number;
  scoreB: number;
  winner: 'A' | 'B' | 'draw';
  isPenalties: boolean;
  stats: {
    [playerId: string]: {
      goals: number;
      assists: number;
      individualPlay: boolean;
    };
  };
}

export type FilterMode = 'full' | 'last5';

export interface PlayerAggregatedStats {
  playerId: string;
  name: string;
  goals: number;
  assists: number;
  soloGoals: number;
  points: number;
  matchesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  isMvp: boolean;
  isHotStreak: boolean;
  bestPartner: string;
}

export interface PartnerStats {
  partnerId: string;
  partnerName: string;
  gamesPlayed: number;
  wins: number;
  winRate: number;
}