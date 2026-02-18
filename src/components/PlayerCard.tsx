import { useState } from 'react';
import { Player } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Flame, Crown } from 'lucide-react';

interface PlayerCardProps {
  player: Player;
  isMvp?: boolean;
  isHotStreak?: boolean;
  bestPartner?: string;
  goals: number;
  assists: number;
  soloGoals: number;
  wins: number;
  losses: number;
  showExpanded?: boolean;
  rank?: number;
}

export default function PlayerCard({ player, isMvp, isHotStreak, bestPartner, goals, assists, soloGoals, wins, losses, showExpanded = false, rank }: PlayerCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (showExpanded) {
    return (
      <div className="glass-card-strong p-6 transition-all duration-300">
        <div className="text-center mb-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            {rank && (
              <div className="text-sm font-bold text-muted-foreground">
                #{rank}
              </div>
            )}
            {isMvp && <Crown className="h-5 w-5 text-gold" />}
            {isHotStreak && <Flame className="h-5 w-5 text-fire animate-pulse" />}
          </div>
          <Avatar className="h-16 w-16 mx-auto mb-3 rounded-xl">
            {player.avatar ? (
              <img src={player.avatar} alt={player.name} className="object-cover w-full h-full rounded-xl" />
            ) : (
              <AvatarFallback className="bg-gradient-to-br from-pink-200 to-purple-200 text-purple-700 text-xl rounded-xl">
                {player.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            )}
          </Avatar>
          <h3 className="font-bold text-lg">{player.name}</h3>
          {bestPartner && (
            <p className="text-sm text-muted-foreground">Mejor pareja: {bestPartner}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-mint">{goals}</div>
            <div className="text-sm text-muted-foreground">Goles</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-lavender">{assists}</div>
            <div className="text-sm text-muted-foreground">Asistencias</div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="text-center">
            <div className="text-lg font-semibold">{soloGoals}</div>
            <div className="text-xs text-muted-foreground">Goles Solo</div>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold text-green-600">{wins}</div>
              <div className="text-xs text-muted-foreground">Victorias</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-red-600">{losses}</div>
              <div className="text-xs text-muted-foreground">Derrotas</div>
            </div>
            <div>
              <div className="text-lg font-semibold">{player.stats && typeof player.stats.streak === 'number' ? (player.stats.streak > 0 ? '+' : '') + player.stats.streak : '-'}</div>
              <div className="text-xs text-muted-foreground">Racha</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div className="glass-card p-4 cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-xl">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              {player.avatar ? (
                <img src={player.avatar} alt={player.name} className="object-cover w-full h-full rounded-full" />
              ) : (
                <AvatarFallback className="bg-gradient-to-br from-pink-200 to-purple-200 text-purple-700 text-lg">
                  {player.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm truncate">{player.name}</h3>
                {isMvp && <Crown className="h-4 w-4 text-gold" />}
                {isHotStreak && <Flame className="h-4 w-4 text-fire animate-pulse" />}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs">
                  {goals}G / {assists}A
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Racha: {player.stats && typeof player.stats.streak === 'number' ? (player.stats.streak > 0 ? '+' : '') + player.stats.streak : '-'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </DialogTrigger>
      <DialogContent className="glass-card-strong max-w-md">
          <DialogTitle className="flex flex-col items-center gap-4 text-center">
            <Avatar className="h-24 w-24 rounded-xl">
              {player.avatar ? (
                <img src={player.avatar} alt={player.name} className="object-cover w-full h-full rounded-xl" />
              ) : (
                <AvatarFallback className="bg-gradient-to-br from-pink-200 to-purple-200 text-purple-700 text-3xl rounded-xl">
                  {player.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              )}
            </Avatar>
            <div>
              <h2 className="text-xl font-bold">{player.name}</h2>
              {isMvp && (
                <div className="flex items-center gap-1.5 text-gold">
                  <Crown className="h-4 w-4" />
                  <span className="text-sm font-semibold">MVP de la Jornada</span>
                </div>
              )}
              {isHotStreak && (
                <div className="flex items-center gap-1.5 text-fire">
                  <Flame className="h-4 w-4" />
                  <span className="text-sm font-semibold">En Racha</span>
                </div>
              )}
            </div>
          </DialogTitle>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-mint">{goals}</div>
              <div className="text-sm text-muted-foreground">Goles</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-lavender">{assists}</div>
              <div className="text-sm text-muted-foreground">Asistencias</div>
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Goles Solo</div>
            <div className="font-semibold">{soloGoals}</div>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold">{wins}</div>
              <div className="text-xs text-muted-foreground">Victorias</div>
            </div>
            <div>
              <div className="text-lg font-semibold">{losses}</div>
              <div className="text-xs text-muted-foreground">Derrotas</div>
            </div>
            <div>
              <div className="text-lg font-semibold">{player.stats && typeof player.stats.streak === 'number' ? (player.stats.streak > 0 ? '+' : '') + player.stats.streak : '-'}</div>
              <div className="text-xs text-muted-foreground">Racha</div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}