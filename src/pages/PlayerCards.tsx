import { useState } from 'react';
import { useLeague } from '@/context/useLeague';
import { getPlayerStats } from '@/lib/stats';
import PlayerCard from '@/components/PlayerCard';
import { Input } from '@/components/ui/input';
import { Crown, Flame, Users, Search } from 'lucide-react';

export default function PlayerCards() {
  const { players, matches, loading } = useLeague();
  console.log('PlayerCards players:', players);
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Generar stats y asociar player directamente
  const stats = players.map(p => {
    const s = getPlayerStats([p], matches, 'full')[0];
    return {
      player: p,
      stats: s ?? {
        goals: 0,
        assists: 0,
        soloGoals: 0,
        points: 0,
        matchesPlayed: 0,
        wins: 0,
        losses: 0,
        draws: 0,
        isMvp: false,
        isHotStreak: false,
        bestPartner: 'Ninguno',
      },
    };
  });

  // Filtrar jugadores por nombre
  const filteredStats = stats.filter(({ player }) => {
    return player.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Cargando jugadores...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Users className="h-6 w-6 text-primary" />
          Jugadores
        </h2>
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar jugador..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Player Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredStats.map(({ player, stats }, index) => {
          const isSelected = selectedPlayer === player.id;
          return (
            <div
              key={player.id}
              className={`cursor-pointer transition-all duration-200 ${
                isSelected ? 'scale-105' : 'hover:scale-102'
              }`}
              onClick={() => setSelectedPlayer(isSelected ? null : player.id)}
            >
              <PlayerCard
                player={player}
                isMvp={stats.isMvp}
                isHotStreak={stats.isHotStreak}
                bestPartner={stats.bestPartner}
                goals={stats.goals}
                assists={stats.assists}
                soloGoals={stats.soloGoals}
                wins={stats.wins}
                losses={stats.losses}
                showExpanded={isSelected}
                rank={index + 1}
              />
            </div>
          );
        })}
      </div>

      {filteredStats.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            {searchTerm ? 'No se encontraron jugadores con ese nombre' : 'No hay jugadores registrados aún'}
          </p>
        </div>
      )}
    </div>
  );
}