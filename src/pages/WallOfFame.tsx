import { useState } from 'react';
import { useLeague } from '@/context/useLeague';
import { getMatchDates, getMatchesByDate, getDayLeader } from '@/lib/stats';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Crown, CheckCircle, Star, Trophy, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { penaltyPhrase, assistPhrases, individualPhrases, getRandomPhrase } from '@/data/phrases';

export default function WallOfFame() {
  const { players, matches } = useLeague();
  const dates = getMatchDates(matches);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    dates.length > 0 ? new Date(dates[dates.length - 1] + 'T12:00:00') : undefined
  );

  const selectedDateString = selectedDate ? selectedDate.toISOString().split('T')[0] : '';
  const dayMatches = getMatchesByDate(matches, selectedDateString);
  const leader = getDayLeader(players, matches, selectedDateString);

  const getPlayer = (id: string) => players.find(p => p.id === id);

  // Función para verificar si una fecha tiene partidos
  const hasMatchesOnDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return dates.includes(dateString);
  };

  // Crear array de fechas disponibles para el calendario
  const availableDates = dates.map(dateString => new Date(dateString + 'T12:00:00'));

  // Crear modificadores para el calendario
  const modifiers = {
    hasMatches: availableDates,
  };

  const modifiersStyles = {
    hasMatches: {
      backgroundColor: 'rgb(34, 197, 94)', // green-500
      color: 'white',
      fontWeight: 'bold',
      borderRadius: '6px',
    },
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <Trophy className="h-6 w-6 text-primary" />
        Muro de la Fama
      </h2>

      {/* Date Selector */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-3">
          <CalendarIcon className="h-5 w-5 text-muted-foreground" />
          <div className="flex-1">
            <label className="text-sm font-medium text-muted-foreground block mb-2">Seleccionar fecha</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? (
                    format(selectedDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })
                  ) : (
                    "Selecciona una fecha"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  modifiers={modifiers}
                  modifiersStyles={modifiersStyles}
                  locale={es}
                  className="rounded-md border"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      {/* Day Leader */}
      {leader && (
        <Card className="glass-card gold-highlight overflow-hidden">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="text-5xl">{leader.name.charAt(0)}</div>
            <div>
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-gold" />
                <span className="text-sm font-medium text-gold-foreground">MVP del Día</span>
              </div>
              <p className="text-2xl font-bold mt-1">{leader.name}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Matches */}
      <div className="space-y-4">
        {dayMatches.map((m, i) => {
          const scorer = Object.entries(m.stats).find(([, s]) => s.goals > 0)?.[0];
          const assistant = Object.entries(m.stats).find(([, s]) => s.assists > 0)?.[0];
          const scorerPlayer = scorer ? getPlayer(scorer) : null;
          const assistantPlayer = assistant ? getPlayer(assistant) : null;
          const opposingTeam = scorer && m.teamA.includes(scorer) ? 'Equipo B' : 'Equipo A';

          let matchDescription = '';
          if (m.isPenalties) {
            matchDescription = `Partido definido por penales. Ganador: ${m.winner === 'A' ? 'Equipo A' : 'Equipo B'}`;
          } else if (scorerPlayer) {
            if (assistantPlayer) {
              const phrase = getRandomPhrase(assistPhrases);
              matchDescription = phrase
                .replace('{scorer}', scorerPlayer.name)
                .replace('{opposingTeam}', opposingTeam)
                .replace('{assistant}', assistantPlayer.name);
            } else {
              const phrase = getRandomPhrase(individualPhrases);
              matchDescription = phrase.replace('{scorer}', scorerPlayer.name);
            }
          }

          return (
            <Card key={m.id} className="glass-card" style={{ animationDelay: `${i * 100}ms` }}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">
                  Partido {i + 1} — {m.scoreA}-{m.scoreB}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-3 italic">{matchDescription}</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className={`space-y-1 ${m.winner === 'A' ? 'opacity-100' : 'opacity-60'}`}>
                    <p className="text-xs font-semibold text-mint-foreground flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-mint" /> Equipo A
                      {m.winner === 'A' && <CheckCircle className="h-3 w-3 text-green-500" />}
                    </p>
                    {m.teamA.map(id => {
                      const p = getPlayer(id);
                      const s = m.stats[id];
                      return (
                        <p key={id} className="text-sm flex items-center gap-1">
                          {p?.name} — <span className="font-semibold">{s?.goals || 0}G/{s?.assists || 0}A</span>
                          {s?.individualPlay && <Star className="h-3 w-3 text-yellow-500" />}
                        </p>
                      );
                    })}
                  </div>
                  <div className={`space-y-1 ${m.winner === 'B' ? 'opacity-100' : 'opacity-60'}`}>
                    <p className="text-xs font-semibold text-lavender-foreground flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-lavender" /> Equipo B
                      {m.winner === 'B' && <CheckCircle className="h-3 w-3 text-green-500" />}
                    </p>
                    {m.teamB.map(id => {
                      const p = getPlayer(id);
                      const s = m.stats[id];
                      return (
                        <p key={id} className="text-sm flex items-center gap-1">
                          {p?.name} — <span className="font-semibold">{s?.goals || 0}G/{s?.assists || 0}A</span>
                          {s?.individualPlay && <Star className="h-3 w-3 text-yellow-500" />}
                        </p>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
