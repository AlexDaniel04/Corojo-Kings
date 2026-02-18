import { useState } from 'react';
import { useLeague } from '@/context/useLeague';
import { Match } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Plus, Check, FileText, Target, ArrowLeft, CheckCircle, XCircle, ChevronDown } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';

export default function RegisterMatch() {
  const { players, matches, addMatch, isAdmin } = useLeague();
  const { toast } = useToast();
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [teamA, setTeamA] = useState<string[]>([]);
  const [teamB, setTeamB] = useState<string[]>([]);
  const [scorer, setScorer] = useState<string>('');
  const [assistant, setAssistant] = useState<string>('');
  const [noAssistant, setNoAssistant] = useState(false);
  const [isPenalties, setIsPenalties] = useState(false);
  const [winner, setWinner] = useState<'A' | 'B' | 'draw'>('A');
  const [openA, setOpenA] = useState(false);
  const [openB, setOpenB] = useState(false);
  const [openGol, setOpenGol] = useState(false);
  const [openAsist, setOpenAsist] = useState(false);
  const [statsInput, setStatsInput] = useState<Record<string, { goals: number; assists: number; individualPlay: boolean }>>({});

  const datesWithMatches = matches.map(match => new Date(match.date + 'T12:00:00'));

  const togglePlayer = (id: string, team: 'A' | 'B') => {
    if (team === 'A') {
      if (teamA.includes(id)) setTeamA(teamA.filter(p => p !== id));
      else if (teamA.length < 3) {
        setTeamA([...teamA, id]);
        setTeamB(teamB.filter(p => p !== id));
      }
    } else {
      if (teamB.includes(id)) setTeamB(teamB.filter(p => p !== id));
      else if (teamB.length < 3) {
        setTeamB([...teamB, id]);
        setTeamA(teamA.filter(p => p !== id));
      }
    }
  };

  const handleSubmit = () => {
    if (teamA.length !== 3 || teamB.length !== 3) {
      toast({ title: 'Error', description: 'Cada equipo necesita exactamente 3 jugadores', variant: 'destructive' });
      return;
    }

    if (!isPenalties && !scorer) {
      toast({ title: 'Error', description: 'Debes seleccionar un goleador', variant: 'destructive' });
      return;
    }

    if (!isPenalties && assistant && noAssistant) {
      toast({ title: 'Error', description: 'No puedes seleccionar asistente y marcar "Sin Asistencia"', variant: 'destructive' });
      return;
    }

    if (!isPenalties && assistant && !teamA.includes(scorer) && !teamB.includes(scorer)) {
      toast({ title: 'Error', description: 'El goleador debe estar en uno de los equipos', variant: 'destructive' });
      return;
    }

    if (!isPenalties && assistant && ((teamA.includes(scorer) && !teamA.includes(assistant)) || (teamB.includes(scorer) && !teamB.includes(assistant)))) {
      toast({ title: 'Error', description: 'El asistente debe ser compañero del goleador', variant: 'destructive' });
      return;
    }

    let stats: Record<string, { goals: number; assists: number; individualPlay: boolean }> = {};
    let matchWinner: 'A' | 'B' | 'draw' = 'draw';

    if (isAdmin) {
      // Lógica para admin (Gol Gana automático)
      [...teamA, ...teamB].forEach(id => {
        stats[id] = { goals: 0, assists: 0, individualPlay: false };
      });

      if (!isPenalties) {
        stats[scorer].goals = 1;
        if (assistant && !noAssistant) {
          stats[assistant].assists = 1;
        } else {
          stats[scorer].individualPlay = true;
        }
      }

      if (isPenalties) {
        matchWinner = winner;
      } else {
        matchWinner = teamA.includes(scorer) ? 'A' : 'B';
      }
    } else {
      // Lógica para no-admin (inputs manuales)
      stats = { ...statsInput };

      // Validar máximo 1 gol por equipo
      const teamAGoals = teamA.reduce((sum, id) => sum + (stats[id]?.goals || 0), 0);
      const teamBGoals = teamB.reduce((sum, id) => sum + (stats[id]?.goals || 0), 0);

      if (!isPenalties && (teamAGoals > 1 || teamBGoals > 1)) {
        toast({ title: 'Error', description: 'Máximo 1 gol por equipo en Gol Gana', variant: 'destructive' });
        return;
      }

      if (isPenalties) {
        matchWinner = winner;
      } else {
        if (teamAGoals === 1 && teamBGoals === 1) {
          matchWinner = 'draw';
        } else if (teamAGoals === 1) {
          matchWinner = 'A';
        } else if (teamBGoals === 1) {
          matchWinner = 'B';
        } else {
          matchWinner = 'draw';
        }
      }
    }

    const match: Match = {
      id: `m_${Date.now()}`,
      date,
      teamA,
      teamB,
      scoreA: matchWinner === 'A' ? 1 : 0,
      scoreB: matchWinner === 'B' ? 1 : 0,
      winner: matchWinner,
      isPenalties,
      stats,
    };

    addMatch(match);
    toast({
      title: "Partido registrado",
      description: `Partido del ${date} guardado correctamente`
    });
    setTeamA([]);
    setTeamB([]);
    setScorer('');
    setAssistant('');
    setNoAssistant(false);
    setIsPenalties(false);
    setStatsInput({});
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <FileText className="h-6 w-6 text-primary" />
        Registrar Partido
      </h2>

      <div className="glass-card p-4">
        <label className="text-sm font-medium text-muted-foreground" htmlFor="match-date">Fecha</label>
        <input
          id="match-date"
          type="date"
          className="mt-1 w-full rounded-md border px-3 py-2 text-base bg-background text-foreground"
          value={date}
          max={new Date().toISOString().split('T')[0]}
          onChange={e => setDate(e.target.value)}
        />
      </div>

      {isAdmin ? (
        // Interfaz simplificada para admin (Gol Gana siempre)
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Team A */}
            <Card className="glass-card border-mint/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-mint" />
                  Equipo A ({teamA.length}/3)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Popover open={openA} onOpenChange={setOpenA}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openA}
                      className="w-full justify-between"
                    >
                      {teamA.length > 0 ? `${teamA.length} jugadores` : "Seleccionar jugadores..."}
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Buscar jugadores..." />
                      <CommandList>
                        <CommandEmpty>No se encontraron jugadores.</CommandEmpty>
                        <CommandGroup>
                          {players.filter(p => !teamB.includes(p.id)).map((player) => (
                            <CommandItem
                              key={player.id}
                              onSelect={() => {
                                togglePlayer(player.id, 'A');
                              }}
                            >
                              <Check
                                className={`mr-2 h-4 w-4 ${
                                  teamA.includes(player.id) ? 'opacity-100' : 'opacity-0'
                                }`}
                              />
                              {player.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                {teamA.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {teamA.map(id => {
                      const player = players.find(p => p.id === id);
                      return (
                        <Badge key={id} variant="secondary" className="text-xs">
                          {player?.name}
                        </Badge>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Team B */}
            <Card className="glass-card border-lavender/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-lavender" />
                  Equipo B ({teamB.length}/3)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Popover open={openB} onOpenChange={setOpenB}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openB}
                      className="w-full justify-between"
                    >
                      {teamB.length > 0 ? `${teamB.length} jugadores` : "Seleccionar jugadores..."}
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Buscar jugadores..." />
                      <CommandList>
                        <CommandEmpty>No se encontraron jugadores.</CommandEmpty>
                        <CommandGroup>
                          {players.filter(p => !teamA.includes(p.id)).map((player) => (
                            <CommandItem
                              key={player.id}
                              onSelect={() => {
                                togglePlayer(player.id, 'B');
                              }}
                            >
                              <Check
                                className={`mr-2 h-4 w-4 ${
                                  teamB.includes(player.id) ? 'opacity-100' : 'opacity-0'
                                }`}
                              />
                              {player.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                {teamB.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {teamB.map(id => {
                      const player = players.find(p => p.id === id);
                      return (
                        <Badge key={id} variant="secondary" className="text-xs">
                          {player?.name}
                        </Badge>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Gol Gana simplificado */}
          {teamA.length === 3 && teamB.length === 3 && !isPenalties && (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Gol Gana
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">¿Quién metió el gol?</label>
                  <Popover open={openGol} onOpenChange={setOpenGol}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openGol}
                        className="w-full justify-between mt-1"
                      >
                        {scorer ? players.find(p => p.id === scorer)?.name : "Selecciona el goleador"}
                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandList>
                          <CommandEmpty>No se encontraron jugadores.</CommandEmpty>
                          <CommandGroup heading="Equipo A">
                            {teamA.map((id) => {
                              const player = players.find(p => p.id === id)!;
                              return (
                                <CommandItem
                                  key={id}
                                  onSelect={() => {
                                    setScorer(id);
                                    setOpenGol(false);
                                  }}
                                >
                                  {player.name}
                                </CommandItem>
                              );
                            })}
                          </CommandGroup>
                          <CommandGroup heading="Equipo B">
                            {teamB.map((id) => {
                              const player = players.find(p => p.id === id)!;
                              return (
                                <CommandItem
                                  key={id}
                                  onSelect={() => {
                                    setScorer(id);
                                    setOpenGol(false);
                                  }}
                                >
                                  {player.name}
                                </CommandItem>
                              );
                            })}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                {scorer && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">¿Quién dio el pase?</label>
                    <Popover open={openAsist} onOpenChange={setOpenAsist}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={openAsist}
                          className="w-full justify-between mt-1"
                          disabled={noAssistant}
                        >
                          {assistant ? players.find(p => p.id === assistant)?.name : "Selecciona el asistente"}
                          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandList>
                            <CommandEmpty>No se encontraron jugadores.</CommandEmpty>
                            <CommandGroup>
                              {(teamA.includes(scorer) ? teamA : teamB).filter(id => id !== scorer).map((id) => {
                                const player = players.find(p => p.id === id)!;
                                return (
                                  <CommandItem
                                    key={id}
                                    onSelect={() => {
                                      setAssistant(id);
                                      setOpenAsist(false);
                                    }}
                                  >
                                    {player.name}
                                  </CommandItem>
                                );
                              })}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <div className="flex items-center gap-2 mt-2">
                      <Checkbox
                        id="no-assistant"
                        checked={noAssistant}
                        onCheckedChange={(checked) => {
                          setNoAssistant(checked as boolean);
                          if (checked) setAssistant('');
                        }}
                      />
                      <label htmlFor="no-assistant" className="text-sm">Sin asistencia (jugada individual)</label>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 pt-2 border-t">
                  <Checkbox
                    id="penalties"
                    checked={isPenalties}
                    onCheckedChange={(checked) => {
                      setIsPenalties(checked as boolean);
                      if (checked) {
                        setScorer('');
                        setAssistant('');
                        setNoAssistant(false);
                      }
                    }}
                  />
                  <label htmlFor="penalties" className="text-sm">Partido definido por penales</label>
                </div>

                {isPenalties && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Ganador</label>
                    <Select value={winner} onValueChange={(value: 'A' | 'B' | 'draw') => setWinner(value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A">Equipo A</SelectItem>
                        <SelectItem value="B">Equipo B</SelectItem>
                        <SelectItem value="draw">Empate</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Penalties Section - Only show when teams are complete and penalties is checked */}
          {teamA.length === 3 && teamB.length === 3 && isPenalties && (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Partido por Penales
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Ganador</label>
                  <Select value={winner} onValueChange={(value: 'A' | 'B' | 'draw') => setWinner(value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">Equipo A</SelectItem>
                      <SelectItem value="B">Equipo B</SelectItem>
                      <SelectItem value="draw">Empate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="text-sm text-muted-foreground">
                  Los partidos por penales no suman estadísticas individuales de gol o asistencia.
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsPenalties(false);
                    setWinner('A');
                  }}
                  className="w-full mt-2 gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Regresar a Gol Gana
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        // Interfaz normal para usuarios no admin
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Team A */}
            <Card className="glass-card border-mint/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-mint" />
                  Equipo A ({teamA.length}/3)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {players.filter(p => !teamB.includes(p.id)).map(p => (
                    <button
                      key={p.id}
                      onClick={() => togglePlayer(p.id, 'A')}
                      className={`player-button text-xs ${
                        teamA.includes(p.id) ? 'ring-2 ring-mint' : 'opacity-60'
                      }`}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
                {teamA.map(id => {
                  const p = players.find(pl => pl.id === id)!;
                  return (
                    <div key={id} className="flex items-center gap-2 mt-2">
                      <span className="text-sm font-medium w-20">{p.name}</span>
                      {!isPenalties && (
                        <>
                          <Input
                            type="number"
                            placeholder="G"
                            min="0"
                            max="1"
                            value={statsInput[id]?.goals || 0}
                            onChange={e => setStatsInput({ ...statsInput, [id]: { ...statsInput[id], goals: parseInt(e.target.value) || 0 } })}
                            className="h-8 text-sm w-16"
                          />
                          <Input
                            type="number"
                            placeholder="A"
                            min="0"
                            max="1"
                            value={statsInput[id]?.assists || 0}
                            onChange={e => setStatsInput({ ...statsInput, [id]: { ...statsInput[id], assists: parseInt(e.target.value) || 0 } })}
                            className="h-8 text-sm w-16"
                            disabled={statsInput[id]?.individualPlay}
                          />
                          <div className="flex items-center gap-1">
                            <input
                              type="checkbox"
                              id={`individual-${id}`}
                              checked={statsInput[id]?.individualPlay || false}
                              onChange={e => setStatsInput({ ...statsInput, [id]: { ...statsInput[id], individualPlay: e.target.checked, assists: e.target.checked ? 0 : statsInput[id]?.assists || 0 } })}
                              className="rounded"
                            />
                            <label htmlFor={`individual-${id}`} className="text-xs">Solo</label>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Team B */}
            <Card className="glass-card border-lavender/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-lavender" />
                  Equipo B ({teamB.length}/3)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {players.filter(p => !teamA.includes(p.id)).map(p => (
                    <button
                      key={p.id}
                      onClick={() => togglePlayer(p.id, 'B')}
                      className={`player-button text-xs ${
                        teamB.includes(p.id) ? 'ring-2 ring-lavender' : 'opacity-60'
                      }`}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
                {teamB.map(id => {
                  const p = players.find(pl => pl.id === id)!;
                  return (
                    <div key={id} className="flex items-center gap-2 mt-2">
                      <span className="text-sm font-medium w-20">{p.name}</span>
                      {!isPenalties && (
                        <>
                          <Input
                            type="number"
                            placeholder="G"
                            min="0"
                            max="1"
                            value={statsInput[id]?.goals || 0}
                            onChange={e => setStatsInput({ ...statsInput, [id]: { ...statsInput[id], goals: parseInt(e.target.value) || 0 } })}
                            className="h-8 text-sm w-16"
                          />
                          <Input
                            type="number"
                            placeholder="A"
                            min="0"
                            max="1"
                            value={statsInput[id]?.assists || 0}
                            onChange={e => setStatsInput({ ...statsInput, [id]: { ...statsInput[id], assists: parseInt(e.target.value) || 0 } })}
                            className="h-8 text-sm w-16"
                            disabled={statsInput[id]?.individualPlay}
                          />
                          <div className="flex items-center gap-1">
                            <input
                              type="checkbox"
                              id={`individual-${id}`}
                              checked={statsInput[id]?.individualPlay || false}
                              onChange={e => setStatsInput({ ...statsInput, [id]: { ...statsInput[id], individualPlay: e.target.checked, assists: e.target.checked ? 0 : statsInput[id]?.assists || 0 } })}
                              className="rounded"
                            />
                            <label htmlFor={`individual-${id}`} className="text-xs">Solo</label>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Gol Gana Section */}
          {!isPenalties && (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Gol Gana
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Goleador</label>
                  <Select value={scorer} onValueChange={setScorer}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Selecciona el goleador" />
                    </SelectTrigger>
                    <SelectContent>
                      {[...teamA, ...teamB].map(id => {
                        const p = players.find(pl => pl.id === id)!;
                        return (
                          <SelectItem key={id} value={id}>
                            {p.name} ({teamA.includes(id) ? 'Equipo A' : 'Equipo B'})
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                {scorer && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Asistente</label>
                    <Select value={assistant} onValueChange={setAssistant} disabled={noAssistant}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Selecciona el asistente" />
                      </SelectTrigger>
                      <SelectContent>
                        {(teamA.includes(scorer) ? teamA : teamB).filter(id => id !== scorer).map(id => {
                          const p = players.find(pl => pl.id === id)!;
                          return (
                            <SelectItem key={id} value={id}>
                              {p.name}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    <div className="flex items-center gap-2 mt-2">
                      <Checkbox
                        id="no-assistant"
                        checked={noAssistant}
                        onCheckedChange={(checked) => {
                          setNoAssistant(checked as boolean);
                          if (checked) setAssistant('');
                        }}
                      />
                      <label htmlFor="no-assistant" className="text-sm">Sin asistencia (jugada individual)</label>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Penalties Section */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Tipo de Partido
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="penalties"
                  checked={isPenalties}
                  onCheckedChange={(checked) => {
                    setIsPenalties(checked as boolean);
                    if (checked) {
                      setScorer('');
                      setAssistant('');
                      setNoAssistant(false);
                    }
                  }}
                />
                <label htmlFor="penalties" className="text-sm">Partido definido por penales</label>
              </div>

              {isPenalties && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Ganador</label>
                  <Select value={winner} onValueChange={(value: 'A' | 'B' | 'draw') => setWinner(value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">Equipo A</SelectItem>
                      <SelectItem value="B">Equipo B</SelectItem>
                      <SelectItem value="draw">Empate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      <Button onClick={handleSubmit} size="lg" className="w-full gap-2">
        <Check className="h-5 w-5" />
        Registrar Partido
      </Button>
    </div>
  );
}
