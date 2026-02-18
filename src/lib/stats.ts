import { Player, Match, PlayerAggregatedStats, PartnerStats, FilterMode } from '@/types';

export function getFilteredMatches(matches: Match[], mode: FilterMode): Match[] {
  if (mode === 'full') return matches;
  const dates = [...new Set(matches.map(m => m.date))].sort().slice(-5);
  return matches.filter(m => dates.includes(m.date));
}

export function getMatchDates(matches: Match[]): string[] {
  return [...new Set(matches.map(m => m.date))].sort();
}

export function getMatchesByDate(matches: Match[], date: string): Match[] {
  return matches.filter(m => m.date === date);
}

export function getPlayerStats(
  players: Player[],
  matches: Match[],
  mode: FilterMode
): PlayerAggregatedStats[] {
  const filtered = getFilteredMatches(matches, mode);
  const lastDate = getMatchDates(matches).slice(-1)[0];
  const lastMatches = matches.filter(m => m.date === lastDate);

  // Calculate last-date points for MVP
  const lastDatePoints: Record<string, number> = {};
  lastMatches.forEach(m => {
    Object.entries(m.stats).forEach(([playerId, stat]) => {
      lastDatePoints[playerId] = (lastDatePoints[playerId] || 0) + stat.goals + stat.assists;
    });
  });
  const maxLastPoints = Math.max(0, ...Object.values(lastDatePoints));
  let mvpId = null;
  if (maxLastPoints > 0) {
    // Find all players with max points
    const candidates = Object.entries(lastDatePoints)
      .filter(([, points]) => points === maxLastPoints)
      .map(([playerId]) => playerId);

    // Among candidates, choose the one with best streak (highest streak value)
    if (candidates.length === 1) {
      mvpId = candidates[0];
    } else {
      mvpId = candidates.reduce((best, current) => {
        const bestPlayer = players.find(p => p.id === best);
        const currentPlayer = players.find(p => p.id === current);
        const bestStreak = bestPlayer?.stats.streak || 0;
        const currentStreak = currentPlayer?.stats.streak || 0;
        return currentStreak > bestStreak ? current : best;
      });
    }
  }

  // Hot streak: last 3 match-dates, win rate > 60%
  const allDates = getMatchDates(matches);
  const last3Dates = allDates.slice(-3);
  const hotStreakIds = new Set<string>();
  players.forEach(p => {
    let wins = 0, total = 0;
    matches.filter(m => last3Dates.includes(m.date)).forEach(m => {
      const inA = m.teamA.includes(p.id);
      const inB = m.teamB.includes(p.id);
      if (inA || inB) {
        total++;
        if ((inA && m.winner === 'A') || (inB && m.winner === 'B')) wins++;
      }
    });
    if (total >= 2 && wins / total >= 0.6) hotStreakIds.add(p.id);
  });

  return players.map(p => {
    let goals = 0, assists = 0, soloGoals = 0, matchesPlayed = 0, wins = 0, losses = 0, draws = 0;
    filtered.forEach(m => {
      const inA = m.teamA.includes(p.id);
      const inB = m.teamB.includes(p.id);
      if (!inA && !inB) return;
      matchesPlayed++;
      if (!m.isPenalties) {
        const stats = m.stats[p.id];
        if (stats) {
          goals += stats.goals;
          assists += stats.assists;
          if (stats.goals > 0 && stats.assists === 0) soloGoals += stats.goals;
        }
      }
      if (inA && m.winner === 'A') wins++;
      else if (inB && m.winner === 'B') wins++;
      else if (m.winner === 'draw') draws++;
      else losses++;
    });

    // Hot streak: G+A > 0 in last 3 matches played
    const playerMatches = matches.filter(m => m.teamA.includes(p.id) || m.teamB.includes(p.id)).slice(-3);
    const isHotStreak = playerMatches.length >= 3 && playerMatches.every(m => {
      if (m.isPenalties) return true; // penales no cuentan para hot streak?
      const stats = m.stats[p.id];
      return stats && (stats.goals + stats.assists) > 0;
    });

    // Best partner
    const partners = getIdealPartner(p.id, players, matches);
    const bestPartner = partners[0]?.partnerName || 'Ninguno';

    return {
      playerId: p.id,
      name: p.name,
      goals,
      assists,
      soloGoals,
      points: goals + assists,
      matchesPlayed,
      wins,
      losses,
      draws,
      isMvp: p.id === mvpId,
      isHotStreak,
      bestPartner,
    };
  }).filter(s => s.matchesPlayed > 0)
    .sort((a, b) => b.points - a.points || b.wins - a.wins || b.goals - a.goals);
}

export function getCumulativeData(
  players: Player[],
  matches: Match[],
  mode: FilterMode,
  stat: 'goals' | 'assists' | 'soloGoals'
) {
  const filtered = getFilteredMatches(matches, mode);
  const dates = [...new Set(filtered.map(m => m.date))].sort();

  return dates.map(date => {
    const matchesSoFar = filtered.filter(m => m.date <= date);
    const entry: Record<string, string | number> = { date };
    players.forEach(p => {
      let total = 0;
      matchesSoFar.forEach(m => {
        const s = m.stats[p.id];
        if (s) total += s[stat];
      });
      if (total > 0) entry[p.name] = total;
    });
    return entry;
  });
}

export function getIdealPartner(
  playerId: string,
  players: Player[],
  matches: Match[]
): PartnerStats[] {
  const partnerMap: Record<string, { games: number; wins: number }> = {};

  matches.forEach(m => {
    const inA = m.teamA.includes(playerId);
    const inB = m.teamB.includes(playerId);
    if (!inA && !inB) return;

    const teammates = inA ? m.teamA : m.teamB;
    const won = (inA && m.winner === 'A') || (inB && m.winner === 'B');

    teammates.filter(id => id !== playerId).forEach(tid => {
      if (!partnerMap[tid]) partnerMap[tid] = { games: 0, wins: 0 };
      partnerMap[tid].games++;
      if (won) partnerMap[tid].wins++;
    });
  });

  return Object.entries(partnerMap)
    .map(([partnerId, data]) => {
      const partner = players.find(p => p.id === partnerId);
      if (!partner) return null;
      return {
        partnerId,
        partnerName: partner.name,
        gamesPlayed: data.games,
        wins: data.wins,
        winRate: data.games > 0 ? Math.round((data.wins / data.games) * 100) : 0,
      };
    })
    .filter(Boolean)
    .filter(p => p.gamesPlayed >= 2)
    .sort((a, b) => b.winRate - a.winRate || b.wins - a.wins);
}

export function getDayLeader(players: Player[], matches: Match[], date: string) {
  const dayMatches = getMatchesByDate(matches, date);
  const points: Record<string, number> = {};
  dayMatches.forEach(m => {
    Object.entries(m.stats).forEach(([playerId, stat]) => {
      points[playerId] = (points[playerId] || 0) + stat.goals + stat.assists;
    });
  });
  const maxP = Math.max(0, ...Object.values(points));
  const leaderId = Object.entries(points).find(([, v]) => v === maxP)?.[0];
  return leaderId ? players.find(p => p.id === leaderId) : null;
}

export function generateWhatsAppText(stats: PlayerAggregatedStats[]): string {
  let text = '*LaLiga de Futsal Corojo*\n\n';
  text += 'RANKING *Actual:*\n\n';
  stats.slice(0, 10).forEach((s, i) => {
    const medal = i === 0 ? 'ORO' : i === 1 ? 'PLATA' : i === 2 ? 'BRONCE' : `${i + 1}.`;
    const fire = s.isHotStreak ? ' [HOT]' : '';
    const mvp = s.isMvp ? ' [MVP]' : '';
    text += `${medal} ${s.name}${mvp}${fire} — ${s.points}pts (${s.goals}G/${s.assists}A)\n`;
  });
  text += '\n¡Vamos Corojo!';
  return text;
}
