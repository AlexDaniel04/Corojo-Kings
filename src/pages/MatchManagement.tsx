import { useState, useMemo } from 'react';
import { useLeague } from '@/context/useLeague';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Plus, Edit, Trash2, Trophy, Users, Target } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Match } from '@/types';
import { Calendar } from '@/components/ui/calendar';

export default function MatchManagement() {
  const { players, matches, addMatch, updateMatch, deleteMatch } = useLeague();
  const { toast } = useToast();

  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);

  // Form states for adding/editing matches
  const [matchDate, setMatchDate] = useState('');
  const [teamA, setTeamA] = useState<string[]>([]);
  const [teamB, setTeamB] = useState<string[]>([]);
  const [scoreA, setScoreA] = useState(0);
  const [scoreB, setScoreB] = useState(0);
  const [winner, setWinner] = useState<'A' | 'B' | 'draw'>('draw');
  const [isPenalties, setIsPenalties] = useState(false);
  const [stats, setStats] = useState<{[playerId: string]: {goals: number, assists: number, individualPlay: boolean}}>({});

  // Get matches for selected date
  const dateMatches = useMemo(() => {
    return matches.filter(match => match.date === selectedDate);
  }, [matches, selectedDate]);

  // Get available dates
  const availableDates = useMemo(() => {
    const dates = [...new Set(matches.map(m => m.date))].sort().reverse();
    return dates;
  }, [matches]);

  const datesWithMatches = matches.map(match => new Date(match.date + 'T12:00:00'));

  const resetForm = () => {
    setMatchDate('');
    setTeamA([]);
    setTeamB([]);
    setScoreA(0);
    setScoreB(0);
    setWinner('draw');
    setIsPenalties(false);
    setStats({});
  };

  const handleAddMatch = () => {
    if (teamA.length !== 3 || teamB.length !== 3) {
      toast({ title: 'Error', description: 'Cada equipo debe tener exactamente 3 jugadores', variant: 'destructive' });
      return;
    }

    const newMatch: Match = {
      id: `m_${Date.now()}`,
      date: matchDate,
      teamA,
      teamB,
      scoreA,
      scoreB,
      winner,
      isPenalties,
      stats: {}
    };

    // Initialize stats for all players
    [...teamA, ...teamB].forEach(playerId => {
      newMatch.stats[playerId] = { goals: 0, assists: 0, individualPlay: false };
    });

    addMatch(newMatch);
    resetForm();
    setAddDialogOpen(false);
    toast({ title: 'Partido añadido', description: 'El partido ha sido registrado correctamente' });
  };

  const handleEditMatch = (match: Match) => {
    setEditingMatch(match);
    setMatchDate(match.date);
    setTeamA([...match.teamA]);
    setTeamB([...match.teamB]);
    setScoreA(match.scoreA);
    setScoreB(match.scoreB);
    setWinner(match.winner);
    setIsPenalties(match.isPenalties);
    setStats({...match.stats});
    setEditDialogOpen(true);
  };

  const handleUpdateMatch = () => {
    if (!editingMatch) return;

    if (teamA.length !== 3 || teamB.length !== 3) {
      toast({ title: 'Error', description: 'Cada equipo debe tener exactamente 3 jugadores', variant: 'destructive' });
      return;
    }

    // Calculate scores from stats
    const calculatedScoreA = teamA.reduce((sum, id) => sum + (stats[id]?.goals || 0), 0);
    const calculatedScoreB = teamB.reduce((sum, id) => sum + (stats[id]?.goals || 0), 0);

    // Validate Gol Gana rules: max 1 goal per team per match
    if (calculatedScoreA > 1 || calculatedScoreB > 1) {
      toast({ title: 'Error', description: 'Según las reglas de Gol Gana, cada equipo puede marcar máximo 1 gol por partido', variant: 'destructive' });
      return;
    }

    let calculatedWinner: 'A' | 'B' | 'draw' = 'draw';
    if (calculatedScoreA > calculatedScoreB) calculatedWinner = 'A';
    else if (calculatedScoreB > calculatedScoreA) calculatedWinner = 'B';

    updateMatch(editingMatch.id, {
      date: matchDate,
      teamA,
      teamB,
      scoreA: calculatedScoreA,
      scoreB: calculatedScoreB,
      winner: calculatedWinner,
      isPenalties,
      stats
    });

    resetForm();
    setEditingMatch(null);
    setEditDialogOpen(false);
    toast({ title: 'Partido actualizado', description: 'Los cambios han sido guardados' });
  };

  const handleDeleteMatch = (matchId: string) => {
    if (confirm('¿Estás seguro de eliminar este partido? Esta acción no se puede deshacer.')) {
      deleteMatch(matchId);
      toast({ title: 'Partido eliminado', description: 'El partido ha sido eliminado' });
    }
  };

  const togglePlayer = (playerId: string, team: 'A' | 'B') => {
    if (team === 'A') {
      if (teamA.includes(playerId)) {
        setTeamA(teamA.filter(id => id !== playerId));
      } else if (teamA.length < 3) {
        setTeamA([...teamA, playerId]);
        setTeamB(teamB.filter(id => id !== playerId)); // Remove from other team
      }
    } else {
      if (teamB.includes(playerId)) {
        setTeamB(teamB.filter(id => id !== playerId));
      } else if (teamB.length < 3) {
        setTeamB([...teamB, playerId]);
        setTeamA(teamA.filter(id => id !== playerId)); // Remove from other team
      }
    }
  };

  const getPlayerName = (id: string) => {
    return players.find(p => p.id === id)?.name || 'Jugador desconocido';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <CalendarDays className="h-6 w-6 text-primary" />
          Gestión de Partidos
        </h2>
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Añadir Partido
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Añadir Nuevo Partido</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div>
                <Label htmlFor="match-date">Fecha</Label>
                <Input
                  id="match-date"
                  type="date"
                  value={matchDate}
                  onChange={(e) => setMatchDate(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Team A */}
                <Card className="glass-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-mint"></div>
                      Equipo A ({teamA.length}/3)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {players.map(player => (
                      <button
                        key={player.id}
                        onClick={() => togglePlayer(player.id, 'A')}
                        className={`w-full text-left p-2 rounded-lg transition-colors ${
                          teamA.includes(player.id)
                            ? 'bg-mint/20 border border-mint/50'
                            : 'hover:bg-muted'
                        }`}
                      >
                        {player.name}
                      </button>
                    ))}
                  </CardContent>
                </Card>

                {/* Team B */}
                <Card className="glass-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-lavender"></div>
                      Equipo B ({teamB.length}/3)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {players.map(player => (
                      <button
                        key={player.id}
                        onClick={() => togglePlayer(player.id, 'B')}
                        className={`w-full text-left p-2 rounded-lg transition-colors ${
                          teamB.includes(player.id)
                            ? 'bg-lavender/20 border border-lavender/50'
                            : 'hover:bg-muted'
                        }`}
                      >
                        {player.name}
                      </button>
                    ))}
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="score-a">Goles Equipo A</Label>
                  <Input
                    id="score-a"
                    type="number"
                    min="0"
                    value={scoreA}
                    onChange={(e) => setScoreA(parseInt(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label htmlFor="score-b">Goles Equipo B</Label>
                  <Input
                    id="score-b"
                    type="number"
                    min="0"
                    value={scoreB}
                    onChange={(e) => setScoreB(parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="winner">Ganador</Label>
                <Select value={winner} onValueChange={(value: 'A' | 'B' | 'draw') => setWinner(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">Equipo A</SelectItem>
                    <SelectItem value="B">Equipo B</SelectItem>
                    <SelectItem value="draw">Empate</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="penalties"
                  checked={isPenalties}
                  onChange={(e) => setIsPenalties(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="penalties">Partido definido por penales</Label>
              </div>

              <Button onClick={handleAddMatch} className="w-full">
                Añadir Partido
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Date Selector */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Seleccionar Fecha
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={new Date(selectedDate + 'T12:00:00')}
            onSelect={(selectedDate) => {
              if (selectedDate) {
                setSelectedDate(selectedDate.toISOString().split('T')[0]);
              }
            }}
            modifiers={{
              hasMatches: datesWithMatches,
            }}
            modifiersClassNames={{
              hasMatches: 'has-matches-management',
            }}
            className="rounded-md border"
            disabled={(date) => date > new Date()}
            initialFocus
          />
          <div className="text-sm text-muted-foreground mt-2 text-center">
            {dateMatches.length} partido{dateMatches.length !== 1 ? 's' : ''} encontrado{dateMatches.length !== 1 ? 's' : ''}
          </div>
        </CardContent>
      </Card>

      {/* Matches List */}
      <div className="space-y-4">
        {dateMatches.length === 0 ? (
          <Card className="glass-card">
            <CardContent className="text-center py-8">
              <CalendarDays className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No hay partidos registrados para esta fecha</p>
            </CardContent>
          </Card>
        ) : (
          dateMatches.map((match, index) => (
            <Card key={match.id} className="glass-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5" />
                    Partido {index + 1}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditMatch(match)}
                      className="gap-1"
                    >
                      <Edit className="h-3 w-3" />
                      Editar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteMatch(match.id)}
                      className="gap-1"
                    >
                      <Trash2 className="h-3 w-3" />
                      Eliminar
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Team A */}
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-mint"></div>
                      Equipo A
                    </h4>
                    <div className="space-y-1">
                      {match.teamA.map(playerId => (
                        <div key={playerId} className="text-sm">
                          {getPlayerName(playerId)}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Score */}
                  <div className="text-center">
                    <div className="text-2xl font-bold mb-2">
                      {match.scoreA} - {match.scoreB}
                    </div>
                    <Badge variant={match.winner === 'A' ? 'default' : match.winner === 'B' ? 'secondary' : 'outline'}>
                      {match.winner === 'A' ? 'Ganó A' : match.winner === 'B' ? 'Ganó B' : 'Empate'}
                    </Badge>
                    {match.isPenalties && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Por penales
                      </div>
                    )}
                  </div>

                  {/* Team B */}
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-lavender"></div>
                      Equipo B
                    </h4>
                    <div className="space-y-1">
                      {match.teamB.map(playerId => (
                        <div key={playerId} className="text-sm">
                          {getPlayerName(playerId)}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="glass-card max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Partido</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div>
              <Label htmlFor="edit-match-date">Fecha</Label>
              <Input
                id="edit-match-date"
                type="date"
                value={matchDate}
                onChange={(e) => setMatchDate(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Team A */}
              <Card className="glass-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-mint"></div>
                    Equipo A ({teamA.length}/3)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {players.map(player => (
                    <button
                      key={player.id}
                      onClick={() => togglePlayer(player.id, 'A')}
                      className={`w-full text-left p-2 rounded-lg transition-colors ${
                        teamA.includes(player.id)
                          ? 'bg-mint/20 border border-mint/50'
                          : 'hover:bg-muted'
                      }`}
                    >
                      {player.name}
                    </button>
                  ))}
                </CardContent>
              </Card>

              {/* Team B */}
              <Card className="glass-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-lavender"></div>
                    Equipo B ({teamB.length}/3)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {players.map(player => (
                    <button
                      key={player.id}
                      onClick={() => togglePlayer(player.id, 'B')}
                      className={`w-full text-left p-2 rounded-lg transition-colors ${
                        teamB.includes(player.id)
                          ? 'bg-lavender/20 border border-lavender/50'
                          : 'hover:bg-muted'
                      }`}
                    >
                      {player.name}
                    </button>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Player Stats */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Estadísticas de Jugadores</h3>
              {[...teamA, ...teamB].map(playerId => (
                <Card key={playerId} className="glass-card">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{getPlayerName(playerId)}</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={stats[playerId]?.individualPlay || false}
                          onChange={(e) => setStats(prev => ({...prev, [playerId]: {...(prev[playerId] || {goals:0, assists:0, individualPlay:false}), individualPlay: e.target.checked}}))}
                          className="rounded"
                        />
                        <Label>Jugada Individual</Label>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Goles</Label>
                        <Input
                          type="number"
                          min="0"
                          value={stats[playerId]?.goals || 0}
                          onChange={(e) => setStats(prev => ({...prev, [playerId]: {...(prev[playerId] || {goals:0, assists:0, individualPlay:false}), goals: parseInt(e.target.value) || 0}}))}
                        />
                      </div>
                      <div>
                        <Label>Asistencias</Label>
                        <Input
                          type="number"
                          min="0"
                          value={stats[playerId]?.assists || 0}
                          onChange={(e) => setStats(prev => ({...prev, [playerId]: {...(prev[playerId] || {goals:0, assists:0, individualPlay:false}), assists: parseInt(e.target.value) || 0}}))}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="edit-penalties"
                checked={isPenalties}
                onChange={(e) => setIsPenalties(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="edit-penalties">Partido definido por penales</Label>
            </div>

            <Button onClick={handleUpdateMatch} className="w-full">
              Guardar Cambios
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}