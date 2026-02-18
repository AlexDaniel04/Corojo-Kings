import { useState } from 'react';
import { useLeague } from '@/context/useLeague';
import { getPlayerStats, generateWhatsAppText } from '@/lib/stats';
import { FilterMode } from '@/types';
import { Button } from '@/components/ui/button';
import { Crown, Flame, Share2, Filter, BarChart3, ChevronLeft, ChevronRight } from 'lucide-react';
import PlayerCard from '@/components/PlayerCard';

export default function Dashboard() {
  const { players, matches, filterMode, setFilterMode } = useLeague();
  const stats = getPlayerStats(players, matches, filterMode);
  const [currentPage, setCurrentPage] = useState(1);
  const playersPerPage = 20;

  const totalPages = Math.ceil(stats.length / playersPerPage);
  const startIndex = (currentPage - 1) * playersPerPage;
  const endIndex = startIndex + playersPerPage;
  const currentStats = stats.slice(startIndex, endIndex);

  const handleShare = () => {
    const text = generateWhatsAppText(stats);
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-primary" />
          Ranking General
        </h2>
        <div className="flex items-center gap-2">
          <div className="glass-card flex p-1 gap-1">
            <button
              onClick={() => setFilterMode('full')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                filterMode === 'full' ? 'bg-primary text-primary-foreground shadow' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Temporada
            </button>
            <button
              onClick={() => setFilterMode('last5')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                filterMode === 'last5' ? 'bg-primary text-primary-foreground shadow' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Últimos 5
            </button>
          </div>
          <Button size="sm" variant="outline" onClick={handleShare} className="gap-1.5">
            <Share2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">WhatsApp</span>
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">#</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Jugador</th>
                <th className="text-center px-3 py-3 font-semibold text-muted-foreground">G</th>
                <th className="text-center px-3 py-3 font-semibold text-muted-foreground">A</th>
                <th className="text-center px-3 py-3 font-semibold text-muted-foreground">GS</th>
                <th className="text-center px-3 py-3 font-semibold text-muted-foreground">Pts</th>
                <th className="text-center px-3 py-3 font-semibold text-muted-foreground">PJ</th>
              </tr>
            </thead>
            <tbody>
              {currentStats.map((s, i) => {
                const actualRank = startIndex + i;
                return (
                <tr
                  key={s.playerId}
                  className={`border-b border-border/30 transition-all hover:bg-accent/30 ${
                    s.isMvp ? 'gold-highlight bg-gold/5' : ''
                  }`}
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <td className="px-4 py-3 font-bold text-muted-foreground">
                    {actualRank === 0 ? '🥇' : actualRank === 1 ? '🥈' : actualRank === 2 ? '🥉' : actualRank + 1}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{s.name}</span>
                      {s.isMvp && <Crown className="h-4 w-4 text-gold" />}
                      {s.isHotStreak && (
                        <div className="flex items-center gap-1 fire-indicator">
                          <Flame className="h-3 w-3" />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="text-center px-3 py-3 font-medium">{s.goals}</td>
                  <td className="text-center px-3 py-3 font-medium">{s.assists}</td>
                  <td className="text-center px-3 py-3 font-medium">{s.soloGoals}</td>
                  <td className="text-center px-3 py-3">
                    <span className="stat-badge bg-mint text-mint-foreground">{s.points}</span>
                  </td>
                  <td className="text-center px-3 py-3 text-muted-foreground">{s.matchesPlayed}</td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Button>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/30 rounded-md border">
            <span className="text-sm font-medium text-foreground">
              {startIndex + 1}-{Math.min(endIndex, stats.length)}
            </span>
            <span className="text-sm text-muted-foreground">de</span>
            <span className="text-sm font-medium text-foreground">
              {stats.length}
            </span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="gap-1"
          >
            Siguiente
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
