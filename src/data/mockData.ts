import { Player, Match } from '@/types';

export interface FilterMode {
  type: 'full' | 'last5';
}

// Mock data for 25 players with realistic names
const players: Player[] = [];

// Generate 100 realistic matches following Gol Gana rules
function generateMatches(): Match[] {
  return [];
}

export const matches: Match[] = generateMatches();

// Calculate real player statistics based on generated matches
function calculatePlayerStats(): Player[] {
  const playerStats: { [key: string]: { goals: number; assists: number; wins: number; losses: number; streak: number } } = {};

  // Initialize all players
  players.forEach(player => {
    playerStats[player.id] = { goals: 0, assists: 0, wins: 0, losses: 0, streak: 0 };
  });

  // Calculate stats from matches
  matches.forEach(match => {
    const teamAPlayers = new Set(match.teamA);
    const teamBPlayers = new Set(match.teamB);

    // Update goals and assists
    Object.entries(match.stats).forEach(([playerId, stats]) => {
      if (playerStats[playerId]) {
        playerStats[playerId].goals += stats.goals;
        playerStats[playerId].assists += stats.assists;
      }
    });

    // Update wins/losses based on match result
    if (match.winner === 'A') {
      match.teamA.forEach(playerId => {
        if (playerStats[playerId]) playerStats[playerId].wins += 1;
      });
      match.teamB.forEach(playerId => {
        if (playerStats[playerId]) playerStats[playerId].losses += 1;
      });
    } else if (match.winner === 'B') {
      match.teamB.forEach(playerId => {
        if (playerStats[playerId]) playerStats[playerId].wins += 1;
      });
      match.teamA.forEach(playerId => {
        if (playerStats[playerId]) playerStats[playerId].losses += 1;
      });
    }
    // Draws don't count as wins or losses
  });

  // Calculate streaks (simplified - just based on recent matches)
  players.forEach(player => {
    const playerMatches = matches.filter(m => m.teamA.includes(player.id) || m.teamB.includes(player.id));
    const recentMatches = playerMatches.slice(0, 5); // Last 5 matches

    let currentStreak = 0;
    for (const match of recentMatches) {
      const isInWinningTeam = (match.winner === 'A' && match.teamA.includes(player.id)) ||
                             (match.winner === 'B' && match.teamB.includes(player.id));

      if (isInWinningTeam) {
        currentStreak = currentStreak > 0 ? currentStreak + 1 : 1;
      } else if (match.winner !== 'draw') {
        currentStreak = currentStreak < 0 ? currentStreak - 1 : -1;
        break; // Streak broken
      }
    }

    playerStats[player.id].streak = currentStreak;
  });

  // Update players with calculated stats
  return players.map(player => ({
    ...player,
    stats: playerStats[player.id]
  }));
}

export const playersWithRealStats: Player[] = calculatePlayerStats();